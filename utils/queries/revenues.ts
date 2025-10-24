import axios from "axios";
import { TPersonalizedRevenuesFilters, TRevenueDTO, TRevenueWithProjectDTO } from "../schemas/revenues.schema";
import { useQuery } from "@tanstack/react-query";
import { TRevenuesByFiltersResult } from "@/pages/api/revenues/search";
import { use, useState } from "react";
import { TReceiptsByFiltersResult } from "@/pages/api/revenues/receipts/search";

async function fetchRevenues() {
	try {
		const { data } = await axios.get("/api/revenues");
		return data.data as TRevenueDTO[];
	} catch (error) {
		throw error;
	}
}

export function useRevenues() {
	return useQuery({
		queryKey: ["revenues"],
		queryFn: async () => fetchRevenues,
	});
}

async function fetchRevenuesByProjectId({ projectId }: { projectId: string }) {
	try {
		const { data } = await axios.get(`/api/revenues?projectId=${projectId}`);
		return data.data as TRevenueDTO[];
	} catch (error) {
		throw error;
	}
}

export function useRevenuesByProjectId({ projectId }: { projectId: string }) {
	return useQuery({
		queryKey: ["revenues-by-project-id", projectId],
		queryFn: async () => await fetchRevenuesByProjectId({ projectId }),
	});
}

async function fetchRevenueById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/revenues?id=${id}`);

		return data.data as TRevenueWithProjectDTO;
	} catch (error) {
		throw error;
	}
}

export function useRevenueById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["revenue-by-id", id],
		queryFn: async () => await fetchRevenueById({ id }),
	});
}

type FetchRevenuesByPersonalizedFiltersParams = {
	page: number;
	partners: string[] | null;
	filters: TPersonalizedRevenuesFilters;
};

async function fetchRevenuesByPersonalizedFilters({ page, partners, filters }: FetchRevenuesByPersonalizedFiltersParams) {
	try {
		const { data } = await axios.post(`/api/revenues/search?page=${page}`, { partners, filters });
		return data.data as TRevenuesByFiltersResult;
	} catch (error) {
		throw error;
	}
}

type UseRevenuesByPersonalizedFiltersParams = {
	page: number;
	partners: string[] | null;
};
export function useRevenuesByPersonalizedFilters({ page, partners }: UseRevenuesByPersonalizedFiltersParams) {
	const [filters, setFilters] = useState<TPersonalizedRevenuesFilters>({
		title: "",
		category: "",
		total: {
			greater: null,
			less: null,
		},
		period: { after: null, before: null, field: null },
		pendingPartialReceipt: false,
		pendingTotalReceipt: false,
	});
	function updateFilters(filters: TPersonalizedRevenuesFilters) {
		setFilters(filters);
	}

	return {
		...useQuery({
			queryKey: ["revenues-by-personalized-filters", page, partners, filters],
			queryFn: async () => await fetchRevenuesByPersonalizedFilters({ page, partners, filters }),
		}),
		updateFilters,
	};
}
async function fetchReceiptsByPersonalizedFilters({ page }: { page: number }) {
	try {
		const { data } = await axios.post(`/api/revenues/receipts/search?page=${page}`);

		return data.data as TReceiptsByFiltersResult;
	} catch (error) {
		throw error;
	}
}

export function useReceiptsByPersonalizedFilters({ page }: { page: number }) {
	return useQuery({ queryKey: ["receipts-by-personalized-filters", page], queryFn: async () => await fetchReceiptsByPersonalizedFilters({ page }) });
}
