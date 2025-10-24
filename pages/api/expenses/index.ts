import { insertExpense, updateExpense } from "@/repositories/expenses/mutations";
import { getExpenseById, getExpenses, getExpensesByProjectId } from "@/repositories/expenses/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { InsertExpenseSchema, TExpense } from "@/utils/schemas/expenses.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type GetResponse = {
	data: TExpense | TExpense[];
};
const getExpensesRoute: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerScope = session.user.permissoes.parceiros.escopo;

	const partnerQuery: Filter<TExpense> = partnerScope ? { idParceiro: { $in: partnerScope } } : {};
	const { id, projectId } = req.query;
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TExpense> = db.collection("expenses");

	if (id) {
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

		const expense = await getExpenseById({ id, collection, query: partnerQuery });
		if (!expense) throw new createHttpError.NotFound("Despesa não encontrada.");

		return res.status(200).json({ data: expense });
	}
	if (projectId) {
		if (typeof projectId != "string" || !ObjectId.isValid(projectId)) throw new createHttpError.BadRequest("ID de projeto inválido.");

		const expenses = await getExpensesByProjectId({ projectId, collection, query: partnerQuery });

		return res.status(200).json({ data: expenses });
	}

	const expenses = await getExpenses({ collection, query: partnerQuery });

	return res.status(200).json({ data: expenses });
};

type PostResponse = {
	data: { insertedId: string };
	message: string;
};

const createExpenseRoute: NextApiHandler<PostResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);

	const expense = InsertExpenseSchema.parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TExpense> = db.collection("expenses");

	const insertResponse = await insertExpense({ collection, info: expense });
	if (!insertResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido na criação da despesa.");
	const insertedId = insertResponse.insertedId.toString();

	return res.status(201).json({ data: { insertedId }, message: "Despesa criada com sucesso !" });
};

type PutResponse = {
	data: string;
	message: string;
};

const editExpenseRoute: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerScope = session.user.permissoes.parceiros.escopo;

	const partnerQuery: Filter<TExpense> = partnerScope ? { idParceiro: { $in: partnerScope } } : {};
	const { id } = req.query;
	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

	const changes = InsertExpenseSchema.partial().parse(req.body);
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TExpense> = db.collection("expenses");

	const updateResponse = await updateExpense({ id, collection, changes, query: partnerQuery });
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecio ao atualizar despesa.");
	if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound("Despesa não encontrada.");

	return res.status(201).json({ data: "Despesa atualizada com sucesso !", message: "Despesa atualizada com sucesso !" });
};

export default apiHandler({ GET: getExpensesRoute, POST: createExpenseRoute, PUT: editExpenseRoute });
