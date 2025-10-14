import { type UnwrapNextResponse, apiHandler } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TProposal } from "@/utils/schemas/proposal.schema";
import { GeneralStatsFiltersSchema } from "@/utils/schemas/stats.schema";
import dayjs from "dayjs";
import createHttpError from "http-errors";
import type { Collection, Filter } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { QueryDatesSchema } from "../inputs";

export type TOverallResults = {
	projetosCriados: {
		inbound: number;
		outboundVendedor: number;
		outboundSdr: number;
		total: number;
	};
	projetosGanhos: {
		inbound: number;
		outboundVendedor: number;
		outboundSdr: number;
		total: number;
	};
	conversao: {
		criado: {
			inbound: number;
			outboundVendedor: number;
			outboundSdr: number;
			total: number;
		};
		ganho: {
			inbound: number;
			outboundVendedor: number;
			outboundSdr: number;
			total: number;
		};
	};
	projetosPerdidos: {
		inbound: number;
		outboundVendedor: number;
		outboundSdr: number;
		total: number;
	};
	totalVendido: {
		inbound: number;
		outboundVendedor: number;
		outboundSdr: number;
		total: number;
	};
	perdasPorMotivo: {
		[key: string]: number;
	};
	porCanalAquisicao: {
		[key: string]: {
			adquiridos: number;
			ganhos: number;
		};
	};
};

