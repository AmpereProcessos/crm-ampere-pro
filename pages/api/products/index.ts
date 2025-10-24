import { insertProduct, updateProduct } from "@/repositories/products/mutations";
import { getProductById, getProducts } from "@/repositories/products/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession, validateAuthorization } from "@/utils/api";
import { InsertProductSchema, TProduct } from "@/utils/schemas/products.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type GetResponse = {
	data: TProduct | TProduct[];
};

const getPartnerProducts: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "produtos", "visualizar", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TProduct> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const { id } = req.query;

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TProduct> = db.collection("products");

	if (id) {
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
		const product = await getProductById({ collection: collection, id: id, query: partnerQuery });
		if (!product) throw new createHttpError.NotFound("Produto não encontrado.");
		return res.status(200).json({ data: product });
	}

	const products = await getProducts({ collection: collection, query: partnerQuery });

	return res.status(200).json({ data: products });
};

type PostResponse = {
	data: { insertedId: string };
	message: string;
};

const createProducts: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "produtos", "criar", true);
	const partnerId = session.user.idParceiro;

	const product = InsertProductSchema.parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TProduct> = db.collection("products");

	const insertResponse = await insertProduct({ collection: collection, info: product, partnerId: partnerId || "" });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar produto.");
	const insertedId = insertResponse.insertedId.toString();

	return res.status(201).json({ data: { insertedId }, message: "Produto criado com sucesso !" });
};

type PutResponse = {
	data: string;
	message: string;
};

const editProduct: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "produtos", "editar", true);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TProduct> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const { id } = req.query;
	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
	const changes = InsertProductSchema.partial().parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TProduct> = db.collection("products");

	const updateResponse = await updateProduct({ collection: collection, id: id, changes: changes, query: partnerQuery });
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao atualizar produto.");
	if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound("Produto não encontrado.");

	return res.status(201).json({ data: "Produto atualizado com sucesso !", message: "Produto atualizado com sucesso !" });
};

export default apiHandler({ GET: getPartnerProducts, POST: createProducts, PUT: editProduct });
