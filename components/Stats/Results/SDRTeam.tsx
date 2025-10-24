import { AiOutlineThunderbolt } from "react-icons/ai";
import { MdAttachMoney, MdSell } from "react-icons/md";
import SdrConversionStatCard from "../sdr-team/SdrConversionStatCard";
import SdrSentCard from "../sdr-team/SdrSentCard";
import SdrStatCard from "../sdr-team/SdrStatCard";

import { useSDRTeamResults } from "@/utils/queries/stats/sdr";
import type { TUserDTOWithSaleGoals } from "@/utils/schemas/user.schema";

type SDRTeamResultsProps = {
	after: string;
	before: string;
	responsibles: string[] | null;
	partners: string[] | null;
	projectTypes: string[] | null;
	promoters: TUserDTOWithSaleGoals[] | undefined;
};
function SDRTeamResults({ after, before, responsibles, partners, projectTypes, promoters }: SDRTeamResultsProps) {
	const { data: stats, isLoading } = useSDRTeamResults({ after, before, responsibles, partners, projectTypes });
	return (
		<div className="flex w-full flex-col">
			<h1 className="mt-4 rounded-md bg-[#15599a] text-center text-xl font-black text-white">TIME DE SDR</h1>
			<div className="mt-2 flex w-full flex-col items-start gap-2 lg:flex-row">
				<SdrStatCard
					icon={<AiOutlineThunderbolt />}
					label="Potência Vendida"
					promoters={promoters || []}
					statKey="potenciaPico"
					stats={stats}
					statsLoading={!stats}
				/>
				<SdrStatCard icon={<MdAttachMoney />} label="Valor Vendido" promoters={promoters || []} statKey="valorVendido" stats={stats} statsLoading={isLoading} />
			</div>
			<div className="mt-2 flex w-full flex-col items-start gap-2 lg:flex-row">
				<SdrStatCard icon={<MdSell />} label="Projetos vendidos" promoters={promoters || []} statKey="projetosVendidos" stats={stats} statsLoading={!stats} />
				<SdrStatCard
					icon={<MdAttachMoney />}
					label="Projetos criados"
					promoters={promoters || []}
					statKey="projetosCriados"
					stats={stats}
					statsLoading={!stats}
				/>
			</div>
			<div className="mt-2 flex w-full flex-col items-start gap-2 lg:flex-row">
				<SdrSentCard stats={stats} promoters={promoters || []} />
				<SdrConversionStatCard stats={stats} statsLoading={!stats} promoters={promoters || []} />
			</div>
		</div>
	);
}

export default SDRTeamResults;
