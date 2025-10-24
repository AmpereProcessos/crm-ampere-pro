import { insertProduct, updateProduct } from "@/repositories/products/mutations";
import { getProductById, getProducts } from "@/repositories/products/queries";
import { insertService, updateService } from "@/repositories/services/mutations";
import { getServiceById, getServices } from "@/repositories/services/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession, validateAuthorization } from "@/utils/api";
import { InsertServiceSchema, TService } from "@/utils/schemas/service.schema";

import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type GetResponse = {
	data: TService | TService[];
};

const getPartnerServices: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "servicos", "visualizar", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TService> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const { id } = req.query;

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TService> = db.collection("services");

	if (id) {
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
		const service = await getServiceById({ collection: collection, id: id, query: partnerQuery });
		if (!service) throw new createHttpError.NotFound("Serviço não encontrado.");
		return res.status(200).json({ data: service });
	}

	const services = await getServices({ collection: collection, query: partnerQuery });

	return res.status(200).json({ data: services });
};

type PostResponse = {
	data: { insertedId: string };
	message: string;
};

const createService: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "servicos", "criar", true);
	const partnerId = session.user.idParceiro;

	const service = InsertServiceSchema.parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TService> = db.collection("services");

	const insertResponse = await insertService({ collection: collection, info: service, partnerId: partnerId || "" });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar serviço.");
	const insertedId = insertResponse.insertedId.toString();

	return res.status(201).json({ data: { insertedId }, message: "Serviço criado com sucesso !" });
};

type PutResponse = {
	data: string;
	message: string;
};

const editProduct: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "servicos", "editar", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TService> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const { id } = req.query;
	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
	const changes = InsertServiceSchema.partial().parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TService> = db.collection("services");

	const updateResponse = await updateService({ collection: collection, id: id, changes: changes, query: partnerQuery });
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao atualizar serviço.");
	if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound("Serviço não encontrado.");

	return res.status(201).json({ data: "Serviço atualizado com sucesso !", message: "Serviço atualizado com sucesso !" });
};

export default apiHandler({ GET: getPartnerServices, POST: createService, PUT: editProduct });
