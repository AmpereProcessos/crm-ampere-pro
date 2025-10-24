import { TProposalUpdateRecord } from "@/utils/schemas/proposal-update-records.schema";
import { Collection, Filter } from "mongodb";

type GetProposalUpdateRecordsParams = {
	proposalId: string;
	collection: Collection<TProposalUpdateRecord>;
	query: Filter<TProposalUpdateRecord>;
};
export async function getProposalUpdateRecordsByProposeId({ proposalId, collection, query }: GetProposalUpdateRecordsParams) {
	try {
		const records = await collection.find({ "proposta.id": proposalId, ...query }, { sort: { _id: -1 } }).toArray();
		return records;
	} catch (error) {
		throw error;
	}
}
