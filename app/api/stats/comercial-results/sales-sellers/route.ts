import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import { NextResponse, type NextRequest } from "next/server";
import { QueryDatesSchema } from "../inputs";
import { GeneralStatsFiltersSchema } from "@/utils/schemas/stats.schema";
import createHttpError from "http-errors";
import type { Collection, Filter } from "mongodb";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TProposal } from "@/utils/schemas/proposal.schema";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TSaleGoal } from "@/utils/schemas/sale-goal.schema";
import dayjs from "dayjs";

export type TSellerSalesResults = {
	[key: string]: {
		potenciaPico: {
			objetivo: number;
			atingido: number;
			origem: {
				interno: {
					[key: string]: number;
				};
				externo: {
					[key: string]: number;
				};
			};
		};
		valorVendido: {
			objetivo: number;
			atingido: number;
			origem: {
				interno: {
					[key: string]: number;
				};
				externo: {
					[key: string]: number;
				};
			};
		};
		projetosVendidos: {
			objetivo: number;
			atingido: number;
			origem: {
				interno: {
					[key: string]: number;
				};
				externo: {
					[key: string]: number;
				};
			};
		};
		projetosCriados: {
			objetivo: number;
			atingido: number;
			origem: {
				interno: {
					[key: string]: number;
				};
				externo: {
					[key: string]: number;
				};
			};
		};
	};
};

