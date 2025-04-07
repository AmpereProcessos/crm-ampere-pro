import { getTechnicalAnalysis } from "@/repositories/technical-analysis/queries";
import { getLeadReceivers, getOpportunityCreators, getTechnicalAnalysts } from "@/repositories/users/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession, validateAuthorization } from "@/utils/api";
import { simplifiedProjection, TUserDTOSimplified, UsersQueryFiltersSchema, type TUser } from "@/utils/schemas/user.schema";
import type { Collection, Filter, WithId } from "mongodb";
import type { NextApiHandler } from "next";
import { z } from "zod";

type GetResponse = {
	data: WithId<TUser>[];
};
const PersonalizedQueryTypes = [
	"user-creators",
	"opportunity-creators",
	"client-creators",
	"kit-creators",
	"proposal-creators",
	"price-editors",
	"technical-analysts",
	"lead-receivers",
] as const;

const getUsersPersonalized: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TUser> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const type = z
		.enum(PersonalizedQueryTypes, { invalid_type_error: "Tipo inválido para tipo de usuários.", required_error: "Tipo de usuários não definido." })
		.parse(req.query.type);

	const db = await connectToDatabase();
	const usersCollection: Collection<TUser> = db.collection("users");

	if (type === "opportunity-creators") {
		const creators = await getOpportunityCreators({ collection: usersCollection, query: partnerQuery });
		return res.status(200).json({ data: creators });
	}
	if (type === "technical-analysts") {
		const analysts = await getTechnicalAnalysts({ collection: usersCollection, query: partnerQuery });
		return res.status(200).json({ data: analysts });
	}
	if (type === "lead-receivers") {
		const receivers = await getLeadReceivers({ collection: usersCollection, query: partnerQuery });
		return res.status(200).json({ data: receivers });
	}
	return res.status(200).json({ data: [] });
};

export type TUsersWithFiltersResponse = {
	users: TUserDTOSimplified[];
	usersMatched: number;
	totalPages: number;
};
type PostResponse = {
	data: TUsersWithFiltersResponse;
};
const getUsersWithFiltersRoute: NextApiHandler<PostResponse> = async (req, res) => {
	const PAGE_SIZE = 50;
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TUser> = parterScope ? { idParceiro: { $in: [...parterScope] } } : {};

	const db = await connectToDatabase();
	const usersCollection: Collection<TUser> = db.collection("users");

	const filters = UsersQueryFiltersSchema.parse(req.body);

	const nameQuery: Filter<TUser>[] = filters.name?.trim().length > 0 ? [{ nome: { $regex: filters.name, $options: "i" } }, { nome: filters.name }] : [];

	const emailQuery: Filter<TUser>[] = filters.email?.trim().length > 0 ? [{ email: { $regex: filters.email, $options: "i" } }, { email: filters.email }] : [];

	const orQuery: Filter<TUser> = nameQuery.length > 0 || emailQuery.length > 0 ? { $or: [...nameQuery, ...emailQuery] } : {};

	const periodQuery: Filter<TUser> =
		filters.period.after && filters.period.before && filters.period.field ? { [filters.period.field]: { $gte: filters.period.after, $lte: filters.period.before } } : {};

	const activeOnlyQuery: Filter<TUser> = filters.activeOnly ? { ativo: true } : {};

	const query: Filter<TUser> = {
		...orQuery,
		...periodQuery,
		...activeOnlyQuery,
		...partnerQuery,
	};

	const skip = PAGE_SIZE * (Number(filters.page) - 1);
	const limit = PAGE_SIZE;

	const usersMatched = await usersCollection.countDocuments(query);
	const users = (await usersCollection
		.aggregate([
			{
				$match: query,
			},
			{
				$project: simplifiedProjection,
			},
			{
				$skip: skip,
			},
			{
				$limit: limit,
			},
			{
				$sort: {
					nome: 1,
				},
			},
		])
		.toArray()) as TUserDTOSimplified[];
	const totalPages = Math.ceil(usersMatched / PAGE_SIZE);

	return res.status(200).json({ data: { users, usersMatched, totalPages } });
};
export default apiHandler({
	GET: getUsersPersonalized,
	POST: getUsersWithFiltersRoute,
});
