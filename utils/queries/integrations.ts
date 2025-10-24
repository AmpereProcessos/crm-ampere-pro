import axios from "axios";
import { TIntegrationRDStation } from "../schemas/integration.schema";
import { useQuery } from "@tanstack/react-query";

async function fetchRDIntegration() {
	try {
		const { data } = await axios.get("/api/integration/rd-station");
		return data.data as TIntegrationRDStation | null;
	} catch (error) {
		throw error;
	}
}

export function useRDIntegrationConfig() {
	return useQuery({
		queryKey: ["rd-integration-config"],
		queryFn: fetchRDIntegration,
	});
}
