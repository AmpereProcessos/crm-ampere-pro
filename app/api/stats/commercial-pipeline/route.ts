import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import type { TFunnel } from "@/utils/schemas/funnel.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import dayjs from "dayjs";
import createHttpError from "http-errors";
import { type Collection, ObjectId, type Filter } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const CommercialPipelineQuerySchema = z.object({
	funnelId: z.string().min(1),
	after: z.string().datetime(),
	before: z.string().datetime(),
	responsibleIds: z
		.string()
		.optional()
		.nullable()
		.transform((value) => value?.split(",").filter(Boolean) ?? []),
});

export type TCommercialPipelineStage = {
	stageId: string;
	stageName: string;
	stageOrder: number;
	isInitial: boolean;
	isFinal: boolean;
	inStageCount: number;
	passedThroughCount: number;
	cumulativeCount: number;
	absoluteConversion: number;
	stageToStageConversion: number;
	averageHours: number | null;
};

async function getCommercialPipeline(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	if (!user.permissoes.resultados.visualizarComercial) {
		throw new createHttpError.Unauthorized("Você não possui permissão para visualizar resultados comerciais.");
	}

	const searchParams = request.nextUrl.searchParams;
	const input = CommercialPipelineQuerySchema.parse({
		funnelId: searchParams.get("funnelId"),
		after: searchParams.get("after"),
		before: searchParams.get("before"),
		responsibleIds: searchParams.get("responsibleIds"),
	});
	if (!ObjectId.isValid(input.funnelId)) throw new createHttpError.BadRequest("Funil inválido.");

	const allowedResponsibleIds = user.permissoes.oportunidades.escopo;
	if (allowedResponsibleIds && input.responsibleIds.some((id) => !allowedResponsibleIds.includes(id))) {
		throw new createHttpError.Unauthorized("Você não possui acesso ao escopo comercial solicitado.");
	}
	const effectiveResponsibleIds = input.responsibleIds.length > 0 ? input.responsibleIds : (allowedResponsibleIds ?? []);
	const partnerScope = user.permissoes.parceiros.escopo;
	const partnerIds = partnerScope ?? (user.idParceiro ? [user.idParceiro] : []);
	const partnerFilter = partnerIds.length > 0 ? { idParceiro: { $in: [...partnerIds, null] } } : {};
	const opportunityPartnerFilter: Filter<TOpportunity> = partnerIds.length > 0 ? { idParceiro: { $in: partnerIds } } : {};

	const db = await connectToDatabase();
	const funnelsCollection: Collection<TFunnel> = db.collection("funnels");
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");
	const referencesCollection: Collection<TFunnelReference> = db.collection("funnel-references");

	const opportunityFilter: Filter<TOpportunity> = {
		...opportunityPartnerFilter,
		...(effectiveResponsibleIds.length > 0 ? { "responsaveis.id": { $in: effectiveResponsibleIds } } : {}),
		$or: [{ dataExclusao: null }, { dataExclusao: { $exists: false } }],
	};
	const opportunityProjection = {
		_id: 1,
		"ganho.data": 1,
		"perda.data": 1,
	};
	const [funnel, opportunities] = await Promise.all([
		funnelsCollection.findOne({ _id: new ObjectId(input.funnelId), ...partnerFilter }),
		opportunitiesCollection.find(opportunityFilter, { projection: opportunityProjection }).toArray(),
	]);
	if (!funnel) throw new createHttpError.NotFound("Funil não encontrado.");

	const opportunityIds = opportunities.map((opportunity) => opportunity._id.toString());
	const opportunityStatuses = new Map(
		opportunities.map((opportunity) => [
			opportunity._id.toString(),
			{
				wonAt: opportunity.ganho?.data ?? null,
				lostAt: opportunity.perda?.data ?? null,
			},
		]),
	);
	const references =
		opportunityIds.length > 0
			? await referencesCollection
					.find({
						idFunil: input.funnelId,
						idOportunidade: { $in: opportunityIds },
						...(partnerIds.length > 0 ? { idParceiro: { $in: partnerIds } } : {}),
					})
					.toArray()
			: [];

	const stages = funnel.etapas.map((stage, index) => ({
		id: String(stage.id),
		name: stage.nome,
		order: index,
		isInitial: stage.estagioInicial ?? index === 0,
		isFinal: stage.estagioFinal ?? index === funnel.etapas.length - 1,
	}));
	const finalStageIndex = stages.findIndex((stage) => stage.isFinal);
	const lastFunnelIndex = finalStageIndex >= 0 ? finalStageIndex : Math.max(stages.length - 1, 0);
	const inStageCounts = new Map(stages.map((stage) => [stage.id, new Set<string>()]));
	const passedThroughCounts = new Map(stages.map((stage) => [stage.id, new Set<string>()]));
	const durations = new Map(stages.map((stage) => [stage.id, [] as number[]]));
	const maxReachedByOpportunity = new Map<string, number>();
	const opportunitiesInPeriod = new Set<string>();

	for (const reference of references) {
		for (const [stageId, interval] of Object.entries(reference.estagios)) {
			const stage = stages.find((candidate) => candidate.id === String(stageId));
			if (!stage || !interval?.entrada || !overlapsPeriod(interval.entrada, interval.saida, input.after, input.before)) continue;
			passedThroughCounts.get(stage.id)?.add(reference.idOportunidade);
			opportunitiesInPeriod.add(reference.idOportunidade);
			if (isStageActiveAt(interval.entrada, interval.saida, input.before) && isOpportunityOpenAt(opportunityStatuses.get(reference.idOportunidade), input.before)) {
				inStageCounts.get(stage.id)?.add(reference.idOportunidade);
			}
			if (stage.order <= lastFunnelIndex) {
				const previousMax = maxReachedByOpportunity.get(reference.idOportunidade) ?? -1;
				maxReachedByOpportunity.set(reference.idOportunidade, Math.max(previousMax, stage.order));
			}
			const duration = overlapHours(interval.entrada, interval.saida, input.after, input.before);
			if (duration > 0) durations.get(stage.id)?.push(duration);
		}
	}

	const firstStageCount = stages[0] ? (inStageCounts.get(stages[0].id)?.size ?? 0) : 0;
	const reachedOrders = [...maxReachedByOpportunity.values()];
	const result: TCommercialPipelineStage[] = stages.map((stage, index) => {
		const inStageCount = inStageCounts.get(stage.id)?.size ?? 0;
		const passedThroughCount = passedThroughCounts.get(stage.id)?.size ?? 0;
		const previousCount = index > 0 ? (inStageCounts.get(stages[index - 1]?.id ?? "")?.size ?? 0) : inStageCount;
		const stageDurations = durations.get(stage.id) ?? [];
		return {
			stageId: stage.id,
			stageName: stage.name,
			stageOrder: stage.order,
			isInitial: stage.isInitial,
			isFinal: stage.isFinal,
			inStageCount,
			passedThroughCount,
			cumulativeCount: stage.order <= lastFunnelIndex ? reachedOrders.filter((order) => order >= stage.order).length : 0,
			absoluteConversion: roundPercent(firstStageCount > 0 ? (inStageCount / firstStageCount) * 100 : 0),
			stageToStageConversion: roundPercent(previousCount > 0 ? (inStageCount / previousCount) * 100 : 0),
			averageHours: stageDurations.length > 0 ? stageDurations.reduce((total, value) => total + value, 0) / stageDurations.length : null,
		};
	});

	return NextResponse.json({
		data: {
			funnel: result,
			totalOpportunities: opportunitiesInPeriod.size,
		},
	});
}

