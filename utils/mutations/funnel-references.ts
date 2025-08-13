import axios from "axios";
import type { TFunnelReference } from "../schemas/funnel-reference.schema";
import { type QueryClient, type QueryKey, useMutation } from "@tanstack/react-query";
import type { TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels } from "../schemas/opportunity.schema";

type HandleFunnelReferenceCreation = {
	info: TFunnelReference;
};

export async function createFunnelReference({ info }: HandleFunnelReferenceCreation) {
	try {
		const { data } = await axios.post("/api/opportunities/funnel-references", info);
		if (data.data?.insertedId) return data.data.insertedId as string;
		return "Referência de funil criada com sucesso !";
	} catch (error) {
		console.log("Error running createFunnelReference", error);
		throw error;
	}
}
type UseUpdateFunnelReferenceParams = {
	funnelReferenceId: string;
	newStageId: string;
	queryClient: QueryClient;
	affectedQueryKey: QueryKey;
};
export async function updateFunnelReference({ funnelReferenceId, newStageId }: Omit<UseUpdateFunnelReferenceParams, "queryClient" | "affectedQueryKey">) {
	try {
		const { data } = await axios.put(`/api/opportunities/funnel-references?id=${funnelReferenceId}`, { idEstagioFunil: newStageId });
		if (typeof data.data !== "string") return "Estágio atualizado com sucesso !";
		return data.data;
	} catch (error) {
		console.log("Error running updateFunnelReference", error);
		throw error;
	}
}
export function useFunnelReferenceUpdate({ queryClient, affectedQueryKey }: Omit<UseUpdateFunnelReferenceParams, "funnelReferenceId" | "newStageId">) {
	return useMutation({
		mutationKey: ["upate-funnel-reference"],
		mutationFn: async ({ funnelReferenceId, newStageId }: Omit<UseUpdateFunnelReferenceParams, "queryClient" | "affectedQueryKey">) => {
			return await updateFunnelReference({ funnelReferenceId, newStageId });
		},
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey: affectedQueryKey });
			const querySnapshot: TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels[] | undefined = queryClient.getQueryData(
				affectedQueryKey,
			) as TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels[];
			if (!querySnapshot) return { querySnapshot };

			// Updating opportunity optimistically
			queryClient.setQueryData(affectedQueryKey, (prevData: TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels[]) =>
				prevData.map((op) => {
					if (op.funil.id === variables.funnelReferenceId) {
						return {
							...op,
							funil: {
								...op.funil,
								idEstagio: variables.newStageId,
							},
						};
					}
					return op;
				}),
			);
			// Returning snapshot as context for onSuccess or onError
			return { querySnapshot };
		},
		onError: async (err, variables, context) => {
			await queryClient.setQueryData(affectedQueryKey, context?.querySnapshot);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: affectedQueryKey });
		},
	});
}

export async function deleteFunnelReference({ id }: { id: string }) {
	try {
		const { data } = await axios.delete(`/api/opportunities/funnel-references?id=${id}`);
		if (typeof data.message !== "string") return "Referência de funil removida com sucesso !";
		return data.message as string;
	} catch (error) {
		console.log("Error running deleteFunnelReference", error);
		throw error;
	}
}
