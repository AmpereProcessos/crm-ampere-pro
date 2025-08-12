import type { NextApiHandler } from "next";
import { z } from "zod";
import createHttpError from "http-errors";
import type { Collection, Filter, WithId } from "mongodb";

import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";

import type { TUserSession } from "@/lib/auth/session";
import type { TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import { OpportunitySegmentsEnumSchema, type TOpportunity, type TOpportunityDTO } from "@/utils/schemas/opportunity.schema";

const OpportunityKanbanViewInputSchema = z.object({
	page: z.number({
		required_error: "Parâmetro de paginação não informado.",
		invalid_type_error: "Tipo não válido para parâmetro de paginação.",
	}),
	funnelId: z.string({
		required_error: "Parâmetro de funil não informado.",
		invalid_type_error: "Tipo não válido para parâmetro de funil.",
	}),
	funnelStage: z.string({
		required_error: "Parâmetro de estágio de funil não informado.",
		invalid_type_error: "Tipo não válido para parâmetro de estágio de funil.",
	}),
	partnerIds: z.array(
		z.string({
			required_error: "ID do parceiro não informado.",
			invalid_type_error: "Tipo não válido para o ID do parceiro.",
		}),
		{
			required_error: "Lista de parceiros não informada.",
			invalid_type_error: "Tipo não válido para lista de parceiros.",
		},
	),
	responsiblesIds: z.array(
		z.string({
			required_error: "ID do responsável não informado.",
			invalid_type_error: "Tipo não válido para o ID do responsável.",
		}),
		{
			required_error: "Lista de responsáveis não informada.",
			invalid_type_error: "Tipo não válido para lista de responsáveis.",
		},
	),
	opportunityTypeIds: z.array(
		z.string({
			required_error: "ID do tipo de oportunidade não informado.",
			invalid_type_error: "Tipo não válido para o ID do tipo de oportunidade.",
		}),
		{ required_error: "Lista de tipos de oportunidade não informada.", invalid_type_error: "Tipo não válido para lista de tipos de oportunidade." },
	),
	period: z.object({
		field: z
			.enum(["dataInsercao", "dataGanho", "dataPerda", "ultimaInteracao.data"], {
				required_error: "Campo de período não informado.",
				invalid_type_error: "Tipo inválido para campo de período.",
			})
			.optional()
			.nullable(),
		after: z
			.string({
				required_error: "Data de início do período não informada.",
				invalid_type_error: "Tipo inválido para data de início do período.",
			})
			.datetime()
			.optional()
			.nullable(),
		before: z
			.string({
				required_error: "Data de fim do período não informada.",
				invalid_type_error: "Tipo inválido para data de fim do período.",
			})
			.datetime()
			.optional()
			.nullable(),
	}),
	status: z.enum(["ongoing", "won", "lost"]),
	segments: z.array(OpportunitySegmentsEnumSchema),
	isFromMarketing: z
		.boolean({
			required_error: "Parâmetro de marketing não informado.",
			invalid_type_error: "Tipo não válido para parâmetro de marketing.",
		})
		.optional()
		.nullable(),
	isFromIndication: z
		.boolean({
			required_error: "Parâmetro de indicação não informado.",
			invalid_type_error: "Tipo não válido para parâmetro de indicação.",
		})
		.optional()
		.nullable(),
});
export type TGetOpportunitiesKanbanViewInput = z.infer<typeof OpportunityKanbanViewInputSchema>;

const OpportunityStatusesMap: Record<TGetOpportunitiesKanbanViewInput["status"], Filter<TOpportunity>> = {
	ongoing: {
		"ganho.data": null,
		"perda.data": null,
	},
	won: {
		"ganho.data": { $ne: null },
	},
	lost: {
		"perda.data": { $ne: null },
	},
};
async function getOpportunitiesKanbanView({ payload, session }: { payload: TGetOpportunitiesKanbanViewInput; session: TUserSession }) {
	const { page, funnelId, funnelStage, partnerIds, responsiblesIds, opportunityTypeIds, period, status, segments, isFromMarketing, isFromIndication } = payload;

	const userOpportunityScope = session.user.permissoes.oportunidades.escopo;
	const userPartnerScope = session.user.permissoes.parceiros.escopo;

	const db = await connectToDatabase();
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");
	const funnelReferencesCollection: Collection<TFunnelReference> = db.collection("funnel-references");

	const isResponsiblesDefined = responsiblesIds.length > 0;
	const isPartnersDefined = partnerIds.length > 0;
	const isOpportunityTypesDefined = opportunityTypeIds.length > 0;
	const isSegmentsDefined = segments.length > 0;
	const isPeriodDefined = period.field && period.after && period.before;
	// Validating scopes selection
	/// First, checking for possible opportunity scope violation attempts (if user has scope defined and is attempting to visualize users that are not in his scope)
	if (userOpportunityScope && responsiblesIds.some((r) => !userOpportunityScope.includes(r)))
		throw new createHttpError.BadRequest("Seu escopo de visibilidade não contempla esse usuário.");
	/// Second, checking for possible partner scope violation attempts (if user has scope defined and is attempting to visualize partners that are not in his scope)
	if (userPartnerScope && partnerIds.some((p) => !userPartnerScope.includes(p))) throw new createHttpError.BadRequest("Seu escopo de visibilidade não contempla esse parceiro.");

	const opportunityResponsiblesQuery: Filter<TOpportunity> = isResponsiblesDefined ? { "responsaveis.id": { $in: responsiblesIds } } : {};
	const opportunityPartnersQuery: Filter<TOpportunity> = isPartnersDefined ? { idParceiro: { $in: partnerIds } } : {};
	const opportunityTypesQuery: Filter<TOpportunity> = isOpportunityTypesDefined ? { "tipo.id": { $in: opportunityTypeIds } } : {};
	const opportunityStatusQuery: Filter<TOpportunity> = OpportunityStatusesMap[status] || {};
	const opportunitySegmentsQuery: Filter<TOpportunity> = isSegmentsDefined ? { segmento: { $in: segments } } : {};
	const opportunityPeriodQuery: Filter<TOpportunity> = isPeriodDefined && period.field ? { [period.field]: { $gte: period.after, $lte: period.before } } : {};
	const opportunityFromMarketingQuery: Filter<TOpportunity> = isFromMarketing ? { idMarketing: { $ne: null } } : {};
	const opportunityFromIndicationQuery: Filter<TOpportunity> = isFromIndication ? { idIndicacao: { $ne: null } } : {};

	const opportunityQuery: Filter<TOpportunity> = {
		...opportunityResponsiblesQuery,
		...opportunityPartnersQuery,
		...opportunityTypesQuery,
		...opportunityStatusQuery,
		...opportunitySegmentsQuery,
		...opportunityPeriodQuery,
		...opportunityFromMarketingQuery,
		...opportunityFromIndicationQuery,
	};

	console.log("Opportunities Query", JSON.stringify(opportunityQuery, null, 2));
	const opportunitiesApplicable = await opportunitiesCollection.find(opportunityQuery, { projection: { _id: 1 } }).toArray();
	const ooportunitiesApplicableIds = opportunitiesApplicable.map((o) => o._id.toString());

	const funnelReferencesOpportunitiesFunnelQuery: Filter<TFunnelReference> = { idOportunidade: { $in: ooportunitiesApplicableIds } };
	const funnelReferencesQuery: Filter<TFunnelReference> = { idFunil: funnelId, idEstagioFunil: funnelStage, ...funnelReferencesOpportunitiesFunnelQuery };

	console.log("Funnel References Query", {
		idFunil: funnelReferencesQuery.idFunil,
		idEstagio: funnelReferencesQuery.idEstagio,
	});

	const kanbanView = await getFunnelReferencesWithOpportunities({ page, limit: 25, funnelReferencesCollection, query: funnelReferencesQuery });

	return { data: kanbanView };
}
export type TGetOpportunitiesKanbanViewOutput = Awaited<ReturnType<typeof getOpportunitiesKanbanView>>;

const getOpportunitiesKanbanViewHandler: NextApiHandler<TGetOpportunitiesKanbanViewOutput> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const payload = OpportunityKanbanViewInputSchema.parse(req.body);
	const kanbanView = await getOpportunitiesKanbanView({ payload, session });
	res.status(200).json(kanbanView);
};

