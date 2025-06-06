import { insertFunnel, updateFunnel } from "@/repositories/funnels/mutations";
import { getFunnelById, getPartnerFunnels } from "@/repositories/funnels/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import { InsertFunnelSchema, type TFunnel, type TFunnelEntity } from "@/utils/schemas/funnel.schema";
import createHttpError from "http-errors";
import { type Collection, type Filter, ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { GetFunnelQuerySchema } from "./inputs";

// GET /api/funnels - List funnels or get specific funnel
async function getFunnel(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const partnerId = user.idParceiro;
	const parterScope = user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TFunnel> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const db = await connectToDatabase();
	const funnelsCollection: Collection<TFunnel> = db.collection("funnels");

	const { searchParams } = new URL(request.url);
	const queryParams = Object.fromEntries(searchParams.entries());
	const { id } = GetFunnelQuerySchema.parse(queryParams);

	if (id) {
		if (!ObjectId.isValid(id)) {
			throw new createHttpError.BadRequest("ID inválido.");
		}
		const funnel = await getFunnelById({ collection: funnelsCollection, id: id, query: partnerQuery });
		return NextResponse.json({ data: funnel });
	}

	const funnels = await getPartnerFunnels({ collection: funnelsCollection, query: partnerQuery });
	return NextResponse.json({ data: funnels });
}

export type TGetFunnelRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getFunnel>>>;
export const GET = apiHandler({ GET: getFunnel });

// POST /api/funnels - Create new funnel
async function createFunnel(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	// Verificação de permissão para configurações/funis
	if (!user.permissoes?.configuracoes?.funis) {
		throw new createHttpError.Unauthorized("Nível de autorização insuficiente.");
	}

	const partnerId = user.idParceiro;
	const body = await request.json();

	const infoParsed = InsertFunnelSchema.parse(body);
	const funnel = {
		...infoParsed,
		idParceiro: infoParsed.idParceiro || partnerId || "",
		dataInsercao: new Date().toISOString(),
	};

	const db = await connectToDatabase();
	const funnelsCollection: Collection<TFunnel> = db.collection("funnels");

	const insertResponse = await insertFunnel({ collection: funnelsCollection, info: funnel, partnerId });
	if (!insertResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação do funil.");
	}

	return NextResponse.json(
		{
			data: { insertedId: insertResponse.insertedId.toString() },
			message: "Funil criado com sucesso !",
		},
		{ status: 201 },
	);
}

export type TCreateFunnelRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof createFunnel>>>;
export const POST = apiHandler({ POST: createFunnel });

// PUT /api/funnels - Update funnel
async function editFunnel(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	// Verificação de permissão para configurações/funis
	if (!user.permissoes?.configuracoes?.funis) {
		throw new createHttpError.Unauthorized("Nível de autorização insuficiente.");
	}

	const partnerId = user.idParceiro;
	const parterScope = user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TFunnel> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");

	if (!id || !ObjectId.isValid(id)) {
		throw new createHttpError.BadRequest("ID inválido.");
	}

	const body = await request.json();
	const changes = InsertFunnelSchema.partial().parse(body);

	const db = await connectToDatabase();
	const collection: Collection<TFunnel> = db.collection("funnels");

	const updateResponse = await updateFunnel({ id: id, collection: collection, changes: changes, query: partnerQuery });
	if (updateResponse.matchedCount === 0) {
		throw new createHttpError.NotFound("Funil não encontrado.");
	}

	if (!updateResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na atualização do funil.");
	}

	return NextResponse.json({
		data: "Funil alterado com sucesso !",
		message: "Funil alterado com sucesso !",
	});
}

export type TUpdateFunnelRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof editFunnel>>>;
export const PUT = apiHandler({ PUT: editFunnel });

// Export types for frontend usage
export type GetFunnelResponse = {
	data: TFunnelEntity | TFunnelEntity[];
};

export type PostFunnelResponse = {
	data: { insertedId: string };
	message: string;
};

export type PutFunnelResponse = {
	data: string;
	message: string;
};
