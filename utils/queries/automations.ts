import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import type { TGetAutomationsOutput, TGetManyAutomationsInput } from "@/app/api/automations/route";
import { useDebounceMemo } from "@/lib/hooks";

async function fetchAutomations(input: TGetManyAutomationsInput) {
	const queryString = new URLSearchParams();

	// Add non-null parameters to query string
	if (input.search && input.search.trim().length > 0) {
		queryString.set("search", input.search);
	}
	if (input.page) queryString.set("page", input.page.toString());
	if (input.ativo !== null) {
		queryString.set("ativo", input.ativo.toString());
	}

	// Handle arrays
	if (input.triggerType && input.triggerType.length > 0) {
		queryString.set("triggerType", input.triggerType.join(","));
	}
	if (input.actionType && input.actionType.length > 0) {
		queryString.set("actionType", input.actionType.join(","));
	}

	const { data } = await axios.get<TGetAutomationsOutput>(`/api/automations?${queryString.toString()}`);
	if (!data.data.default) throw new Error("Automações não encontradas.");
	return data.data.default;
}

type TUseAutomationsParams = {
	initialFilters?: TGetManyAutomationsInput;
};

export function useAutomations({ initialFilters }: TUseAutomationsParams = {}) {
	const [filters, setFilters] = useState<TGetManyAutomationsInput>({
		page: initialFilters?.page ?? 1,
		search: initialFilters?.search ?? null,
		ativo: initialFilters?.ativo ?? null,
		triggerType: initialFilters?.triggerType ?? null,
		actionType: initialFilters?.actionType ?? null,
	});

	function updateFilters(newFilters: Partial<TGetManyAutomationsInput>) {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	}

	const debouncedFilters = useDebounceMemo(filters, 500);

	return {
		...useQuery({
			queryKey: ["automations", debouncedFilters],
			queryFn: () => fetchAutomations(debouncedFilters),
		}),
		queryKey: ["automations", debouncedFilters],
		filters,
		updateFilters,
	};
}

async function fetchAutomationById({ id }: { id: string }) {
	const { data } = await axios.get<TGetAutomationsOutput>(`/api/automations?id=${id}`);
	if (!data.data.byId) throw new Error("Automação não encontrada.");
	return data.data.byId;
}

type TUseAutomationByIdParams = {
	id: string;
};

export function useAutomationById({ id }: TUseAutomationByIdParams) {
	return {
		...useQuery({
			queryKey: ["automation-by-id", id],
			queryFn: () => fetchAutomationById({ id }),
		}),
		queryKey: ["automation-by-id", id],
	};
}
