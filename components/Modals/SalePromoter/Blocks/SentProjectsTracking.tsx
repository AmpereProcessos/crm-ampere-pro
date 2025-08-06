import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getMonthLabel } from "@/lib/methods/dates";
import { formatDateAsLocale } from "@/lib/methods/formatting";
import type { TSalePromoterResultsById } from "@/app/api/stats/comercial-results/sellers/route";
import React from "react";
import { BsCalendar, BsPatchCheck } from "react-icons/bs";
import { FaBolt } from "react-icons/fa";
import { GrSend } from "react-icons/gr";
import { VscDiffAdded } from "react-icons/vsc";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis } from "recharts";

function mergePeriodsData(
	first: {
		mes: string;
		valor: number;
	}[],
	second: {
		mes: string;
		valor: number;
	}[],
) {
	return first.map((first) => {
		// Find matching month in the second period data
		const secondData = second.find((second) => second.mes === first.mes);

		return {
			mes: first.mes, // Month label
			valorPrimeiro: first.valor, // Value from the first period
			valorSegundo: secondData?.valor || 0, // Value from the second period (default to 0 if not found)
		};
	});
}
type SentProjectsTrackingProps = {
	data: TSalePromoterResultsById;
	firstPeriodAfter: string;
	firstPeriodBefore: string;
	secondPeriodAfter: string;
	secondPeriodBefore: string;
};
function SentProjectsTracking({ data, firstPeriodAfter, firstPeriodBefore, secondPeriodAfter, secondPeriodBefore }: SentProjectsTrackingProps) {
	const chartData = mergePeriodsData(data.primeiro.projetosEnviados.mensal, data.segundo.projetosEnviados.mensal);
	const chartConfig = {
		mes: {
			label: "Mês",
			color: "#000000",
		},
		valorPrimeiro: {
			label: "Projetos Enviados do Primeiro Período",
			color: "#15599a",
		},
		valorSegundo: {
			label: "Projetos Enviados do Segundo Período",
			color: "#fead41",
		},
	} satisfies ChartConfig;
	return (
		<div className="flex w-full flex-col p-3">
			<div className="flex w-full flex-col rounded-xl border border-gray-300 bg-[#fff] p-6 shadow-md ">
				<div className="flex items-center justify-between">
					<h1 className="text-sm font-medium uppercase tracking-tight">Projetos Enviados</h1>
					<GrSend />
				</div>
				<div className="flex w-full flex-col gap-2 p-3">
					<div className="flex w-full flex-col overflow-hidden rounded border border-black p-3">
						<div className="h-[150px] w-full">
							<ChartContainer config={chartConfig} className="h-full w-full">
								<AreaChart
									accessibilityLayer
									data={chartData}
									margin={{
										left: 12,
										right: 12,
									}}
								>
									<CartesianGrid vertical={false} />
									<XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
									<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
									<Area dataKey="valorPrimeiro" type="natural" fill="#15599a" fillOpacity={0.4} stroke="#15599a" />
									<Area dataKey="valorSegundo" type="natural" fill="#fead41" fillOpacity={0.4} stroke="#fead41" />
									<ChartLegend content={<ChartLegendContent />} />
								</AreaChart>
							</ChartContainer>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SentProjectsTracking;
