import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import type { TCreateCustomFieldInput } from "@/app/api/custom-fields/route";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { createCustomField } from "@/utils/mutations/custom-fields";
import type { TCustomFieldHeritage, TSelectOption } from "@/utils/schemas/custom-fields.schema";

// Block components
import BasicInfoBlock from "./Blocks/BasicInfoBlock";
import DefaultValueBlock from "./Blocks/DefaultValueBlock";
import EntityConfigBlock from "./Blocks/EntityConfigBlock";
import HeritageBlock from "./Blocks/HeritageBlock";
import {
	DateValidationBlock,
	FileValidationBlock,
	isDateType,
	isFileType,
	isNumericType,
	isReferenceType,
	isSelectionType,
	isTextType,
	NumberValidationBlock,
	ReferenceConfigBlock,
	SelectionOptionsBlock,
	type TDateValidation,
	TextValidationBlock,
	type TFileValidation,
	type TNumberValidation,
	type TReferenceValidation,
	type TSelectionOptionWithId,
	type TSelectionValidation,
	type TTextValidation,
} from "./Blocks/ValidationBlocks";

type TEntity = "CLIENTES" | "OPORTUNIDADES" | "PROPOSTAS";

type NewCustomFieldProps = {
	sessionUser: TUserSession["user"];
	closeModal: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onError?: (error: Error) => void;
		onSettled?: () => void;
	};
};

