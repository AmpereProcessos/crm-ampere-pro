import React from "react";
import StatListSkeleton from "../sale-team/StatListSkeleton";
import { FaPercentage } from "react-icons/fa";
import StatListItem from "../StatListItem";
import dayjs from "dayjs";
import type { TUserDTOWithSaleGoals } from "@/utils/schemas/user.schema";
import type { TSDRTeamResults } from "@/app/api/stats/comercial-results/sales-sdr/route";
const currentDate = new Date();
const periodStr = dayjs(currentDate).format("MM/YYYY");

function getConversionGoal({ promoterName, promoters }: { promoterName: string; promoters: TUserDTOWithSaleGoals[] }) {
	const promoter = promoters.find((p) => p.nome === promoterName);
	if (!promoter) return 0;

	const saleGoals = promoter.metas;
	if (!saleGoals || saleGoals.length === 0) return 0;

	const currentPeriodSaleGoals = saleGoals.find((saleGoal) => saleGoal.periodo === periodStr);
	if (!currentPeriodSaleGoals) return 0;

	return currentPeriodSaleGoals.metas.conversao || 0;
}
function getPromoterListOrdenatedByKeyStat({ stats, promoters }: { stats?: TSDRTeamResults; promoters: TUserDTOWithSaleGoals[] }) {
	if (!stats) return [];
	const statsAsList = Object.entries(stats).map(([key, value]) => {
		const promoterName = key;
		const numerator: number = Object.values(value["POR VENDEDOR"]).reduce((acc: number, current) => {
			return acc + current.ganho;
		}, 0);
		console.log("VALUE", value);
		// @ts-ignore
		const denominator: number = Object.values(value["POR VENDEDOR"]).reduce((acc: number, current) => {
			return acc + current.recebido;
		}, 0);
		const relation = numerator / denominator || 0;

		// @ts-ignore
		const goal = getConversionGoal({ promoterName, promoters });
		const hit = relation * 100;

		let percentage = 0;

		if (goal !== 0) {
			if (hit !== 0) percentage = hit / goal;
			else percentage = 0;
		} else {
			if (hit !== 0) percentage = 1;
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
		return b.percentual - a.percentual;
	});

	return orderedStatsList;
}

type SdrConversionStatCardProps = {
	stats?: TSDRTeamResults;
	statsLoading: boolean;

	promoters: TUserDTOWithSaleGoals[];
};
function SdrConversionStatCard({ stats, statsLoading, promoters }: SdrConversionStatCardProps) {
	return (
		<div className="flex h-[400px] max-h-[600px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:h-[600px] lg:w-[50%]">
			<div className="flex items-center justify-between">
				<h1 className="text-sm font-medium uppercase tracking-tight">Conversão</h1>
				<FaPercentage />
			</div>
			<div className="overscroll-y mt-2 flex w-full grow flex-col overflow-y-auto px-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
				{statsLoading ? (
					<StatListSkeleton />
				) : (
					getPromoterListOrdenatedByKeyStat({ stats, promoters })?.map((promoter, index) => <StatListItem key={promoter.nome} promoter={promoter} promoters={promoters || []} />)
				)}
			</div>
		</div>
	);
}

export default SdrConversionStatCard;
