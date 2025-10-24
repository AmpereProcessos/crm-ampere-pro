import { apiHandler } from "@/lib/api";
import { type TUserSession, getValidCurrentSessionUncached } from "@/lib/auth/session";
import { getPeriodUtils } from "@/lib/methods/dates";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TGoal } from "@/utils/schemas/goal.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { GeneralStatsFiltersSchema, QueryDatesSchema } from "@/utils/schemas/stats.schema";
import dayjs from "dayjs";
import createHttpError from "http-errors";
import type { Collection, Filter } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import z from "zod";

const GraphDataStatsFilterSchema = GeneralStatsFiltersSchema.extend({
	graphType: z.enum(["opportunities-created", "opportunities-won", "opportunities-lost", "total-sold"]),
});
export type TGetGraphDataRouteInput = z.infer<typeof GraphDataStatsFilterSchema>;

type TGraphDataReduced = {
	[k: string]: {
		identificador: string;
		valor: number;
		objetivo: number;
	};
};

type DistributeGoalsParams = {
	graphData: TGraphDataReduced;
	totalGoal: number;
	periodUtils: ReturnType<typeof getPeriodUtils>;
	afterDate: Date;
	beforeDate: Date;
};

function distributeGoalsAcrossPeriod({ graphData, totalGoal, periodUtils, afterDate, beforeDate }: DistributeGoalsParams): TGraphDataReduced {
	const now = new Date();
	const nowTime = now.getTime();
	const afterTime = afterDate.getTime();
	const beforeTime = beforeDate.getTime();

	// Determinar se o período é passado, futuro ou atual
	const isPastPeriod = beforeTime < nowTime;
	const isFuturePeriod = afterTime > nowTime;
	const isCurrentPeriod = !isPastPeriod && !isFuturePeriod;

	const buckets = periodUtils.spacedDates;
	const totalBuckets = buckets.length;

	// Se não há meta definida, retornar os dados sem alteração
	if (totalGoal === 0) {
		return graphData;
	}

	// Para períodos passados ou futuros: distribuição uniforme
	if (isPastPeriod || isFuturePeriod) {
		const goalPerBucket = totalGoal / totalBuckets;

		for (const bucket of buckets) {
			const bucketKey = dayjs(bucket).format(periodUtils.format);
			if (graphData[bucketKey]) {
				graphData[bucketKey].objetivo = goalPerBucket;
			}
		}

		return graphData;
	}

	// Para período atual: lógica de burndown
	if (isCurrentPeriod) {
		// Calcular o total conquistado até agora
		let totalAchieved = 0;
		const pastBuckets: Date[] = [];
		const futureBuckets: Date[] = [];

		// Separar buckets em passados e futuros
		for (const bucket of buckets) {
			const bucketTime = bucket.getTime();
			if (bucketTime <= nowTime) {
				pastBuckets.push(bucket);
				const bucketKey = dayjs(bucket).format(periodUtils.format);
				if (graphData[bucketKey]) {
					totalAchieved += graphData[bucketKey].valor;
				}
			} else {
				futureBuckets.push(bucket);
			}
		}

		// Para buckets passados: objetivo = valor conquistado (burndown)
		for (const bucket of pastBuckets) {
			const bucketKey = dayjs(bucket).format(periodUtils.format);
			if (graphData[bucketKey]) {
				graphData[bucketKey].objetivo = graphData[bucketKey].valor;
			}
		}

		// Para buckets futuros: distribuir o que falta alcançar
		const remainingGoal = Math.max(0, totalGoal - totalAchieved);
		const futureBucketsCount = futureBuckets.length;

		if (futureBucketsCount > 0) {
			const goalPerFutureBucket = remainingGoal / futureBucketsCount;

			for (const bucket of futureBuckets) {
				const bucketKey = dayjs(bucket).format(periodUtils.format);
				if (graphData[bucketKey]) {
					graphData[bucketKey].objetivo = goalPerFutureBucket;
				}
			}
		}
	}

	return graphData;
}

