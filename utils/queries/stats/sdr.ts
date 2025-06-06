import type { TSDRTeamResults } from "@/app/api/stats/comercial-results/sales-sdr/route";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type UseSDRTeamResultsParams = {
	after: string;
	before: string;
	responsibles: string[] | null;
	partners: string[] | null;
	projectTypes: string[] | null;
};
async function fetchStats({ after, before, responsibles, partners, projectTypes }: UseSDRTeamResultsParams) {
	try {
		const { data } = await axios.post(`/api/stats/comercial-results/sales-sdr?after=${after}&before=${before}`, { responsibles, partners, projectTypes });
		return data.data as TSDRTeamResults;
	} catch (error) {
		throw new Error("Erro ao buscar resultados do time SDR");
	}
}

export function useSDRTeamResults({ after, before, responsibles, partners, projectTypes }: UseSDRTeamResultsParams) {
	return useQuery({
		queryKey: ["sdr-team-results", after, before, responsibles, partners, projectTypes],
		queryFn: async () => await fetchStats({ after, before, responsibles, partners, projectTypes }),
		refetchOnMount: false,
	});
}
