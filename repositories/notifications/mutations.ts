import { TNotification } from "@/utils/schemas/notification.schema";
import { Collection, Filter, ObjectId } from "mongodb";

type InsertNotificationParams = {
	collection: Collection<TNotification>;
	info: TNotification;
	partnerId: string;
};
export async function insertNotification({ collection, info, partnerId }: InsertNotificationParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, idParceiro: partnerId });
		return insertResponse;
	} catch (error) {
		throw error;
	}
}
type UpdateNotificationParams = {
	id: string;
	collection: Collection<TNotification>;
	info: Partial<TNotification>;
	query: Filter<TNotification>;
};
export async function updateNotification({ id, collection, info, query }: UpdateNotificationParams) {
	try {
		const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...query }, { $set: { ...info } });
		return updateResponse;
	} catch (error) {
		throw error;
	}
}
