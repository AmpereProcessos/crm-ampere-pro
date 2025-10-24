import axios from "axios";
import { TServiceDTO, TServiceDTOWithPricingMethod } from "../schemas/service.schema";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatWithoutDiacritics } from "@/lib/methods/formatting";

async function fetchServices() {
	try {
		const { data } = await axios.get("/api/services");
		return data.data as TServiceDTO[];
	} catch (error) {
		throw error;
	}
}

export type UseComercialServicesFilters = {
	search: string;
	onlyActive: boolean;
	onlyInactive: boolean;
	priceOrder: "ASC" | "DESC" | null;
};
export function useComercialServices() {
	const [filters, setFilters] = useState<UseComercialServicesFilters>({
		search: "",
		onlyActive: false,
		onlyInactive: false,
		priceOrder: null,
	});
	function matchSearch(service: TServiceDTO) {
		if (filters.search.trim().length == 0) return true;
		return formatWithoutDiacritics(service.descricao, true).includes(formatWithoutDiacritics(filters.search, true));
	}
	function matchOnlyActive(service: TServiceDTO) {
		if (!filters.onlyActive) return true;
		return !!service.ativo;
	}
	function matchOnlyInactive(service: TServiceDTO) {
		if (!filters.onlyInactive) return true;
		return !service.ativo;
	}
	function orderByPrice(services: TServiceDTO[]) {
		var newArr;
		switch (filters.priceOrder) {
			case "ASC":
				newArr = services.sort((a, b) => (a.preco || 0) - (b.preco || 0));
				return newArr;
			case "DESC":
				newArr = services.sort((a, b) => (b.preco || 0) - (a.preco || 0));
				return newArr;

			default:
				return services;
		}
	}
	function handleModelData(data: TServiceDTO[]) {
		var modeledData = data;
		modeledData = orderByPrice(modeledData);
		return modeledData.filter((service) => matchSearch(service) && matchOnlyActive(service) && matchOnlyInactive(service));
	}
	return {
		...useQuery({
			queryKey: ["services"],
			queryFn: fetchServices,
			select: (data) => handleModelData(data),
		}),
		filters,
		setFilters,
	};
}

async function fetchServiceById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/services?id=${id}`);
		return data.data as TServiceDTO;
	} catch (error) {
		throw error;
	}
}

export function useComercialServiceById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["service-by-id", id],
		queryFn: async () => await fetchServiceById({ id }),
	});
}

async function fetchComercialServicesWithPricingMethod() {
	try {
		const { data } = await axios.get("/api/services/query");
		return data.data as TServiceDTOWithPricingMethod[];
	} catch (error) {
		throw error;
	}
}

export function useComercialServicesWithPricingMethod() {
	return useQuery({
		queryKey: ["services-with-pricing-method"],
		queryFn: fetchComercialServicesWithPricingMethod,
	});
}
