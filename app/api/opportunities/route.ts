import createHttpError from "http-errors";
import { type Collection, type Filter, ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { start } from "workflow/api";
import { z } from "zod";
import { apiHandler } from "@/lib/api";
import { getValidCurrentSessionUncached, type TUserSession } from "@/lib/auth/session";
import { runOpportunityLossAutomation } from "@/lib/automations";
import { insertClient } from "@/repositories/clients/mutations";
import { getExistentClientByProperties } from "@/repositories/clients/queries";
import { insertFunnelReference } from "@/repositories/funnel-references/mutations";
import { insertOpportunity, updateOpportunity } from "@/repositories/opportunities/mutations";
import { getOpportunityById } from "@/repositories/opportunities/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { novu } from "@/services/novu";
import { NOVU_WORKFLOW_IDS } from "@/services/novu/workflows";
import { INDICATION_OPPORTUNITY_WIN_CREDITS_PERCENTAGE } from "@/utils/constants";
import type { TAutomationConfiguration } from "@/utils/schemas/automations.schema";
import type { TConectaIndication } from "@/utils/schemas/conecta-indication.schema";
import { InsertFunnelReferenceSchema, type TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import { InsertOpportunitySchema, type TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TProposal } from "@/utils/schemas/proposal.schema";
import { GeneralClientSchema, type TClient } from "../../../utils/schemas/client.schema";

const CreateOpportunityInputSchema = z.object({
	clientId: z
		.string({
			required_error: "ID de referência do cliente para vinculação não fornecido.",
			invalid_type_error: "Tipo não válido para ID de referência do cliente para vinculação.",
		})
		.nullable(),
	client: GeneralClientSchema.refine(
		(data) => {
			if (!data.telefonePrimario || data.telefonePrimario?.trim().length < 14) {
				throw new Error("Telefone primário não informado.");
			}
			return data;
		},
		{
			message: "Telefone primário não informado.",
		},
	),
	opportunity: InsertOpportunitySchema,
	funnelReference: InsertFunnelReferenceSchema,
});
export type TCreateOpportunityInput = z.infer<typeof CreateOpportunityInputSchema>;

async function createOpportunity({ input, session }: { input: TCreateOpportunityInput; session: TUserSession }) {
	if (session.user.permissoes.oportunidades.criar) {
		throw new createHttpError.Unauthorized("Você não possui permissão para criar oportunidades.");
	}
	const { clientId: payloadClientId, client: payloadClient, opportunity: payloadOpportunity, funnelReference: payloadFunnelReference } = input;

	const db = await connectToDatabase();
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");
	const clientsCollection: Collection<TClient> = db.collection("clients");
	const funnelReferencesCollection: Collection<TFunnelReference> = db.collection("funnel-references");

	let resolvedClientId = payloadClientId;
	if (!resolvedClientId) {
		const email = payloadClient.email || undefined;
		const cpfCnpj = payloadClient.cpfCnpj || undefined;
		const phoneNumber = payloadClient.telefonePrimario || undefined;
		const existingClientInDb = await getExistentClientByProperties({
			collection: clientsCollection,
			email,
			cpfCnpj,
			phoneNumber,
		});
		if (existingClientInDb) throw new createHttpError.BadRequest("Cliente já existente. Não é permitida a duplicação de clientes.");

		const insertClientResponse = await insertClient({
			collection: clientsCollection,
			info: payloadClient,
			partnerId: session.user.idParceiro || "",
		});

		if (!insertClientResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar cliente.");
		resolvedClientId = insertClientResponse.insertedId.toString();
	}

	// Now, checking for ongoing opportunities with the same client and project type
	const ongoingOpportunity = await opportunitiesCollection.findOne({
		idParceiro: session.user.idParceiro,
		idCliente: resolvedClientId,
		"tipo.id": payloadOpportunity.tipo.id,
		$and: [{ $or: [{ "perda.data": { $exists: false } }, { "perda.data": null }] }, { $or: [{ "ganho.data": { $exists: false } }, { "ganho.data": null }] }],
	});
	if (ongoingOpportunity) {
		return {
			success: false,
			message: "Já existe uma oportunidade em andamento para este cliente e tipo de projeto.",
			data: {
				code: "ONGOING_OPPORTUNITY_EXISTS" as const,
				client: {
					id: ongoingOpportunity.idCliente,
					nome: ongoingOpportunity.cliente.nome,
					cpfCnpj: ongoingOpportunity.cliente.cpfCnpj || null,
					telefonePrimario: ongoingOpportunity.cliente.telefonePrimario,
					email: ongoingOpportunity.cliente.email || "",
				},
				opportunity: {
					id: ongoingOpportunity._id.toString(),
					identificador: ongoingOpportunity.identificador,
					nome: ongoingOpportunity.nome,
					tipoId: ongoingOpportunity.tipo.id,
					responsaveis: ongoingOpportunity,
				},
			},
		};
	}

	// If everything is ok, creating the opportunity
	// Creating opportunity with idCliente referencing the clientId provided
	const insertOpportunityResponse = await insertOpportunity({
		collection: opportunitiesCollection,
		info: {
			...payloadOpportunity,
			cliente: {
				nome: payloadClient.nome,
				cpfCnpj: payloadClient.cpfCnpj,
				telefonePrimario: payloadClient.telefonePrimario,
				email: payloadClient.email,
				canalAquisicao: payloadClient.canalAquisicao,
			},
			idCliente: resolvedClientId,
		} as TOpportunity,
		partnerId: session.user.idParceiro || "",
	});
	if (!insertOpportunityResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar oportunidade.");
	const insertedOpportunityId = insertOpportunityResponse.insertedId.toString();
	console.log("CLIENTE EXISTENTE - ID DA OPORTUNIDADE", insertedOpportunityId);
	// Creating funnel reference referencing the inserted opportunity id
	const insertFunnelReferenceResponse = await insertFunnelReference({
		collection: funnelReferencesCollection,
		info: {
			...payloadFunnelReference,
			idOportunidade: insertedOpportunityId,
			estagios: {
				[`${payloadFunnelReference.idEstagioFunil}`]: {
					entrada: new Date().toISOString(),
				},
			},
		},
		partnerId: session.user.idParceiro || "",
	});
	if (!insertFunnelReferenceResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar oportunidade.");
	const insertedFunnelReferenceId = insertFunnelReferenceResponse.insertedId.toString();
	console.log("CLIENTE EXISTENTE - ID DA REFERÊNCIA DE FUNIL", insertedOpportunityId);
	await createNovuTopicAndSubscribeResponsibles({
		opportunityId: insertedOpportunityId,
		opportunityName: payloadOpportunity.nome,
		opportunityIdentifier: insertOpportunityResponse.identifier,
		opportunityResponsibles: payloadOpportunity.responsaveis,
		author: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url ?? undefined,
		},
	});

	return {
		data: {
			clientId: resolvedClientId,
			insertedOpportunityId,
			insertedFunnelReferenceId,
		},
		message: "Oportunidade criada com sucesso.",
	};
}
export type TCreateOpportunityOutput = Awaited<ReturnType<typeof createOpportunity>>;

async function createOpportunityHandler(request: NextRequest) {
	const session = await getValidCurrentSessionUncached();
	const input = CreateOpportunityInputSchema.parse(await request.json());
	const result = await createOpportunity({ input, session });
	return NextResponse.json(result);
}
export const POST = apiHandler({ POST: createOpportunityHandler });
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
async function createNovuTopicAndSubscribeResponsibles({
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

const GetOpportunitiesInputSchema = z.object({
	id: z.string().refine((id) => ObjectId.isValid(id), {
		message: "ID inválido.",
	}),
});
export type TGetOpportunitiesInput = z.infer<typeof GetOpportunitiesInputSchema>;
async function getOpportunities({ input }: { input: TGetOpportunitiesInput; session: TUserSession }) {
	console.log("[INFO] [GET OPPORTUNITIES] - Getting opportunity by ID", input.id);
	const { id } = input;
	const db = await connectToDatabase();
	const opportunitiesCollection = db.collection<TOpportunity>("opportunities");
	const opportunity = await getOpportunityById({ collection: opportunitiesCollection, id, query: {} });
	if (!opportunity) {
		throw new createHttpError.NotFound("Oportunidade não encontrada.");
	}
	return {
		data: opportunity,
		message: "Oportunidade encontrada com sucesso.",
	};
}
export type TGetOpportunitiesOutput = Awaited<ReturnType<typeof getOpportunities>>;

async function getOpportunitiesHandler(request: NextRequest) {
	const session = await getValidCurrentSessionUncached();
	const searchParams = request.nextUrl.searchParams;
	const id = searchParams.get("id");
	const input = GetOpportunitiesInputSchema.parse({ id });
	const result = await getOpportunities({ input, session });
	return NextResponse.json(result);
}
export const GET = apiHandler({ GET: getOpportunitiesHandler });

const EditOpportunitiesInputSchema = z.object({
	id: z.string().refine((id) => ObjectId.isValid(id), {
		message: "ID inválido.",
	}),
	changes: z.record(z.string(), z.any()),
});
export type TEditOpportunitiesInput = z.infer<typeof EditOpportunitiesInputSchema>;
async function editOpportunities({ input, session }: { input: TEditOpportunitiesInput; session: TUserSession }) {
	console.log("[INFO] [EDIT OPPORTUNITIES] - Editing opportunity", {
		id: input.id,
		changes: input.changes,
	});
	if (!session.user.permissoes.oportunidades.editar) {
		throw new createHttpError.Unauthorized("Você não possui permissão para alterar informações dessa oportunidade.");
	}
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TOpportunity> = {
		idParceiro: parterScope ? { $in: parterScope } : { $ne: undefined },
	};

	const userId = session.user.id;
	const userScope = session.user.permissoes.oportunidades.escopo;

	const db = await connectToDatabase();
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");
	const proposalsCollection: Collection<TProposal> = db.collection("proposals");
	const clientsCollection: Collection<TClient> = db.collection("clients");
	const conectaIndicationsCollection: Collection<TConectaIndication> = db.collection("conecta-indications");
	const automationsCollection: Collection<TAutomationConfiguration> = db.collection("automations");

	const previousOpportunity = await getOpportunityById({
		collection: opportunitiesCollection,
		id: input.id,
		query: partnerQuery,
	});
	if (!previousOpportunity) throw new createHttpError.NotFound("Oportunidade não encontrada.");

	// Validating if user either: has global opportunity scope, its one of the opportunity responsibles or has one of the opportunity responsibles within his scope
	const hasEditAuthorizationForOpportunity =
		!userScope || previousOpportunity.responsaveis.some((opResp) => opResp.id === userId || userScope.includes(opResp.id));
	if (!hasEditAuthorizationForOpportunity) throw new createHttpError.Unauthorized("Você não possui permissão para alterar informações dessa oportunidade.");

	if (input.changes["tipo.id"] || input.changes?.tipo?.id) {
		console.log("Attemp to change opportunity type", input.changes["tipo.id"], input.changes?.tipo?.id);
		console.log(`New: ${input.changes["tipo.id"] || input.changes?.tipo.id} - Previous: ${previousOpportunity.tipo.id}`);
		if (input.changes["tipo.id"] !== previousOpportunity.tipo.id || input.changes.tipo?.id !== previousOpportunity.tipo.id) {
			// In case update attemps to change the opportunity type, checking if type update is allowed
			const opportunityProposals = await proposalsCollection.find({ "oportunidade.id": input.id }, { projection: { _id: 1 } }).toArray();
			// In case there are proposals linked to the opportunity, type update is not allowed
			if (opportunityProposals.length > 0)
				throw new createHttpError.BadRequest("Não é possível alterar o tipo de oportunidade, pois já existem propostas vinculadas a ela.");
		}
	}
	const updateResponse = await updateOpportunity({
		id: input.id,
		collection: opportunitiesCollection,
		changes: input.changes,
		query: partnerQuery,
	});

	const updatedOpportunity = await getOpportunityById({
		collection: opportunitiesCollection,
		id: input.id,
		query: partnerQuery,
	});

	if (previousOpportunity.idIndicacao) {
		// In case opportunity came from indication, checking for possible integration updates
		if (!updatedOpportunity) throw new createHttpError.NotFound("Oportunidade não encontrada.");
		// In case opportunity wasnt lost, but changes update this status, updating the indication
		if (!previousOpportunity.perda.data && !!updatedOpportunity.perda?.data) {
			console.log(`ADD LOSS - OPPORTUNITY OF ID ${previousOpportunity._id.toString()} UPDATE TO INDICATION ${previousOpportunity.idIndicacao}`);

			await conectaIndicationsCollection.updateOne(
				{ _id: new ObjectId(previousOpportunity.idIndicacao) },
				{ $set: { "oportunidade.dataPerda": updatedOpportunity.perda?.data } },
			);
		}
		// In case opportunity was lost, but changes update this status, updating the indication
		if (!!previousOpportunity.perda.data && !updatedOpportunity.perda?.data) {
			console.log(`REMOVE LOSS - OPPORTUNITY OF ID ${previousOpportunity._id.toString()} UPDATE TO INDICATION ${previousOpportunity.idIndicacao}`);

			await conectaIndicationsCollection.updateOne({ _id: new ObjectId(previousOpportunity.idIndicacao) }, { $set: { "oportunidade.dataPerda": null } });
		}

		// In case opportunity wasnt won, but changes update this status, updating the indication
		if (!previousOpportunity.ganho.data && !!updatedOpportunity.ganho?.data) {
			console.log(`ADD WIN - OPPORTUNITY OF ID ${previousOpportunity._id.toString()} UPDATE TO INDICATION ${previousOpportunity.idIndicacao}`);

			const winningProposalId = updatedOpportunity.ganho?.idProposta;
			if (!winningProposalId) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na atualização da oportunidade.");
			const winningProposal = await proposalsCollection.findOne({
				_id: new ObjectId(winningProposalId),
			});
			if (!winningProposal) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na atualização da oportunidade.");

			const addIndicationCredits = Math.ceil(winningProposal.valor * INDICATION_OPPORTUNITY_WIN_CREDITS_PERCENTAGE);

			await conectaIndicationsCollection.updateOne(
				{ _id: new ObjectId(previousOpportunity.idIndicacao) },
				{
					$set: {
						"oportunidade.dataGanho": updatedOpportunity.ganho?.data,
						creditosRecebidos: addIndicationCredits,
					},
				},
			);
			await clientsCollection.updateOne({ _id: new ObjectId(updatedOpportunity.idCliente) }, { $inc: { "conecta.creditos": addIndicationCredits } });
		}
		// In case opportunity was won, but changes update this status, updating the indication
		if (previousOpportunity.ganho.data && !updatedOpportunity.ganho?.data) {
			console.log(`REMOVE WIN - OPPORTUNITY OF ID ${previousOpportunity._id.toString()} UPDATE TO INDICATION ${previousOpportunity.idIndicacao}`);

			await conectaIndicationsCollection.updateOne(
				{ _id: new ObjectId(previousOpportunity.idIndicacao) },
				{ $set: { "oportunidade.dataGanho": null, creditosRecebidos: 0 } },
			);
		}
	}

	if (previousOpportunity.idPropostaAtiva !== updatedOpportunity.idPropostaAtiva) {
		const newActiveProposalId = updatedOpportunity.idPropostaAtiva;
		if (!newActiveProposalId) {
			// We gotta clean up the opportunity proposal fields
			await opportunitiesCollection.updateOne({ _id: new ObjectId(input.id) }, { $set: { proposta: null } });
		} else {
			const newActiveProposal = await proposalsCollection.findOne({
				_id: new ObjectId(newActiveProposalId),
			});
			if (!newActiveProposal) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na atualização da oportunidade.");
			await opportunitiesCollection.updateOne(
				{ _id: new ObjectId(input.id) },
				{
					$set: {
						"proposta.nome": newActiveProposal.nome,
						"proposta.valor": newActiveProposal.valor,
						"proposta.potenciaPico": newActiveProposal.potenciaPico,
						"proposta.urlArquivo": newActiveProposal.urlArquivo,
					},
				},
			);
		}
	}
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na atualização da oportunidade.");

	// Checking for possible automation to run
	if (updatedOpportunity.automacoesHabilitadas) {
		if (!previousOpportunity.perda.data && !!updatedOpportunity.perda.data) {
			const automations = await automationsCollection.find({ "gatilho.tipo": "OPORTUNIDADE-PERDA" }).toArray();
			const automationsPromises = automations.map(async (automation) => {
				console.log(`Running automation ${automation.titulo} for opportunity ${updatedOpportunity._id.toString()}`);
				console.log("Workflow", runOpportunityLossAutomation);
				await start(runOpportunityLossAutomation, [
					{ ...updatedOpportunity, _id: updatedOpportunity._id.toString() },
					{ ...automation, _id: automation._id.toString() },
				]);
				return;
			});
			await Promise.all(automationsPromises);
		}
	}

	return {
		data: "Oportunidade alterada com sucesso !",
		message: "Oportunidade alterada com sucesso !",
	};
}
export type TEditOpportunitiesOutput = Awaited<ReturnType<typeof editOpportunities>>;

async function editOpportunitiesHandler(request: NextRequest) {
	const session = await getValidCurrentSessionUncached();
	const input = EditOpportunitiesInputSchema.parse(await request.json());
	const result = await editOpportunities({ input, session });
	return NextResponse.json(result);
}
export const PUT = apiHandler({ PUT: editOpportunitiesHandler });
