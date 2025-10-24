import connectToAmpereProjectsDatabase from "@/services/mongodb/ampere/projects-db-connection";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TProject } from "@/utils/schemas/project.schema";
import { type AnyBulkWriteOperation, ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

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
async function fixDuplicity(req: NextApiRequest, res: NextApiResponse) {
	const clientsDuplicity = [] as TClientsOperationHolder[];

	const crmDb = await connectToDatabase();
	const appDb = await connectToAmpereProjectsDatabase();

	const clientsCollection = crmDb.collection<TClient>("clients");
	const opportunitiesCollection = crmDb.collection<TOpportunity>("opportunities");
	const projectsCollection = appDb.collection<TProject>("dados");
	const projects = await projectsCollection.find({}, { projection: { _id: 1, cpf_cnpj: 1, idClienteCRM: 1 } }).toArray();

	const clientsBulkwrite: AnyBulkWriteOperation<TClient>[] = [];
	const opportunitiesBulkwrite: AnyBulkWriteOperation<TOpportunity>[] = [];
	const projectsBulkwrite: AnyBulkWriteOperation<TProject>[] = [];

	for (const client of clientsDuplicity) {
		const clientToTransferToKeep = client.clientsToKeep[0];
		if (!clientToTransferToKeep) {
			console.log("Theorically impossible scenario.");
			throw new Error("Theorically impossible scenario.");
		}
		for (const clientToRemove of client.clientsToRemove) {
			// For the clients to remove, we gotta:
			// 1. Remove them from clients db
			// 2. Transfer their opportunities to the client to keep
			// 3. Transfer their projects to the client to keep

			const clientToDeleteProjects = projects.filter((project) => project.idClienteCRM === clientToRemove.id);
			if (clientToDeleteProjects.length > 0) {
				const betterToKeepOption = client.clientsToKeep.find((client) => client.cpfCnpj === clientToTransferToKeep.cpfCnpj);
				console.log(
					`Client to delete (${clientToRemove.id}) has ${clientToDeleteProjects.length} projects.`,
					clientToDeleteProjects.map(
						(project) =>
							`- Project ${project._id} with CPF_CNPJ: ${project.cpf_cnpj} to be transferred to ${clientToTransferToKeep.cpfCnpj}{${betterToKeepOption && betterToKeepOption.cpfCnpj !== clientToTransferToKeep.cpfCnpj ? `(better to keep option: ${betterToKeepOption.cpfCnpj})` : ""}}`,
					),
				);
			}

			// First, adding the client removal bulkwrite item
			clientsBulkwrite.push({
				deleteOne: {
					filter: {
						_id: new ObjectId(clientToRemove.id),
					},
				},
			});

			// Second, adding the opportunity transfer bulkwrite item
			opportunitiesBulkwrite.push({
				updateMany: {
					filter: {
						idCliente: clientToRemove.id,
					},
					update: {
						$set: {
							idCliente: clientToTransferToKeep.id,
						},
					},
				},
			});

			// Third, adding the projects transfer bulkwrite item
			projectsBulkwrite.push({
				updateMany: {
					filter: {
						idClienteCRM: clientToRemove.id,
					},
					update: {
						$set: {
							idClienteCRM: clientToTransferToKeep.id,
						},
					},
				},
			});
		}
		for (const clientToClear of client.clientsToClear) {
			clientsBulkwrite.push({
				updateOne: {
					filter: {
						_id: new ObjectId(clientToClear.id),
					},
					update: {
						$set: {
							telefonePrimario: "",
							telefonePrimarioBase: "",
						},
					},
				},
			});
		}
	}

	return res.status(200).json("DISABLED");
}

export default apiHandler({
	GET: fixDuplicity,
});
