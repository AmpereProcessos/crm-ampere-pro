import { renderDateDiffText, renderIcon } from "@/lib/methods/rendering";
import { projectActivityTypes } from "@/utils/constants";
import { formatLongString } from "@/utils/methods";
import { ISession, ProjectActivity } from "@/utils/models";
import React from "react";
import Avatar from "../utils/Avatar";
import dayjs from "dayjs";
import Link from "next/link";
import type { TUserSession } from "@/lib/auth/session";
import { TOpportunityHistoryDTO } from "@/utils/schemas/opportunity-history.schema";
import { TActivityDTO } from "@/utils/schemas/activities.schema";
import { formatNameAsInitials } from "@/lib/methods/formatting";
import { BsCode } from "react-icons/bs";
type PendingActivityCardProps = {
	activity: TActivityDTO;
};
function getBarColor(dueDate?: string) {
	if (!dueDate) return "bg-green-500";
	const diffHours = dayjs(dueDate).diff(undefined, "hour");

	if (diffHours > 24) return "bg-green-500";
	if (diffHours > 0) return "bg-orange-600";
	return "bg-red-500";
}

function PendingActivityCard({ activity }: PendingActivityCardProps) {
	const info = activity as TActivityDTO;
	return (
		<div className="flex  w-full max-w-full  gap-2 rounded-md border border-gray-300 shadow-md">
			<div className={`flex h-[100%] w-[5px] rounded-bl-md rounded-tl-md ${getBarColor(info.dataVencimento || undefined)}`}></div>
			<div className="flex w-full grow flex-col gap-1 p-3 pl-1">
				<div className="flex w-full grow flex-col">
					<div className="flex items-center gap-2">
						<h1 className="w-full text-start text-xs font-bold leading-none tracking-tight ">{formatLongString(info.titulo.toUpperCase() || "", 100)}</h1>
					</div>
					{info.oportunidade.id ? (
						<Link href={`/comercial/oportunidades/id/${info.oportunidade.id}`}>
							<div className="flex items-center gap-1">
								<BsCode color="#fead41" size={15} />
								<p className="mt-1 text-xs font-bold text-gray-500 hover:text-cyan-500">{info.oportunidade.nome}</p>
							</div>
						</Link>
					) : null}

					<h1 className="my-2 w-full rounded-md bg-gray-100 p-2 py-1 text-center text-xs font-medium text-gray-500">{activity.descricao}</h1>
					<h1 className="text-xs leading-none tracking-tight text-gray-500">RESPONSÁVEIS</h1>
					<div className="flex grow flex-wrap items-center gap-2">
						{activity.responsaveis.map((resp) => (
							<div className="flex items-center gap-2 rounded-lg border border-cyan-500 p-1 px-2 shadow-md">
								<Avatar width={15} height={15} url={resp.avatar_url || undefined} fallback={formatNameAsInitials(resp.nome)} />
								<p className="text-[0.65rem] font-medium tracking-tight text-gray-500">{resp.nome}</p>
							</div>
						))}
					</div>
				</div>
				<div className="flex w-full items-center justify-end">{renderDateDiffText(info.dataVencimento || undefined)}</div>
			</div>
		</div>
	);
}

export default PendingActivityCard;
