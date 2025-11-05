import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TUser } from "@/utils/schemas/user.schema";
import createHttpError from "http-errors";
import type { Collection } from "mongodb";
import type { NextApiHandler } from "next";
import { z } from "zod";
import { createNovuTopicAndSubscribeResponsibles } from "../../opportunities/personalized";
import { formatPhoneAsBase } from "@/utils/methods";

const NewLeadQueryInputSchema = z.object({
	nome: z.string({ required_error: "Nome é obrigatório", invalid_type_error: "Nome deve ser uma string" }).min(3, "Nome deve ter pelo menos 3 caracteres"),
	telefone: z
		.string({ required_error: "Telefone é obrigatório", invalid_type_error: "Telefone deve ser uma string" })
		.min(11, "Telefone deve ter pelo menos 11 caracteres"),
	email: z.string({ invalid_type_error: "Email deve ser uma string" }).email("Email inválido").optional().nullable(),
	uf: z.string({ invalid_type_error: "UF deve ser uma string" }).min(2, "UF deve ter pelo menos 2 caracteres").optional().nullable(),
	cidade: z.string({ invalid_type_error: "Cidade deve ser uma string" }).min(3, "Cidade deve ter pelo menos 3 caracteres").optional().nullable(),
	canalAquisicao: z.string({ invalid_type_error: "Canal de aquisição deve ser uma string" }).optional().nullable(),
	valorFaturaEnergia: z.string({ invalid_type_error: "Valor da fatura de energia deve ser um número" }).optional().nullable(),
	preferenciaMeioContato: z.enum(["EMAIL", "WHATSAPP", "TELEFONE"]).optional().nullable(),
	// others
	expectativaFechamento: z.string({ invalid_type_error: "Expectativa de fechamento deve ser uma string" }).optional().nullable(),
});

type TSuccessResponse = {
	data: {
		insertedId: string;
	};
	message: string;
};
async function handleLeadGeneration(newLead: z.infer<typeof NewLeadQueryInputSchema>) {
	const db = await connectToDatabase();
	const usersCollection = db.collection<TUser>("users");
	const clientsCollection = db.collection<TClient>("clients");
	const opportunitiesCollection = db.collection<TOpportunity>("opportunities");
	const funnelReferencesCollection = db.collection<TFunnelReference>("funnel-references");

	const newLeadReceiver = await getNewLeadReceiver({ opportunitiesCollection, usersCollection });
	console.log("[generate-lead] New lead receiver", newLeadReceiver);
	let clientId: string | null = null;
	const client = await clientsCollection.findOne({ telefonePrimarioBase: formatPhoneAsBase(newLead.telefone) });

	if (client) {
		console.log("[generate-lead] Using existing client", client._id.toString());
		clientId = client._id.toString();
	} else {
		console.log("[generate-lead] Creating new client", { newLead });
		const newClient: TClient = {
			nome: newLead.nome,
			idParceiro: newLeadReceiver.idParceiro,
			telefonePrimario: newLead.telefone,
			telefonePrimarioBase: formatPhoneAsBase(newLead.telefone),
			uf: newLead.uf || "",
			cidade: newLead.cidade || "",
			canalAquisicao: newLead.canalAquisicao || "MARKETING (GERAL)",
			autor: newLeadReceiver,
			idMarketing: "INTEGRAÇÃO",
			indicador: {},
			dataInsercao: new Date().toISOString(),
		};

		const insertedClientResponse = await clientsCollection.insertOne(newClient);
		clientId = insertedClientResponse.insertedId.toString();
	}

	const lastInsertedIdentificator = await opportunitiesCollection
		.aggregate([{ $project: { identificador: 1 } }, { $sort: { _id: -1 } }, { $limit: 1 }])
		.toArray();
	const lastIdentifierNumber = lastInsertedIdentificator[0] ? Number(lastInsertedIdentificator[0].identificador.split("-")[1]) : 0;
	const newIdentifierNumber = lastIdentifierNumber + 1;
	const newIdentifier = `CRM-${newIdentifierNumber}`;

	const opportunityResponsibles = [
		{
			id: newLeadReceiver.id,
			nome: newLeadReceiver.nome,
			papel: "VENDEDOR",
			avatar_url: newLeadReceiver.avatar_url,
			telefone: newLeadReceiver.telefone,
			dataInsercao: new Date().toISOString(),
		},
	];
	const opportunityToInsert: TOpportunity = {
		nome: newLead.nome,
		idParceiro: newLeadReceiver.idParceiro,
		tipo: {
			id: "6615785ddcb7a6e66ede9785",
			titulo: "SISTEMA FOTOVOLTAICO",
		},
		categoriaVenda: "KIT",
		descricao: `Valor da fatura de energia: ${newLead.valorFaturaEnergia} \n Canal de comunicação de preferência: ${newLead.preferenciaMeioContato || "N/A"} \n Expectativa de fechamento: ${newLead.expectativaFechamento || "N/A"}`,
		identificador: newIdentifier,
		responsaveis: opportunityResponsibles,
		segmento: "RESIDENCIAL" as TOpportunity["segmento"],
		idCliente: clientId as string,
		cliente: {
			nome: newLead.nome,
			cpfCnpj: "",
			telefonePrimario: newLead.telefone,
			email: newLead.email || "",
			canalAquisicao: newLead.canalAquisicao || "MARKETING (GERAL)",
		},
		localizacao: {
			uf: newLead.uf || "",
			cidade: newLead.cidade || "",
		},
		ganho: {},
		perda: {},
		instalacao: {},
		autor: {
			id: newLeadReceiver.id,
			nome: newLeadReceiver.nome,
			avatar_url: newLeadReceiver.avatar_url,
		},
		idMarketing: "INTEGRAÇÃO",
		dataExclusao: null,
		dataInsercao: new Date().toISOString(),
	};
	const insertOpportunityResponse = await opportunitiesCollection.insertOne(opportunityToInsert);
	if (!insertOpportunityResponse.acknowledged) {
		console.error("Error inserting opportunity");
		throw new createHttpError.InternalServerError("Oops, um erro desconhecido ocorreu ao criar a indicação.");
	}
	const insertedOpportunityId = insertOpportunityResponse.insertedId.toString();

	console.log("[generate-lead] Opportunity created", {
		insertedId: insertedOpportunityId,
		insertedIdentifier: newIdentifier,
	});
	const funnelReferenceToInsert: TFunnelReference = {
		idParceiro: "65454ba15cf3e3ecf534b308",
		idOportunidade: insertedOpportunityId,
		idFunil: "661eaeb6c387dfeddd9a23c9",
		idEstagioFunil: "1",
		estagios: {
			"1": { entrada: new Date().toISOString() },
		},
		dataInsercao: new Date().toISOString(),
	};
	await funnelReferencesCollection.insertOne(funnelReferenceToInsert);

	// Handling Novu notifications
	await createNovuTopicAndSubscribeResponsibles({
		opportunityId: insertedOpportunityId,
		opportunityName: newLead.nome,
		opportunityIdentifier: newIdentifier,
		opportunityResponsibles,
		author: {
			nome: "INTEGRAÇÃO",
			avatar_url:
				"https://firebasestorage.googleapis.com/v0/b/sistemaampere.appspot.com/o/usuarios%2Favatar-ampere.png?alt=media&token=de5f3573-c293-43bd-8209-4dc0d1304b2a",
		},
	});
	const whatsappRedirectMessage = formatWhatsappRedirectMessage({
		receiverPhoneNumber: newLeadReceiver.telefone ?? undefined,
		opportunityName: newLead.nome,
		opportunityIdentifier: newIdentifier,
		opportunityEnergyBillValue: newLead.valorFaturaEnergia || "Não informado",
	});
	return { data: { insertedId: insertedOpportunityId, whatsappRedirectMessage }, message: "Lead gerado com sucesso" };
}

