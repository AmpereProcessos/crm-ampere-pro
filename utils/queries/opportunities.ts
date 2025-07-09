import axios from "axios";
import type {
	TOpportunityDTO,
	TOpportunityDTOWithClient,
	TOpportunityDTOWithClientAndPartnerAndFunnelReferences,
	TOpportunityDTOWithFunnelReferenceAndActivities,
	TOpportunityDTOWithFunnelReferenceAndActivitiesByStatus,
	TOpportunitySimplifiedDTO,
	TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels,
	TOpportunityWithFunnelReferenceAndActivitiesByStatus,
	TPersonalizedOpportunitiesFilter,
} from "../schemas/opportunity.schema";
import { useQuery } from "@tanstack/react-query";
import type { TResultsExportsItem } from "@/app/api/stats/comercial-results/exports/route";
import type { TOpportunitiesByFastSearch, TOpportunitiesByFilterResult } from "@/pages/api/opportunities/search";
import { useState } from "react";
import type { TOpportunitiesQueryOptions } from "@/pages/api/opportunities/query-options";
import type { TGetComissionsRouteInput, TGetComissionsRouteOutput } from "@/app/api/opportunities/comissions/route";
import dayjs from "dayjs";
import { useDebounceMemo } from "@/lib/hooks";

type UseOpportunitiesParams = {
	responsibles: string[] | null;
	funnel: string | null;
	periodAfter: string | undefined;
	periodBefore: string | undefined;
	periodField: string | undefined;
	status: "GANHOS" | "PERDIDOS" | undefined;
};
async function fetchOpportunities({ responsibles, funnel, periodAfter, periodBefore, periodField, status }: UseOpportunitiesParams) {
	try {
		const queryParamsArr = [
			{ key: "responsibles", value: responsibles },
			{ key: "funnel", value: funnel },
			{ key: "periodAfter", value: periodAfter },
			{ key: "periodBefore", value: periodBefore },
			{ key: "periodField", value: periodField },
			{ key: "status", value: status },
		];
		const queryParams = queryParamsArr
			.filter((q) => !!q.value)
			.map((q) => `${q.key}=${q.value}`)
			.join("&");
		const { data } = await axios.get(`/api/opportunities?${queryParams}`);
		return data.data as TOpportunitySimplifiedDTOWithProposalAndActivitiesAndFunnels[];
	} catch (error) {
		console.log("Error fetching opportunities", error);
		throw error;
	}
}
export function useOpportunities({ responsibles, funnel, periodAfter, periodBefore, periodField, status }: UseOpportunitiesParams) {
	return useQuery({
		queryKey: ["opportunities", responsibles, funnel, periodAfter, periodBefore, periodField, status],
		queryFn: async () => await fetchOpportunities({ responsibles, funnel, periodAfter, periodBefore, periodField, status }),
		gcTime: 1000 * 60 * 5, // 5 minutes
	});
}

async function fetchOpportunity({ opportunityId }: { opportunityId: string }) {
	try {
		const { data } = await axios.get(`/api/opportunities?id=${opportunityId}`);
		return data.data as TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
	} catch (error) {
		console.log("Error fetching opportunity", error);
		throw error;
	}
}
export function useOpportunityById({ opportunityId }: { opportunityId: string }) {
	return useQuery({
		queryKey: ["opportunity-by-id", opportunityId],
		queryFn: async () => await fetchOpportunity({ opportunityId }),
	});
}

export type TOpportunitiesByFastSearchParams = {
	searchParam: string;
	page: number;
};
async function fetchOpportunitiesBySearch({ searchParam, page }: TOpportunitiesByFastSearchParams): Promise<TOpportunitiesByFastSearch> {
	try {
		if (searchParam.trim().length < 3)
			return {
				opportunities: [],
				opportunitiesMatched: 0,
				totalPages: 0,
			};
		const { data } = await axios.get(`/api/opportunities/search?searchParam=${searchParam}&page=${page}`);
		return data.data as TOpportunitiesByFastSearch;
	} catch (error) {
		console.log("Error fetching opportunities by search", error);
		throw error;
	}
}

export function useOpportunitiesBySearch({ searchParam, page }: { searchParam: string; page: number }) {
	return useQuery({
		queryKey: ["opportunities-by-search", searchParam, page],
		queryFn: async () => await fetchOpportunitiesBySearch({ searchParam, page }),
	});
}

