import type { TGetCreditorsResultOutput } from "@/app/api/stats/comercial-results/creditors/route";
import { Button } from "@/components/ui/button";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDecimalPlaces, formatToMoney } from "@/lib/methods/formatting";
import { useCreditorsResults } from "@/utils/queries/stats/creditor";
import { BadgeDollarSign, CircleCheck, Landmark } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis } from "recharts";
const COLLORS = [
	"#15599a",
	"#fead41",
	"#ff595e",
	"#8ac926",
	"#6a4c93",
	"#5adbff",
	"#9b2226",
	"#ff8fab",
	"#480ca8",
];

type CreditorsResultsProps = {
	after: string;
	before: string;
	responsibles: string[] | null;
	partners: string[] | null;
	projectTypes: string[] | null;
};
export default function CreditorsResults({
	after,
	before,
	responsibles,
	partners,
	projectTypes,
}: CreditorsResultsProps) {
	const { data: stats } = useCreditorsResults({
		after,
		before,
		responsibles,
		partners,
		projectTypes,
	});

	console.log("[creditors] stats", stats);

	return (
		<div className="mt-2 flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md">
			<div className="flex items-center justify-between">
				<h1 className="text-sm font-medium uppercase tracking-tight">CREDOR</h1>
				<Landmark className="w-4 h-4 min-w-4 min-h-4" />
			</div>
			<div className="mt-2 flex w-full flex-col items-center justify-around gap-2 lg:flex-row">
				<div className="flex w-full flex-col rounded-xl border border-primary/30 bg-background px-3 py-4 shadow-md lg:w-1/2">
					<div className="flex items-center justify-between">
						<h1 className="text-sm font-medium uppercase tracking-tight">
							Projetos Vendidos
						</h1>
						<CircleCheck className="w-4 h-4 min-w-4 min-h-4" />
					</div>
					<div className="mt-2 flex w-full flex-col">
						<div className="text-2xl font-bold text-[#15599a]">
							{stats?.projetosVendidos || 0}
						</div>
					</div>
				</div>
				<div className="flex w-full flex-col rounded-xl border border-primary/30 bg-background px-3 py-4 shadow-md lg:w-1/2">
					<div className="flex items-center justify-between">
						<h1 className="text-sm font-medium uppercase tracking-tight">
							Valor Vendido
						</h1>
						<BadgeDollarSign className="w-4 h-4 min-w-4 min-h-4" />
					</div>
					<div className="mt-2 flex w-full flex-col">
						<div className="text-2xl font-bold text-[#15599a]">
							{formatToMoney(stats?.totalVendido || 0)}
						</div>
					</div>
				</div>
			</div>
			<div className="mt-4 flex w-full flex-col flex-wrap items-start justify-center gap-2 md:flex-row lg:justify-around">
				<CreditorGroupParticipationChart data={stats?.porCredor || []} />
				<CreditorOverallParticipationChart data={stats?.porCredor || []} />
				<CreditorAggregateChart data={stats?.porCredor || []} />
			</div>
		</div>
	);
}