type GetNewLeadReceiverParams = {
	opportunitiesCollection: Collection<TOpportunity>;
	usersCollection: Collection<TUser>;
};
async function getNewLeadReceiver({ opportunitiesCollection, usersCollection }: GetNewLeadReceiverParams) {
	try {
		const leadReceivers = await usersCollection.find({ "permissoes.integracoes.receberLeads": true }).toArray();

		const opportunitiesFromLeads = await opportunitiesCollection
			.find({ idMarketing: { $ne: null } })
			.sort({ dataInsercao: -1 })
			.limit(1)
			.toArray();
		0;
		const lastOpportunityFromLeads = opportunitiesFromLeads[0];

		const lastReceiverId = lastOpportunityFromLeads.autor.id;

		// Using the list of lead receives to find the index of the last one
		const lastReceiverIndex = leadReceivers.findIndex((r) => r._id.toString() === lastReceiverId) || 0;
		// Increment the index and if it's greater than the length of the list, reset to 0
		const newReceiverIndex = lastReceiverIndex + 1 === leadReceivers.length ? 0 : lastReceiverIndex + 1;
		// Getting the information about the new receiver
		const newReceiverUser = leadReceivers[newReceiverIndex];

		return {
			id: newReceiverUser._id.toString(),
			idParceiro: newReceiverUser.idParceiro,
			nome: newReceiverUser.nome,
			telefone: newReceiverUser.telefone,
			avatar_url: newReceiverUser.avatar_url,
		};
	} catch (error) {
		console.log("[ERROR] [generate-lead] Error getting new lead receiver", error);
		throw error;
	}
}

export default apiHandler({
	GET: async (req, res) => {
		const newLead = NewLeadQueryInputSchema.parse(req.query);
		const leadGenerationResponse = await handleLeadGeneration(newLead);
		return res.status(200).json(leadGenerationResponse);
	},
	POST: async (req, res) => {
		const newLead = NewLeadQueryInputSchema.parse(req.body);
		const leadGenerationResponse = await handleLeadGeneration(newLead);
		return res.status(200).json(leadGenerationResponse);
	},
});

export function formatPhoneNumberForWhatsapp(phoneNumber: string, prefix = "55") {
	// This function should transform number such as (34) 99662-6855 into 5534996626855
	return `${prefix}${phoneNumber.replace(/\D/g, "")}`;
}

type TFormatWhatsappRedirectMessageParams = {
	receiverPhoneNumber?: string;
	opportunityName: string;
	opportunityIdentifier: string;
	opportunityEnergyBillValue: string;
};
function formatWhatsappRedirectMessage({
	receiverPhoneNumber = "(34) 3700-7001",
	opportunityName,
	opportunityIdentifier,
	opportunityEnergyBillValue,
}: TFormatWhatsappRedirectMessageParams) {
	const message = `Olá! 👋

Me chamo ${opportunityName} e estou interessado(a) em saber mais sobre energia solar ☀️

📋 Meu atendimento é o ${opportunityIdentifier}
💰 Valor da fatura de energia: ${opportunityEnergyBillValue}

Aguardo seu contato! 🙏`;

	const formattedPhoneNumber = formatPhoneNumberForWhatsapp(receiverPhoneNumber);
	console.log("[GENERATE-LEAD] Sending lead in formatted phone number", formattedPhoneNumber);
	return `https://api.whatsapp.com/send?phone=${formattedPhoneNumber}&text=${encodeURIComponent(message.trim())}`;
}