async function getGraphData({
	session,
	queryParams,
	payload,
}: {
	session: TUserSession;
	queryParams: z.infer<typeof QueryDatesSchema>;
	payload: TGetGraphDataRouteInput;
}) {
	const partnerScope = session.user.permissoes.parceiros.escopo;
	const opportunityVisibilityScope = session.user.permissoes.oportunidades.escopo;

	const { after, before } = queryParams;
	const { responsibles, partners, projectTypes, graphType } = GraphDataStatsFilterSchema.parse(payload);

	const afterDate = new Date(after);
	const beforeDate = new Date(before);
	// Se o usuário tem escopo definido e na requisição não há array de responsáveis definido,
	// então o usuário está tentando acessar uma visualização geral, o que não é permitido
	if (!!opportunityVisibilityScope && !responsibles) {
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");
	}

	// Se o usuário tem escopo definido e na requisição não há array de parceiros definido,
	// então o usuário está tentando acessar uma visualização geral, o que não é permitido
	if (!!partnerScope && !partners) {
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");
	}

	// Se o usuário tem escopo definido e no array de responsáveis da requisição há um responsável
	// que não está no seu escopo, então o usuário está tentando acessar uma visualização não permitida
	if (!!opportunityVisibilityScope && responsibles?.some((r) => !opportunityVisibilityScope.includes(r))) {
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");
	}

	// Se o usuário tem escopo definido e no array de parceiros da requisição há um parceiro
	// que não está no seu escopo, então o usuário está tentando acessar uma visualização não permitida
	if (!!partnerScope && partners?.some((r) => !partnerScope.includes(r))) {
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");
	}

	const responsiblesQuery: Filter<TOpportunity> = responsibles ? { "responsaveis.id": { $in: responsibles } } : {};
	const partnerQuery: Filter<TOpportunity> = partners ? { idParceiro: { $in: [...partners] } } : {};
	const projectTypeQuery: Filter<TOpportunity> = projectTypes ? { "tipo.id": { $in: [...projectTypes] } } : {};

	const query: Filter<TOpportunity> = {
		...responsiblesQuery,
		...partnerQuery,
		...projectTypeQuery,
	};

	const crmDb = await connectToDatabase();
	const opportunitiesCollection = crmDb.collection<TOpportunity>("opportunities");
	const goalsCollection = crmDb.collection<TGoal>("goals");

	const opportunities = await getOpportunities({
		collection: opportunitiesCollection,
		coreQuery: query,
		periodStart: after,
		periodEnd: before,
	});

	const periodUtils = getPeriodUtils({
		startDate: new Date(after),
		endDate: new Date(before),
	});

	// Get applicable goals for the period
	const applicableGoals = await getApplicableGoals({
		goalsCollection,
		responsiblesIds: responsibles || null,
		afterDate,
		beforeDate,
	});

	const graphDataReduced = opportunities.reduce<TGraphDataReduced>(
		(acc, current) => {
			const insertDate = new Date(current.dataInsercao);
			const winDate = current.ganho.data ? new Date(current.ganho.data) : null;
			const lossDate = current.dataPerda ? new Date(current.dataPerda) : null;

			if (graphType === "opportunities-created") {
				const isInsertedWithinPeriod = insertDate >= afterDate && insertDate <= beforeDate;
				if (isInsertedWithinPeriod) {
					const insertionTime = insertDate.getTime();
					const bucket = periodUtils.buckets.find((b) => insertionTime >= b.start && insertionTime <= b.end);
					if (!bucket) return acc;
					const bucketKey = dayjs(bucket.key).format(periodUtils.format);
					acc[bucketKey].valor += 1;
				}
			}
			if (graphType === "opportunities-won") {
				const isWonWithinPeriod = winDate && winDate >= afterDate && winDate <= beforeDate;
				if (isWonWithinPeriod) {
					const winTime = winDate.getTime();
					const bucket = periodUtils.buckets.find((b) => winTime >= b.start && winTime <= b.end);
					if (!bucket) return acc;
					const bucketKey = dayjs(bucket.key).format(periodUtils.format);
					acc[bucketKey].valor += 1;
				}
			}
			if (graphType === "opportunities-lost") {
				const isLostWithinPeriod = lossDate && lossDate >= afterDate && lossDate <= beforeDate;
				if (isLostWithinPeriod) {
					const lossTime = lossDate.getTime();
					const bucket = periodUtils.buckets.find((b) => lossTime >= b.start && lossTime <= b.end);
					if (!bucket) return acc;
					const bucketKey = dayjs(bucket.key).format(periodUtils.format);
					acc[bucketKey].valor += 1;
				}
			}
			if (graphType === "total-sold") {
				const saleValue = current.valorProposta;
				const isWonWithinPeriod = winDate && winDate >= afterDate && winDate <= beforeDate;
				if (isWonWithinPeriod) {
					const winTime = winDate.getTime();
					const bucket = periodUtils.buckets.find((b) => winTime >= b.start && winTime <= b.end);
					if (!bucket) return acc;
					const bucketKey = dayjs(bucket.key).format(periodUtils.format);
					acc[bucketKey].valor += saleValue;
				}
			}
			return acc;
		},
		Object.fromEntries(
			periodUtils.spacedDates.map((date) => [
				dayjs(date).format(periodUtils.format),
				{
					identificador: dayjs(date).format(periodUtils.format),
					valor: 0,
					objetivo: 0,
				},
			]),
		),
	);

	// Distribute goals across the period with burndown logic
	const graphDataWithGoals = distributeGoalsAcrossPeriod({
		graphData: graphDataReduced,
		totalGoal: applicableGoals[graphType] || 0,
		periodUtils,
		afterDate,
		beforeDate,
	});

	return {
		data: Object.values(graphDataWithGoals),
	};
}
export type TGetGraphDataRouteOutput = Awaited<ReturnType<typeof getGraphData>>;

