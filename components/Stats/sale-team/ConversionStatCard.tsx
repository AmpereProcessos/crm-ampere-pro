import type { TSellerSalesResults } from "@/app/api/stats/comercial-results/sales-sellers/route";
import type { TUserDTOWithSaleGoals } from "@/utils/schemas/user.schema";
import dayjs from "dayjs";
import { FaPercentage } from "react-icons/fa";
import StatListItem from "../StatListItem";
import StatListSkeleton from "./StatListSkeleton";
const currentDate = new Date();
const periodStr = dayjs(currentDate).format("MM/YYYY");
function getConversionGoal({ promoterName, promoters }: { promoterName: string; promoters: TUserDTOWithSaleGoals[] }) {
	const promoter = promoters.find((p) => p.nome == promoterName);
	if (!promoter) return 0;

	const saleGoals = promoter.metas;
	if (!saleGoals || saleGoals.length == 0) return 0;

	const currentPeriodSaleGoals = saleGoals.find((saleGoal) => saleGoal.periodo == periodStr);
	if (!currentPeriodSaleGoals) return 0;

	return currentPeriodSaleGoals.metas.conversao || 0;
}
function getPromoterListOrdenatedByKeyStat({
	stats,
	numeratorStatKey,
	denominatorStatKey,
	promoters,
}: {
	stats?: TSellerSalesResults;
	numeratorStatKey: string;
	denominatorStatKey: string;
	promoters: TUserDTOWithSaleGoals[];
}) {
	if (!stats) return [];
	const statsAsList = Object.entries(stats).map(([key, value]) => {
		const promoterName = key;

		const numerator = value[numeratorStatKey as keyof typeof value].atingido;

		const denominator = value[numeratorStatKey as keyof typeof value].atingido;
		const relation = numerator / denominator || 0;

		const goal = getConversionGoal({ promoterName, promoters });
		const hit = relation * 100;

		var percentage = 0;

		if (goal != 0) {
			if (hit != 0) percentage = hit / goal;
			else percentage = 0;
		} else {
			if (hit != 0) percentage = 1;
			else percentage = 0;
		}
		percentage = percentage * 100;

		return {
			nome: promoterName,
			objetivo: goal,
			atingido: hit,
			percentual: percentage,
		};
	});
	const orderedStatsList = statsAsList.sort((a, b) => {
		return b.atingido - a.atingido;
	});

	return orderedStatsList;
}

type ConversionStatCardProps = {
	stats: TSellerSalesResults | undefined;
	statsLoading: boolean;
	numeratorStatKey: string;
	denominatorStatKey: string;
	promoters: TUserDTOWithSaleGoals[];
};
function ConversionStatCard({ stats, statsLoading, promoters, numeratorStatKey, denominatorStatKey }: ConversionStatCardProps) {
	return (
		<div className="flex h-[400px] max-h-[600px] w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md lg:h-[600px]">
			<div className="flex items-center justify-between">
				<h1 className="text-sm font-medium uppercase tracking-tight">Conversão</h1>
				<FaPercentage />
			</div>
			<div className="overscroll-y mt-2 flex w-full grow flex-col overflow-y-auto px-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
				{statsLoading ? (
					<StatListSkeleton />
				) : (
					getPromoterListOrdenatedByKeyStat({ stats, numeratorStatKey, denominatorStatKey, promoters })?.map((promoter, index) => (
						<StatListItem key={index} promoter={promoter} promoters={promoters || []} />
					))
				)}
			</div>
		</div>
	);
}

export default ConversionStatCard;
