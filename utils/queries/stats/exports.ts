import axios from "axios";
import type { TExportDataRouteOutput, TGetResultsExportsInput, TResultsExportsItem } from "@/app/api/stats/comercial-results/exports/route";

export async function fetchResultsExportsPage({ after, before, responsibles, partners, projectTypes, page = 1, pageSize = 500 }: TGetResultsExportsInput) {
	const params = new URLSearchParams({
		after,
		before,
		page: String(page),
		pageSize: String(pageSize),
	});
	if (responsibles?.length) params.set("responsibles", responsibles.join(","));
	if (partners?.length) params.set("partners", partners.join(","));
	if (projectTypes?.length) params.set("projectTypes", projectTypes.join(","));

	const { data } = await axios.post(`/api/stats/comercial-results/exports?${params.toString()}`);
	return data as TExportDataRouteOutput;
}

export async function fetchResultsExportsAll({ after, before, responsibles, partners, projectTypes, pageSize = 500 }: Omit<TGetResultsExportsInput, "page">) {
	const firstPage = await fetchResultsExportsPage({ after, before, responsibles, partners, projectTypes, page: 1, pageSize });
	if (!firstPage.totalPages || firstPage.totalPages <= 1) {
		return firstPage.data as TResultsExportsItem[];
	}

	const pages = Array.from({ length: firstPage.totalPages - 1 }, (_, index) => index + 2);
	const results = await Promise.all(pages.map((page) => fetchResultsExportsPage({ after, before, responsibles, partners, projectTypes, page, pageSize })));
	const otherData = results.flatMap((result) => result.data);
	return [...firstPage.data, ...otherData] as TResultsExportsItem[];
}
