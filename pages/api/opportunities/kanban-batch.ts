import type { NextApiHandler } from "next";
import { z } from "zod";

import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { getOpportunitiesKanbanView, OpportunityKanbanViewInputSchema } from "./kanban";

const OpportunityKanbanBatchInputSchema = z.object({
	requests: z.array(OpportunityKanbanViewInputSchema),
});

type TOpportunityKanbanBatchInput = z.infer<typeof OpportunityKanbanBatchInputSchema>;

type TOpportunityKanbanBatchOutput = {
	data: Awaited<ReturnType<typeof getOpportunitiesKanbanView>>["data"][];
};

const getOpportunitiesKanbanBatchHandler: NextApiHandler<TOpportunityKanbanBatchOutput> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const payload = OpportunityKanbanBatchInputSchema.parse(req.body);

	// Executa em paralelo mantendo a ordem de entrada
	const results = await Promise.all(
		payload.requests.map(async (requestPayload) => {
			const result = await getOpportunitiesKanbanView({ payload: requestPayload, session });
			return result.data;
		}),
	);

	res.status(200).json({ data: results });
};

export default apiHandler({ POST: getOpportunitiesKanbanBatchHandler });
