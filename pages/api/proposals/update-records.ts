import { insertProposalUpdateRecord } from "@/repositories/proposal-update-records/mutations";
import { getProposalUpdateRecordsByProposeId } from "@/repositories/proposal-update-records/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession, validateAuthorization } from "@/utils/api";
import { InsertProposalUpdateRecordSchema, TProposalUpdateRecord } from "@/utils/schemas/proposal-update-records.schema";
import { TProposal } from "@/utils/schemas/proposal.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type PostResponse = {
	data: { insertedId: string };
	message: string;
};

const createUpdateRecord: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "propostas", "editar", true);
	const partnerId = session.user.id;
	const record = InsertProposalUpdateRecordSchema.parse(req.body);
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TProposalUpdateRecord> = db.collection("proposal-update-records");

	const insertResponse = await insertProposalUpdateRecord({ collection: collection, info: record, partnerId: partnerId || "" });
	if (!insertResponse.acknowledged)
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar registro de alteração da proposta.");
	const insertedId = insertResponse.insertedId.toString();
	return res.status(201).json({ data: { insertedId }, message: "Registro de alteração de proposta criado com sucesso !" });
};

type GetResponse = {
	data: TProposalUpdateRecord[];
};

const getUpdateRecords: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TProposalUpdateRecord> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const { proposalId } = req.query;

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TProposalUpdateRecord> = db.collection("proposal-update-records");

	if (proposalId) {
		if (typeof proposalId != "string" || !ObjectId.isValid(proposalId)) throw new createHttpError.BadRequest("ID de proposta inválido.");

		const records = await getProposalUpdateRecordsByProposeId({ collection: collection, proposalId: proposalId, query: partnerQuery });

		return res.status(200).json({ data: records });
	}

	return res.status(200).json({ data: [] });
};

export default apiHandler({ GET: getUpdateRecords, POST: createUpdateRecord });
