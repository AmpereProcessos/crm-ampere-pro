import { type QueryClient, type QueryKey, useMutation } from "@tanstack/react-query";
import axios from "axios";
import type {
	TCreateFunnelReferenceInput,
	TCreateFunnelReferenceOutput,
	TDeleteFunnelReferenceOutput,
	TEditFunnelReferenceInput,
	TEditFunnelReferenceOutput,
} from "@/app/api/opportunities/funnel-references/route";
import type { TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels } from "../schemas/opportunity.schema";

export async function createFunnelReference(input: TCreateFunnelReferenceInput) {
	const { data } = await axios.post<TCreateFunnelReferenceOutput>("/api/opportunities/funnel-references", input);
	return data.message;
}
type UseUpdateFunnelReferenceParams = {
	funnelReferenceId: string;
	newStageId: string;
	queryClient: QueryClient;
	affectedQueryKey: QueryKey;
};
export async function updateFunnelReference({ funnelReferenceId, newStageId }: Omit<UseUpdateFunnelReferenceParams, "queryClient" | "affectedQueryKey">) {
	const payload: TEditFunnelReferenceInput = {
		id: funnelReferenceId,
		changes: {
			idEstagioFunil: newStageId,
		},
	};
	const { data } = await axios.put<TEditFunnelReferenceOutput>(`/api/opportunities/funnel-references?id=${funnelReferenceId}`, payload);
	return data.message;
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
	const { data } = await axios.delete<TDeleteFunnelReferenceOutput>(`/api/opportunities/funnel-references?id=${id}`);
	return data.message;
}
