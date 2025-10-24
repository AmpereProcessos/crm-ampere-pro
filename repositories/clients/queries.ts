import { formatPhoneAsBase } from "@/utils/methods";
import {
	ClientSimplifiedProjection,
	SimilarClientsSimplifiedProjection,
	type TClient,
	type TSimilarClientSimplifiedDTO,
} from "@/utils/schemas/client.schema";
import { type Collection, type Filter, type MatchKeysAndValues, ObjectId, type WithId } from "mongodb";

type GetClientByIdParams = {
	collection: Collection<TClient>;
	id: string;
	query: Filter<TClient>;
};
export async function getClientById({ collection, id, query }: GetClientByIdParams) {
	try {
		const clientsArr = await collection
			.aggregate([
				{ $match: { _id: new ObjectId(id), ...query } },
				{
					$addFields: {
						stringId: { $toString: "$_id" },
					},
				},
				{
					$lookup: {
						from: "opportunities",
						localField: "stringId",
						foreignField: "idCliente",
						as: "oportunidades",
					},
				},
			])
			.toArray();
		const client = clientsArr[0];
		return client;
	} catch (error) {
		console.log("[ERROR] Error getting client by id", error);
		throw error;
	}
}

export function getClientSearchParams({ cpfCnpj, phoneNumber, email }: { cpfCnpj: unknown; phoneNumber: unknown; email: unknown }) {
	const orArr = [];

	if (typeof cpfCnpj === "string" && cpfCnpj.trim().length > 2) {
		orArr.push({ cpfCnpj: { $regex: cpfCnpj, $options: "i" } });
		orArr.push({ cpfCnpj: cpfCnpj });
	}

	if (typeof phoneNumber === "string" && phoneNumber.trim().length > 2) {
		orArr.push({
			telefonePrimarioBase: {
				$regex: formatPhoneAsBase(phoneNumber),
			},
		});
		orArr.push({ telefonePrimarioBase: formatPhoneAsBase(phoneNumber) });
	}

	if (typeof email === "string" && email.trim().length > 2) {
		orArr.push({ email: { $regex: email, $options: "i" } });
		orArr.push({ email: email });
	}

	return orArr;
}
type GetExistentClientParams = {
	collection: Collection<TClient>;
	email?: string;
	cpfCnpj?: string;
	phoneNumber?: string;
};
export async function getExistentClientByProperties({ collection, email, cpfCnpj, phoneNumber }: GetExistentClientParams) {
	try {
		const orParam = getClientSearchParams({ cpfCnpj, email, phoneNumber });
		const orQuery = orParam.length > 0 ? { $or: orParam } : {};
		const query = { ...orQuery };
		const client = await collection.findOne(query);

		return client;
	} catch (error) {
		console.log("[ERROR] Error getting existent client by properties", error);
		throw error;
	}
}

type GetClientsParams = {
	collection: Collection<TClient>;
	partnerId: string;
	queryParam: MatchKeysAndValues<TClient>;
};
export async function getClients({ collection, partnerId, queryParam }: GetClientsParams) {
	try {
		const clients = await collection.find({ idParceiro: partnerId, ...queryParam }).toArray();
		return clients;
	} catch (error) {
		console.log("[ERROR] Error getting clients", error);
		throw error;
	}
}

type GetSimilarClientsParams = {
	collection: Collection<TClient>;

	query: Filter<TClient>;
};

export async function getSimilarClients({ collection, query }: GetSimilarClientsParams) {
	try {
		const clients = await collection.find({ ...query }, { projection: SimilarClientsSimplifiedProjection }).toArray();
		return clients.map((c) => ({
			...c,
			_id: c._id.toString(),
		})) as TSimilarClientSimplifiedDTO[];
	} catch (error) {
		console.log("[ERROR] Error getting similar clients", error);
		throw error;
	}
}

type GetClientsByFiltersParams = {
	collection: Collection<TClient>;
	query: Filter<TClient>;
	skip: number;
	limit: number;
};
export async function getClientsByFilters({ collection, query, skip, limit }: GetClientsByFiltersParams) {
	try {
		// Getting the total clients matched by the query
		const clientsMatched = await collection.countDocuments({ ...query });
		const sort = { _id: -1 };
		const match = { ...query };
		const clients = await collection.find(match, { projection: ClientSimplifiedProjection }).skip(skip).limit(limit).sort({ _id: -1 }).toArray();
		
		return {
			clientsMatched,
			clients: clients.map((c) => ({
				_id: c._id.toString(),
				nome: c.nome,
				telefonePrimario: c.telefonePrimario,
				telefonePrimarioBase: c.telefonePrimarioBase,
				email: c.email,
				cpfCnpj: c.cpfCnpj,
				cep: c.cep,
				uf: c.uf,
				cidade: c.cidade,
				bairro: c.bairro,
				endereco: c.endereco,
				numeroOuIdentificador: c.numeroOuIdentificador,
				complemento: c.complemento,
				autor: c.autor,
				conecta: c.conecta,
				dataInsercao: c.dataInsercao,
			})) 
		}
	} catch (error) {
		console.log("[ERROR] Error getting clients by filters", error);
		throw error;
	}
}
