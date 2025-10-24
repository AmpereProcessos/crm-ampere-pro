import { TStockMaterial } from "@/utils/schemas/stock-materials.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type InsertStockMaterialParams = {
	collection: Collection<TStockMaterial>;
	info: TStockMaterial;
};
export async function insertStockMaterial({ collection, info }: InsertStockMaterialParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() });

		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdateStockMaterialParams = {
	id: string;
	collection: Collection<TStockMaterial>;
	changes: Partial<TStockMaterial>;
	query: Filter<TStockMaterial>;
};

export async function updateStockMaterial({ id, collection, changes, query }: UpdateStockMaterialParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } });

		return updateResponse;
	} catch (error) {
		throw error;
	}
}
