import createHttpError from "http-errors";
import type { Collection, Filter } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import z from "zod";
import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached, type TUserSession } from "@/lib/auth/session";
import { formatDateAsLocale } from "@/lib/methods/formatting";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";

const MAX_PAGE_SIZE = 1_000;
const DEFAULT_PAGE_SIZE = 500;

const CsvOrArrayStringSchema = z
	.union([z.string(), z.array(z.string())])
	.optional()
	.nullable()
	.transform((value) => {
		if (!value) return [] as string[];
		if (Array.isArray(value)) return value.filter(Boolean);
		return value
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	});

function parsePositiveInt(value: string | number | undefined, fallback: number) {
	if (typeof value === "number") {
		if (Number.isNaN(value) || value < 1) return fallback;
		return value;
	}
	if (!value) return fallback;
	const parsed = Number.parseInt(value, 10);
	if (Number.isNaN(parsed) || parsed < 1) return fallback;
	return parsed;
}

function clamp(value: number, min: number, max: number) {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

const GetExportOpportunitiesInputSchema = z.object({
	page: z.union([z.string(), z.number()]).optional().transform((value) => parsePositiveInt(value, 1)),
	pageSize: z.union([z.string(), z.number()]).optional().transform((value) => parsePositiveInt(value, DEFAULT_PAGE_SIZE)),
	responsibles: CsvOrArrayStringSchema,
	funnelsIds: CsvOrArrayStringSchema,
	periodAfter: z.string().datetime().optional().nullable(),
	periodBefore: z.string().datetime().optional().nullable(),
	periodField: z.enum(["dataInsercao", "dataGanho", "dataPerda", "ultimaInteracao.data"]).optional().nullable(),
	status: z
		.enum(["GANHOS", "PERDIDOS", "ongoing", "won", "lost"])
		.optional()
		.nullable()
		.transform((value) => {
			if (value === "GANHOS") return "won";
			if (value === "PERDIDOS") return "lost";
			return value ?? "ongoing";
		}),
});
export type TGetExportOpportunitiesInput = z.infer<typeof GetExportOpportunitiesInputSchema>;

const STATUS_QUERY_MAP: Record<NonNullable<TGetExportOpportunitiesInput["status"]>, Filter<TOpportunity>> = {
	ongoing: { "perda.data": null, "ganho.data": null },
	won: { "ganho.data": { $ne: null } },
	lost: { "perda.data": { $ne: null } },
};

type TProjectedOpportunity = {
	nome: TOpportunity["nome"];
	identificador: TOpportunity["identificador"];
	tipo?: { titulo?: TOpportunity["tipo"]["titulo"] };
	idMarketing: TOpportunity["idMarketing"];
	responsaveis: TOpportunity["responsaveis"];
	ganho: TOpportunity["ganho"];
	cliente: TOpportunity["cliente"];
	localizacao?: {
		uf?: TOpportunity["localizacao"]["uf"];
		cidade?: TOpportunity["localizacao"]["cidade"];
	};
	proposta?: {
		valor?: Exclude<TOpportunity["proposta"], null | undefined>["valor"];
		potenciaPico?: Exclude<TOpportunity["proposta"], null | undefined>["potenciaPico"];
	} | null;
	ultimaInteracao?: {
		data?: Exclude<TOpportunity["ultimaInteracao"], null | undefined>["data"];
	} | null;
	perda: TOpportunity["perda"];
	dataInsercao: TOpportunity["dataInsercao"];
};

export type TOpportunityExportItem = {
	"NOME DO PROJETO": string;
	IDENTIFICADOR: string;
	TIPO: string;
	TELEFONE: string;
	VENDEDOR: string;
	SDR: string;
	UF: string;
	CIDADE: string;
	"CANAL DE AQUISIÇÃO": string;
	CLASSIFICAÇÃO: string;
	"DATA DE GANHO": string;
	"POTÊNCIA VENDIDA": number;
	"VALOR VENDA": number;
	"DATA DE PERDA": string;
	"MOTIVO DA PERDA": string;
	"DATA DE ENVIO": string;
	"DATA DE CRIAÇÃO": string;
};

function formatOpportunityToExportItem(opportunity: TProjectedOpportunity): TOpportunityExportItem {
	const info = {
		nome: opportunity.nome,
		identificador: opportunity.identificador,
		tipo: opportunity.tipo?.titulo ?? "NÃO DEFINIDO",
		uf: opportunity.localizacao?.uf ?? "NÃO DEFINIDO",
		cidade: opportunity.localizacao?.cidade ?? "NÃO DEFINIDO",
		idMarketing: opportunity.idMarketing,
		responsaveis: opportunity.responsaveis ?? [],
		ganho: opportunity.ganho,
		valorProposta: opportunity.proposta?.valor ?? 0,
		potenciaPicoProposta: opportunity.proposta?.potenciaPico ?? 0,
		telefone: opportunity.cliente?.telefonePrimario ?? "NÃO DEFINIDO",
		canalAquisicao: opportunity.cliente?.canalAquisicao ?? "NÃO DEFINIDO",
		dataPerda: opportunity.perda?.data,
		motivoPerda: opportunity.perda?.descricaoMotivo ?? "NÃO DEFINIDO",
		dataInsercao: opportunity.dataInsercao,
		ultimaInteracao: opportunity.ultimaInteracao?.data,
	};

	const seller = info.responsaveis.find((responsible) => responsible.papel === "VENDEDOR");
	const sdr = info.responsaveis.find((responsible) => responsible.papel === "SDR");
	const isInbound = !!info.idMarketing;
	const isTransfer = info.responsaveis.length > 1;
	const isFromInsider = !!sdr;
	const isLead = isTransfer && isFromInsider;
	const isSdrOwn = !isTransfer && isFromInsider;
	const transferDate = isTransfer && seller?.dataInsercao ? new Date(seller.dataInsercao).toISOString() : null;
	const isOutboundSdr = !isInbound && (isLead || isSdrOwn);
	const isOutboundSeller = !isInbound && !isOutboundSdr;

	let classification = "NÃO DEFINIDO";
	if (isInbound) classification = "INBOUND";
	else if (isOutboundSdr) classification = "OUTBOUND SDR";
	else if (isOutboundSeller) classification = "OUTBOUND VENDEDOR";

	return {
		"NOME DO PROJETO": info.nome,
		IDENTIFICADOR: info.identificador || "",
		TIPO: info.tipo,
		TELEFONE: info.telefone,
		VENDEDOR: seller?.nome || "NÃO DEFINIDO",
		SDR: sdr?.nome || "NÃO DEFINIDO",
		UF: info.uf,
		CIDADE: info.cidade,
		"CANAL DE AQUISIÇÃO": info.canalAquisicao,
		CLASSIFICAÇÃO: classification,
		"DATA DE GANHO": formatDateAsLocale(info.ganho?.data || undefined) || "NÃO ASSINADO",
		"POTÊNCIA VENDIDA": info.potenciaPicoProposta,
		"VALOR VENDA": info.valorProposta,
		"DATA DE PERDA": formatDateAsLocale(info.dataPerda || undefined) || "NÃO DEFINIDO",
		"MOTIVO DA PERDA": info.motivoPerda,
		"DATA DE ENVIO": isTransfer ? formatDateAsLocale(transferDate || undefined) || "NÃO DEFINIDO" : "N/A",
		"DATA DE CRIAÇÃO": formatDateAsLocale(info.dataInsercao || undefined) || "NÃO DEFINIDO",
	};
}

function buildOpportunitiesQuery({
	session,
	responsibles,
	periodField,
	periodAfter,
	periodBefore,
	status,
}: {
	session: TUserSession;
	responsibles: string[];
	periodField: TGetExportOpportunitiesInput["periodField"];
	periodAfter: TGetExportOpportunitiesInput["periodAfter"];
	periodBefore: TGetExportOpportunitiesInput["periodBefore"];
	status: NonNullable<TGetExportOpportunitiesInput["status"]>;
}) {
	const userScope = session.user.permissoes.oportunidades.escopo;
	if (userScope && responsibles.length === 0) {
		throw new createHttpError.Unauthorized("Seu escopo de visibilidade exige que um responsável seja informado.");
	}
	if (userScope && responsibles.some((responsible) => !userScope.includes(responsible))) {
		throw new createHttpError.Unauthorized("Seu escopo de visibilidade não contempla os responsáveis informados.");
	}

	const periodQuery: Filter<TOpportunity> =
		periodField && periodAfter && periodBefore
			? {
					[periodField]: {
						$gte: periodAfter,
						$lte: periodBefore,
					},
				}
			: {};

	return {
		...(session.user.idParceiro ? { idParceiro: session.user.idParceiro } : {}),
		...(responsibles.length > 0 ? { "responsaveis.id": { $in: responsibles } } : {}),
		...periodQuery,
		...STATUS_QUERY_MAP[status],
	} as Filter<TOpportunity>;
}

function withOpportunityPrefix(query: Filter<TOpportunity>) {
	const entries = Object.entries(query).map(([key, value]) => [`opportunity.${key}`, value]);
	return Object.fromEntries(entries) as Record<string, unknown>;
}

async function getExportOpportunities({ input, session }: { input: TGetExportOpportunitiesInput; session: TUserSession }) {
	const db = await connectToDatabase();
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");
	const funnelReferencesCollection: Collection<TFunnelReference> = db.collection("funnel-references");

	const page = input.page;
	const pageSize = clamp(input.pageSize, 100, MAX_PAGE_SIZE);
	const opportunitiesQuery = buildOpportunitiesQuery({
		session,
		responsibles: input.responsibles,
		periodField: input.periodField,
		periodAfter: input.periodAfter,
		periodBefore: input.periodBefore,
		status: input.status,
	});

	let opportunities: TProjectedOpportunity[] = [];
	let totalItems = 0;

	if (input.funnelsIds.length > 0) {
		const prefixedQuery = withOpportunityPrefix(opportunitiesQuery);
		const basePipeline = [
			{ $match: { idFunil: { $in: input.funnelsIds } } },
			{ $sort: { dataInsercao: -1, _id: -1 } },
			{ $group: { _id: "$idOportunidade" } },
			{ $addFields: { opportunityAsObjectId: { $toObjectId: "$_id" } } },
			{ $lookup: { from: "opportunities", localField: "opportunityAsObjectId", foreignField: "_id", as: "opportunity" } },
			{ $unwind: "$opportunity" },
			{ $match: prefixedQuery },
		];

		const countResult = await funnelReferencesCollection
			.aggregate<{ total: number }>([...basePipeline, { $count: "total" }])
			.toArray();
		totalItems = countResult[0]?.total ?? 0;

		opportunities = await funnelReferencesCollection
			.aggregate<TProjectedOpportunity>([
				...basePipeline,
				{ $sort: { "opportunity.dataInsercao": -1, "opportunity._id": -1 } },
				{ $skip: (page - 1) * pageSize },
				{ $limit: pageSize },
				{
					$project: {
						_id: 0,
						nome: "$opportunity.nome",
						identificador: "$opportunity.identificador",
						tipo: "$opportunity.tipo",
						idMarketing: "$opportunity.idMarketing",
						responsaveis: "$opportunity.responsaveis",
						ganho: "$opportunity.ganho",
						cliente: "$opportunity.cliente",
						localizacao: "$opportunity.localizacao",
						proposta: "$opportunity.proposta",
						ultimaInteracao: "$opportunity.ultimaInteracao",
						perda: "$opportunity.perda",
						dataInsercao: "$opportunity.dataInsercao",
					},
				},
			])
			.toArray();
	} else {
		totalItems = await opportunitiesCollection.countDocuments(opportunitiesQuery);
		opportunities = await opportunitiesCollection
			.find(opportunitiesQuery)
			.project<TProjectedOpportunity>({
				_id: 0,
				nome: 1,
				identificador: 1,
				tipo: 1,
				idMarketing: 1,
				responsaveis: 1,
				ganho: 1,
				cliente: 1,
				localizacao: 1,
				proposta: 1,
				ultimaInteracao: 1,
				perda: 1,
				dataInsercao: 1,
			})
			.sort({ dataInsercao: -1, _id: -1 })
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.toArray();
	}

	const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
	return {
		data: opportunities.map(formatOpportunityToExportItem),
		page,
		pageSize,
		totalItems,
		totalPages,
		message: "Dados exportados com sucesso",
	};
}

type TRawRequestPayload = {
	page?: string | number | null;
	pageSize?: string | number | null;
	responsibles?: string | string[] | null;
	funnelsIds?: string | string[] | null;
	periodAfter?: string | null;
	periodBefore?: string | null;
	periodField?: string | null;
	status?: string | null;
};

function parseInput(raw: TRawRequestPayload) {
	return GetExportOpportunitiesInputSchema.parse({
		page: raw.page ?? undefined,
		pageSize: raw.pageSize ?? undefined,
		responsibles: raw.responsibles ?? undefined,
		funnelsIds: raw.funnelsIds ?? undefined,
		periodAfter: raw.periodAfter ?? undefined,
		periodBefore: raw.periodBefore ?? undefined,
		periodField: raw.periodField ?? undefined,
		status: raw.status ?? undefined,
	});
}

async function getExportOpportunitiesHandler(request: NextRequest) {
	const session = await getValidCurrentSessionUncached();
	const searchParams = request.nextUrl.searchParams;

	const input = parseInput({
		page: searchParams.get("page"),
		pageSize: searchParams.get("pageSize"),
		responsibles: searchParams.get("responsibles"),
		funnelsIds: searchParams.get("funnelsIds"),
		periodAfter: searchParams.get("periodAfter"),
		periodBefore: searchParams.get("periodBefore"),
		periodField: searchParams.get("periodField"),
		status: searchParams.get("status"),
	});
	const result = await getExportOpportunities({ input, session });
	return NextResponse.json(result);
}

async function postExportOpportunitiesHandler(request: NextRequest) {
	const session = await getValidCurrentSessionUncached();
	const body = (await request.json()) as TRawRequestPayload;
	const input = parseInput(body);
	const result = await getExportOpportunities({ input, session });
	return NextResponse.json(result);
}

export type TExportOpportunitiesRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getExportOpportunities>>>;
export const GET = apiHandler({ GET: getExportOpportunitiesHandler });
export const POST = apiHandler({ POST: postExportOpportunitiesHandler });
