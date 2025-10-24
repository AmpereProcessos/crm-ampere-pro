import { TUserGroup, TUserGroupWithUsers } from "@/utils/schemas/user-groups.schema";
import { Collection, ObjectId, WithId } from "mongodb";

type GetUserGroupsParams = {
	collection: Collection<TUserGroup>;
};

export async function getUserGroups({ collection }: GetUserGroupsParams) {
	try {
		const addFields = { idAsString: { $toString: "$_id" } };
		const lookup = { from: "users", localField: "idAsString", foreignField: "idGrupo", as: "usuarios" };
		const projection = { "usuarios.senha": 0, "usuarios.permissoes": 0, "usuarios.comissoes": 0 };

		const groups = await collection.aggregate([{ $addFields: addFields }, { $lookup: lookup }, { $project: projection }]).toArray();

		return groups as WithId<TUserGroupWithUsers>[];
	} catch (error) {
		throw error;
	}
}
type GetUserGroupByIdParams = {
	id: string;
	collection: Collection<TUserGroup>;
};
export async function getUserGroupById({ collection, id }: GetUserGroupByIdParams) {
	try {
		const match = { _id: new ObjectId(id) };
		const addFields = { idAsString: { $toString: "$_id" } };
		const lookup = { from: "users", localField: "idAsString", foreignField: "idGrupo", as: "usuarios" };
		const projection = { "usuarios.senha": 0, "usuarios.permissoes": 0, "usuarios.comissoes": 0 };

		const groups = await collection.aggregate([{ $match: match }, { $addFields: addFields }, { $lookup: lookup }, { $project: projection }]).toArray();

		return groups[0] as WithId<TUserGroupWithUsers> | null;
	} catch (error) {
		throw error;
	}
}
