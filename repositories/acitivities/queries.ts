import type { TActivity, TActivityDTO } from "@/utils/schemas/activities.schema";
import { type Collection, type Filter, ObjectId } from "mongodb";

type GetActivityByIdParams = {
	collection: Collection<TActivity>;
	id: string;
	query: Filter<TActivity>;
};

export async function getActivityById({ id, collection, query }: GetActivityByIdParams) {
	try {
		const activity = await collection.findOne({ _id: new ObjectId(id) });
		return activity ? { ...activity, _id: activity._id.toString() } : null;
	} catch (error) {
		console.log("[ERROR] - Error getting activity by id", error);
		throw error;
	}
}

type GetActivitiesByOpportunityIdParams = {
	opportunityId: string;
	collection: Collection<TActivity>;
	query: Filter<TActivity>;
};
export async function getActivitiesByOpportunityId({ opportunityId, collection, query }: GetActivitiesByOpportunityIdParams) {
	try {
		const activities = await collection.find({ "oportunidade.id": opportunityId, ...query }, { sort: { dataInsercao: -1 } }).toArray();
		return activities.map((activity) => ({ ...activity, _id: activity._id.toString() }));
	} catch (error) {
		console.log("[ERROR] - Error getting activities by opportunity id", error);
		throw error;
	}
}
type GetActivitiesByHomologationIdParams = {
	homologationId: string;
	collection: Collection<TActivity>;
	query: Filter<TActivity>;
};
export async function getActivitiesByHomologationId({ homologationId, collection, query }: GetActivitiesByHomologationIdParams) {
	try {
		const activities = await collection.find({ idHomologacao: homologationId, ...query }, { sort: { dataInsercao: -1 } }).toArray();
		return activities.map((activity) => ({ ...activity, _id: activity._id.toString() }));
	} catch (error) {
		console.log("[ERROR] - Error getting activities by homologation id", error);
		throw error;
	}
}
type GetActivitiesByTechnicalAnalysisIdParams = {
	technicalAnalysisId: string;
	collection: Collection<TActivity>;
	query: Filter<TActivity>;
};
export async function getActivitiesByTechnicalAnalysisId({ technicalAnalysisId, collection, query }: GetActivitiesByTechnicalAnalysisIdParams) {
	try {
		const activities = await collection.find({ idAnaliseTecnica: technicalAnalysisId, ...query }, { sort: { dataInsercao: -1 } }).toArray();
		return activities.map((activity) => ({ ...activity, _id: activity._id.toString() }));
	} catch (error) {
		console.log("[ERROR] - Error getting activities by technical analysis id", error);
		throw error;
	}
}
type GetActivitiesByPurchaseIdParams = {
	purchaseId: string;
	collection: Collection<TActivity>;
	query: Filter<TActivity>;
};
export async function getActivitiesByPurchaseId({ purchaseId, collection, query }: GetActivitiesByPurchaseIdParams) {
	try {
		const activities = await collection.find({ idCompra: purchaseId, ...query }, { sort: { dataInsercao: -1 } }).toArray();
		return activities.map((activity) => ({ ...activity, _id: activity._id.toString() }));
	} catch (error) {
		console.log("[ERROR] - Error getting activities by purchase id", error);
		throw error;
	}
}

type GetActivitiesByResponsibleIdParams = {
	responsibleId: string;
	collection: Collection<TActivity>;
	query: Filter<TActivity>;
};

export async function getActivitiesByResponsibleId({ responsibleId, collection, query }: GetActivitiesByResponsibleIdParams) {
	try {
		// Sorting:
		// 1. Smaller due dates first (smaller due date first)
		// 2. Then nulls last (nulls last)
		const pipeline = [
			{
				$match: {
					...query,
				},
			},
			{
				$addFields: {
					// Campo auxiliar: 0 se tem dataVencimento, 1 se não tem (para ordenar nulls por último)
					dataVencimentoNull: {
						$cond: [{ $ifNull: ["$dataVencimento", false] }, 0, 1],
					},
				},
			},
			{
				$sort: {
					// 1. Smaller due dates first
					dataVencimentoNull: 1, // 0 (has data) comes before 1 (null)
					dataVencimento: 1, // smaller due date first
				},
			},
		];

		const activities = await collection.aggregate<TActivityDTO>(pipeline).toArray();
		return activities;
	} catch (error) {
		console.log("[ERROR] - Error getting activities by responsible id", error);
		throw error;
	}
}
type GetAllActivitiesParams = {
	collection: Collection<TActivity>;
	query: Filter<TActivity>;
};

export async function getAllActivities({ collection, query }: GetAllActivitiesParams) {
	try {
		// Sorting:
		// 1. Smaller due dates first (smaller due date first)
		// 2. Then nulls last (nulls last)
		const pipeline = [
			{
				$match: {
					...query,
				},
			},
			{
				$addFields: {
					// Campo auxiliar: 0 se tem dataVencimento, 1 se não tem (para ordenar nulls por último)
					dataVencimentoNull: {
						$cond: [{ $ifNull: ["$dataVencimento", false] }, 0, 1],
					},
				},
			},
			{
				$sort: {
					// 1. Smaller due dates first
					dataVencimentoNull: 1, // 0 (has data) comes before 1 (null)
					dataVencimento: 1, // smaller due date first
				},
			},
		];

		const activities = await collection.aggregate<TActivityDTO>(pipeline).toArray();
		return activities;
	} catch (error) {
		console.log("[ERROR] - Error getting all activities", error);
		throw error;
	}
}
