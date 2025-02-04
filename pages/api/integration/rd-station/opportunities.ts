import { insertFunnelReference } from "@/repositories/funnel-references/mutations";
import { getLeadReceivers } from "@/repositories/users/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import {
	type ErrorResponse,
	apiHandler,
	errorHandler,
	validateAuthentication,
	validateAuthenticationWithSession,
} from "@/utils/api";
import { stateCities } from "@/utils/estados_cidades";
import { calculateStringSimilarity, formatToPhone } from "@/utils/methods";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import type { TIntegrationRDStation } from "@/utils/schemas/integration.schema";
import type { TNotification } from "@/utils/schemas/notification.schema";
import type {
	TOpportunity,
	TOpportunityResponsible,
} from "@/utils/schemas/opportunity.schema";
import type { TUser } from "@/utils/schemas/user.schema";
import axios from "axios";
import createHttpError from "http-errors";
import { type Collection, type Db, ObjectId, type WithId } from "mongodb";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getClientSearchParams } from "../../clients/search";

type GetPayloadParams = {
	email: string;
	value: number;
	reason: string;
};

const OPERATIONS_CONFIGS = {
	SALE: {
		url: "https://api.rd.services/platform/events?event_type=sale",
		getPayload({ email, value, reason }: GetPayloadParams) {
			return {
				event_type: "SALE",
				event_family: "CDP",
				payload: {
					email: email,
					funnel_name: "default",
					value: value,
				},
			};
		},
		getHeaders(token: string) {
			return {
				accept: "application/json",
				"content-type": "application/json",
				authorization: `Bearer ${token}`,
			};
		},
	},
	OPPORTUNITY_LOST: {
		url: "https://api.rd.services/platform/events?event_type=opportunity_lost",
		getPayload({ email, value, reason }: GetPayloadParams) {
			return {
				event_type: "OPPORTUNITY_LOST",
				event_family: "CDP",
				payload: {
					email: email,
					funnel_name: "default",
					reason: reason,
				},
			};
		},
		getHeaders(token: string) {
			return {
				accept: "application/json",
				"content-type": "application/json",
				authorization: `Bearer ${token}`,
			};
		},
	},
};
type PutResponse = {
	data: string;
};
const updateOpportunities: NextApiHandler<PutResponse | ErrorResponse> = async (
	req,
	res,
) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const { operation, email, value, reason } = req.body;
	// Validating for valid operations
	if (typeof operation !== "string")
		throw new createHttpError.BadRequest("Operação inválida.");
	if (operation !== "SALE" && operation !== "OPPORTUNITY_LOST")
		throw new createHttpError.BadRequest("Operação inválida");
	// Validating params given operation type
	if (typeof email !== "string")
		throw new createHttpError.BadRequest("Tipo de email inválido.");
	if (operation === "SALE" && typeof value !== "number")
		throw new createHttpError.BadRequest("Tipo de valor inválido.");
	if (operation === "OPPORTUNITY_LOST" && typeof reason !== "string")
		throw new createHttpError.BadRequest("Tipo de razão inválida.");
	const db: Db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const integrationsCollection: Collection<TIntegrationRDStation> =
		db.collection("integrations");
	// Now, able to proceed
	try {
		// Going for the update with current token
		const token = await getToken({
			collection: integrationsCollection,
			partnerId: partnerId || "",
		});
		console.log("TOKEN NO BLOCO TRY", token);
		const url = OPERATIONS_CONFIGS[operation].url;
		const payload = OPERATIONS_CONFIGS[operation].getPayload({
			email,
			value,
			reason,
		});
		const headers = OPERATIONS_CONFIGS[operation].getHeaders(token);
		// Simulating invalid token
		// throw new createHttpError[401]('Token inválido. Acesso não autorizado.')
		const rdResponse = await axios.post(url, payload, { headers: headers });
		console.log("RD RESPONSE NO BLOCO TRY", rdResponse.data);
		// Token is invalid, so throw to catch block for refreshed token
		if (rdResponse.status === 401)
			throw new createHttpError[401]("Token inválido. Acesso não autorizado.");
		return res
			.status(201)
			.json({ data: "Oportunidade alterada com sucesso !" });
	} catch (error) {
		// Getting a refreshed token and going for the update
		const refreshedToken = await refreshToken({
			collection: integrationsCollection,
			partnerId: partnerId || "",
		});
		console.log("TOKEN NO BLOCO CATCH", refreshedToken);
		const url = OPERATIONS_CONFIGS[operation].url;
		const payload = OPERATIONS_CONFIGS[operation].getPayload({
			email,
			value,
			reason,
		});
		const headers = OPERATIONS_CONFIGS[operation].getHeaders(refreshedToken);
		const rdResponse = await axios.post(url, payload, { headers: headers });
		console.log("RD RESPONSE NO BLOCO CATCH", rdResponse.data);
		const formattedError = new createHttpError.InternalServerError(
			"Erro ao atualizar oportunidade.",
		);
		// If still unable to update oportunity, throwing InternalServerError
		if (rdResponse.status !== 200) return errorHandler(formattedError, res);
		return res
			.status(201)
			.json({ data: "Oportunidade alterada com sucesso !" });
	}
};

