import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import { NextResponse, type NextRequest } from "next/server";
import { getDateFromString, getDateIsWithinPeriod, getHoursDiff } from "@/lib/methods/dates";
import connectToAmpereProjectsDatabase from "@/services/mongodb/ampere/projects-db-connection";
import {
	AllProcessTracked,
	CommissioningProcessesIds,
	ContractProcessesIds,
	ExecutionProcessesIds,
	HomologationProcessesIds,
	ProcessTrackedByProjectType,
	SupplyProcessesIds,
} from "@/utils/process-tracking";
import { AppProjectResultsSimplifiedProjection, type TAppProject } from "@/utils/schemas/integrations/app-ampere/projects.schema";
import dayjs from "dayjs";
import createHttpError from "http-errors";
import type { Collection, Filter, WithId } from "mongodb";
import { z } from "zod";

function getContractValue({ system, pa, structure }: { system: number | string; pa: number | string; structure: number | string }) {
	const projeto = !Number.isNaN(Number(system)) ? Number(system) : 0;
	const padrao = !Number.isNaN(Number(pa)) ? Number(pa) : 0;
	const estrutura = !Number.isNaN(Number(structure)) ? Number(structure) : 0;

	return projeto + padrao + estrutura;
}

const ProjectTypesTracked = Object.keys(ProcessTrackedByProjectType);

const QuerySchema = z.object({
	projectType: z.string({ required_error: "Tipo de projeto não fornecido ou inválido.", invalid_type_error: "Tipo de projeto não fornecido ou inválido." }),
	after: z
		.string({
			required_error: "Parâmetros de período não fornecidos ou inválidos.",
			invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
		})
		.datetime({ message: "Tipo inválido para parâmetro de período." }),
	before: z
		.string({
			required_error: "Parâmetros de período não fornecidos ou inválidos.",
			invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
		})
		.datetime({ message: "Tipo inválido para parâmetro de período." }),
});

export type TProcessTrackingStats = {
	[key: string]: {
		[key: string]: {
			andamento: number;
			concluidos: number;
			tempoTotalConclusao: number;
		};
	};
};

