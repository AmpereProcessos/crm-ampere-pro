import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/lib/utils";
import { formatToMoney } from "@/utils/methods";
import type { TProposalDTOWithOpportunityAndClient } from "@/utils/schemas/proposal.schema";
import { getSalesProposalScenarios, type TSalesProposalScenarios } from "@/utils/solar";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";

type UFVEnergyEconomyAnalysisProps = {
	proposal: TProposalDTOWithOpportunityAndClient;
	closeModal: () => void;
};
function UFVEnergyEconomyAnalysis({ proposal, closeModal }: UFVEnergyEconomyAnalysisProps) {
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const analysis = getSalesProposalScenarios({
		salesProposal: proposal,
		salesProposalProducts: proposal.produtos,
		locationUf: proposal.oportunidadeDados.localizacao.uf,
		locationCity: proposal.oportunidadeDados.localizacao.cidade,
	});
	const MENU_TITLE = "ANÁLISE ECONÔMICA";
	const MENU_DESCRIPTION = "Análise econômica da proposta.";
	return isDesktop ? (
		<Dialog open onOpenChange={(v) => (!v ? closeModal() : null)}>
			<DialogContent className="flex flex-col h-fit min-h-[60vh] max-h-[70vh] min-w-[60%]">
				<DialogHeader>
					<DialogTitle>{MENU_TITLE}</DialogTitle>
					<DialogDescription>{MENU_DESCRIPTION}</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-auto">
					<TechnicalAnalysisConditionDataBlock analysis={analysis} />
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">FECHAR</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	) : (
		<Drawer open onOpenChange={(v) => (!v ? closeModal() : null)}>
			<DrawerContent className="h-fit max-h-[70vh] flex flex-col">
				<DrawerHeader className="text-left">
					<DrawerTitle>{MENU_TITLE}</DrawerTitle>
					<DrawerDescription>{MENU_DESCRIPTION}</DrawerDescription>
				</DrawerHeader>

				<div className="flex-1 overflow-auto">
					<TechnicalAnalysisConditionDataBlock analysis={analysis} />
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button variant="outline">FECHAR</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export default UFVEnergyEconomyAnalysis;

const chartConfig = {
	payback: {
		label: "Payback",
		color: "var(--chart-1)",
	},
	paybackPositive: {
		label: "Payback Positivo",
		color: "#22c55e", // green
	},
	paybackNegative: {
		label: "Payback Negativo",
		color: "#ef4444", // red
	},
	energyBill: {
		label: "Conta com Solar",
		color: "#3b82f6", // blue
	},
	conventionalBill: {
		label: "Conta Convencional",
		color: "#f59e0b", // amber
	},
	accumulatedBalance: {
		label: "Saldo Acumulado",
		color: "#8b5cf6", // purple
	},
} satisfies ChartConfig;
type TechnicalAnalysisConditionDataBlockProps = {
	analysis: TSalesProposalScenarios;
};
function TechnicalAnalysisConditionDataBlock({ analysis }: TechnicalAnalysisConditionDataBlockProps) {
	// Preparar dados para o gráfico
	const fullChartData = analysis.progression.map((item) => ({
		tag: item.Tag,
		payback: item.Payback,
		paybackPositive: item.Payback >= 0 ? item.Payback : null,
		paybackNegative: item.Payback < 0 ? item.Payback : null,
		savedValue: item.SavedValue,
		energyBill: item.EnergyBillValue,
		conventionalBill: item.ConventionalEnergyBill,
		accumulatedBalance: item.CumulatedBalance,
	}));

	// Reduzir dados para máximo de 50 pontos mantendo representação espaçada
	const maxDataPoints = 50;
	let chartData = fullChartData;

	if (fullChartData.length > maxDataPoints) {
		const step = Math.floor(fullChartData.length / (maxDataPoints - 1));
		const sampledData = [];

		// Sempre incluir o primeiro ponto
		sampledData.push(fullChartData[0]);

		// Incluir pontos espaçados
		for (let i = step; i < fullChartData.length - 1; i += step) {
			sampledData.push(fullChartData[i]);
		}

		// Sempre incluir o último ponto
		if (fullChartData.length > 1) {
			sampledData.push(fullChartData[fullChartData.length - 1]);
		}

		chartData = sampledData;
	}

	// Encontrar quando o payback fica positivo pela primeira vez
	const paybackBreakEven = analysis.progression.find((item) => item.Payback >= 0);
	const paybackMonths = paybackBreakEven ? analysis.progression.indexOf(paybackBreakEven) : -1;

	return (
		<div className="w-full h-full flex flex-col gap-6 py-4">
			{/* Informações gerais */}
			<div className="w-full flex flex-col gap-2">
				<div className="flex flex-col p-3 rounded shadow-sm gap-4 border border-primary/30">
					<div className="w-full flex flex-col gap-1">
						<h2 className="text-lg font-medium tracking-tight leading-none">Economia Mensal Média</h2>
						<p className="text-sm text-muted-foreground tracking-tight leading-none">Economia mensal média com o sistema solar</p>
					</div>
					<div className="w-full flex flex-col">
						<h1 className="text-2xl font-black tracking-tight leading-none">{formatToMoney(analysis.monthlySavedValue)}</h1>
					</div>
				</div>
				<div className="flex flex-col p-3 rounded shadow-sm gap-4 border border-primary/30">
					<div className="w-full flex flex-col gap-1">
						<h2 className="text-lg font-medium tracking-tight leading-none">Economia em 25 Anos</h2>
						<p className="text-sm text-muted-foreground tracking-tight leading-none">Economia total em 25 anos com o sistema solar</p>
					</div>
					<div className="w-full flex flex-col">
						<h1 className="text-2xl font-black tracking-tight leading-none">{formatToMoney(analysis.twentyFiveYearsSavedValue)}</h1>
					</div>
				</div>
				<div className="flex flex-col p-3 rounded shadow-sm gap-4 border border-primary/30">
					<div className="w-full flex flex-col gap-1">
						<h2 className="text-lg font-medium tracking-tight leading-none">Tempo de Retorno</h2>
						<p className="text-sm text-muted-foreground tracking-tight leading-none">Tempo de retorno do investimento</p>
					</div>
					<div className="w-full flex flex-col">
						<h1 className="text-2xl font-black tracking-tight leading-none">{paybackMonths > 0 ? `${Math.floor(paybackMonths / 12)} anos e ${paybackMonths % 12} meses` : "..."}</h1>
					</div>
				</div>
			</div>

			{/* Gráfico de Payback */}
			<div className="flex flex-col p-3 rounded shadow-sm gap-4 border border-primary/30">
				<div className="w-full flex flex-col gap-1">
					<h2 className="text-lg font-medium tracking-tight leading-none">Análise de Payback</h2>
					<p className="text-sm text-muted-foreground tracking-tight leading-none">Progressão do retorno financeiro ao longo do tempo</p>
				</div>
				<div className="w-full flex flex-col gap-2 p-3">
					<ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
						<AreaChart
							accessibilityLayer
							data={chartData}
							margin={{
								left: 12,
								right: 12,
								top: 12,
								bottom: 12,
							}}
						>
							<CartesianGrid vertical={false} />
							<XAxis dataKey="tag" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
							<YAxis
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								tickFormatter={(value) => {
									const formatted = new Intl.NumberFormat("pt-BR", {
										style: "currency",
										currency: "BRL",
										minimumFractionDigits: 0,
									}).format(Math.abs(value));
									return value < 0 ? `-${formatted}` : formatted;
								}}
							/>
							<ChartTooltip content={<ChartTooltipContent className="w-fit min-w-[200px]" labelFormatter={(value) => `Período: ${value}`} />} />
							<defs>
								<linearGradient id="paybackPositiveGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
									<stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="paybackNegativeGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#ef4444" stopOpacity={0.1} />
									<stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
								</linearGradient>
							</defs>
							<Area dataKey="paybackPositive" stroke="#22c55e" strokeWidth={2} fill="url(#paybackPositiveGradient)" connectNulls={false} />
							<Area dataKey="paybackNegative" stroke="#ef4444" strokeWidth={2} fill="url(#paybackNegativeGradient)" connectNulls={false} />
						</AreaChart>
					</ChartContainer>
				</div>
			</div>

			{/* Gráfico de Comparação de Contas */}
			<div className="flex flex-col p-3 rounded shadow-sm gap-4 border border-primary/30">
				<div className="w-full flex flex-col gap-1">
					<h2 className="text-lg font-medium tracking-tight leading-none">Comparação de Contas de Energia</h2>
					<p className="text-sm text-muted-foreground tracking-tight leading-none">Conta com sistema solar vs. conta convencional ao longo do tempo</p>
				</div>
				<div className="w-full flex flex-col gap-2 p-3">
					<ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
						<LineChart
							accessibilityLayer
							data={chartData}
							margin={{
								left: 12,
								right: 12,
								top: 12,
								bottom: 12,
							}}
						>
							<CartesianGrid vertical={false} />
							<XAxis dataKey="tag" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
							<YAxis
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								tickFormatter={(value) => {
									const formatted = new Intl.NumberFormat("pt-BR", {
										style: "currency",
										currency: "BRL",
										minimumFractionDigits: 0,
									}).format(Math.abs(value));
									return value < 0 ? `-${formatted}` : formatted;
								}}
							/>
							<ChartTooltip
								content={
									<ChartTooltipContent
										className="w-fit min-w-[200px]"
										labelFormatter={(value) => `Período: ${value}`}
										// formatter={(value, name) => {
										// 	if (value === null || value === undefined) return null;
										// 	return [
										// 		new Intl.NumberFormat("pt-BR", {
										// 			style: "currency",
										// 			currency: "BRL",
										// 		}).format(value as number),
										// 		name === "energyBill" ? "Conta com Solar" : name === "conventionalBill" ? "Conta Convencional" : name,
										// 	];
										// }}
									/>
								}
							/>
							<Line dataKey="energyBill" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls={false} />
							<Line dataKey="conventionalBill" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls={false} />
						</LineChart>
					</ChartContainer>
				</div>
			</div>

			{/* Gráfico de Saldo Acumulado */}
			<div className="flex flex-col p-3 rounded shadow-sm gap-4 border border-primary/30">
				<div className="w-full flex flex-col gap-1">
					<h2 className="text-lg font-medium tracking-tight leading-none">Saldo Acumulado</h2>
					<p className="text-sm text-muted-foreground tracking-tight leading-none">Evolução do saldo acumulado de economia ao longo do tempo</p>
				</div>
				<div className="w-full flex flex-col gap-2 p-3">
					<ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
						<AreaChart
							accessibilityLayer
							data={chartData}
							margin={{
								left: 12,
								right: 12,
								top: 12,
								bottom: 12,
							}}
						>
							<CartesianGrid vertical={false} />
							<XAxis dataKey="tag" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
							<YAxis
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								tickFormatter={(value) => {
									const formatted = new Intl.NumberFormat("pt-BR", {
										style: "currency",
										currency: "BRL",
										minimumFractionDigits: 0,
									}).format(Math.abs(value));
									return value < 0 ? `-${formatted}` : formatted;
								}}
							/>
							<ChartTooltip content={<ChartTooltipContent className="w-fit min-w-[200px]" labelFormatter={(value) => `Período: ${value}`} />} />
							<defs>
								<linearGradient id="accumulatedBalanceGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
									<stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
								</linearGradient>
							</defs>
							<Area dataKey="accumulatedBalance" stroke="#8b5cf6" strokeWidth={2} fill="url(#accumulatedBalanceGradient)" connectNulls={false} />
						</AreaChart>
					</ChartContainer>
				</div>
			</div>
		</div>
	);
}
