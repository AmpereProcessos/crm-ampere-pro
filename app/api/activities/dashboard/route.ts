import dayjs from "dayjs";
import createHttpError from "http-errors";
import type { Collection, Filter } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TActivity, TActivityDTO } from "@/utils/schemas/activities.schema";

const DashboardActivitiesQuerySchema = z.object({
	after: z.string().datetime(),
	before: z.string().datetime(),
	responsibleIds: z
		.string()
		.optional()
		.nullable()
		.transform((value) => value?.split(",").filter(Boolean) ?? []),
	page: z.coerce.number().int().min(1).default(1),
	search: z.string().trim().max(120).optional().default(""),
});

const PAGE_SIZE = 12;

async function getActivitiesDashboard(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const params = request.nextUrl.searchParams;
	const input = DashboardActivitiesQuerySchema.parse({
		after: params.get("after"),
		before: params.get("before"),
		responsibleIds: params.get("responsibleIds"),
		page: params.get("page") ?? 1,
		search: params.get("search") ?? "",
	});

	const allowedResponsibleIds = user.permissoes.oportunidades.escopo;
	if (allowedResponsibleIds && input.responsibleIds.some((id) => !allowedResponsibleIds.includes(id))) {
		throw new createHttpError.Unauthorized("Você não possui acesso ao escopo de atividades solicitado.");
	}

	const effectiveResponsibleIds = input.responsibleIds.length > 0 ? input.responsibleIds : (allowedResponsibleIds ?? []);
	const partnerScope = user.permissoes.parceiros.escopo;
	const partnerIds = partnerScope ?? (user.idParceiro ? [user.idParceiro] : []);
	const partnerFilter: Filter<TActivity> = partnerIds.length > 0 ? { idParceiro: { $in: partnerIds } } : partnerScope ? { idParceiro: { $in: [] } } : {};
	const responsibleFilter: Filter<TActivity> =
		effectiveResponsibleIds.length > 0
			? { "responsaveis.id": { $in: effectiveResponsibleIds } }
			: allowedResponsibleIds
				? { "responsaveis.id": { $in: [] } }
				: {};
	const scopeFilter: Filter<TActivity> = { ...partnerFilter, ...responsibleFilter };
	const period = { $gte: input.after, $lte: input.before };

	const searchFilter: Filter<TActivity> =
		input.search.length > 0
			? {
					$and: [
						{
							$or: [
								{ titulo: { $regex: escapeRegExp(input.search), $options: "i" } },
								{ descricao: { $regex: escapeRegExp(input.search), $options: "i" } },
								{ "oportunidade.nome": { $regex: escapeRegExp(input.search), $options: "i" } },
								{ "projeto.nome": { $regex: escapeRegExp(input.search), $options: "i" } },
							],
						},
					],
				}
			: {};

	const db = await connectToDatabase();
	const collection: Collection<TActivity> = db.collection("activities");
	const openFilter: Filter<TActivity> = {
		...scopeFilter,
		...searchFilter,
		$or: [{ dataConclusao: null }, { dataConclusao: { $exists: false } }],
	};
	const calendarFilter: Filter<TActivity> = {
		...scopeFilter,
		$or: [{ agendamentoInicio: period }, { dataVencimento: period }],
	};

	const [
		createdActivitiesCount,
		startedActivitiesCount,
		finishedActivitiesCount,
		ongoingActivitiesCount,
		pendingActivitiesCount,
		activitiesMatched,
		openActivities,
		calendarActivities,
		completionRows,
	] = await Promise.all([
		collection.countDocuments({ ...scopeFilter, dataInsercao: period }),
		collection.countDocuments({ ...scopeFilter, dataInicio: period }),
		collection.countDocuments({ ...scopeFilter, dataConclusao: period }),
		collection.countDocuments({
			...scopeFilter,
			dataInicio: { $ne: null },
			$or: [{ dataConclusao: null }, { dataConclusao: { $exists: false } }],
		}),
		collection.countDocuments({
			...scopeFilter,
			$and: [{ $or: [{ dataInicio: null }, { dataInicio: { $exists: false } }] }, { $or: [{ dataConclusao: null }, { dataConclusao: { $exists: false } }] }],
		}),
		collection.countDocuments(openFilter),
		collection
			.find(openFilter)
			.sort({ dataVencimento: 1, agendamentoInicio: 1, dataInsercao: -1 })
			.skip((input.page - 1) * PAGE_SIZE)
			.limit(PAGE_SIZE)
			.toArray(),
		collection.find(calendarFilter).sort({ agendamentoInicio: 1, dataVencimento: 1 }).toArray(),
		collection.find({ ...scopeFilter, dataInicio: { $ne: null }, dataConclusao: period }, { projection: { dataInicio: 1, dataConclusao: 1 } }).toArray(),
	]);

	const totalCompletionHours = completionRows.reduce((total, activity) => {
		if (!activity.dataInicio || !activity.dataConclusao) return total;
		return total + dayjs(activity.dataConclusao).diff(dayjs(activity.dataInicio), "minute") / 60;
	}, 0);

	return NextResponse.json({
		data: {
			stats: {
				createdActivitiesCount,
				startedActivitiesCount,
				finishedActivitiesCount,
				ongoingActivitiesCount,
				pendingActivitiesCount,
				avgCompletionTime: completionRows.length > 0 ? totalCompletionHours / completionRows.length : 0,
			},
			list: {
				activities: openActivities.map(toActivityDTO),
				activitiesMatched,
				totalPages: Math.ceil(activitiesMatched / PAGE_SIZE),
				page: input.page,
			},
			calendar: calendarActivities.map(toActivityDTO),
		},
	});
}

function toActivityDTO(activity: TActivity & { _id: unknown }): TActivityDTO {
	return { ...activity, _id: String(activity._id) } as TActivityDTO;
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type TActivitiesDashboardRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getActivitiesDashboard>>>;
export const GET = apiHandler({ GET: getActivitiesDashboard });
