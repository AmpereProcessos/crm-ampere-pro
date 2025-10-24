import { apiHandler } from "@/lib/api";
import { type TUserSession, getValidCurrentSessionUncached } from "@/lib/auth/session";
import connectToAmpereProjectsDatabase from "@/services/mongodb/ampere/projects-db-connection";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TProject } from "@/utils/schemas/project.schema";
import type { TUser } from "@/utils/schemas/user.schema";
import dayjs from "dayjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const GetSellersRankingQueryParams = z.object({
	type: z.enum(["current-month", "current-semester", "current-year"], {
		required_error: "Tipo de ranking é obrigatório",
		invalid_type_error: "Tipo de ranking inválido",
	}),
	rankBy: z.enum(["sales-total-qty", "sales-total-value", "sales-total-power"], {
		required_error: "Tipo de ranking é obrigatório",
		invalid_type_error: "Tipo de ranking inválido",
	}),
	projectTypes: z
		.string({
			required_error: "Tipos de projetos são obrigatórios",
			invalid_type_error: "Tipos de projetos inválidos",
		})
		.transform((value) => value.split(",")),
});

export type TGetSellersRankingInput = z.infer<typeof GetSellersRankingQueryParams>;

async function getSellersRanking(input: TGetSellersRankingInput, session: TUserSession) {
	const currentDate = dayjs();
	const currentMonth = currentDate.month();
	const currentSemesterMonthStart = currentMonth < 6 ? 0 : 6;

	const PERIOD_MAP = {
		"current-month": {
			startDate: currentDate.startOf("month").subtract(3, "hours").toDate(),
			endDate: currentDate.endOf("month").subtract(3, "hours").toDate(),
		},
		"current-semester": {
			startDate: currentDate.set("month", currentSemesterMonthStart).startOf("month").toDate(),
			endDate: currentDate
				.set("month", currentSemesterMonthStart + 5)
				.endOf("month")
				.subtract(3, "hours") // Fixing timezone issue
				.toDate(),
		},
		"current-year": {
			startDate: currentDate.startOf("year").subtract(3, "hours").toDate(),
			endDate: currentDate.endOf("year").subtract(3, "hours").toDate(),
		},
	};

	const RANK_BY_MAP = {
		"sales-total-qty": {
			field: "qtdeVendida",
			sort: -1,
		},
		"sales-total-value": {
			field: "valorTotal",
			sort: -1,
		},
		"sales-total-power": {
			field: "potenciaVendida",
			sort: -1,
		},
	};

	const { startDate, endDate } = PERIOD_MAP[input.type];
	const { field, sort } = RANK_BY_MAP[input.rankBy];

	const crmDb = await connectToDatabase();
	const crmCollection = crmDb.collection<TUser>("users");

	const projectsDb = await connectToAmpereProjectsDatabase();
	const projectsCollection = projectsDb.collection<TProject>("dados");

	const users = await crmCollection
		.find(
			{},
			{
				projection: {
					nome: 1,
					avatar_url: 1,
				},
			},
		)
		.toArray();
	const aggregated = (await projectsCollection
		.aggregate([
			{
				$match: {
					"contrato.status": "ASSINADO",
					tipoDeServico: { $in: input.projectTypes },
					"contrato.dataAssinatura": {
						$gte: startDate.toISOString(),
						$lte: endDate.toISOString(),
					},
				},
			},
			{
				$group: {
					_id: "$vendedor.nome",
					qtdeVendida: {
						$count: {},
					},
					potenciaVendida: {
						$sum: "$sistema.potPico",
					},
					valorProjetoVendido: {
						$sum: "$sistema.valorProjeto",
					},
					valorOeMVendido: {
						$sum: "$oem.valor",
					},
					valorPadraoVendido: {
						$sum: "$padrao.valor",
					},
					valorEstruturaPersonalizadaVendido: {
						$sum: "$estruturaPersonalizada.valor",
					},
					valorSeguroVendido: {
						$sum: "$seguro.valor",
					},
					valorTotal: {
						$sum: {
							$add: [
								{ $ifNull: ["$sistema.valorProjeto", 0] },
								{ $ifNull: ["$oem.valor", 0] },
								{ $ifNull: ["$padrao.valor", 0] },
								{ $ifNull: ["$estruturaPersonalizada.valor", 0] },
								{ $ifNull: ["$seguro.valor", 0] },
							],
						},
					},
				},
			},
			{
				$sort: {
					[field]: sort,
				},
			},
			{
				$limit: 10,
			},
		])
		.toArray()) as {
		_id: string;
		qtdeVendida: number;
		potenciaVendida: number;
		valorTotal: number;
	}[];

	const ranking = aggregated.map((item, index) => {
		const equivalentUser = users.find((user) => user.nome === item._id);
		const valueMap = {
			"sales-total-qty": item.qtdeVendida,
			"sales-total-value": item.valorTotal,
			"sales-total-power": item.potenciaVendida,
		};
		return {
			index: index + 1,
			name: equivalentUser?.nome || "NÃO DEFINIDO",
			avatar: equivalentUser?.avatar_url || undefined,
			value: valueMap[input.rankBy],
		};
	});

	return {
		data: ranking,
	};
}
export type TGetSellersRankingOutput = Awaited<ReturnType<typeof getSellersRanking>>;

const getSellersRankingHandler = async (req: NextRequest) => {
	const session = await getValidCurrentSessionUncached();

	const queryParams = await req.nextUrl.searchParams;
	const input = GetSellersRankingQueryParams.parse({
		type: queryParams.get("type"),
		rankBy: queryParams.get("rankBy"),
		projectTypes: queryParams.get("projectTypes"),
	});
	const result = await getSellersRanking(input, session);
	return NextResponse.json(result);
};

export const GET = apiHandler({
	GET: getSellersRankingHandler,
});
