import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { TProposalDTO, TProposalDTOWithOpportunity, TProposalDTOWithOpportunityAndClient } from "../schemas/proposal.schema";

async function fetchOpportunityProposals(opportunityId?: string) {
	try {
		if (!opportunityId) return [];
		const { data } = await axios.get(`/api/proposals?opportunityId=${opportunityId}`);

		return data.data as TProposalDTO[];
	} catch (error) {
		throw error;
	}
}

export function useOpportunityProposals({ opportunityId }: { opportunityId?: string }) {
	return useQuery({
		queryKey: ["opportunity-proposals", opportunityId],
		queryFn: async () => await fetchOpportunityProposals(opportunityId),
		refetchOnWindowFocus: true,
	});
}

export async function fetchProposalById(id?: string) {
	try {
		const { data } = await axios.get(`/api/proposals?id=${id}`);
		return data.data as TProposalDTOWithOpportunityAndClient;
	} catch (error) {
		throw error;
	}
}
export function useProposalById({ id }: { id?: string }) {
	return useQuery({
		queryKey: ["proposal-by-id", id],
		queryFn: async () => await fetchProposalById(id),
		refetchOnWindowFocus: true,
	});
}
