import axios from "axios";
import { TExpenseDTO, TExpenseDTOWithProject, TPersonalizedExpensesFilters } from "../schemas/expenses.schema";
import { useQuery } from "@tanstack/react-query";
import { TExpensesByFiltersResult } from "@/pages/api/expenses/search";
import { useState } from "react";
import { TPaymentsByFiltersResult } from "@/pages/api/expenses/payments/search";

async function fetchExpenses() {
	try {
		const { data } = await axios.get("/api/expenses");
		return data.data as TExpenseDTO[];
	} catch (error) {
		throw error;
	}
}

export function useExpenses() {
	return useQuery({
		queryKey: ["expenses"],
		queryFn: async () => fetchExpenses(),
	});
}

async function fetchExpensesByProjectId({ projectId }: { projectId: string }) {
	try {
		const { data } = await axios.get(`/api/expenses?projectId=${projectId}`);
		return data.data as TExpenseDTO[];
	} catch (error) {
		throw error;
	}
}

export function useExpensesByProjectId({ projectId }: { projectId: string }) {
	return useQuery({
		queryKey: ["expenses-by-project-id", projectId],
		queryFn: async () => await fetchExpensesByProjectId({ projectId }),
	});
}

async function fetchExpenseById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/expenses?id=${id}`);

		return data.data as TExpenseDTOWithProject;
	} catch (error) {
		throw error;
	}
}

export function useExpenseById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["expense-by-id", id],
		queryFn: async () => await fetchExpenseById({ id }),
	});
}

type FetchExpensesByPersonalizedFiltersParams = {
	page: number;
	partners: string[] | null;
	filters: TPersonalizedExpensesFilters;
};

async function fetchExpensesByPersonalizedFilters({ page, partners, filters }: FetchExpensesByPersonalizedFiltersParams) {
	try {
		const { data } = await axios.post(`/api/expenses/search?page=${page}`, { partners, filters });

		return data.data as TExpensesByFiltersResult;
	} catch (error) {
		throw error;
	}
}

type UseExpensesByPersonalizedFiltersParams = {
	page: number;
	partners: string[] | null;
};

export function useExpensesByPersonalizedFilters({ page, partners }: UseExpensesByPersonalizedFiltersParams) {
	const [filters, setFilters] = useState<TPersonalizedExpensesFilters>({
		title: "",
		category: "",
		total: {
			greater: null,
			less: null,
		},
		period: { after: null, before: null, field: null },
		pendingPartialPayment: false,
		pendingTotalPayment: false,
	});
	function updateFilters(filters: TPersonalizedExpensesFilters) {
		setFilters(filters);
	}

	return {
		...useQuery({
			queryKey: ["expenses-by-personalized-filters", page, partners, filters],
			queryFn: async () => await fetchExpensesByPersonalizedFilters({ page, partners, filters }),
		}),
		updateFilters,
	};
}

async function fetchPaymentsByPersonalizedFilters({ page }: { page: number }) {
	try {
		const { data } = await axios.post(`/api/expenses/payments/search?page=${page}`);

		return data.data as TPaymentsByFiltersResult;
	} catch (error) {
		throw error;
	}
}

export function usePaymentsByPersonalizedFilters({ page }: { page: number }) {
	return useQuery({ queryKey: ["payments-by-personalized-filters", page], queryFn: async () => await fetchPaymentsByPersonalizedFilters({ page }) });
}