async function getProcessTrackingStats(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const partnerScope = user.permissoes.parceiros.escopo;

	const searchParams = request.nextUrl.searchParams;
	const { projectType, after, before } = QuerySchema.parse({
		projectType: searchParams.get("projectType"),
		after: searchParams.get("after"),
		before: searchParams.get("before"),
	});

	if (typeof projectType !== "string") throw new createHttpError.BadRequest("Tipo de projeto selecionado inválido ou não fornecido.");
	if (!(projectType in ProcessTrackedByProjectType)) throw new createHttpError.BadRequest("Tipo de projeto selecionado ainda não possui processos rastreados.");

	const ProjectTypeProcesses = ProcessTrackedByProjectType[projectType as keyof typeof ProcessTrackedByProjectType];
	const db = await connectToAmpereProjectsDatabase(process.env.MONGODB_URI);
	const collection: Collection<TAppProject> = db.collection("dados");
	const afterDate = dayjs(after).startOf("day").subtract(3, "hour").toDate();
	const beforeDate = dayjs(before).endOf("day").subtract(3, "hour").toDate();

	const afterDateStr = afterDate.toISOString();
	const beforeDateStr = beforeDate.toISOString();
	const partnerQuery = partnerScope ? { idParceiro: { $in: [...partnerScope] } } : {};

	const orQuery: Filter<TAppProject> = {
		$or: [
			{ "contrato.dataSolicitacao": { $gte: afterDateStr, $lte: beforeDateStr } },
			// In FORMULAÇÃO DE CONTRATO phase
			{ $and: [{ "contrato.dataSolicitacao": { $ne: null } }, { "contrato.dataLiberacao": null }] },
			{ "contrato.dataLiberacao": { $gte: afterDateStr, $lte: beforeDateStr } },
			// In COLETA DE ASSINATURA DO CONTRATO phase
			{ $and: [{ "contrato.dataLiberacao": { $ne: null } }, { "contrato.dataAssinatura": null }] },
			{ "contrato.dataAssinatura": { $gte: afterDateStr, $lte: beforeDateStr } },
			{ "homologacao.dataLiberacao": { $gte: afterDateStr, $lte: beforeDateStr } },
			// In INICIAÇÃO DE PROJETO phase
			{ $and: [{ "homologacao.dataLiberacao": { $ne: null } }, { "homologacao.documentacao.dataInicioElaboracao": null }] },
			{ "homologacao.documentacao.dataInicioElaboracao": { $gte: afterDateStr, $lte: beforeDateStr } },
			// In ELABORAÇÃO DA DOCUMENTAÇÃO phase
			{ $and: [{ "homologacao.documentacao.dataInicioElaboracao": { $ne: null } }, { "homologacao.documentacao.dataConclusaoElaboracao": null }] },
			{ "homologacao.documentacao.dataConclusaoElaboracao": { $gte: afterDateStr, $lte: beforeDateStr } },
			// In SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA phase
			{ $and: [{ "homologacao.documentacao.dataConclusaoElaboracao": { $ne: null } }, { "homologacao.acesso.dataSolicitacao": null }] },
			{ "homologacao.acesso.dataSolicitacao": { $gte: afterDateStr, $lte: beforeDateStr } },
			// In APROVAÇÃO DA CONCESSIONÁRIA phase
			{ $and: [{ "homologacao.acesso.dataSolicitacao": { $ne: null } }, { "homologacao.acesso.dataResposta": null }] },
			{ "homologacao.acesso.dataResposta": { $gte: afterDateStr, $lte: beforeDateStr } },
			// In SOLICITAÇÃO DE VISTORIA phase
			{ $and: [{ "obra.saida": { $ne: null } }, { "homologacao.vistoria.dataSolicitacao": null }] },
			{ "homologacao.vistoria.dataSolicitacao": { $gte: afterDateStr, $lte: beforeDateStr } },
			// In APROVAÇÃO DA VISTORIA phase
			{ $and: [{ "homologacao.vistoria.dataSolicitacao": { $ne: null } }, { "homologacao.vistoria.dataEfetivacao": null }] },
			{ "homologacao.vistoria.dataEfetivacao": { $gte: afterDateStr, $lte: beforeDateStr } },
			// In LIBERAÇÃO PARA COMPRA phase
			{ $and: [{ "contrato.dataAssinatura": { $ne: null } }, { "compra.dataLiberacao": null }] },
			{ "compra.dataLiberacao": { $gte: afterDateStr, $lte: beforeDateStr } },
			// In COMPRA DE PRODUTOS phase
			{ $and: [{ "compra.dataLiberacao": { $ne: null } }, { "compra.dataPedido": null }] },
			{ "compra.dataPedido": { $gte: afterDateStr, $lte: beforeDateStr } },
			// In ENTREGA DE PRODUTOS phase
			{ $and: [{ "compra.dataPedido": { $ne: null } }, { "compra.dataEntrega": null }] },
			{ "compra.dataEntrega": { $gte: afterDateStr, $lte: beforeDateStr } },
			// In PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO phase
			{ $and: [{ "compra.dataEntrega": { $ne: null } }, { "obra.entrada": null }] },
			// In PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO phase
			{ $and: [{ "contrato.dataAssinatura": { $ne: null } }, { "obra.entrada": null }] },
			{ "obra.entrada": { $gte: afterDateStr, $lte: beforeDateStr } },
			// In EXECUÇÃO phase
			{ $and: [{ "obra.entrada": { $ne: null } }, { "obra.saida": null }] },
			{ "obra.saida": { $gte: afterDateStr, $lte: beforeDateStr } },
		],
	};
	const query: Filter<TAppProject> = { ...partnerQuery, ...orQuery, tipoDeServico: projectType };

	const projects = await getSimplifiedProjects({ collection, query });
	const reduced = projects.reduce((acc: TProcessTrackingStats, current) => {
		// Checking for tracking of Contract related processes for the given project types
		if (ProjectTypeProcesses.some((p) => ContractProcessesIds.includes(p))) {
			if (!acc.CONTRATOS) acc.CONTRATOS = {};
			const contractSolicitationDate = getDateFromString(current.contrato.dataSolicitacao);
			const contractLiberationDate = getDateFromString(current.contrato.dataLiberacao);
			const contractSignatureDate = getDateFromString(current.contrato.dataAssinatura);

			if (ProjectTypeProcesses.includes("contract_formulation")) {
				if (!acc.CONTRATOS["FORMULAÇÃO DE CONTRATO"]) acc.CONTRATOS["FORMULAÇÃO DE CONTRATO"] = { concluidos: 0, andamento: 0, tempoTotalConclusao: 0 };
				const isInFormulation = !!contractSolicitationDate && !contractLiberationDate;
				if (isInFormulation) acc.CONTRATOS["FORMULAÇÃO DE CONTRATO"].andamento += 1;

				const wasFormulatedWithinPeriod = getDateIsWithinPeriod({ date: contractLiberationDate, after: afterDate, before: beforeDate });
				if (wasFormulatedWithinPeriod) {
					const time = contractSolicitationDate && contractLiberationDate ? getHoursDiff({ start: contractSolicitationDate, finish: contractLiberationDate }) || 8 : 0;
					acc.CONTRATOS["FORMULAÇÃO DE CONTRATO"].concluidos += 1;
					acc.CONTRATOS["FORMULAÇÃO DE CONTRATO"].tempoTotalConclusao += time <= 0 ? 8 : time;
				}
			}
			if (ProjectTypeProcesses.includes("contract_signature_collection")) {
				if (!acc.CONTRATOS["COLETA DE ASSINATURA DO CONTRATO"]) acc.CONTRATOS["COLETA DE ASSINATURA DO CONTRATO"] = { concluidos: 0, andamento: 0, tempoTotalConclusao: 0 };
				const isInSignatureCollection = !!contractLiberationDate && !contractSignatureDate;
				if (isInSignatureCollection) acc.CONTRATOS["COLETA DE ASSINATURA DO CONTRATO"].andamento += 1;

				const wasSignedWithinPeriod = getDateIsWithinPeriod({ date: contractSignatureDate, after: afterDate, before: beforeDate });
				if (wasSignedWithinPeriod) {
					const time = contractLiberationDate && contractSignatureDate ? getHoursDiff({ start: contractLiberationDate, finish: contractSignatureDate }) || 8 : 0;

					acc.CONTRATOS["COLETA DE ASSINATURA DO CONTRATO"].concluidos += 1;
					acc.CONTRATOS["COLETA DE ASSINATURA DO CONTRATO"].tempoTotalConclusao += time <= 0 ? 8 : time;
				}
			}
		}
		if (ProjectTypeProcesses.some((p) => HomologationProcessesIds.includes(p))) {
			if (!acc.HOMOLOGAÇÃO) acc.HOMOLOGAÇÃO = {};
			const homologationConcluded = current.homologacao.concluido;
			const homologationLiberationDate = getDateFromString(current.homologacao.dataLiberacao);
			const homologationElaborationStartDate = getDateFromString(current.homologacao.dataInicioElaboracao);
			const homologationElaborationEndDate = getDateFromString(current.homologacao.dataConclusaoElaboracao);
			const homologationAccessRequestDate = getDateFromString(current.homologacao.dataSolicitacaoAcesso);
			const homologationAccessResponseDate = getDateFromString(current.homologacao.dataRespostaAcesso);

			if (ProjectTypeProcesses.includes("homologation_initiation")) {
				if (!acc.HOMOLOGAÇÃO["INICIAÇÃO DE PROJETO"]) acc.HOMOLOGAÇÃO["INICIAÇÃO DE PROJETO"] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 };
				const isInHomologationInitiation = !homologationConcluded && !!homologationLiberationDate && !homologationElaborationStartDate;
				if (isInHomologationInitiation) acc.HOMOLOGAÇÃO["INICIAÇÃO DE PROJETO"].andamento += 1;
				const wasInitiatedWithinPeriod = getDateIsWithinPeriod({ date: homologationElaborationStartDate, after: afterDate, before: beforeDate });
				if (wasInitiatedWithinPeriod) {
					const time =
						homologationLiberationDate && homologationElaborationStartDate ? getHoursDiff({ start: homologationLiberationDate, finish: homologationElaborationStartDate }) || 8 : 0;

					acc.HOMOLOGAÇÃO["INICIAÇÃO DE PROJETO"].concluidos += 1;
					acc.HOMOLOGAÇÃO["INICIAÇÃO DE PROJETO"].tempoTotalConclusao += time <= 0 ? 8 : time;
				}
			}
			if (ProjectTypeProcesses.includes("homologation_documents_elaboration")) {
				if (!acc.HOMOLOGAÇÃO["ELABORAÇÃO DA DOCUMENTAÇÃO"]) acc.HOMOLOGAÇÃO["ELABORAÇÃO DA DOCUMENTAÇÃO"] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 };
				const isInHomologationElaboration = !homologationConcluded && !!homologationElaborationStartDate && !homologationElaborationEndDate;
				if (isInHomologationElaboration) acc.HOMOLOGAÇÃO["ELABORAÇÃO DA DOCUMENTAÇÃO"].andamento += 1;
				const wasElaboratedWithinPeriod = getDateIsWithinPeriod({ date: homologationElaborationEndDate, after: afterDate, before: beforeDate });
				if (wasElaboratedWithinPeriod) {
					const time =
						homologationElaborationStartDate && homologationElaborationEndDate
							? getHoursDiff({ start: homologationElaborationStartDate, finish: homologationElaborationEndDate }) || 8
							: 0;

					acc.HOMOLOGAÇÃO["ELABORAÇÃO DA DOCUMENTAÇÃO"].concluidos += 1;
					acc.HOMOLOGAÇÃO["ELABORAÇÃO DA DOCUMENTAÇÃO"].tempoTotalConclusao += time <= 0 ? 8 : time;
				}
			}
			if (ProjectTypeProcesses.includes("homologation_utility_company_access_request")) {
				if (!acc.HOMOLOGAÇÃO["SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA"])
					acc.HOMOLOGAÇÃO["SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA"] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 };
				const isInAccessRequest = !homologationConcluded && !!homologationElaborationEndDate && !homologationAccessRequestDate;
				if (isInAccessRequest) acc.HOMOLOGAÇÃO["SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA"].andamento += 1;
				const wasRequestedWithinPeriod = getDateIsWithinPeriod({ date: homologationAccessRequestDate, after: afterDate, before: beforeDate });
				if (wasRequestedWithinPeriod) {
					const time =
						homologationElaborationEndDate && homologationAccessRequestDate ? getHoursDiff({ start: homologationElaborationEndDate, finish: homologationAccessRequestDate }) || 8 : 0;

					acc.HOMOLOGAÇÃO["SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA"].concluidos += 1;
					acc.HOMOLOGAÇÃO["SOLICITAÇÃO DE ACESSO A CONCESSIONÁRIA"].tempoTotalConclusao += time <= 0 ? 8 : time;
				}
			}
			if (ProjectTypeProcesses.includes("homologation_utility_company_response")) {
				if (!acc.HOMOLOGAÇÃO["APROVAÇÃO DA CONCESSIONÁRIA"]) acc.HOMOLOGAÇÃO["APROVAÇÃO DA CONCESSIONÁRIA"] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 };
				const isInAccessResponse = !homologationConcluded && !!homologationAccessRequestDate && !homologationAccessResponseDate;
				if (isInAccessResponse) acc.HOMOLOGAÇÃO["APROVAÇÃO DA CONCESSIONÁRIA"].andamento += 1;
				const wasResponsedWithinPeriod = getDateIsWithinPeriod({ date: homologationAccessResponseDate, after: afterDate, before: beforeDate });
				if (wasResponsedWithinPeriod) {
					const time =
						homologationAccessRequestDate && homologationAccessResponseDate ? getHoursDiff({ start: homologationAccessRequestDate, finish: homologationAccessResponseDate }) || 8 : 0;

					acc.HOMOLOGAÇÃO["APROVAÇÃO DA CONCESSIONÁRIA"].concluidos += 1;
					acc.HOMOLOGAÇÃO["APROVAÇÃO DA CONCESSIONÁRIA"].tempoTotalConclusao += time <= 0 ? 8 : time;
				}
			}
			if (ProjectTypeProcesses.includes("homologation_inspection_request")) {
				if (!acc.HOMOLOGAÇÃO["SOLICITAÇÃO DE VISTORIA"]) acc.HOMOLOGAÇÃO["SOLICITAÇÃO DE VISTORIA"] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 };
				const executionFinishDate = getDateFromString(current.execucao.fim);
				const inspectionRequestDate = getDateFromString(current.homologacao.dataSolicitacaoVistoria);
				const isInInspectionRequest = !homologationConcluded && !!executionFinishDate && !inspectionRequestDate;
				if (isInInspectionRequest) acc.HOMOLOGAÇÃO["SOLICITAÇÃO DE VISTORIA"].andamento += 1;
				const wasInspectionRequestedWithinPeriod = getDateIsWithinPeriod({ date: inspectionRequestDate, after: afterDate, before: beforeDate });
				if (wasInspectionRequestedWithinPeriod) {
					const time = executionFinishDate && inspectionRequestDate ? getHoursDiff({ start: executionFinishDate, finish: inspectionRequestDate }) || 8 : 0;

					acc.HOMOLOGAÇÃO["SOLICITAÇÃO DE VISTORIA"].concluidos += 1;
					acc.HOMOLOGAÇÃO["SOLICITAÇÃO DE VISTORIA"].tempoTotalConclusao += time <= 0 ? 8 : time;
				}
			}
			if (ProjectTypeProcesses.includes("homologation_inspection_effectuation")) {
				if (!acc.HOMOLOGAÇÃO["APROVAÇÃO DA VISTORIA"]) acc.HOMOLOGAÇÃO["APROVAÇÃO DA VISTORIA"] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 };
				const inspectionRequestDate = getDateFromString(current.homologacao.dataSolicitacaoVistoria);
				const inspectionEffectuationDate = getDateFromString(current.homologacao.dataEfetivacaoVistoria);
				const isInInspectionEffectuation = !homologationConcluded && !!inspectionRequestDate && !inspectionEffectuationDate;
				if (isInInspectionEffectuation) acc.HOMOLOGAÇÃO["APROVAÇÃO DA VISTORIA"].andamento += 1;
				const wasInspectionEffectuatedWithinPeriod = getDateIsWithinPeriod({ date: inspectionEffectuationDate, after: afterDate, before: beforeDate });
				if (wasInspectionEffectuatedWithinPeriod) {
					const time = inspectionRequestDate && inspectionEffectuationDate ? getHoursDiff({ start: inspectionRequestDate, finish: inspectionEffectuationDate }) || 8 : 0;

					acc.HOMOLOGAÇÃO["APROVAÇÃO DA VISTORIA"].concluidos += 1;
					acc.HOMOLOGAÇÃO["APROVAÇÃO DA VISTORIA"].tempoTotalConclusao += time <= 0 ? 8 : time;
				}
			}
		}
		if (ProjectTypeProcesses.some((p) => SupplyProcessesIds.includes(p))) {
			if (!acc.SUPRIMENTOS) acc.SUPRIMENTOS = {};
			const supplyConcluded = current.compra.concluido;
			const contractSignatureDate = getDateFromString(current.contrato.dataAssinatura);
			const supplyLiberationDate = getDateFromString(current.compra.dataLiberacao);
			const supplyOrderDate = getDateFromString(current.compra.dataPedido);
			const supplyDeliveryDate = getDateFromString(current.compra.dataEntrega);

			if (ProjectTypeProcesses.includes("supply_purchase_release")) {
				if (!acc.SUPRIMENTOS["LIBERAÇÃO PARA COMPRA"]) acc.SUPRIMENTOS["LIBERAÇÃO PARA COMPRA"] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 };
				const isInPurchaseRelease = !supplyConcluded && !!contractSignatureDate && !supplyLiberationDate;
				if (isInPurchaseRelease) acc.SUPRIMENTOS["LIBERAÇÃO PARA COMPRA"].andamento += 1;
				const wasPurchaseReleasedWithinPeriod = getDateIsWithinPeriod({ date: supplyLiberationDate, after: afterDate, before: beforeDate });
				if (wasPurchaseReleasedWithinPeriod) {
					const time = contractSignatureDate && supplyLiberationDate ? getHoursDiff({ start: contractSignatureDate, finish: supplyLiberationDate }) || 8 : 0;

					acc.SUPRIMENTOS["LIBERAÇÃO PARA COMPRA"].concluidos += 1;
					acc.SUPRIMENTOS["LIBERAÇÃO PARA COMPRA"].tempoTotalConclusao += time <= 0 ? 8 : time;
				}
			}
			if (ProjectTypeProcesses.includes("supply_purchase_order")) {
				if (!acc.SUPRIMENTOS["COMPRA DE PRODUTOS"]) acc.SUPRIMENTOS["COMPRA DE PRODUTOS"] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 };
				const isInPurchaseOrder = !supplyConcluded && !!supplyLiberationDate && !supplyOrderDate;
				if (isInPurchaseOrder) acc.SUPRIMENTOS["COMPRA DE PRODUTOS"].andamento += 1;
				const wasPurchaseOrderedWithinPeriod = getDateIsWithinPeriod({ date: supplyOrderDate, after: afterDate, before: beforeDate });
				if (wasPurchaseOrderedWithinPeriod) {
					const time = supplyLiberationDate && supplyOrderDate ? getHoursDiff({ start: supplyLiberationDate, finish: supplyOrderDate }) || 8 : 0;

					acc.SUPRIMENTOS["COMPRA DE PRODUTOS"].concluidos += 1;
					acc.SUPRIMENTOS["COMPRA DE PRODUTOS"].tempoTotalConclusao += time <= 0 ? 8 : time;
				}
			}
			if (ProjectTypeProcesses.includes("supply_purchase_delivery")) {
				if (!acc.SUPRIMENTOS["ENTREGA DE PRODUTOS"]) acc.SUPRIMENTOS["ENTREGA DE PRODUTOS"] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 };
				const isInPurchaseDelivery = !supplyConcluded && !!supplyOrderDate && !supplyDeliveryDate;
				if (isInPurchaseDelivery) acc.SUPRIMENTOS["ENTREGA DE PRODUTOS"].andamento += 1;
				const wasPurchaseDeliveredWithinPeriod = getDateIsWithinPeriod({ date: supplyDeliveryDate, after: afterDate, before: beforeDate });
				if (wasPurchaseDeliveredWithinPeriod) {
					const time = supplyOrderDate && supplyDeliveryDate ? getHoursDiff({ start: supplyOrderDate, finish: supplyDeliveryDate }) || 8 : 0;

					acc.SUPRIMENTOS["ENTREGA DE PRODUTOS"].concluidos += 1;
					acc.SUPRIMENTOS["ENTREGA DE PRODUTOS"].tempoTotalConclusao += time <= 0 ? 8 : time;
				}
			}
		}
		if (ProjectTypeProcesses.some((p) => ExecutionProcessesIds.includes(p))) {
			if (!acc.EXECUÇÃO) acc.EXECUÇÃO = {};
			const executionConcluded = current.execucao.concluido;
			const contractSignatureDate = getDateFromString(current.contrato.dataAssinatura);
			const supplyDeliveryDate = getDateFromString(current.compra.dataEntrega);
			const executionStartDate = getDateFromString(current.execucao.inicio);
			const executionFinishDate = getDateFromString(current.execucao.fim);

			if (ProjectTypeProcesses.includes("execution_post_delivery_planning")) {
				if (!acc.EXECUÇÃO["PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO"]) acc.EXECUÇÃO["PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO"] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 };
				const isInPostDeliveryPlanning = !executionConcluded && !!supplyDeliveryDate && !executionStartDate;
				if (isInPostDeliveryPlanning) acc.EXECUÇÃO["PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO"].andamento += 1;
				const wasPostDeliveryPlannedWithinPeriod = getDateIsWithinPeriod({ date: executionStartDate, after: afterDate, before: beforeDate });
				if (wasPostDeliveryPlannedWithinPeriod) {
					const time = supplyDeliveryDate && executionStartDate ? getHoursDiff({ start: supplyDeliveryDate, finish: executionStartDate }) || 8 : 0;

					acc.EXECUÇÃO["PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO"].concluidos += 1;
					acc.EXECUÇÃO["PLANEJAMENTO PÓS ENTREGA PARA EXECUÇÃO"].tempoTotalConclusao += time <= 0 ? 8 : time;
				}
			}
			if (ProjectTypeProcesses.includes("execution_post_contract_planning")) {
				if (!acc.EXECUÇÃO["PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO"]) acc.EXECUÇÃO["PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO"] = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 };
				const isInPostContractPlanning = !executionConcluded && !!contractSignatureDate && !executionStartDate;
				if (isInPostContractPlanning) acc.EXECUÇÃO["PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO"].andamento += 1;
				const wasPostContractPlannedWithinPeriod = getDateIsWithinPeriod({ date: executionStartDate, after: afterDate, before: beforeDate });
				if (wasPostContractPlannedWithinPeriod) {
					const time = contractSignatureDate && executionStartDate ? getHoursDiff({ start: contractSignatureDate, finish: executionStartDate }) || 8 : 0;

					acc.EXECUÇÃO["PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO"].concluidos += 1;
					acc.EXECUÇÃO["PLANEJAMENTO PÓS CONTRATO PARA EXECUÇÃO"].tempoTotalConclusao += time <= 0 ? 8 : time;
				}
			}
			if (ProjectTypeProcesses.includes("execution_effective_execution")) {
				if (!acc.EXECUÇÃO.EXECUÇÃO) acc.EXECUÇÃO.EXECUÇÃO = { andamento: 0, concluidos: 0, tempoTotalConclusao: 0 };
				const isInExecution = !executionConcluded && !!executionStartDate && !executionFinishDate;
				if (isInExecution) acc.EXECUÇÃO.EXECUÇÃO.andamento += 1;
				const wasExecutedWithinPeriod = getDateIsWithinPeriod({ date: executionFinishDate, after: afterDate, before: beforeDate });
				if (wasExecutedWithinPeriod) {
					const time = executionStartDate && executionFinishDate ? getHoursDiff({ start: executionStartDate, finish: executionFinishDate }) || 8 : 0;

					acc.EXECUÇÃO.EXECUÇÃO.concluidos += 1;
					acc.EXECUÇÃO.EXECUÇÃO.tempoTotalConclusao += time <= 0 ? 8 : time;
				}
			}
		}

		return acc;
	}, {});

	return NextResponse.json({ data: reduced });
}

