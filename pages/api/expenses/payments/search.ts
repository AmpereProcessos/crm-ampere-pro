import { getPaymentsByFilters } from "@/repositories/expenses/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { TExpense, TPayment } from "@/utils/schemas/expenses.schema";
import createHttpError from "http-errors";
import { Collection } from "mongodb";
import { NextApiHandler } from "next";
import { z } from "zod";

const QueryParamsSchema = z.object({
	page: z.string({ required_error: "Parâmetro de páginação não informado." }),
});

export type TPaymentsByFiltersResult = { payments: TPayment[]; paymentsMatched: number; totalPages: number };

type PostResponse = {
	data: TPaymentsByFiltersResult;
};

const getPaymentsByPersonalizedFiltersRoute: NextApiHandler<PostResponse> = async (req, res) => {
	const PAGE_SIZE = 20;
	const session = await validateAuthenticationWithSession(req, res);

	const { page } = QueryParamsSchema.parse(req.query);

	// Validating page parameter
	if (!page || isNaN(Number(page))) throw new createHttpError.BadRequest("Parâmetro de paginação inválido ou não informado.");

	const skip = PAGE_SIZE * (Number(page) - 1);
	const limit = PAGE_SIZE;
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TExpense> = db.collection("expenses");

	const { payments, paymentsMatched } = await getPaymentsByFilters({ collection, query: {}, limit, skip });

	const totalPages = Math.round(paymentsMatched / PAGE_SIZE);

	return res.status(200).json({ data: { payments, paymentsMatched, totalPages } });
};

export default apiHandler({ POST: getPaymentsByPersonalizedFiltersRoute });
