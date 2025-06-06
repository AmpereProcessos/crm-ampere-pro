import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import createHttpError from "http-errors";
import type { Collection, Filter } from "mongodb";
import { FileReferencesQueryParamsSchema, InsertFileReferenceSchema, type TFileReference } from "@/utils/schemas/file-reference.schema";
import { getFileReferencesByQuery } from "@/repositories/file-references/queries";
import { insertManyFileReferences } from "@/repositories/file-references/mutation";

async function getMultipleSourcesFileReferences(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();

	const searchParams = request.nextUrl.searchParams;
	const queryParams = FileReferencesQueryParamsSchema.parse({
		clientId: searchParams.get("clientId"),
		opportunityId: searchParams.get("opportunityId"),
		analysisId: searchParams.get("analysisId"),
		homologationId: searchParams.get("homologationId"),
		projectId: searchParams.get("projectId"),
		purchaseId: searchParams.get("purchaseId"),
		revenueId: searchParams.get("revenueId"),
		expenseId: searchParams.get("expenseId"),
		serviceOrderId: searchParams.get("serviceOrderId"),
	});

	const { clientId, opportunityId, analysisId, homologationId, projectId, purchaseId, revenueId, expenseId, serviceOrderId } = queryParams;

	const clientQuery: Filter<TFileReference> = clientId ? { idCliente: clientId } : {};
	const opportunityQuery: Filter<TFileReference> = opportunityId ? { idOportunidade: opportunityId } : {};
	const analysisQuery: Filter<TFileReference> = analysisId ? { idAnaliseTecnica: analysisId } : {};
	const homologationQuery: Filter<TFileReference> = homologationId ? { idHomologacao: homologationId } : {};
	const projectQuery: Filter<TFileReference> = projectId ? { idProjeto: projectId } : {};
	const purchaseQuery: Filter<TFileReference> = purchaseId ? { idCompra: purchaseId } : {};
	const revenueQuery: Filter<TFileReference> = revenueId ? { idReceita: revenueId } : {};
	const expenseQuery: Filter<TFileReference> = expenseId ? { idDespesa: expenseId } : {};
	const serviceOrderQuery: Filter<TFileReference> = serviceOrderId ? { idOrdemServico: serviceOrderId } : {};

	const nonEmptyQueries = [clientQuery, opportunityQuery, analysisQuery, homologationQuery, projectQuery, purchaseQuery, revenueQuery, expenseQuery, serviceOrderQuery].filter(
		(r) => Object.keys(r).length > 0,
	);

	if (nonEmptyQueries.length === 0) {
		return NextResponse.json({
			data: {
				fileReferences: [],
			},
			message: "Nenhum parâmetro de busca fornecido",
		});
	}

	const orQuery = { $or: nonEmptyQueries };
	const query = { ...orQuery };

	const db = await connectToDatabase();
	const collection: Collection<TFileReference> = db.collection("file-references");

	const fileReferences = await getFileReferencesByQuery({ collection, query });

	return NextResponse.json({
		data: {
			fileReferences,
		},
		message: "Arquivos encontrados com sucesso",
	});
}

export type TGetMultipleSourcesFileReferencesRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getMultipleSourcesFileReferences>>>;
export type TGetMultipleSourcesFileReferencesRouteOutputData = TGetMultipleSourcesFileReferencesRouteOutput["data"]["fileReferences"];

export const GET = apiHandler({ GET: getMultipleSourcesFileReferences });

export type TCreateManyFileReferencesRouteInput = z.infer<typeof InsertFileReferenceSchema>[];
async function createManyFileReferences(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const partnerId = user.idParceiro;

	const payload = await request.json();
	const manyFileReferences = z.array(InsertFileReferenceSchema).parse(payload);

	if (manyFileReferences.length === 0) {
		return NextResponse.json({
			data: {
				insertedIds: [],
			},
			message: "Nenhum arquivo para criar",
		});
	}

	const db = await connectToDatabase();
	const fileReferencesCollection: Collection<TFileReference> = db.collection("file-references");

	const insertResponse = await insertManyFileReferences({
		collection: fileReferencesCollection,
		info: manyFileReferences,
		partnerId: partnerId || "",
	});

	if (!insertResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação das referências de arquivo.");
	}

	const insertedIds = Object.values(insertResponse.insertedIds).map((i) => i.toString());

	return NextResponse.json({
		data: {
			insertedIds,
		},
		message: "Referências de arquivo criadas com sucesso!",
	});
}

export type TCreateManyFileReferencesRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof createManyFileReferences>>>;
export const POST = apiHandler({ POST: createManyFileReferences });
