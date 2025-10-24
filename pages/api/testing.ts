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
	const crmDb = await connectToDatabase();
	const clientsCollection = crmDb.collection<TClient>("clients");

	const clientsWithBirthdayToFormat = await clientsCollection.find({ dataNascimento: { $regex: "T00:00:00.000Z" } }).toArray();

	const bulkwriteClients: AnyBulkWriteOperation<TClient>[] = clientsWithBirthdayToFormat.map((c) => {
		return {
			updateOne: {
				filter: { _id: new ObjectId(c._id) },
				update: { $set: { dataNascimento: c.dataNascimento?.replace("T00:00:00.000Z", "T12:00:00.000Z") } },
			},
		};
	});

	const bulkwriteResponse = await clientsCollection.bulkWrite(bulkwriteClients);
	return res.status(200).json({ data: bulkwriteResponse, message: "Manual testing completed successfully" });
};

export default apiHandler({ GET: getManualTesting });
