import { type AnyBulkWriteOperation, ObjectId } from "mongodb";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import type { TCustomField } from "@/utils/schemas/custom-fields.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TPaymentMethod } from "@/utils/schemas/payment-methods";
import type { TProjectType } from "@/utils/schemas/project-types.schema";

export default apiHandler({
	GET: async (req, res) => {
		const db = await connectToDatabase();

		const customnFieldsCollection = db.collection<TCustomField>("custom-fields");

		await customnFieldsCollection.updateMany(
			{},
			{
				$set: {
					tiposProjetos: [],
				},
			},
		);

		return res.status(200).json({ message: "Custom fields updated successfully" });
	},
});
