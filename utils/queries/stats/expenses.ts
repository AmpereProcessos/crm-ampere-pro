import { TExpenseStatsResults } from "@/pages/api/stats/finances/expenses";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type UseExpenseStatsParams = {
	after: string;
	before: string;
	partners: string[] | null;
	projectTypes: string[] | null;
};

async function fetchStats({ after, before, partners, projectTypes }: UseExpenseStatsParams) {
	try {
		const { data } = await axios.post(`/api/stats/finances/expenses?after=${after}&before=${before}`, { partners, projectTypes });

		return data.data as TExpenseStatsResults;
	} catch (error) {
		throw error;
	}
}

export function useExpenseStats({ after, before, partners, projectTypes }: UseExpenseStatsParams) {
	return useQuery({
		queryKey: ["expense-stats", after, before, partners, projectTypes],
		queryFn: async () => await fetchStats({ after, before, partners, projectTypes }),
	});
}
