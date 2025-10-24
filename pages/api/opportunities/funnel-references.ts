import { deleteFunnelReference, insertFunnelReference, updateFunnelReference } from "@/repositories/funnel-references/mutations";
import { getFunnelReferenceById } from "@/repositories/funnel-references/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthorization } from "@/utils/api";
import { InsertFunnelReferenceSchema, TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import { TOpportunity } from "@/utils/schemas/opportunity.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";
type PostResponse = {
	data: {
		insertedId: string;
	};
	message: string;
};
const createFunnelReference: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "oportunidades", "criar", true);
	const partnerId = session.user.idParceiro;
	// Parsing insert object from request
	const funnelReference = InsertFunnelReferenceSchema.parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const funnelReferencesCollection: Collection<TFunnelReference> = db.collection("funnel-references");

	const insertResponse = await insertFunnelReference({ collection: funnelReferencesCollection, info: funnelReference, partnerId: partnerId || "" });
	// In case something went wrong, acknowledged would be false, so throwing an error
	if (!insertResponse.acknowledged)
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação da referência de funil.");
	// Else, returning the inserted ID
	const insertedId = insertResponse.insertedId.toString();
	return res.status(201).json({ data: { insertedId: insertedId }, message: "Referência de funil criada com sucesso!" });
};
type PutResponse = {
	data: string;
	message: string;
};
const editFunnelReference: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "oportunidades", "criar", true);
	// const partnerId = session.user.idParceiro
	// const parterScope = session.user.permissoes.parceiros.escopo
	// const partnerQuery: Filter<TFunnelReference> = { idParceiro: parterScope ? { $in: parterScope } : { $ne: undefined } }

	// Validing update id
	const { id } = req.query;
	if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const funnelReferencesCollection: Collection<TFunnelReference> = db.collection("funnel-references");

	// Validing payload, checking if there is new stage id reference
	const updates = InsertFunnelReferenceSchema.partial().parse(req.body);
	const newStageId = updates.idEstagioFunil?.toString();
	if (!newStageId) throw new createHttpError.BadRequest("Novo estágio de funil não informado.");

	const reference = await getFunnelReferenceById({ collection: funnelReferencesCollection, id: id, query: {} });
	if (!reference) throw new createHttpError.NotFound("Referência de funil não encontrada.");

	// In case there new stage id is equal to the current stage id, there is no need to update the reference
	if (reference.idEstagioFunil == newStageId)
		return res.status(201).json({ data: "Atualização feita com sucesso!", message: "Atualização feita com sucesso !" });

	const additionalUpdates = {
		[`estagios.${reference.idEstagioFunil}.saida`]: new Date().toISOString(),
		[`estagios.${newStageId}.entrada`]: new Date().toISOString(),
	};
	const updateResponse = await updateFunnelReference({
		collection: funnelReferencesCollection,
		funnelReferenceId: id,
		newStageId: newStageId,
		additionalUpdates,
		// query: partnerQuery,
	});
	if (!updateResponse.acknowledged)
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na atualização da referência de funil.");
	res.status(201).json({ data: "Atualização feita com sucesso!", message: "Atualização feita com sucesso !" });
};

type DeleteResponse = {
	data: string;
	message: string;
};

const removeFunnelReferenceRoute: NextApiHandler<DeleteResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "oportunidades", "criar", true);
	const userId = session.user.id;
	const userOpportunityScope = session.user.permissoes.oportunidades.escopo;
	const { id } = req.query;
	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const funnelReferencesCollection: Collection<TFunnelReference> = db.collection("funnel-references");
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");

	const funnelReference = await getFunnelReferenceById({ collection: funnelReferencesCollection, id: id, query: {} });
	if (!funnelReference) throw new createHttpError.NotFound("Referência de funil não encontrada.");
	const opportunityId = funnelReference.idOportunidade;
	const opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) }, { projection: { responsaveis: 1 } });
	if (!opportunity) throw new createHttpError.NotFound("Oops, houve um erro ao excluir referência de funil.");

	// Validating if user either: has global opportunity scope, its one of the opportunity responsibles or has one of the opportunity responsibles within his scope
	const hasEditAuthorizationForOpportunity =
		!userOpportunityScope || opportunity.responsaveis.some((opResp) => opResp.id == userId || userOpportunityScope.includes(opResp.id));
	if (!hasEditAuthorizationForOpportunity) throw new createHttpError.Unauthorized("Você não possui permissão para realizar essa operação.");

	const deleteResponse = await deleteFunnelReference({ collection: funnelReferencesCollection, id: id, query: {} });
	if (!deleteResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao excluir referência de funil.");

	return res.status(200).json({ data: "Referência de funil removida com sucesso !", message: "Referência de funil removida com sucesso !" });
};

export default apiHandler({
	POST: createFunnelReference,
	PUT: editFunnelReference,
	DELETE: removeFunnelReferenceRoute,
});
