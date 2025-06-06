import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import createHttpError from "http-errors";
import { NextResponse, type NextRequest } from "next/server";
import { QueryDatesSchema } from "../inputs";
import { GeneralStatsFiltersSchema } from "@/utils/schemas/stats.schema";
import type { Collection, Filter, WithId } from "mongodb";
import type { TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TProposal } from "@/utils/schemas/proposal.schema";
import type { TFunnel } from "@/utils/schemas/funnel.schema";
import { getHoursDiff } from "@/lib/methods/dates";
import dayjs from "dayjs";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { getPartnerFunnels } from "@/repositories/funnels/queries";
import { apiHandler, type UnwrapNextResponse } from "@/lib/api";

export type TInProgressResults = {
	[key: string]: {
		[key: string]: {
			projetos: number;
			valor: number;
		};
	};
};

export type TByFunnelResults = {
	funnel: string;
	stages: {
		stage: string;
		emAndamento: number;
		valor: number;
		entradas: number;
		saidas: number;
		tempoTotal: number;
		tempoMedio: number;
		perdas: {
			total: number;
			perdasPorMotivo: {
				[key: string]: number;
			};
		};
	}[];
}[];

async function getInProgressResults(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();

	if (!user) {
		throw new createHttpError.Unauthorized("Nível de autorização insuficiente.");
	}

	if (!user.permissoes?.resultados?.visualizarComercial) {
		throw new createHttpError.Unauthorized("Nível de autorização insuficiente.");
	}

	const partnerScope = user.permissoes.parceiros.escopo;
	const userScope = user.permissoes.resultados.escopo;

	const searchParams = request.nextUrl.searchParams;
	const searchParamsObject = {
		after: searchParams.get("after"),
		before: searchParams.get("before"),
	};
	console.log("[sales-funnels] searchParams", searchParamsObject);
	const payload = await request.json();
	console.log("[sales-funnels] payload", payload);
	const { after, before } = QueryDatesSchema.parse(searchParamsObject);
	const { responsibles, partners, projectTypes } = GeneralStatsFiltersSchema.parse(payload);

	if (!!userScope && !responsibles)
		// If user has a scope defined and in the request there isnt a responsible arr defined, then user is trying
		// to access a overall visualiation, which he/she isnt allowed
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");

	if (!!partnerScope && !partners)
		// If user has a scope defined and in the request there isnt a partners arr defined, then user is trying
		// to access a overall visualiation, which he/she isnt allowed
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");

	if (!!userScope && responsibles?.some((r) => !userScope.includes(r)))
		// If user has a scope defined and in the responsible arr request there is a single responsible that is not in hes/shes scope
		// then user is trying to access a visualization he/she isnt allowed
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");

	if (!!partnerScope && partners?.some((r) => !partnerScope.includes(r)))
		// If user has a scope defined and in the partner arr request there is a single partner that is not in hes/shes scope
		// then user is trying to access a visualization he/she isnt allowed
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");

	const responsiblesQuery: Filter<TOpportunity> = responsibles ? { "responsaveis.id": { $in: responsibles } } : {};
	const partnerQuery = partners ? { idParceiro: { $in: [...partners, null] } } : {};
	const projectTypesQuery: Filter<TOpportunity> = projectTypes ? { "tipo.id": { $in: [...projectTypes] } } : {};

	const afterDate = dayjs(after).startOf("day").subtract(3, "hour").toDate();
	const beforeDate = dayjs(before).endOf("day").subtract(3, "hour").toDate();
	// console.log(afterDate, beforeDate)
	const db = await connectToDatabase();
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");
	const funnelsCollection: Collection<TFunnel> = db.collection("funnels");
	const funnelReferencesCollection: Collection<TFunnelReference> = db.collection("funnel-references");
	const projects = await getOpportunities({
		opportunitiesCollection,
		responsiblesQuery,
		afterDate,
		beforeDate,
		partnerQuery: partnerQuery as Filter<TOpportunity>,
		projectTypesQuery,
	});
	const funnels = await getPartnerFunnels({ collection: funnelsCollection, query: partnerQuery as Filter<TFunnel> });
	const funnelsReferences = await getFunnelReferences({
		funnelReferencesCollection,
		partnerQuery: partnerQuery as {
			idParceiro: {
				$in: string[];
			};
		},
	});

	console.log("[sales-funnels] projects found", projects.length);
	console.log("[sales-funnels] funnels found", funnels.length);
	console.log("[sales-funnels] funnelsReferences found", funnelsReferences.length);
	const funnelsReduced = getFunnelsReduced({ funnels });
	// Getting the basic structure of data to work on top of
	const inProgressResults = projects.reduce((acc, current) => {
		// Getting the funnel references that refer to the iterrating opportunity
		const currentProjectFunnels = funnelsReferences.filter((f) => f.idOportunidade == current._id);
		const proposeValue = current.valorProposta;
		const isInProgress = !current.dataPerda;

		const lossDate = current.dataPerda ? new Date(current.dataPerda) : null;
		const lossReason = current.dataPerda ? current.motivoPerda : null;
		// Itarating through the funnel references
		currentProjectFunnels?.forEach((funnel, index: number) => {
			const funnelStageId = funnel.idEstagioFunil;
			const existingFunnel = funnels.find((f) => f._id.toString() == funnel.idFunil);
			if (!existingFunnel) return acc;
			const existingStage = existingFunnel.etapas.find((stage) => stage.id == funnelStageId);
			if (!existingStage) return acc;
			const funnelName = existingFunnel.nome;
			const stageId = existingStage.id;
			const stageName = existingStage.nome;
			const wasLostInCurrentPeriod = !!lossDate && lossDate >= afterDate && lossDate <= beforeDate;

			// In case there is not a loss date (and no win data, filtered before), then the opportunity is still in progress
			// So, updating the number of emAndamento and the total value of active proposals in hand
			if (isInProgress) acc[funnelName][stageName].emAndamento += 1;
			if (isInProgress) acc[funnelName][stageName].valor += proposeValue;

			// In case the opportunity was lost within the current period of query, them, updating the information regarding number o losses and losses by reason
			if (wasLostInCurrentPeriod) {
				acc[funnelName][stageName].perdas.total += 1;
				if (!acc[funnelName][stageName].perdas.perdasPorMotivo[lossReason || ""]) acc[funnelName][stageName].perdas.perdasPorMotivo[lossReason || ""] = 0;
				acc[funnelName][stageName].perdas.perdasPorMotivo[lossReason || ""] += 1;
			}

			// Iterating over the stages information
			Object.entries(funnel.estagios).forEach(([key, stage]) => {
				const historyStageName = existingFunnel.etapas.find((e) => e.id.toString() == key.toString())?.nome;
				if (!historyStageName) return acc;
				const arrivalDate = stage?.entrada ? new Date(stage.entrada) : null;
				const exitDate = stage?.saida ? new Date(stage.saida) : null;
				const diff = !!arrivalDate && !!exitDate ? getHoursDiff({ start: arrivalDate.toISOString(), finish: exitDate.toISOString() }) : 0;
				const hasArrivedInCurrentPeriod = !!arrivalDate && arrivalDate >= afterDate && arrivalDate <= beforeDate;
				const hasExitedInCurrentPeriod = !!exitDate && exitDate >= afterDate && exitDate <= beforeDate;
				// Updating the entradas number based on the arrival of the opportunity in the iterrating funnel stage
				if (hasArrivedInCurrentPeriod) acc[funnelName][historyStageName].entradas += 1;
				// Upating th saidas number based on the exit of the opportunity from the iterrating funnel stage
				if (hasExitedInCurrentPeriod) acc[funnelName][historyStageName].saidas += 1;
				acc[funnelName][historyStageName].tempoTotal += diff;
			});
		});
		return acc;
	}, funnelsReduced);

	const inprogress = Object.entries(inProgressResults).map(([key, value]) => {
		const stages = Object.entries(value).map(([key, value]) => ({
			stage: key,
			emAndamento: value.emAndamento,
			valor: value.valor,
			entradas: value.entradas,
			saidas: value.saidas,
			tempoTotal: value.tempoTotal,
			tempoMedio: value.tempoTotal / value.saidas,
			perdas: value.perdas,
		}));
		return {
			funnel: key,
			stages,
		};
	});
	return NextResponse.json({ data: inprogress });
}

