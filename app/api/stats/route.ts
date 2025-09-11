import { type UnwrapNextResponse, apiHandler } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import { getPartnersSimplified } from "@/repositories/partner-simplified/query";
import { getProjectTypesSimplified } from "@/repositories/project-type/queries";
import { getOpportunityCreators } from "@/repositories/users/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TActivity } from "@/utils/schemas/activities.schema";
import type { TConectaInteractionEvent } from "@/utils/schemas/conecta-interaction-events.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type {
	TPartner,
	TPartnerSimplifiedDTO,
} from "@/utils/schemas/partner.schema";
import type {
	TProjectType,
	TProjectTypeDTOSimplified,
} from "@/utils/schemas/project-types.schema";
import {
	GeneralStatsFiltersSchema,
	QueryDatesSchema,
} from "@/utils/schemas/stats.schema";
import type { TUser, TUserDTOSimplified } from "@/utils/schemas/user.schema";
import dayjs from "dayjs";
import createHttpError from "http-errors";
import type { Collection, Filter, ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

export type TGeneralStatsQueryFiltersOptions = {
	responsibles: TUserDTOSimplified[];
	partners: TPartnerSimplifiedDTO[];
	projectTypes: TProjectTypeDTOSimplified[];
};

async function getQueryFiltersOptions(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const parterScope = user.permissoes.parceiros.escopo;
	const partnerQuery = parterScope
		? { idParceiro: { $in: [...parterScope, null] } }
		: {};

	const db = await connectToDatabase();
	const usersCollection: Collection<TUser> = db.collection("users");
	const partnersCollection: Collection<TPartner> = db.collection("partners");
	const projectTypesCollection: Collection<TProjectType> =
		db.collection("project-types");

	const responsibles = await getOpportunityCreators({
		collection: usersCollection,
		query: partnerQuery as Filter<TUser>,
	});
	const partners = await getPartnersSimplified({
		collection: partnersCollection,
		query: partnerQuery as Filter<TPartner>,
	});
	const projectTypes = await getProjectTypesSimplified({
		collection: projectTypesCollection,
		query: partnerQuery,
	});

	const options = {
		responsibles: responsibles.map((u) => ({ ...u, _id: u._id.toString() })),
		partners: partners.map((u) => ({ ...u, _id: u._id.toString() })),
		projectTypes: projectTypes.map((u) => ({ ...u, _id: u._id.toString() })),
	};

	return NextResponse.json({
		data: {
			options,
		},
		message: "Opções de filtro encontradas com sucesso",
	});
}

export type TGetStatsQueryFiltersOptionsRouteOutput = UnwrapNextResponse<
	Awaited<ReturnType<typeof getQueryFiltersOptions>>
>;
export type TGetStatsQueryFiltersOptionsRouteOutputData =
	TGetStatsQueryFiltersOptionsRouteOutput["data"]["options"];

export const GET = apiHandler({ GET: getQueryFiltersOptions });

export type TCreateStatsRouteInput = z.infer<typeof GeneralStatsFiltersSchema>;
async function getStats(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();

	console.log("[INFO] [GET_STATS] Service called.", {
		userId: user.id,
		userName: user.nome,
	});
	if (!user.permissoes.oportunidades.visualizar) {
		throw new createHttpError.Unauthorized(
			"Usuário não possui permissão para visualizar oportunidades.",
		);
	}

	const partnerScope = user.permissoes.parceiros.escopo;
	const opportunityVisibilityScope = user.permissoes.oportunidades.escopo;

	const searchParams = request.nextUrl.searchParams;
	const queryParams = QueryDatesSchema.parse({
		after: searchParams.get("after"),
		before: searchParams.get("before"),
	});

	const { after, before } = queryParams;

	const payload = await request.json();
	const { responsibles, partners, projectTypes } =
		GeneralStatsFiltersSchema.parse(payload);

	if (typeof after !== "string" || typeof before !== "string") {
		throw new createHttpError.BadRequest("Parâmetros de período inválidos.");
	}

	// Se o usuário tem escopo definido e na requisição não há array de responsáveis definido,
	// então o usuário está tentando acessar uma visualização geral, o que não é permitido
	if (!!opportunityVisibilityScope && !responsibles) {
		throw new createHttpError.Unauthorized(
			"Seu usuário não possui solicitação para esse escopo de visualização.",
		);
	}

	// Se o usuário tem escopo definido e na requisição não há array de parceiros definido,
	// então o usuário está tentando acessar uma visualização geral, o que não é permitido
	if (!!partnerScope && !partners) {
		throw new createHttpError.Unauthorized(
			"Seu usuário não possui solicitação para esse escopo de visualização.",
		);
	}

	// Se o usuário tem escopo definido e no array de responsáveis da requisição há um responsável
	// que não está no seu escopo, então o usuário está tentando acessar uma visualização não permitida
	if (
		!!opportunityVisibilityScope &&
		responsibles?.some((r) => !opportunityVisibilityScope.includes(r))
	) {
		throw new createHttpError.Unauthorized(
			"Seu usuário não possui solicitação para esse escopo de visualização.",
		);
	}

	// Se o usuário tem escopo definido e no array de parceiros da requisição há um parceiro
	// que não está no seu escopo, então o usuário está tentando acessar uma visualização não permitida
	if (!!partnerScope && partners?.some((r) => !partnerScope.includes(r))) {
		throw new createHttpError.Unauthorized(
			"Seu usuário não possui solicitação para esse escopo de visualização.",
		);
	}

	const responsiblesQuery: Filter<TOpportunity> = responsibles
		? { "responsaveis.id": { $in: responsibles } }
		: {};
	const partnerQuery: Filter<TOpportunity> = partners
		? { idParceiro: { $in: [...partners] } }
		: {};
	const projectTypeQuery: Filter<TOpportunity> = projectTypes
		? { "tipo.id": { $in: [...projectTypes] } }
		: {};

	const query: Filter<TOpportunity> = {
		...responsiblesQuery,
		...partnerQuery,
		...projectTypeQuery,
	};

	const afterDate = new Date(after);
	const beforeDate = new Date(before);

	console.log("[INFO] [GET_STATS] Period", { after, before });

	const afterWithMarginDate = new Date(
		dayjs(after).subtract(1, "month").toISOString(),
	);
	const beforeWithMarginDate = new Date(
		dayjs(before).subtract(1, "month").toISOString(),
	);

	console.log("[INFO] [GET_STATS] Period with margin", {
		afterWithMarginDate,
		beforeWithMarginDate,
	});
	const db = await connectToDatabase();
	const opportunitiesCollection: Collection<TOpportunity> =
		db.collection("opportunities");
	const activitiesCollection: Collection<TActivity> =
		db.collection("activities");
	const conectaInteractionEventsCollection: Collection<TConectaInteractionEvent> =
		db.collection("conecta-interaction-events");

	const condensedInfo = await getSimplifiedInfo({
		opportunitiesCollection,
		query,
		afterDate,
		beforeDate,
		afterWithMarginDate,
		beforeWithMarginDate,
	});

	const wonOpportunities = await getWonOpportunities({
		opportunitiesCollection,
		query,
		afterDate,
		beforeDate,
	});
	const pendingWins = await getPendingWins({ opportunitiesCollection, query });
	const activities = await getActivities({
		collection: activitiesCollection,
		query: { ...responsiblesQuery, ...partnerQuery } as Filter<TActivity>,
	});

	const conectaInteractionEventsStats = await getConectaInteractionEventsStats({
		collection: conectaInteractionEventsCollection,
		sellerIds: responsibles,
		after: afterDate.toISOString(),
		before: beforeDate.toISOString(),
	});

	return NextResponse.json({
		data: {
			simplificado: condensedInfo,
			ganhos: wonOpportunities,
			ganhosPendentes: pendingWins,
			atividades: activities,
			conecta: conectaInteractionEventsStats,
		},
		message: "Estatísticas geradas com sucesso",
	});
}

export type TGetStatsRouteOutput = UnwrapNextResponse<
	Awaited<ReturnType<typeof getStats>>
>;
export type TGetStatsRouteOutputData = TGetStatsRouteOutput["data"];

export const POST = apiHandler({ POST: getStats });

// Funções auxiliares (copiadas do arquivo original)
type TOpportunitySimplifiedResult = {
	idMarketing: TOpportunity["idMarketing"];
	responsaveis: TOpportunity["responsaveis"];
	ganho: TOpportunity["ganho"];
	perda: TOpportunity["perda"];
	proposta: { valor: number; potenciaPico: number } | null;
	dataInsercao: TOpportunity["dataInsercao"];
};

type GetSimplifiedInfoParams = {
	opportunitiesCollection: Collection<TOpportunity>;
	query: Filter<TOpportunity>;
	afterDate: Date;
	afterWithMarginDate: Date;
	beforeDate: Date;
	beforeWithMarginDate: Date;
};

async function getSimplifiedInfo({
	opportunitiesCollection,
	query,
	afterDate,
	afterWithMarginDate,
	beforeDate,
	beforeWithMarginDate,
}: GetSimplifiedInfoParams) {
	const afterDateStr = afterDate.toISOString();
	const afterWithMarginDateStr = afterWithMarginDate.toISOString();
	const beforeDateStr = beforeDate.toISOString();

	const match: Filter<TOpportunity> = {
		...query,
		$or: [
			{
				$and: [
					{ dataInsercao: { $gte: afterWithMarginDateStr } },
					{ dataInsercao: { $lte: beforeDateStr } },
				],
			},
			{
				$and: [
					{ "perda.data": { $gte: afterWithMarginDateStr } },
					{ "perda.data": { $lte: beforeDateStr } },
				],
			},
			{
				$and: [
					{ "ganho.data": { $gte: afterWithMarginDateStr } },
					{ "ganho.data": { $lte: beforeDateStr } },
				],
			},
		],
	};

	const projection = {
		nome: 1,
		idMarketing: 1,
		responsaveis: 1,
		ganho: 1,
		perda: 1,
		"proposta.valor": 1,
		"proposta.potenciaPico": 1,
		dataInsercao: 1,
	};

	const result = (await opportunitiesCollection
		.aggregate([{ $match: match }, { $project: projection }])
		.toArray()) as TOpportunitySimplifiedResult[];

	const opportunities = result.map((r) => ({
		idMarketing: r.idMarketing,
		responsaveis: r.responsaveis,
		ganho: r.ganho,
		valorProposta: r.proposta?.valor ?? 0,
		potenciaProposta: r.proposta?.potenciaPico ?? 0,
		dataPerda: r.perda.data,
		motivoPerda: r.perda.descricaoMotivo,
		dataInsercao: r.dataInsercao,
	}));

	return opportunities.reduce(
		(acc, current) => {
			// Insertion related checkings
			const insertDate = new Date(current.dataInsercao);
			const wasInsertedWithinCurrentPeriod =
				insertDate >= afterDate && insertDate <= beforeDate;
			const wasInsertedWithinPreviousPeriod =
				insertDate >= afterWithMarginDate && insertDate < beforeWithMarginDate;

			// Signing related checkings
			const signatureDate = current.ganho?.data
				? new Date(current.ganho?.data)
				: null;
			const hasContractSigned = !!signatureDate;
			const wasSignedWithinCurrentPeriod =
				hasContractSigned &&
				signatureDate >= afterDate &&
				signatureDate <= beforeDate;
			const wasSignedWithinPreviousPeriod =
				hasContractSigned &&
				signatureDate >= afterWithMarginDate &&
				signatureDate <= beforeWithMarginDate;

			const proposalValue = current.valorProposta;
			const proposalPower = current.potenciaProposta;

			// Lost related checkings
			const lostDate = current.dataPerda ? new Date(current.dataPerda) : null;
			const isLostProject = !!lostDate;
			const wasLostWithinCurrentPeriod =
				isLostProject && lostDate >= afterDate && lostDate <= beforeDate;
			const wasLostWithinPreviousPeriod =
				isLostProject &&
				lostDate >= afterWithMarginDate &&
				lostDate <= beforeWithMarginDate;

			// Increasing ATUAL qtys based on checkings
			if (wasInsertedWithinCurrentPeriod) acc.ATUAL.projetosCriados += 1;
			if (wasSignedWithinCurrentPeriod) acc.ATUAL.projetosGanhos += 1;
			if (wasLostWithinCurrentPeriod) acc.ATUAL.projetosPerdidos += 1;
			if (wasSignedWithinCurrentPeriod) acc.ATUAL.totalVendido += proposalValue;
			if (wasSignedWithinCurrentPeriod)
				acc.ATUAL.potenciaVendida += proposalPower;

			// Increasing ANTERIOR qtys based on checkings
			if (wasInsertedWithinPreviousPeriod) acc.ANTERIOR.projetosCriados += 1;
			if (wasSignedWithinPreviousPeriod) acc.ANTERIOR.projetosGanhos += 1;
			if (wasLostWithinPreviousPeriod) acc.ANTERIOR.projetosPerdidos += 1;
			if (wasSignedWithinPreviousPeriod)
				acc.ANTERIOR.totalVendido += proposalValue;
			if (wasSignedWithinPreviousPeriod)
				acc.ANTERIOR.potenciaVendida += proposalPower;

			return acc;
		},
		{
			ANTERIOR: {
				projetosCriados: 0,
				projetosGanhos: 0,
				projetosPerdidos: 0,
				totalVendido: 0,
				potenciaVendida: 0,
			},
			ATUAL: {
				projetosCriados: 0,
				projetosGanhos: 0,
				projetosPerdidos: 0,
				totalVendido: 0,
				potenciaVendida: 0,
			},
		},
	);
}

type GetWonOpportunitiesParams = {
	opportunitiesCollection: Collection<TOpportunity>;
	query: Filter<TOpportunity>;
	afterDate: Date;
	beforeDate: Date;
};

async function getWonOpportunities({
	opportunitiesCollection,
	query,
	afterDate,
	beforeDate,
}: GetWonOpportunitiesParams) {
	const afterDateStr = afterDate.toISOString();
	const beforeDateStr = beforeDate.toISOString();

	const match: Filter<TOpportunity> = {
		...query,
		$and: [
			{ "ganho.data": { $gte: afterDateStr } },
			{ "ganho.data": { $lte: beforeDateStr } },
		],
	};

	// const addFields = { wonProposeObjectId: { $toObjectId: '$ganho.idProposta' } };
	// const lookup = { from: 'proposals', localField: 'wonProposeObjectId', foreignField: '_id', as: 'proposta' };
	const projection = {
		nome: 1,
		idMarketing: 1,
		responsaveis: 1,
		ganho: 1,
		idPropostaAtiva: 1,
		// 'proposta._id': 1,
		"proposta.nome": 1,
		"proposta.valor": 1,
		"proposta.potenciaPico": 1,
		dataInsercao: 1,
	};

	const result = (await opportunitiesCollection
		.aggregate([{ $match: match }, { $project: projection }])
		.toArray()) as {
		_id: ObjectId;
		nome: TOpportunity["nome"];
		idMarketing: TOpportunity["idMarketing"];
		responsaveis: TOpportunity["responsaveis"];
		idPropostaAtiva: TOpportunity["idPropostaAtiva"];
		proposta: Pick<
			Exclude<TOpportunity["proposta"], undefined | null>,
			"nome" | "valor" | "potenciaPico"
		>;
		ganho: TOpportunity["ganho"];
	}[];

	return result
		.map((r) => ({
			_id: r._id.toString(),
			nome: r.nome,
			responsaveis: r.responsaveis,
			idMarketing: r.idMarketing,
			idPropostaAtiva: r.idPropostaAtiva,
			proposta: r.proposta
				? {
						nome: r.proposta.nome,
						valor: r.proposta.valor,
						potenciaPico: r.proposta.potenciaPico,
					}
				: null,
			dataGanho: r.ganho?.data ?? null,
		}))
		.sort((a, b) => {
			return a.dataGanho && b.dataGanho
				? new Date(b.dataGanho).getTime() - new Date(a.dataGanho).getTime()
				: 0;
		});
}

type GetPendingWinsParams = {
	opportunitiesCollection: Collection<TOpportunity>;
	query: Filter<TOpportunity>;
};

async function getPendingWins({
	opportunitiesCollection,
	query,
}: GetPendingWinsParams) {
	const match: Filter<TOpportunity> = {
		...query,
		$and: [
			{ "ganho.idProposta": { $ne: null } },
			{ "ganho.data": { $eq: null } },
			{ "perda.data": { $eq: null } },
		],
	};

	const projection = {
		nome: 1,
		idMarketing: 1,
		responsaveis: 1,
		ganho: 1,
		"proposta.nome": 1,
		"proposta.valor": 1,
		"proposta.potenciaPico": 1,
		dataInsercao: 1,
	};

	const result = (await opportunitiesCollection
		.aggregate([{ $match: match }, { $project: projection }])
		.toArray()) as {
		_id: ObjectId;
		nome: TOpportunity["nome"];
		idMarketing: TOpportunity["idMarketing"];
		responsaveis: TOpportunity["responsaveis"];
		ganho: TOpportunity["ganho"];
		proposta: Pick<
			Exclude<TOpportunity["proposta"], undefined | null>,
			"nome" | "valor" | "potenciaPico"
		>;
		dataInsercao: TOpportunity["dataInsercao"];
	}[];

	return result
		.map((r) => ({
			_id: r._id.toString(),
			nome: r.nome,
			idMarketing: r.idMarketing,
			responsaveis: r.responsaveis,
			proposta: r.proposta
				? {
						nome: r.proposta.nome,
						valor: r.proposta.valor,
						potenciaPico: r.proposta.potenciaPico,
					}
				: null,
			dataSolicitacao: r.ganho?.dataSolicitacao ?? null,
		}))
		.sort((a, b) => {
			return a.dataSolicitacao && b.dataSolicitacao
				? new Date(b.dataSolicitacao).getTime() -
						new Date(a.dataSolicitacao).getTime()
				: 0;
		});
}

type GetActivitiesParams = {
	collection: Collection<TActivity>;
	query: Filter<TActivity>;
};

async function getActivities({ collection, query }: GetActivitiesParams) {
	const result = await collection
		.find(query)
		.limit(50)
		.sort({ dataInsercao: -1 })
		.toArray();
	return result.map((r) => ({ ...r, _id: r._id.toString() }));
}

type TConectaInteractionEventsStats = {
	collection: Collection<TConectaInteractionEvent>;
	sellerIds: string[] | null;
	after: string;
	before: string;
};
async function getConectaInteractionEventsStats({
	collection,
	sellerIds,
	after,
	before,
}: TConectaInteractionEventsStats) {
	const generalQuery: Filter<TConectaInteractionEvent> = {
		"vendedor.id": sellerIds ? { $in: sellerIds } : { $ne: null },
		data: { $gte: after, $lte: before },
	};

	const views = await collection.countDocuments({
		...generalQuery,
		tipo: "VISUALIZACAO_PAGINA",
	});
	const opportunities = await collection.countDocuments({
		...generalQuery,
		tipo: { $in: ["INDICAÇÃO", "INSCRIÇÃO"] },
	});

	return {
		visualizacoes: views,
		oportunidades: opportunities,
	};
}
