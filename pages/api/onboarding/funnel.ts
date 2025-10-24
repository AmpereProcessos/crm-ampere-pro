import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import { InsertFunnelSchema, TFunnel } from "@/utils/schemas/funnel.schema";
import createHttpError from "http-errors";
import { Collection } from "mongodb";
import { NextApiHandler } from "next";

type PostResponse = {
	data: {
		insertedId: string;
	};
	message: string;
};
const createFunnel: NextApiHandler<PostResponse> = async (req, res) => {
	const infoParsed = InsertFunnelSchema.parse(req.body);
	const funnel = {
		...infoParsed,
		dataInsercao: new Date().toISOString(),
	};

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const funnelsCollection: Collection<TFunnel> = db.collection("funnels");

	const insertResponse = await funnelsCollection.insertOne({ ...funnel });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação do funil.");
	return res.status(201).json({ data: { insertedId: insertResponse.insertedId.toString() }, message: "Funil criado com sucesso !" });
};

export default apiHandler({
	POST: createFunnel,
});
