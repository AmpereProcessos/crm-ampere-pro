import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";

import { stateCities } from "@/utils/estados_cidades";
import { calculateStringSimilarity, formatToPhone } from "@/utils/methods";
import { IClient } from "@/utils/models";
import { TClient } from "@/utils/schemas/client.schema";
import { TUser } from "@/utils/schemas/user.schema";
import axios from "axios";
import createHttpError from "http-errors";
import { Collection, Db, ObjectId, WithId } from "mongodb";
import { NextApiHandler } from "next";
import users from "../users";
import { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { TNotification } from "@/utils/schemas/notification.schema";

type PostResponse = {
	data: any;
	message: string;
};
function getCity(leadCity?: string) {
	if (!leadCity) return undefined;
	var allCities: string[] = [];
	Object.values(stateCities).map((arr) => {
		allCities = allCities.concat(arr);
	});
	const matchingCity = allCities.find((city) => calculateStringSimilarity(leadCity.toUpperCase(), city) > 80);
	return matchingCity;
}
function getUF(city?: string | null, uf?: string | null) {
	if (!city && !uf) return undefined;
	if (city && !uf) {
		var rightUF: string | undefined = undefined;
		Object.keys(stateCities).map((state) => {
			// @ts-ignore
			const foundOnCurrentState = stateCities[state as string].some((x: any) => calculateStringSimilarity(city.toUpperCase(), x) > 80);
			if (foundOnCurrentState) rightUF = state;
		});
		return rightUF;
	}
	if (!city && uf) {
		const ufs = Object.keys(stateCities);
		const matchingUF = ufs.find((iUf) => calculateStringSimilarity(uf.toUpperCase(), iUf));
		return matchingUF;
	}
	if (city && uf) {
		const ufs = Object.keys(stateCities);
		const matchingUF = ufs.find((iUf) => calculateStringSimilarity(uf.toUpperCase(), iUf));
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
async function getNewReceiver({ collection, users }: GetNewReceiverParam) {
	try {
		const clientesFromLeads = await collection
			.find({ idMarketing: { $ne: null } })
			.sort({ dataInsercao: -1 })
			.limit(1)
			.toArray();
		const lastClientFromLeads = clientesFromLeads[0];

		const lastReceiverId = lastClientFromLeads.autor.id;

		const lastReceiverIndex = users.findIndex((r) => r._id.toString() == lastReceiverId) || 0;
		const newReceiverIndex = lastReceiverIndex + 1 == users.length ? 0 : lastReceiverIndex + 1;
		const newReceiverUser = users[newReceiverIndex];
		const newReceiver = { id: newReceiverUser._id.toString(), nome: newReceiverUser.nome, avatar_url: newReceiverUser.avatar_url };
		return newReceiver;
	} catch (error) {
		throw error;
	}
}

type GetNewProjectIdentifier = {
	collection: Collection<TOpportunity>;
	partnerId: string;
};
async function getNewOpportunityIdentifier({ collection, partnerId }: GetNewProjectIdentifier) {
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
		const lastIdentifierNumberStr = lastIdentifier?.identificador.split("-")[1] || 0;
		const newIdentifierNumber = Number(lastIdentifierNumberStr) + 1;
		const identifier = `CRM-${newIdentifierNumber}`;
		return identifier;
	} catch (error) {
		throw error;
	}
}
const collectLead: NextApiHandler<PostResponse> = async (req, res) => {
	const { body, query } = req;
	if (!body || !body.leads || body.leads.length == 0) throw new createHttpError.BadRequest("Requisição inválida.");

	const lead = body.leads[0];
	if (!lead) throw new createHttpError.BadRequest("Nenhum lead encontrado.");
	const { partnerId } = query;
	if (!partnerId || typeof partnerId != "string" || !ObjectId.isValid(partnerId)) throw new createHttpError.BadRequest("ID de parceiro inválido ou não fornecido.");

	const db: Db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const testCollection = db.collection("test");
	const clientsCollection: Collection<TClient> = db.collection("clients");
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");
	const usersCollection: Collection<TUser> = db.collection("users");
	const notificationsCollection: Collection<TNotification> = db.collection("notifications");

	// Getting users for linear distrubution of leads
	const users = await usersCollection.find({ idParceiro: partnerId }, { sort: { _id: 1 } }).toArray();

	await testCollection.insertOne(lead);
	// Getting the new receiver information
	const newReceiver = await getNewReceiver({ collection: clientsCollection, users: users });

	// Formulating new client document and inserting on db
	const newClient: TClient = {
		nome: lead.name,
		idParceiro: partnerId,
		cpfCnpj: "",
		rg: "",
		telefonePrimario: lead.personal_phone ? getPhone(lead.personal_phone) : lead.mobile_phone ? getPhone(lead.mobile_phone) : "",
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
		dataInsercao: new Date().toISOString(),
		idMarketing: lead.id,
		indicador: {
			nome: null,
			contato: null,
		},
		autor: newReceiver,
	};

	const { insertedId: clientInsertedId, acknowledged: clientInsertAcknowledged } = await clientsCollection.insertOne(newClient);

	// Getting the friendly identificator for new opportunity
	const identifier = await getNewOpportunityIdentifier({ collection: opportunitiesCollection, partnerId: partnerId });

	const responsibles: TOpportunity["responsaveis"] = [{ ...newReceiver, papel: "VENDEDOR" }];
	// Formulating new opportunity document and inserting on db
	const newOpportunity: TOpportunity = {
		nome: newClient.nome,
		idParceiro: partnerId,
		tipo: "SISTEMA FOTOVOLTAICO",
		descricao: "",
		identificador: identifier,
		responsaveis: responsibles,
		idCliente: clientInsertedId.toString(),
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
		autor: newReceiver,
		dataInsercao: new Date().toISOString(),
		// adicionar contrato e solicitação de contrato futuramente
	};
	const { insertedId: opportunityInsertedId, acknowledged: opportunityInsertAcknowledged } = await opportunitiesCollection.insertOne(newOpportunity);

	// Notifying the opportunity receiver
	const newNotification: TNotification = {
		idParceiro: partnerId,
		remetente: { id: "SISTEMA", nome: "SISTEMA" },
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
	const { insertedId: notificationInsertedId } = await notificationsCollection.insertOne(newNotification);

	res.status(201).json({ data: opportunityInsertedId.toString(), message: "Oportunidade inserida com sucesso." });
};

export default apiHandler({
	POST: collectLead,
});
type GetNewReceiverParam = {
	users: WithId<TUser>[];
	collection: Collection<TClient>;
};
type NotifyOpportunityReceived = {
	collection: Collection;
	referenceProject: {
		id: string;
		nome: string;
		identificador: string;
	};
	recipient: {
		id: string;
		nome: string;
		email?: string;
	};
};
async function notifyOpportunityReceived({ collection, referenceProject, recipient }: NotifyOpportunityReceived) {
	try {
		const notification = {
			remetente: "SISTEMA",
			destinatario: recipient,
			projetoReferencia: referenceProject,
			mensagem: "Uma oportunidade saindo do forno pra você.",
			dataInsercao: new Date().toISOString(),
		};
		const insertResponse = await collection.insertOne(notification);
		const insertedId = insertResponse.insertedId;
		console.log("INSERTED NOTICATION", insertedId);
		return insertedId.toString();
	} catch (error) {
		throw error;
	}
}
