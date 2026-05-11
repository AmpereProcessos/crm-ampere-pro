import { TUtil } from "@/utils/schemas/utils";
import { Collection, ObjectId } from "mongodb";

type InsertUtilParams = {
	collection: Collection<TUtil>;
	info: TUtil;
};

export async function insertUtil({ collection, info }: InsertUtilParams) {
	try {
		const insertResponse = await collection.insertOne(info);
		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdateUtilParams = {
	id: string;
	collection: Collection<TUtil>;
	changes: Partial<TUtil>;
};

export async function updateUtil({ id, collection, changes }: UpdateUtilParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { ...changes } });
		return updateResponse;
	} catch (error) {
		throw error;
	}
}
