import { serve } from "@novu/framework/next";
import { notfiyNewOpportunityToResponsibles, notifyNewInteractionToResponsibles, notifyOpportunityTopicOnTechnicalAnalysisConcluded } from "@/services/novu/workflows";

export const { GET, POST, OPTIONS } = serve({
	workflows: [notfiyNewOpportunityToResponsibles, notifyNewInteractionToResponsibles, notifyOpportunityTopicOnTechnicalAnalysisConcluded],
});
