import { TFunnel, TFunnelEntity } from "@/utils/schemas/funnel.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type CreateFunnelParams = {
	collection: Collection<TFunnel>;
	info: TFunnel;
	partnerId?: string | null;
};
export async function insertFunnel({ collection, info, partnerId }: CreateFunnelParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info });
		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdateFunnelParams = {
	id: string;
	collection: Collection<TFunnel>;
	changes: Partial<TFunnel>;
	query: Filter<TFunnel>;
};

export async function updateFunnel({ id, collection, changes, query }: UpdateFunnelParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } });
		return updateResponse;
	} catch (error) {
		throw error;
	}
}
