import { TProcessFlowReference } from "@/utils/schemas/process-flow-reference.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type GetProcessFlowReferencesParams = {
	collection: Collection<TProcessFlowReference>;
	query: Filter<TProcessFlowReference>;
};
export async function getProcessFlowReferences({ collection, query }: GetProcessFlowReferencesParams) {
	try {
		const references = await collection.find({ ...query }).toArray();
		return references;
	} catch (error) {
		throw error;
	}
}

type GetProcessFlowReferenceByIdParams = {
	collection: Collection<TProcessFlowReference>;
	query: Filter<TProcessFlowReference>;
	id: string;
};

export async function getProcessFlowReferenceById({ collection, query, id }: GetProcessFlowReferenceByIdParams) {
	try {
		const reference = await collection.findOne({ _id: new ObjectId(id), ...query });
		return reference;
	} catch (error) {
		throw error;
	}
}
