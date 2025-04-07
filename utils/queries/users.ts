import { UseQueryResult, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { IUsuario } from "../models";
import type { TUserDTO, TUserDTOSimplified, TUserDTOWithSaleGoals, TUsersQueryFilters } from "../schemas/user.schema";
import type { TUsersWithFiltersResponse } from "@/pages/api/users/personalized";
import { useState } from "react";

async function fetchUsers() {
	try {
		const { data } = await axios.get("/api/users");
		return data.data as TUserDTO[];
	} catch (error) {
		console.log("Error running fetchUsers");
		throw error;
	}
}
export function useUsers() {
	return useQuery({
		queryKey: ["users"],
		queryFn: fetchUsers,
	});
}

async function fetchUsersWithFilters({ filters }: { filters: TUsersQueryFilters }) {
	try {
		const { data } = await axios.post("/api/users/personalized", filters);
		return data.data as TUsersWithFiltersResponse;
	} catch (error) {
		console.log("Error running fetchUsersWithFilters");
		throw error;
	}
}

export function useUsersWithFilters({ filters }: { filters: Partial<TUsersQueryFilters> }) {
	const [queryParams, setQueryParams] = useState<TUsersQueryFilters>({
		page: filters.page || 1,
		name: filters.name || "",
		email: filters.email || "",
		period: filters.period || {},
		activeOnly: filters.activeOnly || true,
		nonDeletedOnly: filters.nonDeletedOnly || true,
	});
	function updateQueryParams(newParams: Partial<TUsersQueryFilters>) {
		setQueryParams((prev) => ({ ...prev, ...newParams }));
	}
	const query = useQuery({
		queryKey: ["users-with-filters", queryParams],
		queryFn: async () => await fetchUsersWithFilters({ filters: queryParams }),
	});
	return { ...query, queryParams, updateQueryParams };
}
async function fetchUserById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/users?id=${id}`);
		return data.data as TUserDTO;
	} catch (error) {
		console.log("Error running fetchUserById");
		throw error;
	}
}

type UseUserByIdParams = {
	id: string;
};
export function useUserById({ id }: UseUserByIdParams) {
	return useQuery({
		queryKey: ["user-by-id", id],
		queryFn: async () => await fetchUserById({ id }),
	});
}

async function fetchOpportunityCreators() {
	try {
		const { data } = await axios.get("/api/users/personalized?type=opportunity-creators");
		return data.data as TUserDTOSimplified[];
	} catch (error) {
		console.log("Error running fetchOpportunityCreators");
		throw error;
	}
}
export function useOpportunityCreators() {
	return useQuery({
		queryKey: ["opportunity-creators"],
		queryFn: fetchOpportunityCreators,
	});
}
async function fetchTechnicalAnalysis() {
	try {
		const { data } = await axios.get("/api/users/personalized?type=technical-analysts");
		return data.data as TUserDTOSimplified[];
	} catch (error) {
		console.log("Error running fetchTechnicalAnalysis");
		throw error;
	}
}
export function useTechnicalAnalysts() {
	return useQuery({
		queryKey: ["technical-analysts"],
		queryFn: fetchTechnicalAnalysis,
	});
}
async function fetchLeadReceivers() {
	try {
		const { data } = await axios.get("/api/users/personalized?type=lead-receivers");
		return data.data as TUserDTOSimplified[];
	} catch (error) {
		console.log("Error running fetchLeadReceivers");
		throw error;
	}
}
export function useLeadReceivers() {
	return useQuery({
		queryKey: ["lead-receivers"],
		queryFn: fetchLeadReceivers,
	});
}
async function fetchSalePromoters() {
	try {
		const { data } = await axios.get("/api/management/sale-promoters");
		return data.data as TUserDTOWithSaleGoals[];
	} catch (error) {
		console.log("Error running fetchSalePromoters");
		throw error;
	}
}
export function useSalePromoters() {
	return useQuery({
		queryKey: ["sale-promoters"],
		queryFn: fetchSalePromoters,
	});
}
