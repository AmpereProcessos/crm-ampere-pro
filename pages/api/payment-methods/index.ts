import { insertPaymentMethod, updatePaymentMethod } from "@/repositories/payment-methods/mutations";
import { getPaymentMethods, getPaymentMethodsById } from "@/repositories/payment-methods/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession, validateAuthorization } from "@/utils/api";
import { InsertPaymentMethodSchema, TPaymentMethod, TPaymentMethodEntity } from "@/utils/schemas/payment-methods";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type PostResponse = {
	data: {
		insertedId: string;
	};
	message: string;
};

const createPaymentMethod: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "configuracoes", "metodosPagamento", true);
	const partnerId = session.user.idParceiro;

	const paymentMethod = InsertPaymentMethodSchema.parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TPaymentMethod> = db.collection("payment-methods");

	const insertResponse = await insertPaymentMethod({ collection: collection, info: paymentMethod, partnerId: partnerId || "" });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro ao criar o método de pagamento.");
	const insertedId = insertResponse.insertedId.toString();
	return res.status(200).json({ data: { insertedId }, message: "Método de pagamento criado com sucesso !" });
};

type GetResponse = {
	data: TPaymentMethodEntity | TPaymentMethodEntity[];
};

const getPartnerPaymentMethods: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TPaymentMethod> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const { id } = req.query;

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TPaymentMethod> = db.collection("payment-methods");

	if (!!id) {
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

		const paymentMethod = await getPaymentMethodsById({ collection: collection, id: id, query: partnerQuery });
		if (!paymentMethod) throw new createHttpError.NotFound("Método não encontrado.");
		return res.json({ data: paymentMethod });
	}
	const paymentMethods = await getPaymentMethods({ collection: collection, query: partnerQuery });
	return res.json({ data: paymentMethods });
};

type PutResponse = {
	data: string;
	message: string;
};
const editPaymentMethod: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "configuracoes", "metodosPagamento", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TPaymentMethod> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const { id } = req.query;
	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
	const changes = InsertPaymentMethodSchema.partial().parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TPaymentMethod> = db.collection("payment-methods");

	const updateResponse = await updatePaymentMethod({ collection: collection, id: id, changes: changes, query: partnerQuery });
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao atualizar método de pagamento.");
	if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound("Método de pagamento não encontrado.");

	return res.status(201).json({ data: "Método de pagamento atualizado com sucesso !", message: "Método de pagamento atualizado com sucesso !" });
};

export default apiHandler({ GET: getPartnerPaymentMethods, POST: createPaymentMethod, PUT: editPaymentMethod });
