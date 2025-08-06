import React, { useState } from "react";
import Avatar from "../utils/Avatar";
import type { TActivityDTO } from "@/utils/schemas/activities.schema";
import { BsCalendar4Event, BsCalendarCheck, BsCalendarPlus, BsCheck, BsPencil } from "react-icons/bs";
import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editActivity } from "@/utils/mutations/activities";
import { Button } from "../ui/button";
import ControlActivity from "../Activities/ControlActivity";
import type { TUserSession } from "@/lib/auth/session";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/methods/errors";
import { Pencil } from "lucide-react";

type OpportunityActivityProps = {
	opportunityId: string;
	activity: TActivityDTO;
	session: TUserSession;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
	};
};
function OpportunityActivity({ opportunityId, activity, session, callbacks }: OpportunityActivityProps) {
	const queryClient = useQueryClient();

	const [editActivityModalIsOpen, setEditActivityModalIsOpen] = useState(false);
	const { mutate: handleUpdateActivity } = useMutation({
		mutationKey: ["edit-activity", activity._id],
		mutationFn: editActivity,
		onMutate: async () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess(data, variables, context) {
			if (callbacks?.onSuccess) callbacks.onSuccess();
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError(error, variables, context) {
			const msg = getErrorMessage(error);
			return toast.error(msg);
		},
	});
	return (
		<div className="flex w-full flex-col rounded border border-gray-300 p-3 shadow-md">
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<div className="flex items-center gap-2">
					<button
						type="button"
						className={"flex h-[16px] w-[16px] cursor-pointer items-center justify-center rounded-full border border-black"}
						onClick={() =>
							// @ts-ignore
							handleUpdateActivity({ id: activity._id, changes: { dataConclusao: activity.dataConclusao ? null : new Date().toISOString() } })
						}
					>
						{activity.dataConclusao ? <BsCheck style={{ color: "black" }} /> : null}
					</button>
					<button
						type="button"
						className={"cursor-pointer text-sm font-medium leading-none"}
						onClick={() =>
							// @ts-ignore
							handleUpdateActivity({ id: activity._id, changes: { dataConclusao: activity.dataConclusao ? null : new Date().toISOString() } })
						}
					>
						{activity.titulo}
					</button>
				</div>
				<div className="flex items-center gap-2">
					{activity.dataVencimento ? (
						<div className="flex items-center gap-1 text-orange-500">
							<BsCalendar4Event color="rgb(249,115,22)" size={17} />
							<p className="text-[0.55rem] font-medium text-gray-500 lg:text-xs">{formatDateAsLocale(activity.dataVencimento, true)}</p>
						</div>
					) : null}
					{activity.dataConclusao ? (
						<div className="flex items-center gap-1">
							<BsCalendarCheck color="rgb(34,197,94)" />
							<p className="text-[0.55rem] font-medium text-gray-500 lg:text-xs">{formatDateAsLocale(activity.dataConclusao, true)}</p>
						</div>
					) : null}
					<Button onClick={() => setEditActivityModalIsOpen(true)} variant="ghost" size="fit" className="rounded-full p-1">
						<Pencil className="h-4 w-4 min-w-4 min-h-4" />
					</Button>
				</div>
			</div>
			<h1 className="my-2 w-full rounded-md bg-gray-100 p-2 py-1 text-center text-xs font-medium text-gray-500">{activity.descricao}</h1>
			<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
				<div className="flex grow flex-col items-center gap-1 lg:flex-row">
					<h1 className="mr-2 text-[0.6rem] leading-none tracking-tight text-gray-500 lg:text-xs">RESPONSÁVEIS</h1>
					<div className="flex grow flex-wrap items-center gap-2">
						{activity.responsaveis.map((resp) => (
							<div key={resp.id} className="flex items-center gap-2 rounded-lg border border-cyan-500 p-1 px-2 shadow-md">
								<Avatar width={20} height={20} url={resp.avatar_url || undefined} fallback={formatNameAsInitials(resp.nome)} />
								<p className="text-[0.65rem] font-medium tracking-tight text-gray-500 lg:text-xs">{resp.nome}</p>
							</div>
						))}
					</div>
				</div>
				<div className="mt-2 flex min-w-fit grow flex-col items-center justify-end gap-1 lg:mt-0 lg:flex-row">
					<div className="flex items-center gap-1">
						<BsCalendarPlus />
						<h1 className="mr-2 text-[0.65rem] font-medium tracking-tight text-gray-500 lg:text-xs">{formatDateAsLocale(activity.dataInsercao, true)}</h1>
					</div>
					<div className="flex items-center gap-1">
						<h1 className="text-[0.65rem] leading-none tracking-tight text-gray-500 lg:text-xs">CRIADO POR</h1>
						<Avatar width={20} height={20} url={activity.autor.avatar_url || ""} fallback={formatNameAsInitials(activity.autor.nome)} />
						<h1 className="text-[0.65rem] font-medium tracking-tight text-gray-500 lg:text-xs">{activity.autor.nome}</h1>
					</div>
				</div>
			</div>
			{editActivityModalIsOpen ? (
				<ControlActivity activityId={activity._id} session={session} vinculations={{}} closeModal={() => setEditActivityModalIsOpen(false)} callbacks={callbacks} />
			) : null}
		</div>
	);
}

export default OpportunityActivity;
