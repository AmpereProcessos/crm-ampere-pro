import { insertPurchase, updatePurchase } from "@/repositories/purchases/mutations";
import { getPurchaseById, getPurchases, getPurchasesByProjectId } from "@/repositories/purchases/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { InsertPurchaseSchema, TPurchase, TPurchaseWithProject } from "@/utils/schemas/purchase.schema";
import createHttpError from "http-errors";
import { Collection, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type GetResponse = {
	data: TPurchaseWithProject | TPurchase[];
};

const getPurchasesRoute: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerScope = session.user.permissoes.parceiros.escopo;

	const partnerQuery = partnerScope ? { idParceiro: { $in: partnerScope } } : {};
	const { id, projectId } = req.query;

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TPurchase> = db.collection("purchases");

	if (id) {
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
		const purchase = await getPurchaseById({ collection, id, query: partnerQuery });
		if (!purchase) throw new createHttpError.NotFound("Registro de compra não encontrado.");
		return res.status(200).json({ data: purchase });
	}
	if (projectId) {
		if (typeof projectId != "string" || !ObjectId.isValid(projectId)) throw new createHttpError.BadRequest("ID de projeto inválido.");
		const purchases = await getPurchasesByProjectId({ collection, projectId, query: partnerQuery });
		return res.status(200).json({ data: purchases });
	}

	const purchases = await getPurchases({ collection, query: partnerQuery });

	return res.status(200).json({ data: purchases });
};

type PostResponse = {
	data: { insertedId: string };
	message: string;
};

const createPurchasesRoute: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);

	const purchase = InsertPurchaseSchema.parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TPurchase> = db.collection("purchases");

	const insertResponse = await insertPurchase({ collection, info: purchase });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar registro de compra.");
	const insertedId = insertResponse.insertedId.toString();

	return res.status(201).json({ data: { insertedId }, message: "Registro de compra criado com sucesso !" });
};
type PutResponse = {
	data: string;
	message: string;
};

const editPurchaseRoute: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerScope = session.user.permissoes.parceiros.escopo;

	const partnerQuery = partnerScope ? { idParceiro: { $in: partnerScope } } : {};
	const { id } = req.query;

	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
	const changes = InsertPurchaseSchema.partial().parse(req.body);
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TPurchase> = db.collection("purchases");

	const updateResponse = await updatePurchase({ id, collection, changes, query: partnerQuery });
	if (!updateResponse.acknowledged)
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao atualizar o registro de compra.");
	if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound("Registro de compra não encontrado.");

	return res.status(201).json({ data: "Registro de compra atualizado com sucesso !", message: "Registro de compra atualizado com sucesso !" });
};

export default apiHandler({ GET: getPurchasesRoute, POST: createPurchasesRoute, PUT: editPurchaseRoute });
