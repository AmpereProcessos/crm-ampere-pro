import { getPartnerFunnels } from "@/repositories/funnels/queries";
import { getPartnersSimplified } from "@/repositories/partner-simplified/query";
import { getProjectTypesSimplified } from "@/repositories/project-type/queries";
import { getOpportunityCreators } from "@/repositories/users/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import type { TFunnel, TFunnelDTO } from "@/utils/schemas/funnel.schema";
import type { TPartner, TPartnerSimplifiedDTO } from "@/utils/schemas/partner.schema";
import type { TProjectType, TProjectTypeDTOSimplified } from "@/utils/schemas/project-types.schema";
import type { TUser, TUserDTOSimplified } from "@/utils/schemas/user.schema";
import type { Collection, Filter } from "mongodb";
import type { NextApiHandler } from "next";

export type TOpportunitiesQueryOptions = {
	responsibles: TUserDTOSimplified[];
	partners: TPartnerSimplifiedDTO[];
	projectTypes: TProjectTypeDTOSimplified[];
	funnels: TFunnelDTO[];
};
type GetResponse = {
	data: TOpportunitiesQueryOptions;
};

const getOpportunitiesQueryOptions: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerScope = session.user.permissoes.parceiros.escopo;

	const partnerQuery = partnerScope ? { idParceiro: { $in: [...partnerScope, null] } } : {};

	const db = await connectToDatabase();
	const usersCollection: Collection<TUser> = db.collection("users");
	const partnersCollection: Collection<TPartner> = db.collection("partners");
	const projectTypesCollection: Collection<TProjectType> = db.collection("project-types");
	const funnelsCollection: Collection<TFunnel> = db.collection("funnels");

	const responsibles = await getOpportunityCreators({ collection: usersCollection, query: partnerQuery as Filter<TUser> });
	const partners = await getPartnersSimplified({ collection: partnersCollection, query: partnerQuery as Filter<TPartner> });
	const projectTypes = await getProjectTypesSimplified({ collection: projectTypesCollection, query: partnerQuery as Filter<TProjectType> });
	const funnels = await getPartnerFunnels({ collection: funnelsCollection, query: partnerQuery as Filter<TFunnel> });

	const options = {
		responsibles: responsibles.map((r) => ({ ...r, _id: r._id.toString() })),
		partners: partners.map((p) => ({ ...p, _id: p._id.toString() })),
		projectTypes: projectTypes.map((p) => ({ ...p, _id: p._id.toString() })),
		funnels: funnels.map((f) => ({ ...f, _id: f._id.toString() })),
	};

	return res.status(200).json({ data: options });
};

export default apiHandler({ GET: getOpportunitiesQueryOptions });
