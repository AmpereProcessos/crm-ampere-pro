import { TPurchase } from "@/utils/schemas/purchase.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type InsertPurchaseParams = {
	collection: Collection<TPurchase>;
	info: TPurchase;
};
export async function insertPurchase({ collection, info }: InsertPurchaseParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info });

		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdatePurchaseParams = {
	id: string;
	collection: Collection<TPurchase>;
	changes: Partial<TPurchase>;
	query: Filter<TPurchase>;
};

export async function updatePurchase({ id, collection, changes, query }: UpdatePurchaseParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } });

		return updateResponse;
	} catch (error) {
		throw error;
	}
}
