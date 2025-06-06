import type { TOverallResults } from "@/app/api/stats/comercial-results/overall/route";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatDecimalPlaces } from "@/lib/methods/formatting";
import React from "react";
import { BsMegaphoneFill } from "react-icons/bs";
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis } from "recharts";

type AcquisitionChannelsProps = {
	stats: TOverallResults["porCanalAquisicao"];
};
function AcquisitionChannels({ stats }: AcquisitionChannelsProps) {
	const Collors = ["#15599a", "#fead41", "#ff595e", "#8ac926", "#6a4c93", "#5adbff", "#9b2226", "#ff8fab", "#480ca8"];

	const acquiredData = Object.entries(stats).map(([key, value], index) => ({ channel: key, acquired: value.adquiridos, fill: Collors[index] || "#000" }));
	const wonData = Object.entries(stats).map(([key, value], index) => ({ channel: key, won: value.ganhos, fill: Collors[index] || "#000" }));
	const convertionData = Object.entries(stats).map(([key, value], index) => ({
		channel: key,
		convertion: (value.ganhos * 100) / value.adquiridos,
		fill: Collors[index] || "#000",
	}));

	const chartConfig = {
		acquired: { label: "ADQUIRIDOS" },
		won: { label: "GANHOS" },
		convertion: { label: "CONVERSÃO" },
	};
	return (
		<div className="mt-2 flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm">
			<div className="flex items-center justify-between">
				<h1 className="text-sm font-medium uppercase tracking-tight">CANAIS DE AQUISIÇÃO</h1>
				<BsMegaphoneFill />
			</div>
			<div className="mt-4 flex w-full flex-col flex-wrap items-start justify-center gap-2 md:flex-row lg:justify-around">
				<div className="flex flex-col rounded border border-black p-3">
					<h1 className="font-bold tracking-tight">OPORTUNIDADES ADQUIRIDAS</h1>
					<ChartContainer config={chartConfig} className="h-[350px] w-[450px]">
						<PieChart>
							<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
							<Pie data={acquiredData} dataKey="acquired" nameKey="channel" innerRadius={60} />
							<ChartLegend content={<ChartLegendContent color="#000" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
						</PieChart>
					</ChartContainer>
				</div>
				<div className="flex flex-col rounded border border-black p-3">
					<h1 className="font-bold tracking-tight">OPORTUNIDADES GANHAS</h1>
					<ChartContainer config={chartConfig} className="h-[350px] w-[450px]">
						<PieChart>
							<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
							<Pie data={wonData} dataKey="won" nameKey="channel" innerRadius={60} />
							<ChartLegend content={<ChartLegendContent color="#000" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
						</PieChart>
					</ChartContainer>
				</div>
				<div className="flex flex-col rounded border border-black p-3">
					<h1 className="font-bold tracking-tight">TAXA DE CONVERSÃO</h1>
					<ChartContainer config={chartConfig} className="h-[350px] w-[450px]">
						<BarChart
							accessibilityLayer
							data={convertionData.sort((a, b) => b.convertion - a.convertion)}
							layout="vertical"
							margin={{
								left: 35,
							}}
						>
							<YAxis
								dataKey="channel"
								type="category"
								tickLine={false}
								tickMargin={0}
								axisLine={false}
								// tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label}
							/>
							<XAxis dataKey="convertion" type="number" hide />
							<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel labelFormatter={(value) => `${formatDecimalPlaces(value)}%`} />} />
							<Bar dataKey="convertion" layout="vertical" radius={5} />
						</BarChart>
					</ChartContainer>
					{/* <ChartContainer config={chartConfig} className="h-[350px] w-[450px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie data={convertionData} dataKey="convertion" nameKey="channel" innerRadius={60} />
              <ChartLegend content={<ChartLegendContent color="#000" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
            </PieChart>
          </ChartContainer> */}
				</div>
			</div>
		</div>
	);
}

export default AcquisitionChannels;
