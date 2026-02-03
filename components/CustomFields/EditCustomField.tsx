import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { TUpdateCustomFieldInput } from "@/app/api/custom-fields/route";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import type { TUserSession } from "@/lib/auth/session";
import { updateCustomField } from "@/utils/mutations/custom-fields";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useCustomFieldById } from "@/utils/queries/custom-fields";
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

type EditCustomFieldProps = {
	sessionUser: TUserSession["user"];
	customFieldId: string;
	closeModal: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onError?: (error: Error) => void;
		onSettled?: () => void;
	};
};

export function EditCustomField({ customFieldId, closeModal, callbacks }: EditCustomFieldProps) {
	const queryClient = useQueryClient();

	// Fetch the custom field by ID
	const { data: customField, isLoading, isError, isSuccess, error } = useCustomFieldById({ id: customFieldId });

	// Main state for the custom field
	const [infoHolder, setInfoHolder] = useState<TUpdateCustomFieldInput["customField"]>({
		ativo: true,
		identificador: "",
		nome: "",
		tipo: "TEXTO",
		valorPadrao: "",
		entidades: [],
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

	// Populate state when data is fetched
	useEffect(() => {
		if (customField) {
			setInfoHolder({
				ativo: customField.ativo,
				identificador: customField.identificador,
				nome: customField.nome,
				tipo: customField.tipo,
				descricao: customField.descricao,
				valorPadrao: customField.valorPadrao,
				entidades: customField.entidades,
				obrigatorio: customField.obrigatorio,
				heranca: customField.heranca || {},
			});

			// Populate validation states based on the field type
			const validacao = customField.validacao;
			if (validacao) {
				if (validacao.tipo === "texto") {
					setTextValidation({
						minCaracteres: validacao.minCaracteres,
						maxCaracteres: validacao.maxCaracteres,
						padrao: validacao.padrao,
						mascara: validacao.mascara,
					});
				} else if (validacao.tipo === "numero") {
					setNumberValidation({
						minimo: validacao.minimo,
						maximo: validacao.maximo,
						casasDecimais: validacao.casasDecimais,
						permitirNegativo: validacao.permitirNegativo ?? true,
					});
				} else if (validacao.tipo === "selecao") {
					const options: TSelectionOptionWithId[] = (validacao.opcoes || []).map((opt) => ({
						...opt,
						_internalId: crypto.randomUUID(),
					}));
					setSelectionOptions(options);
					setSelectionValidation({
						permitirOutros: validacao.permitirOutros ?? false,
						minSelecoes: validacao.minSelecoes,
						maxSelecoes: validacao.maxSelecoes,
					});
				} else if (validacao.tipo === "data") {
					setDateValidation({
						permitirPassado: validacao.permitirPassado ?? true,
						permitirFuturo: validacao.permitirFuturo ?? true,
					});
				} else if (validacao.tipo === "arquivo") {
					setFileValidation({
						tamanhoMaximoMB: validacao.tamanhoMaximoMB ?? 10,
						multiplosArquivos: validacao.multiplosArquivos ?? false,
						maxArquivos: validacao.maxArquivos ?? 5,
					});
				} else if (validacao.tipo === "referencia") {
					setReferenceValidation({
						entidadeReferenciada: validacao.entidadeReferenciada ?? "CLIENTES",
						multiplosValores: validacao.multiplosValores ?? false,
					});
				}
			}
		}
	}, [customField]);

	const updateInfoHolder = useCallback((newInfo: Partial<TUpdateCustomFieldInput["customField"]>) => {
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

	// Handle the update mutation
	const handleUpdateCustomField = async ({ customField }: TUpdateCustomFieldInput) => {
		const response = await updateCustomField({ id: customFieldId, customField });
		return response;
	};

	const { mutate, isPending } = useMutationWithFeedback({
		mutationKey: ["edit-custom-field", customFieldId],
		mutationFn: handleUpdateCustomField,
		affectedQueryKey: ["custom-field-by-id", customFieldId],
		queryClient: queryClient,
		callbackFn: async () => {
			await queryClient.invalidateQueries({ queryKey: ["custom-fields"] });
			if (callbacks?.onSuccess) callbacks.onSuccess();
			closeModal();
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
		const customField: TUpdateCustomFieldInput["customField"] = {
			...infoHolder,
			validacao: validation,
		};

		mutate({ id: customFieldId, customField });
	};

	return (
		<ResponsiveDialogDrawer
			menuTitle="EDITAR CAMPO PERSONALIZADO"
			menuDescription="Edite os campos abaixo para atualizar o campo personalizado."
			menuActionButtonText="ATUALIZAR CAMPO"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={handleSubmit}
			actionIsLoading={isPending}
			stateIsLoading={isLoading}
			stateError={isError ? (error instanceof Error ? error.message : "Erro ao carregar campo personalizado.") : null}
			dialogVariant="lg"
			drawerVariant="lg"
		>
			{isSuccess && (
				<>
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
				</>
			)}
		</ResponsiveDialogDrawer>
	);
}
