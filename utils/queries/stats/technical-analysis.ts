import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchTechnicalAnalysisStats({ after, before }: { after: string; before: string }) {
	try {
		const { data } = await axios.post(`/api/stats/technical-analysis?after=${after}&before=${before}`);
		return data.data as any;
	} catch (error) {
		throw error;
	}
}

export function useTechnicalAnalysisStats({ after, before }: { after: string; before: string }) {
	return useQuery({
		queryKey: ["technical-analysis-stats", after, before],
		queryFn: async () => await fetchTechnicalAnalysisStats({ after, before }),
	});
}
