import { TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type GetFunnelReferencesParams = {
	collection: Collection<TFunnelReference>;
	funnelId: string;
	query: Filter<TFunnelReference>;
};
export async function getFunnelReferences({ collection, funnelId, query }: GetFunnelReferencesParams) {
	try {
		const references = await collection.find({ idFunil: funnelId, ...query }).toArray();
		return references;
	} catch (error) {
		throw error;
	}
}

type GetFunnelReferenceByIdParams = {
	id: string;
	collection: Collection<TFunnelReference>;
	query: Filter<TFunnelReference>;
};
export async function getFunnelReferenceById({ id, collection, query }: GetFunnelReferenceByIdParams) {
	try {
		const funnelReference = await collection.findOne({ _id: new ObjectId(id) });
		return funnelReference;
	} catch (error) {
		throw error;
	}
}
