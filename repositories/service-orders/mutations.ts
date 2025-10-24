import { TServiceOrder } from "@/utils/schemas/service-order.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type InsertServiceOrderParams = {
	info: TServiceOrder;
	collection: Collection<TServiceOrder>;
};

export async function insertServiceOrder({ collection, info }: InsertServiceOrderParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() });

		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdateServiceOrderParams = {
	id: string;
	changes: Partial<TServiceOrder>;
	collection: Collection<TServiceOrder>;
	query: Filter<TServiceOrder>;
};

export async function updateServiceOrder({ id, changes, collection, query }: UpdateServiceOrderParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } });

		return updateResponse;
	} catch (error) {
		throw error;
	}
}
