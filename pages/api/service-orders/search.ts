import { formatDateQuery } from "@/lib/methods/formatting";
import { getServiceOrdersByFilters } from "@/repositories/service-orders/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { PersonalizedServiceOrderQuerySchema, TServiceOrder, TServiceOrderDTO } from "@/utils/schemas/service-order.schema";
import createHttpError from "http-errors";
import { Collection, Filter } from "mongodb";
import { NextApiHandler } from "next";
import { z } from "zod";

export type TServiceOrderByFilters = {
	serviceOrders: TServiceOrderDTO[];
	serviceOrdersMatched: number;
	totalPages: number;
};

const QueryParamsSchema = z.object({
	page: z.string({ required_error: "Parâmetro de páginação não informado." }),
});

type PostResponse = {
	data: TServiceOrderByFilters;
};
const getServiceOrderByPersonalizedFiltersRoute: NextApiHandler<PostResponse> = async (req, res) => {
	const PAGE_SIZE = 50;
	const session = await validateAuthenticationWithSession(req, res);

	const partnerScope = session.user.permissoes.parceiros.escopo;

	const { page } = QueryParamsSchema.parse(req.query);

	const { filters, partners } = PersonalizedServiceOrderQuerySchema.parse(req.body);

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
	const nameQuery: Filter<TServiceOrder> =
		filters.name.trim().length > 0 ? { $or: [{ "favorecido.nome": { $regex: filters.name, $options: "i" } }, { "favorecido.nome": filters.name }] } : {};
	const dateQuery: Filter<TServiceOrder> =
		filters.period.after && filters.period.before && filters.period.field
			? {
					$and: [
						{ [filters.period.field]: { $gte: formatDateQuery(filters.period.after, "start") } },
						{ [filters.period.field]: { $lte: formatDateQuery(filters.period.before, "end") } },
					],
				}
			: {};
	const stateQuery: Filter<TServiceOrder> = filters.state.length > 0 ? { "localizacao.uf": { $in: filters.state } } : {};
	const cityQuery: Filter<TServiceOrder> = filters.city.length > 0 ? { "localizacao.cidade": { $in: filters.city } } : {};
	const categoryQuery: Filter<TServiceOrder> = filters.category.length > 0 ? { categoria: { $in: filters.category as TServiceOrder["categoria"][] } } : {};
	const urgencyQuery: Filter<TServiceOrder> = filters.urgency.length > 0 ? { urgencia: { $in: filters.urgency as TServiceOrder["urgencia"][] } } : {};
	const pendingQuery: Filter<TServiceOrder> = !!filters.pending ? { dataEfetivacao: null } : {};

	const query = { ...nameQuery, ...dateQuery, ...stateQuery, ...cityQuery, ...categoryQuery, ...urgencyQuery, ...pendingQuery };

	const skip = PAGE_SIZE * (Number(page) - 1);
	const limit = PAGE_SIZE;

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TServiceOrder> = db.collection("service-orders");

	const { serviceOrders, serviceOrdersMatched } = await getServiceOrdersByFilters({ collection, limit, skip, query });
	const totalPages = Math.round(serviceOrdersMatched / PAGE_SIZE);

	return res.status(200).json({ data: { serviceOrders, serviceOrdersMatched, totalPages } });
};

export default apiHandler({ POST: getServiceOrderByPersonalizedFiltersRoute });
