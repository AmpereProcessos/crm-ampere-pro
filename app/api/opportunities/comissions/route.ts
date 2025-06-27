import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import { NextResponse, type NextRequest } from "next/server";
import { BulkUpdateComissionsInputSchema, GetComissionsQueryParams } from "./input";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import connectToAmpereProjectsDatabase from "@/services/mongodb/ampere/projects-db-connection";
import { SimplifiedOpportunityProjection, type TOpportunity, type TOpportunitySimplified } from "@/utils/schemas/opportunity.schema";
import { type AnyBulkWriteOperation, ObjectId, type Collection, type Filter, type WithId } from "mongodb";
import { AppProjectComissionSimplifiedProjection, type TAppProject, type TAppProjectComissionSimplified } from "@/utils/schemas/integrations/app-ampere/projects.schema";
import type { UnwrapNextResponse } from "@/utils/api";
import type { z } from "zod";
import { apiHandler } from "@/lib/api";
import createHttpError from "http-errors";

export type TGetComissionsRouteInput = z.infer<typeof GetComissionsQueryParams>;
export async function getComissions(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const userPartner = user.idParceiro;
	const userScope = user.permissoes.resultados.escopo;

	const searchParams = request.nextUrl.searchParams;
	const afterParam = searchParams.get("after");
	const beforeParam = searchParams.get("before");

	const { after, before } = GetComissionsQueryParams.parse({
		after: afterParam,
		before: beforeParam,
	});

	const crmDb = await connectToDatabase();
	const opportunitiesCollection = crmDb.collection<TOpportunity>("opportunities");
	const appDb = await connectToAmpereProjectsDatabase();
	const projectsCollection = appDb.collection<TAppProject>("dados");

	const projects = await getProjects({
		projectsCollection,
		afterDateStr: after,
		beforeDateStr: before,
		userName: user.nome,
	});

	const projectOpportunityIdsAsObjectId = projects.filter((project) => !!project.idProjetoCRM).map((project) => new ObjectId(project.idProjetoCRM as string));
	const opportunities = await getOpportunities({
		opportunitiesCollection,
		ids: projectOpportunityIdsAsObjectId,
	});
	const opportunitiesWithComissions = opportunities
		.map((opportunity) => {
			const project = projects.find((project) => project.idProjetoCRM === opportunity._id.toString());
			if (!project) {
				console.log(`[GET COMISSIONS] Error finding project for opportunity ${opportunity._id.toString()}`);
				return null;
			}
			const userIsSellerInProject = user.nome === project.vendedor.nome;
			const userIsInsiderInProject = project.insider === user.nome;

			let comissionPercentage = 0;
			if (userIsSellerInProject) {
				comissionPercentage = project.comissoes?.porcentagemVendedor || 0;
			} else {
				comissionPercentage = project.comissoes?.porcentagemInsider || 0;
			}
			const comissionableValue = project.comissoes?.valorComissionavel || 0;
			return {
				...opportunity,
				_id: opportunity._id.toString(),
				appId: project._id.toString(),
				appIdentificador: project.qtde,
				appNome: project.nomeDoContrato,
				appTipo: project.tipoDeServico,
				appDataAssinatura: project.contrato?.dataAssinatura,
				appDataRecebimentoParcial: project.compra?.dataPagamento,
				comissao: {
					comissionadoPapel: (userIsSellerInProject ? "VENDEDOR" : "INSIDER") as "VENDEDOR" | "INSIDER",
					comissaoEfetivada: project.comissoes?.efetivado || false,
					comissaoPagamentoRealizado: project.comissoes?.pagamentoRealizado || false,
					valorComissionavel: comissionableValue,
					comissaoPorcentagem: comissionPercentage,
					comissaoValor: comissionableValue * (comissionPercentage / 100),
					dataValidacao: userIsSellerInProject ? project.comissoes?.dataValidacaoVendedor : project.comissoes?.dataValidacaoInsider,
				},
			};
		})
		.filter((opportunity) => opportunity !== null);

	return NextResponse.json({
		data: opportunitiesWithComissions,
	});
}

export const GET = apiHandler({ GET: getComissions });
export type TGetComissionsRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getComissions>>>;

