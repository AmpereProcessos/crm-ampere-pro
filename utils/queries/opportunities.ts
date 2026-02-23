import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import type { TGetComissionsRouteInput, TGetComissionsRouteOutput } from "@/app/api/opportunities/comissions/route";
import type {
	TExportOpportunitiesRouteOutput,
	TGetExportOpportunitiesInput,
	TOpportunityExportItem,
} from "@/app/api/opportunities/export/route";
import { useDebounceMemo } from "@/lib/hooks";
import type { TGetOpportunitiesKanbanViewInput, TGetOpportunitiesKanbanViewOutput } from "@/pages/api/opportunities/kanban";
import type { TGetOpportunitiesQueryDefinitionsOutput } from "@/pages/api/opportunities/query-definitions";
import type { TOpportunitiesQueryOptions } from "@/pages/api/opportunities/query-options";
import type { TOpportunitiesByFastSearch, TOpportunitiesByFilterResult } from "@/pages/api/opportunities/search";
import type {
	TOpportunityDTOWithClientAndPartnerAndFunnelReferences,
	TOpportunitySimplifiedDTO,
	TPersonalizedOpportunitiesFilter,
} from "../schemas/opportunity.schema";

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
	return {
		...useQuery({
			queryKey: ["opportunity-by-id", opportunityId],
			queryFn: async () => await fetchOpportunity({ opportunityId }),
		}),
		queryKey: ["opportunity-by-id", opportunityId],
	};
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

type TFetchOpportunitiesExportsPageInput = Omit<TGetExportOpportunitiesInput, "page"> & {
	page?: number;
	signal?: AbortSignal;
};

function getSafeConcurrency(concurrency: number | undefined) {
	if (!concurrency || Number.isNaN(concurrency)) return 3;
	if (concurrency < 1) return 1;
	if (concurrency > 4) return 4;
	return concurrency;
}

export async function fetchOpportunitiesExportsPage({
	page = 1,
	pageSize,
	funnelsIds,
	responsibles,
	periodAfter,
	periodBefore,
	periodField,
	status,
	signal,
}: TFetchOpportunitiesExportsPageInput) {
	const { data } = await axios.post<TExportOpportunitiesRouteOutput>(
		"/api/opportunities/export",
		{
			page,
			pageSize,
			funnelsIds,
			responsibles,
			periodAfter,
			periodBefore,
			periodField,
			status,
		},
		{ signal },
	);
	return data;
}

type TFetchOpportunitiesExportsAllInput = Omit<TFetchOpportunitiesExportsPageInput, "page"> & {
	concurrency?: number;
	callbacks?: {
		onInit?: (payload: { totalPages: number; totalItems: number; pageSize: number }) => void;
		onPageDone?: (payload: {
			page: number;
			pageItems: number;
			pagesProcessed: number;
			totalPages: number;
			opportunitiesProcessed: number;
			totalItems: number;
		}) => void;
	};
};

async function processExportChunks({
	chunks,
	currentChunkIndex,
	commonInput,
	state,
	callbacks,
	signal,
}: {
	chunks: number[][];
	currentChunkIndex: number;
	commonInput: Omit<TFetchOpportunitiesExportsPageInput, "page" | "signal">;
	state: { rows: TOpportunityExportItem[]; pagesProcessed: number; opportunitiesProcessed: number; totalPages: number; totalItems: number };
	callbacks?: TFetchOpportunitiesExportsAllInput["callbacks"];
	signal?: AbortSignal;
}): Promise<TOpportunityExportItem[]> {
	if (signal?.aborted) throw new Error("Exportação cancelada.");
	if (currentChunkIndex >= chunks.length) return state.rows;

	const pages = chunks[currentChunkIndex] ?? [];
	const results = await Promise.all(
		pages.map((page) =>
			fetchOpportunitiesExportsPage({
				...commonInput,
				page,
				signal,
			}),
		),
	);

	results.forEach((result) => {
		state.rows.push(...result.data);
		state.pagesProcessed += 1;
		state.opportunitiesProcessed += result.data.length;
		callbacks?.onPageDone?.({
			page: result.page,
			pageItems: result.data.length,
			pagesProcessed: state.pagesProcessed,
			totalPages: state.totalPages,
			opportunitiesProcessed: state.opportunitiesProcessed,
			totalItems: state.totalItems,
		});
	});

	return processExportChunks({
		chunks,
		currentChunkIndex: currentChunkIndex + 1,
		commonInput,
		state,
		callbacks,
		signal,
	});
}

