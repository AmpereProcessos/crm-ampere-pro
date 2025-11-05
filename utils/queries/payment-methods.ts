import axios from "axios";
import { TPaymentMethodDTO } from "../schemas/payment-methods";
import { useQuery } from "@tanstack/react-query";

export async function fetchPaymentMethods() {
	try {
		const { data } = await axios.get("/api/payment-methods");
		return data.data as TPaymentMethodDTO[];
	} catch (error) {
		throw error;
	}
}
export function usePaymentMethods() {
	return useQuery({
		queryKey: ["payment-methods"],
		queryFn: fetchPaymentMethods,
	});
}

export async function fetchPaymentMethodById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/payment-methods?id=${id}`);
		return data.data as TPaymentMethodDTO;
	} catch (error) {
		throw error;
	}
}

export function usePaymentMethodById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["payment-method-by-id", id],
		queryFn: async () => await fetchPaymentMethodById({ id }),
	});
}

type GetPaymentMethodsPersonalized = {
	methodologyIds: string[];
	kitsIds: string[];
	plansIds: string[];
	productsIds: string[];
	servicesIds: string[];
};
export async function fetchPaymentMethodsPersonalized({ methodologyIds, kitsIds, plansIds, productsIds, servicesIds }: GetPaymentMethodsPersonalized) {
	try {
		const { data } = await axios.post("/api/payment-methods/personalized", { methodologyIds, kitsIds, plansIds, productsIds, servicesIds });

		return data.data as TPaymentMethodDTO[];
	} catch (error) {
		throw error;
	}
}

export function usePaymentMethodsPersonalized({ methodologyIds, kitsIds, plansIds, productsIds, servicesIds }: GetPaymentMethodsPersonalized) {
	return useQuery({
		queryKey: ["payment-methods-personalized", methodologyIds, kitsIds, plansIds, productsIds, servicesIds],
		queryFn: async () => await fetchPaymentMethodsPersonalized({ methodologyIds, kitsIds, plansIds, productsIds, servicesIds }),
	});
}
