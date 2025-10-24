import { updateClient } from "@/repositories/clients/mutations";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TProject } from "@/utils/schemas/project.schema";
import createHttpError from "http-errors";
import { type Collection, ObjectId } from "mongodb";
import type { NextApiHandler } from "next";

type PutResponse = {
	data: string;
	message: string;
};

const updateProjectRelatedEntitiesRoute: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;

	const { projectChanges, clientChanges } = req.body;
	const { projectId, clientId } = req.query;

	const db = await connectToDatabase();
	const projectsCollection: Collection<TProject> = db.collection("projects");
	const clientsCollection: Collection<TClient> = db.collection("clients");

	if (projectId) {
		if (typeof projectId !== "string" || !ObjectId.isValid(projectId)) throw new createHttpError.BadRequest("ID de projeto inválido.");

		const updateProjectResponse = await projectsCollection.updateOne({ _id: new ObjectId(projectId) }, { $set: { ...projectChanges } });
	}

	if (clientId) {
		if (typeof clientId !== "string" || !ObjectId.isValid(clientId)) throw new createHttpError.BadRequest("ID de cliente inválido.");
		const updateClientResponse = await updateClient({
			id: clientId,
			collection: clientsCollection,
			changes: clientChanges,
			query: {},
		});
	}

	return res.status(201).json({
		data: "Atualização feita com sucesso !",
		message: "Atualização feita com sucesso !",
	});
};

export default apiHandler({ PUT: updateProjectRelatedEntitiesRoute });
