import { insertSignaturePlan, updateSignaturePlan } from "@/repositories/signature-plans/mutations";
import { getSignaturePlanById, getSignaturePlans } from "@/repositories/signature-plans/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession, validateAuthorization } from "@/utils/api";
import { InsertSignaturePlanSchema, TSignaturePlan, TSignaturePlanDTO } from "@/utils/schemas/signature-plans.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type GetResponse = {
	data: TSignaturePlan | TSignaturePlan[];
};

const getPartnersSignaturePlans: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;

	const { id, onlyActive } = req.query;

	// Specifing queries
	const queryActiveOnly: Filter<TSignaturePlan> = onlyActive == "true" ? { ativo: true } : {};
	const queryPartner: Filter<TSignaturePlan> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	// Final query
	const query: Filter<TSignaturePlan> = { ...queryPartner, ...queryActiveOnly };
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TSignaturePlan> = db.collection("signature-plans");

	if (id) {
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
		const plan = await getSignaturePlanById({ id: id, collection: collection, query: queryPartner });
		if (!plan) throw new createHttpError.NotFound("Nenhum plano de assinatura encontrado.");
		return res.status(200).json({ data: plan });
	}

	const plans = await getSignaturePlans({ collection: collection, query: query });

	return res.status(200).json({ data: plans });
};

type PostResponse = {
	data: { insertedId: string };
	message: string;
};

const createSignaturePlan: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "planos", "criar", true);
	const partnerId = session.user.idParceiro;

	const plan = InsertSignaturePlanSchema.parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TSignaturePlan> = db.collection("signature-plans");

	const insertResponse = await insertSignaturePlan({ collection: collection, info: plan, partnerId: partnerId || "" });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar plano de assinatura.");
	const insertedId = insertResponse.insertedId.toString();

	return res.status(201).json({ data: { insertedId }, message: "Plano de assinatura criado com sucesso !" });
};

type PutResponse = {
	data: string;
	message: string;
};
const editSignaturePlan: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "planos", "criar", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TSignaturePlan> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const { id } = req.query;
	const changes = InsertSignaturePlanSchema.partial().parse(req.body);

	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TSignaturePlan> = db.collection("signature-plans");

	const updateResponse = await updateSignaturePlan({ id: id, collection: collection, changes: changes, query: partnerQuery });

	if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound("Nenhum plano não encontrado.");

	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na atualização do plano de assinatura.");
	return res.status(201).json({ data: "Plano de assinatura alterado com sucesso !", message: "Plano de assinatura alterado com sucesso !" });
};

export default apiHandler({ GET: getPartnersSignaturePlans, POST: createSignaturePlan, PUT: editSignaturePlan });
