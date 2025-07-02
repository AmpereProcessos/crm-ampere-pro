import { formatDecimalPlaces } from "@/lib/methods/formatting";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { novu } from "@/services/novu";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import type { TUser } from "@/utils/schemas/user.schema";
import { AnyBulkWriteOperation } from "mongodb";
import type { NextApiHandler } from "next";

const handleGeneralFixing: NextApiHandler<any> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);

	const db = await connectToDatabase();
	const usersCollection = db.collection<TUser>("users");

	const users = await usersCollection.find({}).toArray();

	const userBulkwrite: AnyBulkWriteOperation<TUser>[] = users.map((u) => {
		const userComissionConfig: TUser["comissionamento"] = u.comissionamento;
		userComissionConfig.push({
			tipoProjeto: {
				id: "661ec7e5e03128a48f94b4de",
				nome: "OPERAÇÃO E MANUTENÇÃO",
			},
			papel: "VENDEDOR",
			resultados: [
				{
					condicao: {
						aplicavel: false,
					},
					formulaArr: ["0.1", "*", "[valor_venda]"],
				},
			],
		});
		return {
			updateOne: {
				filter: { _id: u._id },
				update: {
					$set: {
						comissionamento: userComissionConfig,
					},
				},
			},
		};
	});

	// const userBulkwriteResult = await usersCollection.bulkWrite(userBulkwrite);
	return res.status(200).json({
		// userBulkwriteResult,
		userBulkwrite,
		message: "Comissionamento fixado com sucesso",
	});
};

export default apiHandler({
	GET: handleGeneralFixing,
});
