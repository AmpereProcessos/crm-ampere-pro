import { getFormattedTextFromHoursAmount } from "@/lib/methods/dates";
import { formatDecimalPlaces } from "@/lib/methods/formatting";
import type { TByFunnelResults } from "@/app/api/stats/comercial-results/sales-funnels/route";
import { formatToMoney } from "@/utils/methods";
import React from "react";
import { BsFillBookmarkFill } from "react-icons/bs";
import { MdTimer } from "react-icons/md";
import { TbDownload, TbUpload } from "react-icons/tb";
import { VscChromeClose } from "react-icons/vsc";

type FunnelStageStatsCardProps = {
	stage: TByFunnelResults[number]["stages"][number];
};
function FunnelStageStatsCard({ stage }: FunnelStageStatsCardProps) {
	return (
		<div className={`flex w-[350px] min-w-[350px] max-w-[350px] grow flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm`}>
			<div className="flex w-full items-center justify-between">
				<h1 className="text-sm font-medium uppercase tracking-tight">{stage.stage}</h1>
				<BsFillBookmarkFill />
			</div>
			<div className="flex w-full flex-col">
				<h1 className="text-xs tracking-tight text-gray-500">EM GERENCIAMENTO</h1>
				<h1 className="text-center text-2xl font-bold text-[#15599a]">{stage.emAndamento}</h1>
				<h1 className="text-center text-2xl font-bold text-green-800">{formatToMoney(stage.valor)}</h1>
			</div>
			<div className="mt-2 flex w-full flex-col">
				<h1 className="text-xs tracking-tight text-gray-500">MÉTRICAS DO PERÍODO</h1>
				<div className="flex w-full items-center justify-between gap-2">
					<div className="flex items-center gap-1">
						<TbDownload color="rgb(22,163,74)" />
						<p className="text-sm text-gray-500">{stage.entradas || "-"}</p>
					</div>
					<div className="flex items-center gap-1">
						<TbUpload color="rgb(220,38,38)" />
						<p className="text-sm text-gray-500">{stage.saidas || "-"}</p>
					</div>
					<div className="flex items-center gap-1">
						<MdTimer color="rgb(37,99,235)" />
						<p className="text-sm text-gray-500">{stage.tempoMedio ? `${getFormattedTextFromHoursAmount({ hours: stage.tempoMedio, onlyComplete: true, reference: "auto" })}` : "-"}</p>
					</div>
					<div className="flex items-center gap-1">
						<VscChromeClose color="#F31559" />
						<p className="text-sm text-gray-500">{stage.perdas.total}</p>
					</div>
				</div>
			</div>
			<div className="mt-2 flex w-full flex-col">
				<h1 className="text-[0.55rem] tracking-tight text-gray-500">PERDAS POR MOTIVO</h1>
				<div className="flex w-full flex-wrap items-start justify-start gap-2">
					{Object.entries(stage.perdas.perdasPorMotivo)
						.sort(([aKey, aValue], [bKey, bValue]) => bValue - aValue)
						.map(([key, value], index) => (
							<div key={index} className="flex items-center gap-1 rounded border border-[#F31559]">
								<div className="h-full bg-[#F31559] p-1 text-[0.55rem] font-bold text-white">{value}</div>
								<h1 className="p-1 text-[0.55rem]">{key}</h1>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}

export default FunnelStageStatsCard;
