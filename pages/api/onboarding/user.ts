import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import { GeneralUserSchema, TUser } from "@/utils/schemas/user.schema";
import { hashSync } from "bcrypt";
import createHttpError from "http-errors";
import { Collection } from "mongodb";
import { NextApiHandler } from "next";

type PostResponse = {
	data: {
		insertedId: string;
	};
	message: string;
};

const createUser: NextApiHandler<PostResponse> = async (req, res) => {
	const user = GeneralUserSchema.parse(req.body);
	const { senha: password } = user;
	let hashedPassword = hashSync(password, 10);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TUser> = db.collection("users");

	// Validing existence of equivalent user in database
	const existingUserInDn = await collection.findOne({ email: user.email });
	if (existingUserInDn) {
		throw new createHttpError.BadRequest("Oops, já existe um usuário com esse email.");
	}
	// Passed validations, now, creating user refencing requester partner ID
	let insertResponse = await collection.insertOne({ ...user, senha: hashedPassword });
	const insertedIdAsString = insertResponse.insertedId.toString();
	// Dealing with updates for self scope only
	var updates = { $set: {} };
	if (user.permissoes.propostas.escopo && user.permissoes.propostas.escopo.length == 0) {
		updates.$set = { ...updates.$set, "permissoes.propostas.escopo": [insertedIdAsString] };
	}
	if (user.permissoes.oportunidades.escopo && user.permissoes.oportunidades.escopo.length == 0) {
		updates.$set = { ...updates.$set, "permissoes.oportunidades.escopo": [insertedIdAsString] };
	}
	if (user.permissoes.clientes.escopo && user.permissoes.clientes.escopo.length == 0) {
		updates.$set = { ...updates.$set, "permissoes.clientes.escopo": [insertedIdAsString] };
	}
	if (user.permissoes.resultados.escopo && user.permissoes.resultados.escopo.length == 0) {
		updates.$set = { ...updates.$set, "permissoes.resultados.escopo": [insertedIdAsString] };
	}
	console.log("UPDATES", updates);
	await collection.updateOne({ _id: insertResponse.insertedId }, updates);
	// Returning successful insertion
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação do usuário.");
	return res.status(201).json({ data: { insertedId: insertedIdAsString }, message: "Usuário adicionado!" });
};

export default apiHandler({
	POST: createUser,
});
