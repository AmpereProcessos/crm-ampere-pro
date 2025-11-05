import { insertClient } from "@/repositories/clients/mutations";
import { getExistentClientByProperties } from "@/repositories/clients/queries";
import { insertFunnelReference } from "@/repositories/funnel-references/mutations";
import { insertOpportunity } from "@/repositories/opportunities/mutations";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { novu } from "@/services/novu";
import { NOVU_WORKFLOW_IDS } from "@/services/novu/workflows";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { GeneralClientSchema, type TClient } from "@/utils/schemas/client.schema";
import { InsertFunnelReferenceSchema, type TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import { InsertOpportunitySchema, type TOpportunity } from "@/utils/schemas/opportunity.schema";
import createHttpError from "http-errors";
import { type Collection, ObjectId } from "mongodb";
import type { NextApiHandler } from "next";
import { z } from "zod";

type PostResponse = {
	data: {
		insertedClientId: string;
		insertedOpportunityId: string;
		insertedFunnelReferenceId: string;
	};
	message: string;
};

const CreateClientOpportunityAndFunnelReferencesSchema = z.object({
	clientId: z
		.string({
			required_error: "ID de referência do cliente para vinculação não fornecido.",
			invalid_type_error: "Tipo não válido para ID de referência do cliente para vinculação.",
		})
		.nullable(),
	client: GeneralClientSchema,
	opportunity: InsertOpportunitySchema,
	funnelReference: InsertFunnelReferenceSchema,
});

const createClientOpportunityAndFunnelReferences: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const hasGeneralClientScope = session.user.permissoes.clientes.criar && !session.user.permissoes.clientes.escopo;
	// Validating creation permissions
	const userHasClientCreationPermission = session.user.permissoes.clientes.criar;
	const userHasOpportunityCreationPermission = session.user.permissoes.oportunidades.criar;
	if (!userHasClientCreationPermission) throw new createHttpError.BadRequest("Usuário não possui permissão para criação de cliente.");
	if (!userHasOpportunityCreationPermission) throw new createHttpError.BadRequest("Usuário não possui permissão para criação de oportunidade.");

	const { clientId, client, opportunity, funnelReference } = CreateClientOpportunityAndFunnelReferencesSchema.parse(req.body);

	// Checking for filled phone number
	if (!client.telefonePrimario || client.telefonePrimario?.trim().length < 14) {
		throw new createHttpError.BadRequest("Telefone primário não informado.");
	}
	const db = await connectToDatabase();
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");
	const clientsCollection: Collection<TClient> = db.collection("clients");
	const funnelReferencesCollection: Collection<TFunnelReference> = db.collection("funnel-references");
	if (clientId) {
		console.log("[INFO] [CREATE_OPPORTUNITY_PERSONALIZED] Existing client provider.");
		// If there is a client ID, then the opportunity will be reference to an existing client, therefore, there is no need to create a new client
		if (typeof clientId !== "string" || !ObjectId.isValid(clientId)) throw new createHttpError.BadRequest("ID de cliente inválido.");

		const existingClient = await clientsCollection.findOne({
			_id: new ObjectId(clientId),
		});
		if (!existingClient) throw new createHttpError.BadRequest("Cliente não encontrado.");
		console.log("[INFO] [CREATE_OPPORTUNITY_PERSONALIZED] Existing client found.", {
			clientId: clientId,
			clientName: existingClient.nome,
			clientCpfCnpj: existingClient.cpfCnpj,
			clientPhoneNumber: existingClient.telefonePrimario,
			clientEmail: existingClient.email,
		});
		if (existingClient.restricao?.aplicavel)
			throw new createHttpError.BadRequest("Cliente foi restrito para novas negociações. Converse com seu responsável para mais informações.");

		// Creating opportunity with idCliente referencing the clientId provided
		const insertOpportunityResponse = await insertOpportunity({
			collection: opportunitiesCollection,
			info: {
				...opportunity,
				cliente: {
					nome: client.nome,
					cpfCnpj: client.cpfCnpj,
					telefonePrimario: client.telefonePrimario,
					email: client.email,
					canalAquisicao: client.canalAquisicao,
				},
				idCliente: clientId,
			},
			partnerId: partnerId || "",
		});
		if (!insertOpportunityResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar oportunidade.");
		const insertedOpportunityId = insertOpportunityResponse.insertedId.toString();
		console.log("CLIENTE EXISTENTE - ID DA OPORTUNIDADE", insertedOpportunityId);
		// Creating funnel reference referencing the inserted opportunity id
		const insertFunnelReferenceResponse = await insertFunnelReference({
			collection: funnelReferencesCollection,
			info: {
				...funnelReference,
				idOportunidade: insertedOpportunityId,
				estagios: {
					[`${funnelReference.idEstagioFunil}`]: {
						entrada: new Date().toISOString(),
					},
				},
			},
			partnerId: partnerId || "",
		});
		if (!insertFunnelReferenceResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar oportunidade.");
		const insertedFunnelReferenceId = insertFunnelReferenceResponse.insertedId.toString();
		console.log("CLIENTE EXISTENTE - ID DA REFERÊNCIA DE FUNIL", insertedOpportunityId);
		await createNovuTopicAndSubscribeResponsibles({
			opportunityId: insertedOpportunityId,
			opportunityName: opportunity.nome,
			opportunityIdentifier: insertOpportunityResponse.identifier,
			opportunityResponsibles: opportunity.responsaveis,
			author: {
				id: session.user.id,
				nome: session.user.nome,
				avatar_url: session.user.avatar_url ?? undefined,
			},
		});

		return res.status(200).json({
			data: {
				insertedClientId: clientId,
				insertedOpportunityId: insertedOpportunityId,
				insertedFunnelReferenceId: insertedFunnelReferenceId,
			},
			message: "Oportunidade criada com sucesso !",
		});
	}
	console.log("PASSOU PELO CAMINHO DE CRIAÇÃO DE NOVO CLIENTE");
	// In case there was not provided an client ID, then, creating client, opportunity and funnel reference in a row
	// Refering which inserted object id in the next one, so clientID to opportunity, and opportunityId to funnel reference

	// First, checking if client already existing in partner's client database
	const email = client.email || undefined;
	const cpfCnpj = client.cpfCnpj || undefined;
	const phoneNumber = client.telefonePrimario || undefined;
	const existingClientInDb = await getExistentClientByProperties({
		collection: clientsCollection,
		email,
		cpfCnpj,
		phoneNumber,
	});
	if (existingClientInDb) throw new createHttpError.BadRequest("Cliente já existente. Não é permitida a duplicação de clientes.");

	const insertClientResponse = await insertClient({
		collection: clientsCollection,
		info: client,
		partnerId: partnerId || "",
	});
	if (!insertClientResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar cliente.");
	const insertedClientId = insertClientResponse.insertedId.toString();
	console.log("ID DO CLIENTE", insertedClientId);
	const insertOpportunityResponse = await insertOpportunity({
		collection: opportunitiesCollection,
		info: {
			...opportunity,
			cliente: {
				nome: client.nome,
				cpfCnpj: client.cpfCnpj,
				telefonePrimario: client.telefonePrimario,
				email: client.email,
				canalAquisicao: client.canalAquisicao,
			},
			idCliente: insertedClientId,
		},
		partnerId: partnerId || "",
	});
	if (!insertOpportunityResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar oportunidade.");
	const insertedOpportunityId = insertOpportunityResponse.insertedId.toString();
	console.log("ID DA OPORTUNIDADE", insertedOpportunityId);
	const insertFunnelReferenceResponse = await insertFunnelReference({
		collection: funnelReferencesCollection,
		info: {
			...funnelReference,
			idOportunidade: insertedOpportunityId,
			estagios: {
				[`${funnelReference.idEstagioFunil}`]: {
					entrada: new Date().toISOString(),
				},
			},
		},
		partnerId: partnerId || "",
	});
	if (!insertFunnelReferenceResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar oportunidade.");
	const insertedFunnelReferenceId = insertFunnelReferenceResponse.insertedId.toString();
	// Creating Novu topic for the opportunity and adding the responsibles as subscribers

	await createNovuTopicAndSubscribeResponsibles({
		opportunityId: insertedOpportunityId,
		opportunityName: opportunity.nome,
		opportunityIdentifier: insertOpportunityResponse.identifier,
		opportunityResponsibles: opportunity.responsaveis,
		author: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
	});
	return res.status(201).json({
		data: {
			insertedClientId,
			insertedOpportunityId,
			insertedFunnelReferenceId,
		},
		message: "Oportunidade criada com sucesso !",
	});
};

export default apiHandler({ POST: createClientOpportunityAndFunnelReferences });

type CreateNovuTopicAndSubscribeResponsiblesProps = {
	opportunityId: string;
	opportunityName: string;
	opportunityIdentifier: string;
	opportunityResponsibles: Pick<TOpportunity["responsaveis"][number], "id">[];
	author: {
		id?: string;
		nome: string;
		avatar_url?: string | null;
	};
};
export async function createNovuTopicAndSubscribeResponsibles({
	opportunityId,
	opportunityName,
	opportunityIdentifier,
	opportunityResponsibles,
	author,
}: CreateNovuTopicAndSubscribeResponsiblesProps) {
	try {
		console.log("[NOVU] - running NOVU API calls");
		const novuTopicKey = `opportunity:${opportunityId}`;
		const novuTopicCreationResponse = await novu.topics.create({
			key: novuTopicKey,
			name: `${opportunityIdentifier} - ${opportunityName}`,
		});
		console.log("[NOVU] - topic creation response", novuTopicCreationResponse.result);
		const novuTopicSubscriptionResponse = await novu.topics.subscriptions.create(
			{
				subscriberIds: opportunityResponsibles.map((r) => r.id),
			},
			novuTopicKey,
		);
		console.log("[NOVU] - topic subscription response", novuTopicSubscriptionResponse.result);
		// Notifying users other than the author that they have a new opportunity to attend
		const novuTriggerBulkResponse = await novu.trigger({
			to: {
				type: "Topic",
				topicKey: novuTopicKey,
			},
			workflowId: NOVU_WORKFLOW_IDS.NOTIFY_NEW_OPPORTUNITY_TO_RESPONSIBLES,
			payload: {
				autor: {
					nome: author.nome,
					avatar_url: author.avatar_url,
				},
				oportunidade: {
					id: opportunityId,
					identificador: opportunityIdentifier,
					nome: opportunityName,
				},
			},
			actor: author.id
				? {
						subscriberId: author.id,
						firstName: author.nome,
						avatar: author.avatar_url || undefined,
					}
				: undefined,
		});
		console.log("[NOVU] - bulk trigger response", novuTriggerBulkResponse.result);
		return null;
	} catch (error) {
		console.log("[NOVU] - error", error);
		return null;
	}
}
