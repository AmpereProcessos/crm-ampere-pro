import { insertPricingMethod } from "@/repositories/pricing-methods/mutations";
import { getPartnerPricingMethodById, getPartnerPricingMethods } from "@/repositories/pricing-methods/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthorization } from "@/utils/api";
import { InsertPricingMethodSchema, TPricingMethod } from "@/utils/schemas/pricing-method.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId, WithId } from "mongodb";
import { NextApiHandler } from "next";

type PostResponse = {
	data: {
		insertedId: string;
	};
	message: string;
};

const createPricingMethod: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "precos", "editar", true);
	const partnerId = session.user.idParceiro;

	const pricingMethod = InsertPricingMethodSchema.parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TPricingMethod> = db.collection("pricing-methods");

	const insertResponse = await insertPricingMethod({ collection: collection, info: pricingMethod, partnerId: partnerId || "" });
	if (!insertResponse.acknowledged)
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação da metodologia de precificação.");
	const insertedId = insertResponse.insertedId.toString();
	res.status(201).json({ data: { insertedId: insertedId }, message: "Metodologia de precificação criada com sucesso !" });
};

type GetResponse = {
	data: TPricingMethod | TPricingMethod[];
};
const getPricingMethods: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "kits", "editar", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TPricingMethod> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const { id } = req.query;
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TPricingMethod> = db.collection("pricing-methods");

	if (id) {
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
		const pricingMethod = await getPartnerPricingMethodById({ id: id, collection: collection, query: partnerQuery });
		if (!pricingMethod) throw new createHttpError.NotFound("Metodologia não encontrada.");
		return res.status(200).json({ data: pricingMethod });
	}
	const pricingMethods = await getPartnerPricingMethods({ collection: collection, query: partnerQuery });

	return res.status(200).json({ data: pricingMethods });
};

type PutResponse = {
	data: string;
	message: string;
};

const editPricingMethod: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "configuracoes", "precificacao", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TPricingMethod> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const { id } = req.query;
	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

	const changes = InsertPricingMethodSchema.partial().parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TPricingMethod> = db.collection("pricing-methods");

	const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...partnerQuery }, { $set: { ...changes } });
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao atualizar metodologia.");
	if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound("Metodologia não encontrada.");

	return res.status(201).json({ data: "Metodologia atualizada com sucesso !", message: "Metodologia atualizada com sucesso !" });
};
export default apiHandler({ GET: getPricingMethods, POST: createPricingMethod, PUT: editPricingMethod });
