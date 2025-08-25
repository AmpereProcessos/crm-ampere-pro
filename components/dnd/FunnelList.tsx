import React from "react";
import FunnelListItem from "./FunnelListItem";
import { Droppable } from "react-beautiful-dnd";
import { ProjectActivity } from "@/utils/models";
import { ImPower } from "react-icons/im";
import { MdDashboard } from "react-icons/md";
import type { TOpportunityDTO, TOpportunityDTOWithFunnelReferenceAndActivitiesByStatus } from "@/utils/schemas/opportunity.schema";

import type { TUserSession } from "@/lib/auth/session";

interface IFunnelListProps {
	stageName: string;
	id: string | number;
	session: TUserSession;
	items: {
		id: number | string;
		idOportunidade: string;
		nome: string;
		identificador?: string;
		tipo: string;
		responsaveis: TOpportunityDTO["responsaveis"];
		idIndicacao?: string;
		idMarketing?: string;
		statusAtividades?: TOpportunityDTOWithFunnelReferenceAndActivitiesByStatus["statusAtividades"];
		proposta?: {
			nome: string;
			valor: number;
			potenciaPico?: number | null;
		};
		ganho?: boolean;
		perca?: boolean;
		contratoSolicitado?: boolean;
		dataInsercao: string;
	}[];
}
function FunnelList({ stageName, session, items, id }: IFunnelListProps) {
	const cumulativeValues = React.useMemo(() => {
		const totalValue = items.reduce((sum, item) => {
			return sum + (item?.proposta?.valor || 0);
		}, 0);

		const totalPeakPower = items.reduce((sum, item) => {
			return sum + (item?.proposta?.potenciaPico || 0);
		}, 0);

		return {
			formattedValue: totalValue.toLocaleString("pt-br", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}),
			formattedPeakPower: totalPeakPower.toLocaleString("pt-br", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}),
			itemCount: items.length,
		};
	}, [items]);
	return (
		<Droppable droppableId={id.toString()} isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
			{(provided) => (
				<div className="flex w-full min-w-[375px] flex-col p-2 px-4 lg:w-[375px]">
					<div className="flex h-[100px] w-full flex-col rounded-sm bg-[#15599a] px-2 lg:h-[60px]">
						<h1 className="w-full rounded-sm p-1 text-center font-medium text-white">{stageName}</h1>
						<div className="mt-1 flex w-full flex-col items-center justify-between px-2 pb-2 lg:flex-row">
							<div className="flex w-full items-center justify-center gap-1 text-[0.65rem] text-white lg:w-1/3 lg:justify-start lg:text-[0.7rem]">
								<p>R$</p>
								<p>{cumulativeValues.formattedValue}</p>
							</div>
							<div className="flex w-full items-center justify-center gap-1 text-[0.65rem] text-white lg:w-1/3 lg:text-[0.7rem]">
								<p>
									<ImPower />
								</p>
								<p>{cumulativeValues.formattedPeakPower} kWp</p>
							</div>
							<div className="flex w-full items-center justify-center gap-1 text-[0.65rem] text-white lg:w-1/3 lg:justify-end lg:text-[0.7rem]">
								<p>
									<MdDashboard />
								</p>
								<p>{items.length}</p>
							</div>
						</div>
					</div>
					<div ref={provided.innerRef} {...provided.droppableProps} className="my-1 flex flex-col gap-2 ">
						{items.map((item, index) => (
							<FunnelListItem key={`${item.id}-${index}`} item={item} session={session} index={index} />
						))}
						{provided.placeholder}
					</div>
				</div>
			)}
		</Droppable>
	);
}

export default FunnelList;
