import { insertProjectType, updateProjectType } from "@/repositories/project-type/mutations";
import { getProjectTypeById, getProjectTypes } from "@/repositories/project-type/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession, validateAuthorization } from "@/utils/api";
import { TProduct } from "@/utils/schemas/products.schema";
import { InsertProjectTypeSchema, TProjectType } from "@/utils/schemas/project-types.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type PostResponse = {
	data: { insertedId: string };
	message: string;
};

const createProjectType: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "configuracoes", "tiposProjeto", true);
	const partnerId = session.user.idParceiro;

	const type = InsertProjectTypeSchema.parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TProjectType> = db.collection("project-types");

	const insertResponse = await insertProjectType({ collection: collection, info: type, partnerId: partnerId || "" });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar tipo de projeto.");
	const insertedId = insertResponse.insertedId.toString();

	return res.status(201).json({ data: { insertedId }, message: "Tipo de projeto criado com sucesso !" });
};

type GetResponse = {
	data: TProjectType | TProjectType[];
};

const getProjectType: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TProjectType> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const { id } = req.query;

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TProjectType> = db.collection("project-types");

	if (id) {
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
		const type = await getProjectTypeById({ collection: collection, id: id, query: partnerQuery });
		if (!type) throw new createHttpError.NotFound("Tipo de projeto não encontrado.");
		return res.status(200).json({ data: type });
	}

	const types = await getProjectTypes({ collection: collection, query: partnerQuery });

	return res.status(200).json({ data: types });
};
const editProjectType: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "configuracoes", "tiposProjeto", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TProjectType> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const { id } = req.query;
	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
	const changes = InsertProjectTypeSchema.partial().parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TProjectType> = db.collection("project-types");

	const updateResponse = await updateProjectType({ collection: collection, id: id, changes: changes, query: partnerQuery });
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao atualizar tipo de projeto.");
	if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound("Tipo de projeto não encontrado.");

	return res.status(201).json({ data: "Tipo de projeto atualizado com sucesso !", message: "Tipo de projeto atualizado com sucesso !" });
};
type PutResponse = {
	data: string;
	message: string;
};
export default apiHandler({ GET: getProjectType, POST: createProjectType, PUT: editProjectType });
