import { insertOpportunityHistory, updateOpportunityHistory } from "@/repositories/opportunity-history/mutation";
import { getOpportunityHistory, getOpportunityHistoryById } from "@/repositories/opportunity-history/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { novu } from "@/services/novu";
import { NOVU_WORKFLOW_IDS } from "@/services/novu/workflows";
import { apiHandler, validateAuthorization } from "@/utils/api";
import type { TConectaIndication } from "@/utils/schemas/conecta-indication.schema";
import {
	InsertOpportunityHistorySchema,
	type TOpportunityHistory,
	type TOpportunityHistoryEntity,
	UpdateOpportunityHistorySchema,
} from "@/utils/schemas/opportunity-history.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import createHttpError from "http-errors";
import { type Collection, type Filter, ObjectId } from "mongodb";
import type { NextApiHandler } from "next";

type PostResponse = {
	data: {
		insertedId: string;
	};
	message: string;
};

const createOpportunityHistory: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "oportunidades", "editar", true);
	const partnerId = session.user.idParceiro;

	const opportunityHistory = InsertOpportunityHistorySchema.parse(req.body);

	const db = await connectToDatabase();
	const opportunityHistoryCollection: Collection<TOpportunityHistory> = db.collection("opportunities-history");
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");
	const conectaIndicationsCollection: Collection<TConectaIndication> = db.collection("conecta-indications");

	const insertResponse = await insertOpportunityHistory({ collection: opportunityHistoryCollection, info: opportunityHistory, partnerId: partnerId || "" });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação do histórico da oportunidade.");
	// If opportunity history is an interaction, updating the opportunity with the latest interaction
	if (opportunityHistory.categoria === "INTERAÇÃO") {
		await opportunitiesCollection.updateOne(
			{ _id: new ObjectId(opportunityHistory.oportunidade.id) },
			{ $set: { ultimaInteracao: { tipo: opportunityHistory.tipoInteracao, data: new Date().toISOString() } } },
		);
		// Updating opportunity s indication (if applicable) in case of first interaction
		await conectaIndicationsCollection.updateOne(
			{ "oportunidade.id": opportunityHistory.oportunidade.id, "oportunidade.dataInteracao": null },
			{ $set: { "oportunidade.dataInteracao": new Date().toISOString() } },
		);
	}

	// Notifying users of the new interaction
	const novuTopicKey = `opportunity:${opportunityHistory.oportunidade.id}`;
	// Notifying users of the new interaction
	const novuTriggerBulkResponse = await novu.trigger({
		to: {
			type: "Topic",
			topicKey: novuTopicKey,
		},
		workflowId: NOVU_WORKFLOW_IDS.NOTIFY_NEW_INTERACTION_TO_RESPONSIBLES,
		payload: {
			autor: {
				nome: session.user.nome,
				avatar_url: session.user.avatar_url,
			},
			oportunidade: {
				id: opportunityHistory.oportunidade.id,
				identificador: opportunityHistory.oportunidade.identificador,
				nome: opportunityHistory.oportunidade.nome,
			},
			interacao: {
				tipo: opportunityHistory.categoria === "INTERAÇÃO" ? opportunityHistory.tipoInteracao : opportunityHistory.categoria,
			},
		},
		actor: {
			subscriberId: session.user.id,
			firstName: session.user.nome,
			avatar: session.user.avatar_url || undefined,
		},
	});
	console.log("[NOVU] - Notifications sent on new interaction", novuTriggerBulkResponse.result);
	const insertedId = insertResponse.insertedId.toString();

	res.status(201).json({ data: { insertedId: insertedId }, message: "Evento de oportunidade criado com sucesso." });
};

type GetResponse = {
	data: TOpportunityHistory[] | TOpportunityHistory;
};

const getTypes = ["open-activities"];
const getOpportunitiesHistory: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "oportunidades", "visualizar", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TOpportunityHistory> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const { id, opportunityId, type } = req.query;

	const db = await connectToDatabase();
	const collection: Collection<TOpportunityHistory> = db.collection("opportunities-history");

	if (id) {
		if (typeof id !== "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
		const history = await getOpportunityHistoryById({ id: id, collection: collection, query: {} });
		if (!history) throw new createHttpError.NotFound("Objeto de histórico da oportunidade não encontrado.");
		return res.status(200).json({ data: history });
	}
	if (!opportunityId || typeof opportunityId !== "string" || !ObjectId.isValid(opportunityId)) throw new createHttpError.BadRequest("ID de oportunidade inválido.");

	const history = await getOpportunityHistory({ opportunityId: opportunityId, collection: collection, query: {} });

	return res.status(200).json({ data: history });
	// if (!!opportunityId) {
	//   if (!!type) {
	//     if (typeof type != 'string') throw new createHttpError.BadRequest('Tipo de requisição inválido.')
	//     if (!getTypes.includes(type)) throw new createHttpError.BadGateway('Tipo de requisição inválido.')
	//     const opportunityOpenActivities = await getOpportunityOpenActivitiesByOpportunityId({
	//       opportunityId: opportunityId,
	//       collection: opportunityHistoryCollection,
	//       partnerId: partnerId || '',
	//     })
	//     return res.status(200).json({ data: opportunityOpenActivities })
	//   }
	//   const opportunityHistory = await getOpportunityHistoryByOpportunityId({
	//     opportunityId: opportunityId,
	//     collection: opportunityHistoryCollection,
	//     partnerId: partnerId || '',
	//   })
	//   return res.status(200).json({ data: opportunityHistory })
	// }
	// return res.status(400).json({ data: [] });
};

type PutResponse = {
	data: string;
	message: string;
};

const editOpportunityHistory: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "oportunidades", "editar", true);
	const userId = session.user.id;
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TOpportunityHistory> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const userScope = session.user.permissoes.oportunidades.escopo;

	const { id } = req.query;
	if (!id || typeof id !== "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
	const changes = UpdateOpportunityHistorySchema.parse(req.body);
	// const changes = req.body
	const db = await connectToDatabase();
	const opportunityHistoryCollection: Collection<TOpportunityHistory> = db.collection("opportunities-history");
	// Validating existence of opportunity history
	const opportunityHistory = await getOpportunityHistoryById({ collection: opportunityHistoryCollection, id: id, query: partnerQuery });
	if (!opportunityHistory) throw new createHttpError.NotFound("Objeto de alteração não encontrada.");
	// Checking for opportunity history edit authorization
	// @ts-ignore
	if (!!userScope && !userScope.includes(opportunityHistory.responsavel?.id)) new createHttpError.Unauthorized("Usuário não possui permissão para essa alteração.");

	const updateResponse = await updateOpportunityHistory({
		id: id,
		collection: opportunityHistoryCollection,
		changes: changes,
		query: partnerQuery,
	});
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação do usuário.");
	return res.status(201).json({ data: "Objeto alterado com sucesso !", message: "Objeto alterado com sucesso !" });
};
export default apiHandler({
	GET: getOpportunitiesHistory,
	POST: createOpportunityHistory,
	PUT: editOpportunityHistory,
});