export function NewCustomField({ closeModal, callbacks }: NewCustomFieldProps) {
	const queryClient = useQueryClient();

	// Main state for the custom field
	const [infoHolder, setInfoHolder] = useState<TCreateCustomFieldInput["customField"]>({
		ativo: true,
		identificador: "",
		nome: "",
		tipo: "TEXTO",
		valorPadrao: "",
		entidades: [],
		tiposProjetos: [],
		obrigatorio: {
			CLIENTES: false,
			OPORTUNIDADES: false,
			PROPOSTAS: false,
		},
		heranca: {},
	});

	// Selection options state (for SELEÇÃO_ÚNICA and SELEÇÃO_MÚLTIPLA)
	const [selectionOptions, setSelectionOptions] = useState<TSelectionOptionWithId[]>([]);

	// Text validation state
	const [textValidation, setTextValidation] = useState<TTextValidation>({
		minCaracteres: undefined,
		maxCaracteres: undefined,
		padrao: undefined,
		mascara: undefined,
	});

	// Number validation state
	const [numberValidation, setNumberValidation] = useState<TNumberValidation>({
		minimo: undefined,
		maximo: undefined,
		casasDecimais: undefined,
		permitirNegativo: true,
	});

	// Date validation state
	const [dateValidation, setDateValidation] = useState<TDateValidation>({
		permitirPassado: true,
		permitirFuturo: true,
	});

	// File validation state
	const [fileValidation, setFileValidation] = useState<TFileValidation>({
		tamanhoMaximoMB: 10,
		multiplosArquivos: false,
		maxArquivos: 5,
	});

	// Selection validation state
	const [selectionValidation, setSelectionValidation] = useState<TSelectionValidation>({
		permitirOutros: false,
		minSelecoes: undefined,
		maxSelecoes: undefined,
	});

	// Reference validation state
	const [referenceValidation, setReferenceValidation] = useState<TReferenceValidation>({
		entidadeReferenciada: "CLIENTES",
		multiplosValores: false,
	});

	const updateInfoHolder = useCallback((newInfo: Partial<TCreateCustomFieldInput["customField"]>) => {
		setInfoHolder((prev) => ({ ...prev, ...newInfo }));
	}, []);

	// Build the validation object based on the current type
	const buildValidation = useCallback(() => {
		const tipo = infoHolder.tipo;

		if (isTextType(tipo)) {
			const hasValidation =
				textValidation.minCaracteres !== undefined ||
				textValidation.maxCaracteres !== undefined ||
				textValidation.padrao !== undefined ||
				textValidation.mascara !== undefined;
			if (!hasValidation) return undefined;
			return {
				tipo: "texto" as const,
				...textValidation,
			};
		}

		if (isNumericType(tipo)) {
			return {
				tipo: "numero" as const,
				...numberValidation,
			};
		}

		if (isSelectionType(tipo)) {
			if (selectionOptions.length === 0) return undefined;
			return {
				tipo: "selecao" as const,
				opcoes: selectionOptions.map(({ _internalId, ...rest }) => rest),
				...selectionValidation,
			};
		}

		if (isDateType(tipo)) {
			return {
				tipo: "data" as const,
				...dateValidation,
			};
		}

		if (isFileType(tipo)) {
			return {
				tipo: "arquivo" as const,
				...fileValidation,
			};
		}

		if (isReferenceType(tipo)) {
			return {
				tipo: "referencia" as const,
				...referenceValidation,
			};
		}

		return undefined;
	}, [infoHolder.tipo, textValidation, numberValidation, selectionOptions, selectionValidation, dateValidation, fileValidation, referenceValidation]);

	// Add a new selection option
	const addSelectionOption = () => {
		const newOption: TSelectionOptionWithId = {
			_internalId: crypto.randomUUID(),
			valor: "",
			rotulo: "",
			ordem: selectionOptions.length,
			ativo: true,
		};
		setSelectionOptions((prev) => [...prev, newOption]);
	};

	// Update a selection option
	const updateSelectionOption = (id: string, updates: Partial<TSelectOption>) => {
		setSelectionOptions((prev) => prev.map((opt) => (opt._internalId === id ? { ...opt, ...updates } : opt)));
	};

	// Remove a selection option
	const removeSelectionOption = (id: string) => {
		setSelectionOptions((prev) => prev.filter((opt) => opt._internalId !== id));
	};

	// Update heritage configuration for an entity
	const updateHeritage = (entity: TEntity, updates: Partial<TCustomFieldHeritage>) => {
		setInfoHolder((prev) => ({
			...prev,
			heranca: {
				...prev.heranca,
				[entity]: {
					entidadeOrigem: prev.heranca?.[entity]?.entidadeOrigem || "CLIENTES",
					comportamento: prev.heranca?.[entity]?.comportamento || "copiar",
					permitirSobrescrita: prev.heranca?.[entity]?.permitirSobrescrita ?? true,
					...prev.heranca?.[entity],
					...updates,
				},
			},
		}));
	};

	// Remove heritage configuration for an entity
	const removeHeritage = (entity: TEntity) => {
		setInfoHolder((prev) => {
			const newHeranca = { ...prev.heranca };
			delete newHeranca[entity];
			return { ...prev, heranca: newHeranca };
		});
	};

	const { mutate: handleCreateCustomField, isPending } = useMutation({
		mutationFn: createCustomField,
		mutationKey: ["create-custom-field"],
		onMutate: async () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({ queryKey: ["custom-fields"] });
			if (callbacks?.onSuccess) callbacks.onSuccess();
			closeModal();
			return toast.success(data.message);
		},
		onError: async (error) => {
			if (callbacks?.onError) callbacks.onError(error);
			return toast.error(getErrorMessage(error));
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
	});

	const handleSubmit = () => {
		// Validate required fields
		if (!infoHolder.identificador.trim()) {
			return toast.error("O identificador é obrigatório.");
		}
		if (!infoHolder.nome.trim()) {
			return toast.error("O nome é obrigatório.");
		}
		if (infoHolder.entidades.length === 0) {
			return toast.error("Selecione ao menos uma entidade.");
		}

		// Validate identifier format
		const identifierRegex = /^[a-z][a-z0-9_]*$/;
		if (!identifierRegex.test(infoHolder.identificador)) {
			return toast.error("O identificador deve começar com letra minúscula e conter apenas letras minúsculas, números e underscore.");
		}

		// Validate selection options if needed
		if (isSelectionType(infoHolder.tipo) && selectionOptions.length === 0) {
			return toast.error("Adicione ao menos uma opção de seleção.");
		}

		// Build the complete custom field object
		const validation = buildValidation();
		const customField: TCreateCustomFieldInput["customField"] = {
			...infoHolder,
			validacao: validation,
		};

		handleCreateCustomField({ customField });
	};

	return (
		<ResponsiveDialogDrawer
			menuTitle="NOVO CAMPO PERSONALIZADO"
			menuDescription="Preencha os campos abaixo para criar um novo campo personalizado."
			menuActionButtonText="CRIAR CAMPO"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={handleSubmit}
			actionIsLoading={isPending}
			stateIsLoading={false}
			dialogVariant="lg"
			drawerVariant="lg"
		>
			{/* Basic Information Section */}
			<BasicInfoBlock infoHolder={infoHolder} updateInfoHolder={updateInfoHolder} />

			{/* Entity Configuration Section */}
			<EntityConfigBlock infoHolder={infoHolder} updateInfoHolder={updateInfoHolder} />

			{/* Conditional Validation Sections */}
			{isTextType(infoHolder.tipo) && <TextValidationBlock validation={textValidation} setValidation={setTextValidation} />}

			{isNumericType(infoHolder.tipo) && <NumberValidationBlock validation={numberValidation} setValidation={setNumberValidation} />}

			{isSelectionType(infoHolder.tipo) && (
				<SelectionOptionsBlock
					tipo={infoHolder.tipo}
					options={selectionOptions}
					addOption={addSelectionOption}
					updateOption={updateSelectionOption}
					removeOption={removeSelectionOption}
					validation={selectionValidation}
					setValidation={setSelectionValidation}
				/>
			)}

			{isDateType(infoHolder.tipo) && <DateValidationBlock validation={dateValidation} setValidation={setDateValidation} />}

			{isFileType(infoHolder.tipo) && <FileValidationBlock validation={fileValidation} setValidation={setFileValidation} />}

			{isReferenceType(infoHolder.tipo) && <ReferenceConfigBlock validation={referenceValidation} setValidation={setReferenceValidation} />}

			{/* Default Value Section */}
			<DefaultValueBlock infoHolder={infoHolder} updateInfoHolder={updateInfoHolder} selectionOptions={selectionOptions} />

			{/* Heritage Configuration Section */}
			<HeritageBlock infoHolder={infoHolder} updateHeritage={updateHeritage} removeHeritage={removeHeritage} />
		</ResponsiveDialogDrawer>
	);
}
