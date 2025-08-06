import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TRevenueStatsResults } from "@/pages/api/stats/finances/revenues";
import React from "react";
import { BsBarChartFill } from "react-icons/bs";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type PeriodReceiptsGraphProps = {
	dailyData: TRevenueStatsResults["diario"];
};
function PeriodReceiptsGraph({ dailyData }: PeriodReceiptsGraphProps) {
	const chartData = dailyData.map((d) => ({ DIA: d.dia, EFETIVO: d.efetivo, PREVISTO: d.previsto }));
	const chartConfig = {
		EFETIVO: {
			label: "RECEBIDO",
			color: "#16a34a",
		},
		PREVISTO: {
			label: "A RECEBER",
			color: "#ca8a04",
		},
	} satisfies ChartConfig;

	return (
		<div className="flex w-full flex-col rounded-md border border-gray-500 bg-[#fff] shadow-md">
			<div className="flex items-center justify-between p-4 text-black">
				<h1 className="text-sm font-medium uppercase tracking-tight">FLUXO DE RECEBIMENTOS</h1>
				<BsBarChartFill />
			</div>
			<div className="flex min-h-[150px] w-full flex-col px-4">
				<ChartContainer config={chartConfig} className="h-[150px] w-full">
					<BarChart accessibilityLayer data={chartData}>
						<CartesianGrid vertical={false} strokeWidth={0.2} />
						<XAxis dataKey="DIA" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 12)} />
						<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
						<Bar dataKey="EFETIVO" fill="var(--color-EFETIVO)" radius={4} />
						<Bar dataKey="PREVISTO" fill="var(--color-PREVISTO)" radius={4} />
						<ChartLegend content={<ChartLegendContent color="#000" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
					</BarChart>
				</ChartContainer>
			</div>
		</div>
	);
}

export default PeriodReceiptsGraph;
