import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import { formatPhoneAsBase } from "@/utils/methods";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { type AnyBulkWriteOperation, ObjectId } from "mongodb";
import type { NextApiHandler } from "next";

type TClientsGrouped = {
	[key: string]: {
		id: string;
		nome: string;
		score: number;
		opportunities: string[];
	}[];
};

const getManualTesting: NextApiHandler<any> = async (req, res) => {
	const db = await connectToDatabase();
	const clientsCollection = db.collection<TClient>("clients");
	const opportunitiesCollection = db.collection<TOpportunity>("opportunities");
	const clients = await clientsCollection.find({}).toArray();
	const opportunities = await opportunitiesCollection
		.find({}, { projection: { _id: 1, idCliente: 1 } })
		.toArray();
	const clientsGrouped = clients.reduce(
		(acc: TClientsGrouped, client, index) => {
			console.log(`Processing client ${index + 1} of ${clients.length}`);
			const basePhoneNumber = client.telefonePrimarioBase || "";
			if (!acc[basePhoneNumber]) acc[basePhoneNumber] = [];
			const clientOpportunities = opportunities.filter(
				(opportunity) => opportunity.idCliente === client._id.toString(),
			);
			let score = 0;
			if (client.cpfCnpj) score += 10;
			if (client.email) score += 1;
			if (client.cep) score += 1;
			if (client.uf) score += 1;
			if (client.cidade) score += 1;
			acc[basePhoneNumber].push({
				id: client._id.toString(),
				nome: client.nome,
				score,
				opportunities: clientOpportunities.map((opportunity) =>
					opportunity._id.toString(),
				),
			});
			return acc;
		},
		{},
	);
	const clientsGroupedSorted = Object.entries(clientsGrouped)
		.map(([basePhoneNumber, clients]) => {
			return {
				key: basePhoneNumber,
				clients: clients.sort((a, b) => b.score - a.score),
			};
		})
		.filter((client) => client.clients.length > 1);
	return res.status(200).json({ clientsGroupedSorted });
};

export default apiHandler({ GET: getManualTesting });

async function bulkUpdateClientsWithBasePhoneNumber() {
	const db = await connectToDatabase();
	const clientsCollection = db.collection<TClient>("clients");

	const clients = await clientsCollection.find({}).toArray();

	const bulkwriteWriteClients: AnyBulkWriteOperation<TClient>[] = clients.map(
		(client) => {
			return {
				updateOne: {
					filter: { _id: client._id },
					update: {
						$set: {
							telefonePrimarioBase: formatPhoneAsBase(
								client.telefonePrimario ?? "",
							),
						},
					},
				},
			};
		},
	);

	const bulkwriteResponse = await clientsCollection.bulkWrite(
		bulkwriteWriteClients,
	);

	return bulkwriteResponse;
}
