import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import { TPartner, UpdateOwnPartnerSchema } from "@/utils/schemas/partner.schema";
import createHttpError from "http-errors";
import { Collection, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type PutResponse = {
	message: string;
	data: string;
};
const editOwnPartner: NextApiHandler<PutResponse> = async (req, res) => {
	const { id } = req.query;

	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido ou não fornecido.");

	const changes = UpdateOwnPartnerSchema.partial().parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const partnersCollection: Collection<TPartner> = db.collection("partners");

	const updateResponse = await partnersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { ...changes } });

	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro na atualização do parceiro.");

	return res.status(201).json({ data: "Atualização feita com sucesso !", message: "Atualização feita com suceso !" });
};

export default apiHandler({
	PUT: editOwnPartner,
});
