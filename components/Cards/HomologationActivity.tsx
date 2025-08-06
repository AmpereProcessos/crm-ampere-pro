import React from "react";
import Avatar from "../utils/Avatar";
import { TActivityDTO } from "@/utils/schemas/activities.schema";
import { BsCalendar4Event, BsCalendarCheck, BsCalendarPlus, BsCheck } from "react-icons/bs";
import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useQueryClient } from "@tanstack/react-query";
import { editActivity } from "@/utils/mutations/activities";

type HomologationActivityProps = {
	homologationId: string;
	activity: TActivityDTO;
};
function HomologationActivity({ homologationId, activity }: HomologationActivityProps) {
	const queryClient = useQueryClient();

	const { mutate: handleUpdateActivity } = useMutationWithFeedback({
		mutationKey: ["edit-activity", activity._id],
		mutationFn: editActivity,
		queryClient: queryClient,
		affectedQueryKey: ["homologation-activities", homologationId],
	});
	return (
		<div className="flex w-full flex-col rounded border border-gray-300 p-3 shadow-md">
			<div className="flex w-full items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<div
						className={`flex h-[16px] w-[16px] cursor-pointer items-center justify-center rounded-full border border-black`}
						onClick={() =>
							// @ts-ignore
							handleUpdateActivity({ id: activity._id, changes: { dataConclusao: activity.dataConclusao ? null : new Date().toISOString() } })
						}
					>
						{activity.dataConclusao ? <BsCheck style={{ color: "black" }} /> : null}
					</div>
					<p
						className={"cursor-pointer text-sm font-medium leading-none"}
						onClick={() =>
							// @ts-ignore
							handleUpdateActivity({ id: activity._id, changes: { dataConclusao: activity.dataConclusao ? null : new Date().toISOString() } })
						}
					>
						{activity.titulo}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{activity.dataVencimento ? (
						<div className="flex items-center gap-1 text-orange-500">
							<BsCalendar4Event color="rgb(249,115,22)" size={17} />
							<p className="text-xs font-medium text-gray-500">{formatDateAsLocale(activity.dataVencimento, true)}</p>
						</div>
					) : null}
					{activity.dataConclusao ? (
						<div className="flex items-center gap-1">
							<BsCalendarCheck color="rgb(34,197,94)" />
							<p className="text-xs font-medium text-gray-500">{formatDateAsLocale(activity.dataConclusao, true)}</p>
						</div>
					) : null}
				</div>
			</div>
			<h1 className="my-2 w-full rounded-md bg-gray-100 p-2 py-1 text-center text-xs font-medium text-gray-500">{activity.descricao}</h1>
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<div className="flex grow items-center gap-1">
					<h1 className="mr-2 text-sm leading-none tracking-tight text-gray-500">RESPONSÁVEIS</h1>
					<div className="flex grow items-center gap-2">
						{activity.responsaveis.map((resp) => (
							<div className="flex items-center gap-2 rounded-lg border border-cyan-500 p-1 px-2 shadow-md">
								<Avatar width={20} height={20} url={resp.avatar_url || undefined} fallback={formatNameAsInitials(resp.nome)} />
								<p className="text-xs font-medium tracking-tight text-gray-500">{resp.nome}</p>
							</div>
						))}
					</div>
				</div>
				<div className="flex w-full items-center justify-end gap-1 lg:w-fit">
					<BsCalendarPlus />
					<h1 className="mr-2 text-xs font-medium tracking-tight text-gray-500">{formatDateAsLocale(activity.dataInsercao, true)}</h1>
					<h1 className="hidden text-sm leading-none tracking-tight text-gray-500 lg:flex">CRIADO POR</h1>
					<Avatar width={20} height={20} url={activity.autor.avatar_url || ""} fallback={formatNameAsInitials(activity.autor.nome)} />
					<h1 className="text-xs font-medium tracking-tight text-gray-500">{activity.autor.nome}</h1>
				</div>
			</div>
		</div>
	);
}

export default HomologationActivity;
