import { useState } from "react";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { MdAttachMoney, MdCreate, MdSell } from "react-icons/md";
import StatCard from "../sale-team/StatCard";

import type { TSellerSalesResults } from "@/app/api/stats/comercial-results/sales-sellers/route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableSortingControl } from "@/components/ui/table-sorting-control";
import { formatDecimalPlaces, formatNameAsInitials } from "@/lib/methods/formatting";
import { formatToMoney } from "@/utils/methods";
import { useSalesTeamResults } from "@/utils/queries/stats/sellers";
import type { TUserDTOWithSaleGoals } from "@/utils/schemas/user.schema";
import { BadgeDollarSign, CircleDollarSign, CirclePlus, Percent, Ticket } from "lucide-react";
import { FaUser } from "react-icons/fa";
import ConversionStatCard from "../sale-team/ConversionStatCard";

type SalesTeamResultsProps = {
	after: string;
	before: string;
	responsibles: string[] | null;
	partners: string[] | null;
	projectTypes: string[] | null;
	promoters: TUserDTOWithSaleGoals[] | undefined;
};
function SalesTeamResults({ after, before, responsibles, partners, projectTypes, promoters }: SalesTeamResultsProps) {
	const { data: stats, isLoading } = useSalesTeamResults({ after, before, responsibles, partners, projectTypes });
	console.log(stats);
	return (
		<div className="flex w-full flex-col">
			<h1 className="mt-4 rounded-md bg-[#15599a] text-center text-xl font-black text-white">TIME DE VENDAS</h1>
			<SalesTeamOverallResults stats={stats || {}} promoters={promoters || []} />
			<div className="mt-2 flex w-full flex-col items-start gap-2 lg:flex-row">
				<StatCard
					icon={<AiOutlineThunderbolt />}
					label="Potência Vendida"
					promoters={promoters || []}
					statKey="potenciaPico"
					stats={stats}
					statsLoading={isLoading}
				/>
				<StatCard icon={<MdAttachMoney />} label="Valor Vendido" promoters={promoters || []} statKey="valorVendido" stats={stats} statsLoading={isLoading} />
			</div>
			<div className="mt-2 flex w-full flex-col items-start gap-2 lg:flex-row">
				<StatCard icon={<MdSell />} label="Projetos Vendidos" promoters={promoters || []} statKey="projetosVendidos" stats={stats} statsLoading={isLoading} />
				<StatCard icon={<MdCreate />} label="Projetos Criados" promoters={promoters || []} statKey="projetosCriados" stats={stats} statsLoading={isLoading} />
			</div>
			<div className="mt-2 flex w-full flex-col items-start gap-2 lg:flex-row">
				<ConversionStatCard
					numeratorStatKey="projetosVendidos"
					denominatorStatKey="projetosCriados"
					promoters={promoters || []}
					stats={stats}
					statsLoading={isLoading}
				/>
			</div>
		</div>
	);
}

export default SalesTeamResults;

