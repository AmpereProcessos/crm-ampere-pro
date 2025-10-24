import { getOpportunitiesSimplified } from "@/repositories/opportunities/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { TOpportunity, TOpportunitySimplified } from "@/utils/schemas/opportunity.schema";
import { Collection, Filter } from "mongodb";
import { NextApiHandler } from "next";

type GetResponse = {
	data: TOpportunitySimplified[];
};
const getUltraSimplifiedOpportunitiesRoute: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnersScope = session.user.permissoes.parceiros.escopo;

	const partnersQuery: Filter<TOpportunity> = partnersScope ? { idParceiro: { $in: partnersScope } } : {};

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TOpportunity> = db.collection("opportunities");

	const projects = await getOpportunitiesSimplified({ collection, query: partnersQuery });

	return res.status(200).json({ data: projects });
};

export default apiHandler({ GET: getUltraSimplifiedOpportunitiesRoute });