async function getSalesTeamResults(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();

	const partnerId = user.idParceiro;
	const partnerScope = user.permissoes.parceiros.escopo;
	const userId = user.id;
	const userScope = user.permissoes.resultados.escopo;

	const searchParams = request.nextUrl.searchParams;
	const { after, before } = QueryDatesSchema.parse({
		after: searchParams.get("after"),
		before: searchParams.get("before"),
	});

	const payload = await request.json();
	const { responsibles, partners, projectTypes } = GeneralStatsFiltersSchema.parse(payload);

	// Authorization checks
	if (userScope && !responsibles) {
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");
	}

	if (partnerScope && !partners) {
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");
	}

	if (userScope && responsibles?.some((r) => !userScope.includes(r))) {
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");
	}

	if (partnerScope && partners?.some((r) => !partnerScope.includes(r))) {
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");
	}

	const responsiblesQuery: Filter<TOpportunity> = responsibles ? { "responsaveis.id": { $in: responsibles } } : {};
	const userSaleGoalQuery: Filter<TSaleGoal> = responsibles ? { "usuario.id": { $in: responsibles } } : {};
	const partnerQuery = partners ? { idParceiro: { $in: [...partners, null] } } : {};
	const projectTypesQuery: Filter<TOpportunity> = projectTypes ? { "tipo.id": { $in: [...projectTypes] } } : {};

	const afterDate = dayjs(after).startOf("day").subtract(3, "hour").toDate();
	const beforeDate = dayjs(before).endOf("day").subtract(3, "hour").toDate();
	const currentPeriod = dayjs(beforeDate).format("MM/YYYY");

	const afterWithMarginDate = dayjs(afterDate).subtract(1, "month").toDate();
	const beforeWithMarginDate = dayjs(beforeDate).subtract(1, "month").toDate();

	const db = await connectToDatabase();
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");
	const saleGoalsCollection: Collection<TSaleGoal> = db.collection("sale-goals");

	const saleGoals = await getSaleGoals({ saleGoalsCollection, currentPeriod, userSaleGoalQuery, partnerQuery });
	const projects = await getOpportunities({
		opportunitiesCollection,
		responsiblesQuery,
		partnerQuery,
		projectTypesQuery,
		afterDate,
		beforeDate,
	});

	const salesTeamResults = projects.reduce((acc: TSellerSalesResults, current) => {
		const currentPeriod = dayjs(beforeDate).format("MM/YYYY");

		const seller = current.responsaveis.find((r) => r.papel === "VENDEDOR");
		if (!seller) return acc;
		const sellerSaleGoals = saleGoals.find((goals) => goals.usuario?.id === seller.id && goals.periodo === currentPeriod);

		const sdr = current.responsaveis.find((r) => r.papel === "SDR");
		const sdrName = sdr?.nome || "NÃO DEFINIDO";
		const clientAquisitionOrigin = current.canalAquisicao;

		// In case there's no info accumulated for the seller
		if (!acc[seller.nome]) {
			acc[seller.nome] = {
				potenciaPico: {
					objetivo: 0,
					atingido: 0,
					origem: {
						interno: {},
						externo: {},
					},
				},
				valorVendido: {
					objetivo: 0,
					atingido: 0,
					origem: {
						interno: {},
						externo: {},
					},
				},
				projetosVendidos: {
					objetivo: 0,
					atingido: 0,
					origem: {
						interno: {},
						externo: {},
					},
				},
				projetosCriados: {
					objetivo: 0,
					atingido: 0,
					origem: {
						interno: {},
						externo: {},
					},
				},
			};
		}

		// Insertion related checkings
		const insertDate = new Date(current.dataInsercao);
		const wasInsertedWithinCurrentPeriod = insertDate >= afterDate && insertDate <= beforeDate;
		const wasInsertedWithinPreviousPeriod = insertDate >= afterWithMarginDate && insertDate < beforeWithMarginDate;
		const cameFromInsideSales = !!sdr;

		// Signing related checkings
		const signatureDate = current.ganho?.data ? new Date(current.ganho.data) : null;
		const hasContractSigned = !!signatureDate;
		const wasSignedWithinCurrentPeriod = hasContractSigned && signatureDate >= afterDate && signatureDate <= beforeDate;
		const wasSignedWithinPreviousPeriod = hasContractSigned && signatureDate >= afterWithMarginDate && signatureDate < beforeWithMarginDate;
		const proposeValue = current.valorProposta;
		const proposePeakPower = current.potenciaPicoProposta || 0;

		if (sellerSaleGoals) {
			acc[seller.nome].potenciaPico.objetivo = sellerSaleGoals.metas.potenciaVendida || 0;
			acc[seller.nome].valorVendido.objetivo = sellerSaleGoals.metas.valorVendido || 0;
			acc[seller.nome].projetosVendidos.objetivo = sellerSaleGoals.metas.projetosVendidos || 0;
			acc[seller.nome].projetosCriados.objetivo = sellerSaleGoals.metas.projetosCriados || 0;
		}

		// Increasing ATUAL qtys based on checkings
		if (wasSignedWithinCurrentPeriod) acc[seller.nome].potenciaPico.atingido += proposePeakPower;
		if (wasSignedWithinCurrentPeriod) acc[seller.nome].valorVendido.atingido += proposeValue;
		if (wasSignedWithinCurrentPeriod) acc[seller.nome].projetosVendidos.atingido += 1;
		if (wasInsertedWithinCurrentPeriod) acc[seller.nome].projetosCriados.atingido += 1;

		// Increasing qtys based on projects origin
		const insertionPeriod: "ATUAL" | "ANTERIOR" = wasInsertedWithinCurrentPeriod ? "ATUAL" : wasInsertedWithinPreviousPeriod ? "ANTERIOR" : "ATUAL";
		const signingPeriod: "ATUAL" | "ANTERIOR" = wasSignedWithinCurrentPeriod ? "ATUAL" : wasSignedWithinPreviousPeriod ? "ANTERIOR" : "ATUAL";

		if (cameFromInsideSales) {
			// In case the project came from inside sales, computing major indicators based on inside name
			if (signingPeriod) {
				if (!acc[seller.nome].potenciaPico.origem.interno[sdrName]) acc[seller.nome].potenciaPico.origem.interno[sdrName] = 0;
				acc[seller.nome].potenciaPico.origem.interno[sdrName] += proposePeakPower;
			}
			if (signingPeriod) {
				if (!acc[seller.nome].valorVendido.origem.interno[sdrName]) acc[seller.nome].valorVendido.origem.interno[sdrName] = 0;
				acc[seller.nome].valorVendido.origem.interno[sdrName] += proposeValue;
			}
			if (signingPeriod) {
				if (!acc[seller.nome].projetosVendidos.origem.interno[sdrName]) acc[seller.nome].projetosVendidos.origem.interno[sdrName] = 0;
				acc[seller.nome].projetosVendidos.origem.interno[sdrName] += 1;
			}
			if (insertionPeriod) {
				if (!acc[seller.nome].projetosCriados.origem.interno[sdrName]) acc[seller.nome].projetosCriados.origem.interno[sdrName] = 0;
				acc[seller.nome].projetosCriados.origem.interno[sdrName] += 1;
			}
		} else {
			// Validating if there's the aquisition origin added
			if (!clientAquisitionOrigin) return acc;
			// In case the project came from a valid origin, computing major indicators based on origin name
			if (signingPeriod) {
				if (!acc[seller.nome].potenciaPico.origem.externo[clientAquisitionOrigin]) acc[seller.nome].potenciaPico.origem.externo[clientAquisitionOrigin] = 0;
				acc[seller.nome].potenciaPico.origem.externo[clientAquisitionOrigin] += proposePeakPower;
			}
			if (signingPeriod) {
				if (!acc[seller.nome].valorVendido.origem.externo[clientAquisitionOrigin]) acc[seller.nome].valorVendido.origem.externo[clientAquisitionOrigin] = 0;
				acc[seller.nome].valorVendido.origem.externo[clientAquisitionOrigin] += proposeValue;
			}
			if (signingPeriod) {
				if (!acc[seller.nome].projetosVendidos.origem.externo[clientAquisitionOrigin]) acc[seller.nome].projetosVendidos.origem.externo[clientAquisitionOrigin] = 0;
				acc[seller.nome].projetosVendidos.origem.externo[clientAquisitionOrigin] += 1;
			}
			if (insertionPeriod) {
				if (!acc[seller.nome].projetosCriados.origem.externo[clientAquisitionOrigin]) acc[seller.nome].projetosCriados.origem.externo[clientAquisitionOrigin] = 0;
				acc[seller.nome].projetosCriados.origem.externo[clientAquisitionOrigin] += 1;
			}
		}
		return acc;
	}, {});

	return NextResponse.json({
		data: salesTeamResults,
		message: "Resultados da equipe de vendas recuperados com sucesso",
	});
}

