import type { TOverallResults, TOverallResultsRouteOutput } from "@/app/api/stats/comercial-results/overall/route";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type UseOverallResultsParams = {
	after: string;
	before: string;
	responsibles: string[] | null;
	partners: string[] | null;
	projectTypes: string[] | null;
};

async function fetchStats({ after, before, responsibles, partners, projectTypes }: UseOverallResultsParams) {
	const { data } = await axios.post(`/api/stats/comercial-results/overall?after=${after}&before=${before}`, { responsibles, partners, projectTypes });
	return data.data as TOverallResultsRouteOutput["data"];
}

export function useOverallSalesResults({ after, before, responsibles, partners, projectTypes }: UseOverallResultsParams) {
	return useQuery({
		queryKey: ["overall-sales-results", after, before, responsibles, partners, projectTypes],
		queryFn: async () => await fetchStats({ after, before, responsibles, partners, projectTypes }),
		refetchOnMount: false,
	});
}