type PostResponse = {
	data: string;
	message: string;
};

const receiveOpportunity: NextApiHandler<PostResponse> = async (req, res) => {
	const { body, query } = req;
	if (!body || !body.leads || body.leads.length === 0)
		throw new createHttpError.BadRequest("Requisição inválida.");

	const lead = body.leads[0];
	if (!lead) throw new createHttpError.BadRequest("Nenhum lead encontrado.");
	const { partnerId } = query;
	if (
		!partnerId ||
		typeof partnerId !== "string" ||
		!ObjectId.isValid(partnerId)
	)
		throw new createHttpError.BadRequest(
			"ID de parceiro inválido ou não fornecido.",
		);

	const db: Db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const testCollection = db.collection("test");
	const clientsCollection: Collection<TClient> = db.collection("clients");
	const opportunitiesCollection: Collection<TOpportunity> =
		db.collection("opportunities");
	const funnelReferencesCollection: Collection<TFunnelReference> =
		db.collection("funnel-references");

	const usersCollection: Collection<TUser> = db.collection("users");
	const notificationsCollection: Collection<TNotification> =
		db.collection("notifications");

	// Getting lead receivers for linear distrubution of leads
	const receivers = await getLeadReceivers({
		collection: usersCollection,
		query: {},
	});

	await testCollection.insertOne(lead);
	// Getting the new receiver information
	const newReceiver = await getNewReceiver({
		collection: clientsCollection,
		users: receivers,
	});

	// Formulating new client document and inserting on db
	let newClient: TClient = {
		nome: lead.name,
		idParceiro: partnerId,
		cpfCnpj: "",
		rg: "",
		telefonePrimario: lead.personal_phone
			? getPhone(lead.personal_phone)
			: lead.mobile_phone
				? getPhone(lead.mobile_phone)
				: "",
		telefoneSecundario: null,
		email: lead.email,
		cep: "",
		uf: getUF(lead.city, undefined) || "",
		cidade: getCity(lead.city) || "",
		bairro: "",
		endereco: "",
		numeroOuIdentificador: "",
		complemento: "",
		dataNascimento: null,
		profissao: null,
		estadoCivil: null,
		canalAquisicao: "MARKETING (GERAL)",
		idMarketing: lead.id,
		indicador: {
			nome: null,
			contato: null,
		},
		autor: newReceiver,
		dataInsercao: new Date().toISOString(),
	};

	let clientId: string | null = null;

	const existingClientInDb = await getExistentClientByProperties({
		collection: clientsCollection,
		email: newClient.email || undefined,
		cpfCnpj: newClient.cpfCnpj || undefined,
		phoneNumber: newClient.telefonePrimario || undefined,
	});
	if (existingClientInDb) {
		clientId = existingClientInDb._id.toString();
		newClient = existingClientInDb;
	} else {
		const {
			insertedId: clientInsertedId,
			acknowledged: clientInsertAcknowledged,
		} = await clientsCollection.insertOne(newClient);
		clientId = clientInsertedId.toString();
	}

	// Getting the friendly identificator for new opportunity
	const identifier = await getNewOpportunityIdentifier({
		collection: opportunitiesCollection,
		partnerId: partnerId,
	});

	const responsibles: TOpportunity["responsaveis"] = [
		{ ...newReceiver, papel: "VENDEDOR" },
	];
	// Formulating new opportunity document and inserting on db
	const newOpportunity: TOpportunity = {
		nome: newClient.nome,
		idParceiro: partnerId,
		tipo: {
			id: "6615785ddcb7a6e66ede9785",
			titulo: "SISTEMA FOTOVOLTAICO",
		},
		categoriaVenda: "KIT",
		descricao: "",
		identificador: identifier,
		responsaveis: responsibles,
		idCliente: clientId,
		localizacao: {
			cep: newClient.cep,
			uf: newClient.uf,
			cidade: newClient.cidade,
			bairro: newClient.bairro,
			endereco: newClient.endereco,
			numeroOuIdentificador: newClient.numeroOuIdentificador,
			complemento: newClient.complemento,
			// distancia: z.number().optional().nullable(),
		},
		perda: {
			idMotivo: undefined,
			descricaoMotivo: undefined,
			data: undefined,
		},
		ganho: {
			idProjeto: undefined,
			data: undefined,
		},
		instalacao: {
			concessionaria: null,
			numero: undefined,
			grupo: undefined,
			tipoLigacao: undefined,
			tipoTitular: undefined,
			nomeTitular: undefined,
		},
		idMarketing: lead.id,
		autor: newReceiver,
		dataInsercao: new Date().toISOString(),
		cliente: {
			nome: newClient.nome,
			cpfCnpj: newClient.cpfCnpj,
			email: newClient.email,
			telefonePrimario: newClient.telefonePrimario,
			canalAquisicao: newClient.canalAquisicao,
		},
		// adicionar contrato e solicitação de contrato futuramente
	};

	const {
		insertedId: opportunityInsertedId,
		acknowledged: opportunityInsertAcknowledged,
	} = await opportunitiesCollection.insertOne(newOpportunity);
	console.log("OPORTUNIDADE INSERIDA", opportunityInsertedId);

	// Creating a funnel reference
	const funnelReference: TFunnelReference = {
		idParceiro: "65454ba15cf3e3ecf534b308",
		idOportunidade: opportunityInsertedId.toString(),
		idFunil: "661eb0996dd818643c5334f5",
		idEstagioFunil: "1",
		estagios: {},
		dataInsercao: new Date().toISOString(),
	};
	const insertFunnelReferenceResponse = await insertFunnelReference({
		collection: funnelReferencesCollection,
		info: funnelReference,
		partnerId: partnerId || "",
	});
	// Notifying the opportunity receiver
	const newNotification: TNotification = {
		remetente: { id: null, nome: "SISTEMA" },
		idParceiro: partnerId,
		destinatarios: [newReceiver],
		oportunidade: {
			id: opportunityInsertedId.toString(),
			nome: newOpportunity.nome,
			identificador: newOpportunity.identificador,
		},
		mensagem: "Oportunidade de venda saindo do forno pra você.",
		recebimentos: [],
		dataInsercao: new Date().toISOString(),
	};
	const { insertedId: notificationInsertedId } =
		await notificationsCollection.insertOne(newNotification);

	res.status(201).json({
		data: opportunityInsertedId.toString(),
		message: "Oportunidade inserida com sucesso.",
	});
};
function getCity(leadCity?: string) {
	if (!leadCity) return undefined;
	let allCities: string[] = [];
	Object.values(stateCities).map((arr) => {
		allCities = allCities.concat(arr);
	});
	const matchingCity = allCities.find(
		(city) => calculateStringSimilarity(leadCity.toUpperCase(), city) > 80,
	);
	return matchingCity;
}
function getUF(city?: string | null, uf?: string | null) {
	if (!city && !uf) return undefined;
	if (city && !uf) {
		let rightUF: string | undefined = undefined;
		Object.keys(stateCities).map((state) => {
			// @ts-ignore
			const foundOnCurrentState = stateCities[state as string].some(
				(x: any) => calculateStringSimilarity(city.toUpperCase(), x) > 80,
			);
			if (foundOnCurrentState) rightUF = state;
		});
		return rightUF;
	}
	if (!city && uf) {
		const ufs = Object.keys(stateCities);
		const matchingUF = ufs.find(
			(iUf) => calculateStringSimilarity(uf.toUpperCase(), iUf) > 80,
		);
		return matchingUF;
	}
	if (city && uf) {
		const ufs = Object.keys(stateCities);
		const matchingUF = ufs.find(
			(iUf) => calculateStringSimilarity(uf.toUpperCase(), iUf) > 80,
		);
		return matchingUF;
	}
}
function getPhone(phone: string) {
	if (phone.includes("+55")) {
		const cleaned = phone.replace("+55", "");
		return formatToPhone(cleaned);
	}
	return formatToPhone(phone);
}

