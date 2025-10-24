import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
async function fetchProjects() {
	try {
		const { data } = await axios.get("/api/integration/app-ampere/projects");
		return data.data;
	} catch (error) {
		throw error;
	}
}

export function useOperationProjects() {
	const [filters, setFilters] = useState({
		search: "",
	});
	function matchSearch(project: any) {
		if (filters.search.trim().length == 0) return true;
		else return project.nomeDoContrato.toUpperCase().includes(filters.search.toUpperCase());
	}
	function handleModelData(data: any) {
		var modeledData = data;
		return modeledData.filter((project: any) => matchSearch(project));
	}
	return {
		...useQuery({
			queryKey: ["operation-projects"],
			queryFn: fetchProjects,
			select: (data) => handleModelData(data),
		}),
		filters,
		setFilters,
	};
}
