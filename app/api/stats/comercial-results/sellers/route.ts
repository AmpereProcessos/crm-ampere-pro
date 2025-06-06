import type { TUser, TUserDTO } from "@/utils/schemas/user.schema";
import { NextResponse, type NextRequest } from "next/server";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import createHttpError from "http-errors";
import { QueryDatesSchema } from "@/utils/schemas/stats.schema";
import dayjs from "dayjs";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { Collection, Filter } from "mongodb";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TProposal } from "@/utils/schemas/proposal.schema";
import { getSalePromoters } from "@/repositories/users/queries";
import { apiHandler, type UnwrapNextResponse } from "@/lib/api";

type TGoals = {
	projetosCriados: number;
	projetosVendidos: number;
	potenciaVendida: number;
	valorVendido: number;
	projetosEnviados: number;
	conversao: number;
};

type TTwoPeriodGoals = {
	primeiro: {
		projetosCriados: number;
		projetosVendidos: number;
		potenciaVendida: number;
		valorVendido: number;
		projetosEnviados: number;
		conversao: number;
	};
	segundo: {
		projetosCriados: number;
		projetosVendidos: number;
		potenciaVendida: number;
		valorVendido: number;
		projetosEnviados: number;
		conversao: number;
	};
};
type TMonthResult = {
	"1": number;
	"2": number;
	"3": number;
	"4": number;
	"5": number;
	"6": number;
	"7": number;
	"8": number;
	"9": number;
	"10": number;
	"11": number;
	"12": number;
};
type TSalePromoterResultsByIdReduced = {
	primeiro: {
		potenciaVendida: {
			objetivo: number;
			atingido: number;
			mensal: TMonthResult;
		};
		valorVendido: {
			objetivo: number;
			atingido: number;
			mensal: TMonthResult;
		};
		projetosVendidos: {
			objetivo: number;
			atingido: number;
			mensal: TMonthResult;
		};
		projetosCriados: {
			objetivo: number;
			atingido: number;
			mensal: TMonthResult;
		};
		projetosEnviados: {
			objetivo: number;
			atingido: number;
			mensal: TMonthResult;
		};
		conversao: {
			objetivo: number;
			atingido: number;
			mensal: TMonthResult;
		};
	};
	segundo: {
		potenciaVendida: {
			objetivo: number;
			atingido: number;
			mensal: TMonthResult;
		};
		valorVendido: {
			objetivo: number;
			atingido: number;
			mensal: TMonthResult;
		};
		projetosVendidos: {
			objetivo: number;
			atingido: number;
			mensal: TMonthResult;
		};
		projetosCriados: {
			objetivo: number;
			atingido: number;
			mensal: TMonthResult;
		};
		projetosEnviados: {
			objetivo: number;
			atingido: number;
			mensal: TMonthResult;
		};
		conversao: {
			objetivo: number;
			atingido: number;
			mensal: TMonthResult;
		};
	};
};
export type TSalePromoterResultsById = {
	id: string;
	nome: string;
	avatar_url: string | null | undefined;
	primeiro: {
		potenciaVendida: {
			objetivo: number;
			atingido: number;
			mensal: { mes: string; valor: number }[];
		};
		valorVendido: {
			objetivo: number;
			atingido: number;
			mensal: { mes: string; valor: number }[];
		};
		projetosVendidos: {
			objetivo: number;
			atingido: number;
			mensal: { mes: string; valor: number }[];
		};
		projetosCriados: {
			objetivo: number;
			atingido: number;
			mensal: { mes: string; valor: number }[];
		};
		projetosEnviados: {
			objetivo: number;
			atingido: number;
			mensal: { mes: string; valor: number }[];
		};
		conversao: {
			objetivo: number;
			atingido: number;
			mensal: { mes: string; valor: number }[];
		};
	};
	segundo: {
		potenciaVendida: {
			objetivo: number;
			atingido: number;
			mensal: { mes: string; valor: number }[];
		};
		valorVendido: {
			objetivo: number;
			atingido: number;
			mensal: { mes: string; valor: number }[];
		};
		projetosVendidos: {
			objetivo: number;
			atingido: number;
			mensal: { mes: string; valor: number }[];
		};
		projetosCriados: {
			objetivo: number;
			atingido: number;
			mensal: { mes: string; valor: number }[];
		};
		projetosEnviados: {
			objetivo: number;
			atingido: number;
			mensal: { mes: string; valor: number }[];
		};
		conversao: {
			objetivo: number;
			atingido: number;
			mensal: { mes: string; valor: number }[];
		};
	};
};

