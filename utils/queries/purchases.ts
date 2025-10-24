import axios from "axios";
import { TPersonalizedPurchaseFilters, TPurchaseDTO, TPurchaseWithProjectDTO } from "../schemas/purchase.schema";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TPurchasesByFiltersResult } from "@/pages/api/purchases/search";

async function fetchPurchaseById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/purchases?id=${id}`);
		return data.data as TPurchaseWithProjectDTO;
	} catch (error) {
		throw error;
	}
}

export function usePurchaseById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["purchase-by-id", id],
		queryFn: async () => fetchPurchaseById({ id }),
	});
}

async function fetchPurchasesByProjectId({ projectId }: { projectId: string }) {
	try {
		const { data } = await axios.get(`/api/purchases?projectId=${projectId}`);
		return data.data as TPurchaseDTO[];
	} catch (error) {
		throw error;
	}
}

export function usePurchasesByProjectId({ projectId }: { projectId: string }) {
	return useQuery({
		queryKey: ["purchase-by-project-id", projectId],
		queryFn: async () => await fetchPurchasesByProjectId({ projectId }),
	});
}

async function fetchPurchases() {
	try {
		const { data } = await axios.get("/api/purchases");
		return data.data as TPurchaseDTO[];
	} catch (error) {
		throw error;
	}
}

export function usePurchases() {
	return useQuery({
		queryKey: ["purchases"],
		queryFn: async () => fetchPurchases(),
	});
}

type FetchPurchasesByPersonalizedFiltersParams = {
	page: number;
	partners: string[] | null;
	filters: TPersonalizedPurchaseFilters;
};
async function fetchPurchasesByPersonalizedFilters({ page, partners, filters }: FetchPurchasesByPersonalizedFiltersParams) {
	try {
		const { data } = await axios.post(`/api/purchases/search?page=${page}`, { partners, filters });
		return data.data as TPurchasesByFiltersResult;
	} catch (error) {
		throw error;
	}
}

type UsePurchasesByPersonalizedFiltersParams = {
	page: number;
	partners: string[] | null;
};

export function usePurchasesByPersonalizedFilters({ page, partners }: UsePurchasesByPersonalizedFiltersParams) {
	const [filters, setFilters] = useState<TPersonalizedPurchaseFilters>({
		title: "",
		status: [],
		state: [],
		city: [],
		pendingOrder: false,
		pendingInvoicing: false,
		pendingDelivery: false,
		deliveryStatus: [],
		period: { after: null, before: null, field: null },
		pendingConclusion: false,
	});
	function updateFilters(filters: TPersonalizedPurchaseFilters) {
		setFilters(filters);
	}

	return {
		...useQuery({
			queryKey: ["purchases-by-personalized-filters", page, partners, filters],
			queryFn: async () => await fetchPurchasesByPersonalizedFilters({ page, partners, filters }),
		}),
		updateFilters,
	};
}
