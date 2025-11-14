import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { ApprovalRequestsSchema, type TApprovalRequests } from "@/utils/schemas/approval-requests.schema";
import createHttpError from "http-errors";
import { type Collection } from "mongodb";
import type { NextApiHandler } from "next";
import connectToDatabase from "@/services/mongodb/crm-db-connection";

type PostResponse = {
	data: {
		insertedId: string;
	};
	message: string;
};

const createApprovalRequest: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;

	const payload = ApprovalRequestsSchema.parse(req.body);

	const db = await connectToDatabase();
	const approvalRequestsCollection: Collection<TApprovalRequests> = db.collection("approval-requests");

	const insertResult = await approvalRequestsCollection.insertOne({
		...payload,
	});

	if (!insertResult.acknowledged) {
		throw new createHttpError.InternalServerError("Erro ao criar solicitação de aprovação.");
	}

	return res.status(201).json({
		data: {
			insertedId: insertResult.insertedId.toString(),
		},
		message: "Solicitação de transferência criada com sucesso!",
	});
};

export default apiHandler({ POST: createApprovalRequest });
