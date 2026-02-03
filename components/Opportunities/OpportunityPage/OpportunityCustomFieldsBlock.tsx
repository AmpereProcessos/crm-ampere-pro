import { useQueryClient } from "@tanstack/react-query";
import { Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LoadingButton } from "@/components/Buttons/loading-button";
import { CustomFieldInput } from "@/components/CustomFields/CustomFieldInput";
import { Button } from "@/components/ui/button";
import type { TUserSession } from "@/lib/auth/session";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { updateOpportunity } from "@/utils/mutations/opportunities";
import { useCustomFields, useCustomFieldsByEntity } from "@/utils/queries/custom-fields";
import type { TCustomFieldReference } from "@/utils/schemas/custom-fields.schema";
import type { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import ErrorComponent from "../../utils/ErrorComponent";
import LoadingComponent from "../../utils/LoadingComponent";

type OpportunityCustomFieldsBlockProps = {
	session: TUserSession;
	opportunity: TOpportunityDTOWithClient;
	opportunityQueryKey: any[];
	callbacks?: {
		onMutate: () => void;
		onSettled: () => void;
	};
};

function OpportunityCustomFieldsBlock({ opportunity, opportunityQueryKey, callbacks }: OpportunityCustomFieldsBlockProps) {
	const queryClient = useQueryClient();

	// Fetch custom fields for opportunities
	const {
		data: customFields,
		isLoading,
		isError,
		isSuccess,
	} = useCustomFields({
		initialFilters: {
			entities: ["OPORTUNIDADES"],
		},
	});

	// Local state for custom field values
	const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});
	const [hasChanges, setHasChanges] = useState(false);

	// Initialize values from opportunity data
	useEffect(() => {
		if (customFields && opportunity?.camposPersonalizados) {
			const initialValues: Record<string, unknown> = {};
			for (const field of customFields) {
				const fieldId = field._id;
				const existingValue = opportunity.camposPersonalizados?.[fieldId]?.valor;
				initialValues[fieldId] = existingValue ?? field.valorPadrao ?? null;
			}
			setCustomFieldValues(initialValues);
			setHasChanges(false);
		}
	}, [customFields, opportunity?.camposPersonalizados]);

	// Handle value change
	const handleValueChange = (fieldId: string, value: unknown) => {
		setCustomFieldValues((prev) => ({ ...prev, [fieldId]: value }));
		setHasChanges(true);
	};

	// Update mutation
	const { mutate: handleUpdateOpportunity, isPending } = useMutationWithFeedback<string, void>({
		queryClient,
		mutationKey: ["update-opportunity-custom-fields", opportunity._id],
		mutationFn: async () => {
			if (!customFields) throw new Error("Campos personalizados não encontrados.");

			// Build the custom fields reference object
			const camposPersonalizados: TCustomFieldReference = {};

			for (const field of customFields) {
				const fieldId = field._id;
				const newValue = customFieldValues[fieldId];
				const existingRef = opportunity.camposPersonalizados?.[fieldId];

				camposPersonalizados[fieldId] = {
					campo: {
						id: fieldId,
						identificador: field.identificador,
						nome: field.nome,
					},
					valor: newValue,
					herdado: existingRef?.herdado ?? false,
					modificado: true,
					dataAtualizacao: new Date().toISOString(),
				};
			}

			return updateOpportunity({
				id: opportunity._id,
				changes: {
					camposPersonalizados,
				},
			});
		},
		affectedQueryKey: opportunityQueryKey,
		callbackFn: () => {
			setHasChanges(false);
			if (callbacks?.onSettled) callbacks.onSettled();
		},
	});

	const handleSubmit = () => {
		// Validate required fields
		if (customFields) {
			for (const field of customFields) {
				const isRequired = field.obrigatorio?.OPORTUNIDADES;
				const value = customFieldValues[field._id];

				if (isRequired && (value === null || value === undefined || value === "")) {
					return toast.error(`O campo "${field.nome}" é obrigatório.`);
				}
			}
		}

		if (callbacks?.onMutate) callbacks.onMutate();
		handleUpdateOpportunity(undefined);
	};

	// Don't render if there are no custom fields
	if (isSuccess && (!customFields || customFields.length === 0)) {
		return null;
	}

	return (
		<div className="bg-card border-primary/20 flex w-full flex-col gap-2 rounded-xl border px-3 py-4 shadow-xs">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Settings className="h-4 w-4 min-h-4 min-w-4 text-primary/70" />
					<h1 className="text-xs font-bold tracking-tight uppercase">CAMPOS PERSONALIZADOS</h1>
				</div>
				{hasChanges && (
					<Button disabled={isPending} size="xs" className="flex items-center gap-1" onClick={handleSubmit}>
						<Save className="h-4 w-4 min-h-4 min-w-4" />
						<span className="text-xs font-medium">SALVAR</span>
					</Button>
				)}
			</div>

			<div className="flex flex-col w-full gap-3 py-2">
				{isLoading && <LoadingComponent />}
				{isError && <ErrorComponent msg="Erro ao carregar campos personalizados." />}
				{isSuccess && customFields && customFields.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{customFields.map((field) => (
							<div key={field._id} className="flex flex-col">
								<CustomFieldInput
									customField={field}
									value={customFieldValues[field._id]}
									onChange={(value) => handleValueChange(field._id, value)}
									editable={true}
									showLabel={true}
								/>
								{field.obrigatorio?.OPORTUNIDADES && <span className="text-[0.65rem] text-orange-600 font-medium mt-1">* Obrigatório</span>}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default OpportunityCustomFieldsBlock;
