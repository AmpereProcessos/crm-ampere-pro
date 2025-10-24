import { updateSaleGoal } from "@/repositories/sale-goals/mutations";
import { getSaleGoalsByUserId } from "@/repositories/sale-goals/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthentication, validateAuthenticationWithSession, validateAuthorization } from "@/utils/api";
import { InsertSaleGoalSchema, TSaleGoal } from "@/utils/schemas/sale-goal.schema";

import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";
import { z } from "zod";

type PostResponse = {
	data: {
		insertedId: string;
	};
	message: string;
};
const createSaleGoal: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const info = InsertSaleGoalSchema.parse(req.body);
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const saleGoalsCollection: Collection<TSaleGoal> = db.collection("sale-goals");

	const insertResponse = await saleGoalsCollection.insertOne({ ...info, idParceiro: partnerId || "", dataInsercao: new Date().toISOString() });

	res.status(200).json({ message: "Meta de vendas criada com sucesso!", data: { insertedId: insertResponse.insertedId.toString() } });
};

type GetResponse = {
	data: TSaleGoal[];
};
const getSaleGoals: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TSaleGoal> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const { id } = req.query;
	if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const saleGoalsCollections: Collection<TSaleGoal> = db.collection("sale-goals");
	const saleGoalsById = await getSaleGoalsByUserId({ collection: saleGoalsCollections, userId: id, query: partnerQuery });
	res.status(200).json({ data: saleGoalsById });
};
type PutResponse = {
	data: string;
	message: string;
};
const editSaleGoal: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "resultados", "visualizarComercial", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TSaleGoal> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const changes = InsertSaleGoalSchema.partial().parse(req.body);
	const { id } = req.query;
	if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const saleGoalsCollections: Collection<TSaleGoal> = db.collection("sale-goals");
	// if (typeof id != 'string') throw new createHttpError.BadRequest('ID inválido.')

	const updateResponse = await updateSaleGoal({ collection: saleGoalsCollections, id: id, query: partnerQuery, changes: changes });
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro ao atualizar meta de vendas.");
	res.json({ data: "Meta atualizada com sucesso !", message: "Meta atualizada com sucesso !" });
};

type DeleteResponse = {
	data: string;
	message: string;
};
const deleteSaleGoal: NextApiHandler<DeleteResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "resultados", "visualizarComercial", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TSaleGoal> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const { id } = req.query;
	if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const saleGoalsCollections: Collection<TSaleGoal> = db.collection("sale-goals");

	const deleteResponse = await saleGoalsCollections.deleteOne({ _id: new ObjectId(id), ...partnerQuery });
	if (!deleteResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro ao excluir meta de vendas.");
	return res.status(201).json({ data: "Meta de vendas excluída com sucesso !", message: "Meta de vendas excluída com sucesso !" });
};
export default apiHandler({ POST: createSaleGoal, GET: getSaleGoals, PUT: editSaleGoal, DELETE: deleteSaleGoal });
