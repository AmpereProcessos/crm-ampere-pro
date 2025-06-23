import { apiHandler, validateAuthentication, validateAuthenticationWithSession, validateAuthorization } from "../../../utils/api";
import type { NextApiHandler } from "next";
import connectToDatabase from "../../../services/mongodb/crm-db-connection";

import { hashSync } from "bcrypt";
import createHttpError from "http-errors";
import { type Collection, type Filter, ObjectId } from "mongodb";
import { GeneralUserSchema, type TUser, type TUserEntity } from "@/utils/schemas/user.schema";
import { getAllUsers, getPartnerUsers, getUserById } from "@/repositories/users/queries";
import { novu } from "@/services/novu";

// POST RESPONSE
type PostResponse = {
	data: {
		insertedId: string;
	};
	message: string;
};

const createUser: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "usuarios", "criar", true);
	const partnerId = session.user.idParceiro;
	const user = GeneralUserSchema.parse(req.body);
	const { senha: password } = user;
	const hashedPassword = hashSync(password, 10);

	const db = await connectToDatabase();
	const collection: Collection<TUser> = db.collection("users");

	// Validing existence of equivalent user in database
	const existingUserInDn = await collection.findOne({ email: user.email });
	if (existingUserInDn) {
		throw new createHttpError.BadRequest("Oops, já existe um usuário com esse email.");
	}
	// Passed validations, now, creating user refencing requester partner ID
	const insertResponse = await collection.insertOne({ ...user, senha: hashedPassword });
	const insertedIdAsString = insertResponse.insertedId.toString();
	// Dealing with updates for self scope only
	const updates = { $set: {} };
	if (user.permissoes.propostas.escopo && user.permissoes.propostas.escopo.length === 0) {
		updates.$set = { ...updates.$set, "permissoes.propostas.escopo": [insertedIdAsString] };
	}
	if (user.permissoes.oportunidades.escopo && user.permissoes.oportunidades.escopo.length === 0) {
		updates.$set = { ...updates.$set, "permissoes.oportunidades.escopo": [insertedIdAsString] };
	}
	if (user.permissoes.analisesTecnicas.escopo && user.permissoes.analisesTecnicas.escopo.length === 0) {
		updates.$set = { ...updates.$set, "permissoes.analisesTecnicas.escopo": [insertedIdAsString] };
	}
	if (user.permissoes.homologacoes.escopo && user.permissoes.homologacoes.escopo.length === 0) {
		updates.$set = { ...updates.$set, "permissoes.homologacoes.escopo": [insertedIdAsString] };
	}
	if (user.permissoes.clientes.escopo && user.permissoes.clientes.escopo.length === 0) {
		updates.$set = { ...updates.$set, "permissoes.clientes.escopo": [insertedIdAsString] };
	}
	if (user.permissoes.parceiros.escopo && user.permissoes.parceiros.escopo.length === 0) {
		updates.$set = { ...updates.$set, "permissoes.parceiros.escopo": [insertedIdAsString] };
	}
	if (user.permissoes.resultados.escopo && user.permissoes.resultados.escopo.length === 0) {
		updates.$set = { ...updates.$set, "permissoes.resultados.escopo": [insertedIdAsString] };
	}
	await collection.updateOne({ _id: insertResponse.insertedId }, updates);
	// Returning successful insertion
	if (insertResponse.acknowledged) res.status(201).json({ data: { insertedId: insertedIdAsString }, message: "Usuário adicionado!" });

	// Inserting user in novu 
	else throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação do usuário.");
};

// GET RESPONSE
type GetResponse = {
	data: TUserEntity[] | TUserEntity;
};
const getUsers: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TUser> = { idParceiro: parterScope ? { $in: parterScope } : { $ne: undefined } };

	console.log(partnerQuery);

	const db = await connectToDatabase();
	const usersCollection: Collection<TUserEntity> = db.collection("users");
	const { id } = req.query;

	if (id && typeof id === "string") {
		const user = await getUserById({ collection: usersCollection, id: id, query: partnerQuery });
		if (!user) throw new createHttpError.NotFound("Nenhum usuário encontrado com o ID fornecido.");
		return res.status(200).json({ data: user });
	}

	const users = await getPartnerUsers({ collection: usersCollection, query: partnerQuery });
	return res.status(200).json({ data: users });
};

// PUT RESPONSE
type PutResponse = {
	data: string;
	message: string;
};

const editUser: NextApiHandler<PutResponse> = async (req, res) => {
	await validateAuthorization(req, res, "usuarios", "editar", true);
	const { id } = req.query;
	if (!id || typeof id !== "string") throw new createHttpError.BadRequest("ID do objeto de alteração não especificado.");
	if (!req.body.changes) throw new createHttpError.BadRequest("Mudanças não especificadas na requisição.");

	let user = req.body.changes;

	if (user.senha && user.senha.trim().length > 0) {
		const hashedPassword = hashSync(user.senha, 10);
		user = { ...user, senha: hashedPassword };
	}
	const db = await connectToDatabase();
	const collection = db.collection("users");
	// let changes
	// if (req.body.changePassword && user.senha) {
	//   let hashedPassword = hashSync(user.senha, 10)
	//   changes = { ...user, senha: hashedPassword }
	// } else {
	//   changes = { ...user }
	// }
	// @ts-ignore
	delete user._id;
	console.log(user);
	if (typeof id === "string") await collection.updateOne({ _id: new ObjectId(id) }, { $set: { ...user } });
	res.status(201).json({ data: "OK", message: "Usuário alterado com sucesso." });
};

export default apiHandler({
	POST: createUser,
	GET: getUsers,
	PUT: editUser,
});