type TExportOpportunitiesParams = {
	responsibles: string[] | null;
	periodAfter?: string | null;
	periodBefore?: string | null;
	periodField?: string | null;
	status: "GANHOS" | "PERDIDOS" | undefined;
};
export async function fetchOpportunityExport({ responsibles, periodAfter, periodBefore, periodField, status }: TExportOpportunitiesParams) {
	try {
		const queryParamsArr = [
			{ key: "responsibles", value: responsibles },
			{ key: "periodAfter", value: periodAfter },
			{ key: "periodBefore", value: periodBefore },
			{ key: "periodField", value: periodField },
			{ key: "status", value: status },
		];

		const queryParams = queryParamsArr
			.filter((param) => !!param.value)
			.map((param) => `${param.key}=${param.value}`)
			.join("&");

		console.log(queryParams);
		const { data } = await axios.get(`/api/opportunities/export?${queryParams}`);
		return data.data as TResultsExportsItem[];
	} catch (error) {
		console.log("Error fetching opportunities by personalized filters", error);
		throw error;
	}
}

type FetchOpportunitiesByPersonalizedFiltersParams = {
	page: number;
	responsibles: string[] | null;
	partners: string[] | null;
	projectTypes: string[] | null;
	filters: TPersonalizedOpportunitiesFilter;
};
async function fetchOpportunitiesByPersonalizedFilters({ page, responsibles, partners, projectTypes, filters }: FetchOpportunitiesByPersonalizedFiltersParams) {
	try {
		const { data } = await axios.post(`/api/opportunities/search?page=${page}`, { responsibles, partners, projectTypes, filters });
		return data.data as TOpportunitiesByFilterResult;
	} catch (error) {
		console.log("Error fetching opportunities by personalized filters", error);
		throw error;
	}
}

type UseOpportunitiesByPersonalizedFiltersParams = {
	page: number;
	responsibles: string[] | null;
	partners: string[] | null;
	projectTypes: string[] | null;
};
export function useOpportunitiesByPersonalizedFilters({ page, partners, responsibles, projectTypes }: UseOpportunitiesByPersonalizedFiltersParams) {
	const [filters, setFilters] = useState<TPersonalizedOpportunitiesFilter>({
		name: "",
		city: [],
		period: {
			after: null,
			before: null,
			field: null,
		},
	});
	function updateFilters(filters: TPersonalizedOpportunitiesFilter) {
		setFilters(filters);
	}
	return {
		...useQuery({
			queryKey: ["opportunities-by-personalized-filters", page, responsibles, partners, projectTypes, filters],
			queryFn: async () => await fetchOpportunitiesByPersonalizedFilters({ page, responsibles, partners, projectTypes, filters }),
		}),
		updateFilters,
	};
}

async function fetchOpportunitiesQueryOptions() {
	try {
		const { data } = await axios.get("/api/opportunities/query-options");
		return data.data as TOpportunitiesQueryOptions;
	} catch (error) {
		console.log("Error fetching opportunities ultra simplified", error);
		throw error;
	}
}

export function useOpportunitiesQueryOptions() {
	return useQuery({
		queryKey: ["opportunities-query-options"],
		queryFn: fetchOpportunitiesQueryOptions,
		refetchOnWindowFocus: false,
	});
}

async function fetchOpportunitiesUltraSimplified() {
	try {
		const { data } = await axios.get("/api/opportunities/simplified");
		return data.data as TOpportunitySimplifiedDTO[];
	} catch (error) {
		console.log("Error fetching opportunities query options", error);
		throw error;
	}
}

export function useOpportunitiesUltraSimplified() {
	return useQuery({
		queryKey: ["opportunities-ultra-simplified"],
		queryFn: fetchOpportunitiesUltraSimplified,
	});
}

async function fetchComissions({ after, before, userIds }: TGetComissionsRouteInput) {
	try {
		const params = new URLSearchParams();
		params.set("after", after);
		params.set("before", before);
		if (userIds) {
			params.set("userIds", userIds.join(","));
		}
		console.log("PARAMS", params.toString());
		const { data }: { data: TGetComissionsRouteOutput } = await axios.get(`/api/opportunities/comissions?${params.toString()}`);
		return data.data;
	} catch (error) {
		console.log("Error fetching comissions", error);
		throw error;
	}
}

type UseComissionsParams = {
	initialQueryParams: TGetComissionsRouteInput;
};
export function useComissions({ initialQueryParams }: UseComissionsParams) {
	const [queryParams, setQueryParams] = useState<TGetComissionsRouteInput>(initialQueryParams);

	function updateQueryParams(queryParams: Partial<TGetComissionsRouteInput>) {
		setQueryParams((prev) => ({ ...prev, ...queryParams }));
	}
	const debouncedParams = useDebounceMemo(queryParams, 500);
	return {
		...useQuery({
			queryKey: ["comissions", debouncedParams],
			queryFn: async () => await fetchComissions(debouncedParams),
		}),
		queryParams,
		updateQueryParams,
	};
}
