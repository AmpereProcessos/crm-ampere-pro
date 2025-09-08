"use client";
import type { TGetGraphDataRouteInput } from "@/app/api/stats/graph/route";
import UserConectaIndicationCodeFlag from "@/components/Conecta/UserConectaIndicationCodeFlag";
import DateInput from "@/components/Inputs/DateInput";
import MultipleSelectInput from "@/components/Inputs/MultipleSelectInput";
import { Sidebar } from "@/components/Sidebar";
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
import type { TUserSession } from "@/lib/auth/session";
import {
	formatDateOnInputChange,
	formatDecimalPlaces,
	formatToMoney,
} from "@/lib/methods/formatting";
import { cn } from "@/lib/utils";
import { formatDateForInputValue } from "@/utils/methods";
import {
	useGraphData,
	useSellersRanking,
	useStats,
	useStatsQueryOptions,
} from "@/utils/queries/stats";
import dayjs from "dayjs";
import {
	BadgeDollarSign,
	CirclePlus,
	CircleX,
	MousePointerClick,
	TrendingDown,
	TrendingUp,
	UserRoundPlus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AiOutlineCloseCircle, AiOutlineTeam } from "react-icons/ai";
import {
	BsFileEarmarkText,
	BsPatchCheck,
	BsTicketPerforated,
} from "react-icons/bs";
import { FaBolt } from "react-icons/fa";
import { FaListCheck } from "react-icons/fa6";
import { VscDiffAdded } from "react-icons/vsc";
import { Area, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";
import SellersRanking from "../rankings/SellersRanking";
import OpenActivitiesBlock from "./OpenActivitiesBlock";
import PPSOpenCallsBlock from "./PPSOpenCallsBlock";
import PendingWinsBlock from "./PendingWinsBlock";
import WinsBlock from "./WinsBlock";

const firstDayOfMonth = dayjs().startOf("month").toISOString();
const endOfDay = dayjs().endOf("day").toISOString();

type TQueryFilters = {
	period: { after: string; before: string };
	responsibles: string[] | null;
	partners: string[] | null;
	projectTypes: string[] | null;
};

type MainDashboardPageProps = {
	session: TUserSession;
};
function MainDashboardPage({ session }: MainDashboardPageProps) {
	const userOpportunitiesScope =
		session.user.permissoes.oportunidades.escopo || null;
	const userPartnersScope = session.user.permissoes.parceiros.escopo || null;

	const [queryFilters, setQueryFilters] = useState<TQueryFilters>({
		period: { after: firstDayOfMonth, before: endOfDay },
		responsibles: userOpportunitiesScope,
		partners: userPartnersScope,
		projectTypes: null,
	});
	const { data: queryOptions } = useStatsQueryOptions();
	const { data, isLoading, isSuccess, isError, error } = useStats({
		after: queryFilters.period.after,
		before: queryFilters.period.before,
		partners: queryFilters.partners,
		responsibles: queryFilters.responsibles,
		projectTypes: queryFilters.projectTypes,
	});

	const responsiblesSelectableOptions = queryOptions?.responsibles
		? userOpportunitiesScope
			? queryOptions.responsibles.filter((a) =>
					userOpportunitiesScope.includes(a._id),
				)
			: queryOptions.responsibles
		: [];
	const partnersSelectableOptions = queryOptions?.partners
		? userPartnersScope
			? queryOptions?.partners.filter((a) => userPartnersScope.includes(a._id))
			: queryOptions?.partners
		: [];
	console.log(session);
	console.log(queryFilters);
	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6">
				<div className="flex w-full flex-col gap-2 items-center justify-between border-b border-black pb-2 lg:flex-row">
					<div className="flex flex-col items-center gap-2 lg:flex-row">
						<h1 className="font-Raleway text-2xl font-black text-primary">
							DASHBOARD
						</h1>
						<UserConectaIndicationCodeFlag
							code={session.user.codigoIndicacaoConecta}
						/>
					</div>
					<div className="flex flex-col items-center gap-6 lg:flex-row">
						{session?.user.permissoes.resultados?.visualizarComercial ? (
							<Link href="/comercial/gestao/resultados">
								<div className="flex items-center gap-1 font-bold tracking-tight text-primary/70 duration-300 ease-in-out hover:text-cyan-500">
									<p className="text-sm">RESULTADOS COMERCIAIS</p>
									<AiOutlineTeam />
								</div>
							</Link>
						) : null}
						{session?.user.permissoes.resultados?.visualizarOperacional ? (
							<Link href="/operacional/gestao">
								<div className="flex items-center gap-1 font-bold tracking-tight text-primary/70 duration-300 ease-in-out hover:text-cyan-500">
									<p className="text-sm">ACOMPANHAMENTO DE OPERAÇÃO</p>
									<FaListCheck />
								</div>
							</Link>
						) : null}
					</div>
				</div>
				<div className="flex grow flex-col py-2 gap-4">
					<div className="flex w-full flex-col items-end justify-end gap-2 lg:flex-row">
						<div className="w-full lg:w-[300px]">
							<MultipleSelectInput
								labelClassName="text-sm font-medium uppercase tracking-tight"
								resetOptionLabel="TODOS OS USUÁRIOS"
								selected={queryFilters.responsibles}
								options={
									responsiblesSelectableOptions?.map((resp) => ({
										id: resp._id || "",
										label: resp.nome || "",
										value: resp._id || "",
									})) || []
								}
								handleChange={(value) =>
									setQueryFilters((prev) => ({
										...prev,
										responsibles: value as string[],
									}))
								}
								onReset={() =>
									setQueryFilters((prev) => ({
										...prev,
										responsibles: userOpportunitiesScope,
									}))
								}
								label="USUÁRIOS"
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-[300px]">
							<MultipleSelectInput
								labelClassName="text-sm font-medium uppercase tracking-tight"
								resetOptionLabel="TODOS OS PARCEIROS"
								selected={queryFilters.partners}
								options={
									partnersSelectableOptions?.map((resp) => ({
										id: resp._id || "",
										label: resp.nome || "",
										value: resp._id || "",
									})) || []
								}
								handleChange={(value) =>
									setQueryFilters((prev) => ({
										...prev,
										partners: value as string[],
									}))
								}
								onReset={() =>
									setQueryFilters((prev) => ({
										...prev,
										partners: userPartnersScope,
									}))
								}
								label="PARCEIROS"
								width="100%"
							/>
						</div>
						<div className="w-full lg:w-[300px]">
							<MultipleSelectInput
								labelClassName="text-sm font-medium uppercase tracking-tight"
								resetOptionLabel="TODOS OS PROJETOS"
								selected={queryFilters.projectTypes}
								options={
									queryOptions?.projectTypes?.map((resp) => ({
										id: resp._id || "",
										label: resp.nome || "",
										value: resp._id || "",
									})) || null
								}
								handleChange={(value) =>
									setQueryFilters((prev) => ({
										...prev,
										projectTypes: value as string[],
									}))
								}
								onReset={() =>
									setQueryFilters((prev) => ({ ...prev, projectTypes: null }))
								}
								label="PROJETOS"
								width="100%"
							/>
						</div>

						<div className="flex w-full flex-col lg:w-fit">
							<h1 className="text-end text-sm font-medium uppercase tracking-tight">
								PERÍODO
							</h1>
							<div className="flex flex-col items-center gap-2 lg:flex-row">
								<div className="w-full lg:w-[150px]">
									<DateInput
										label="PERÍODO"
										showLabel={false}
										value={formatDateForInputValue(queryFilters.period.after)}
										handleChange={(value) =>
											setQueryFilters((prev) => ({
												...prev,
												period: {
													...prev.period,
													after: formatDateOnInputChange(
														value,
														"string",
														"start",
													) as string,
												},
											}))
										}
										width="100%"
									/>
								</div>
								<div className="w-full lg:w-[150px]">
									<DateInput
										label="PERÍODO"
										showLabel={false}
										value={formatDateForInputValue(queryFilters.period.before)}
										handleChange={(value) =>
											setQueryFilters((prev) => ({
												...prev,
												period: {
													...prev.period,
													before: formatDateOnInputChange(
														value,
														"string",
														"end",
													) as string,
												},
											}))
										}
										width="100%"
									/>
								</div>
							</div>
						</div>
					</div>
					<div className="flex w-full flex-col items-center justify-around gap-2 lg:flex-row">
						<CardStat
							title="Projetos Criados"
							icon={<VscDiffAdded className="h-4 w-4" />}
							current={data?.simplificado.ATUAL.projetosCriados || 0}
							previous={data?.simplificado.ANTERIOR.projetosCriados || 0}
							className="w-full lg:w-1/6"
						/>
						<CardStat
							title="Projetos Ganhos"
							icon={<BsPatchCheck className="h-4 w-4" />}
							current={data?.simplificado.ATUAL.projetosGanhos || 0}
							previous={data?.simplificado.ANTERIOR.projetosGanhos || 0}
							className="w-full lg:w-1/6"
						/>
						<CardStat
							title="Projetos Perdidos"
							icon={<AiOutlineCloseCircle className="h-4 w-4" />}
							current={data?.simplificado.ATUAL.projetosPerdidos || 0}
							previous={data?.simplificado.ANTERIOR.projetosPerdidos || 0}
							className="w-full lg:w-1/6"
							lowerIsBetter={true}
						/>
						<CardStat
							title="Potência Vendida"
							icon={<FaBolt className="h-4 w-4" />}
							current={data?.simplificado.ATUAL.potenciaVendida || 0}
							previous={data?.simplificado.ANTERIOR.potenciaVendida || 0}
							formatCurrent={(value) => `${formatDecimalPlaces(value)}kWp`}
							formatPrevious={(value) => `${formatDecimalPlaces(value)}kWp`}
							className="w-full lg:w-1/6"
						/>
						<CardStat
							title="Total Vendido"
							icon={<BsFileEarmarkText className="h-4 w-4" />}
							current={data?.simplificado.ATUAL.totalVendido || 0}
							previous={data?.simplificado.ANTERIOR.totalVendido || 0}
							formatCurrent={(value) => `${formatToMoney(value)}`}
							formatPrevious={(value) => `${formatToMoney(value)}`}
							className="w-full lg:w-1/6"
						/>
						<CardStat
							title="Ticket Médio"
							icon={<BsTicketPerforated className="h-4 w-4" />}
							current={
								(data?.simplificado.ATUAL.totalVendido || 0) /
								(data?.simplificado.ATUAL.projetosGanhos || 0)
							}
							previous={
								(data?.simplificado.ANTERIOR.totalVendido || 0) /
								(data?.simplificado.ANTERIOR.projetosGanhos || 0)
							}
							formatCurrent={(value) => `${formatToMoney(value)}`}
							formatPrevious={(value) => `${formatToMoney(value)}`}
							className="w-full lg:w-1/6"
						/>
					</div>

					<div className="flex w-full flex-col items-stretch justify-around gap-2 lg:flex-row">
						<div className="w-full lg:w-[60%] h-full">
							<GraphData
								after={queryFilters.period.after}
								before={queryFilters.period.before}
								responsibles={queryFilters.responsibles}
								partners={queryFilters.partners}
								projectTypes={queryFilters.projectTypes}
							/>
						</div>
						<div className="w-full lg:w-[40%] h-full">
							<SellersRanking />
						</div>
					</div>

					<div className="flex w-full flex-col items-center justify-around gap-2 lg:flex-row">
						<div
							className={cn(
								"bg-card border-primary/20 flex w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs lg:w-1/2",
							)}
						>
							<div className="flex items-center justify-between">
								<h1 className="text-xs font-medium tracking-tight uppercase">
									Visualizações do Conecta Link
								</h1>
								<div className="flex items-center gap-2">
									<MousePointerClick className="h-4 w-4" />
								</div>
							</div>
							<div className="flex w-full flex-col">
								<div className="text-2xl font-bold text-[#15599a] dark:text-[#fead61]">
									{data?.conecta.visualizacoes || 0}
								</div>
							</div>
						</div>
						<div
							className={cn(
								"bg-card border-primary/20 flex w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs lg:w-1/2",
							)}
						>
							<div className="flex items-center justify-between">
								<h1 className="text-xs font-medium tracking-tight uppercase">
									Oportunidades do Conecta Link
								</h1>
								<div className="flex items-center gap-2">
									<UserRoundPlus className="h-4 w-4" />
								</div>
							</div>
							<div className="flex w-full flex-col">
								<div className="text-2xl font-bold text-[#15599a] dark:text-[#fead61]">
									{data?.conecta.oportunidades || 0}
								</div>
							</div>
						</div>
					</div>
					<div className="flex w-full flex-col items-center justify-around gap-2 lg:flex-row">
						<div className="w-full lg:w-[40%]">
							<PendingWinsBlock
								data={data?.ganhosPendentes || []}
								session={session}
							/>
						</div>
						<div className="w-full lg:w-[60%]">
							<WinsBlock data={data?.ganhos || []} session={session} />
						</div>
					</div>
					<div className="flex w-full flex-col items-center gap-2 lg:flex-row">
						<div className="w-full lg:w-[50%]">
							<PPSOpenCallsBlock session={session} />
						</div>
						<div className="w-full lg:w-[50%]">
							<OpenActivitiesBlock session={session} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default MainDashboardPage;

type CardStatProps = {
	title: string;
	icon: React.ReactNode;
	current: number;
	previous: number;
	formatCurrent?: (n: number) => string;
	formatPrevious?: (n: number) => string;
	lowerIsBetter?: boolean;
	className?: string;
};
function CardStat({
	title,
	icon,
	current,
	previous,
	formatCurrent,
	formatPrevious,
	lowerIsBetter,
	className,
}: CardStatProps) {
	const change = (() => {
		if (previous === 0) {
			if (current === 0) return 0;
			return 100;
		}
		return ((current - previous) / Math.abs(previous)) * 100;
	})();

	const isGood = lowerIsBetter ? change < 0 : change > 0;
	const isNeutral = change === 0;
	const changeAbs = Math.abs(change);

	return (
		<div
			className={cn(
				"bg-card border-primary/20 flex w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs",
				className,
			)}
		>
			<div className="flex items-center justify-between">
				<h1 className="text-xs font-medium tracking-tight uppercase">
					{title}
				</h1>
				<div className="flex items-center gap-2">
					{!isNeutral && (
						<div
							className={cn(
								"inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.65rem] font-bold",
								isGood
									? "bg-green-200 text-green-700"
									: "bg-red-200 text-red-700",
							)}
						>
							{isGood ? (
								<TrendingUp className="h-3 min-h-3 w-3 min-w-3" />
							) : (
								<TrendingDown className="h-3 min-h-3 w-3 min-w-3" />
							)}
							{formatDecimalPlaces(changeAbs)}%
						</div>
					)}
					{icon}
				</div>
			</div>
			<div className="flex w-full flex-col">
				<div className="text-2xl font-bold text-[#15599a] dark:text-[#fead61]">
					{formatCurrent ? formatCurrent(current) : String(current)}
				</div>
				<p className="text-primary/60 text-xs tracking-tight">
					NO MÊS ANTERIOR:{" "}
					{formatPrevious ? formatPrevious(previous) : String(previous || 0)}
				</p>
			</div>
		</div>
	);
}

type TGraphDataProps = {
	after: string;
	before: string;
	responsibles: TGetGraphDataRouteInput["responsibles"];
	partners: TGetGraphDataRouteInput["partners"];
	projectTypes: TGetGraphDataRouteInput["projectTypes"];
};
function GraphData({
	after,
	before,
	responsibles,
	partners,
	projectTypes,
}: TGraphDataProps) {
	const [graphType, setGraphType] = useState<
		TGetGraphDataRouteInput["graphType"]
	>("opportunities-created");
	const { data } = useGraphData({
		after,
		before,
		filters: { graphType, responsibles, partners, projectTypes },
	});

	const METRIC_LABELS: Record<
		TGetGraphDataRouteInput["graphType"],
		{
			title: string;
			chartLabel: string;
			valorFormatting: (value: number) => string;
			icon: React.ReactNode;
		}
	> = {
		"total-sold": {
			title: "VALOR VENDIDO",
			chartLabel: "VALOR (R$)",
			valorFormatting: (value: number) => `${formatToMoney(value)}`,
			icon: <BadgeDollarSign className="h-4 min-h-4 w-4 min-w-4" />,
		},
		"opportunities-won": {
			title: "PROJETOS VENDIDOS",
			chartLabel: "PROJETOS",
			valorFormatting: (value: number) => String(value),
			icon: <CirclePlus className="h-4 min-h-4 w-4 min-w-4" />,
		},
		"opportunities-lost": {
			title: "PROJETOS PERDIDOS",
			chartLabel: "PROJETOS",
			valorFormatting: (value: number) => String(value),
			icon: <CircleX className="h-4 min-h-4 w-4 min-w-4" />,
		},
		"opportunities-created": {
			title: "PROJETOS CRIADOS",
			chartLabel: "PROJETOS",
			valorFormatting: (value: number) => String(value),
			icon: <CirclePlus className="h-4 min-h-4 w-4 min-w-4" />,
		},
	};

	const firstPeriodChartConfig = {
		identificador: {
			color: "#15599a",
			label: "Identificador",
		},
		valor: {
			label: METRIC_LABELS[graphType].chartLabel,
			color: "#15599a",
		},
	};
	return (
		<div className="bg-card border-primary/20 flex w-full flex-col gap-3 rounded-xl border px-3 py-4 shadow-xs h-full">
			<div className="flex items-center justify-between">
				<h1 className="text-xs font-medium tracking-tight uppercase">
					{METRIC_LABELS[graphType].title}
				</h1>
				<div className="flex items-center gap-2">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={
									graphType === "opportunities-created" ? "default" : "ghost"
								}
								size="fit"
								className="rounded-lg p-2"
								onClick={() => setGraphType("opportunities-created")}
							>
								{METRIC_LABELS["opportunities-created"].icon}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>{METRIC_LABELS["opportunities-created"].title}</p>
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={graphType === "total-sold" ? "default" : "ghost"}
								size="fit"
								className="rounded-lg p-2"
								onClick={() => setGraphType("total-sold")}
							>
								{METRIC_LABELS["total-sold"].icon}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>{METRIC_LABELS["total-sold"].title}</p>
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={
									graphType === "opportunities-won" ? "default" : "ghost"
								}
								size="fit"
								className="rounded-lg p-2"
								onClick={() => setGraphType("opportunities-won")}
							>
								{METRIC_LABELS["opportunities-won"].icon}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>{METRIC_LABELS["opportunities-won"].title}</p>
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={
									graphType === "opportunities-lost" ? "default" : "ghost"
								}
								size="fit"
								className="rounded-lg p-2"
								onClick={() => setGraphType("opportunities-lost")}
							>
								{METRIC_LABELS["opportunities-lost"].icon}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>{METRIC_LABELS["opportunities-lost"].title}</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<div className="flex w-full items-center gap-4">
				<div className="flex max-h-[400px] min-h-[400px] w-full items-center justify-center lg:max-h-[350px] lg:min-h-[350px]">
					<ChartContainer
						config={firstPeriodChartConfig}
						className="aspect-auto h-[350px] w-full lg:h-[250px]"
					>
						<ComposedChart
							data={data || []}
							margin={{
								top: 0,
								right: 15,
								left: 15,
								bottom: 0,
							}}
						>
							<defs>
								<linearGradient id="firstGradient" x1="0" y1="0" x2="0" y2="1">
									<stop
										offset="10%"
										stopColor={firstPeriodChartConfig.valor.color}
										stopOpacity={0.9}
									/>
									<stop
										offset="90%"
										stopColor={firstPeriodChartConfig.valor.color}
										stopOpacity={0.1}
									/>
								</linearGradient>
							</defs>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="identificador"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								minTickGap={32}
								interval="preserveStartEnd" // Mostra primeiro e último valor
								angle={-15} // Rotaciona os labels para melhor legibilidade
								textAnchor="end" // Alinhamento do texto
							/>
							<YAxis
								orientation="left"
								tickFormatter={(value) =>
									METRIC_LABELS[graphType].valorFormatting(value)
								}
								stroke={firstPeriodChartConfig.valor.color}
							/>

							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent indicator="dot" />}
							/>
							<Area
								dataKey="valor"
								type="monotone"
								fill="url(#firstGradient)"
								stroke={firstPeriodChartConfig.valor.color}
							/>
							<ChartLegend content={<ChartLegendContent payload={[]} />} />
						</ComposedChart>
					</ChartContainer>
				</div>
			</div>
		</div>
	);
}