export default apiHandler({ POST: getOpportunitiesKanbanViewHandler });

type TGetFunnelReferencesWithOpportunitiesParams = {
	page: number;
	limit: number;
	funnelReferencesCollection: Collection<TFunnelReference>;
	query: Filter<TFunnelReference>;
};
async function getFunnelReferencesWithOpportunities({ page, limit, funnelReferencesCollection, query }: TGetFunnelReferencesWithOpportunitiesParams) {
	const match: Filter<TFunnelReference> = query;

	const addFields = { opportunityAsObjectId: { $toObjectId: "$idOportunidade" } };
	const lookup = { from: "opportunities", localField: "opportunityAsObjectId", foreignField: "_id", as: "oportunidade" };
	const sort = { _id: -1 };
	const skip = limit * (page - 1);

	const pipeline = [{ $match: match }, { $addFields: addFields }, { $lookup: lookup }, { $sort: sort }, { $skip: skip }, { $limit: limit + 1 }];

	const funnelReferencesMatched = await funnelReferencesCollection.countDocuments(match);
	const aggregationResult = (await funnelReferencesCollection.aggregate(pipeline).toArray()) as WithId<TFunnelReference & { oportunidade: WithId<TOpportunity>[] }>[];

	const opportunitiesResult = aggregationResult
		.map((f) => {
			const opportunity = f.oportunidade[0] ? { ...f.oportunidade[0], _id: f.oportunidade[0]._id.toString() } : null;
			if (!opportunity) return null;
			return {
				...opportunity,
				referenciaFunil: {
					id: f._id.toString(),
					idFunil: f.idFunil,
					idEstagio: f.idEstagioFunil,
					estagios: f.estagios,
					dataInsercao: f.dataInsercao,
				},
			};
		})
		.filter((f) => !!f);

	// Defining the previous cursor is page is greater than 1
	const previousCursor = page > 1 ? page - 1 : null;
	// Defining the next cursor if there are more pages to fetch
	const hasNextPage = opportunitiesResult.length > limit;
	const nextCursor = hasNextPage ? page + 1 : null;

	const opportunities = hasNextPage ? opportunitiesResult.slice(0, -1) : opportunitiesResult;

	return { opportunities, opportunitiesMatched: funnelReferencesMatched, previousCursor, nextCursor };
}
