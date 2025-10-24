import axios from "axios";
import { TProjectType, TProjectTypeDTO } from "../schemas/project-types.schema";
import { useQuery } from "@tanstack/react-query";

async function fetchProjectTypes() {
	try {
		const { data } = await axios.get("/api/project-types");
		return data.data as TProjectTypeDTO[];
	} catch (error) {
		throw error;
	}
}

export function useProjectTypes() {
	return useQuery({
		queryKey: ["project-types"],
		queryFn: fetchProjectTypes,
	});
}

async function fetchProjectTypeById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/project-types?id=${id}`);
		return data.data as TProjectTypeDTO;
	} catch (error) {
		throw error;
	}
}

export function useProjectTypeById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["project-type-by-id", id],
		queryFn: async () => await fetchProjectTypeById({ id }),
	});
}
