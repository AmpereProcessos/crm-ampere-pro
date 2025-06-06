import { serve } from "@novu/framework/next";
import { notfiyNewOpportunityToResponsibles } from "@/services/novu/workflows";

export const { GET, POST, OPTIONS } = serve({ workflows: [notfiyNewOpportunityToResponsibles] });