async function getOverallResults(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();

	const partnerScope = user.permissoes.parceiros.escopo;
	const userScope = user.permissoes.resultados.escopo;

	const searchParams = request.nextUrl.searchParams;
	const { after, before } = QueryDatesSchema.parse({
		after: searchParams.get("after"),
		before: searchParams.get("before"),
	});

	const payload = await request.json();
	const { responsibles, partners, projectTypes } =
		GeneralStatsFiltersSchema.parse(payload);

	console.log("[INFO] [GET_OVERALL_STATS] Query Params", { after, before });
	console.log("[INFO] [GET_OVERALL_STATS] Payload", {
		responsibles,
		partners,
		projectTypes,
	});

	// Authorization checks
	if (!!userScope && !responsibles) {
		throw new createHttpError.Unauthorized(
			"Seu usuário não possui solicitação para esse escopo de visualização.",
		);
	}

	if (!!partnerScope && !partners) {
		throw new createHttpError.Unauthorized(
			"Seu usuário não possui solicitação para esse escopo de visualização.",
		);
	}

	if (!!userScope && responsibles?.some((r) => !userScope.includes(r))) {
		throw new createHttpError.Unauthorized(
			"Seu usuário não possui solicitação para esse escopo de visualização.",
		);
	}

	if (!!partnerScope && partners?.some((r) => !partnerScope.includes(r))) {
		throw new createHttpError.Unauthorized(
			"Seu usuário não possui solicitação para esse escopo de visualização.",
		);
	}

	const responsiblesQuery: Filter<TOpportunity> = responsibles
		? { "responsaveis.id": { $in: responsibles } }
		: {};
	const partnerQuery = partners
		? { idParceiro: { $in: [...partners, null] } }
		: {};
	const projectTypesQuery: Filter<TOpportunity> = projectTypes
		? { "tipo.id": { $in: [...projectTypes] } }
		: {};

	const afterDate = dayjs(after).toDate();
	const beforeDate = dayjs(before).toDate();

	const db = await connectToDatabase();
	const opportunitiesCollection: Collection<TOpportunity> =
		db.collection("opportunities");

	const projects = await getOpportunities({
		opportunitiesCollection,
		responsiblesQuery,
		partnerQuery: partnerQuery as Filter<TOpportunity>,
		projectTypesQuery,
		afterDate,
		beforeDate,
	});

	const condensedResults = projects.reduce(
		(acc: TOverallResults, current) => {
			const clientAquisitionOrigin = current.canalAquisicao;
			if (!acc.porCanalAquisicao[clientAquisitionOrigin])
				acc.porCanalAquisicao[clientAquisitionOrigin] = {
					adquiridos: 0,
					ganhos: 0,
				};

			// Insertion related checkings
			const insertDate = new Date(current.dataInsercao);
			const wasInsertedWithinCurrentPeriod =
				insertDate >= afterDate && insertDate <= beforeDate;

			// Signing related checkings
			const signatureDate = current.ganho?.data
				? new Date(current.ganho?.data)
				: null;
			const hasContractSigned = !!signatureDate;
			const wasSignedWithinCurrentPeriod =
				hasContractSigned &&
				signatureDate >= afterDate &&
				signatureDate <= beforeDate;

			const proposeValue = current.valorProposta;

			// Lost related checkings
			const lostDate = current.dataPerda ? new Date(current.dataPerda) : null;
			const isLostProject = !!lostDate;
			const lossReason = current.motivoPerda || "NÃO DEFINIDO";
			const wasLostWithinCurrentPeriod =
				isLostProject && lostDate >= afterDate && lostDate <= beforeDate;

			// Sale channel related information
			const isInbound = !!current.idMarketing;

			const isTransfer = current.responsaveis.length > 1;
			const isFromInsider = !!current.responsaveis.find(
				(r) => r.papel === "SDR",
			);
			const isLead = isTransfer && isFromInsider;
			const isSDROwn = !isTransfer && isFromInsider;

			const isOutboundSDR = !isInbound && (isLead || isSDROwn);
			const isOutboundSeller = !isInbound && !isOutboundSDR;

			// Increasing ATUAL qtys based on checkings
			if (wasInsertedWithinCurrentPeriod) {
				acc.projetosCriados.total += 1;
				acc.conversao.criado.total += 1;
				if (signatureDate) acc.conversao.ganho.total += 1;
				if (isInbound) {
					acc.projetosCriados.inbound += 1;
					acc.conversao.criado.inbound += 1;
					if (signatureDate) acc.conversao.ganho.inbound += 1;
				}
				if (isOutboundSDR) {
					acc.projetosCriados.outboundSdr += 1;
					acc.conversao.criado.outboundSdr += 1;
					if (signatureDate) acc.conversao.ganho.outboundSdr += 1;
				}
				if (isOutboundSeller) {
					acc.projetosCriados.outboundVendedor += 1;
					acc.conversao.criado.outboundVendedor += 1;
					if (signatureDate) acc.conversao.ganho.outboundVendedor += 1;
				}
				acc.porCanalAquisicao[clientAquisitionOrigin].adquiridos += 1;
			}
			if (wasSignedWithinCurrentPeriod) {
				acc.projetosGanhos.total += 1;
				if (isInbound) acc.projetosGanhos.inbound += 1;
				if (isOutboundSDR) acc.projetosGanhos.outboundSdr += 1;
				if (isOutboundSeller) acc.projetosGanhos.outboundVendedor += 1;
				acc.porCanalAquisicao[clientAquisitionOrigin].ganhos += 1;
			}
			if (wasLostWithinCurrentPeriod) {
				acc.projetosPerdidos.total += 1;
				if (isInbound) acc.projetosPerdidos.inbound += 1;
				if (isOutboundSDR) acc.projetosPerdidos.outboundSdr += 1;
				if (isOutboundSeller) acc.projetosPerdidos.outboundVendedor += 1;

				if (!acc.perdasPorMotivo[lossReason])
					acc.perdasPorMotivo[lossReason] = 0;
				acc.perdasPorMotivo[lossReason] += 1;
			}
			if (wasSignedWithinCurrentPeriod) {
				acc.totalVendido.total += proposeValue;
				if (isInbound) acc.totalVendido.inbound += proposeValue;
				if (isOutboundSDR) acc.totalVendido.outboundSdr += proposeValue;
				if (isOutboundSeller) acc.totalVendido.outboundVendedor += proposeValue;
			}
			return acc;
		},
		{
			projetosCriados: {
				inbound: 0,
				outboundVendedor: 0,
				outboundSdr: 0,
				total: 0,
			},
			projetosGanhos: {
				inbound: 0,
				outboundVendedor: 0,
				outboundSdr: 0,
				total: 0,
			},
			conversao: {
				criado: {
					inbound: 0,
					outboundVendedor: 0,
					outboundSdr: 0,
					total: 0,
				},
				ganho: {
					inbound: 0,
					outboundVendedor: 0,
					outboundSdr: 0,
					total: 0,
				},
			},
			projetosPerdidos: {
				inbound: 0,
				outboundVendedor: 0,
				outboundSdr: 0,
				total: 0,
			},
			totalVendido: {
				inbound: 0,
				outboundVendedor: 0,
				outboundSdr: 0,
				total: 0,
			},
			perdasPorMotivo: {},
			porCanalAquisicao: {},
		},
	);

	return NextResponse.json({
		data: condensedResults,
		message: "Resultados gerais recuperados com sucesso",
	});
}

