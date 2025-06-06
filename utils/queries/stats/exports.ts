import type { TResultsExportsItem, TExportDataRouteOutput } from "@/app/api/stats/comercial-results/exports/route";
import axios from "axios";

export async function fetchResultsExports({
	after,
	before,
	responsibles,
	partners,
	projectTypes,
}: {
	after: string;
	before: string;
	responsibles: string[] | null;
	partners: string[] | null;
	projectTypes: string[] | null;
}) {
	const { data } = await axios.post(`/api/stats/comercial-results/exports?after=${after}&before=${before}`, { responsibles, partners, projectTypes });
	return data.data as TExportDataRouteOutput["data"];
}