export type TBulkUpdateComissionsRouteInput = z.infer<typeof BulkUpdateComissionsInputSchema>;
async function bulkUpdateComissions(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const userPartner = user.idParceiro;
	const userScope = user.permissoes.resultados.escopo;

	const payload = await request.json();
	const bulkUpdates = BulkUpdateComissionsInputSchema.parse(payload);

	const appDb = await connectToAmpereProjectsDatabase();
	const projectsCollection = appDb.collection<TAppProject>("dados");

	console.log(`[BULK UPDATE COMISSIONS] User: ${user.nome} (${user.id})`);
	console.log(`[BULK UPDATE COMISSIONS] Updating ${bulkUpdates.length} projects...`);
	const bulkwrite: AnyBulkWriteOperation<TAppProject>[] = bulkUpdates.map((update) => {
		const updates: Record<string, any> = {};
		if (update.comissionValidatedAsSeller) {
			updates["comissoes.dataValidacaoVendedor"] = new Date().toISOString();
		}
		if (update.comissionValidatedAsInsider) {
			updates["comissoes.dataValidacaoInsider"] = new Date().toISOString();
		}
		if (Object.keys(updates).length === 0) throw new createHttpError.BadRequest("Nenhuma atualização válida foi encontrada.");
		return {
			updateOne: {
				filter: { _id: new ObjectId(update.projectId) },
				update: {
					$set: { ...updates },
				},
			},
		};
	});

	console.log("[BULK UPDATE COMISSIONS] Bulk write", JSON.stringify(bulkwrite, null, 2));
	const bulkwriteResult = await projectsCollection.bulkWrite(bulkwrite);
	console.log(`[BULK UPDATE COMISSIONS] Bulk write result: ${JSON.stringify(bulkwriteResult)}`);
	return NextResponse.json({
		data: {
			modifiedCount: 1, // bulkwriteResult.modifiedCount,
		},
		message: "Comissões atualizadas com sucesso.",
	});
}
export const POST = apiHandler({ POST: bulkUpdateComissions });
export type TBulkUpdateComissionsRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof bulkUpdateComissions>>>;

type GetOpportunitiesParams = {
	opportunitiesCollection: Collection<TOpportunity>;
	ids: ObjectId[];
};
async function getOpportunities({ opportunitiesCollection, ids }: GetOpportunitiesParams) {
	const result = await opportunitiesCollection
		.find(
			{
				_id: { $in: ids },
			},
			{ projection: SimplifiedOpportunityProjection },
		)
		.toArray();
	return result as WithId<TOpportunitySimplified>[];
}

type GetProjectsParams = {
	projectsCollection: Collection<TAppProject>;
	afterDateStr: string;
	beforeDateStr: string;
	userName: string;
};
export async function getProjects({ projectsCollection, afterDateStr, beforeDateStr, userName }: GetProjectsParams) {
	const responsiblesQuery: Filter<TAppProject> = userName
		? {
				$or: [
					{
						"vendedor.nome": { $in: [userName] },
					},
					{
						insider: { $in: [userName] },
					},
				],
			}
		: {};
	const signedQueryFilter: Filter<TAppProject> = {
		"contrato.status": "ASSINADO",
	};
	const photovoltaicQueryFilter: Filter<TAppProject> = {
		tipoDeServico: { $in: ["SISTEMA FOTOVOLTAICO", "AUMENTO DE SISTEMA FOTOVOLTAICO"] },
		$and: [{ "compra.dataPagamento": { $gte: afterDateStr } }, { "compra.dataPagamento": { $lte: beforeDateStr } }],
	};
	const nonPhotovoltaicQueryFilter: Filter<TAppProject> = {
		tipoDeServico: { $nin: ["SISTEMA FOTOVOLTAICO", "AUMENTO DE SISTEMA FOTOVOLTAICO"] },
		$and: [{ "contrato.dataAssinatura": { $gte: afterDateStr } }, { "contrato.dataAssinatura": { $lte: beforeDateStr } }],
	};
	const typeQueryFilter: Filter<TAppProject> = {
		$or: [photovoltaicQueryFilter, nonPhotovoltaicQueryFilter],
	};

	const query: Filter<TAppProject> = {
		...responsiblesQuery,
		...signedQueryFilter,
		...{ $and: [typeQueryFilter, responsiblesQuery] },
	};

	const result = await projectsCollection.find(query, { projection: AppProjectComissionSimplifiedProjection }).toArray();
	return result as WithId<TAppProjectComissionSimplified>[];
}
