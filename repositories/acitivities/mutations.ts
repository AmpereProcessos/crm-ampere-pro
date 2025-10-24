import { TActivity } from "@/utils/schemas/activities.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type InsertActivityParams = {
	collection: Collection<TActivity>;
	info: TActivity;
};
export async function insertActivity({ collection, info }: InsertActivityParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() });
		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdateActivityParams = {
	activityId: string;
	collection: Collection<TActivity>;
	changes: Partial<TActivity>;
	query: Filter<TActivity>;
};
export async function updateActivity({ activityId, collection, changes, query }: UpdateActivityParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(activityId), ...query }, { $set: { ...changes } });

		return updateResponse;
	} catch (error) {
		throw error;
	}
}