function overlapsPeriod(entry: string, exit: string | null | undefined, after: string, before: string) {
	return entry <= before && (!exit || exit >= after);
}

function isStageActiveAt(entry: string, exit: string | null | undefined, at: string) {
	return !dayjs(entry).isAfter(dayjs(at)) && (!exit || dayjs(exit).isAfter(dayjs(at)));
}

function isOpportunityOpenAt(status: { wonAt: string | null; lostAt: string | null } | undefined, at: string) {
	if (!status) return false;
	return !hasStatusAt(status.wonAt, at) && !hasStatusAt(status.lostAt, at);
}

function hasStatusAt(statusDate: string | null, at: string) {
	return Boolean(statusDate) && !dayjs(statusDate).isAfter(dayjs(at));
}

function overlapHours(entry: string, exit: string | null | undefined, after: string, before: string) {
	const start = dayjs(entry).isAfter(dayjs(after)) ? dayjs(entry) : dayjs(after);
	const rawEnd = exit ? dayjs(exit) : dayjs();
	const end = rawEnd.isBefore(dayjs(before)) ? rawEnd : dayjs(before);
	return Math.max(end.diff(start, "minute") / 60, 0);
}

function roundPercent(value: number) {
	return Math.round(value * 10) / 10;
}

export type TCommercialPipelineRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getCommercialPipeline>>>;
export const GET = apiHandler({ GET: getCommercialPipeline });
