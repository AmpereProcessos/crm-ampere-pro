import { TPurchase } from "@/utils/schemas/purchase.schema";
import { TRevenue } from "@/utils/schemas/revenues.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type InsertRevenueParams = {
	collection: Collection<TRevenue>;
	info: TRevenue;
};

export async function insertRevenue({ collection, info }: InsertRevenueParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() });
		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdateRevenueParams = {
	id: string;
	collection: Collection<TRevenue>;
	changes: Partial<TRevenue>;
	query: Filter<TRevenue>;
};

export async function updateRevenue({ id, collection, changes, query }: UpdateRevenueParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } });
		return updateResponse;
	} catch (error) {
		throw error;
	}
}
