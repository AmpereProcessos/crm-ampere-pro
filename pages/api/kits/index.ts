import { insertKit, updateKit } from "@/repositories/kits/mutations";
import { getKitById, getPartnerActiveKits, getPartnerKits } from "@/repositories/kits/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthentication, validateAuthorization } from "@/utils/api";
import { IKit } from "@/utils/models";
import { InsertNewKitSchema, TKit } from "@/utils/schemas/kits.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";
import { number, z } from "zod";

type PostResponse = {
	data: {
		insertedId: string;
	};
	message: string;
};

const createKit: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "kits", "criar", true);
	const partnerId = session.user.idParceiro;

	const kit = InsertNewKitSchema.parse(req.body);
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const kitsCollection: Collection<TKit> = db.collection("kits");

	const insertResponse = await insertKit({ collection: kitsCollection, info: kit, partnerId: partnerId || "" });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação do kit.");
	const insertedId = insertResponse.insertedId.toString();
	res.status(201).json({ data: { insertedId: insertedId }, message: "Kit criado com sucesso !" });
};

type GetResponse = {
	data: TKit[] | TKit;
};
const getKits: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "kits", "visualizar", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TKit> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const kitsCollection: Collection<TKit> = db.collection("kits");

	const { id, active } = req.query;

	// In case query is for especific ID
	if (!!id) {
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
		const kit = await getKitById({ collection: kitsCollection, id: id, query: partnerQuery });
		if (!kit) throw new createHttpError.NotFound("Kit não encontrado.");
		return res.status(200).json({ data: kit });
	}

	// Else, getting all partner assotiated kits
	if (active && active == "true") {
		console.log(active, typeof active);
		const kits = await getPartnerActiveKits({ collection: kitsCollection, query: partnerQuery });
		return res.status(200).json({ data: kits });
	}
	const kits = await getPartnerKits({ collection: kitsCollection, query: partnerQuery });

	return res.status(200).json({ data: kits });
};
type PutResponse = {
	data: string;
	message: string;
};

const editKit: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "kits", "editar", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TKit> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const { id } = req.query;
	const changes = InsertNewKitSchema.parse(req.body);

	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const kitsCollection: Collection<TKit> = db.collection("kits");

	const updateResponse = await updateKit({ id: id, collection: kitsCollection, changes: changes, query: partnerQuery });

	if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound("Kit não encontrado.");

	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na atualização do kit.");
	return res.status(201).json({ data: "Kit alterado com sucesso !", message: "Kit alterado com sucesso !" });
};
export default apiHandler({
	POST: createKit,
	GET: getKits,
	PUT: editKit,
});
