import createHttpError from "http-errors";
import type { Filter, WithId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import { apiHandler } from "@/lib/api";
import { getValidCurrentSessionUncached, type TUserSession } from "@/lib/auth/session";
import { formatDateAsLocale } from "@/lib/methods/formatting";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";

const GetExportOpportunitiesInputSchema = z.object({
	responsibles: z
		.string({
			required_error: "ID do responsável não informado.",
			invalid_type_error: "Tipo inválido para ID do responsável.",
		})
		.optional()
		.transform((v) => (v ? v.split(",") : null)),
	periodAfter: z
		.string({
			required_error: "Data de início do período não informada.",
			invalid_type_error: "Tipo inválido para data de início do período.",
		})
		.datetime(),
	periodBefore: z
		.string({
			required_error: "Data de fim do período não informada.",
			invalid_type_error: "Tipo inválido para data de fim do período.",
		})
		.datetime(),
	periodField: z.enum(["dataInsercao", "dataGanho", "dataPerda", "ultimaInteracao.data"], {
		required_error: "Campo de período não informado.",
		invalid_type_error: "Tipo inválido para campo de período.",
	}),
	status: z
		.enum(["GANHOS", "PERDIDOS"], {
			required_error: "Status não informado.",
			invalid_type_error: "Tipo inválido para status.",
		})
		.optional()
		.nullable(),
});
export type TGetExportOpportunitiesInput = z.infer<typeof GetExportOpportunitiesInputSchema>;

const STATUS_QUERY_MAP = {
	GANHOS: { "ganho.data": { $ne: null } },
	PERDIDOS: { "perda.data": { $ne: null } },
};
async function getExportOpportunities({ input, session }: { input: TGetExportOpportunitiesInput; session: TUserSession }) {
	const { periodAfter, periodBefore, periodField, responsibles, status } = input;

	const userScope = session.user.permissoes.oportunidades.escopo;

	const db = await connectToDatabase();
	const opportunitiesCollection = db.collection<TOpportunity>("opportunities");

	const isPeriodDefined = periodField && periodAfter && periodBefore;

	// Validing user scope visibility
	if (userScope && responsibles && !responsibles.every((r) => userScope.includes(r)))
		throw new createHttpError.Unauthorized("Seu escopo de visibilidade não contempla os responsáveis informados.");

	const queryPartner: Filter<TOpportunity> = session.user.idParceiro ? { idParceiro: session.user.idParceiro } : {};
	const queryResponsible: Filter<TOpportunity> = responsibles ? { "responsaveis.id": { $in: responsibles } } : {};
	const queryInsertion: Filter<TOpportunity> = isPeriodDefined
		? {
				$and: [{ [periodField]: { $gte: periodAfter } }, { [periodField]: { $lte: periodBefore } }],
			}
		: {};
	const queryStatus: Filter<TOpportunity> = status ? STATUS_QUERY_MAP[status] : { "perda.data": null, "ganho.data": null };

	const query = {
		...queryPartner,
		...queryResponsible,
		...queryInsertion,
		...queryStatus,
	} as Filter<TOpportunity>;

	const opportunities = (await opportunitiesCollection
		.find(query)
		.project({
			nome: 1,
			identificador: 1,
			"tipo.titulo": 1,
			idMarketing: 1,
			responsaveis: 1,
			ganho: 1,
			cliente: 1,
			"localizacao.uf": 1,
			"localizacao.cidade": 1,
			"proposta.valor": 1,
			"proposta.potenciaPico": 1,
			"ultimaInteracao.data": 1,
			perda: 1,
			dataInsercao: 1,
		})
		.toArray()) as WithId<{
		nome: TOpportunity["nome"];
		identificador: TOpportunity["identificador"];
		tipo: {
			titulo: TOpportunity["tipo"]["titulo"];
		};
		idMarketing: TOpportunity["idMarketing"];
		responsaveis: TOpportunity["responsaveis"];
		ganho: TOpportunity["ganho"];
		cliente: TOpportunity["cliente"];
		localizacao: {
			uf: TOpportunity["localizacao"]["uf"];
			cidade: TOpportunity["localizacao"]["cidade"];
		};
		proposta: {
			valor: Exclude<TOpportunity["proposta"], null | undefined>["valor"];
			potenciaPico: Exclude<TOpportunity["proposta"], null | undefined>["potenciaPico"];
		} | null;
		ultimaInteracao: {
			data: Exclude<TOpportunity["ultimaInteracao"], null | undefined>["data"];
		} | null;
		perda: TOpportunity["perda"];
		dataInsercao: TOpportunity["dataInsercao"];
	}>[];

	const exportationResult = opportunities.map((opportunity) => {
		const info = {
			nome: opportunity.nome,
			identificador: opportunity.identificador,
			tipo: opportunity.tipo.titulo,
			uf: opportunity.localizacao.uf,
			cidade: opportunity.localizacao.cidade,
			idMarketing: opportunity.idMarketing,
			responsaveis: opportunity.responsaveis,
			ganho: opportunity.ganho,
			valorProposta: opportunity.proposta ? opportunity.proposta.valor : 0,
			potenciaPicoProposta: opportunity.proposta ? opportunity.proposta.potenciaPico : 0,
			telefone: opportunity.cliente?.telefonePrimario,
			canalAquisicao: opportunity.cliente?.canalAquisicao || "NÃO DEFINIDO",
			dataPerda: opportunity.perda.data,
			motivoPerda: opportunity.perda.descricaoMotivo,
			dataInsercao: opportunity.dataInsercao,
			ultimaInteracao: opportunity.ultimaInteracao?.data,
		};

		const wonDate = info.ganho?.data;
		const uf = info.uf;
		const city = info.cidade;

		const aquisitionOrigin = info.canalAquisicao;

		const proposeValue = info.valorProposta;
		const proposePower = info.potenciaPicoProposta;

		const seller = info.responsaveis.find((r) => r.papel === "VENDEDOR");
		const sdr = info.responsaveis.find((r) => r.papel === "SDR");

		// Sale channel related information
		const isInbound = !!info.idMarketing;
		const isTransfer = info.responsaveis.length > 1;
		const isFromInsider = !!sdr;
		const isLead = isTransfer && isFromInsider;
		const isSDROwn = !isTransfer && isFromInsider;

		const transferDate = isTransfer && seller?.dataInsercao ? new Date(seller.dataInsercao).toISOString() : null;

		const isOutboundSDR = !isInbound && (isLead || isSDROwn);
		const isOutboundSeller = !isInbound && !isOutboundSDR;

		let classification = "NÃO DEFINIDO";
		if (isInbound) classification = "INBOUND";
		if (isOutboundSDR) classification = "OUTBOUND SDR";
		if (isOutboundSeller) classification = "OUTBOUND VENDEDOR";

		return {
			"NOME DO PROJETO": info.nome,
			IDENTIFICADOR: info.identificador || "",
			TIPO: info.tipo,
			TELEFONE: info.telefone,
			VENDEDOR: seller?.nome || "NÃO DEFINIDO",
			SDR: sdr?.nome || "NÃO DEFINIDO",
			UF: uf,
			CIDADE: city,
			"CANAL DE AQUISIÇÃO": aquisitionOrigin,
			CLASSIFICAÇÃO: classification || "NÃO DEFINIDO",
			"DATA DE GANHO": formatDateAsLocale(wonDate || undefined) || "NÃO ASSINADO",
			"POTÊNCIA VENDIDA": proposePower,
			"VALOR VENDA": proposeValue,
			"DATA DE PERDA": formatDateAsLocale(info.dataPerda || undefined),
			"MOTIVO DA PERDA": info.motivoPerda,
			"DATA DE ENVIO": isTransfer ? formatDateAsLocale(transferDate || undefined) : "N/A",
			"DATA DE CRIAÇÃO": formatDateAsLocale(info.dataInsercao || undefined),
		};
	});
	return {
		data: exportationResult,
	};
}
export type TGetExportOpportunitiesOutput = Awaited<ReturnType<typeof getExportOpportunities>>;

async function getExportOpportunitiesHandler(request: NextRequest) {
	const session = await getValidCurrentSessionUncached();

	const searchParams = request.nextUrl.searchParams;
	const responsibles = searchParams.get("responsibles");
	const periodAfter = searchParams.get("periodAfter");
	const periodBefore = searchParams.get("periodBefore");
	const periodField = searchParams.get("periodField");
	const status = searchParams.get("status");

	const input = GetExportOpportunitiesInputSchema.parse({
		responsibles,
		periodAfter,
		periodBefore,
		periodField,
		status,
	});
	const result = await getExportOpportunities({ input, session });
	return NextResponse.json(result);
}
export default apiHandler({ GET: getExportOpportunitiesHandler });
