import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { NextResponse, type NextRequest } from "next/server";
import { GetNotificationsQueryParams } from "./inputs";
import type { z } from "zod";
import createHttpError from "http-errors";
import type { Collection } from "mongodb";
import { InsertNotificationSchema, type TNotification } from "@/utils/schemas/notification.schema";
import { getNotificationById, getNotificationByOpportunityId, getNotificationByRecipientId } from "@/repositories/notifications/queries";
import { insertNotification, updateNotification } from "@/repositories/notifications/mutations";
import { ObjectId } from "mongodb";

async function getNotifications(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();

	const searchParams = request.nextUrl.searchParams;
	const queryParams = GetNotificationsQueryParams.parse({
		id: searchParams.get("id"),
		recipientId: searchParams.get("recipientId"),
		opportunityId: searchParams.get("opportunityId"),
	});

	const { id, recipientId, opportunityId } = queryParams;

	const db = await connectToDatabase();
	const collection: Collection<TNotification> = db.collection("notifications");

	if (id) {
		if (!ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID de notificação inválido.");

		const notification = await getNotificationById({ collection, id });
		if (!notification) throw new createHttpError.NotFound("Notificação não encontrada.");

		return NextResponse.json({
			data: {
				default: undefined,
				byId: notification,
				byRecipientId: undefined,
				byOpportunityId: undefined,
			},
			message: "Notificação encontrada com sucesso",
		});
	}

	if (recipientId) {
		if (!ObjectId.isValid(recipientId)) throw new createHttpError.BadRequest("ID de destinatário inválido.");

		const notifications = await getNotificationByRecipientId({ collection, recipientId });

		return NextResponse.json({
			data: {
				default: undefined,
				byId: undefined,
				byRecipientId: notifications,
				byOpportunityId: undefined,
			},
			message: "Notificações encontradas com sucesso",
		});
	}

	if (opportunityId) {
		if (!ObjectId.isValid(opportunityId)) throw new createHttpError.BadRequest("ID de oportunidade inválido.");

		const notifications = await getNotificationByOpportunityId({ collection, opportunityId });

		return NextResponse.json({
			data: {
				default: undefined,
				byId: undefined,
				byRecipientId: undefined,
				byOpportunityId: notifications,
			},
			message: "Notificações encontradas com sucesso",
		});
	}

	return NextResponse.json({
		data: {
			default: [],
			byId: undefined,
			byRecipientId: undefined,
			byOpportunityId: undefined,
		},
		message: "Nenhum parâmetro de busca fornecido",
	});
}

export type TGetNotificationsRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getNotifications>>>;
export type TGetNotificationsRouteOutputDataDefault = Exclude<TGetNotificationsRouteOutput["data"]["default"], undefined>;
export type TGetNotificationsRouteOutputDataById = TGetNotificationsRouteOutput["data"]["byId"];
export type TGetNotificationsRouteOutputDataByRecipientId = TGetNotificationsRouteOutput["data"]["byRecipientId"];
export type TGetNotificationsRouteOutputDataByOpportunityId = TGetNotificationsRouteOutput["data"]["byOpportunityId"];

export const GET = apiHandler({ GET: getNotifications });

export type TCreateNotificationRouteInput = z.infer<typeof InsertNotificationSchema>;
async function createNotification(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const partnerId = user.idParceiro;

	const payload = await request.json();
	const notification = InsertNotificationSchema.parse(payload);

	const db = await connectToDatabase();
	const collection: Collection<TNotification> = db.collection("notifications");

	const insertResponse = await insertNotification({
		collection,
		info: notification,
		partnerId: partnerId || "",
	});

	if (!insertResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar notificação.");
	}

	return NextResponse.json({
		data: {
			insertedId: insertResponse.insertedId.toString(),
		},
		message: "Notificação criada com sucesso!",
	});
}

export type TCreateNotificationRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof createNotification>>>;
export const POST = apiHandler({ POST: createNotification });

export type TUpdateNotificationRouteInput = z.infer<typeof InsertNotificationSchema>;
async function updateNotificationHandler(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const partnerId = user.idParceiro;

	const searchParams = request.nextUrl.searchParams;
	const id = searchParams.get("id");

	if (!id || !ObjectId.isValid(id)) {
		throw new createHttpError.BadRequest("ID inválido.");
	}

	const payload = await request.json();
	const changes = InsertNotificationSchema.partial().parse(payload);

	const db = await connectToDatabase();
	const collection: Collection<TNotification> = db.collection("notifications");

	const updateResponse = await updateNotification({
		id,
		collection,
		info: changes,
		query: {},
	});

	if (!updateResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao atualizar notificação.");
	}

	if (updateResponse.matchedCount === 0) {
		throw new createHttpError.NotFound("Notificação não encontrada.");
	}

	return NextResponse.json({
		data: {
			updated: true,
		},
		message: "Notificação atualizada com sucesso!",
	});
}

export type TUpdateNotificationRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof updateNotificationHandler>>>;
export const PUT = apiHandler({ PUT: updateNotificationHandler });
