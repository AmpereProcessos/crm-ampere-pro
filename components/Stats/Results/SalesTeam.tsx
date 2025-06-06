import React from "react";
import StatCard from "../sale-team/StatCard";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { MdAttachMoney, MdCreate, MdSell } from "react-icons/md";

import ConversionStatCard from "../sale-team/ConversionStatCard";
import { useSalesTeamResults } from "@/utils/queries/stats/sellers";
import type { TUserDTOWithSaleGoals } from "@/utils/schemas/user.schema";

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
	return (
		<div className="flex w-full flex-col">
			<h1 className="mt-4 rounded-md bg-[#15599a] text-center text-xl font-black text-white">TIME DE VENDAS</h1>
			<div className="mt-2 flex w-full flex-col items-start gap-2 lg:flex-row">
				<StatCard icon={<AiOutlineThunderbolt />} label="Potência Vendida" promoters={promoters || []} statKey="potenciaPico" stats={stats} statsLoading={isLoading} />
				<StatCard icon={<MdAttachMoney />} label="Valor Vendido" promoters={promoters || []} statKey="valorVendido" stats={stats} statsLoading={isLoading} />
			</div>
			<div className="mt-2 flex w-full flex-col items-start gap-2 lg:flex-row">
				<StatCard icon={<MdSell />} label="Projetos Vendidos" promoters={promoters || []} statKey="projetosVendidos" stats={stats} statsLoading={isLoading} />
				<StatCard icon={<MdCreate />} label="Projetos Criados" promoters={promoters || []} statKey="projetosCriados" stats={stats} statsLoading={isLoading} />
			</div>
			<div className="mt-2 flex w-full flex-col items-start gap-2 lg:flex-row">
				<ConversionStatCard numeratorStatKey="projetosVendidos" denominatorStatKey="projetosCriados" promoters={promoters || []} stats={stats} statsLoading={isLoading} />
			</div>
		</div>
	);
}

export default SalesTeamResults;
