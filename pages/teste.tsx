import { Card, CardContent, CardTitle, CardHeader, CardDescription } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import FullScreenWrapper from "@/components/Wrappers/FullScreenWrapper";
import { useOpportunitiesKanbanView } from "@/utils/queries/opportunities";
import { BarChart, XAxis, CartesianGrid, YAxis, Bar } from "recharts";

function Teste() {
	const { data: kanbanView } = useOpportunitiesKanbanView({
		funnelId: "661eaeb6c387dfeddd9a23c9",
		funnelStage: "1",
		globalFilters: {
			page: 1,
			partnerIds: [],
			responsiblesIds: [],
			opportunityTypeIds: [],
			period: {},
			status: "ongoing",
			segments: [],
		},
	});
	console.log({ kanbanView });
	return <FullScreenWrapper>Hello World!</FullScreenWrapper>;
}

export default Teste;
