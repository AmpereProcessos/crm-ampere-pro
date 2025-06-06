import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { TClient, TClientDTO, TClientDTOSimplified, TPersonalizedClientsFilter, TSimilarClientSimplifiedDTO } from "../schemas/client.schema";
import { useState } from "react";
import { formatWithoutDiacritics } from "@/lib/methods/formatting";
import type { Filter } from "mongodb";
import type { TGetSimilarClientsRouteOutput, TGetClientsByFiltersRouteOutput, TClientsByFilterResult } from "@/app/api/clients/search/route";
import type { TGetClientsRouteOutput } from "@/app/api/clients/route";

type SearchClientsParams = {
	cpfCnpj: string;
	phoneNumber: string;
	email: string;
};

async function searchClients({ cpfCnpj, phoneNumber, email }: SearchClientsParams) {
	const { data }: { data: TGetSimilarClientsRouteOutput } = await axios.get(`/api/clients/search?cpfCnpj=${cpfCnpj}&phoneNumber=${phoneNumber}&email=${email}`);
	return data.data.similarClients;
}

type UseSearchClientParams = {
	enabled: boolean;
	cpfCnpj: string;
	phoneNumber: string;
	email: string;
};

export function useSearchClients({ enabled, cpfCnpj, phoneNumber, email }: UseSearchClientParams) {
	return useQuery({
		queryKey: ["search-clients"],
		queryFn: async () => await searchClients({ cpfCnpj, phoneNumber, email }),
		enabled: !!enabled,
	});
}

async function fetchClientById({ id }: { id: string }) {
	const { data }: { data: TGetClientsRouteOutput } = await axios.get(`/api/clients?id=${id}`);
	return data.data.byId;
}

export function useClientById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["client", id],
		queryFn: async () => await fetchClientById({ id }),
	});
}

async function fetchClients({ author }: { author: string | null }) {
	const { data }: { data: TGetClientsRouteOutput } = await axios.get(`/api/clients?author=${author}`);
	return data.data.default;
}

type UseClientsFilters = {
	search: string;
	city: string[];
};

export function useClients({ author }: { author: string | null }) {
	const [filters, setFilters] = useState<UseClientsFilters>({
		search: "",
		city: [],
	});

	function matchSearch(client: TClientDTO) {
		if (filters.search.trim().length === 0) return true;
		return formatWithoutDiacritics(client.nome, true).includes(formatWithoutDiacritics(filters.search, true));
	}

	function matchCity(client: TClientDTO) {
		if (filters.city.length === 0) return true;
		return filters.city.includes(client.cidade);
	}

	function handleModelData(data: TClientDTO[]) {
		const modeledData = data;
		return modeledData.filter((client) => matchSearch(client) && matchCity(client));
	}

	return {
		...useQuery({
			queryKey: ["clients"],
			queryFn: async () => await fetchClients({ author }),
			select: (data) => handleModelData((data as unknown as TClientDTO[]) || []),
		}),
		filters,
		setFilters,
	};
}

type FetchClientsByPersonalizedFiltersParams = {
	after: string | null;
	before: string | null;
	page: number;
	authors: string[] | null;
	partners: string[] | null;
	filters: Filter<TClient>;
};

async function fetchClientsByPersonalizedFilters({ after, before, page, authors, partners, filters }: FetchClientsByPersonalizedFiltersParams) {
	const { data }: { data: TGetClientsByFiltersRouteOutput } = await axios.post(`/api/clients/search?after=${after}&before=${before}&page=${page}`, { authors, partners, filters });

	return data.data;
}

type UseClientsByPersonalizedFiltersParams = {
	after: string | null;
	before: string | null;
	page: number;
	authors: string[] | null;
	partners: string[] | null;
};

export function useClientsByPersonalizedFilters({ after, before, page, authors, partners }: UseClientsByPersonalizedFiltersParams) {
	const [filters, setFilters] = useState<TPersonalizedClientsFilter>({
		name: "",
		phone: "",
		city: [],
		acquisitionChannel: [],
	});

	function updateFilters(filters: TPersonalizedClientsFilter) {
		setFilters(filters);
	}

	return {
		...useQuery({
			queryKey: ["clients-by-personalized-filters", after, before, page, authors, partners, filters],
			queryFn: async () =>
				fetchClientsByPersonalizedFilters({
					after,
					before,
					page,
					authors,
					partners,
					filters,
				}),
		}),
		filters,
		updateFilters,
	};
}
