import createHttpError from "http-errors";
import { type Collection, type Filter, ObjectId } from "mongodb";
import type { NextApiHandler } from "next";
import { insertPPSCall, updatePPSCall } from "@/repositories/integrations/app-ampere/pps-calls/mutations";
import {
	getAllPPSCalls,
	getPPSCallsByApplicantId,
	getPPSCallsById,
	getPPSCallsByOpportunityId,
} from "@/repositories/integrations/app-ampere/pps-calls/queries";
import connectToCallsDatabase from "@/services/mongodb/ampere/calls-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { InsertPPSCallSchema, type TPPSCall } from "@/utils/schemas/pps-calls.schema";

type GetResponse = {
	data: TPPSCall | TPPSCall[];
};

const getPPSCalls: NextApiHandler<GetResponse> = async (req, res) => {
	await validateAuthenticationWithSession(req, res);

	const { id, opportunityId, applicantId, openOnly } = req.query;

	const db = await connectToCallsDatabase();
	const collection: Collection<TPPSCall> = db.collection("pps");

	const queryOpenOnly: Filter<TPPSCall> = openOnly === "true" ? { status: { $ne: "REALIZADO" } } : {};

	const query: Filter<TPPSCall> = { ...queryOpenOnly };

	if (id) {
		if (typeof id !== "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
		const call = await getPPSCallsById({ collection: collection, id: id });
		if (!call) throw new createHttpError.NotFound("Chamado não encontrado.");
		return res.status(200).json({ data: call });
	}
	if (opportunityId) {
		if (typeof opportunityId !== "string" || !ObjectId.isValid(opportunityId)) throw new createHttpError.BadRequest("ID de oportunidade inválido.");
		const calls = await getPPSCallsByOpportunityId({
			collection: collection,
			opportunityId: opportunityId,
			query: query,
		});
		return res.status(200).json({ data: calls });
	}
	if (applicantId) {
		if (typeof applicantId !== "string" || !ObjectId.isValid(applicantId)) throw new createHttpError.BadRequest("ID de requerente inválido.");
		const calls = await getPPSCallsByApplicantId({
			collection: collection,
			applicantId: applicantId,
			query: query,
		});
		return res.status(200).json({ data: calls });
	}

	const allCalls = await getAllPPSCalls({
		collection: collection,
		query: query,
	});

	return res.status(200).json({ data: allCalls });
};

export type TCreatePPSCallOutput = {
	data: { insertedId: string };
	message: string;
};

const createPPSCall: NextApiHandler<TCreatePPSCallOutput> = async (req, res) => {
	await validateAuthenticationWithSession(req, res);

	const call = InsertPPSCallSchema.parse(req.body);

	const db = await connectToCallsDatabase();
	const collection: Collection<TPPSCall> = db.collection("pps");

	const insertResponse = await insertPPSCall({
		collection: collection,
		info: call,
	});
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar chamado.");
	const insertedId = insertResponse.insertedId.toString();

	return res.status(200).json({ data: { insertedId }, message: "Chamado criado com sucesso !" });
};

export type TUpdatePPSCallOutput = {
	data: { updatedId: string };
	message: string;
};

const updatePPSCallHandler: NextApiHandler<TUpdatePPSCallOutput> = async (req, res) => {
	await validateAuthenticationWithSession(req, res);
	const { id } = req.query;
	if (typeof id !== "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

	const call = InsertPPSCallSchema.partial().parse(req.body);

	const db = await connectToCallsDatabase();
	const collection: Collection<TPPSCall> = db.collection("pps");

	const updateResponse = await updatePPSCall({
		collection: collection,
		info: call,
		id: id,
	});
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao atualizar chamado.");
	const updatedId = updateResponse.upsertedId?.toString() || "";
	return res.status(200).json({
		message: "Chamado atualizado com sucesso !",
		data: { updatedId: updatedId },
	});
};

export default apiHandler({
	GET: getPPSCalls,
	POST: createPPSCall,
	PUT: updatePPSCallHandler,
});
