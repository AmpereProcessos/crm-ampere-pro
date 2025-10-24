import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import { InsertPaymentMethodSchema, TPaymentMethod } from "@/utils/schemas/payment-methods";
import createHttpError from "http-errors";
import { Collection } from "mongodb";
import { NextApiHandler } from "next";

type PostResponse = {
	data: {
		insertedId: string;
	};
	message: string;
};

const createPaymentMethod: NextApiHandler<PostResponse> = async (req, res) => {
	const paymentMethod = InsertPaymentMethodSchema.parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TPaymentMethod> = db.collection("payment-methods");

	const insertResponse = await collection.insertOne({ ...paymentMethod });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro ao criar o método de pagamento.");

	const insertedId = insertResponse.insertedId.toString();
	return res.status(200).json({ data: { insertedId }, message: "Método de pagamento criado com sucesso !" });
};

export default apiHandler({
	POST: createPaymentMethod,
});
