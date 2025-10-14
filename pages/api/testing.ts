import { formatWithoutDiacritics } from "@/lib/methods/formatting";
import connectToAmpereProjectsDatabase from "@/services/mongodb/ampere/projects-db-connection";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import { formatPhoneAsBase } from "@/utils/methods";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TProject } from "@/utils/schemas/project.schema";
import { type AnyBulkWriteOperation, ObjectId } from "mongodb";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

type TClientsGrouped = {
	[key: string]: {
		quantity: number;
		clients: {
			id: string;
			nome: string;
			cpfCnpj: string;
			email: string;
			cep: string;
			uf: string;
			cidade: string;
			score: number;
		}[];
		cpfCnpjs: string[];
		projects: string[];
		opportunities: string[];
	};
};

type TClientsOperationHolder = {
	key: string;
	clientsToKeep: {
		id: string;
		nome: string;
		cpfCnpj: string;
		email: string;
		cep: string;
		uf: string;
		cidade: string;
		score: number;
	}[];
	clientsToRemove: {
		id: string;
		nome: string;
		cpfCnpj: string;
		email: string;
		cep: string;
		uf: string;
		cidade: string;
		score: number;
	}[];
	clientsToClear: {
		id: string;
		nome: string;
		cpfCnpj: string;
		email: string;
		cep: string;
		uf: string;
		cidade: string;
		score: number;
	}[];
};
const getManualTesting = async (req: NextApiRequest, res: NextApiResponse) => {
	const appDb = await connectToAmpereProjectsDatabase();
	const projectsCollection = appDb.collection<TProject>("dados");
	const db = await connectToDatabase();
	const clientsCollection = db.collection<TClient>("clients");
	const opportunitiesCollection = db.collection<TOpportunity>("opportunities");
	console.log("Getting clients");
	const clients = await clientsCollection
		.find(
			{},
			{
				projection: {
					_id: 1,
					nome: 1,
					telefonePrimarioBase: 1,
					cpfCnpj: 1,
					email: 1,
					cep: 1,
					uf: 1,
					cidade: 1,
				},
			},
		)
		.toArray();
	console.log("Getting opportunities");
	const opportunities = await opportunitiesCollection
		.find({}, { projection: { _id: 1, idCliente: 1 } })
		.toArray();
	console.log("Getting projects");
	const projects = await projectsCollection
		.find({}, { projection: { _id: 1, idClienteCRM: 1 } })
		.toArray();
	console.log("Processing clients");
	const clientsGrouped = clients.reduce(
		(acc: TClientsGrouped, client, index) => {
			console.log(`Processing client ${index + 1} of ${clients.length}`);
			const basePhoneNumber = client.telefonePrimarioBase || "";
			if (!acc[basePhoneNumber])
				acc[basePhoneNumber] = {
					quantity: 0,

					clients: [],
					cpfCnpjs: [],
					projects: [],
					opportunities: [],
				};
			const clientOpportunities = opportunities.filter(
				(opportunity) => opportunity.idCliente === client._id.toString(),
			);
			const clientProjects = projects.filter(
				(project) => project.idClienteCRM === client._id.toString(),
			);
			let score = 0;
			if (client.cpfCnpj) score += 10;
			if (client.email) score += 1;
			if (client.cep) score += 1;
			if (client.uf) score += 1;
			if (client.cidade) score += 1;

			acc[basePhoneNumber].quantity++;
			acc[basePhoneNumber].clients.push({
				id: client._id.toString(),
				nome: client.nome,
				cpfCnpj: client.cpfCnpj ?? "",
				score,
				email: client.email ?? "",
				cep: client.cep ?? "",
				uf: client.uf ?? "",
				cidade: client.cidade ?? "",
			});
			acc[basePhoneNumber].opportunities.push(
				...clientOpportunities.map((opportunity) => opportunity._id.toString()),
			);
			acc[basePhoneNumber].projects.push(
				...clientProjects.map((project) => project._id.toString()),
			);
			if (
				!!client.cpfCnpj &&
				!acc[basePhoneNumber].cpfCnpjs.includes(client.cpfCnpj ?? "")
			)
				acc[basePhoneNumber].cpfCnpjs.push(client.cpfCnpj ?? "");
			return acc;
		},
		{},
	);
	const clientsGroupedSorted = Object.entries(clientsGrouped)
		.map(([basePhoneNumber, clients]) => {
			return {
				key: basePhoneNumber,
				clients: clients.clients.sort((a, b) => b.score - a.score),
				cpfCnpjs: clients.cpfCnpjs,
				projects: clients.projects,
				opportunities: clients.opportunities,
				quantity: clients.quantity,
			};
		})
		.filter((client) => client.key && client.clients.length > 1);

	const clientsOperationHolder: TClientsOperationHolder[] = [];
	for (const clientGroup of clientsGroupedSorted) {
		const clientOperationHolder: TClientsOperationHolder = {
			key: clientGroup.key,
			clientsToKeep: [],
			clientsToRemove: [],
			clientsToClear: [],
		};

		for (const client of clientGroup.clients) {
			console.log("STARTING CLIENT GROUP");
			// If no client was define in clientsToKeep, adding the first one
			if (clientOperationHolder.clientsToKeep.length === 0) {
				clientOperationHolder.clientsToKeep.push(client);
				continue;
			}
			// Now, checking in clientsToKeep is there is any client with the same cpfCnpj
			const clientAlreadyInClientsToKeepIndex =
				clientOperationHolder.clientsToKeep.findIndex(
					(c) => c.cpfCnpj === client.cpfCnpj,
				);
			if (clientAlreadyInClientsToKeepIndex === -1 && !!client.cpfCnpj) {
				// If there is no client with the same cpfCnpj and the cpfCnpj is not empty, adding the client to clientsToKeep
				clientOperationHolder.clientsToKeep.push(client);
				continue;
			}
			if (clientAlreadyInClientsToKeepIndex !== -1 && !!client.cpfCnpj) {
				console.log(
					"CLIENT ALREADY IN CLIENTS TO KEEP",
					clientAlreadyInClientsToKeepIndex,
				);
				// If there is a client with the same cpfCnpj and the cpfCnpj is not empty, checking if the current client has a higher score
				if (
					client.score >
					clientOperationHolder.clientsToKeep[clientAlreadyInClientsToKeepIndex]
						.score
				) {
					// If so, exchanging the client in clientsToKeep
					clientOperationHolder.clientsToKeep[
						clientAlreadyInClientsToKeepIndex
					] = client;
					continue;
				}
				continue;
			}

			// Now, we are left with only clients with no cpfCnpj
			const clientWithNoCpfCnpjIndex =
				clientOperationHolder.clientsToKeep.findIndex((c) => !c.cpfCnpj);

			if (clientWithNoCpfCnpjIndex !== -1) {
				console.log("CLIENT WITH NO CPF CNPJ INDEX", clientWithNoCpfCnpjIndex);
				const clientFoundFirstName = formatWithoutDiacritics(
					clientOperationHolder.clientsToKeep[
						clientWithNoCpfCnpjIndex
					].nome?.split(" ")[0] ?? "",
					true,
				);
				const clientCurrentFirstName = formatWithoutDiacritics(
					client.nome?.split(" ")[0] ?? "",
					true,
				);

				const isSamePersonByFirstName =
					clientFoundFirstName === clientCurrentFirstName;
				if (!isSamePersonByFirstName) {
					// If is a different person, checking if it was already in clientsToClear
					const clientAlreadyInClientsToClearIndex =
						clientOperationHolder.clientsToClear.findIndex(
							(c) => c.cpfCnpj === client.cpfCnpj,
						);
					if (clientAlreadyInClientsToClearIndex === -1) {
						clientOperationHolder.clientsToClear.push(client);
						continue;
					}
				}
				if (
					client.score >
					clientOperationHolder.clientsToKeep[clientWithNoCpfCnpjIndex].score
				) {
					clientOperationHolder.clientsToKeep[clientWithNoCpfCnpjIndex] =
						client;
					continue;
				}
			}
			// If the current client has a higher score than the client with no cpfCnpj, exchanging the client in clientsToKeep

			console.log("ENDING CLIENT GROUP");
		}

		const clientsToKeepOrClearIds = [
			...clientOperationHolder.clientsToKeep.map((c) => c.id),
			...clientOperationHolder.clientsToClear.map((c) => c.id),
		];

		// Now, adding to clientsToRemove all clients that are not in clientsToKeep
		const clientsToRemove = clientGroup.clients.filter(
			(c) => !clientsToKeepOrClearIds.includes(c.id),
		);
		clientOperationHolder.clientsToRemove = clientsToRemove;
		clientsOperationHolder.push(clientOperationHolder);
	}
	const clientsOperation = clientsOperationHolder.map((clientOperation) => ({
		...clientOperation,
		keeping: clientOperation.clientsToKeep.length,
		removing: clientOperation.clientsToRemove.length,
		clearing: clientOperation.clientsToClear.length,
	}));
	return res.status(200).json("DISABLED");
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