type GetNewReceiverParam = {
	users: WithId<TUser>[];
	collection: Collection<TClient>;
};
async function getNewReceiver({ collection, users }: GetNewReceiverParam) {
	try {
		const clientesFromLeads = await collection
			.find({ idMarketing: { $ne: null } })
			.sort({ dataInsercao: -1 })
			.limit(1)
			.toArray();
		const lastClientFromLeads = clientesFromLeads[0];

		const lastReceiverId = lastClientFromLeads.autor.id;

		const lastReceiverIndex =
			users.findIndex((r) => r._id.toString() === lastReceiverId) || 0;
		const newReceiverIndex =
			lastReceiverIndex + 1 === users.length ? 0 : lastReceiverIndex + 1;
		const newReceiverUser = users[newReceiverIndex];
		const newReceiver: TOpportunityResponsible = {
			id: newReceiverUser._id.toString(),
			nome: newReceiverUser.nome,
			papel: "VENDEDOR",
			avatar_url: newReceiverUser.avatar_url,
			telefone: newReceiverUser.telefone,
			dataInsercao: new Date().toISOString(),
		};
		return newReceiver;
	} catch (error) {
		console.log("ERROR GETTING THE RECEIVER", error);
		throw error;
	}
}

type GetNewProjectIdentifier = {
	collection: Collection<TOpportunity>;
	partnerId: string;
};
async function getNewOpportunityIdentifier({
	collection,
	partnerId,
}: GetNewProjectIdentifier) {
	try {
		const lastIdentifiers = await collection
			.aggregate([
				{
					$project: {
						identificador: 1,
						idParceiro: partnerId,
					},
				},
				{
					$sort: {
						_id: -1,
					},
				},
				{
					$limit: 1,
				},
			])
			.toArray();
		const lastIdentifier = lastIdentifiers[0];
		const lastIdentifierNumberStr =
			lastIdentifier?.identificador.split("-")[1] || 0;
		const newIdentifierNumber = Number(lastIdentifierNumberStr) + 1;
		const identifier = `CRM-${newIdentifierNumber}`;
		return identifier;
	} catch (error) {
		console.log("ERROR GETTING THE NEW OPPORTUNITY IDENTIFIER", error);
		throw error;
	}
}
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method === "PUT") {
		await updateOpportunities(req, res);
	}
	if (req.method === "POST") {
		await receiveOpportunity(req, res);
	}
}

