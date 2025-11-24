import { type AnyBulkWriteOperation, ObjectId } from "mongodb";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";

export default apiHandler({
	GET: async (req, res) => {
		const db = await connectToDatabase();
		const opportunitiesCollection = db.collection<TOpportunity>("opportunities");

		const opportunitiesMissingActiveProposalId = await opportunitiesCollection.find({ idPropostaAtiva: null, "ganho.idProposta": { $ne: null } }).toArray();
		console.log(opportunitiesMissingActiveProposalId.length);

		const bulkwriteOpportunitiesArr: AnyBulkWriteOperation<TOpportunity>[] = opportunitiesMissingActiveProposalId.map((opportunity) => {
			return {
				updateOne: {
					filter: { _id: new ObjectId(opportunity._id) },
					update: { $set: { idPropostaAtiva: opportunity.ganho.idProposta } },
				},
			};
		});
		const bulkwriteOpportunitiesResult = await opportunitiesCollection.bulkWrite(bulkwriteOpportunitiesArr);
		console.log(bulkwriteOpportunitiesResult);
		return res.status(200).json({ bulkwriteOpportunitiesResult });
	},
});