type TSalesTeamOverallResultsSortConfig = {
	field: "nome" | "projetosCriados" | "valorVendido" | "projetosVendidos" | "ticketMedio" | "conversao";
	direction: "asc" | "desc";
};
function SalesTeamOverallResults({ stats, promoters }: { stats: TSellerSalesResults; promoters: TUserDTOWithSaleGoals[] }) {
	const [sortConfig, setSortConfig] = useState<TSalesTeamOverallResultsSortConfig>({ field: "nome", direction: "asc" });

	function getSortedStatsAsList(stats: TSellerSalesResults, sortConfig: TSalesTeamOverallResultsSortConfig) {
		const sortedStats = Object.entries(stats)
			.map(([key, value]) => {
				const promoter = promoters.find((promoter) => promoter.nome === key);
				const statKey = key;
				const statValue = value as TSellerSalesResults[keyof TSellerSalesResults];
				return {
					nome: statKey,
					avatar: promoter?.avatar_url,
					projetosCriados: statValue.projetosCriados.atingido || 0,
					potenciaVendida: statValue.potenciaPico.atingido || 0,
					projetosVendidos: statValue.projetosVendidos.atingido || 0,
					valorVendido: statValue.valorVendido.atingido || 0,
					ticketMedio: statValue.valorVendido.atingido / (statValue.projetosVendidos.atingido || 1),
					conversao: ((statValue.projetosVendidos.atingido || 0) / (statValue.projetosCriados.atingido || 1)) * 100,
				};
			})
			.sort((a, b) => {
				if (sortConfig.direction === "asc") {
					if (sortConfig.field === "nome") return a.nome.localeCompare(b.nome);
					const aValue = a[sortConfig.field] ?? 0;
					const bValue = b[sortConfig.field] ?? 0;
					return aValue - bValue;
				}
				if (sortConfig.field === "nome") return b.nome.localeCompare(a.nome);
				const aValue = a[sortConfig.field] ?? 0;
				const bValue = b[sortConfig.field] ?? 0;
				return bValue - aValue;
			});
		return sortedStats;
	}
	const statsAsList = getSortedStatsAsList(stats, sortConfig);

	return (
		<div className="mt-2 flex h-[400px] max-h-[600px] w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md lg:h-[600px]">
			<div className="flex items-center justify-between">
				<h1 className="text-sm font-medium uppercase tracking-tight">GERAL</h1>
				<FaUser />
			</div>
			<div className="overscroll-y mt-2 gap-1.5 flex w-full grow flex-col overflow-y-auto px-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
				<div className="hidden lg:flex items-center justify-between gap-2 bg-[#15599a] text-primary-foreground rounded-md p-2">
					<div className="w-1/6 flex items-center gap-2">
						<p className="text-xs lg:text-sm font-medium uppercase tracking-tight">VENDEDOR</p>
					</div>
					<div className="w-1/6 flex items-center gap-2">
						<p className="text-xs lg:text-sm font-medium uppercase tracking-tight">PROJETOS CRIADOS</p>
					</div>
					<div className="w-1/6 flex items-center gap-2">
						<p className="text-xs lg:text-sm font-medium uppercase tracking-tight">VALOR VENDIDO</p>
					</div>
					<div className="w-1/6 flex items-center gap-2">
						<p className="text-xs lg:text-sm font-medium uppercase tracking-tight">PROJETOS VENDIDOS</p>
					</div>
					<div className="w-1/6 flex items-center gap-2">
						<p className="text-xs lg:text-sm font-medium uppercase tracking-tight">TICKET MÉDIO</p>
					</div>
					<div className="w-1/6 flex items-center gap-2">
						<p className="text-xs lg:text-sm font-medium uppercase tracking-tight">CONVERSÃO</p>
					</div>
				</div>
				{/* Beautiful Sorting Control UI */}
				<TableSortingControl
					sortConfig={sortConfig}
					setSortConfig={setSortConfig}
					sortOptions={[
						{ value: "nome", label: "Nome" },
						{ value: "projetosCriados", label: "Projetos Criados" },
						{ value: "valorVendido", label: "Valor Vendido" },
						{ value: "projetosVendidos", label: "Projetos Vendidos" },
						{ value: "ticketMedio", label: "Ticket Médio" },
						{ value: "conversao", label: "Conversão" },
					]}
					title="Ordenação da Equipe"
					accentColor="#15599a"
					size="md"
					showCurrentSelection={true}
				/>
				{statsAsList.map((stat) => (
					<div key={stat.nome} className="w-full flex flex-col">
						<div className="hidden lg:flex items-center justify-between gap-2 border border-primary/30 rounded-md p-2">
							<div className="w-1/6 flex items-center gap-2">
								<Avatar className="w-5 h-5">
									<AvatarImage src={stat.avatar ?? undefined} />
									<AvatarFallback className="text-xs">{formatNameAsInitials(stat.nome)}</AvatarFallback>
								</Avatar>
								<p className="text-xs lg:text-sm font-medium uppercase tracking-tight">{stat.nome}</p>
							</div>
							<div className="w-1/6 flex items-center gap-2">
								<p className="text-xs lg:text-sm font-medium uppercase tracking-tight">{stat.projetosCriados}</p>
							</div>
							<div className="w-1/6 flex items-center gap-2">
								<p className="text-xs lg:text-sm font-medium uppercase tracking-tight">{formatToMoney(stat.valorVendido)}</p>
							</div>
							<div className="w-1/6 flex items-center gap-2">
								<p className="text-xs lg:text-sm font-medium uppercase tracking-tight">{stat.projetosVendidos}</p>
							</div>
							<div className="w-1/6 flex items-center gap-2">
								<p className="text-xs lg:text-sm font-medium uppercase tracking-tight">{formatToMoney(stat.ticketMedio)}</p>
							</div>
							<div className="w-1/6 flex items-center gap-2">
								<p className="text-xs lg:text-sm font-medium uppercase tracking-tight">{formatDecimalPlaces(stat.conversao, 2)}%</p>
							</div>
						</div>
						<div className="flex lg:hidden items-center justify-between gap-2 border border-primary/30 rounded-md p-2 flex-col">
							<div className="flex items-center gap-2 w-full">
								<Avatar className="w-5 h-5">
									<AvatarImage src={stat.avatar ?? undefined} />
									<AvatarFallback className="text-xs">{formatNameAsInitials(stat.nome)}</AvatarFallback>
								</Avatar>
								<p className="text-xs lg:text-sm font-medium uppercase tracking-tight">{stat.nome}</p>
							</div>
							<div className="w-full flex items-start flex-wrap justify-between gap-x-3 gap-y-1">
								<div className="flex items-center gap-2">
									<CirclePlus className="w-4 h-4" />
									<p className="text-[0.65rem] font-medium uppercase tracking-tight">PROJETOS CRIADOS</p>
									<p className="text-[0.65rem] font-medium uppercase tracking-tight">{stat.projetosCriados}</p>
								</div>
								<div className="flex items-center gap-2">
									<BadgeDollarSign className="w-4 h-4" />
									<p className="text-[0.65rem] font-medium uppercase tracking-tight">VALOR VENDIDO</p>
									<p className="text-[0.65rem] font-medium uppercase tracking-tight">{formatToMoney(stat.valorVendido)}</p>
								</div>
								<div className="flex items-center gap-2">
									<CircleDollarSign className="w-4 h-4" />
									<p className="text-[0.65rem] font-medium uppercase tracking-tight">PROJETOS VENDIDOS</p>
									<p className="text-[0.65rem] font-medium uppercase tracking-tight">{stat.projetosVendidos}</p>
								</div>
								<div className="flex items-center gap-2">
									<Ticket className="w-4 h-4" />
									<p className="text-[0.65rem] font-medium uppercase tracking-tight">TICKET MÉDIO</p>
									<p className="text-[0.65rem] font-medium uppercase tracking-tight">{formatToMoney(stat.ticketMedio)}</p>
								</div>
								<div className="flex items-center gap-2">
									<Percent className="w-4 h-4" />
									<p className="text-[0.65rem] font-medium uppercase tracking-tight">CONVERSÃO</p>
									<p className="text-[0.65rem] font-medium uppercase tracking-tight">{formatDecimalPlaces(stat.conversao, 2)}%</p>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
