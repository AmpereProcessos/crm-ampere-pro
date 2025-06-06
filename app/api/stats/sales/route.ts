import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";
import createHttpError from "http-errors";
import type { Collection, Db, ObjectId, WithId } from "mongodb";
import dayjs from "dayjs";
import type { TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import type { TFunnel } from "@/utils/schemas/funnel.schema";
import type { TSaleGoal } from "@/utils/schemas/sale-goal.schema";
import type { TUser, TUserEntity } from "@/utils/schemas/user.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";

type TPersonalizedOpportunity = {
	_id: ObjectId;
	nome: string;
	tipo: string;
	idRDStation?: string | null;
	responsaveis: {
		id: string;
		nome: string;
		papel: string;
		avatar_url?: string | null;
	}[];
	idPropostaAtiva?: string | null;
	ganho: {
		idProposta?: string | null;
		idProjeto?: string | null;
		data?: string | null;
	};
	perda: {
		idMotivo?: string | null;
		descricaoMotivo?: string | null;
		data?: string | null;
	};
	autor: {
		id: string;
		nome: string;
		avatar_url?: string | null;
	};
	proposta: {
		_id: string;
		nome: string;
		valor: number;
		potenciaPico: number;
	}[];
	cliente: {
		canalAquisicao?: string | null;
	}[];
	dataInsercao: 1;
};
type TSalesStatsByPromoter = {
	[key: string]: {
		ANTERIOR: {
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
		ATUAL: {
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
};
type TSalesStatsBySDR = {
	[key: string]: {
		ATUAL: {
			potenciaPico: {
				objetivo: number;
				atingido: number;
				origem: {
					INBOUND: number;
					OUTBOUND: number;
				};
			};
			valorVendido: {
				objetivo: number;
				atingido: number;
				origem: {
					INBOUND: number;
					OUTBOUND: number;
				};
			};
			projetosVendidos: {
				objetivo: number;
				atingido: number;
				origem: {
					INBOUND: number;
					OUTBOUND: number;
				};
			};
			projetosCriados: {
				objetivo: number;
				atingido: number;
				origem: {
					INBOUND: number;
					OUTBOUND: number;
				};
			};
			projetosEnviados: {
				objetivo: number;
				atingido: number;
				origem: {
					INBOUND: number;
					OUTBOUND: number;
				};
			};
		};
		"POR VENDEDOR": {
			[key: string]: number;
		};
	};
};
type TSalesStatsByFunnel = {
	[key: string]: {
		[key: string]: {
			projetos: number;
			valor: number;
		};
	};
};
type TSalesStatsCondensed = {
	ANTERIOR: {
		projetosCriados: number;
		projetosGanhos: number;
		projetosPerdidos: number;
		totalVendido: number;
	};
	ATUAL: {
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
	};
};

export type TSalesStats = {
	vendas: TSalesStatsByPromoter;
	sdr: TSalesStatsBySDR;
	funis: TSalesStatsByFunnel;
	geral: TSalesStatsCondensed;
};

async function getSalesStats(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();

	if (!user.permissoes.oportunidades.visualizar) {
		throw new createHttpError.Unauthorized("Usuário não possui permissão para visualizar oportunidades.");
	}
	const userScope = user.permissoes.resultados.escopo;

	const partnerId = user.idParceiro;
	if (!partnerId) {
		throw new createHttpError.BadRequest("Usuário não possui parceiro associado.");
	}

	const searchParams = request.nextUrl.searchParams;
	const after = searchParams.get("after");
	const before = searchParams.get("before");
	const responsiblesParam = searchParams.get("responsibles");

	if (typeof responsiblesParam !== "string") throw new createHttpError.BadRequest("Parâmetro de responsáveis inválido.");
	if (responsiblesParam === "null" && !!userScope)
		// Validating for responsibles == null, which is view of all users result
		// If there is a defined scope, then, user is not allowed
		throw new createHttpError.BadRequest("Parâmetro de visualização não permitido para nível de acesso.");

	const responsiblesArr = responsiblesParam.split("/");
	if (!!userScope && responsiblesArr.some((resp) => !(userScope || []).includes(resp)))
		// If there is a defined scope and one of query responsibles isn't in it, then parameter is not allowed to the user
		throw new createHttpError.BadRequest("Parâmetro de visualização não permitido para escopo de acesso.");

	const responsiblesId = responsiblesParam === "null" ? null : responsiblesArr;
	if (typeof after !== "string" || typeof before !== "string") throw new createHttpError.BadRequest("Parâmetros de período inválidos.");

	const afterDate = dayjs(after).set("hour", -3).toDate();
	const beforeDate = dayjs(before).set("hour", 20).toDate();

	const afterWithMarginDate = new Date(dayjs(after).subtract(1, "month").toISOString());
	const beforeWithMarginDate = new Date(dayjs(before).subtract(1, "month").set("hour", 22).toISOString());

	const db: Db = await connectToDatabase();
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");
	const funnelsCollection: Collection<TFunnel> = db.collection("funnels");
	const funnelReferencesCollection: Collection<TFunnelReference> = db.collection("funnel-references");
	const goalsCollection: Collection<TSaleGoal> = db.collection("sale-goals");
	const usersCollection: Collection<TUser> = db.collection("users");

	const opportunities = await getOpportunities({ collection: opportunitiesCollection, partnerId: partnerId || "", responsiblesId: responsiblesId });
	const goalsInfo = await getSaleGoals({ collection: goalsCollection, partnerId: partnerId || "" });
	const promoters = await getPromoters({ collection: usersCollection, partnerId: partnerId || "" });
	const funnels = await getFunnels({ collection: funnelsCollection, partnerId: partnerId || "" });
	const funnelReferences = await getFunnelReferences({ collection: funnelReferencesCollection, partnerId: partnerId || "" });

	const byPromoter = getSalesInfo({ opportunities, goalsInfo, afterDate, beforeDate, afterWithMarginDate, beforeWithMarginDate, promoters });
	const sdrInfo = getSDRInfo({ opportunities, afterDate, beforeDate, goalsInfo, promoters });
	const funnelsInfo = getInProgressInfo({ opportunities, afterDate, beforeDate, funnels, funnelReferences });
	const condensedInfo = getCondensedInfo({ opportunities, afterDate, beforeDate, afterWithMarginDate, beforeWithMarginDate, promoters });

	// Implementação simplificada - você pode expandir com a lógica completa do arquivo original

	return NextResponse.json({
		data: {
			vendas: byPromoter,
			sdr: sdrInfo,
			funis: funnelsInfo,
			geral: condensedInfo,
		},
		message: "Estatísticas de vendas geradas com sucesso",
	});
}

export type TGetSalesStatsRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getSalesStats>>>;
export type TGetSalesStatsRouteOutputData = TGetSalesStatsRouteOutput["data"];

export const GET = apiHandler({ GET: getSalesStats });

type GetOpportunitiesParams = {
	partnerId: string;
	responsiblesId: string[] | null;
	collection: Collection<TOpportunity>;
};
async function getOpportunities({ partnerId, responsiblesId, collection }: GetOpportunitiesParams) {
	try {
		let pipeline: any[] = [];

		if (!responsiblesId) {
			pipeline = [
				{
					$match: {
						idParceiro: partnerId,
					},
				},
				{
					$addFields: {
						proposalObjectID: {
							$toObjectId: "$idPropostaAtiva",
						},
						clientObjectId: { $toObjectId: "$idCliente" },
					},
				},
				{
					$lookup: {
						from: "proposals",
						localField: "proposalObjectID",
						foreignField: "_id",
						as: "proposta",
					},
				},
				{
					$lookup: {
						from: "clients",
						localField: "clientObjectId",
						foreignField: "_id",
						as: "cliente",
					},
				},
				{
					$project: {
						nome: 1,
						tipo: 1,
						idRDStation: 1,
						responsaveis: 1,
						idPropostaAtiva: 1,
						ganho: 1,
						perda: 1,
						autor: 1,
						"proposta._id": 1,
						"proposta.nome": 1,
						"proposta.valor": 1,
						"proposta.potenciaPico": 1,
						"cliente.canalVenda": 1,
						dataInsercao: 1,
					},
				},
				{
					$sort: {
						dataInsercao: 1,
					},
				},
			];
		} else {
			pipeline = [
				{
					$match: {
						idParceiro: partnerId,
						"responsaveis.id": { $in: responsiblesId },
					},
				},
				{
					$addFields: {
						proposalObjectID: {
							$toObjectId: "$idPropostaAtiva",
						},
						clientObjectId: { $toObjectId: "$idCliente" },
					},
				},
				{
					$lookup: {
						from: "proposals",
						localField: "proposalObjectID",
						foreignField: "_id",
						as: "proposta",
					},
				},
				{
					$lookup: {
						from: "clients",
						localField: "clientObjectId",
						foreignField: "_id",
						as: "cliente",
					},
				},
				{
					$project: {
						nome: 1,
						tipo: 1,
						idRDStation: 1,
						responsaveis: 1,
						idPropostaAtiva: 1,
						ganho: 1,
						perda: 1,
						autor: 1,
						"proposta._id": 1,
						"proposta.nome": 1,
						"proposta.valorProposta": 1,
						"proposta.potenciaPico": 1,
						"cliente.canalVenda": 1,
						dataInsercao: 1,
					},
				},
				{
					$sort: {
						dataInsercao: 1,
					},
				},
			];
		}
		const projects = await collection.aggregate(pipeline).toArray();
		return projects as TPersonalizedOpportunity[];
	} catch (error) {
		console.error("[ERROR] - getOpportunities", error);
		throw error;
	}
}
type GetSaleGoalsParams = {
	collection: Collection<TSaleGoal>;
	partnerId: string;
};
async function getSaleGoals({ collection, partnerId }: GetSaleGoalsParams) {
	try {
		const saleGoals = await collection.find({ idParceiro: partnerId }).toArray();
		return saleGoals;
	} catch (error) {
		console.error("[ERROR] - getSaleGoals", error);
		throw error;
	}
}
type GetPromotersParams = {
	collection: Collection<TUser>;
	partnerId: string;
};
async function getPromoters({ collection, partnerId }: GetPromotersParams) {
	try {
		const promoters = await collection
			.aggregate([{ $match: { idParceiro: partnerId, ativo: true, idGrupo: { $in: ["66562a2a812707dbf9f04832", "66562a2a812707dbf9f04833"] } } }, { $project: { senha: 0 } }])
			.toArray();
		return promoters as WithId<TUserEntity>[];
	} catch (error) {
		console.error("[ERROR] - getPromoters", error);
		throw error;
	}
}
type GetFunnelsParams = {
	collection: Collection<TFunnel>;
	partnerId: string;
};
async function getFunnels({ collection, partnerId }: GetFunnelsParams) {
	try {
		const funnels = await collection.find({ idParceiro: partnerId }).toArray();
		return funnels;
	} catch (error) {
		console.error("[ERROR] - getFunnels", error);
		throw error;
	}
}
type GetFunnelReferencesParams = {
	collection: Collection<TFunnelReference>;
	partnerId: string;
};
async function getFunnelReferences({ collection, partnerId }: GetFunnelReferencesParams) {
	try {
		const funnelReferences = await collection.find({ idParceiro: partnerId }).toArray();
		return funnelReferences;
	} catch (error) {
		console.error("[ERROR] - getFunnelReferences", error);
		throw error;
	}
}

type GetSalesInfoParams = {
	opportunities: TPersonalizedOpportunity[];
	goalsInfo: TSaleGoal[];
	afterDate: Date;
	beforeDate: Date;
	afterWithMarginDate: Date;
	beforeWithMarginDate: Date;
	promoters: WithId<TUserEntity>[];
};
function getSalesInfo({ opportunities, goalsInfo, afterDate, beforeDate, afterWithMarginDate, beforeWithMarginDate, promoters }: GetSalesInfoParams) {
	const condensedByPromoter = opportunities.reduce((acc: TSalesStatsByPromoter, current) => {
		const currentPeriod = dayjs(beforeDate).format("MM/YYYY");

		const seller = current.responsaveis.find((resp) => resp.papel === "VENDEDOR");
		const sdr = current.responsaveis.find((resp) => resp.papel === "SDR");

		const responsibleName = seller?.nome || "NÃO DEFINIDO";
		const responsibleId = seller?.id || "";
		const responsibleSaleGoals = goalsInfo.find((goals) => goals.usuario.nome === responsibleName && goals.periodo === currentPeriod);
		const responsibleUserInfo = promoters.find((promoter) => promoter._id.toString() === responsibleId);

		const representativeName = sdr?.nome || "NÃO DEFINIDO";

		const client = current.cliente[0];
		const clientAquisitionOrigin = client?.canalAquisicao || undefined;

		// Checking for unactive users, or users that aren't in the sales team
		if (!responsibleUserInfo) return acc; // || responsibleUserInfo.idGrupo != '3'
		// In case the user is disabled, not computing info

		// In case there's no info accumulated for the responsibleName
		if (!acc[responsibleName])
			acc[responsibleName] = {
				ANTERIOR: {
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
				},
				ATUAL: {
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
				},
			};
		// Insertion related checkings
		const insertDate = new Date(current.dataInsercao);
		const wasInsertedWithinCurrentPeriod = insertDate >= afterDate && insertDate <= beforeDate;
		const wasInsertedWithinPreviousPeriod = insertDate >= afterWithMarginDate && insertDate < beforeWithMarginDate;

		const isFromSDR = !!sdr;

		// Signing related checkings
		const wonDate = current.ganho?.data ? new Date(current.ganho.data) : null;
		const isWon = !!wonDate;
		const wasWonWithinCurrentPeriod = isWon && wonDate >= afterDate && wonDate <= beforeDate;
		const wasSignedWithinPreviousPeriod = isWon && wonDate >= afterWithMarginDate && wonDate < beforeWithMarginDate;
		const signedProposal = !!current.ganho?.idProposta && !!current.proposta ? current.proposta[0] : null;
		const proposalValue = !!signedProposal && signedProposal.valor ? signedProposal.valor : 0;
		const proposalPeakPower = !!signedProposal && signedProposal.potenciaPico ? signedProposal.potenciaPico : 0;

		if (responsibleSaleGoals) {
			acc[responsibleName].ATUAL.potenciaPico.objetivo = responsibleSaleGoals.metas.potenciaVendida || 0;
			acc[responsibleName].ATUAL.valorVendido.objetivo = responsibleSaleGoals.metas.valorVendido || 0;
			acc[responsibleName].ATUAL.projetosVendidos.objetivo = responsibleSaleGoals.metas.projetosVendidos || 0;
			acc[responsibleName].ATUAL.projetosCriados.objetivo = responsibleSaleGoals.metas.projetosCriados || 0;
		}

		// Increasing ATUAL qtys based on checkings
		if (wasWonWithinCurrentPeriod) acc[responsibleName].ATUAL.potenciaPico.atingido += proposalPeakPower;
		if (wasWonWithinCurrentPeriod) acc[responsibleName].ATUAL.valorVendido.atingido += proposalValue;
		if (wasWonWithinCurrentPeriod) acc[responsibleName].ATUAL.projetosVendidos.atingido += 1;
		if (wasInsertedWithinCurrentPeriod) acc[responsibleName].ATUAL.projetosCriados.atingido += 1;

		// Increasing ANTERIOR qtys based on checkings
		if (wasSignedWithinPreviousPeriod) acc[responsibleName].ANTERIOR.potenciaPico.atingido += proposalPeakPower;
		if (wasSignedWithinPreviousPeriod) acc[responsibleName].ANTERIOR.valorVendido.atingido += proposalValue;
		if (wasSignedWithinPreviousPeriod) acc[responsibleName].ANTERIOR.projetosVendidos.atingido += 1;
		if (wasInsertedWithinPreviousPeriod) acc[responsibleName].ANTERIOR.projetosCriados.atingido += 1;

		// Increasing qtys based on projects origin
		let insertionPeriod: "ATUAL" | "ANTERIOR" = "ATUAL"; // will define wether or not it was inserted within the two period of analysis
		if (wasInsertedWithinCurrentPeriod) insertionPeriod = "ATUAL";
		if (wasInsertedWithinPreviousPeriod) insertionPeriod = "ANTERIOR";

		let signingPeriod: "ATUAL" | "ANTERIOR" = "ATUAL"; // will define wether or not it was signed within the two period of analysis
		if (wasWonWithinCurrentPeriod) signingPeriod = "ATUAL";
		if (wasSignedWithinPreviousPeriod) signingPeriod = "ANTERIOR";

		if (isFromSDR) {
			// In case the project came from inside sales, computing major indicators based on inside name
			if (signingPeriod) {
				if (!acc[responsibleName][signingPeriod].potenciaPico.origem.interno[representativeName])
					acc[responsibleName][signingPeriod].potenciaPico.origem.interno[representativeName] = 0;

				acc[responsibleName][signingPeriod].potenciaPico.origem.interno[representativeName] += proposalPeakPower;
			}
			if (signingPeriod) {
				if (!acc[responsibleName][signingPeriod].valorVendido.origem.interno[representativeName])
					acc[responsibleName][signingPeriod].valorVendido.origem.interno[representativeName] = 0;

				acc[responsibleName][signingPeriod].valorVendido.origem.interno[representativeName] += proposalValue;
			}
			if (signingPeriod) {
				if (!acc[responsibleName][signingPeriod].projetosVendidos.origem.interno[representativeName])
					acc[responsibleName][signingPeriod].projetosVendidos.origem.interno[representativeName] = 0;

				acc[responsibleName][signingPeriod].projetosVendidos.origem.interno[representativeName] += 1;
			}
			if (insertionPeriod) {
				if (!acc[responsibleName][insertionPeriod].projetosCriados.origem.interno[representativeName])
					acc[responsibleName][insertionPeriod].projetosCriados.origem.interno[representativeName] = 0;

				acc[responsibleName][insertionPeriod].projetosCriados.origem.interno[representativeName] += 1;
			}
		} else {
			// Validating if there's the aquisition origin added
			if (!clientAquisitionOrigin) return acc;
			// In case the project came from an valid origin, computing major indicators based on origin name
			if (signingPeriod) {
				if (!acc[responsibleName][signingPeriod].potenciaPico.origem.externo[clientAquisitionOrigin])
					acc[responsibleName][signingPeriod].potenciaPico.origem.externo[clientAquisitionOrigin] = 0;

				acc[responsibleName][signingPeriod].potenciaPico.origem.externo[clientAquisitionOrigin] += proposalPeakPower;
			}
			if (signingPeriod) {
				if (!acc[responsibleName][signingPeriod].valorVendido.origem.externo[clientAquisitionOrigin])
					acc[responsibleName][signingPeriod].valorVendido.origem.externo[clientAquisitionOrigin] = 0;

				acc[responsibleName][signingPeriod].valorVendido.origem.externo[clientAquisitionOrigin] += proposalValue;
			}
			if (signingPeriod) {
				if (!acc[responsibleName][signingPeriod].projetosVendidos.origem.externo[clientAquisitionOrigin])
					acc[responsibleName][signingPeriod].projetosVendidos.origem.externo[clientAquisitionOrigin] = 0;

				acc[responsibleName][signingPeriod].projetosVendidos.origem.externo[clientAquisitionOrigin] += 1;
			}
			if (insertionPeriod) {
				if (!acc[responsibleName][insertionPeriod].projetosCriados.origem.externo[clientAquisitionOrigin])
					acc[responsibleName][insertionPeriod].projetosCriados.origem.externo[clientAquisitionOrigin] = 0;

				acc[responsibleName][insertionPeriod].projetosCriados.origem.externo[clientAquisitionOrigin] += 1;
			}
		}

		return acc;
	}, {});
	return condensedByPromoter;
}
type GetSDRInfoParams = {
	opportunities: TPersonalizedOpportunity[];
	goalsInfo: TSaleGoal[];
	afterDate: Date;
	beforeDate: Date;
	promoters: WithId<TUserEntity>[];
};
function getSDRInfo({ opportunities, goalsInfo, afterDate, beforeDate, promoters }: GetSDRInfoParams) {
	const reduced = opportunities.reduce((acc: TSalesStatsBySDR, current) => {
		// Insertion related checkings
		const currentPeriod = dayjs(afterDate).format("MM/YYYY");
		const insertDate = new Date(current.dataInsercao);
		const wasInsertedWithinCurrentPeriod = insertDate >= afterDate && insertDate <= beforeDate;

		// if (!wasInsertedWithinCurrentPeriod) return acc

		// Signing related checkings
		const wonDate = current.ganho?.data ? new Date(current.ganho.data) : null;
		const isWon = !!wonDate;
		const wasWonWithinCurrentPeriod = isWon && wonDate >= afterDate && wonDate <= beforeDate;
		const signedProposal = !!current.ganho?.idProposta && !!current.proposta ? current.proposta[0] : null;
		const proposalValue = !!signedProposal && signedProposal.valor ? signedProposal.valor : 0;
		const proposalPeakPower = !!signedProposal && signedProposal.potenciaPico ? signedProposal.potenciaPico : 0;

		const seller = current.responsaveis.find((resp) => resp.papel === "VENDEDOR");
		const sdr = current.responsaveis.find((resp) => resp.papel === "SDR");

		const isFromSDR = !!sdr;
		const hasSeller = !!seller;

		if (!isFromSDR) return acc;

		const sdrName = sdr.nome;
		const sellerName = seller?.nome || "NÃO DEFINIDO";
		const representativeSaleGoals = goalsInfo.find((goals) => goals.usuario?.nome === sdrName && goals.periodo === currentPeriod);
		const representativeUserInfo = promoters.find((promoter) => promoter._id.toString() === sdr.id);
		if (!representativeUserInfo) return acc;

		const isTransfer = hasSeller && isFromSDR;

		const isInbound = !!current.idRDStation;
		if (!acc[sdrName]) {
			acc[sdrName] = {
				ATUAL: {
					potenciaPico: {
						objetivo: 0,
						atingido: 0,
						origem: {
							INBOUND: 0,
							OUTBOUND: 0,
						},
					},
					valorVendido: {
						objetivo: 0,
						atingido: 0,
						origem: {
							INBOUND: 0,
							OUTBOUND: 0,
						},
					},
					projetosVendidos: {
						objetivo: 0,
						atingido: 0,
						origem: {
							INBOUND: 0,
							OUTBOUND: 0,
						},
					},
					projetosCriados: {
						objetivo: 0,
						atingido: 0,
						origem: {
							INBOUND: 0,
							OUTBOUND: 0,
						},
					},
					projetosEnviados: {
						objetivo: 0,
						atingido: 0,
						origem: {
							INBOUND: 0,
							OUTBOUND: 0,
						},
					},
				},
				"POR VENDEDOR": {
					[sellerName]: 0,
				},
			};
		}
		// Creating info for the current responsible, if non-existent
		if (isTransfer && !acc[sdrName]["POR VENDEDOR"][sellerName]) acc[sdrName]["POR VENDEDOR"][sellerName] = 0;

		// Defining goal information, if existent
		if (representativeSaleGoals) {
			acc[sdrName].ATUAL.potenciaPico.objetivo = representativeSaleGoals.metas.potenciaVendida || 0;
			acc[sdrName].ATUAL.valorVendido.objetivo = representativeSaleGoals.metas.valorVendido || 0;
			acc[sdrName].ATUAL.projetosVendidos.objetivo = representativeSaleGoals.metas.projetosVendidos || 0;
			acc[sdrName].ATUAL.projetosCriados.objetivo = representativeSaleGoals.metas.projetosCriados || 0;
			acc[sdrName].ATUAL.projetosEnviados.objetivo = representativeSaleGoals.metas.projetosEnviados || 0;
		}
		if (wasInsertedWithinCurrentPeriod) {
			if (isTransfer) acc[sdrName]["POR VENDEDOR"][sellerName] += 1;
			if (isTransfer) acc[sdrName].ATUAL.projetosEnviados.atingido += 1;
			acc[sdrName].ATUAL.projetosCriados.atingido += 1;

			if (isTransfer && isInbound) acc[sdrName].ATUAL.projetosEnviados.origem.INBOUND += 1;
			if (isTransfer && !isInbound) acc[sdrName].ATUAL.projetosEnviados.origem.OUTBOUND += 1;
			if (isInbound) acc[sdrName].ATUAL.projetosCriados.origem.INBOUND += 1;
			if (!isInbound) acc[sdrName].ATUAL.projetosCriados.origem.OUTBOUND += 1;
		}

		if (wasWonWithinCurrentPeriod) {
			acc[sdrName].ATUAL.potenciaPico.atingido += proposalPeakPower;
			acc[sdrName].ATUAL.valorVendido.atingido += proposalValue;
			acc[sdrName].ATUAL.projetosVendidos.atingido += 1;

			if (isInbound) acc[sdrName].ATUAL.potenciaPico.origem.INBOUND += proposalPeakPower;
			if (!isInbound) acc[sdrName].ATUAL.potenciaPico.origem.OUTBOUND += proposalPeakPower;
			if (isInbound) acc[sdrName].ATUAL.valorVendido.origem.INBOUND += proposalValue;
			if (!isInbound) acc[sdrName].ATUAL.valorVendido.origem.OUTBOUND += proposalValue;
			if (isInbound) acc[sdrName].ATUAL.projetosVendidos.origem.INBOUND += 1;
			if (!isInbound) acc[sdrName].ATUAL.projetosVendidos.origem.OUTBOUND += 1;
		}

		return acc;
	}, {});
	return reduced;
}
type GetInProgressInfoParams = {
	opportunities: TPersonalizedOpportunity[];
	afterDate: Date;
	beforeDate: Date;
	funnels: WithId<TFunnel>[];
	funnelReferences: TFunnelReference[];
};
function getInProgressInfo({ opportunities, afterDate, beforeDate, funnels, funnelReferences }: GetInProgressInfoParams) {
	const funnelsReduceObj = funnels.reduce((acc: TSalesStatsByFunnel, current) => {
		const funnelName = current.nome;
		if (!acc[funnelName]) {
			const obj: {
				[key: string]: {
					projetos: number;
					valor: number;
				};
			} = {};
			current.etapas.forEach((stage, index) => {
				const stageName = stage.nome;
				obj[stageName] = {
					projetos: 0,
					valor: 0,
				};
			});
			acc[funnelName] = obj;
		}
		return acc;
	}, {});
	const reduced = opportunities.reduce((acc: TSalesStatsByFunnel, current) => {
		const opportunityFunnelReferences = funnelReferences.filter((reference) => reference.idOportunidade === current._id.toString());
		const proposal = current.proposta[0] ?? null;
		const proposalValue = proposal?.valor ?? 0;
		opportunityFunnelReferences?.forEach((funnelReference, index: number) => {
			const funnelId = funnelReference.idFunil;
			const funnelStageId = funnelReference.idEstagioFunil;
			const existingFunnel = funnels.find((funnel) => funnel._id.toString() === funnelId);
			if (!existingFunnel) return acc;
			const existingStage = existingFunnel.etapas.find((stage) => stage.id === funnelStageId);
			if (!existingStage) return acc;
			const funnelName = existingFunnel.nome;
			const stageName = existingStage.nome;
			acc[funnelName][stageName].projetos += 1;
			acc[funnelName][stageName].valor += proposalValue;
		});
		return acc;
	}, funnelsReduceObj);
	return reduced;
}
type GetCondensedInfoParams = {
	opportunities: TPersonalizedOpportunity[];
	afterDate: Date;
	beforeDate: Date;
	afterWithMarginDate: Date;
	beforeWithMarginDate: Date;
	promoters: TUserEntity[];
};
function getCondensedInfo({ opportunities, afterDate, beforeDate, afterWithMarginDate, beforeWithMarginDate, promoters }: GetCondensedInfoParams) {
	const condensedInfo = opportunities.reduce(
		(acc: TSalesStatsCondensed, current) => {
			const seller = current.responsaveis.find((resp) => resp.papel === "VENDEDOR");
			const hasSeller = !!seller;

			const responsibleId = seller?.nome || "NÃO DEFINIDO";

			const sdr = current.responsaveis.find((resp) => resp.papel === "SDR");
			const hasSDR = !!sdr;

			const representativeId = sdr?.id;

			// Insertion related checkings
			const insertDate = new Date(current.dataInsercao);
			const wasInsertedWithinCurrentPeriod = insertDate >= afterDate && insertDate <= beforeDate;
			const wasInsertedWithinPreviousPeriod = insertDate >= afterWithMarginDate && insertDate < beforeWithMarginDate;

			// Signing related checkings
			const wonDate = current.ganho?.data ? new Date(current.ganho?.data) : null;
			const isWon = !!wonDate;
			const wasSignedWithinCurrentPeriod = isWon && wonDate >= afterDate && wonDate <= beforeDate;
			const wasSignedWithinPreviousPeriod = isWon && wonDate >= afterWithMarginDate && wonDate < beforeWithMarginDate;
			const signedProposal = !!current.ganho?.idProposta && !!current.proposta ? current.proposta[0] : null;
			const proposalValue = !!signedProposal && signedProposal.valor ? signedProposal.valor : 0;

			// Lost related checkings
			const lostDate = current.perda?.data ? new Date(current.perda.data) : null;
			const isLostProject = !!lostDate;
			const lossReason = current.perda.descricaoMotivo || "NÃO DEFINIDO";
			const wasLostWithinCurrentPeriod = isLostProject && lostDate >= afterDate && lostDate <= beforeDate;
			const wasLostWithinPreviousPeriod = isLostProject && lostDate >= afterWithMarginDate && lostDate <= beforeWithMarginDate;

			// Sale channel related information
			const isInbound = !!current.idRDStation;

			const isLead = hasSeller && hasSDR;
			const isSDROwn = !hasSeller && hasSDR;

			const isOutboundSDR = !isInbound && (isLead || isSDROwn);

			const isOutboundSeller = !isInbound && hasSeller && !hasSDR;
			// Increasing ATUAL qtys based on checkings
			if (wasInsertedWithinCurrentPeriod) {
				acc.ATUAL.projetosCriados.total += 1;
				if (isInbound) acc.ATUAL.projetosCriados.inbound += 1;
				if (isOutboundSDR) acc.ATUAL.projetosCriados.outboundSdr += 1;
				if (isOutboundSeller) acc.ATUAL.projetosCriados.outboundVendedor += 1;
			}
			if (wasSignedWithinCurrentPeriod) {
				acc.ATUAL.projetosGanhos.total += 1;
				if (isInbound) acc.ATUAL.projetosGanhos.inbound += 1;
				if (isOutboundSDR) acc.ATUAL.projetosGanhos.outboundSdr += 1;
				if (isOutboundSeller) acc.ATUAL.projetosGanhos.outboundVendedor += 1;
			}
			if (wasLostWithinCurrentPeriod) {
				acc.ATUAL.projetosPerdidos.total += 1;
				if (isInbound) acc.ATUAL.projetosPerdidos.inbound += 1;
				if (isOutboundSDR) acc.ATUAL.projetosPerdidos.outboundSdr += 1;
				if (isOutboundSeller) acc.ATUAL.projetosPerdidos.outboundVendedor += 1;

				if (!acc.ATUAL.perdasPorMotivo[lossReason]) acc.ATUAL.perdasPorMotivo[lossReason] = 0;
				acc.ATUAL.perdasPorMotivo[lossReason] += 1;
			}
			if (wasSignedWithinCurrentPeriod) {
				acc.ATUAL.totalVendido.total += proposalValue;
				if (isInbound) acc.ATUAL.totalVendido.inbound += proposalValue;
				if (isOutboundSDR) acc.ATUAL.totalVendido.outboundSdr += proposalValue;
				if (isOutboundSeller) acc.ATUAL.totalVendido.outboundVendedor += proposalValue;
			}

			// Increasing ANTERIOR qtys based on checkings
			if (wasInsertedWithinPreviousPeriod) acc.ANTERIOR.projetosCriados += 1;
			if (wasSignedWithinPreviousPeriod) acc.ANTERIOR.projetosGanhos += 1;
			if (wasLostWithinPreviousPeriod) acc.ANTERIOR.projetosPerdidos += 1;
			if (wasSignedWithinPreviousPeriod) acc.ANTERIOR.totalVendido += proposalValue;

			return acc;
		},
		{
			ANTERIOR: {
				projetosCriados: 0,
				projetosGanhos: 0,
				projetosPerdidos: 0,
				totalVendido: 0,
			},
			ATUAL: {
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
			},
		},
	);
	return condensedInfo;
}
