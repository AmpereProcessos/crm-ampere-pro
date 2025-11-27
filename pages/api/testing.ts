import { type AnyBulkWriteOperation, ObjectId } from "mongodb";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TPaymentMethod } from "@/utils/schemas/payment-methods";
import type { TProjectType } from "@/utils/schemas/project-types.schema";

export default apiHandler({
	GET: async (req, res) => {
		const db = await connectToDatabase();

		const projectTypesCollection = db.collection<TProjectType>("project-types");

		const updateProjectTypesResult = await projectTypesCollection.updateMany(
			{},
			{
				$set: {
					metodosPagamento: [],
				},
			},
		);

		return res.status(200).json({ updateProjectTypesResult });
	},
});