type CreditorValueParticipationChartProps = {
	data: TGetCreditorsResultOutput["data"]["porCredor"];
};
function CreditorGroupParticipationChart({
	data,
}: CreditorValueParticipationChartProps) {
	const [groupType, setGroupType] = useState<"quantity" | "total">("quantity");

	const METRIC_LABELS = {
		quantity: {
			icon: <CircleCheck className="w-4 h-4 min-w-4 min-h-4" />,
			title: "PROJETOS VENDIDOS",
		},
		total: {
			icon: <BadgeDollarSign className="w-4 h-4 min-w-4 min-h-4" />,
			title: "VALOR VENDIDO",
		},
	};
	const chartConfig = {
		creditor: { label: "CREDOR" },
		quantity: { label: "PROJETOS VENDIDOS" },
		total: { label: "VALOR VENDIDO" },
		quantityGroupPercentage: { label: "QUANTIDADE GRUPO %" },
		quantityOverallPercentage: { label: "QUANTIDADE TOTAL %" },
		totalGroupPercentage: { label: "TOTAL GRUPO %" },
		totalOverallPercentage: { label: "TOTAL TOTAL %" },
	};
	const byCreditorData =
		data.map((creditor, index) => ({
			...creditor,
			fill: COLLORS[index] || "#000",
		})) ?? [];
	return (
		<div className="flex flex-col rounded-sm border border-black p-3 min-w-0">
			<div className="flex items-center justify-between gap-2">
				<h1 className="font-bold tracking-tight">
					PARTICIPAÇÃO POR CREDOR (GRUPO)
				</h1>
				<div className="flex justify-end">
					<div className="flex items-center gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={groupType === "quantity" ? "default" : "ghost"}
									size="fit"
									className="rounded-lg p-2"
									onClick={() => setGroupType("quantity")}
								>
									{METRIC_LABELS.quantity.icon}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{METRIC_LABELS.quantity.title}</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={groupType === "total" ? "default" : "ghost"}
									size="fit"
									className="rounded-lg p-2"
									onClick={() => setGroupType("total")}
								>
									{METRIC_LABELS.total.icon}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{METRIC_LABELS.total.title}</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
			</div>

			<ChartContainer
				config={chartConfig}
				className="h-[250px] lg:h-[350px] w-full min-w-0 aspect-auto"
			>
				<PieChart>
					<ChartTooltip
						cursor={false}
						content={<ChartTooltipContent hideLabel />}
					/>
					<Pie
						data={byCreditorData}
						dataKey={
							groupType === "quantity"
								? "quantityGroupPercentage"
								: "totalGroupPercentage"
						}
						nameKey="creditor"
						innerRadius={60}
					/>
					<ChartLegend
						content={
							<ChartLegendContent color="#000" payload={byCreditorData} />
						}
						className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
					/>
				</PieChart>
			</ChartContainer>
		</div>
	);
}
type CreditorOverallParticipationChartProps = {
	data: TGetCreditorsResultOutput["data"]["porCredor"];
};
function CreditorOverallParticipationChart({
	data,
}: CreditorOverallParticipationChartProps) {
	const [groupType, setGroupType] = useState<"quantity" | "total">("quantity");

	const METRIC_LABELS = {
		quantity: {
			icon: <CircleCheck className="w-4 h-4 min-w-4 min-h-4" />,
			title: "PROJETOS VENDIDOS",
		},
		total: {
			icon: <BadgeDollarSign className="w-4 h-4 min-w-4 min-h-4" />,
			title: "VALOR VENDIDO",
		},
	};
	const chartConfig = {
		creditor: { label: "CREDOR" },
		quantity: { label: "PROJETOS VENDIDOS" },
		total: { label: "VALOR VENDIDO" },
		quantityGroupPercentage: { label: "QUANTIDADE GRUPO %" },
		quantityOverallPercentage: { label: "QUANTIDADE TOTAL %" },
		totalGroupPercentage: { label: "TOTAL GRUPO %" },
		totalOverallPercentage: { label: "TOTAL TOTAL %" },
	};
	const byCreditorData =
		data.map((creditor, index) => ({
			...creditor,
			fill: COLLORS[index] || "#000",
		})) ?? [];
	return (
		<div className="flex flex-col rounded-sm border border-black p-3 min-w-0">
			<div className="flex items-center justify-between gap-2">
				<h1 className="font-bold tracking-tight">
					PARTICIPAÇÃO POR CREDOR (GERAL)
				</h1>
				<div className="flex justify-end">
					<div className="flex items-center gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={groupType === "quantity" ? "default" : "ghost"}
									size="fit"
									className="rounded-lg p-2"
									onClick={() => setGroupType("quantity")}
								>
									{METRIC_LABELS.quantity.icon}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{METRIC_LABELS.quantity.title}</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={groupType === "total" ? "default" : "ghost"}
									size="fit"
									className="rounded-lg p-2"
									onClick={() => setGroupType("total")}
								>
									{METRIC_LABELS.total.icon}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{METRIC_LABELS.total.title}</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
			</div>

			<ChartContainer
				config={chartConfig}
				className="h-[250px] lg:h-[350px] w-full min-w-0 aspect-auto"
			>
				<PieChart>
					<ChartTooltip
						cursor={false}
						content={<ChartTooltipContent hideLabel />}
					/>
					<Pie
						data={byCreditorData}
						dataKey={
							groupType === "quantity"
								? "quantityOverallPercentage"
								: "totalOverallPercentage"
						}
						nameKey="creditor"
						innerRadius={60}
					/>
					<ChartLegend
						content={
							<ChartLegendContent color="#000" payload={byCreditorData} />
						}
						className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
					/>
				</PieChart>
			</ChartContainer>
		</div>
	);
}

