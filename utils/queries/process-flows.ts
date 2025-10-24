import axios from "axios";
import { TProcessFlow, TProcessFlowDTO } from "../schemas/process-flow.schema";
import { useQuery } from "@tanstack/react-query";

async function fetchProcessFlows() {
	try {
		const { data } = await axios.get(`/api/process-flows`);
		return data.data as TProcessFlowDTO[];
	} catch (error) {
		throw error;
	}
}

export function useProcessFlows() {
	return useQuery({
		queryKey: ["process-flows"],
		queryFn: fetchProcessFlows,
	});
}
