import axios from "axios";
import { TSignaturePlanDTO, TSignaturePlanDTOWithPricingMethod } from "../schemas/signature-plans.schema";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatWithoutDiacritics } from "@/lib/methods/formatting";

export async function fetchSignaturePlanById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/signature-plans?id=${id}`);
		return data.data as TSignaturePlanDTOWithPricingMethod;
	} catch (error) {
		throw error;
	}
}

export function useSignaturePlanById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["comercial-plan-by-id", id],
		queryFn: async () => await fetchSignaturePlanById({ id }),
	});
}

async function fetchSignaturePlans() {
	try {
		const { data } = await axios.get("/api/signature-plans");
		return data.data as TSignaturePlanDTO[];
	} catch (error) {
		throw error;
	}
}

export type UseSignaturePlansFilters = {
	search: string;
	onlyActive: boolean;
	onlyInactive: boolean;
	intervalType: TSignaturePlanDTO["intervalo"]["tipo"] | null;
	priceOrder: "ASC" | "DESC" | null;
};
export function useSignaturePlans() {
	const [filters, setFilters] = useState<UseSignaturePlansFilters>({
		search: "",
		onlyActive: false,
		onlyInactive: false,
		intervalType: null,
		priceOrder: null,
	});
	function matchSearch(plan: TSignaturePlanDTO) {
		if (filters.search.trim().length == 0) return true;
		return formatWithoutDiacritics(plan.nome, true).includes(formatWithoutDiacritics(filters.search, true));
	}
	function matchOnlyActive(plan: TSignaturePlanDTO) {
		if (!filters.onlyActive) return true;
		return !!plan.ativo;
	}
	function matchOnlyInactive(plan: TSignaturePlanDTO) {
		if (!filters.onlyInactive) return true;
		return !plan.ativo;
	}
	function orderByPrice(plans: TSignaturePlanDTO[]) {
		var newArr;
		switch (filters.priceOrder) {
			case "ASC":
				newArr = plans.sort((a, b) => (a.preco || 0) - (b.preco || 0));
				return newArr;
			case "DESC":
				newArr = plans.sort((a, b) => (b.preco || 0) - (a.preco || 0));
				return newArr;

			default:
				return plans;
		}
	}
	function handleModelData(data: TSignaturePlanDTO[]) {
		var modeledData = data;
		modeledData = orderByPrice(modeledData);
		return modeledData.filter((plan) => matchSearch(plan) && matchOnlyActive(plan) && matchOnlyInactive(plan));
	}
	return {
		...useQuery({
			queryKey: ["signature-plans"],
			queryFn: fetchSignaturePlans,
			select: (data) => handleModelData(data),
		}),
		filters,
		setFilters,
	};
}

async function fetchSignaturePlansWithPricingMethod() {
	try {
		const { data } = await axios.get("/api/signature-plans/query");
		return data.data as TSignaturePlanDTOWithPricingMethod[];
	} catch (error) {
		throw error;
	}
}

export function useSignaturePlanWithPricingMethod() {
	return useQuery({
		queryKey: ["signature-plans-with-pricing-methods"],
		queryFn: fetchSignaturePlansWithPricingMethod,
	});
}