const getGraphDataHandler = async (request: NextRequest) => {
	const session = await getValidCurrentSessionUncached();
	const searchParams = request.nextUrl.searchParams;
	const queryParams = QueryDatesSchema.parse({
		after: searchParams.get("after"),
		before: searchParams.get("before"),
	});
	const payload = GraphDataStatsFilterSchema.parse(await request.json());

	const data = await getGraphData({ session, queryParams, payload });
	return NextResponse.json(data);
};
export const POST = apiHandler({ POST: getGraphDataHandler });

type TOpportunitySimplifiedResult = {
	ganho: TOpportunity["ganho"];
	perda: TOpportunity["perda"];
	proposta: TOpportunity["proposta"];
	dataInsercao: TOpportunity["dataInsercao"];
};

type TGetOpportunitiesParams = {
	collection: Collection<TOpportunity>;
	coreQuery: Filter<TOpportunity>;
	periodStart: string;
	periodEnd: string;
};
async function getOpportunities({ collection, coreQuery, periodStart, periodEnd }: TGetOpportunitiesParams) {
	const match: Filter<TOpportunity> = {
		...coreQuery,
		$or: [
			{
				$and: [{ dataInsercao: { $gte: periodStart } }, { dataInsercao: { $lte: periodEnd } }],
			},
			{
				$and: [{ "perda.data": { $gte: periodStart } }, { "perda.data": { $lte: periodEnd } }],
			},
			{
				$and: [{ "ganho.data": { $gte: periodStart } }, { "ganho.data": { $lte: periodEnd } }],
			},
		],
	};

	const projection = {
		ganho: 1,
		perda: 1,
		"proposta.valor": 1,
		"proposta.potenciaPico": 1,
		dataInsercao: 1,
	};

	const result = (await collection.aggregate([{ $match: match }, { $project: projection }]).toArray()) as TOpportunitySimplifiedResult[];

	const opportunities = result.map((r) => ({
		ganho: r.ganho,
		valorProposta: r.proposta ? r.proposta.valor : 0,
		potenciaProposta: r.proposta ? r.proposta.potenciaPico : 0,
		dataPerda: r.perda.data,
		motivoPerda: r.perda.descricaoMotivo,
		dataInsercao: r.dataInsercao,
	}));
	return opportunities;
}

