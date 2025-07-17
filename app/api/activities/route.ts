import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { NextResponse, type NextRequest } from "next/server";
import { CreateActivityInput, GetActivitiesQueryParams, UpdateActivityInput } from "./inputs";
import type { z } from "zod";
import createHttpError from "http-errors";
import { type Collection, type Filter, ObjectId } from "mongodb";
import { InsertActivitySchema, type TActivityDTO, type TActivity } from "@/utils/schemas/activities.schema";
import type { TNotification } from "@/utils/schemas/notification.schema";
import {
	getActivitiesByHomologationId,
	getActivitiesByOpportunityId,
	getActivitiesByPurchaseId,
	getActivitiesByResponsibleId,
	getActivitiesByTechnicalAnalysisId,
	getActivityById,
	getAllActivities,
} from "@/repositories/acitivities/queries";
import { insertActivity, updateActivity } from "@/repositories/acitivities/mutations";

async function getActivities(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const parterScope = user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TActivity> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const searchParams = request.nextUrl.searchParams;
	console.log(searchParams);
	const queryParams = GetActivitiesQueryParams.parse({
		opportunityId: searchParams.get("opportunityId"),
		homologationId: searchParams.get("homologationId"),
		technicalAnalysisId: searchParams.get("technicalAnalysisId"),
		purchaseId: searchParams.get("purchaseId"),
		responsibleId: searchParams.get("responsibleId"),
		openOnly: searchParams.get("openOnly"),
		dueOnly: searchParams.get("dueOnly"),
	});

	const { opportunityId, homologationId, technicalAnalysisId, purchaseId, responsibleId, openOnly, dueOnly } = queryParams;

	// Specifing queries
	const queryOpenOnly: Filter<TActivity> = openOnly === "true" ? { dataConclusao: null } : {};
	const queryDueOnly: Filter<TActivity> = dueOnly === "true" ? { dataVencimento: { $ne: null } } : {};

	// Final query
	const query: Filter<TActivity> = {
		...queryOpenOnly,
		...queryDueOnly,
	};

	const db = await connectToDatabase();
	const collection: Collection<TActivity> = db.collection("activities");

	let activities: TActivityDTO[];

	if (opportunityId) {
		if (!ObjectId.isValid(opportunityId)) throw new createHttpError.BadRequest("ID de oportunidade inválido.");
		activities = await getActivitiesByOpportunityId({ collection, opportunityId, query });
	} else if (homologationId) {
		if (!ObjectId.isValid(homologationId)) throw new createHttpError.BadRequest("ID de homologação inválido.");
		activities = await getActivitiesByHomologationId({ collection, homologationId, query });
	} else if (technicalAnalysisId) {
		if (!ObjectId.isValid(technicalAnalysisId)) throw new createHttpError.BadRequest("ID de análise técnica inválido.");
		activities = await getActivitiesByTechnicalAnalysisId({ collection, technicalAnalysisId, query });
	} else if (purchaseId) {
		if (!ObjectId.isValid(purchaseId)) throw new createHttpError.BadRequest("ID de registro de compra inválido.");
		activities = await getActivitiesByPurchaseId({ collection, purchaseId, query });
	} else if (responsibleId) {
		if (!ObjectId.isValid(responsibleId)) throw new createHttpError.BadRequest("ID de responsável inválido.");
		activities = await getActivitiesByResponsibleId({ collection, responsibleId, query });
	} else {
		activities = await getAllActivities({ collection, query });
	}

	return NextResponse.json({
		data: {
			default: !opportunityId && !homologationId && !technicalAnalysisId && !purchaseId && !responsibleId ? activities : undefined,
			byOpportunityId: opportunityId ? activities : undefined,
			byHomologationId: homologationId ? activities : undefined,
			byTechnicalAnalysisId: technicalAnalysisId ? activities : undefined,
			byPurchaseId: purchaseId ? activities : undefined,
			byResponsibleId: responsibleId ? activities : undefined,
		},
		message: "Atividades encontradas com sucesso",
	});
}

