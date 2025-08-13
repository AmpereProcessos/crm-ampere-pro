import type { TUserSession } from "@/lib/auth/session";
import { getPartnerFunnels } from "@/repositories/funnels/queries";
import { getPartnersSimplified } from "@/repositories/partner-simplified/query";
import { getProjectTypesSimplified } from "@/repositories/project-type/queries";
import { getOpportunityCreators } from "@/repositories/users/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthentication, validateAuthenticationWithSession } from "@/utils/api";
import type { TFunnel } from "@/utils/schemas/funnel.schema";
import type { TPartner } from "@/utils/schemas/partner.schema";
import type { TProjectType } from "@/utils/schemas/project-types.schema";
import type { TUserPreferences } from "@/utils/schemas/user-preferences.schema";
import type { TUser } from "@/utils/schemas/user.schema";
import createHttpError from "http-errors";
import type { Collection, Filter } from "mongodb";
import type { NextApiHandler } from "next";

async function getOpportunitiesQueryDefinitions({ session }: { session: TUserSession }) {
	const db = await connectToDatabase();
	const userPreferencesCollection: Collection<TUserPreferences> = db.collection("user-preferences");

	const usersCollection: Collection<TUser> = db.collection("users");
	const partnersCollection: Collection<TPartner> = db.collection("partners");
	const projectTypesCollection: Collection<TProjectType> = db.collection("project-types");
	const funnelsCollection: Collection<TFunnel> = db.collection("funnels");

	const partnerScope = session.user.permissoes.parceiros.escopo;
	const opportunityScope = session.user.permissoes.oportunidades.escopo;

	const partnerQuery = partnerScope ? { idParceiro: { $in: [...partnerScope, null] } } : {};
	const opportunityQuery = opportunityScope ? { idParceiro: { $in: [...opportunityScope, null] } } : {};

	const userPreferences = await userPreferencesCollection.findOne({
		identificador: "opportunity-view-definition-v1",
		usuarioId: session.user.id,
	});

	const responsibles = await getOpportunityCreators({ collection: usersCollection, query: { ...opportunityQuery, ...partnerQuery } as Filter<TUser> });
	const partners = await getPartnersSimplified({ collection: partnersCollection, query: partnerQuery as Filter<TPartner> });
	const projectTypes = await getProjectTypesSimplified({ collection: projectTypesCollection, query: partnerQuery as Filter<TProjectType> });
	const funnels = await getPartnerFunnels({ collection: funnelsCollection, query: partnerQuery as Filter<TFunnel> });

	return {
		data: {
			mode: userPreferences?.modo ?? "database",
			filterSelections: {
				partnerIds: userPreferences?.filtrosKanban.parceirosIds ?? partnerScope ?? [],
				responsiblesIds: userPreferences?.filtrosKanban.responsaveisIds ?? opportunityScope ?? [],
				opportunityTypeIds: userPreferences?.filtrosKanban.tiposOportunidadeIds ?? [],
				period: {
					field: userPreferences?.filtrosKanban.periodo.parametro ?? undefined,
					after: userPreferences?.filtrosKanban.periodo.depois ?? undefined,
					before: userPreferences?.filtrosKanban.periodo.antes ?? undefined,
				},
				cities: userPreferences?.filtrosKanban.cidades ?? [],
				ufs: userPreferences?.filtrosKanban.ufs ?? [],
				segments: userPreferences?.filtrosKanban.segmentos ?? [],
				status: userPreferences?.filtrosKanban.status ?? "ongoing",
				isFromMarketing: userPreferences?.filtrosKanban.viaMarketing ?? false,
				isFromIndication: userPreferences?.filtrosKanban.viaIndicacao ?? false,
			},
			filterOptions: {
				responsibles: responsibles.map((r) => ({ id: r._id.toString(), label: r.nome, value: r._id.toString(), coverUrl: r.avatar_url ?? undefined })),
				partners: partners.map((p) => ({ id: p._id.toString(), label: p.nome, value: p._id.toString(), coverUrl: p.logo_url ?? undefined })),
				projectTypes: projectTypes.map((p) => ({ id: p._id.toString(), label: p.nome, value: p._id.toString() })),
				funnels: funnels.map((f) => ({
					id: f._id.toString(),
					label: f.nome,
					value: f._id.toString(),
					stages: f.etapas.map((s) => ({ id: s.id.toString(), label: s.nome, value: s.id.toString() })),
				})),
			},
		},
	};
}
export type TGetOpportunitiesQueryDefinitionsOutput = Awaited<ReturnType<typeof getOpportunitiesQueryDefinitions>>;

const getOpportunitiesQueryDefinitionsHandler: NextApiHandler<TGetOpportunitiesQueryDefinitionsOutput> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);

	const definitions = await getOpportunitiesQueryDefinitions({ session });
	return res.status(200).json(definitions);
};

export default apiHandler({ GET: getOpportunitiesQueryDefinitionsHandler });