export async function fetchOpportunitiesExportsAll({
	pageSize = 500,
	funnelsIds,
	responsibles,
	periodAfter,
	periodBefore,
	periodField,
	status,
	concurrency,
	callbacks,
	signal,
}: TFetchOpportunitiesExportsAllInput) {
	const firstPage = await fetchOpportunitiesExportsPage({
		page: 1,
		pageSize,
		funnelsIds,
		responsibles,
		periodAfter,
		periodBefore,
		periodField,
		status,
		signal,
	});

	callbacks?.onInit?.({
		totalPages: firstPage.totalPages,
		totalItems: firstPage.totalItems,
		pageSize: firstPage.pageSize,
	});
	callbacks?.onPageDone?.({
		page: firstPage.page,
		pageItems: firstPage.data.length,
		pagesProcessed: firstPage.totalPages > 0 ? 1 : 0,
		totalPages: firstPage.totalPages,
		opportunitiesProcessed: firstPage.data.length,
		totalItems: firstPage.totalItems,
	});

	if (!firstPage.totalPages || firstPage.totalPages <= 1) {
		return firstPage.data as TOpportunityExportItem[];
	}

	const pages = Array.from({ length: firstPage.totalPages - 1 }, (_, index) => index + 2);
	const chunkSize = getSafeConcurrency(concurrency);
	const chunks = Array.from({ length: Math.ceil(pages.length / chunkSize) }, (_, index) =>
		pages.slice(index * chunkSize, index * chunkSize + chunkSize),
	);

	const state = {
		rows: [...(firstPage.data as TOpportunityExportItem[])],
		pagesProcessed: 1,
		opportunitiesProcessed: firstPage.data.length,
		totalPages: firstPage.totalPages,
		totalItems: firstPage.totalItems,
	};

	return processExportChunks({
		chunks,
		currentChunkIndex: 0,
		commonInput: {
			pageSize: firstPage.pageSize,
			funnelsIds,
			responsibles,
			periodAfter,
			periodBefore,
			periodField,
			status,
		},
		state,
		callbacks,
		signal,
	});
}

export async function fetchOpportunityExport({ responsibles, periodAfter, periodBefore, periodField, status, funnelsIds, pageSize }: TGetExportOpportunitiesInput) {
	try {
		return await fetchOpportunitiesExportsAll({
			responsibles,
			periodAfter,
			periodBefore,
			periodField,
			status,
			funnelsIds,
			pageSize,
		});
	} catch (error) {
		console.log("Error fetching opportunities export", error);
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

// Simple micro-batcher to aggregate multiple stage requests into a single POST
type TKvKanbanQueueItem = {
	payload: TGetOpportunitiesKanbanViewInput;
	resolve: (value: TGetOpportunitiesKanbanViewOutput["data"]) => void;
	reject: (reason?: unknown) => void;
};
let kanbanQueue: TKvKanbanQueueItem[] = [];
let kanbanQueueTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleKanbanFlush() {
	if (kanbanQueueTimer) return;
	kanbanQueueTimer = setTimeout(flushKanbanQueue, 15);
}

async function flushKanbanQueue() {
	const currentQueue = kanbanQueue;
	kanbanQueue = [];
	kanbanQueueTimer = null;
	if (currentQueue.length === 0) return;
	try {
		const { data } = await axios.post<{ data: TGetOpportunitiesKanbanViewOutput["data"][] }>("/api/opportunities/kanban-batch", {
			requests: currentQueue.map((q) => q.payload),
		});
		const results = data.data;
		for (let index = 0; index < currentQueue.length; index++) {
			const item = currentQueue[index];
			item.resolve(results[index]);
		}
	} catch (error) {
		for (const item of currentQueue) {
			item.reject(error);
		}
	}
}

async function fetchOpportunitiesKanbanView(input: TGetOpportunitiesKanbanViewInput) {
	return new Promise<TGetOpportunitiesKanbanViewOutput["data"]>((resolve, reject) => {
		kanbanQueue.push({ payload: input, resolve, reject });
		scheduleKanbanFlush();
	});
}

type UseOpportunitiesKanbanViewParams = {
	funnelId: TGetOpportunitiesKanbanViewInput["funnelId"];
	funnelStage: TGetOpportunitiesKanbanViewInput["funnelStage"];
	globalFilters: Omit<TGetOpportunitiesKanbanViewInput, "page" | "funnelId" | "funnelStage">;
};
export function useOpportunitiesKanbanView({ funnelId, funnelStage, globalFilters }: UseOpportunitiesKanbanViewParams) {
	return useInfiniteQuery({
		queryKey: ["opportunities-kanban-view", funnelId, funnelStage, globalFilters],
		queryFn: async ({ pageParam }) => await fetchOpportunitiesKanbanView({ ...globalFilters, funnelId, funnelStage, page: pageParam }),
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		initialPageParam: 1,
	});
}

async function fetchOpportunitiesQueryDefinitions() {
	try {
		const { data } = await axios.get<TGetOpportunitiesQueryDefinitionsOutput>("/api/opportunities/query-definitions");
		return data.data;
	} catch (error) {
		console.log("Error fetching opportunities query definitions", error);
		throw error;
	}
}

export function useOpportunitiesQueryDefinitions() {
	return useQuery({
		queryKey: ["opportunities-query-definitions"],
		queryFn: fetchOpportunitiesQueryDefinitions,
	});
}
