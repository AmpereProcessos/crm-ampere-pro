import axios from "axios";
import { TPartnerDTO, TPartnerDTOWithUsers, TPartnerEntity, TPartnerSimplifiedDTO } from "../schemas/partner.schema";
import { useQuery } from "@tanstack/react-query";

async function fetchPartnerById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/partners?id=${id}`);
		return data.data as TPartnerDTO;
	} catch (error) {
		throw error;
	}
}
export function usePartnerById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["partner-by-id", id],
		queryFn: async () => await fetchPartnerById({ id }),
		refetchOnWindowFocus: true,
	});
}

async function fetchPartners() {
	try {
		const { data } = await axios.get(`/api/partners`);
		return data.data as TPartnerDTOWithUsers[];
	} catch (error) {
		throw error;
	}
}
export function usePartners() {
	return useQuery({
		queryKey: ["partners"],
		queryFn: fetchPartners,
		refetchOnWindowFocus: true,
	});
}

async function fetchPartnerOwnInfo({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/partners/simplified?id=${id}`);
		return data.data as TPartnerSimplifiedDTO;
	} catch (error) {
		throw error;
	}
}

export function usePartnerOwnInfo({ id }: { id: string }) {
	return useQuery({
		queryKey: ["partner-onw-info", id],
		queryFn: async () => await fetchPartnerOwnInfo({ id }),
	});
}

async function fetchPartnersSimplified() {
	try {
		const { data } = await axios.get(`/api/partners/simplified`);
		return data.data as TPartnerSimplifiedDTO[];
	} catch (error) {
		throw error;
	}
}

export function usePartnersSimplified() {
	return useQuery({
		queryKey: ["partners-simplified"],
		queryFn: fetchPartnersSimplified,
	});
}
