import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useDebounceMemo } from "@/lib/hooks";
import type { TGetManyProjectsInput, TGetProjectByIdInput, TGetProjectsOutput } from "@/pages/api/integration/app-ampere/projects";

async function fetchProjects(input: TGetManyProjectsInput) {
	const searchParams = new URLSearchParams();
	if (input.search && input.search.trim().length > 0) searchParams.set("search", input.search);
	if (input.responsiblesIds && input.responsiblesIds.length > 0) searchParams.set("responsiblesIds", input.responsiblesIds.map((id) => id).join(","));
	if (input.periodField) searchParams.set("periodField", input.periodField);
	if (input.periodAfter) searchParams.set("periodAfter", input.periodAfter);
	if (input.periodBefore) searchParams.set("periodBefore", input.periodBefore);
	if (input.page) searchParams.set("page", input.page.toString());

	const searchParamsString = searchParams.toString();
	const url = `/api/integration/app-ampere/projects?${searchParamsString}`;

	const { data } = await axios.get<TGetProjectsOutput>(url);
	if (!data.data.default) throw new Error("Oops, houve um erro ao buscar projetos");
	return data.data.default;
}

type TUseProjectsParams = {
	initialFilters?: Partial<TGetManyProjectsInput>;
};
export function useProjects({ initialFilters }: TUseProjectsParams = {}) {
	const [filters, setFilters] = useState<TGetManyProjectsInput>({
		page: 1,
		responsiblesIds: initialFilters?.responsiblesIds ?? null,
		periodField: initialFilters?.periodField ?? null,
		periodAfter: initialFilters?.periodAfter ?? null,
		periodBefore: initialFilters?.periodBefore ?? null,
		search: initialFilters?.search ?? null,
	});
	function updateFilters(newFilters: Partial<TGetManyProjectsInput>) {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	}
	const debouncedFilters = useDebounceMemo(filters, 500);
	return {
		...useQuery({
			queryKey: ["projects", debouncedFilters],
			queryFn: () => fetchProjects(debouncedFilters),
		}),
		queryKey: ["projects", debouncedFilters],
		filters,
		updateFilters,
	};
}

export async function fetchProjectById({ id }: TGetProjectByIdInput) {
	const { data } = await axios.get<TGetProjectsOutput>(`/api/integration/app-ampere/projects?id=${id}`);
	if (!data.data.byId) throw new Error("Oops, houve um erro ao buscar o projeto");
	return data.data.byId;
}

export function useProjectById({ id }: TGetProjectByIdInput) {
	return {
		...useQuery({
			queryKey: ["project-by-id", id],
			queryFn: () => fetchProjectById({ id }),
		}),
		queryKey: ["project-by-id", id],
	};
}
