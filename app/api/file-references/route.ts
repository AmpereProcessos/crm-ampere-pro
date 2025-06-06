import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { NextResponse, type NextRequest } from "next/server";
import { GetFileReferencesQueryParams } from "./inputs";
import type { z } from "zod";
import createHttpError from "http-errors";
import { type Collection, type Filter, ObjectId } from "mongodb";
import { InsertFileReferenceSchema, type TFileReference, type TFileReferenceEntity } from "@/utils/schemas/file-reference.schema";
import {
	getFileReferencesByAnalysisId,
	getFileReferencesByClientId,
	getFileReferencesByHomologationId,
	getFileReferencesByOpportunityId,
} from "@/repositories/file-references/queries";
import { insertFileReference } from "@/repositories/file-references/mutation";

async function getFileReferences(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const partnerId = user.idParceiro;
	const parterScope = user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TFileReference> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const searchParams = request.nextUrl.searchParams;
	const queryParams = GetFileReferencesQueryParams.parse({
		id: searchParams.get("id"),
		opportunityId: searchParams.get("opportunityId"),
		clientId: searchParams.get("clientId"),
		analysisId: searchParams.get("analysisId"),
		homologationId: searchParams.get("homologationId"),
	});

	const { id, opportunityId, clientId, analysisId, homologationId } = queryParams;

	const db = await connectToDatabase();
	const collection: Collection<TFileReference> = db.collection("file-references");

	if (id) {
		if (!ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID de arquivo inválido.");

		const fileReference = await collection.findOne({ _id: new ObjectId(id), ...partnerQuery });
		if (!fileReference) throw new createHttpError.NotFound("Arquivo não encontrado.");

		return NextResponse.json({
			data: {
				default: undefined,
				byId: fileReference,
				byOpportunityId: undefined,
				byClientId: undefined,
				byAnalysisId: undefined,
				byHomologationId: undefined,
			},
			message: "Arquivo encontrado com sucesso",
		});
	}

	let references: TFileReferenceEntity[] = [];

	if (opportunityId) {
		if (!ObjectId.isValid(opportunityId)) throw new createHttpError.BadRequest("ID de oportunidade inválido.");
		references = await getFileReferencesByOpportunityId({
			collection,
			opportunityId,
			query: partnerQuery,
		});

		return NextResponse.json({
			data: {
				default: undefined,
				byId: undefined,
				byOpportunityId: references,
				byClientId: undefined,
				byAnalysisId: undefined,
				byHomologationId: undefined,
			},
			message: "Arquivos encontrados com sucesso",
		});
	}

	if (clientId) {
		if (!ObjectId.isValid(clientId)) throw new createHttpError.BadRequest("ID de cliente inválido.");
		references = await getFileReferencesByClientId({
			collection,
			clientId,
			partnerId: partnerId || "",
		});

		return NextResponse.json({
			data: {
				default: undefined,
				byId: undefined,
				byOpportunityId: undefined,
				byClientId: references,
				byAnalysisId: undefined,
				byHomologationId: undefined,
			},
			message: "Arquivos encontrados com sucesso",
		});
	}

	if (analysisId) {
		if (!ObjectId.isValid(analysisId)) throw new createHttpError.BadRequest("ID de análise técnica inválido.");
		references = await getFileReferencesByAnalysisId({
			collection,
			analysisId,
			partnerId: partnerId || "",
		});

		return NextResponse.json({
			data: {
				default: undefined,
				byId: undefined,
				byOpportunityId: undefined,
				byClientId: undefined,
				byAnalysisId: references,
				byHomologationId: undefined,
			},
			message: "Arquivos encontrados com sucesso",
		});
	}

	if (homologationId) {
		if (!ObjectId.isValid(homologationId)) throw new createHttpError.BadRequest("ID de homologação inválido.");
		references = await getFileReferencesByHomologationId({
			collection,
			homologationId,
			partnerId: partnerId || "",
		});

		return NextResponse.json({
			data: {
				default: undefined,
				byId: undefined,
				byOpportunityId: undefined,
				byClientId: undefined,
				byAnalysisId: undefined,
				byHomologationId: references,
			},
			message: "Arquivos encontrados com sucesso",
		});
	}

	return NextResponse.json({
		data: {
			default: [],
			byId: undefined,
			byOpportunityId: undefined,
			byClientId: undefined,
			byAnalysisId: undefined,
			byHomologationId: undefined,
		},
		message: "Nenhum parâmetro de busca fornecido",
	});
}

export type TGetFileReferencesRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getFileReferences>>>;
export type TGetFileReferencesRouteOutputDataDefault = Exclude<TGetFileReferencesRouteOutput["data"]["default"], undefined>;
export type TGetFileReferencesRouteOutputDataById = TGetFileReferencesRouteOutput["data"]["byId"];
export type TGetFileReferencesRouteOutputDataByOpportunityId = TGetFileReferencesRouteOutput["data"]["byOpportunityId"];
export type TGetFileReferencesRouteOutputDataByClientId = TGetFileReferencesRouteOutput["data"]["byClientId"];
export type TGetFileReferencesRouteOutputDataByAnalysisId = TGetFileReferencesRouteOutput["data"]["byAnalysisId"];
export type TGetFileReferencesRouteOutputDataByHomologationId = TGetFileReferencesRouteOutput["data"]["byHomologationId"];

export const GET = apiHandler({ GET: getFileReferences });

export type TCreateFileReferenceRouteInput = z.infer<typeof InsertFileReferenceSchema>;
async function createFileReference(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const partnerId = user.idParceiro;
	const parterScope = user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TFileReference> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const payload = await request.json();
	const fileReference = InsertFileReferenceSchema.parse(payload);

	const db = await connectToDatabase();
	const collection: Collection<TFileReference> = db.collection("file-references");

	const insertResponse = await insertFileReference({
		collection,
		info: fileReference,
		partnerId: partnerId || "",
	});

	if (!insertResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido no anexo do arquivo.");
	}

	return NextResponse.json({
		data: {
			insertedId: insertResponse.insertedId.toString(),
		},
		message: "Arquivo anexado com sucesso!",
	});
}

export type TCreateFileReferenceRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof createFileReference>>>;
export const POST = apiHandler({ POST: createFileReference });

export type TUpdateFileReferenceRouteInput = z.infer<typeof InsertFileReferenceSchema>;
async function updateFileReference(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const partnerId = user.idParceiro;
	const parterScope = user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TFileReference> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const searchParams = request.nextUrl.searchParams;
	const id = searchParams.get("id");

	if (!id || !ObjectId.isValid(id)) {
		throw new createHttpError.BadRequest("ID de arquivo inválido.");
	}

	const payload = await request.json();
	const fileReference = InsertFileReferenceSchema.parse(payload);

	const db = await connectToDatabase();
	const collection: Collection<TFileReference> = db.collection("file-references");

	const updateResponse = await collection.updateOne({ _id: new ObjectId(id), ...partnerQuery }, { $set: fileReference });

	if (updateResponse.modifiedCount === 0) {
		throw new createHttpError.NotFound("Arquivo não encontrado.");
	}

	return NextResponse.json({
		data: {
			updated: true,
		},
		message: "Arquivo atualizado com sucesso!",
	});
}

export type TUpdateFileReferenceRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof updateFileReference>>>;
export const PUT = apiHandler({ PUT: updateFileReference });

async function deleteFileReference(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();

	const searchParams = request.nextUrl.searchParams;
	const id = searchParams.get("id");

	if (!id || !ObjectId.isValid(id)) {
		throw new createHttpError.BadRequest("ID de arquivo inválido.");
	}

	const db = await connectToDatabase();
	const collection: Collection<TFileReference> = db.collection("file-references");

	const deleteResponse = await collection.deleteOne({ _id: new ObjectId(id) });

	if (deleteResponse.deletedCount === 0) {
		throw new createHttpError.NotFound("Arquivo não encontrado.");
	}

	return NextResponse.json({
		data: {
			deleted: true,
		},
		message: "Arquivo deletado com sucesso!",
	});
}

export type TDeleteFileReferenceRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof deleteFileReference>>>;
export const DELETE = apiHandler({ DELETE: deleteFileReference });