type GetProjectsParams = {
	opportunitiesCollection: Collection<TOpportunity>;
	responsiblesQuery: Filter<TOpportunity>;
	partnerQuery: Filter<TOpportunity>;
	projectTypesQuery: Filter<TOpportunity>;
	afterDate: Date;
	beforeDate: Date;
};
type TOverallResultsProject = {
	idMarketing: TOpportunity["idMarketing"];
	responsaveis: TOpportunity["responsaveis"];
	ganho: TOpportunity["ganho"];
	valorProposta: TProposal["valor"];
	canalAquisicao: TClient["canalAquisicao"];
	motivoPerda: TOpportunity["perda"]["descricaoMotivo"];
	dataPerda: TOpportunity["perda"]["data"];
	dataInsercao: TOpportunity["dataInsercao"];
};
async function getOpportunities({
	opportunitiesCollection,
	partnerQuery,
	responsiblesQuery,
	projectTypesQuery,
	afterDate,
	beforeDate,
}: GetProjectsParams) {
	try {
		const afterDateStr = afterDate.toISOString();
		const beforeDateStr = beforeDate.toISOString();
		const match = {
			...partnerQuery,
			...responsiblesQuery,
			...projectTypesQuery,
			$or: [
				{
					$and: [
						{ dataInsercao: { $gte: afterDateStr } },
						{ dataInsercao: { $lte: beforeDateStr } },
					],
				},
				{
					$and: [
						{ "perda.data": { $gte: afterDateStr } },
						{ "perda.data": { $lte: beforeDateStr } },
					],
				},
				{
					$and: [
						{ "ganho.data": { $gte: afterDateStr } },
						{ "ganho.data": { $lte: beforeDateStr } },
					],
				},
			],
			dataExclusao: null,
		};

		const projection = {
			idMarketing: 1,
			responsaveis: 1,
			ganho: 1,
			"proposta.valor": 1,
			"cliente.canalAquisicao": 1,
			perda: 1,
			dataInsercao: 1,
		};
		const result = await opportunitiesCollection
			.aggregate([{ $match: match }, { $project: projection }])
			.toArray();
		const projects = result.map((r) => ({
			idMarketing: r.idMarketing,
			responsaveis: r.responsaveis,
			ganho: r.ganho,
			valorProposta: r.proposta?.valor ?? 0,
			canalAquisicao: r.cliente?.canalAquisicao ?? "NÃO DEFINIDO",
			dataPerda: r.perda.data,
			motivoPerda: r.perda.descricaoMotivo,
			dataInsercao: r.dataInsercao,
		})) as TOverallResultsProject[];
		return projects;
	} catch (error) {
		console.error("[getOpportunities] Error fetching opportunities", error);
		throw error;
	}
}
export type TOverallResultsRouteOutput = UnwrapNextResponse<
	Awaited<ReturnType<typeof getOverallResults>>
>;
export const POST = apiHandler({ POST: getOverallResults });
