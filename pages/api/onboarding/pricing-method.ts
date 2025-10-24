import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import { InsertPricingMethodSchema, TPricingMethod } from "@/utils/schemas/pricing-method.schema";
import createHttpError from "http-errors";
import { Collection } from "mongodb";
import { NextApiHandler } from "next";

type PostResponse = {
	data: {
		insertedId: string;
	};
	message: string;
};

const createPricingMethod: NextApiHandler<PostResponse> = async (req, res) => {
	const pricingMethod = InsertPricingMethodSchema.parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TPricingMethod> = db.collection("pricing-methods");

	const insertResponse = await collection.insertOne({ ...pricingMethod, dataInsercao: new Date().toISOString() });
	if (!insertResponse.acknowledged)
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação da metodologia de precificação.");
	const insertedId = insertResponse.insertedId.toString();
	res.status(201).json({ data: { insertedId: insertedId }, message: "Metodologia de precificação criada com sucesso !" });
};

export default apiHandler({
	POST: createPricingMethod,
});
