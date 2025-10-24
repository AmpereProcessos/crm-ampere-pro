import { TProcessFlowReference } from "@/utils/schemas/process-flow-reference.schema";
import { Collection } from "mongodb";

type InsertManyProcessFlowReferencesParams = {
	collection: Collection<TProcessFlowReference>;
	flowReferences: TProcessFlowReference[];
};
export async function insertManyProcessFlowReferences({ collection, flowReferences }: InsertManyProcessFlowReferencesParams) {
	try {
		const insertResponse = await collection.insertMany(flowReferences);
		return insertResponse;
	} catch (error) {
		throw error;
	}
}
