import { formatDateQuery } from "@/lib/methods/formatting";
import { getPurchasesByFilters } from "@/repositories/purchases/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { PersonalizePurchasesQuerySchema, TPurchase, TPurchaseDTO } from "@/utils/schemas/purchase.schema";
import createHttpError from "http-errors";
import { Collection, Filter } from "mongodb";
import { NextApiHandler } from "next";
import { z } from "zod";

export type TPurchasesByFiltersResult = {
	purchases: TPurchaseDTO[];
	purchasesMatched: number;
	totalPages: number;
};

const QueryParamsSchema = z.object({
	page: z.string({ required_error: "Parâmetro de páginação não informado." }),
});

type PostResponse = {
	data: TPurchasesByFiltersResult;
};

const getPurchasesByPersonalizedFiltersRoute: NextApiHandler<PostResponse> = async (req, res) => {
	const PAGE_SIZE = 50;
	const session = await validateAuthenticationWithSession(req, res);

	const partnerScope = session.user.permissoes.parceiros.escopo;

	const { page } = QueryParamsSchema.parse(req.query);

	const { partners, filters } = PersonalizePurchasesQuerySchema.parse(req.body);

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
	const partnersQuery: Filter<TPurchase> = partners ? { idParceiro: { $in: [...partners] } } : {};
	const titleQuery: Filter<TPurchase> =
		filters.title.trim().length > 0 ? { $or: [{ nome: { $regex: filters.title, $options: "i" } }, { nome: filters.title }] } : {};
	const statusQuery: Filter<TPurchase> = filters.status.length > 0 ? { status: { $in: filters.status as TPurchase["status"][] } } : {};
	const stateQuery: Filter<TPurchase> = filters.state.length > 0 ? { "entrega.localizacao.uf": { $in: filters.state } } : {};
	const cityQuery: Filter<TPurchase> = filters.city.length > 0 ? { "entrega.localizacao.cidade": { $in: filters.city } } : {};
	const pendingOrderQuery: Filter<TPurchase> = filters.pendingOrder ? { "pedido.data": null } : {};
	const pendingInvoicingQuery: Filter<TPurchase> = filters.pendingInvoicing ? { "faturamento.data": null } : {};
	const pendingDeliveryQuery: Filter<TPurchase> = filters.pendingDelivery ? { "entrega.efetivacao": null } : {};
	const deliveryStatusQuery: Filter<TPurchase> = filters.deliveryStatus.length > 0 ? { "entrega.status": { $in: filters.deliveryStatus } } : {};
	const periodQuery: Filter<TPurchase> =
		filters.period.after && filters.period.before && filters.period.field
			? {
					$and: [
						{ [filters.period.field]: { $gte: formatDateQuery(filters.period.after, "start") as string } },
						{ [filters.period.field]: { $lte: formatDateQuery(filters.period.before, "end") as string } },
					],
				}
			: {};
	const pendingConclusionQuery: Filter<TPurchase> = filters.pendingConclusion ? { dataEfetivacao: null } : {};

	const query: Filter<TPurchase> = {
		...partnersQuery,
		...titleQuery,
		...statusQuery,
		...stateQuery,
		...cityQuery,
		...pendingOrderQuery,
		...pendingInvoicingQuery,
		...pendingDeliveryQuery,
		...deliveryStatusQuery,
		...periodQuery,
		...pendingConclusionQuery,
	};

	const skip = PAGE_SIZE * (Number(page) - 1);
	const limit = PAGE_SIZE;
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TPurchase> = db.collection("purchases");

	const { purchases, purchasesMatched } = await getPurchasesByFilters({ collection, query, skip, limit });
	const totalPages = Math.round(purchasesMatched / PAGE_SIZE);
	return res.status(200).json({ data: { purchases, purchasesMatched, totalPages } });
};

export default apiHandler({ POST: getPurchasesByPersonalizedFiltersRoute });
