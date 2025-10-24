import { type UnwrapNextResponse, apiHandler } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import { formatDateQuery } from "@/lib/methods/formatting";
import { getClientSearchParams, getClientsByFilters, getSimilarClients } from "@/repositories/clients/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { PersonalizedClientQuerySchema, type TClient, type TClientDTOSimplified } from "@/utils/schemas/client.schema";
import createHttpError from "http-errors";
import type { Collection, Filter } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import { GetClientsByFiltersQueryParams, GetSimilarClientsQueryParams } from "../inputs";

async function getPartnerSimilarClients(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const partnerId = user.idParceiro;

	const searchParams = request.nextUrl.searchParams;
	const queryParams = GetSimilarClientsQueryParams.parse({
		cpfCnpj: searchParams.get("cpfCnpj"),
		phoneNumber: searchParams.get("phoneNumber"),
		email: searchParams.get("email"),
	});

	const { cpfCnpj, phoneNumber, email } = queryParams;

	const db = await connectToDatabase();
	const collection: Collection<TClient> = db.collection("clients");

	const orParam = getClientSearchParams({ cpfCnpj, phoneNumber, email });

	if (orParam.length === 0) {
		return NextResponse.json({
			data: {
				similarClients: [],
			},
			message: "Nenhum parâmetro de busca fornecido",
		});
	}

	const orQuery = { $or: orParam };

	const clients = await getSimilarClients({
		collection,
		query: orQuery,
	});

	return NextResponse.json({
		data: {
			similarClients: clients,
		},
		message: "Busca realizada com sucesso",
	});
}

export type TGetSimilarClientsRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getPartnerSimilarClients>>>;
export type TGetSimilarClientsRouteOutputData = TGetSimilarClientsRouteOutput["data"]["similarClients"];

export const GET = apiHandler({ GET: getPartnerSimilarClients });

function getClientByPersonalizedFilterORSearchParams({ name, phone }: { name: string; phone: string }): Filter<TClient> {
	const orArr: Filter<TClient>[] = [];

	if (name.trim().length > 0) {
		orArr.push({ nome: { $regex: name, $options: "i" } });
		orArr.push({ nome: name });
	}

	if (phone.trim().length > 0) {
		orArr.push({ telefonePrimario: { $regex: phone, $options: "i" } });
		orArr.push({ telefonePrimario: phone });
	}

	if (orArr.length === 0) return {};
	return { $or: orArr };
}

export type TClientsByFilterResult = {
	clients: TClientDTOSimplified[];
	clientsMatched: number;
	totalPages: number;
};

export type TGetClientsByFiltersRouteInput = z.infer<typeof PersonalizedClientQuerySchema>;
async function getClientsByPersonalizedFilters(request: NextRequest) {
	const PAGE_SIZE = 500;
	const { user } = await getValidCurrentSessionUncached();
	const partnerId = user.idParceiro;
	const partnerScope = user.permissoes.parceiros.escopo;
	const userScope = user.permissoes.clientes.escopo;

	const searchParams = request.nextUrl.searchParams;
	const queryParams = GetClientsByFiltersQueryParams.parse({
		after: searchParams.get("after"),
		before: searchParams.get("before"),
		page: searchParams.get("page"),
	});

	const { after, before, page } = queryParams;

	const payload = await request.json();
	const { authors, partners, filters } = PersonalizedClientQuerySchema.parse(payload);

	// If user has a scope defined and in the request there isnt a partners arr defined, then user is trying
	// to access a overall visualiation, which he/she isnt allowed
	if (!!partnerScope && !partners) {
		throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");
	}

	// Validating page parameter
	if (!page || Number.isNaN(Number(page))) {
		throw new createHttpError.BadRequest("Parâmetro de paginação inválido ou não informado.");
	}

	// Defining the queries
	const insertionQuery: Filter<TClient> =
		after !== "null" && before !== "null"
			? {
					$and: [
						{
							dataInsercao: { $gte: formatDateQuery(after, "start") as string },
						},
						{
							dataInsercao: { $lte: formatDateQuery(before, "end") as string },
						},
					],
				}
			: {};

	const authorsQuery: Filter<TClient> = authors ? { "autor.id": { $in: authors } } : {};
	const partnerQuery: Filter<TClient> = partners ? { idParceiro: { $in: [...partners] } } : {};
	const orQuery = getClientByPersonalizedFilterORSearchParams({
		name: filters.name,
		phone: filters.phone,
	});

	const filtersQuery: Filter<TClient> = {
		...orQuery,
		cidade: filters.city.length > 0 ? { $in: filters.city } : { $ne: "" },
		canalAquisicao: filters.acquisitionChannel.length > 0 ? { $in: filters.acquisitionChannel } : { $ne: "" },
	};

	const query = {
		...filtersQuery,
		...insertionQuery,
		...authorsQuery,
		...partnerQuery,
	};

	const skip = PAGE_SIZE * (Number(page) - 1);
	const limit = PAGE_SIZE;

	const db = await connectToDatabase();
	const collection: Collection<TClient> = db.collection("clients");

	const { clients, clientsMatched } = await getClientsByFilters({
		collection,
		query,
		skip,
		limit,
	});

	const totalPages = Math.ceil(clientsMatched / PAGE_SIZE);

	return NextResponse.json({
		data: {
			clients,
			clientsMatched,
			totalPages,
		},
		message: "Busca realizada com sucesso",
	});
}

export type TGetClientsByFiltersRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getClientsByPersonalizedFilters>>>;
export const POST = apiHandler({ POST: getClientsByPersonalizedFilters });