function CreditorAggregateChart({
	data,
}: { data: TGetCreditorsResultOutput["data"]["porCredor"] }) {
	const [groupType, setGroupType] = useState<"quantity" | "total">("quantity");

	const METRIC_LABELS = {
		quantity: {
			icon: <CircleCheck className="w-4 h-4 min-w-4 min-h-4" />,
			title: "PROJETOS VENDIDOS",
		},
		total: {
			icon: <BadgeDollarSign className="w-4 h-4 min-w-4 min-h-4" />,
			title: "VALOR VENDIDO",
		},
	};
	const chartConfig = {
		creditor: { label: "CREDOR" },
		quantity: { label: "PROJETOS VENDIDOS" },
		total: { label: "VALOR VENDIDO" },
		quantityGroupPercentage: { label: "QUANTIDADE GRUPO %" },
		quantityOverallPercentage: { label: "QUANTIDADE TOTAL %" },
		totalGroupPercentage: { label: "TOTAL GRUPO %" },
		totalOverallPercentage: { label: "TOTAL TOTAL %" },
	};
	const byCreditorData =
		data.map((creditor, index) => ({
			...creditor,
			fill: COLLORS[index] || "#000",
		})) ?? [];
	return (
		<div className="flex flex-col rounded-sm border border-black p-3 min-w-0">
			<div className="flex items-center justify-between gap-2">
				<h1 className="font-bold tracking-tight">
					PARTICIPAÇÃO POR CREDOR (GERAL)
				</h1>
				<div className="flex justify-end">
					<div className="flex items-center gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={groupType === "quantity" ? "default" : "ghost"}
									size="fit"
									className="rounded-lg p-2"
									onClick={() => setGroupType("quantity")}
								>
									{METRIC_LABELS.quantity.icon}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{METRIC_LABELS.quantity.title}</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={groupType === "total" ? "default" : "ghost"}
									size="fit"
									className="rounded-lg p-2"
									onClick={() => setGroupType("total")}
								>
									{METRIC_LABELS.total.icon}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{METRIC_LABELS.total.title}</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
			</div>

			<ChartContainer
				config={chartConfig}
				className="h-[250px] lg:h-[350px] w-full min-w-0 aspect-auto"
			>
				<BarChart
					accessibilityLayer
					data={byCreditorData.sort((a, b) => {
						if (groupType === "quantity") {
							return b.quantity - a.quantity;
						}
						return b.total - a.total;
					})}
					layout="vertical"
					margin={{
						left: 35,
					}}
				>
					<YAxis
						dataKey="creditor"
						type="category"
						tickLine={false}
						tickMargin={0}
						axisLine={false}
						// tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label}
					/>
					<XAxis
						dataKey={groupType === "quantity" ? "quantity" : "total"}
						type="number"
						hide
					/>
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								hideLabel
								labelFormatter={(value) => `${formatDecimalPlaces(value)}%`}
							/>
						}
					/>
					<Bar
						dataKey={groupType === "quantity" ? "quantity" : "total"}
						radius={5}
					/>
				</BarChart>
			</ChartContainer>
		</div>
	);
}
