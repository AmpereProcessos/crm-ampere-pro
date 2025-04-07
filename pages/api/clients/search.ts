import { formatDateQuery } from "@/lib/methods/formatting";
import { getClientsByFilters, getSimilarClients } from "@/repositories/clients/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthentication, validateAuthenticationWithSession } from "@/utils/api";
import { IClient } from "@/utils/models";
import { PersonalizedClientQuerySchema, TClient, TClientDTO, TClientDTOSimplified, TClientSimplified, TSimilarClientSimplified } from "@/utils/schemas/client.schema";
import dayjs from "dayjs";
import createHttpError from "http-errors";
import { Filter } from "mongodb";
import { NextApiHandler } from "next";
import { z } from "zod";

type GetSearchParams = {
	cpfCnpj: unknown;
	phoneNumber: unknown;
	email: unknown;
};
export function getClientSearchParams({ cpfCnpj, phoneNumber, email }: GetSearchParams) {
	var orArr = [];
	if (typeof cpfCnpj == "string" && cpfCnpj.trim().length > 2) {
		orArr.push({ cpfCnpj: { $regex: cpfCnpj, $options: "i" } });
		orArr.push({ cpfCnpj: cpfCnpj });
	}

	if (typeof phoneNumber == "string" && phoneNumber.trim().length > 2) {
		orArr.push({ telefonePrimario: { $regex: phoneNumber, $options: "i" } });
		orArr.push({ telefonePrimario: phoneNumber });
	}

	if (typeof email == "string" && email.trim().length > 2) {
		orArr.push({ email: { $regex: email, $options: "i" } });
		orArr.push({ email: email });
	}
	return orArr;
}
type GetResponse = {
	data: TSimilarClientSimplified[];
};
const getPartnerSimilarClients: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection = db.collection<TClient>("clients");
	const { cpfCnpj, phoneNumber, email } = req.query;

	const orParam = getClientSearchParams({ cpfCnpj, phoneNumber, email });
	if (orParam.length == 0) return res.status(200).json({ data: [] });

	const orQuery = { $or: orParam };

	const clients = await getSimilarClients({
		collection: collection,
		query: orQuery,
	});

	res.status(200).json({ data: clients });
};

const QuerySchema = z.object({
	after: z.string({
		required_error: "Parâmetros de período não fornecidos ou inválidos.",
		invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
	}),
	before: z.string({
		required_error: "Parâmetros de período não fornecidos ou inválidos.",
		invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
	}),
	page: z.string({ required_error: "Parâmetro de páginação não informado." }),
});

function getClientByPersonalizedFilterORSearchParams({ name, phone }: { name: string; phone: string }): Filter<TClient> {
	var orArr: Filter<TClient>[] = [];
	if (name.trim().length > 0) {
		orArr.push({ nome: { $regex: name, $options: "i" } });
		orArr.push({ nome: name });
	}

	if (phone.trim().length > 0) {
		orArr.push({ telefonePrimario: { $regex: phone, $options: "i" } });
		orArr.push({ telefonePrimario: phone });
	}
	if (orArr.length == 0) return {};
	return { $or: orArr };
}
export type TClientsByFilterResult = {
	clients: TClientDTOSimplified[];
	clientsMatched: number;
	totalPages: number;
};
type PostResponse = {
	data: TClientsByFilterResult;
};
const getClientsByPersonalizedFilters: NextApiHandler<PostResponse> = async (req, res) => {
	const PAGE_SIZE = 500;
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const partnerScope = session.user.permissoes.parceiros.escopo;

	const userId = session.user.id;
	const userScope = session.user.permissoes.clientes.escopo;
	const { after, before, page } = QuerySchema.parse(req.query);
	const { authors, partners, filters } = PersonalizedClientQuerySchema.parse(req.body);

	// If user has a scope defined and in the request there isnt a partners arr defined, then user is trying
	// to access a overall visualiation, which he/she isnt allowed
	if (!!partnerScope && !partners) throw new createHttpError.Unauthorized("Seu usuário não possui solicitação para esse escopo de visualização.");

	// Validating page parameter
	if (!page || isNaN(Number(page))) throw new createHttpError.BadRequest("Parâmetro de paginação inválido ou não informado.");

	// Defining the queries
	const insertionQuery: Filter<TClient> =
		after != "null" && before != "null"
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
	console.log(filtersQuery);
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection = db.collection<TClient>("clients");
	const { clients, clientsMatched } = await getClientsByFilters({
		collection: collection,
		query: query,
		skip: skip,
		limit: limit,
	});
	const totalPages = Math.round(clientsMatched / PAGE_SIZE);
	return res.status(200).json({ data: { clients, clientsMatched, totalPages } });
};

export default apiHandler({
	GET: getPartnerSimilarClients,
	POST: getClientsByPersonalizedFilters,
});
