import { updateExpense } from "@/repositories/expenses/mutations";
import { updateRevenue } from "@/repositories/revenues/mutations";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { TExpense } from "@/utils/schemas/expenses.schema";
import { TRevenue } from "@/utils/schemas/revenues.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

const editExpensePersonalizedRoute: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerScope = session.user.permissoes.parceiros.escopo;

	const partnerQuery: Filter<TExpense> = partnerScope ? { idParceiro: { $in: partnerScope } } : {};
	const { id } = req.query;
	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

	const changes = req.body;
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TExpense> = db.collection("expenses");

	const updateResponse = await updateExpense({ id, collection, changes, query: partnerQuery });
	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao atualizar despesa.");
	if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound("Despesa não encontrada.");
	return res.status(200).json({ data: "Despesa atualizada com sucesso !", message: "Despesa atualizada com sucesso !" });
};

export default apiHandler({ PUT: editExpensePersonalizedRoute });
