import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { NextResponse, type NextRequest } from "next/server";
import { GetClientsQueryParams } from "./inputs";
import type { z } from "zod";
import createHttpError from "http-errors";
import { type Collection, type Filter, type MatchKeysAndValues, ObjectId } from "mongodb";
import { GeneralClientSchema, type TClient } from "@/utils/schemas/client.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { getClientById, getClients, getExistentClientByProperties } from "@/repositories/clients/queries";
import { insertClient, updateClient } from "@/repositories/clients/mutations";

async function getPartnerClients(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const partnerId = user.idParceiro;
	const userScope = user.permissoes.clientes.escopo;
	const parterScope = user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TClient> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const searchParams = request.nextUrl.searchParams;
	const queryParams = GetClientsQueryParams.parse({
		id: searchParams.get("id"),
		author: searchParams.get("author"),
	});

	const { id, author } = queryParams;

	const db = await connectToDatabase();
	const collection: Collection<TClient> = db.collection("clients");

	// In case there is an ID, querying for a specific client within the partners clients
	if (id) {
		if (!ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

		const client = await getClientById({
			collection,
			id,
			query: partnerQuery,
		});

		if (!client) throw new createHttpError.NotFound("Cliente não encontrado.");

		return NextResponse.json({
			data: {
				default: undefined,
				byId: client as TClient,
			},
			message: "Cliente encontrado com sucesso",
		});
	}

	// Else, structuring a db query based on the request query params and the user's permissions
	let queryParam: MatchKeysAndValues<TClient> = {};

	if (author && typeof author === "string") {
		// Validating user scope visibility
		if (!!userScope && !userScope.includes(author)) {
			throw new createHttpError.BadRequest("Seu escopo de visibilidade não contempla esse usuário.");
		}

		if (author !== "null") queryParam = { "autor.id": author };
	}

	const clients = await getClients({
		collection,
		partnerId: partnerId || "",
		queryParam,
	});

	return NextResponse.json({
		data: {
			default: clients,
			byId: undefined,
		},
		message: "Clientes encontrados com sucesso",
	});
}

export type TGetClientsRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getPartnerClients>>>;
export type TGetClientsRouteOutputDataDefault = Exclude<TGetClientsRouteOutput["data"]["default"], undefined>;
export type TGetClientsRouteOutputDataById = TGetClientsRouteOutput["data"]["byId"];

export const GET = apiHandler({ GET: getPartnerClients });

export type TCreateClientRouteInput = z.infer<typeof GeneralClientSchema>;
async function createClient(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const partnerId = user.idParceiro;

	const payload = await request.json();
	const client = GeneralClientSchema.parse(payload);

	const db = await connectToDatabase();
	const collection: Collection<TClient> = db.collection("clients");

	const email = client.email || undefined;
	const cpfCnpj = client.cpfCnpj || undefined;
	const phoneNumber = client.telefonePrimario;

	const existingClientInDb = await getExistentClientByProperties({
		collection,
		email,
		cpfCnpj,
		phoneNumber,
	});

	if (existingClientInDb) {
		throw new createHttpError.BadRequest("Cliente com essas informações já foi criado.");
	}

	const insertResponse = await insertClient({
		collection,
		info: client,
		partnerId: partnerId || "",
	});

	if (!insertResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação do cliente.");
	}

	const insertedId = insertResponse.insertedId.toString();

	return NextResponse.json({
		data: {
			insertedId,
		},
		message: "Cliente criado com sucesso.",
	});
}

export type TCreateClientRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof createClient>>>;
export const POST = apiHandler({ POST: createClient });

export type TUpdateClientRouteInput = z.infer<typeof GeneralClientSchema>;
async function updateClientHandler(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const partnerId = user.idParceiro;
	const parterScope = user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TClient> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const searchParams = request.nextUrl.searchParams;
	const id = searchParams.get("id");

	if (!id || !ObjectId.isValid(id)) {
		throw new createHttpError.BadRequest("ID de cliente inválido.");
	}

	const payload = await request.json();
	const changes = GeneralClientSchema.partial().parse(payload);

	const db = await connectToDatabase();
	const clientsCollection: Collection<TClient> = db.collection("clients");
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");

	const client = await getClientById({
		collection: clientsCollection,
		id,
		query: partnerQuery,
	});

	if (!client) throw new createHttpError.NotFound("Cliente não encontrado.");

	const updateResponse = await updateClient({
		id,
		collection: clientsCollection,
		changes,
		query: partnerQuery,
	});

	// Update related opportunities
	const oppportunitiesUpdateArr = Object.entries({
		"cliente.nome": changes.nome,
		"cliente.cpfCnpj": changes.cpfCnpj,
		"cliente.telefonePrimario": changes.telefonePrimario,
		"cliente.email": changes.email,
		"cliente.canalAquisicao": changes.canalAquisicao,
	}).filter(([key, value]) => value !== null && value !== undefined);

	const oppportunitiesUpdate = oppportunitiesUpdateArr.reduce((acc: { [key: string]: any }, [key, value]) => {
		acc[key] = value;
		return acc;
	}, {});

	if (oppportunitiesUpdateArr.length > 0) {
		await opportunitiesCollection.updateMany({ idCliente: id }, { $set: oppportunitiesUpdate });
	}

	if (!updateResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na atualização do cliente.");
	}

	return NextResponse.json({
		data: {
			updated: true,
		},
		message: "Cliente alterado com sucesso!",
	});
}

export type TUpdateClientRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof updateClientHandler>>>;
export const PUT = apiHandler({ PUT: updateClientHandler });
