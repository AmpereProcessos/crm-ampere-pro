import { TSignaturePlan } from "@/utils/schemas/signature-plans.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type InsertSignaturePlanParams = {
	collection: Collection<TSignaturePlan>;
	info: TSignaturePlan;
	partnerId: string;
};
export async function insertSignaturePlan({ collection, info, partnerId }: InsertSignaturePlanParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() });
		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdateSignaturePlanParams = {
	collection: Collection<TSignaturePlan>;
	id: string;
	changes: Partial<TSignaturePlan>;
	query: Filter<TSignaturePlan>;
};

export async function updateSignaturePlan({ collection, id, changes, query }: UpdateSignaturePlanParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...changes } });

		return updateResponse;
	} catch (error) {
		throw error;
	}
}