export const GET = apiHandler({ GET: getProcessTrackingStats });

type TSimplifiedProjectResult = {
	id: string;
	indexador: number;
	nome: string;
	identificador: string | number;
	cidade: TAppProject["cidade"];
	idParceiro: TAppProject["idParceiro"];
	idProjetoCRM: TAppProject["idProjetoCRM"];
	potenciaPico: TAppProject["sistema"]["potPico"];
	valor: number;
	contrato: {
		dataLiberacao: TAppProject["contrato"]["dataLiberacao"];
		dataSolicitacao: TAppProject["contrato"]["dataSolicitacao"];
		dataAssinatura: TAppProject["contrato"]["dataAssinatura"];
	};
	homologacao: {
		concluido: boolean;
		dataLiberacao: TAppProject["homologacao"]["dataLiberacao"];
		dataInicioElaboracao: TAppProject["homologacao"]["documentacao"]["dataInicioElaboracao"];
		dataConclusaoElaboracao: TAppProject["homologacao"]["documentacao"]["dataConclusaoElaboracao"];
		dataSolicitacaoAcesso: TAppProject["homologacao"]["acesso"]["dataSolicitacao"];
		dataRespostaAcesso: TAppProject["homologacao"]["acesso"]["dataResposta"];
		dataSolicitacaoVistoria: TAppProject["homologacao"]["vistoria"]["dataSolicitacao"];
		dataEfetivacaoVistoria: TAppProject["homologacao"]["vistoria"]["dataEfetivacao"];
	};
	compra: {
		concluido: boolean;
		dataLiberacao: TAppProject["compra"]["dataLiberacao"];
		dataPedido: TAppProject["compra"]["dataPedido"];
		dataEntrega: TAppProject["compra"]["dataEntrega"];
	};
	execucao: {
		concluido: boolean;
		inicio: TAppProject["obra"]["entrada"];
		fim: TAppProject["obra"]["saida"];
	};
};

