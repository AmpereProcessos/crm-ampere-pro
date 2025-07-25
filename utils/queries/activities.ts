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

async function fetchActivities({ responsibleIds, openOnly, dueOnly }: { responsibleIds?: string[] | null; openOnly?: boolean; dueOnly?: boolean }) {
	try {
		const baseUrl = "/api/activities?";
		const params = new URLSearchParams();
		if (openOnly) params.append("openOnly", String(openOnly));
		if (dueOnly) params.append("dueOnly", String(dueOnly));
		if (responsibleIds) params.append("responsiblesId", responsibleIds.join(","));
		const url = baseUrl + params.toString();
		const { data }: { data: TGetActivitiesRouteOutput } = await axios.get(url);
		if (responsibleIds && responsibleIds.length > 0) return data.data.byResponsibleId;
		return data.data.default;
	} catch (error) {
		console.log("[ERROR] - fetchActivities", error);
		throw error;
	}
}

export function useActivities({ responsibleIds, openOnly, dueOnly }: { responsibleIds?: string[] | null; openOnly?: boolean; dueOnly?: boolean }) {
	return useQuery({
		queryKey: ["activities", responsibleIds, openOnly, dueOnly],
		queryFn: async () => await fetchActivities({ responsibleIds, openOnly, dueOnly }),
	});
}
