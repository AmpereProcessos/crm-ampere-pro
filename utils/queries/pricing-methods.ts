import axios from "axios";
import { TPricingMethodDTO } from "../schemas/pricing-method.schema";
import { useQuery } from "@tanstack/react-query";

export async function fetchPricingMethods() {
	try {
		const { data } = await axios.get("/api/pricing-methods");
		return data.data as TPricingMethodDTO[];
	} catch (error) {
		throw error;
	}
}

export function usePricingMethods() {
	return useQuery({
		queryKey: ["pricing-methods"],
		queryFn: fetchPricingMethods,
	});
}

export async function fetchPricingMethodById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/pricing-methods?id=${id}`);
		return data.data as TPricingMethodDTO;
	} catch (error) {
		throw error;
	}
}

export function usePricingMethodById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["pricing-method-by-id", id],
		queryFn: async () => fetchPricingMethodById({ id }),
		refetchOnWindowFocus: false,
	});
}
