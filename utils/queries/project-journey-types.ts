import axios from "axios";
import { TProjectJourneyType, TProjectJourneyTypeDTO } from "../schemas/project-journey-types";
import { useQuery } from "@tanstack/react-query";

async function fetchProjectJourneyTypeById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/project-journey-types?id=${id}`);

		return data.data as TProjectJourneyTypeDTO;
	} catch (error) {
		throw error;
	}
}

export function useProjectJourneyTypeById({ id }: { id: string }) {
	return useQuery({ queryKey: ["project-journey-type-by-id", id], queryFn: async () => await fetchProjectJourneyTypeById({ id }) });
}

async function fetchProjectJourneyTypes() {
	try {
		const { data } = await axios.get("/api/project-journey-types");
		return data.data as TProjectJourneyTypeDTO[];
	} catch (error) {
		throw error;
	}
}

export function useProjectJourneyTypes() {
	return useQuery({ queryKey: ["project-journey-types"], queryFn: fetchProjectJourneyTypes });
}
