import { getSignaturePlansWithPricingMethod } from "@/repositories/signature-plans/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { TSignaturePlan, TSignaturePlanDTOWithPricingMethod, TSignaturePlanWithPricingMethod } from "@/utils/schemas/signature-plans.schema";
import { Collection, Filter } from "mongodb";
import { NextApiHandler } from "next";

type GetResponse = {
	data: TSignaturePlanWithPricingMethod[];
};
const getSignaturePlans: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TSignaturePlan> = parterScope ? { idParceiro: { $in: [...parterScope, null] } } : {};

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection: Collection<TSignaturePlan> = db.collection("signature-plans");
	const plans = await getSignaturePlansWithPricingMethod({ collection: collection, query: partnerQuery });

	return res.status(200).json({ data: plans });
};

export default apiHandler({ GET: getSignaturePlans });
