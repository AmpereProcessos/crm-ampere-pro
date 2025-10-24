import createHttpError from "http-errors";
import type { Collection, Filter } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached, type TUserSession } from "@/lib/auth/session";
import { getClientSearchParams, getClientsByFilters, getSimilarClients } from "@/repositories/clients/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TClient, TClientDTOSimplified } from "@/utils/schemas/client.schema";
import { GetSimilarClientsQueryParams } from "../inputs";

async function getPartnerSimilarClients(request: NextRequest) {
	await getValidCurrentSessionUncached();

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

export type TClientsByFilterResult = {
	clients: TClientDTOSimplified[];
	clientsMatched: number;
	totalPages: number;
};

const GetClientsByPersonalizedFiltersInputSchema = z.object({
	page: z.number({
		required_error: "Página não informada.",
		invalid_type_error: "Tipo não válido para página.",
	}),
	search: z
		.string({
			required_error: "Filtro de busca não informado.",
			invalid_type_error: "Tipo não válido para filtro de busca.",
		})
		.optional()
		.nullable(),
	ufs: z.array(
		z.string({
			required_error: "Estados não informados.",
			invalid_type_error: "Tipo não válido para estados.",
		}),
		{
			required_error: "Lista de estados não informada.",
			invalid_type_error: "Tipo não válido para lista de estados.",
		},
	),
	cities: z.array(
		z.string({
			required_error: "Cidades não informadas.",
			invalid_type_error: "Tipo não válido para cidades.",
		}),
		{
			required_error: "Lista de cidades não informada.",
			invalid_type_error: "Tipo não válido para lista de cidades.",
		},
	),
	authorIds: z.array(
		z.string({
			required_error: "IDs de autores não informados.",
			invalid_type_error: "Tipo não válido para IDs de autores.",
		}),
		{
			required_error: "Lista de IDs de autores não informada.",
			invalid_type_error: "Tipo não válido para lista de IDs de autores.",
		},
	),
});
export type TGetClientsByFiltersRouteInput = z.infer<typeof GetClientsByPersonalizedFiltersInputSchema>;
async function getClientsByPersonalizedFilters({ session, input }: { session: TUserSession; input: TGetClientsByFiltersRouteInput }) {
	const PAGE_SIZE = 200;
	const userClientsScope = session.user.permissoes.clientes.escopo;

	const { page, search, ufs, cities, authorIds } = input;

	if (userClientsScope && authorIds.some((id) => !userClientsScope.includes(id))) {
		throw new createHttpError.Unauthorized("Seu usuário não possui autorização para esse escopo de visualização.");
	}

	const authorsQuery: Filter<TClient> = authorIds.length > 0 ? { "autor.id": { $in: authorIds } } : {};
	const citiesQuery: Filter<TClient> = cities.length > 0 ? { cidade: { $in: cities } } : {};
	const ufsQuery: Filter<TClient> = ufs.length > 0 ? { uf: { $in: ufs } } : {};

	const searchQuery: Filter<TClient> =
		search && search.trim().length > 0
			? {
					$or: [
						// Name search
						{ nome: { $regex: search, $options: "i" } },
						{ nome: search },
						// CPF/CNPJ search
						{ cpfCnpj: { $regex: search } }, // No options, giving its numbers-only
						{ cpfCnpj: search },
						// Phone search
						{ telefonePrimarioBase: { $regex: search } }, // No options, giving its numbers-only
						{ telefonePrimarioBase: search },
						// Email search
						{ email: { $regex: search, $options: "i" } },
						{ email: search },
					],
				}
			: {};
	const query = {
		...authorsQuery,
		...citiesQuery,
		...ufsQuery,
		...searchQuery,
	};

	console.log("[INFO] [GET_CLIENTS_BY_PERSONALIZED_FILTERS] Query", JSON.stringify(query, null, 2));
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

	return {
		data: {
			clients,
			clientsMatched,
			totalPages,
		},
	};
}
export type TGetClientsByPersonalizedFiltersOutput = Awaited<ReturnType<typeof getClientsByPersonalizedFilters>>;

const getClientsByPersonalizedFiltersRoute = async (req: NextRequest) => {
	const session = await getValidCurrentSessionUncached();
	const payload = await req.json();
	console.log("[INFO] [GET_CLIENTS_BY_PERSONALIZED_FILTERS] Payload", JSON.stringify(payload, null, 2));
	const input = GetClientsByPersonalizedFiltersInputSchema.parse(payload);
	const result = await getClientsByPersonalizedFilters({ session, input });
	return NextResponse.json(result);
};

export const POST = apiHandler({ POST: getClientsByPersonalizedFiltersRoute });
