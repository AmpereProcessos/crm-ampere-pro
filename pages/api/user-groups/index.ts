import { insertUserGroup, updateUserGroup } from "@/repositories/user-groups/mutations";
import { getUserGroupById, getUserGroups } from "@/repositories/user-groups/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession, validateAuthorization } from "@/utils/api";
import { InsertUserGroupSchema, TUserGroup, TUserGroupWithUsers } from "@/utils/schemas/user-groups.schema";
import createHttpError from "http-errors";
import { Collection, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type GetResponse = {
	data: TUserGroupWithUsers | TUserGroupWithUsers[];
};

const getUserGroupsMethod: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);

	const { id } = req.query;

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TUserGroup> = db.collection("user-groups");
	if (id) {
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

		const group = await getUserGroupById({ collection, id });
		if (!group) throw new createHttpError.NotFound("Grupo de usuários não encontrado.");
		return res.status(200).json({ data: group });
	}

	const groups = await getUserGroups({ collection });

	return res.status(200).json({ data: groups });
};

type PostResponse = {
	data: { insertedId: string };
	message: string;
};
const createUserGroup: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "configuracoes", "gruposUsuarios", true);

	const group = InsertUserGroupSchema.parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TUserGroup> = db.collection("user-groups");

	const insertResponse = await insertUserGroup({ collection, info: group });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar grupo de usuários.");

	const insertedId = insertResponse.insertedId.toString();

	return res.status(201).json({ data: { insertedId }, message: "Grupo de usuários criado com sucesso!" });
};

type PutResponse = {
	data: string;
	message: string;
};

const editUserGroup: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "configuracoes", "gruposUsuarios", true);

	const { id } = req.query;
	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
	const changes = InsertUserGroupSchema.partial().parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TUserGroup> = db.collection("user-groups");

	const updateResponse = await updateUserGroup({ id: id, collection: collection, info: changes });
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao atualizar grupo de usuários.");
	if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound("Grupo de usuários não encontrado.");

	return res.status(201).json({ data: "Grupo de usuários atualizado com sucesso !", message: "Grupo de usuários atualizado com sucesso !" });
};

export default apiHandler({ GET: getUserGroupsMethod, POST: createUserGroup, PUT: editUserGroup });
