import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { TGetActivitiesRouteOutput } from "@/app/api/activities/route";

type UseActivitiesByOpportunityIdParams = { opportunityId: string; openOnly?: boolean; dueOnly?: boolean };
async function fetchActivitiesByOpportunityId({ opportunityId, openOnly, dueOnly }: UseActivitiesByOpportunityIdParams) {
	try {
		let url = `/api/activities?opportunityId=${opportunityId}`;
		if (openOnly) url += `&openOnly=${openOnly}`;
		if (dueOnly) url += `&dueOnly=${dueOnly}`;
		const { data }: { data: TGetActivitiesRouteOutput } = await axios.get(url);
		return data.data.byOpportunityId;
	} catch (error) {
		console.log("[ERROR] - fetchActivitiesByOpportunityId", error);
		throw error;
	}
}
export function useActivitiesByOpportunityId({ opportunityId, openOnly, dueOnly }: UseActivitiesByOpportunityIdParams) {
	return useQuery({
		queryKey: ["opportunity-activities", opportunityId],
		queryFn: async () => await fetchActivitiesByOpportunityId({ opportunityId, openOnly, dueOnly }),
	});
}

async function fetchActivitiesByHomologationId({ homologationId }: { homologationId: string }) {
	try {
		const { data }: { data: TGetActivitiesRouteOutput } = await axios.get(`/api/activities?homologationId=${homologationId}`);
		return data.data.byHomologationId;
	} catch (error) {
		console.log("[ERROR] - fetchActivitiesByHomologationId", error);
		throw error;
	}
}

export function useActivitiesByHomologationId({ homologationId }: { homologationId: string }) {
	return useQuery({
		queryKey: ["homologation-activities", homologationId],
		queryFn: async () => await fetchActivitiesByHomologationId({ homologationId }),
	});
}

async function fetchActivitiesByTechnicalAnalysisId({ technicalAnalysisId }: { technicalAnalysisId: string }) {
	try {
		const { data }: { data: TGetActivitiesRouteOutput } = await axios.get(`/api/activities?technicalAnalysisId=${technicalAnalysisId}`);
		return data.data.byTechnicalAnalysisId;
	} catch (error) {
		console.log("[ERROR] - fetchActivitiesByTechnicalAnalysisId", error);
		throw error;
	}
}

export function useActivitiesByTechnicalAnalysisId({ technicalAnalysisId }: { technicalAnalysisId: string }) {
	return useQuery({
		queryKey: ["technical-analysis-activities", technicalAnalysisId],
		queryFn: async () => await fetchActivitiesByTechnicalAnalysisId({ technicalAnalysisId }),
	});
}
async function fetchActivitiesByPurchaseId({ purchaseId }: { purchaseId: string }) {
	try {
		const { data }: { data: TGetActivitiesRouteOutput } = await axios.get(`/api/activities?purchaseId=${purchaseId}`);
		return data.data.byPurchaseId;
	} catch (error) {
		console.log("[ERROR] - fetchActivitiesByPurchaseId", error);
		throw error;
	}
}

export function useActivitiesByPurchaseId({ purchaseId }: { purchaseId: string }) {
	return useQuery({
		queryKey: ["purchase-activities", purchaseId],
		queryFn: async () => await fetchActivitiesByPurchaseId({ purchaseId }),
	});
}

async function fetchActivities({ responsibleId, openOnly, dueOnly }: { responsibleId?: string | null; openOnly?: boolean; dueOnly?: boolean }) {
	try {
		let url = "/api/activities?";
		if (openOnly) url = url + `openOnly=${openOnly}&`;
		if (dueOnly) url = url + `dueOnly=${dueOnly}&`;
		if (responsibleId) url = url + `responsibleId=${responsibleId}&`;
		const { data }: { data: TGetActivitiesRouteOutput } = await axios.get(url);
		if (responsibleId) return data.data.byResponsibleId;
		return data.data.default;
	} catch (error) {
		console.log("[ERROR] - fetchActivities", error);
		throw error;
	}
}

export function useActivities({ responsibleId, openOnly, dueOnly }: { responsibleId?: string | null; openOnly?: boolean; dueOnly?: boolean }) {
	return useQuery({
		queryKey: ["activities", responsibleId, openOnly, dueOnly],
		queryFn: async () => await fetchActivities({ responsibleId, openOnly, dueOnly }),
	});
}