type GetTokenParams = {
	collection: Collection<TIntegrationRDStation>;
	partnerId: string;
};
async function getToken({ collection, partnerId }: GetTokenParams) {
	try {
		const integration = await collection.findOne({
			identificador: "RD_STATION",
			idParceiro: partnerId,
		});
		const token = integration?.access_token;
		if (token) return token as string;
		throw new createHttpError.NotFound("Token não encontrado.");
	} catch (error) {
		console.log("ERROR GETTING RD-STATION TOKEN", error);
		throw error;
	}
}
type RefreshTokenParams = {
	collection: Collection<TIntegrationRDStation>;
	partnerId: string;
};
async function refreshToken({ collection, partnerId }: RefreshTokenParams) {
	try {
		const integration = await collection.findOne({
			identificador: "RD_STATION",
			idParceiro: partnerId,
		});
		const RD_CLIENT_ID = integration?.client_id;
		const RD_CLIENT_SECRET = integration?.client_secret;
		const RD_REFRESH_TOKEN = integration?.refresh_token;
		const rdResponse = await axios.post("https://api.rd.services/auth/token", {
			client_id: RD_CLIENT_ID,
			client_secret: RD_CLIENT_SECRET,
			refresh_token: RD_REFRESH_TOKEN,
		});
		// console.log('RD RESPONSE', rdResponse)
		if (rdResponse.status === 200) {
			const { access_token } = rdResponse.data;
			console.log("NOVO ACESS_TOKEN", access_token);
			await collection.updateOne(
				{ identificador: "RD_STATION", idParceiro: partnerId },
				{
					$set: {
						access_token: access_token,
						dataValidacaoToken: new Date().toISOString(),
					},
				},
			);
			return access_token as string;
		}
		throw new createHttpError.InternalServerError(
			"Erro ao buscar acess_token.",
		);
	} catch (error) {
		console.log("ERROR REFRESH RD-STATION TOKEN", error);
		throw error;
	}
}

type GetExistentClientParams = {
	collection: Collection<TClient>;
	email?: string;
	cpfCnpj?: string;
	phoneNumber?: string;
};
async function getExistentClientByProperties({
	collection,
	email,
	cpfCnpj,
	phoneNumber,
}: GetExistentClientParams) {
	try {
		const orParam = getClientSearchParams({ cpfCnpj, email, phoneNumber });
		const orQuery = orParam.length > 0 ? { $or: orParam } : {};
		const query = { ...orQuery };
		const client = await collection.findOne(query);

		return client;
	} catch (error) {
		console.log("ERROR GETTING EXISTING CLIENT", error);
		throw error;
	}
}
