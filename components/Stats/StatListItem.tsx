import { getUserAvatarUrl } from "@/lib/methods/extracting";
import { formatNameAsInitials } from "@/lib/methods/formatting";
import { TUserDTOWithSaleGoals } from "@/utils/schemas/user.schema";
import { useState } from "react";
import Avatar from "../utils/Avatar";
import GoalTrackingBar from "./GoalTrackingBar";

function renderByLeadsStats({ origins }: { origins: any }) {
	const entries = Object.entries(origins);
	if (entries.length > 0) {
		const total = entries.reduce((acc, current: any) => {
			const number = current[1] || 0;
			return acc + number;
		}, 0);
		return (
			<div className="flex w-full flex-col">
				{entries.map(([inside, value], index) => (
					<div key={index} className="flex w-full justify-between">
						<p className="pl-4 text-xxs font-medium uppercase tracking-tight text-primary/70 lg:text-xs">{inside}</p>
						<h1 className="text-xs font-medium uppercase tracking-tight">{value as number}</h1>
					</div>
				))}
				<div className="flex w-full justify-between">
					<p className="pl-4 text-xxs font-bold uppercase tracking-tight text-[#15599a] lg:text-xs">TOTAL</p>
					<h1 className="text-xs font-medium uppercase tracking-tight">{total}</h1>
				</div>
			</div>
		);
	} else {
		return (
			<div className="mb-1 flex w-full items-center">
				<p className="w-full text-center text-xs italic text-primary/70 lg:text-sm">Sem resultados provindos por lead para esse indicador.</p>
			</div>
		);
	}
}
function renderByAquisitionOriginStats({ origins }: { origins: any }) {
	const entries = Object.entries(origins);
	entries.shift();
	if (entries.length > 0) {
		const total = entries.reduce((acc, current: any) => {
			const number = current[1] || 0;
			return acc + number;
		}, 0);
		return (
			<div className="flex w-full flex-col">
				{entries.map(([key, value], index) => {
					if (key != "leads")
						return (
							<div key={index} className="flex w-full justify-between">
								<p className="pl-4 text-xxs font-medium uppercase tracking-tight text-primary/70 lg:text-xs">{key}</p>
								<h1 className="text-xs font-medium uppercase tracking-tight">{value as number}</h1>
							</div>
						);
				})}
				<div className="flex w-full justify-between">
					<p className="pl-4 text-xxs font-bold uppercase tracking-tight text-[#15599a] lg:text-xs">TOTAL</p>
					<h1 className="text-xs font-medium uppercase tracking-tight">{total}</h1>
				</div>
			</div>
		);
	} else {
		return (
			<div className="mb-1 flex w-full items-center">
				<p className="w-full text-center text-xs italic text-primary/70 lg:text-sm">Sem informações sobre as fontes de aquisição desse indicador.</p>
			</div>
		);
	}
}
type StatListItemProps = {
	promoter: {
		nome: string;
		objetivo: number;
		atingido: number;
		percentual: number;
		origem?: any;
	};
	promoters: TUserDTOWithSaleGoals[];
};
function StatListItem({ promoter, promoters }: StatListItemProps) {
	const [originsVisible, setOriginsVisible] = useState<boolean>(false);
	return (
		<div className="flex w-full flex-col">
			<div className="flex w-full items-center gap-4">
				<div className="flex items-center gap-2">
					<div onClick={() => setOriginsVisible((prev) => !prev)} className="flex cursor-pointer md:hidden">
						<Avatar
							url={getUserAvatarUrl({ users: promoters, userName: promoter.nome })}
							height={20}
							width={20}
							fallback={formatNameAsInitials(promoter.nome)}
						/>
					</div>
					<p
						onClick={() => setOriginsVisible((prev) => !prev)}
						className="hidden min-w-[150px] max-w-[150px] cursor-pointer font-medium uppercase tracking-tight text-primary/70 hover:text-cyan-500 md:flex lg:text-sm"
					>
						{promoter.nome}
					</p>
				</div>
				<div className="grow">
					<GoalTrackingBar barBgColor="black" goalText={`${promoter.objetivo}`} barHeigth="25px" valueGoal={promoter.objetivo} valueHit={promoter.atingido} />
				</div>
			</div>
			{originsVisible && promoter.origem ? (
				<div className="flex w-full flex-col gap-1">
					<h1 className="w-full text-start text-xs font-bold text-primary/70 lg:text-sm">LEADS</h1>
					{renderByLeadsStats({ origins: promoter.origem.interno })}
					<h1 className="w-full text-start text-xs font-bold text-primary/70 lg:text-sm">OUTROS CANAIS DE AQUISIÇÃO</h1>
					{renderByAquisitionOriginStats({ origins: promoter.origem.externo })}
				</div>
			) : null}
		</div>
	);
}

export default StatListItem;
