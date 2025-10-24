import { TProduct } from "@/utils/schemas/products.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type InsertProductParams = {
	collection: Collection<TProduct>;
	info: TProduct;
	partnerId: string;
};
export async function insertProduct({ collection, info, partnerId }: InsertProductParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() });

		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdateProductParams = {
	id: string;
	collection: Collection<TProduct>;
	changes: Partial<TProduct>;
	query: Filter<TProduct>;
};
export async function updateProduct({ id, collection, changes, query }: UpdateProductParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } });
		return updateResponse;
	} catch (error) {
		throw error;
	}
}
