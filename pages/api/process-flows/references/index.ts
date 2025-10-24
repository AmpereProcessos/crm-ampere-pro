import { getProcessFlowReferenceById, getProcessFlowReferences } from "@/repositories/process-flows-references/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { TProcessFlowReference } from "@/utils/schemas/process-flow-reference.schema";
import { TProcessFlow } from "@/utils/schemas/process-flow.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type GetResponse = {
	data: TProcessFlowReference | TProcessFlowReference[];
};

const getProcessFlowReferencesRoute: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);

	const { id, projectId } = req.query;

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TProcessFlowReference> = db.collection("process-flow-references");

	if (id) {
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
		const reference = await getProcessFlowReferenceById({ collection, id, query: {} });
		if (!reference) throw new createHttpError.NotFound("Referência de fluxo de processo não encontrada.");
		return res.status(200).json({ data: reference });
	}

	const projectIdQuery: Filter<TProcessFlowReference> = projectId && typeof projectId == "string" ? { idProjeto: projectId } : {};

	const references = await getProcessFlowReferences({ collection, query: projectIdQuery });

	return res.status(200).json({ data: references });
};

export default apiHandler({ GET: getProcessFlowReferencesRoute });
