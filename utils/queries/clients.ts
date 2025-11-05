import type { TGetClientsRouteOutput } from "@/app/api/clients/route";
import type { TGetClientsByFiltersRouteInput, TGetClientsByPersonalizedFiltersOutput, TGetSimilarClientsRouteOutput } from "@/app/api/clients/search/route";
import { TGetVinculationClientInput, TGetVinculationClientOutput } from "@/app/api/clients/vinculate/route";
import { useDebounceMemo } from "@/lib/hooks";
import { formatWithoutDiacritics } from "@/lib/methods/formatting";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Filter } from "mongodb";
import { useState } from "react";
import type { TClient, TClientDTO } from "../schemas/client.schema";

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
	return {
		...useQuery({
			queryKey: ["client", id],
			queryFn: async () => await fetchClientById({ id }),
		}),
		queryKey: ["client", id],
	};
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

async function fetchClientsByPersonalizedFilters(input: TGetClientsByFiltersRouteInput) {
	const { data } = await axios.post<TGetClientsByPersonalizedFiltersOutput>(`/api/clients/search`, input);
	return data.data;
}

type UseClientsByPersonalizedFiltersParams = {
	initialFilters?: Partial<TGetClientsByFiltersRouteInput>;
};

export function useClientsByPersonalizedFilters({ initialFilters }: UseClientsByPersonalizedFiltersParams) {
	const [filters, setFilters] = useState<TGetClientsByFiltersRouteInput>({
		page: initialFilters?.page ?? 1,
		search: initialFilters?.search ?? null,
		ufs: initialFilters?.ufs ?? [],
		cities: initialFilters?.cities ?? [],
		authorIds: initialFilters?.authorIds ?? [],
	});

	function updateFilters(changes: Partial<TGetClientsByFiltersRouteInput>) {
		setFilters((prev) => ({ ...prev, ...changes }));
	}

	const debouncedSearch = useDebounceMemo({ search: filters.search ?? "" }, 500);

	const finalFilters = {
		...filters,
		...debouncedSearch,
	};
	return {
		...useQuery({
			queryKey: ["clients-by-personalized-filters", finalFilters],
			queryFn: async () => fetchClientsByPersonalizedFilters(finalFilters),
		}),
		queryKey: ["clients-by-personalized-filters", finalFilters],
		updateFilters,
		filters,
	};
}

async function fetchVinculationClient(input: TGetVinculationClientInput) {
	const searchParams = new URLSearchParams();
	searchParams.set("phone", input.phone);
	searchParams.set("cpfCnpj", input.cpfCnpj);
	const { data } = await axios.get<TGetVinculationClientOutput>(`/api/clients/vinculate?${searchParams.toString()}`);
	return data.data;
}

type UseVinculationClientParams = TGetVinculationClientInput;
export function useVinculationClient(input: UseVinculationClientParams) {
	const debouncedParams = useDebounceMemo(input, 500);
	return useQuery({
		queryKey: ["vinculation-client", debouncedParams],
		queryFn: async () => await fetchVinculationClient(debouncedParams),
		enabled: debouncedParams.cpfCnpj.length >= 14 || debouncedParams.phone.length >= 14,
		retry: false,
	});
}
