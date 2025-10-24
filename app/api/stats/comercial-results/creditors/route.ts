import { apiHandler } from "@/lib/api";
import { type TUserSession, getValidCurrentSessionUncached } from "@/lib/auth/session";
import connectToAmpereDatabase from "@/services/mongodb/ampere-db-connection";
import connectToAmpereProjectsDatabase from "@/services/mongodb/ampere/projects-db-connection";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TProjectType } from "@/utils/schemas/project-types.schema";
import type { TProject } from "@/utils/schemas/project.schema";
import { GeneralStatsFiltersSchema, QueryDatesSchema } from "@/utils/schemas/stats.schema";
import type { TUser } from "@/utils/schemas/user.schema";
import createHttpError from "http-errors";
import type { Filter } from "mongodb";
import type { NextApiHandler } from "next";
import { type NextRequest, NextResponse } from "next/server";
import z from "zod";

const GetCreditorsResultInputSchema = z.object({
	after: QueryDatesSchema.shape.after,
	before: QueryDatesSchema.shape.before,
	responsibles: GeneralStatsFiltersSchema.shape.responsibles,
	partners: GeneralStatsFiltersSchema.shape.partners,
	projectTypes: GeneralStatsFiltersSchema.shape.projectTypes,
});
export type TGetCreditorsResultInput = z.infer<typeof GetCreditorsResultInputSchema>;
async function getCreditorsResults({ input, session }: { input: TGetCreditorsResultInput; session: TUserSession }) {
	const { after, before, responsibles, partners, projectTypes } = input;
	const partnerScope = session.user.permissoes.parceiros.escopo;
	const userScope = session.user.permissoes.resultados.escopo;

	if (!!userScope && !responsibles) {
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");
	}

	if (!!partnerScope && !partners) {
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");
	}

	if (!!userScope && responsibles?.some((r) => !userScope.includes(r))) {
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");
	}

	if (!!partnerScope && partners?.some((r) => !partnerScope.includes(r))) {
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");
	}

	const crmDb = await connectToDatabase();
	const crmUsersCollection = crmDb.collection<TUser>("users");
	const crmProjectTypesCollection = crmDb.collection<TProjectType>("project-types");
	const appDb = await connectToAmpereProjectsDatabase();
	const appProjectsCollection = appDb.collection<TProject>("dados");
	const crmUsers = await crmUsersCollection.find({}, { projection: { _id: 1, nome: 1 } }).toArray();
	const crmProjectTypes = await crmProjectTypesCollection.find({}, { projection: { _id: 1, nome: 1 } }).toArray();

	const responsiblesAsSellers = (responsibles?.map((r) => crmUsers.find((u) => u._id.toString() === r)?._id.toString()).filter((r) => !!r) ?? []) as string[];

	const projectTypesIdsAsProjectTypes = (projectTypes?.map((p) => crmProjectTypes.find((t) => t._id.toString() === p)?._id.toString()).filter((r) => !!r) ??
		[]) as string[];

	const periodQuery: Filter<TProject> = {
		"contrato.dataAssinatura": { $gte: after, $lte: before },
	};
	const responsiblesQuery: Filter<TProject> = responsiblesAsSellers.length > 0 ? { "vendedor.nome": { $in: responsiblesAsSellers } } : {};
	const projectTypesQuery: Filter<TProject> = projectTypesIdsAsProjectTypes.length > 0 ? { tipoDeServico: { $in: projectTypesIdsAsProjectTypes } } : {};

	const query = { ...periodQuery, ...responsiblesQuery, ...projectTypesQuery };
	console.log("[INFO] [GET_CREDITORS_RESULTS] Query", input);

	const overallSalesResult = (await appProjectsCollection
		.aggregate([
			{
				$match: query,
			},
			{
				$group: {
					_id: {},
					qtdeVendida: {
						$count: {},
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
				},
			},
		])
		.toArray()) as {
		qtdeVendida: number;
		valorProjetoVendido: number;
		valorOeMVendido: number;
		valorPadraoVendido: number;
		valorEstruturaPersonalizadaVendido: number;
		valorSeguroVendido: number;
	}[];
	console.log("[INFO] [GET_CREDITORS_RESULTS] Overall Sales Result", overallSalesResult);
	const [overallSales] = overallSalesResult;

	const overallSalesTotalQty = overallSales.qtdeVendida;
	const overallSalesTotalValue =
		overallSales.valorProjetoVendido +
		overallSales.valorOeMVendido +
		overallSales.valorPadraoVendido +
		overallSales.valorEstruturaPersonalizadaVendido +
		overallSales.valorSeguroVendido;

	const byCreditorResult = (await appProjectsCollection
		.aggregate([
			{
				$match: { ...query, "pagamento.forma": "FINANCIAMENTO" },
			},
			{
				$group: {
					_id: "$pagamento.credor",
					qtdeVendida: {
						$count: {},
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
				},
			},
		])
		.toArray()) as {
		_id: string | undefined | null;
		qtdeVendida: number;
		valorProjetoVendido: number;
		valorOeMVendido: number;
		valorPadraoVendido: number;
		valorEstruturaPersonalizadaVendido: number;
		valorSeguroVendido: number;
	}[];
	const byCreditorTotalQty = byCreditorResult.reduce((acc, curr) => acc + curr.qtdeVendida, 0);
	const byCreditorTotalValue = byCreditorResult.reduce(
		(acc, curr) =>
			acc + curr.valorProjetoVendido + curr.valorOeMVendido + curr.valorPadraoVendido + curr.valorEstruturaPersonalizadaVendido + curr.valorSeguroVendido,
		0,
	);
	const byCreditorReduced = byCreditorResult.reduce(
		(
			acc: {
				[key: string]: {
					quantity: number;
					total: number;
					quantityGroupPercentage: number;
					quantityOverallPercentage: number;
					totalGroupPercentage: number;
					totalOverallPercentage: number;
				};
			},
			curr,
		) => {
			const creditor = curr._id ?? "NÃO DEFINIDO";
			if (!acc[creditor])
				acc[creditor] = {
					quantity: 0,
					total: 0,
					quantityGroupPercentage: 0,
					quantityOverallPercentage: 0,
					totalGroupPercentage: 0,
					totalOverallPercentage: 0,
				};
			const quantity = curr.qtdeVendida;
			const value =
				curr.valorProjetoVendido + curr.valorOeMVendido + curr.valorPadraoVendido + curr.valorEstruturaPersonalizadaVendido + curr.valorSeguroVendido;
			acc[creditor].quantity += quantity;
			acc[creditor].total += value;
			acc[creditor].quantityGroupPercentage = quantity / byCreditorTotalQty;
			acc[creditor].quantityOverallPercentage = quantity / overallSalesTotalQty;
			acc[creditor].totalGroupPercentage = value / byCreditorTotalValue;
			acc[creditor].totalOverallPercentage = value / overallSalesTotalValue;
			return acc;
		},
		{},
	);
	const byCreditor = Object.entries(byCreditorReduced).map(([creditor, data]) => ({
		creditor,
		quantity: data.quantity,
		total: data.total,
		quantityGroupPercentage: data.quantityGroupPercentage * 100,
		quantityOverallPercentage: data.quantityOverallPercentage * 100,
		totalGroupPercentage: data.totalGroupPercentage * 100,
		totalOverallPercentage: data.totalOverallPercentage * 100,
	}));
	return {
		data: {
			totalVendido: byCreditorTotalValue,
			projetosVendidos: byCreditorTotalQty,
			porCredor: byCreditor,
		},
	};
}

export type TGetCreditorsResultOutput = Awaited<ReturnType<typeof getCreditorsResults>>;

const getCreditorsResultsHandler = async (request: NextRequest) => {
	const session = await getValidCurrentSessionUncached();

	const searchParams = request.nextUrl.searchParams;
	const payload = await request.json();
	const input = GetCreditorsResultInputSchema.parse({
		after: searchParams.get("after"),
		before: searchParams.get("before"),
		...payload,
	});

	const result = await getCreditorsResults({ input, session });

	return NextResponse.json(result, {
		status: 200,
	});
};

export const POST = apiHandler({ POST: getCreditorsResultsHandler });