export type TSalePromotersResultsReduced = {
	[key: string]: {
		id: TUserDTO["_id"];
		nome: TUser["nome"];
		avatar_url: TUser["avatar_url"];
		potenciaVendida: {
			objetivo: number;
			atingido: number;
		};
		valorVendido: {
			objetivo: number;
			atingido: number;
		};
		projetosVendidos: {
			objetivo: number;
			atingido: number;
		};
		projetosCriados: {
			objetivo: number;
			atingido: number;
		};
		projetosEnviados: {
			objetivo: number;
			atingido: number;
		};
		conversao: {
			objetivo: number;
			atingido: number;
		};
	};
};
export type TSalePromotersResults = {
	id: TUserDTO["_id"];
	nome: TUser["nome"];
	avatar_url: TUser["avatar_url"];
	potenciaVendida: {
		objetivo: number;
		atingido: number;
	};
	valorVendido: {
		objetivo: number;
		atingido: number;
	};
	projetosVendidos: {
		objetivo: number;
		atingido: number;
	};
	projetosCriados: {
		objetivo: number;
		atingido: number;
	};
	projetosEnviados: {
		objetivo: number;
		atingido: number;
	};
	conversao: {
		objetivo: number;
		atingido: number;
	};
}[];

async function getSalePromotersResults(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	if (!user) {
		throw new createHttpError.Unauthorized("Nível de autorização insuficiente.");
	}

	if (!user.permissoes?.resultados?.visualizarComercial) throw new createHttpError.Unauthorized("Nível de autorização insuficiente.");
	const searchParams = request.nextUrl.searchParams;

	const { after, before } = QueryDatesSchema.parse({
		after: searchParams.get("after"),
		before: searchParams.get("before"),
	});

	const afterDate = dayjs(after).startOf("day").subtract(3, "hour").toDate();
	const beforeDate = dayjs(before).endOf("day").subtract(3, "hour").toDate();
	const afterDateStr = afterDate.toISOString();
	const beforeDateStr = beforeDate.toISOString();

	const db = await connectToDatabase();
	const usersCollection = db.collection<TUser>("users");
	const opportunitiesCollection = db.collection<TOpportunity>("opportunities");

	const queryOpportunities = {
		$or: [
			{ $and: [{ dataInsercao: { $gte: afterDateStr } }, { dataInsercao: { $lte: beforeDateStr } }] },
			{ $and: [{ "ganho.data": { $gte: afterDateStr } }, { "ganho.data": { $lte: beforeDateStr } }] },
		],
		dataExclusao: null,
	};

	const salePromoters = await getSalePromoters({ collection: usersCollection, query: {} });
	const opportunities = await getOpportunities({ opportunitiesCollection, query: queryOpportunities });

	const initialResultsReduced = salePromoters.reduce((acc: TSalePromotersResultsReduced, current) => {
		const promoterSaleGoals = current.metas.reduce(
			(acc: TGoals, goalCurrent) => {
				const afterDatetime = new Date(afterDate).getTime();
				const beforeDatetime = new Date(beforeDate).getTime();

				const monthStartDatetime = new Date(goalCurrent.periodoInicio).getTime();
				const monthEndDatetime = new Date(goalCurrent.periodoFim).getTime();
				let multiplier = 0;
				if ((afterDatetime < monthStartDatetime && beforeDatetime < monthStartDatetime) || (afterDatetime > monthEndDatetime && beforeDatetime > monthEndDatetime)) return acc;
				// Caso o período de filtro da query compreenda o mês inteiro
				if (afterDatetime <= monthStartDatetime && beforeDatetime >= monthEndDatetime) {
					multiplier = 1;
				} else {
					if (beforeDatetime > monthEndDatetime) {
						const applicableDays = dayjs(goalCurrent.periodoFim).diff(dayjs(afterDate), "days");

						multiplier = applicableDays / goalCurrent.periodoDias;
					} else {
						const applicableDays = dayjs(beforeDate).diff(dayjs(goalCurrent.periodoInicio), "days");

						multiplier = applicableDays / goalCurrent.periodoDias;
					}
				}
				acc.projetosCriados += (goalCurrent.metas?.projetosCriados || 0) * multiplier;
				acc.potenciaVendida += (goalCurrent.metas?.potenciaVendida || 0) * multiplier;
				acc.valorVendido += (goalCurrent.metas?.valorVendido || 0) * multiplier;
				acc.projetosVendidos += (goalCurrent.metas?.projetosVendidos || 0) * multiplier;
				acc.projetosEnviados += (goalCurrent.metas?.projetosEnviados || 0) * multiplier;
				acc.conversao += (goalCurrent.metas?.conversao || 0) * multiplier;

				return acc;
			},
			{
				projetosCriados: 0,
				potenciaVendida: 0,
				valorVendido: 0,
				projetosVendidos: 0,
				projetosEnviados: 0,
				conversao: 0,
			},
		);
		acc[current.nome] = {
			id: current._id.toString(),
			nome: current.nome,
			avatar_url: current.avatar_url,
			potenciaVendida: {
				atingido: 0,
				objetivo: promoterSaleGoals.potenciaVendida,
			},
			valorVendido: {
				atingido: 0,
				objetivo: promoterSaleGoals.valorVendido,
			},
			projetosVendidos: {
				atingido: 0,
				objetivo: promoterSaleGoals.projetosVendidos,
			},
			projetosCriados: {
				atingido: 0,
				objetivo: promoterSaleGoals.projetosCriados,
			},
			projetosEnviados: {
				atingido: 0,
				objetivo: promoterSaleGoals.projetosEnviados,
			},
			conversao: {
				atingido: 0,
				objetivo: promoterSaleGoals.conversao,
			},
		};
		return acc;
	}, {});

	const results = opportunities.reduce((acc: TSalePromotersResultsReduced, current) => {
		const seller = current.responsaveis.find((r) => r.papel === "VENDEDOR");
		const sdr = current.responsaveis.find((r) => r.papel === "SDR");

		// If there is a sdr and seller, than is a trasfered project
		const isTransfer = !!sdr && !!seller;
		const insider = !!sdr;

		const transferDate = seller?.dataInsercao ? new Date(seller.dataInsercao) : null;
		const wasTransferedWithinCurrentPeriod = transferDate && transferDate >= afterDate && transferDate < beforeDate;

		// Insertion related checkings
		const insertDate = new Date(current.dataInsercao);
		const wasInsertedWithinCurrentPeriod = insertDate >= afterDate && insertDate <= beforeDate;

		// Signing related checkings
		const signatureDate = current.ganho?.data ? new Date(current.ganho.data) : null;
		const hasContractSigned = !!signatureDate;
		const wasSignedWithinCurrentPeriod = hasContractSigned && signatureDate >= afterDate && signatureDate <= beforeDate;
		const proposeValue = current.valorProposta;
		const proposePeakPower = current.potenciaPicoProposta || 0;

		// Increasing based on checkings
		if (seller) {
			if (!acc[seller.nome]) return acc;
			if (wasInsertedWithinCurrentPeriod) acc[seller.nome].projetosCriados.atingido += 1;
			if (wasSignedWithinCurrentPeriod) acc[seller.nome].projetosVendidos.atingido += 1;
			if (wasSignedWithinCurrentPeriod) acc[seller.nome].valorVendido.atingido += proposeValue;
			if (wasSignedWithinCurrentPeriod) acc[seller.nome].potenciaVendida.atingido += proposePeakPower;
		}
		if (sdr) {
			if (!acc[sdr.nome]) return acc;
			if (wasInsertedWithinCurrentPeriod) acc[sdr.nome].projetosCriados.atingido += 1;
			if (wasSignedWithinCurrentPeriod) acc[sdr.nome].projetosVendidos.atingido += 1;
			if (wasSignedWithinCurrentPeriod) acc[sdr.nome].valorVendido.atingido += proposeValue;
			if (wasSignedWithinCurrentPeriod) acc[sdr.nome].potenciaVendida.atingido += proposePeakPower;
			if (!!isTransfer && wasTransferedWithinCurrentPeriod) acc[sdr.nome].projetosEnviados.atingido += 1;
		}

		return acc;
	}, initialResultsReduced);

	const response: TSalePromotersResults = Object.values(results)
		.map((value) => ({
			id: value.id,
			nome: value.nome,
			avatar_url: value.avatar_url,
			potenciaVendida: value?.potenciaVendida,
			valorVendido: value?.valorVendido,
			projetosVendidos: value?.projetosVendidos,
			projetosCriados: value?.projetosCriados,
			projetosEnviados: value?.projetosEnviados,
			conversao: {
				objetivo: value?.conversao.objetivo,
				atingido: value?.projetosVendidos.atingido / value?.projetosCriados.atingido,
			},
		}))
		.sort((a, b) => a.nome.localeCompare(b.nome));

	return NextResponse.json({ data: response }, { status: 200 });
}

