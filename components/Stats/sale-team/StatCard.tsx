import React from "react";
import StatListItem from "../StatListItem";
import { IUsuario } from "@/utils/models";
import StatListSkeleton from "./StatListSkeleton";
import type { TSellerSalesResults } from "@/app/api/stats/comercial-results/sales-sellers/route";
import type { TUserDTOWithSaleGoals } from "@/utils/schemas/user.schema";
type StatCardProps = {
	label: string;
	icon: React.ReactNode;
	stats: TSellerSalesResults | undefined;
	statsLoading: boolean;
	statKey: string;
	promoters: TUserDTOWithSaleGoals[];
};
function getPromoterListOrdenatedByKeyStat({ stats, statKey }: { stats?: TSellerSalesResults; statKey: string }) {
	if (!stats) return [];
	const statsAsList = Object.entries(stats).map(([key, value]) => {
		const promoterName = key;
		const statByKey = value[statKey as keyof typeof value];

		const goal = statByKey.objetivo;
		const hit = statByKey.atingido;
		const origins = statByKey.origem;
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
			origem: origins,
		};
	});
	const orderedStatsList = statsAsList.sort((a, b) => {
		return b.atingido - a.atingido;
	});

	return orderedStatsList;
}
function StatCard({ label, stats, statsLoading, statKey, icon, promoters }: StatCardProps) {
	return (
		<div className="flex h-[400px] max-h-[600px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:h-[600px] lg:w-[50%]">
			<div className="flex items-center justify-between">
				<h1 className="text-sm font-medium uppercase tracking-tight">{label}</h1>
				{icon}
			</div>
			<div className="overscroll-y mt-2 flex w-full grow flex-col overflow-y-auto px-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
				{statsLoading ? (
					<StatListSkeleton />
				) : (
					getPromoterListOrdenatedByKeyStat({ stats, statKey })?.map((promoter, index) => <StatListItem key={index} promoter={promoter} promoters={promoters || []} />)
				)}
			</div>
		</div>
	);
}

export default StatCard;
