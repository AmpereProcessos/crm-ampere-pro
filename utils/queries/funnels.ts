import axios from "axios";
import { TFunnelDTO, TFunnelEntity } from "../schemas/funnel.schema";
import { useQuery } from "@tanstack/react-query";

async function fetchFunnels() {
	try {
		const { data } = await axios.get("/api/funnels");
		return data.data as TFunnelDTO[];
	} catch (error) {
		throw error;
	}
}
export function useFunnels() {
	return useQuery({
		queryKey: ["funnels"],
		queryFn: fetchFunnels,
	});
}

async function fetchFunnelById({ id }: { id: string }) {
	try {
		const { data } = await axios.get(`/api/funnels?id=${id}`);
		return data.data as TFunnelDTO;
	} catch (error) {
		throw error;
	}
}

export function useFunnelById({ id }: { id: string }) {
	return useQuery({
		queryKey: ["funnel-by-id", id],
		queryFn: async () => await fetchFunnelById({ id }),
	});
}
