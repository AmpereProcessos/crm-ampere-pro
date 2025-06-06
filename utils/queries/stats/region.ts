import type { TResultsByRegion, TResultsByRegionRouteOutput } from "@/app/api/stats/comercial-results/region/route";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type UseRegionResultsParams = {
	after: string;
	before: string;
	responsibles: string[] | null;
	partners: string[] | null;
	projectTypes: string[] | null;
};

async function fetchStats({ after, before, responsibles, partners, projectTypes }: UseRegionResultsParams) {
	const { data } = await axios.post(`/api/stats/comercial-results/region?after=${after}&before=${before}`, { responsibles, partners, projectTypes });
	return data.data as TResultsByRegionRouteOutput["data"];
}

export function useResultsByRegion({ after, before, responsibles, partners, projectTypes }: UseRegionResultsParams) {
	return useQuery({
		queryKey: ["results-by-region", after, before, responsibles, partners, projectTypes],
		queryFn: async () => await fetchStats({ after, before, responsibles, partners, projectTypes }),
	});
}
