import { getSaleGoalsByUserId } from "@/repositories/sale-goals/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession, validateAuthorization } from "@/utils/api";
import { InsertSaleGoalSchema, TSaleGoal } from "@/utils/schemas/sale-goal.schema";
import { TUser } from "@/utils/schemas/user.schema";
import createHttpError from "http-errors";
import { Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type GetResponse = {
	data: TSaleGoal[];
};
const getSaleGoalsRoute: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerScope = session.user.permissoes.parceiros.escopo;

	const partnerQuery: Filter<TSaleGoal> = partnerScope ? { idParceiro: { $in: partnerScope } } : {};

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection = db.collection<TSaleGoal>("sale-goals");

	const { userId } = req.query;

	if (userId) {
		if (typeof userId != "string" || !ObjectId.isValid(userId)) throw new createHttpError.BadRequest("ID de usuários inválido.");

		const saleGoals = await getSaleGoalsByUserId({ collection, query: partnerQuery, userId });

		return res.status(200).json({ data: saleGoals });
	}

	throw new createHttpError.BadRequest("Tipo de solicitação inválida.");
};

type PostResponse = {
	data: { insertedId: string };
	message: string;
};
const createSaleGoalRoute: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "resultados", "visualizarComercial", true);

	const goal = InsertSaleGoalSchema.parse(req.body);

	const userId = goal.usuario.id;

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const usersCollection = db.collection<TUser>("users");
	const saleGoalsCollection = db.collection<TSaleGoal>("sale-goals");

	const user = await usersCollection.findOne({ _id: new ObjectId(userId) }, { projection: { idParceiro: 1 } });
	if (!user) throw new createHttpError.NotFound("Usuário não encontrado.");
	const userPartnerId = user.idParceiro;

	const insertResponse = await saleGoalsCollection.insertOne({ ...goal, idParceiro: userPartnerId });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Erro ao criar meta de vendas.");
	const insertedId = insertResponse.insertedId.toString();
	return res.status(201).json({ data: { insertedId }, message: "Meta de vendas criada com sucesso !" });
};

type PutResponse = {
	data: string;
	message: string;
};
const updateSaleGoalRoute: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "resultados", "visualizarComercial", true);
	const { id } = req.query;
	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

	const changes = InsertSaleGoalSchema.partial().parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const saleGoalsCollection = db.collection<TSaleGoal>("sale-goals");

	const updateResponse = await saleGoalsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { ...changes } });
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro ao atualizar meta de vendas.");
	if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound("Meta de vendas não encontrada.");

	return res.status(200).json({ data: "Meta de vendas atualizada com sucesso !", message: "Meta de vendas atualizada com sucesso !" });
};

export default apiHandler({ GET: getSaleGoalsRoute, POST: createSaleGoalRoute, PUT: updateSaleGoalRoute });
