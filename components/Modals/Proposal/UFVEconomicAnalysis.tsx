import SelectInput from "@/components/Inputs/SelectInput";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useMediaQuery } from "@/lib/utils";
import { formatToMoney } from "@/utils/methods";
import type { TProposalDTOWithOpportunityAndClient } from "@/utils/schemas/proposal.schema";
import { getSalesProposalScenarios, type TSalesProposalScenarios } from "@/utils/solar";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts";
import { FixedSizeList as List } from "react-window";

type UFVEconomicAnalysisParams = {
	yearsQty: number;
	publicIluminationCost: number;
	yearlyConsumptionScaling: number;
};

type UFVEnergyEconomyAnalysisProps = {
	proposal: TProposalDTOWithOpportunityAndClient;
	closeModal: () => void;
};
function UFVEnergyEconomyAnalysis({ proposal, closeModal }: UFVEnergyEconomyAnalysisProps) {
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const [params, setParams] = useState<UFVEconomicAnalysisParams>({
		yearsQty: 12,
		publicIluminationCost: 20,
		yearlyConsumptionScaling: 0,
	});

	function updateParams(params: Partial<UFVEconomicAnalysisParams>) {
		setParams((prev) => ({ ...prev, ...params }));
	}
	const analysis = getSalesProposalScenarios({
		salesProposal: proposal,
		salesProposalProducts: proposal.produtos,
		locationUf: proposal.oportunidadeDados.localizacao.uf,
		locationCity: proposal.oportunidadeDados.localizacao.cidade,
		yearsQty: params.yearsQty,
		publicIluminationCost: params.publicIluminationCost,
		yearlyConsumptionScaling: params.yearlyConsumptionScaling,
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
					<TechnicalAnalysisConditionDataBlock analysis={analysis} params={params} updateParams={updateParams} />
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
					<TechnicalAnalysisConditionDataBlock analysis={analysis} params={params} updateParams={updateParams} />
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

// Componente da Tabela Virtualizada
type VirtualizedTableProps = {
	data: TSalesProposalScenarios["progression"];
};

function VirtualizedTable({ data }: VirtualizedTableProps) {
	const columns = [
		{ key: "tag", label: "Período" },
		{ key: "consumption_generation", label: "Consumo/Geração" },
		{ key: "compensated_energy", label: "Energia Compensada (R$)" },
		{ key: "non_compensated_energy", label: "Energia Não Compensada (R$)" },
		{ key: "conventional_bill", label: "Fatura Convencional" },
		{ key: "solar_bill", label: "Fatura Solar" },
	];

	const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
		const item = data[index];
		if (!item) return null;

		return (
			<div style={style} className="flex border-b border-gray-200 hover:bg-gray-50 w-full">
				{/* Tag */}
				<div className="flex items-center justify-center px-2 py-2 text-sm font-medium w-1/6">{item.Tag}</div>

				{/* Consumo e Geração */}
				<div className="flex flex-col justify-center px-2 py-1 text-xs w-1/6">
					<div className="text-blue-600 font-medium">C: {item.Consumption.toFixed(0)} kWh</div>
					<div className="text-green-600 font-medium">G: {item.Generation.toFixed(0)} kWh</div>
				</div>

				{/* Energia Compensada */}
				<div className="flex items-center justify-end px-2 py-2 text-sm w-1/6">{formatToMoney(item.CompensatedEnergyCost)}</div>

				{/* Energia Não Compensada */}
				<div className="flex items-center justify-end px-2 py-2 text-sm w-1/6">{formatToMoney(item.NonCompensatedEnergyCost)}</div>

				{/* Fatura Convencional */}
				<div className="flex items-center justify-end px-2 py-2 text-sm w-1/6">{formatToMoney(item.ConventionalEnergyBill)}</div>

				{/* Fatura Solar */}
				<div className="flex items-center justify-end px-2 py-2 text-sm font-medium text-green-600 w-1/6">{formatToMoney(item.EnergyBillValue)}</div>
			</div>
		);
	};

	const HeaderRow = () => (
		<div className="flex border-b-2 border-gray-300 bg-gray-100 font-semibold text-sm w-full">
			{columns.map((column) => (
				<div key={column.key} className="flex items-center justify-center px-2 py-3 text-center w-1/6">
					{column.label}
				</div>
			))}
		</div>
	);

	return (
		<div className="border border-gray-200 rounded-lg overflow-hidden w-full">
			<HeaderRow />
			<List height={400} itemCount={data.length} itemSize={60} width={"100%"}>
				{Row}
			</List>
		</div>
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
	params: UFVEconomicAnalysisParams;
	updateParams: (params: Partial<UFVEconomicAnalysisParams>) => void;
};
function TechnicalAnalysisConditionDataBlock({ analysis, params, updateParams }: TechnicalAnalysisConditionDataBlockProps) {
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
		<div className="w-full h-full flex flex-col gap-6 py-4 px-4">
			<div className="w-full flex items-center justify-end gap-2">
				<SelectInput
					label="TEMPO DE AVALIAÇÃO"
					value={params.yearsQty}
					options={[
						{
							id: 1,
							label: "5 Anos",
							value: 5,
						},
						{
							id: 2,
							label: "10 Anos",
							value: 10,
						},
						{
							id: 3,
							label: "12 Anos",
							value: 12,
						},
						{
							id: 4,
							label: "20 Anos",
							value: 20,
						},
						{
							id: 5,
							label: "25 Anos",
							value: 25,
						},
					]}
					resetOptionLabel="Selecione o número de anos"
					handleChange={(value) => updateParams({ yearsQty: Number(value) })}
					onReset={() => updateParams({ yearsQty: 12 })}
				/>
				<SelectInput
					label="CUSTO DE ILUMINAÇÃO PÚBLICA"
					value={params.publicIluminationCost}
					options={[
						{
							id: 1,
							label: "R$0",
							value: 0,
						},
						{
							id: 2,
							label: "R$10",
							value: 10,
						},
						{
							id: 3,
							label: "R$20",
							value: 20,
						},
						{
							id: 4,
							label: "R$30",
							value: 30,
						},
						{
							id: 5,
							label: "R$40",
							value: 40,
						},
					]}
					resetOptionLabel="Selecione o custo de iluminação pública"
					handleChange={(value) => updateParams({ publicIluminationCost: Number(value) })}
					onReset={() => updateParams({ publicIluminationCost: 20 })}
				/>
				<SelectInput
					label="AUMENTO ANUAL DE CONSUMO"
					value={params.yearlyConsumptionScaling}
					options={[
						{
							id: 1,
							label: "0%",
							value: 0,
						},
						{
							id: 2,
							label: "5%",
							value: 0.05,
						},
						{
							id: 3,
							label: "10%",
							value: 0.1,
						},
						{
							id: 4,
							label: "15%",
							value: 0.15,
						},
						{
							id: 5,
							label: "20%",
							value: 0.2,
						},
					]}
					resetOptionLabel="Selecione o aumento anual de consumo"
					handleChange={(value) => updateParams({ yearlyConsumptionScaling: Number(value) })}
					onReset={() => updateParams({ yearlyConsumptionScaling: 0 })}
				/>
			</div>
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
						<h2 className="text-lg font-medium tracking-tight leading-none">Economia em {params.yearsQty} Anos</h2>
						<p className="text-sm text-muted-foreground tracking-tight leading-none">Economia total em {params.yearsQty} anos com o sistema solar</p>
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

			{/* Tabela Virtualizada */}
			<div className=" flex-col p-3 rounded shadow-sm gap-4 border border-primary/30 hidden lg:flex">
				<div className="w-full flex flex-col gap-1">
					<h2 className="text-lg font-medium tracking-tight leading-none">Detalhamento Mensal</h2>
					<p className="text-sm text-muted-foreground tracking-tight leading-none">Análise detalhada mês a mês dos valores de energia</p>
				</div>
				<div className="w-full">
					<VirtualizedTable data={analysis.progression} />
				</div>
			</div>
		</div>
	);
}
