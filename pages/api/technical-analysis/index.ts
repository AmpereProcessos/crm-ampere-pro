import { insertNotification } from "@/repositories/notifications/mutations";
import { insertTechnicalAnalysis, updateTechnicalAnalysis } from "@/repositories/technical-analysis/mutations";
import { getTechnicalAnalysis, getTechnicalAnalysisById, getTechnicalAnalysisByOpportunityId } from "@/repositories/technical-analysis/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthentication, validateAuthenticationWithSession } from "@/utils/api";
import { TNotification } from "@/utils/schemas/notification.schema";
import { GeneralTechnicalAnalysisSchema, TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type GetResponse = {
	data: TTechnicalAnalysis | TTechnicalAnalysis[];
};

const getPartnerTechnicalAnalysis: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const analysisScope = session.user.permissoes.analisesTecnicas.escopo;
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TTechnicalAnalysis> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const { id, opportunityId, concludedOnly } = req.query;

	const concludedQuery: Filter<TTechnicalAnalysis> = concludedOnly == "true" ? { dataEfetivacao: { $ne: null } } : {};

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TTechnicalAnalysis> = db.collection("technical-analysis");

	if (id) {
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
		const analysis = await getTechnicalAnalysisById({ collection: collection, analysisId: id, query: partnerQuery });
		if (!analysis) throw new createHttpError.NotFound("Análise técnica não encontrada.");
		return res.status(200).json({ data: analysis });
	}
	if (opportunityId) {
		if (typeof opportunityId != "string" || !ObjectId.isValid(opportunityId)) throw new createHttpError.BadRequest("ID de oportunidade inválido.");

		const opportunityAnalysis = await getTechnicalAnalysisByOpportunityId({
			collection: collection,
			query: concludedQuery,
			opportunityId: opportunityId,
		});
		return res.status(200).json({ data: opportunityAnalysis });
	}
	// Ajusting the query for the user's scope visualization
	const applicantQuery: Filter<TTechnicalAnalysis> = analysisScope ? { "requerente.id": { $in: [...analysisScope] } } : {};
	const query = { ...partnerQuery, ...applicantQuery };
	const allAnalysis = await getTechnicalAnalysis({ collection: collection, query: query });

	return res.status(200).json({ data: allAnalysis });
};

type PostResponse = {
	data: { insertedId: string };
	message: string;
};

const createTechnicalAnalysis: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;

	const analysis = GeneralTechnicalAnalysisSchema.parse(req.body);
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TTechnicalAnalysis> = db.collection("technical-analysis");

	const insertResponse = await insertTechnicalAnalysis({ collection: collection, info: analysis, partnerId: partnerId || "" });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação da análise técnica.");

	const insertedId = insertResponse.insertedId.toString();
	return res.status(201).json({ data: { insertedId }, message: "Análise técnica criada com sucesso !" });
};

type PutResponse = {
	data: string;
	message: string;
};
const editTechnicalAnalysis: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;

	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TTechnicalAnalysis> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const { id } = req.query;
	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

	const changes = req.body;

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TTechnicalAnalysis> = db.collection("technical-analysis");
	const notificationsCollection: Collection<TNotification> = db.collection("notifications");

	const updateResponse = await updateTechnicalAnalysis({ collection: collection, info: changes, analysisId: id, query: partnerQuery });
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao atualizar análise técnica.");
	if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound("Análise técnica não encontrada.");

	// Validating need to generate an notification on technical analysis conclusion
	if (!!changes.dataEfetivacao || changes.status == "CONCLUIDO") {
		const analysis = await getTechnicalAnalysisById({ analysisId: id, collection: collection, query: {} });
		if (!analysis) throw new createHttpError.NotFound("Análise técnica não encontrada.");
		// Creating notification to the applicant of the analysis
		const applicant = analysis.requerente;
		const newNotification: TNotification = {
			remetente: { id: null, nome: "SISTEMA" },
			idParceiro: analysis.idParceiro,
			destinatarios: [{ id: applicant.id, nome: applicant.nome || "", avatar_url: applicant.avatar_url }],
			oportunidade: {
				id: analysis.oportunidade.id,
				nome: analysis.oportunidade.nome,
				identificador: analysis.oportunidade.identificador,
			},
			mensagem: `Sua solicitação de análise técnica do tipo ${analysis.tipoSolicitacao} da oportunidade ${analysis.oportunidade.nome} foi concluída.`,
			recebimentos: [],
			dataInsercao: new Date().toISOString(),
		};
		await insertNotification({ collection: notificationsCollection, info: newNotification, partnerId: partnerId || "" });
	}
	return res.status(201).json({ data: "Análise técnica atualizada com sucesso !", message: "Análise técnica atualizada com sucesso !" });
};
export default apiHandler({
	GET: getPartnerTechnicalAnalysis,
	POST: createTechnicalAnalysis,
	PUT: editTechnicalAnalysis,
});
