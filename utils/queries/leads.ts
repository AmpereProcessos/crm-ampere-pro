import { TGetLeadsOutput, TGetManyLeadsInput } from "@/app/api/leads/route";
import { TGetLeadsStatsInput, TGetLeadsStatsRouteOutput } from "@/app/api/leads/stats/route";
import { useDebounceMemo } from "@/lib/hooks";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { useState } from "react";

async function fetchLeads(input: TGetManyLeadsInput) {
	const queryString = new URLSearchParams();
	if (input.search && input.search.trim().length > 0) queryString.set("search", input.search);
	if (input.periodAfter) queryString.set("periodAfter", input.periodAfter);
	if (input.periodBefore) queryString.set("periodBefore", input.periodBefore);
	if (input.periodField) queryString.set("periodField", input.periodField);
	if (input.page) queryString.set("page", input.page.toString());
	if (input.qualifiersIds && input.qualifiersIds.length > 0) queryString.set("qualifiersIds", input.qualifiersIds.join(","));
	if (input.ufs && input.ufs.length > 0) queryString.set("ufs", input.ufs.join(","));
	if (input.cities && input.cities.length > 0) queryString.set("cities", input.cities.join(","));
	if (input.pendingQualification) queryString.set("pendingQualification", input.pendingQualification.toString());
	if (input.pendingContact) queryString.set("pendingContact", input.pendingContact.toString());

	const { data } = await axios.get<TGetLeadsOutput>(`/api/leads?${queryString.toString()}`);
	if (!data.data.default) throw new Error("Leads não encontrados.");
	return data.data.default;
}

type TUseLeadsParams = {
	initialFilters?: TGetManyLeadsInput;
};
export function useLeads({ initialFilters }: TUseLeadsParams = {}) {
	const [filters, setFilters] = useState<TGetManyLeadsInput>({
		page: initialFilters?.page ?? 1,
		search: initialFilters?.search ?? null,
		periodAfter: initialFilters?.periodAfter ?? null,
		periodBefore: initialFilters?.periodBefore ?? null,
		periodField: initialFilters?.periodField ?? null,
		qualifiersIds: initialFilters?.qualifiersIds ?? null,
		ufs: initialFilters?.ufs ?? null,
		cities: initialFilters?.cities ?? null,
		pendingQualification: initialFilters?.pendingQualification ?? null,
		pendingContact: initialFilters?.pendingContact ?? null,
	});

	function updateFilters(newFilters: Partial<TGetManyLeadsInput>) {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	}

	const debouncedFilters = useDebounceMemo(filters, 500);
	return {
		...useQuery({
			queryKey: ["leads", debouncedFilters],
			queryFn: () => fetchLeads(debouncedFilters),
		}),
		queryKey: ["leads", debouncedFilters],
		filters,
		updateFilters,
	};
}

async function fetchLeadById({ id }: { id: string }) {
	const { data } = await axios.get<TGetLeadsOutput>(`/api/leads?id=${id}`);
	if (!data.data.byId) throw new Error("Lead não encontrado.");
	return data.data.byId;
}

type TUseLeadByIdParams = {
	id: string;
};
export function useLeadById({ id }: TUseLeadByIdParams) {
	return {
		...useQuery({
			queryKey: ["lead-by-id", id],
			queryFn: () => fetchLeadById({ id }),
		}),
		queryKey: ["lead-by-id", id],
	};
}

async function fetchLeadsStats(input: TGetLeadsStatsInput) {
	const queryParams = new URLSearchParams();
	if (input.periodAfter) queryParams.set("periodAfter", input.periodAfter);
	if (input.periodBefore) queryParams.set("periodBefore", input.periodBefore);
	if (input.qualifiersIds && input.qualifiersIds.length > 0) queryParams.set("qualifiersIds", input.qualifiersIds.join(","));

	const { data } = await axios.get<TGetLeadsStatsRouteOutput>(`/api/leads/stats?${queryParams.toString()}`);
	return data.data;
}

type TUseLeadsStatsParams = {
	initialFilters?: TGetLeadsStatsInput;
};
export function useLeadsStats({ initialFilters }: TUseLeadsStatsParams = {}) {
	const monthStart = dayjs().startOf("month").toISOString();
	const monthEnd = dayjs().endOf("month").toISOString();
	const [filters, setFilters] = useState<TGetLeadsStatsInput>({
		periodAfter: initialFilters?.periodAfter ?? monthStart,
		periodBefore: initialFilters?.periodBefore ?? monthEnd,
		qualifiersIds: initialFilters?.qualifiersIds ?? [],
	});

	const debouncedFilters = useDebounceMemo(filters, 500);
	function updateFilters(newFilters: Partial<TGetLeadsStatsInput>) {
		setFilters((prev) => ({ ...prev, ...newFilters }));
	}

	return {
		...useQuery({
			queryKey: ["leads-stats", debouncedFilters],
			queryFn: () => fetchLeadsStats(debouncedFilters),
		}),
		queryKey: ["leads-stats", debouncedFilters],
		filters,
		updateFilters,
	};
}