export type TInProgressResultsRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getInProgressResults>>>;
export const POST = apiHandler({ POST: getInProgressResults });

type GetFunnelsReduceParams = {
	funnels: WithId<TFunnel>[];
};
type TFunnelReduced = {
	[key: string]: {
		[key: string]: {
			emAndamento: number;
			entradas: number;
			saidas: number;
			tempoTotal: number;
			tempoMedio: number;
			perdas: {
				total: number;
				perdasPorMotivo: {
					[key: string]: number;
				};
			};
			valor: number;
		};
	};
};
function getFunnelsReduced({ funnels }: GetFunnelsReduceParams) {
	const funnelsReduced = funnels.reduce((acc: TFunnelReduced, current: TFunnel) => {
		const funnelName = current.nome;
		if (!acc[funnelName]) {
			const obj: {
				[key: string]: {
					emAndamento: number;
					valor: number;
					entradas: number;
					saidas: number;
					tempoTotal: number;
					tempoMedio: number;
					perdas: {
						total: number;
						perdasPorMotivo: {
							[key: string]: number;
						};
					};
				};
			} = {};
			current.etapas.forEach((stage, index: any) => {
				obj[stage.nome] = {
					emAndamento: 0,
					valor: 0,
					entradas: 0,
					saidas: 0,
					tempoTotal: 0,
					tempoMedio: 0,
					perdas: {
						total: 0,
						perdasPorMotivo: {},
					},
				};
			});
			acc[funnelName] = obj;
		}
		return acc;
	}, {});
	return funnelsReduced;
}
type GetProjetsParams = {
	opportunitiesCollection: Collection<TOpportunity>;
	responsiblesQuery: Filter<TOpportunity>;
	projectTypesQuery: Filter<TOpportunity>;
	afterDate: Date;
	beforeDate: Date;
	partnerQuery: Filter<TOpportunity>;
};
type TInProgressResultsProject = {
	_id: string;
	valorProposta: TProposal["valor"];
	motivoPerda: TOpportunity["perda"]["descricaoMotivo"];
	dataPerda: TOpportunity["perda"]["data"];
};
async function getOpportunities({ opportunitiesCollection, responsiblesQuery, afterDate, beforeDate, partnerQuery, projectTypesQuery }: GetProjetsParams) {
	try {
		const afterDateStr = afterDate.toISOString();
		const beforeDateStr = beforeDate.toISOString();
		const match = {
			...responsiblesQuery,
			...partnerQuery,
			...projectTypesQuery,
			$or: [{ "ganho.data": null, "perda.data": null }, { $and: [{ "perda.data": { $gte: afterDateStr } }, { "perda.data": { $lte: beforeDateStr } }] }],
			dataExclusao: null,
		};
		const addFields = { activeProposeObjectID: { $toObjectId: "$idPropostaAtiva" } };
		const proposeLookup = { from: "proposals", localField: "activeProposeObjectID", foreignField: "_id", as: "proposta" };
		const projection = { "proposta.valor": 1, "perda.descricaoMotivo": 1, "perda.data": 1 };
		const result = await opportunitiesCollection.aggregate([{ $match: match }, { $addFields: addFields }, { $lookup: proposeLookup }, { $project: projection }]).toArray();

		const projects = result.map((r) => ({
			_id: r._id.toString(),
			valorProposta: r.proposta[0] ? r.proposta[0].valor : 0,
			motivoPerda: r.perda.descricaoMotivo,
			dataPerda: r.perda.data,
		})) as TInProgressResultsProject[];
		return projects;
	} catch (error) {
		console.error("[ERROR] Error running getOpportunities", error);
		throw error;
	}
}

type GetFunnelReferencesParams = {
	funnelReferencesCollection: Collection<TFunnelReference>;
	partnerQuery: {
		idParceiro: {
			$in: string[];
		};
	};
};
async function getFunnelReferences({ funnelReferencesCollection, partnerQuery }: GetFunnelReferencesParams) {
	try {
		const references = await funnelReferencesCollection.find({ ...partnerQuery }).toArray();
		return references;
	} catch (error) {
		console.log("[ERROR] Error running getFunnelReferences", error);
		throw error;
	}
}
