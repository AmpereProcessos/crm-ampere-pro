import { insertUtil } from "@/repositories/utils/mutations";
import { getAcquisitionChannels, getCreditors, getEquipments } from "@/repositories/utils/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { GeneralUtilSchema, type TUtil, UtilsIdentifierSchema } from "@/utils/schemas/utils";
import createHttpError from "http-errors";
import type { Collection, Filter } from "mongodb";
import type { NextApiHandler } from "next";

type GetResponse = {
	data: TUtil[];
};

const getUtilsRelated: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);

	const { equipmentCategory } = req.query;
	const identifier = UtilsIdentifierSchema.parse(req.query.identifier);

	const db = await connectToDatabase();
	const collection: Collection<TUtil> = db.collection("utils");
	if (identifier === "CREDITOR") {
		const creditors = await getCreditors({ collection: collection });
		return res.status(200).json({ data: creditors });
	}

	if (identifier === "EQUIPMENT") {
		const categoryQuery: Filter<TUtil> = equipmentCategory && equipmentCategory !== "null" && equipmentCategory !== "undefined" ? { categoria: equipmentCategory } : {};
		const query = { ...categoryQuery };
		const equipments = await getEquipments({ collection: collection, query: query });
		return res.status(200).json({ data: equipments });
	}

	if (identifier === "ACQUISITION_CHANNEL") {
		const acquisitionChannels = await getAcquisitionChannels({ collection: collection });
		return res.status(200).json({ data: acquisitionChannels });
	}

	return res.status(200).json({ data: [] });
};

type PostResponse = {
	data: { insertedId: string };
	message: string;
};

const createUtil: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const db = await connectToDatabase();
	const collection: Collection<TUtil> = db.collection("utils");
	const util = GeneralUtilSchema.parse(req.body);

	const insertResponse = await insertUtil({ collection: collection, info: util });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao inserir personalização.");

	const insertedId = insertResponse.insertedId.toString();

	return res.status(201).json({ data: { insertedId }, message: "Personalização criada com sucesso !" });
};

export default apiHandler({ GET: getUtilsRelated, POST: createUtil });
