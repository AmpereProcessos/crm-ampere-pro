import type { TProcessTrackingStats } from "@/app/api/stats/operation/process-tracking/route";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type UseProcessTrackingStatsParams = {
	after: string;
	before: string;
	projectType: string;
};
async function fetchProcessTrackingStats({ after, before, projectType }: UseProcessTrackingStatsParams) {
	try {
		const { data } = await axios.get(`/api/stats/operation/process-tracking?after=${after}&before=${before}&projectType=${projectType}`);
		return data.data as TProcessTrackingStats;
	} catch (error) {
		console.error("[ERROR] fetchProcessTrackingStats", error);
		throw error;
	}
}

export function useProcessTrackingStats({ after, before, projectType }: UseProcessTrackingStatsParams) {
	return useQuery({
		queryKey: ["process-tracking", after, before, projectType],
		queryFn: async () => await fetchProcessTrackingStats({ after, before, projectType }),
		refetchOnWindowFocus: false,
	});
}
