import { TUserGroup } from "@/utils/schemas/user-groups.schema";
import { Collection, ObjectId } from "mongodb";

type InsertUserGroupParams = {
	collection: Collection<TUserGroup>;
	info: TUserGroup;
};
export async function insertUserGroup({ collection, info }: InsertUserGroupParams) {
	try {
		const insertResponse = await collection.insertOne({ ...info, dataInsercao: new Date().toISOString() });

		return insertResponse;
	} catch (error) {
		throw error;
	}
}

type UpdateUserGroupParams = {
	collection: Collection<TUserGroup>;
	info: Partial<TUserGroup>;
	id: string;
};

export async function updateUserGroup({ id, collection, info }: UpdateUserGroupParams) {
	try {
		const insertResponse = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { ...info } });

		return insertResponse;
	} catch (error) {
		throw error;
	}
}
