import { getProductById } from "@/repositories/products/queries";
import { getProjectByIdWithReferences, getProjects } from "@/repositories/projects/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthorization } from "@/utils/api";
import { TProject } from "@/utils/schemas/project.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type GetResponse = {
	data: TProject | TProject[];
};

const getComercialProjects: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "projetos", "visualizar", true);
	const { id, pendingApproval } = req.query;

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TProject> = db.collection("projects");
	if (id) {
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
		const project = await getProjectByIdWithReferences({ collection, id, query: {} });
		if (!project) throw new createHttpError.NotFound("Projeto não encontrado.");
		return res.status(200).json({ data: project });
	}

	const pendingApprovalQuery: Filter<TProject> = pendingApproval == "true" ? { "aprovacao.dataAprovacao": null } : {};
	const comercialStageQuery: Filter<TProject> = { "liberacoes.comercial": { $ne: null }, "finalizacoes.comercial": null };
	const query = { ...comercialStageQuery, ...pendingApprovalQuery };
	const projects = await getProjects({ collection, query });
	return res.status(200).json({ data: projects });
};

export default apiHandler({ GET: getComercialProjects });
