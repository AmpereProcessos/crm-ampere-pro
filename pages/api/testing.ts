import createHttpError from "http-errors";
import { type AnyBulkWriteOperation, ObjectId } from "mongodb";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { sendTemplateWhatsappMessage, WHATSAPP_TEMPLATES } from "@/lib/automations/whatsapp";
import { formatWithoutDiacritics } from "@/lib/methods/formatting";
import connectToAmpereProjectsDatabase from "@/services/mongodb/ampere/projects-db-connection";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import { formatPhoneAsBase } from "@/utils/methods";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TProject } from "@/utils/schemas/project.schema";

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
	// const db = await connectToDatabase();
	// const opportunitiesCollection = db.collection<TOpportunity>("opportunities");

	// const opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId("6847487e0c59198dae854b15") });
	// if (!opportunity) throw new createHttpError.NotFound("Oportunidade não encontrada.");

	// const whatsappTemplate = WHATSAPP_TEMPLATES["opportunity_reactivation_variant_one"];
	// const whatsappTemplatePayload = whatsappTemplate.getWhatsappTemplatePayload({
	// 	logAutomacaoId: "6847487e0c59198dae854b15",
	// 	oportunidade: {
	// 		id: opportunity._id.toString(),
	// 		nome: opportunity.nome,
	// 		identificador: opportunity.identificador,
	// 		responsaveis: opportunity.responsaveis,
	// 	},
	// 	cliente: {
	// 		id: opportunity.idCliente,
	// 		nome: opportunity.cliente.nome,
	// 		telefone: opportunity.cliente.telefonePrimario,
	// 	},
	// });

	// const { data, message, whatsappMessageId } = await sendTemplateWhatsappMessage({
	// 	payload: whatsappTemplatePayload,
	// });

	// console.log({ data, message, whatsappMessageId });
	return res.status(200).json("{ data, message, whatsappMessageId }");
};

export default apiHandler({ GET: getManualTesting });
