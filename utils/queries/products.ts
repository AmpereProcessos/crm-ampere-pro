import axios from "axios";

import { useQuery } from "@tanstack/react-query";
import { TProductDTO, TProductDTOWithPricingMethod } from "../schemas/products.schema";
import { useState } from "react";
import { formatWithoutDiacritics } from "@/lib/methods/formatting";

async function fetchProducts() {
	try {
		const { data } = await axios.get("/api/products");
		return data.data as TProductDTO[];
	} catch (error) {
		throw error;
	}
}

export type UseComercialProductsFilters = {
	search: string;
	onlyActive: boolean;
	onlyInactive: boolean;
	category: string[];
	priceOrder: "ASC" | "DESC" | null;
};
export function useComercialProducts() {
	const [filters, setFilters] = useState<UseComercialProductsFilters>({
		search: "",
		onlyActive: false,
		onlyInactive: false,
		category: [],
		priceOrder: null,
	});
	function matchSearch(product: TProductDTO) {
		if (filters.search.trim().length == 0) return true;
		return formatWithoutDiacritics(`${product.fabricante} ${product.modelo}`, true).includes(formatWithoutDiacritics(filters.search, true));
	}
	function matchOnlyActive(product: TProductDTO) {
		if (!filters.onlyActive) return true;
		return !!product.ativo;
	}
	function matchOnlyInactive(product: TProductDTO) {
		if (!filters.onlyInactive) return true;
		return !product.ativo;
	}
	function matchCategory(product: TProductDTO) {
		if (filters.category.length == 0) return true;
		return filters.category.includes(product.categoria);
	}
	function orderByPrice(products: TProductDTO[]) {
		var newArr;
		switch (filters.priceOrder) {
			case "ASC":
				newArr = products.sort((a, b) => (a.preco || 0) - (b.preco || 0));
				return newArr;
			case "DESC":
				newArr = products.sort((a, b) => (b.preco || 0) - (a.preco || 0));
				return newArr;

			default:
				return products;
		}
	}
	function handleModelData(data: TProductDTO[]) {
		var modeledData = data;
		modeledData = orderByPrice(modeledData);
		return modeledData.filter((product) => matchSearch(product) && matchOnlyActive(product) && matchOnlyInactive(product) && matchCategory(product));
	}
	return {
		...useQuery({
			queryKey: ["products"],
			queryFn: fetchProducts,
			select: (data) => handleModelData(data),
		}),
		filters,
		setFilters,
	};
}

async function fetchProductById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/products?id=${id}`);
		return data.data as TProductDTO;
	} catch (error) {
		throw error;
	}
}

export function useComercialProductById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["product-by-id", id],
		queryFn: async () => await fetchProductById({ id }),
	});
}

async function fetchComercialProductsWithPricingMethod() {
	try {
		const { data } = await axios.get("/api/products/query");
		return data.data as TProductDTOWithPricingMethod[];
	} catch (error) {
		throw error;
	}
}

export function useComercialProductsWithPricingMethod() {
	return useQuery({
		queryKey: ["products-with-pricing-method"],
		queryFn: fetchComercialProductsWithPricingMethod,
	});
}
