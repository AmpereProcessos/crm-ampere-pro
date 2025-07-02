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
		userId: user.id,
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
			const userInProject = project.comissoes?.comissionados?.find((comissionedUser) => comissionedUser.idCrm === user.id);

			if (!userInProject) {
				console.log(`[GET COMISSIONS] User ${user.id} not found as comissioned user in project ${project._id.toString()}`);
				throw new createHttpError.NotFound("Oops, um erro desconhecido ocorreu. Por favor, tente novamente mais tarde.");
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
					dataReferencia: project.comissoes?.dataReferencia,
					comissionadoPapel: userInProject?.papel,
					comissaoEfetivada: !!userInProject?.dataEfetivacao || false,
					comissaoPagamentoRealizado: !!userInProject?.dataPagamento || false,
					valorComissionavel: comissionableValue,
					comissaoPorcentagem: userInProject?.porcentagem,
					comissaoValor: comissionableValue * (userInProject?.porcentagem / 100),
					dataValidacao: userInProject?.dataValidacao,
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

	const userId = user.id;
	const payload = await request.json();
	const bulkUpdates = BulkUpdateComissionsInputSchema.parse(payload);

	const appDb = await connectToAmpereProjectsDatabase();
	const projectsCollection = appDb.collection<TAppProject>("dados");

	console.log(`[BULK UPDATE COMISSIONS] User: ${user.nome} (${user.id})`);
	console.log(`[BULK UPDATE COMISSIONS] Updating ${bulkUpdates.length} projects...`);
	const bulkwrite: AnyBulkWriteOperation<TAppProject>[] = bulkUpdates.map((update) => {
		return {
			updateOne: {
				filter: { _id: new ObjectId(update.projectId) },
				update: {
					$set: {
						"comissoes.comissionados.$[comissionado].dataValidacao": new Date().toISOString(),
					},
				},
				arrayFilters: [{ "comissionado.idCrm": userId }],
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
	userId: string;
	userName: string;
};
export async function getProjects({ projectsCollection, afterDateStr, beforeDateStr, userId, userName }: GetProjectsParams) {
	const responsiblesQuery: Filter<TAppProject> = userId
		? {
				"comissoes.comissionados.idCrm": { $in: [userId] },
			}
		: {};
	const signedQueryFilter: Filter<TAppProject> = {
		"contrato.status": "ASSINADO",
	};
	const referenceDateQueryFilter: Filter<TAppProject> = {
		"comissoes.dataReferencia": { $gte: afterDateStr, $lte: beforeDateStr },
	};

	const query: Filter<TAppProject> = {
		...responsiblesQuery,
		...signedQueryFilter,
		...referenceDateQueryFilter,
	};

	const result = await projectsCollection.find(query, { projection: AppProjectComissionSimplifiedProjection }).toArray();
	return result as WithId<TAppProjectComissionSimplified>[];
}
