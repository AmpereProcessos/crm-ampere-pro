import axios from "axios";
import { TProposalUpdateRecordDTO } from "../schemas/proposal-update-records.schema";
import { useQuery } from "@tanstack/react-query";

async function fetchRecords({ proposalId }: { proposalId: string }) {
	try {
		const { data } = await axios.get(`/api/proposals/update-records?proposalId=${proposalId}`);
		return data.data as TProposalUpdateRecordDTO[];
	} catch (error) {
		throw error;
	}
}

export function useProposalUpdateRecords({ proposalId }: { proposalId: string }) {
	return useQuery({
		queryKey: ["proposal-update-records", proposalId],
		queryFn: async () => await fetchRecords({ proposalId }),
	});
}