async function getSaleGoals({
	saleGoalsCollection,
	currentPeriod,
	userSaleGoalQuery,
	partnerQuery,
}: {
	saleGoalsCollection: Collection<TSaleGoal>;
	currentPeriod: string;
	userSaleGoalQuery: Filter<TSaleGoal>;
	partnerQuery: any;
}) {
	const match = { periodo: currentPeriod, ...userSaleGoalQuery, ...partnerQuery };
	const saleGoals = await saleGoalsCollection.find(match).toArray();
	return saleGoals;
}

type GetProjectsParams = {
	opportunitiesCollection: Collection<TOpportunity>;
	responsiblesQuery: Filter<TOpportunity>;
	partnerQuery: any;
	projectTypesQuery: Filter<TOpportunity>;
	afterDate: Date;
	beforeDate: Date;
};

type TPromotersResultsProject = {
	idMarketing: TOpportunity["idMarketing"];
	responsaveis: TOpportunity["responsaveis"];
	ganho: TOpportunity["ganho"];
	valorProposta: TProposal["valor"];
	potenciaPicoProposta: TProposal["potenciaPico"];
	canalAquisicao: TClient["canalAquisicao"];
	dataInsercao: string;
};

async function getOpportunities({ opportunitiesCollection, responsiblesQuery, partnerQuery, projectTypesQuery, afterDate, beforeDate }: GetProjectsParams) {
	const afterDateStr = afterDate.toISOString();
	const beforeDateStr = beforeDate.toISOString();
	const match = {
		...partnerQuery,
		...responsiblesQuery,
		...projectTypesQuery,
		$or: [
			{ $and: [{ "responsaveis.dataInsercao": { $gte: afterDateStr } }, { "responsaveis.dataInsercao": { $lte: beforeDateStr } }] },
			{ $and: [{ dataInsercao: { $gte: afterDateStr } }, { dataInsercao: { $lte: beforeDateStr } }] },
			{ $and: [{ "perda.data": { $gte: afterDateStr } }, { "perda.data": { $lte: beforeDateStr } }] },
			{ $and: [{ "ganho.data": { $gte: afterDateStr } }, { "ganho.data": { $lte: beforeDateStr } }] },
		],
		dataExclusao: null,
	};
	const addFields = { activeProposeObjectID: { $toObjectId: "$ganho.idProposta" }, clientObjectId: { $toObjectId: "$idCliente" } };
	const proposeLookup = { from: "proposals", localField: "activeProposeObjectID", foreignField: "_id", as: "proposta" };
	const clientLookup = { from: "clients", localField: "clientObjectId", foreignField: "_id", as: "cliente" };
	const projection = {
		idMarketing: 1,
		responsaveis: 1,
		ganho: 1,
		"proposta.valor": 1,
		"proposta.potenciaPico": 1,
		"cliente.canalAquisicao": 1,
		dataInsercao: 1,
	};
	const result = await opportunitiesCollection
		.aggregate([{ $match: match }, { $addFields: addFields }, { $lookup: proposeLookup }, { $lookup: clientLookup }, { $project: projection }])
		.toArray();

	const opportunities = result.map((r: any) => ({
		idMarketing: r.idMarketing,
		responsaveis: r.responsaveis,
		ganho: r.ganho,
		valorProposta: r.proposta[0] ? r.proposta[0].valor : 0,
		potenciaPicoProposta: r.proposta[0] ? r.proposta[0].potenciaPico : 0,
		canalAquisicao: r.cliente[0] ? r.cliente[0].canalAquisicao : "NÃO DEFINIDO",
		dataInsercao: r.dataInsercao,
	}));

	return opportunities as TPromotersResultsProject[];
}

export type TSalesTeamResultsRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getSalesTeamResults>>>;
export const POST = apiHandler({ POST: getSalesTeamResults });
