import { useSession } from "@/app/providers/SessionProvider";
import OpportunitiesKanbanModePageV2 from "@/components/Opportunities/OpportunitiesKanbanModePageV2";
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import FullScreenWrapper from "@/components/Wrappers/FullScreenWrapper";
import { useOpportunitiesKanbanView, useOpportunitiesQueryDefinitions } from "@/utils/queries/opportunities";
import { Loader2 } from "lucide-react";
import { BarChart, XAxis, CartesianGrid, YAxis, Bar } from "recharts";

function Teste() {
	const { session, status } = useSession({ required: true });
	const { data: queryDefinitions } = useOpportunitiesQueryDefinitions();

	if (status !== "authenticated") return null;
	return (
		<FullScreenWrapper>
			{queryDefinitions ? (
				<OpportunitiesKanbanModePageV2 session={session} opportunityViewPreferences={queryDefinitions} />
			) : (
				<div className="flex h-full w-full items-center justify-center">
					<Loader2 className="h-10 w-10 animate-spin" />
				</div>
			)}
		</FullScreenWrapper>
	);
}

export default Teste;
