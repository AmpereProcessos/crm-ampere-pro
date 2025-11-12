import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";

export default apiHandler({
	GET: async (req, res) => {
		return res.status(200).json("DESATIVADA");
	},
});
