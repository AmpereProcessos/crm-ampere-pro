import {  fetchMetaLeadData } from "@/lib/leads";
import { parseLeadWithAI, transformToClient, buildOpportunityDescription,  } from "@/lib/leads/ai-parser";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import type { TUser } from "@/utils/schemas/user.schema";
import type { NextApiHandler } from "next";
import { Collection } from "mongodb";
import { formatPhoneAsBase } from "@/utils/methods";

type VerifyMetaHandlerResponse = string | { error: string };

const verifyMetaHandler: NextApiHandler<VerifyMetaHandlerResponse> = async (req, res) => {
	console.log("[META_WEBHOOK] [VERIFY] Query received:", req.query);
	const mode = req.query["hub.mode"];
	const token = req.query["hub.verify_token"];
	const challenge = req.query["hub.challenge"];

	if (mode && token) {
		if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
			console.log("[META_WEBHOOK] [VERIFY] Webhook verified successfully");
			return res.status(200).send(challenge as string);
		}

		console.log("[META_WEBHOOK] [VERIFY] Verification failed");
		return res.status(403).json({ error: "Verification failed" });
	}

	return res.status(400).json({ error: "Missing parameters" });
};

type TGetMetaLeadsHandlerResponse = {
	message: string;
	data?: {
		leadId: string;
		clientId: string;
		opportunityId: string;
		opportunityIdentifier: string;
	};
	error?: string;
};

async function getNewLeadReceiver(usersCollection: Collection<TUser>, opportunitiesCollection: Collection<TOpportunity>) {
	const leadReceivers = await usersCollection.find({ "permissoes.integracoes.receberLeads": true }).toArray();

	if (leadReceivers.length === 0) {
		throw new Error("No lead receivers configured");
	}

	const lastLeads = await opportunitiesCollection
		.find({ idMarketing: { $ne: null } })
		.sort({ dataInsercao: -1 })
		.limit(1)
		.toArray();

	const lastReceiverId = lastLeads[0]?.autor?.id;
	const lastIndex = lastReceiverId ? leadReceivers.findIndex((r) => r._id.toString() === lastReceiverId) : -1;

	const nextIndex = lastIndex + 1 >= leadReceivers.length ? 0 : lastIndex + 1;
	const receiver = leadReceivers[nextIndex];

	return {
		id: receiver._id.toString(),
		idParceiro: receiver.idParceiro,
		nome: receiver.nome,
		telefone: receiver.telefone,
		avatar_url: receiver.avatar_url,
	};
}

