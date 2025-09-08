import type { TComercialResultsQueryFiltersOptions } from "@/app/api/stats/comercial-results/query-options/route";
import type {
	TGetGraphDataRouteInput,
	TGetGraphDataRouteOutput,
} from "@/app/api/stats/graph/route";
import type {
	TGetSDRRankingInput,
	TGetSDRRankingOutput,
} from "@/app/api/stats/ranking/sdrs/route";
import type { TGetSellersRankingInput } from "@/app/api/stats/ranking/sellers/route";
import type { TGetSellersRankingOutput } from "@/app/api/stats/ranking/sellers/route";
import type {
	TGetStatsQueryFiltersOptionsRouteOutput,
	TGetStatsRouteOutput,
} from "@/app/api/stats/route";
import type { TSalesStats } from "@/app/api/stats/sales/route";
import { useDebounceMemo } from "@/lib/hooks";
import type { TActivityDTO } from "@/utils/schemas/activities.schema";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

export type TStats = {
	simplificado: {
		ANTERIOR: {
			projetosCriados: number;
			projetosGanhos: number;
			projetosPerdidos: number;
			totalVendido: number;
		};
		ATUAL: {
			projetosCriados: number;
			projetosGanhos: number;
			projetosPerdidos: number;
			totalVendido: number;
		};
	};
	propostasAssinadas: {
		responsaveis: {
			id: string;
			nome: string;
			papel: string;
			avatar_url?: string | null | undefined;
		}[];
		dataAssinatura: string | null | undefined;
		_id: string;
		nome: string;
		valor: number;
	}[];
	atividades: TActivityDTO[];
	assinaturasPendentes: {
		_id: string;
		nome: string;
		identificador: string;
		valorProposta: number;
		responsaveis: {
			id: string;
			nome: string;
			papel: string;
			avatar_url?: string | null | undefined;
		}[];
	}[];
};

type UseStatsParams = {
	after: string;
	before: string;
	responsibles: string[] | null;
	partners: string[] | null;
	projectTypes: string[] | null;
};
async function fetchStats({
	after,
	before,
	responsibles,
	partners,
	projectTypes,
}: UseStatsParams) {
	const { data }: { data: TGetStatsRouteOutput } = await axios.post(
		`/api/stats?after=${after}&before=${before}`,
		{
			responsibles,
			partners,
			projectTypes,
		},
	);
	return data.data;
}
export function useStats({
	after,
	before,
	responsibles,
	partners,
	projectTypes,
}: UseStatsParams) {
	return useQuery({
		queryKey: ["stats", after, before, responsibles, partners, projectTypes],
		queryFn: async () =>
			await fetchStats({ after, before, responsibles, partners, projectTypes }),
		refetchOnWindowFocus: false,
	});
}
async function fetchStatsQueryOptions() {
	const { data }: { data: TGetStatsQueryFiltersOptionsRouteOutput } =
		await axios.get("/api/stats");
	return data.data.options;
}
export function useStatsQueryOptions() {
	return useQuery({
		queryKey: ["general-stats-query-options"],
		queryFn: fetchStatsQueryOptions,
	});
}
async function fetchComercialResultsQueryOptions() {
	const { data } = await axios.get(
		"/api/stats/comercial-results/query-options",
	);
	return data.data as TComercialResultsQueryFiltersOptions;
}
export function useComercialResultsQueryOptions() {
	return useQuery({
		queryKey: ["comercial-results-query-options"],
		queryFn: fetchComercialResultsQueryOptions,
	});
}
async function fetchSalesStats(
	after: string,
	before: string,
	responsibles: string[] | null,
) {
	const { data } = await axios.get(
		`/api/stats/sales?after=${after}&before=${before}&responsibles=${responsibles}`,
	);
	return data.data as TSalesStats;
}
export function useSaleStats(
	after: string,
	before: string,
	responsibles: string[] | null,
) {
	return useQuery({
		queryKey: ["sale-stats", after, before, responsibles],
		queryFn: async () => await fetchSalesStats(after, before, responsibles),
	});
}

type TFetchGraphDataParams = {
	after: string;
	before: string;
	filters: TGetGraphDataRouteInput;
};
async function fetchGraphData({
	after,
	before,
	filters,
}: TFetchGraphDataParams) {
	const { data } = await axios.post<TGetGraphDataRouteOutput>(
		`/api/stats/graph?after=${after}&before=${before}`,
		filters,
	);
	return data.data;
}

export function useGraphData({
	after,
	before,
	filters,
}: TFetchGraphDataParams) {
	return useQuery({
		queryKey: ["graph-data", after, before, filters],
		queryFn: async () => await fetchGraphData({ after, before, filters }),
	});
}

async function fetchSDRRanking({ rankBy, type }: TGetSDRRankingInput) {
	const urlParams = new URLSearchParams();
	urlParams.set("type", type);
	urlParams.set("rankBy", rankBy);
	const { data } = await axios.get<TGetSDRRankingOutput>(
		`/api/stats/ranking/sdrs?${urlParams.toString()}`,
	);
	return data.data;
}

type UseSDRRankingParams = {
	initialParams?: TGetSDRRankingInput;
};
export function useSDRRanking({ initialParams }: UseSDRRankingParams) {
	const [params, setParams] = useState<TGetSDRRankingInput>({
		rankBy: initialParams?.rankBy ?? "opportunities-send-qty",
		type: initialParams?.type ?? "current-semester",
	});

	function updateParams(newParams: Partial<TGetSDRRankingInput>) {
		setParams((prev) => ({ ...prev, ...newParams }));
	}
	const debouncedParams = useDebounceMemo(params, 500);
	return {
		...useQuery({
			queryKey: ["sdr-ranking", debouncedParams],
			queryFn: async () => await fetchSDRRanking(debouncedParams),
		}),
		queryKey: ["sdr-ranking", debouncedParams],
		params,
		updateParams,
	};
}

async function fetchSellersRanking({
	projectTypes,
	rankBy,
	type,
}: TGetSellersRankingInput) {
	const urlParams = new URLSearchParams();
	urlParams.set("type", type);
	urlParams.set("rankBy", rankBy);
	urlParams.set("projectTypes", projectTypes.join(","));
	const { data } = await axios.get<TGetSellersRankingOutput>(
		`/api/stats/ranking/sellers?${urlParams.toString()}`,
	);
	return data.data;
}

type UseSellersRankingParams = {
	initialParams?: TGetSellersRankingInput;
};
export function useSellersRanking({ initialParams }: UseSellersRankingParams) {
	const [params, setParams] = useState<TGetSellersRankingInput>({
		type: initialParams?.type ?? "current-semester",
		rankBy: initialParams?.rankBy ?? "sales-total-power",
		projectTypes: initialParams?.projectTypes ?? [
			"SISTEMA FOTOVOLTAICO",
			"AUMENTO DE SISTEMA FOTOVOLTAICO",
		],
	});

	function updateParams(newParams: Partial<TGetSellersRankingInput>) {
		setParams((prev) => ({ ...prev, ...newParams }));
	}
	const debouncedParams = useDebounceMemo(params, 500);
	return {
		...useQuery({
			queryKey: ["sellers-ranking", debouncedParams],
			queryFn: async () => await fetchSellersRanking(debouncedParams),
		}),
		queryKey: ["sellers-ranking", debouncedParams],
		params,
		updateParams,
	};
}