type GetApplicableGoalsParams = {
	goalsCollection: Collection<TGoal>;
	responsiblesIds: string[] | null;
	afterDate: Date;
	beforeDate: Date;
};
async function getApplicableGoals({ goalsCollection, responsiblesIds, afterDate, beforeDate }: GetApplicableGoalsParams) {
	const afterDatetime = new Date(afterDate).getTime();
	const afterDateStr = afterDate.toISOString();
	const beforeDatetime = new Date(beforeDate).getTime();
	const beforeDateStr = beforeDate.toISOString();

	const goals = await goalsCollection
		.find({
			$or: [
				{
					"periodo.inicio": {
						$gte: afterDateStr,
						$lte: beforeDateStr,
					},
				},
				{
					"periodo.fim": {
						$gte: afterDateStr,
						$lte: beforeDateStr,
					},
				},
			],
		})
		.toArray();
	const applicableGoals = goals.reduce(
		(acc, current) => {
			const goalAfterDateTime = new Date(current.periodo.inicio).getTime();
			const goalBeforeDateTime = new Date(current.periodo.fim).getTime();
			const goalDaysDiff = dayjs(current.periodo.fim).diff(dayjs(current.periodo.inicio), "days");
			if (
				(afterDatetime < goalAfterDateTime && beforeDatetime < goalAfterDateTime) ||
				(afterDatetime > goalBeforeDateTime && beforeDatetime > goalBeforeDateTime)
			) {
				console.log("[INFO] [GET_OVERALL_SALE_GOAL] Goal not applicable: ", {
					current,
				});
				return acc;
			}
			if (afterDatetime <= goalAfterDateTime && beforeDatetime >= goalBeforeDateTime) {
				// Caso o período de filtro da query compreenda o mês inteiro
				console.log("[INFO] [GET_OVERALL_SALE_GOAL] Goal applicable for all period: ", {
					queryPeriodStart: afterDateStr,
					queryPeriodEnd: beforeDateStr,
					goalPeriodStart: current.periodo.inicio,
					goalPeriodEnd: current.periodo.fim,
				});

				// If not responsible ids were provided, using the global goal
				if (!responsiblesIds) {
					acc["opportunities-created"] += current.objetivo.oportunidadesCriadas;
					acc["total-sold"] += current.objetivo.valorVendido;
					acc["opportunities-won"] += current.objetivo.oportunidadesGanhas;
					return acc;
				}

				// If responsible ids were provided, using the responsible goals
				for (const responsible of current.usuarios) {
					const isApplicable = responsiblesIds.includes(responsible.id);
					if (isApplicable) {
						acc["opportunities-created"] += responsible.objetivo.oportunidadesCriadas;
						acc["total-sold"] += responsible.objetivo.valorVendido;
						acc["opportunities-won"] += responsible.objetivo.oportunidadesGanhas;
					}
				}
				return acc;
			}
			if (beforeDatetime > goalBeforeDateTime) {
				const applicableDays = dayjs(current.periodo.fim).diff(dayjs(afterDate), "days");

				console.log("[INFO] [GET_OVERALL_SALE_GOAL] Goal applicable for partial period: ", {
					queryPeriodStart: afterDateStr,
					queryPeriodEnd: beforeDateStr,
					goalPeriodStart: current.periodo.inicio,
					goalPeriodEnd: current.periodo.fim,
					applicableDays,
					goalDaysDiff: goalDaysDiff,
				});
				const mutlplier = applicableDays / goalDaysDiff;

				// If not responsible ids were provided, using the global goal
				if (!responsiblesIds) {
					acc["opportunities-created"] += current.objetivo.oportunidadesCriadas * mutlplier;
					acc["total-sold"] += current.objetivo.valorVendido * mutlplier;
					acc["opportunities-won"] += current.objetivo.oportunidadesGanhas * mutlplier;
					return acc;
				}
				// If responsible ids were provided, using the responsible goals
				for (const responsible of current.usuarios) {
					const isApplicable = responsiblesIds.includes(responsible.id);
					if (isApplicable) {
						acc["opportunities-created"] += responsible.objetivo.oportunidadesCriadas * mutlplier;
						acc["total-sold"] += responsible.objetivo.valorVendido * mutlplier;
						acc["opportunities-won"] += responsible.objetivo.oportunidadesGanhas * mutlplier;
					}
				}
				return acc;
			}

			const applicableDays = dayjs(beforeDate).diff(dayjs(current.periodo.inicio), "days") + 1;

			const mutlplier = applicableDays / goalDaysDiff;

			console.log("[INFO] [GET_OVERALL_SALE_GOAL] Goal applicable for partial period: ", {
				queryPeriodStart: afterDateStr,
				queryPeriodEnd: beforeDateStr,
				goalPeriodStart: current.periodo.inicio,
				goalPeriodEnd: current.periodo.fim,
				applicableDays,
				goalDaysDiff: goalDaysDiff,
				mutlplier,
			});

			// If responsible ids were provided, using the responsible goals
			if (!responsiblesIds) {
				acc["opportunities-created"] += current.objetivo.oportunidadesCriadas * mutlplier;
				acc["total-sold"] += current.objetivo.valorVendido * mutlplier;
				acc["opportunities-won"] += current.objetivo.oportunidadesGanhas * mutlplier;
				return acc;
			}
			// If responsible ids were provided, using the responsible goals
			for (const responsible of current.usuarios) {
				const isApplicable = responsiblesIds.includes(responsible.id);
				if (isApplicable) {
					acc["opportunities-created"] += responsible.objetivo.oportunidadesCriadas * mutlplier;
					acc["total-sold"] += responsible.objetivo.valorVendido * mutlplier;
					acc["opportunities-won"] += responsible.objetivo.oportunidadesGanhas * mutlplier;
				}
			}
			return acc;
		},
		{
			"opportunities-created": 0,
			"opportunities-won": 0,
			"opportunities-lost": 0,
			"total-sold": 0,
		},
	);

	return applicableGoals;
}
