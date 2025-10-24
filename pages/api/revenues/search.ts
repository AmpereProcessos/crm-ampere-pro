import { formatDateQuery } from "@/lib/methods/formatting";
import { getRevenuesByFilters } from "@/repositories/revenues/queries";

import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";

import { PersonalizedRevenueQuerySchema, TRevenue, TRevenueDTO, TRevenueDTOSimplified } from "@/utils/schemas/revenues.schema";
import createHttpError from "http-errors";
import { Collection, Filter } from "mongodb";
import { NextApiHandler } from "next";
import { z } from "zod";

export type TRevenuesByFiltersResult = {
	revenues: TRevenueDTOSimplified[];
	revenuesMatched: number;
	totalPages: number;
};

const QueryParamsSchema = z.object({
	page: z.string({ required_error: "Parâmetro de páginação não informado." }),
});

type PostResponse = {
	data: TRevenuesByFiltersResult;
};

const getRevenuesByPersonalizedFiltersRoute: NextApiHandler<PostResponse> = async (req, res) => {
	const PAGE_SIZE = 50;
	const session = await validateAuthenticationWithSession(req, res);

	const partnerScope = session.user.permissoes.parceiros.escopo;

	const { page } = QueryParamsSchema.parse(req.query);

	const { partners, filters } = PersonalizedRevenueQuerySchema.parse(req.body);

	// If user has a scope defined and in the request there isnt a partners arr defined, then user is trying
	// to access a overall visualiation, which he/she isnt allowed
	if (!!partnerScope && !partners) throw new createHttpError.Unauthorized("Seu usuário não possui autorização para esse escopo de visualização.");
	// If user has a partner scope defined and in the partner arr request there is a single partner that is not in hes/shes scope
	// then user is trying to access a visualization he/she isnt allowed
	if (!!partnerScope && partners?.some((r) => !partnerScope.includes(r)))
		throw new createHttpError.Unauthorized("Seu usuário não possui autorização para esse escopo de visualização.");

	// Validating page parameter
	if (!page || isNaN(Number(page))) throw new createHttpError.BadRequest("Parâmetro de paginação inválido ou não informado.");

	// Defining the queries
	const partnersQuery: Filter<TRevenue> = partners ? { idParceiro: { $in: [...partners] } } : {};
	const titleQuery: Filter<TRevenue> =
		filters.title.trim().length > 0 ? { $or: [{ nome: { $regex: filters.title, $options: "i" } }, { nome: filters.title }] } : {};
	const categoryQuery: Filter<TRevenue> = filters.category
		? { $or: [{ categorias: { $regex: filters.category, $options: "i" } }, { categorias: filters.category }] }
		: {};
	const totalQuery: Filter<TRevenue> =
		filters.total.greater && filters.total.less ? { $and: [{ total: { $gte: filters.total.greater } }, { total: { $lte: filters.total.less } }] } : {};
	const periodQuery: Filter<TRevenue> =
		filters.period.after && filters.period.before && filters.period.field
			? {
					$and: [
						{ [filters.period.field]: { $gte: formatDateQuery(filters.period.after, "start") as string } },
						{ [filters.period.field]: { $lte: formatDateQuery(filters.period.before, "end") as string } },
					],
				}
			: {};
	const pendingPartialReceiptQuery: Filter<TRevenue> = filters.pendingPartialReceipt
		? {
				recebimentos: {
					$elemMatch: {
						efetivado: false,
					},
				},
			}
		: {};
	const pendingTotalReceiptQuery: Filter<TRevenue> = filters.pendingTotalReceipt
		? {
				recebimentos: {
					$not: {
						$elemMatch: {
							efetivado: true,
						},
					},
				},
			}
		: {};
	const query: Filter<TRevenue> = {
		...partnersQuery,
		...titleQuery,
		...categoryQuery,
		...totalQuery,
		...periodQuery,
		...pendingPartialReceiptQuery,
		...pendingTotalReceiptQuery,
	};

	const skip = PAGE_SIZE * (Number(page) - 1);
	const limit = PAGE_SIZE;
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TRevenue> = db.collection("revenues");

	const { revenues, revenuesMatched } = await getRevenuesByFilters({ collection, query, skip, limit });
	const totalPages = Math.round(revenuesMatched / PAGE_SIZE);
	return res.status(200).json({ data: { revenues, revenuesMatched, totalPages } });
};

export default apiHandler({ POST: getRevenuesByPersonalizedFiltersRoute });