export type TGetActivitiesRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getActivities>>>;
export type TGetActivitiesRouteOutputDataDefault = Exclude<TGetActivitiesRouteOutput["data"]["default"], undefined>;
export type TGetActivitiesRouteOutputDataByOpportunityId = TGetActivitiesRouteOutput["data"]["byOpportunityId"];
export type TGetActivitiesRouteOutputDataByHomologationId = TGetActivitiesRouteOutput["data"]["byHomologationId"];
export type TGetActivitiesRouteOutputDataByTechnicalAnalysisId = TGetActivitiesRouteOutput["data"]["byTechnicalAnalysisId"];
export type TGetActivitiesRouteOutputDataByPurchaseId = TGetActivitiesRouteOutput["data"]["byPurchaseId"];
export type TGetActivitiesRouteOutputDataByResponsibleId = TGetActivitiesRouteOutput["data"]["byResponsibleId"];

export const GET = apiHandler({ GET: getActivities });

export type TCreateActivityRouteInput = z.infer<typeof InsertActivitySchema>;
async function createActivity(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();

	const payload = await request.json();
	const activity = InsertActivitySchema.parse(payload);

	const db = await connectToDatabase();
	const collection: Collection<TActivity> = db.collection("activities");

	const insertResponse = await insertActivity({ collection, info: activity });
	if (!insertResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar atividade.");
	}

	const insertedId = insertResponse.insertedId.toString();

	return NextResponse.json({
		data: {
			insertedId,
		},
		message: "Atividade criada com sucesso!",
	});
}

export type TCreateActivityRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof createActivity>>>;
export const POST = apiHandler({ POST: createActivity });

export type TUpdateActivityRouteInput = z.infer<typeof UpdateActivityInput>;
async function updateActivityHandler(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();

	const partnerId = user.idParceiro;
	const parterScope = user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TActivity> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const searchParams = request.nextUrl.searchParams;
	const id = searchParams.get("id");

	if (!id || !ObjectId.isValid(id)) {
		throw new createHttpError.BadRequest("ID inválido.");
	}

	const payload = await request.json();
	const changes = UpdateActivityInput.parse(payload);

	const db = await connectToDatabase();
	const collection: Collection<TActivity> = db.collection("activities");
	const notificationsCollection: Collection<TNotification> = db.collection("notifications");

	const updateResponse = await updateActivity({
		activityId: id,
		collection,
		changes,
		query: partnerQuery,
	});

	if (!updateResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao atualizar atividade.");
	}

	if (updateResponse.matchedCount === 0) {
		throw new createHttpError.NotFound("Atividade não encontrada.");
	}

	// Validating need to generate an notification in activity conclusion
	if (changes.dataConclusao) {
		const activity = await getActivityById({ collection, id, query: {} });
		if (!activity) throw new createHttpError.NotFound("Atividade não encontrada.");

		// Validating if activity was concluded by someone else than the author
		const { autor } = activity;
		if (user.id !== autor.id) {
			// If so, then, notifying the author about the activity conclusion
			const newNotification: TNotification = {
				remetente: { id: null, nome: "SISTEMA" },
				idParceiro: partnerId,
				destinatarios: [{ id: autor.id, nome: autor.nome, avatar_url: autor.avatar_url }],
				oportunidade: {
					id: activity.oportunidade.id?.toString(),
					nome: activity.oportunidade.nome,
					identificador: null,
				},
				mensagem: `A atividade que você criou (${activity.titulo}) foi concluída por ${user.nome}.`,
				recebimentos: [],
				dataInsercao: new Date().toISOString(),
			};
			await notificationsCollection.insertOne(newNotification);
		}
	}

	return NextResponse.json({
		data: {
			updated: true,
		},
		message: "Atividade atualizada com sucesso!",
	});
}

export type TUpdateActivityRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof updateActivityHandler>>>;
export const PUT = apiHandler({ PUT: updateActivityHandler });
