import { createFunnelReference, deleteFunnelReference, updateFunnelReference } from "@/utils/mutations/funnel-references";
import { useFunnels } from "@/utils/queries/funnels";
import { TFunnelReference, TFunnelReferenceDTO } from "@/utils/schemas/funnel-reference.schema";
import { TFunnelDTO } from "@/utils/schemas/funnel.schema";
import type { TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from "@/utils/schemas/opportunity.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";
import OpportunityFunnelReference from "../Cards/OpportunityFunnelReference";
import SelectInput from "../Inputs/SelectInput";
import ResponsiveDialogDrawerSection from "../utils/ResponsiveDialogDrawerSection";
import { Funnel, Plus, X } from "lucide-react";
import { Button } from "../ui/button";
import { getErrorMessage } from "@/lib/methods/errors";
type GetFunnelInfoParams = {
	funnelId: TFunnelReferenceDTO["idFunil"];
	funnels: TFunnelDTO[] | undefined;
};
function getFunnelInfo({ funnelId, funnels }: GetFunnelInfoParams) {
	if (!funnels) return { funnelLabel: null, funnelStageLabel: null, stageOptions: [] };

	const funnel = funnels.find((f) => f._id == funnelId);
	if (!funnel) return { funnelLabel: null, funnelStageLabel: null, stageOptions: [] };
	const funnelLabel = funnel.nome;

	const stageOptions = funnel.etapas.map((e) => ({ id: e.id, value: e.id.toString(), label: e.nome }));

	return { funnelLabel, stageOptions };
}

type GetNewFunnelReferenceInfoParams = {
	funnelReferences: TFunnelReferenceDTO[];
	funnels: TFunnelDTO[] | undefined;
};
function getNewFunnelReferenceOptions({ funnelReferences, funnels }: GetNewFunnelReferenceInfoParams) {
	if (!funnels) return null;
	// Filtering funnels to those which are not yet present in the opportunity s funnel references
	const options = funnels.filter((f) => !funnelReferences.map((fr) => fr.idFunil).includes(f._id));
	if (options.length < 1) return null;
	return options;
}

type OpportunityFunnelReferencesBlockProps = {
	opportunityId: string;
	opportunityQueryKey: any;
	opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
	setOpportunity: React.Dispatch<React.SetStateAction<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>>;
	callbacks: {
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: () => void;
		onError?: (error: Error) => void;
	};
};
function OpportunityFunnelReferencesBlock({ opportunityId, opportunityQueryKey, opportunity, setOpportunity, callbacks }: OpportunityFunnelReferencesBlockProps) {
	const queryClient = useQueryClient();
	const { data: funnels } = useFunnels();

	const newFunnelReferencesOptions = getNewFunnelReferenceOptions({ funnelReferences: opportunity.referenciasFunil, funnels });
	const [newFunnelReferenceMenuIsOpen, setNewFunnelReferenceMenuIsOpen] = useState<boolean>(false);
	const [newFunnelReference, setNewFunnelReference] = useState<TFunnelReference>({
		idParceiro: opportunity.idParceiro || "",
		idOportunidade: opportunity._id,
		idFunil: "",
		idEstagioFunil: "",
		estagios: {},
		dataInsercao: new Date().toISOString(),
	});
	async function addNewFunnelReference(info: TFunnelReference) {
		try {
			const response = await createFunnelReference({ info });
			return response;
		} catch (error) {
			throw error;
		}
	}
	const { mutate: handleAddNewOpportunityFunnelReference, isPending: addNewFunnelReferencePending } = useMutation({
		mutationKey: ["add-new-funnel-reference"],
		mutationFn: addNewFunnelReference,
		onMutate: async (variables) => {
			const previousOpportunity = queryClient.getQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey);
			if (!previousOpportunity) return { previousOpportunity };

			const newFunnelReferenceDTO: TFunnelReferenceDTO = {
				_id: `temp-${Date.now()}`,
				idParceiro: variables.idParceiro,
				idOportunidade: variables.idOportunidade,
				idFunil: variables.idFunil,
				idEstagioFunil: variables.idEstagioFunil,
				estagios: {
					[variables.idEstagioFunil]: {
						entrada: new Date().toISOString(),
						saida: null,
					},
				},
				dataInsercao: new Date().toISOString(),
			};

			queryClient.setQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey, (old) => {
				if (!old) return old;
				return {
					...old,
					referenciasFunil: old?.referenciasFunil ? [...old.referenciasFunil, newFunnelReferenceDTO] : [newFunnelReferenceDTO],
				};
			});
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			setNewFunnelReferenceMenuIsOpen(false);
			setNewFunnelReference({
				idParceiro: opportunity.idParceiro || "",
				idOportunidade: opportunity._id,
				idFunil: "",
				idEstagioFunil: "",
				estagios: {},
				dataInsercao: new Date().toISOString(),
			});
			return toast.success(typeof data === "string" ? data : "Referência de funil criada com sucesso !");
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError: async (error, variables, context) => {
			await queryClient.setQueryData<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>(opportunityQueryKey, context?.previousOpportunity);
			if (callbacks?.onError) callbacks.onError(error);
			return toast.error(getErrorMessage(error));
		},
	});

	return (
		<ResponsiveDialogDrawerSection sectionTitleText="FUNIS" sectionTitleIcon={<Funnel className="w-4 h-4 min-w-4 min-h-4" />}>
			{opportunity.referenciasFunil.map((funnelReference, index) => (
				<OpportunityFunnelReference
					key={funnelReference._id}
					reference={funnelReference}
					referenceIndex={index}
					funnels={funnels}
					opportunityId={opportunityId}
					opportunityQueryKey={opportunityQueryKey}
					opportunity={opportunity}
					setOpportunity={setOpportunity}
					callbacks={callbacks}
				/>
			))}
			{!!newFunnelReferencesOptions ? (
				<>
					<div className="flex w-full items-center justify-end">
						<Button size={"xs"} variant="ghost" onClick={() => setNewFunnelReferenceMenuIsOpen((prev) => !prev)} className="flex items-center gap-1">
							{newFunnelReferenceMenuIsOpen ? <X className="h-4 w-4 min-h-4 min-w-4" /> : <Plus className="h-4 w-4 min-h-4 min-w-4" />}
							<p className="text-xs font-medium">{newFunnelReferenceMenuIsOpen ? "FECHAR" : "ADICIONAR FUNIL"}</p>
						</Button>
					</div>
					{newFunnelReferenceMenuIsOpen ? (
						<div className="flex w-full flex-col gap-2">
							<div className="flex w-full gap-2">
								<div className="w-2/3">
									<SelectInput
										label="FUNIL"
										value={newFunnelReference.idFunil}
										options={newFunnelReferencesOptions?.map((funnel) => ({
											id: funnel._id,
											label: funnel.nome,
											value: funnel._id,
										}))}
										handleChange={(value) => {
											const selectedFunnel = newFunnelReferencesOptions.find((f) => f._id == value);
											const firstStage = selectedFunnel?.etapas[0].id || "";
											setNewFunnelReference((prev) => ({ ...prev, idFunil: value, idEstagioFunil: firstStage.toString() }));
										}}
										resetOptionLabel="NÃO DEFINIDO"
										onReset={() => setNewFunnelReference((prev) => ({ ...prev, idFunil: "", idEstagioFunil: "" }))}
										width="100%"
									/>
								</div>
								<div className="w-1/3">
									<SelectInput
										label="ETAPA"
										value={newFunnelReference.idEstagioFunil}
										options={getFunnelInfo({ funnelId: newFunnelReference.idFunil, funnels: funnels }).stageOptions}
										handleChange={(value) => setNewFunnelReference((prev) => ({ ...prev, idEstagioFunil: value.toString() }))}
										resetOptionLabel="NÃO DEFINIDO"
										onReset={() => setNewFunnelReference((prev) => ({ ...prev, idEstagioFunil: "" }))}
										width="100%"
									/>
								</div>
							</div>
							<div className="flex w-full items-center justify-end">
								<Button
									size={"xs"}
									variant="ghost"
									disabled={addNewFunnelReferencePending || !newFunnelReference.idFunil || !newFunnelReference.idEstagioFunil}
									onClick={() => {
										if (!newFunnelReference.idFunil || !newFunnelReference.idEstagioFunil)
											return toast.error("Preencha todos os campos para adicionar um funil.");
										handleAddNewOpportunityFunnelReference(newFunnelReference);
									}}
									className="flex items-center gap-1"
								>
									<Plus className="h-4 w-4 min-h-4 min-w-4" />
									<p className="text-xs font-medium">ADICIONAR</p>
								</Button>
							</div>
						</div>
					) : null}
				</>
			) : null}
		</ResponsiveDialogDrawerSection>
	);
}

export default OpportunityFunnelReferencesBlock;