type GetSimplifiedProjectsProps = {
	collection: Collection<TAppProject>;
	query: Filter<TAppProject>;
};
async function getSimplifiedProjects({ collection, query }: GetSimplifiedProjectsProps) {
	try {
		const match = { "contrato.status": { $ne: "RESCISÃO DE CONTRATO" }, ...query };
		// console.log(JSON.stringify(match))
		const projection = AppProjectResultsSimplifiedProjection;

		const result = await collection.find({ ...match }, { projection: projection }).toArray();
		const projects: TSimplifiedProjectResult[] = result.map((project) => {
			const info = project as WithId<TAppProject>;
			return {
				id: info._id.toString(),
				indexador: info.qtde,
				nome: info.nomeDoContrato,
				identificador: info.codigoSVB,
				cidade: info.cidade,
				idParceiro: info.idParceiro,
				idProjetoCRM: info.idProjetoCRM,
				potenciaPico: info.sistema.potPico,
				valor: getContractValue({ system: info.sistema.valorProjeto || 0, pa: info.padrao.valor || 0, structure: info.estruturaPersonalizada.valor || 0 }),
				contrato: {
					dataSolicitacao: info.contrato.dataSolicitacao,
					dataLiberacao: info.contrato.dataLiberacao,
					dataAssinatura: info.contrato.dataAssinatura,
				},
				homologacao: {
					concluido: !!info.homologacao.dataEfetivacao,
					dataLiberacao: info.homologacao.dataLiberacao,
					dataInicioElaboracao: info.homologacao.documentacao.dataInicioElaboracao,
					dataConclusaoElaboracao: info.homologacao.documentacao.dataConclusaoElaboracao,
					dataSolicitacaoAcesso: info.homologacao.acesso.dataSolicitacao,
					dataRespostaAcesso: info.homologacao.acesso.dataResposta,
					dataSolicitacaoVistoria: info.homologacao.vistoria.dataSolicitacao,
					dataEfetivacaoVistoria: info.homologacao.vistoria.dataEfetivacao,
				},
				compra: {
					concluido: info.compra.status === "CONCLUIDA",
					dataLiberacao: info.compra.dataLiberacao,
					dataPedido: info.compra.dataPedido,
					dataEntrega: info.compra.dataEntrega,
				},
				execucao: {
					concluido: info.obra.statusDaObra === "CONCLUIDA",
					inicio: info.obra.entrada,
					fim: info.obra.saida,
				},
			};
		});

		return projects;
	} catch (error) {
		console.error("[ERROR] getSimplifiedProjects", error);
		throw error;
	}
}

export type TProcessTrackingStatsRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getProcessTrackingStats>>>;
