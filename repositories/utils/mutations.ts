import { TUtil } from "@/utils/schemas/utils";
import { Collection } from "mongodb";

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
