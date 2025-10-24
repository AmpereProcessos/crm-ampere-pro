import { insertManyKits } from "@/repositories/kits/mutations";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthorization } from "@/utils/api";
import { InsertNewKitSchema, KitDTOSchema, TKit } from "@/utils/schemas/kits.schema";

import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";
import z from "zod";
type PostResponse = {
	data: {
		insertedId: string[];
	};
	message: string;
};
const createKits: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "kits", "editar", true);

	const kits = z.array(InsertNewKitSchema).parse(req.body);
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const kitsCollection: Collection<TKit> = db.collection("kits");
	console.log("KITS INSERTED", kits);
	const insertResponse = await insertManyKits({ collection: kitsCollection, info: kits });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação do kit.");
	const insertedIds = Object.keys(insertResponse.insertedIds).map((id) => id.toString());
	res.status(201).json({ data: { insertedId: insertedIds }, message: "Kit criado com sucesso !" });
};
type PutResponse = {
	data: string;
	message: string;
};
const updateKits: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "kits", "editar", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TKit> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const kits = z.array(KitDTOSchema).parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const kitsCollection: Collection<TKit> = db.collection("kits");

	console.log("KITS TO INSERT", kits);
	const bulkwriteArr = kits.map((kit) => {
		if (!kit._id || typeof kit._id != "string" || !ObjectId.isValid(kit._id)) return null;
		const setObject = { ...kit, _id: undefined };
		delete setObject._id;
		return {
			updateOne: {
				filter: { _id: new ObjectId(kit._id), ...partnerQuery },
				update: { $set: { ...setObject } },
			},
		};
	});
	const filteredBulkwriteArr = bulkwriteArr.filter((o) => !!o);

	if (filteredBulkwriteArr.length == 0)
		return res.status(201).json({ data: "Operação concluída com sucesso!", message: "Operação concluída com sucesso!" });
	// @ts-ignore
	const bulkwriteResponse = await kitsCollection.bulkWrite(filteredBulkwriteArr);

	return res.status(201).json({ data: "Operação concluída com sucesso!", message: "Operação concluída com sucesso!" });
};
type DeleteResponse = {
	data: string;
	message: string;
};
const deleteKits: NextApiHandler<DeleteResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "kits", "editar", true);
	const partnerId = session.user.idParceiro;
	const { ids } = req.query;

	if (typeof ids != "string") throw new createHttpError.BadRequest("IDs não válidos.");

	const idsArr = ids.split(",");
	console.log(idsArr);
	const parsedIds = z.array(z.string(), { required_error: "IDs não fornecidos.", invalid_type_error: "Tipo não válido para IDs" }).parse(idsArr);

	const objectIds = parsedIds.map((id) => new ObjectId(id));

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const kitsCollection: Collection<TKit> = db.collection("kits");

	const deleteResponse = await kitsCollection.deleteMany({ _id: { $in: objectIds } });

	if (!deleteResponse.acknowledged) return new createHttpError.InternalServerError("Erro ao excluir kits.");
	return res.status(201).json({ data: "Kits excluídos com sucesso!", message: "Kits excluídos com sucesso!" });
};
export default apiHandler({
	POST: createKits,
	PUT: updateKits,
	DELETE: deleteKits,
});