export type TSalePromotersResultsRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getSalePromotersResults>>>;
export const POST = apiHandler({ POST: getSalePromotersResults });

type TPromotersResultsProject = {
	idMarketing: TOpportunity["idMarketing"];
	responsaveis: TOpportunity["responsaveis"];
	ganho: TOpportunity["ganho"];
	valorProposta: TProposal["valor"];
	potenciaPicoProposta: TProposal["potenciaPico"];
	canalAquisicao: TClient["canalAquisicao"];
	dataInsercao: string;
};
type GetOpportunitiesParams = {
	opportunitiesCollection: Collection<TOpportunity>;
	query: Filter<TOpportunity>;
};
async function getOpportunities({ opportunitiesCollection, query }: GetOpportunitiesParams) {
	try {
		const match = query;
		const addFields = {
			activeProposeObjectID: {
				$toObjectId: "$ganho.idProposta",
			},
			clientObjectId: { $toObjectId: "$idCliente" },
		};
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
		const projects = result.map((r) => ({
			idMarketing: r.idMarketing,
			responsaveis: r.responsaveis,
			ganho: r.ganho,
			valorProposta: r.proposta[0] ? r.proposta[0].valor : 0,
			potenciaPicoProposta: r.proposta[0] ? r.proposta[0].potenciaPico : 0,
			canalAquisicao: r.cliente[0] ? r.cliente[0].canalAquisicao : "NÃO DEFINIDO",
			dataInsercao: r.dataInsercao,
		})) as TPromotersResultsProject[];
		return projects;
	} catch (error) {
		console.log("[ERROR] - getOpportunities", error);
		throw error;
	}
}
