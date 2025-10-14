import type {
	TGetCreditorsResultInput,
	TGetCreditorsResultOutput,
} from "@/app/api/stats/comercial-results/creditors/route";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function fetchCreditorsResults(input: TGetCreditorsResultInput) {
	const searchParams = new URLSearchParams();
	searchParams.set("after", input.after);
	searchParams.set("before", input.before);
	const searchParamsString = searchParams.toString();

	const { data } = await axios.post<TGetCreditorsResultOutput>(
		`/api/stats/comercial-results/creditors?${searchParamsString}`,
		{
			responsibles: input.responsibles,
			partners: input.partners,
			projectTypes: input.projectTypes,
		},
	);
	return data.data;
}

export function useCreditorsResults(input: TGetCreditorsResultInput) {
	return {
		...useQuery({
			queryKey: ["creditors-results", input],
			queryFn: () => fetchCreditorsResults(input),
		}),
		queryKey: ["creditors-results", input],
	};
}
