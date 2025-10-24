import axios from "axios";

type UpdateOpportunityParams = { operation: "OPPORTUNITY_LOST" | "SALE"; email: string; value?: number; reason?: string };
export async function updateRDOpportunity({ operation, email, value, reason }: UpdateOpportunityParams) {
	const payload = { operation, email, value, reason };
	try {
		const response = await axios.put("/api/integration/rd-station/opportunities", payload);
		return response.data;
	} catch (error) {
		throw error;
	}
}
