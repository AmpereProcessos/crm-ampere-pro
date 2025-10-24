import { TService } from "@/utils/schemas/service.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type InsertServiceParams = {
	collection: Collection<TService>;
	info: TService;
	partnerId: string;
};
export async function insertService({ collection, info, partnerId }: InsertServiceParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() });

		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdateServiceParams = {
	id: string;
	collection: Collection<TService>;
	changes: Partial<TService>;
	query: Filter<TService>;
};
export async function updateService({ id, collection, changes, query }: UpdateServiceParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } });
		return updateResponse;
	} catch (error) {
		throw error;
	}
}
