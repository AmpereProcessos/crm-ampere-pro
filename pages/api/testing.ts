import { formatDateAsLocale } from "@/lib/methods/formatting";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { novu } from "@/services/novu";
import { apiHandler } from "@/utils/api";
import { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { TUser } from "@/utils/schemas/user.schema";
import { AnyBulkWriteOperation } from "mongodb";
import { NextApiHandler } from "next";

const interval = {
	start: "2024-01-01T00:00:00.000Z",
	end: "2024-12-31T23:59:59.999Z",
};

type GetResponse = any;
const getManualTesting: NextApiHandler<GetResponse> = async (req, res) => {
	const db = await connectToDatabase();

	const usersCollection = db.collection<TUser>("users");
	const users = await usersCollection
		.find({
			email: {
				$not: {
					$regex: "inativo",
				},
			},
		})
		.toArray();

	await novu.subscribers.createBulk({
		subscribers: users.map((user, index) => {
			console.log(user.nome, user.email, index);
			return {
				subscriberId: user._id.toString(),
				email: user.email,
				firstName: user.nome,
			};
		}),
	});
	// const opportunitiesCollection = db.collection<TOpportunity>("opportunities");
	// const clientsCollection = db.collection("clients");

	// const clients = await clientsCollection.find({}).toArray();

	// console.log("Creating bulk write operations for clients...", formatDateAsLocale(new Date(), true));
	// const bulkwriteOpportunities: AnyBulkWriteOperation<TOpportunity>[] = clients.map((client) => {
	// 	return {
	// 		updateOne: {
	// 			filter: { idCliente: client._id.toString() },
	// 			update: {
	// 				$set: {
	// 					"cliente.nome": client.nome,
	// 					"cliente.cpfCnpj": client.cpfCnpj,
	// 					"cliente.telefonePrimario": client.telefonePrimario,
	// 					"cliente.email": client.email,
	// 					"cliente.canalAquisicao": client.canalAquisicao,
	// 				},
	// 			},
	// 		},
	// 	};
	// });
	// console.log("Bulk write operations created. Executing bulk write...", formatDateAsLocale(new Date(), true));
	// const bulkWriteResponse = await opportunitiesCollection.bulkWrite(bulkwriteOpportunities);
	// console.log("Bulk write executed", formatDateAsLocale(new Date(), true));
	return res.status(200).json("DESATIVADA");
};

export default apiHandler({ GET: getManualTesting });