const getMetaLeadsHandler: NextApiHandler<TGetMetaLeadsHandlerResponse> = async (req, res) => {
	const payload = req.body;

	console.log("[META_WEBHOOK] [POST] Webhook received");

	const db = await connectToDatabase();
	const metaLeadsRawCollection = db.collection("meta_leads_raw");
	const metaLeadsEnrichedCollection = db.collection("meta_leads_enriched");
	const clientsCollection = db.collection<TClient>("clients");
	const opportunitiesCollection = db.collection<TOpportunity>("opportunities");
	const funnelReferencesCollection = db.collection<TFunnelReference>("funnel-references");
	const usersCollection = db.collection<TUser>("users");

	// Store raw webhook
	await metaLeadsRawCollection.insertOne({
		...payload,
		receivedAt: new Date().toISOString(),
	});

	const leadgenId = payload.entry?.at(0)?.changes?.at(0)?.value?.leadgen_id;

	if (!leadgenId) {
		console.warn("[META_WEBHOOK] No leadgen_id found");
		return res.status(200).json({
			message: "Webhook received but no leadgen_id found",
		});
	}

	const accessToken = process.env.META_SYSTEM_USER_TOKEN;
	if (!accessToken) {
		console.error("[META_WEBHOOK] Missing META_SYSTEM_USER_TOKEN");
		return res.status(500).json({
			message: "Server configuration error",
		});
	}

	try {
		// Fetch from Meta
		console.log("[META_WEBHOOK] Fetching lead data from Meta:", leadgenId);
		const leadData = await fetchMetaLeadData(leadgenId, accessToken);

		// Extract raw answers
		const rawAnswers = leadData.field_data.reduce<Record<string, string | undefined>>((acc, field) => {
			acc[field.name] = field.values?.at(0);
			return acc;
		}, {});

		// Parse with AI
		console.log("[META_WEBHOOK] Parsing with AI SDK");
		const aiParsed = await parseLeadWithAI(rawAnswers);

		if (aiParsed.confidence === "low") {
			console.warn("[META_WEBHOOK] Low confidence parsing:", aiParsed.warnings);
		}

		// Get lead receiver
		const receiver = await getNewLeadReceiver(usersCollection, opportunitiesCollection);

		// Check for existing client
		let clientId: string | null = null;
		const existingClient = await clientsCollection.findOne({
			telefonePrimarioBase: formatPhoneAsBase(aiParsed.client.telefonePrimario),
		});

		if (existingClient) {
			clientId = existingClient._id.toString();
			console.log("[META_WEBHOOK] Using existing client:", clientId);
		} else {
			// Create new client
			const newClient = transformToClient(aiParsed, {
				idParceiro: receiver.idParceiro,
				autor: {
					id: receiver.id,
					nome: receiver.nome,
					avatar_url: receiver.avatar_url ?? undefined,
				},
				canalAquisicao: "META_LEADS",
			});

			const inserted = await clientsCollection.insertOne(newClient as TClient);
			clientId = inserted.insertedId.toString();
			console.log("[META_WEBHOOK] New client created:", clientId);
		}

		// Generate opportunity identifier
		const lastOpp = await opportunitiesCollection.findOne({}, { sort: { _id: -1 }, projection: { identificador: 1 } });

		const lastNumber = lastOpp ? Number(lastOpp.identificador.split("-")[1]) : 0;
		const newIdentifier = `CRM-${lastNumber + 1}`;

		// Create opportunity
		const opportunityResponsibles = [
			{
				id: receiver.id,
				nome: receiver.nome,
				papel: "VENDEDOR",
				avatar_url: receiver.avatar_url,
				telefone: receiver.telefone,
				dataInsercao: new Date().toISOString(),
			},
		];

		const opportunity: TOpportunity = {
			nome: aiParsed.client.nome,
			idParceiro: receiver.idParceiro,
			tipo: {
				id: "6615785ddcb7a6e66ede9785",
				titulo: "SISTEMA FOTOVOLTAICO",
			},
			categoriaVenda: "KIT",
			descricao: buildOpportunityDescription(aiParsed),
			identificador: newIdentifier,
			responsaveis: opportunityResponsibles,
			segmento: aiParsed.opportunity.segmento,
			idCliente: clientId,
			cliente: {
				nome: aiParsed.client.nome,
				cpfCnpj: aiParsed.client.cpfCnpj || "",
				telefonePrimario: aiParsed.client.telefonePrimario,
				email: aiParsed.client.email || "",
				canalAquisicao: "META_LEADS",
			},
			localizacao: {
				uf: aiParsed.client.uf || "",
				cidade: aiParsed.client.cidade || "",
			},
			ganho: {},
			perda: {},
			instalacao: {},
			autor: {
				id: receiver.id,
				nome: receiver.nome,
				avatar_url: receiver.avatar_url,
			},
			idMarketing: leadgenId,
			dataExclusao: null,
			dataInsercao: new Date().toISOString(),
		};

		const inserted = await opportunitiesCollection.insertOne(opportunity);
		const opportunityId = inserted.insertedId.toString();

		// Store enriched lead
		await metaLeadsEnrichedCollection.insertOne({
			leadgen_id: leadgenId,
			created_time: leadData.created_time,
			idCliente: clientId,
			idOportunidade: opportunityId,
			aiParsed,
			processedAt: new Date().toISOString(),
		});

		// Create funnel reference
		await funnelReferencesCollection.insertOne({
			idParceiro: receiver.idParceiro,
			idOportunidade: opportunityId,
			idFunil: "661eaeb6c387dfeddd9a23c9",
			idEstagioFunil: "1",
			estagios: {
				"1": { entrada: new Date().toISOString() },
			},
			dataInsercao: new Date().toISOString(),
		});

		console.log("[META_WEBHOOK] Lead processed successfully:", {
			opportunityId,
			identifier: newIdentifier,
			confidence: aiParsed.confidence,
		});

		return res.status(200).json({
			message: "Lead processed successfully",
			data: {
				leadId: leadgenId,
				clientId,
				opportunityId,
				opportunityIdentifier: newIdentifier,
			},
		});
	} catch (error) {
		console.error("[META_WEBHOOK] Processing failed:", error);

		if (leadgenId) {
			await metaLeadsRawCollection.updateOne(
				{ "entry.0.changes.0.value.leadgen_id": leadgenId },
				{
					$set: {
						processingError: error instanceof Error ? error.message : String(error),
						erroredAt: new Date().toISOString(),
					},
				},
			);
		}

		return res.status(200).json({
			message: "Webhook received but processing failed",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

export default apiHandler({
	GET: verifyMetaHandler,
	POST: getMetaLeadsHandler,
});
