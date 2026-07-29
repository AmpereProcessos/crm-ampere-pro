"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { CalendarClock, Check, ChevronDown, CircleDot, Clock3, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { BsCode } from "react-icons/bs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/methods/errors";
import { formatNameAsInitials } from "@/lib/methods/formatting";
import { renderDateDiffText } from "@/lib/methods/rendering";
import { cn } from "@/lib/utils";
import { formatLongString } from "@/utils/methods";
import { editActivity } from "@/utils/mutations/activities";
import { getActivityDateMode, getActivityStatus, type TActivityDTO, type TActivityStatus } from "@/utils/schemas/activities.schema";
import Avatar from "../utils/Avatar";

type ActivityCardProps = {
	activity: TActivityDTO;
	onClick?: () => void;
};
function getBarColor(activity: TActivityDTO) {
	const status = getActivityStatus(activity);
	if (status === "CONCLUIDA") return "bg-emerald-500";
	if (status === "EM_ANDAMENTO") return "bg-blue-500";
	const dueDate = activity.dataVencimento;
	if (!dueDate) return "bg-green-500";
	const diffHours = dayjs(dueDate).diff(undefined, "hour");

	if (diffHours > 24) return "bg-green-500";
	if (diffHours > 0) return "bg-orange-600";
	return "bg-red-500";
}

function ActivityCard({ activity, onClick }: ActivityCardProps) {
	const info = activity as TActivityDTO;
	const status = getActivityStatus(info);
	const dateMode = getActivityDateMode(info);
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: The card contains nested links and status controls, so a semantic button would produce invalid nested buttons.
		<div
			role={onClick ? "button" : undefined}
			tabIndex={onClick ? 0 : undefined}
			onClick={onClick}
			onKeyDown={(event) => {
				if (onClick && (event.key === "Enter" || event.key === " ")) onClick();
			}}
			className="flex w-full max-w-full gap-2 rounded-md border border-primary/30 shadow-md transition-colors hover:bg-primary/3"
		>
			<div className={`flex h-auto w-[5px] shrink-0 rounded-bl-md rounded-tl-md ${getBarColor(info)}`} />
			<div className="flex w-full grow flex-col gap-1 p-3 pl-1">
				<div className="flex w-full grow flex-col">
					<div className="flex items-center gap-2">
						<h1 className="w-full text-start text-xs font-bold leading-none tracking-tight">{formatLongString(info.titulo.toUpperCase() || "", 100)}</h1>
					</div>
					{info.oportunidade.id ? (
						<Link href={`/comercial/oportunidades/id/${info.oportunidade.id}`} onClick={(event) => event.stopPropagation()}>
							<div className="flex items-center gap-1">
								<BsCode color="#fead41" size={15} />
								<p className="text-[0.65rem] font-medium uppercase tracking-tight text-primary/70 duration-300 ease-in-out hover:text-cyan-500">
									{info.oportunidade.nome}
								</p>
							</div>
						</Link>
					) : null}

					<div className="my-2 flex flex-wrap items-center gap-1.5">
						<ActivityStatusController activity={activity} />
						{dateMode === "prazo" && info.dataVencimento ? (
							<span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[0.65rem] font-medium text-amber-700 dark:text-amber-300">
								<Clock3 className="h-3 w-3" />
								Prazo: {dayjs(info.dataVencimento).format("DD/MM, HH:mm")}
							</span>
						) : null}
						{dateMode === "agenda" && info.agendamentoInicio && info.agendamentoFim ? (
							<span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-1 text-[0.65rem] font-medium text-cyan-700 dark:text-cyan-300">
								<CalendarClock className="h-3 w-3" />
								Agenda: {dayjs(info.agendamentoInicio).format("DD/MM, HH:mm")}–{dayjs(info.agendamentoFim).format("HH:mm")}
							</span>
						) : null}
					</div>
					<h1 className="mb-2 w-full rounded-md bg-primary/10 p-2 py-1 text-center text-xs font-medium text-primary/70">{activity.descricao}</h1>
					<h1 className="text-xs leading-none tracking-tight text-primary/70">RESPONSÁVEIS</h1>
					<div className="flex grow flex-wrap items-center gap-2">
						{activity.responsaveis.map((resp) => (
							<div key={resp.id} className="flex items-center gap-2 rounded-lg border border-cyan-500 p-1 px-2 shadow-md">
								<Avatar width={15} height={15} url={resp.avatar_url || undefined} fallback={formatNameAsInitials(resp.nome)} />
								<p className="text-[0.65rem] font-medium tracking-tight text-primary/70">{resp.nome}</p>
							</div>
						))}
					</div>
				</div>
				{dateMode === "prazo" && status !== "CONCLUIDA" ? (
					<div className="flex w-full items-center justify-end">{renderDateDiffText(info.dataVencimento || undefined)}</div>
				) : null}
			</div>
		</div>
	);
}

export default ActivityCard;

const ACTIVITY_STATUS_OPTIONS: TActivityStatus[] = ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"];

function ActivityStatusController({ activity }: { activity: TActivityDTO }) {
	const queryClient = useQueryClient();
	const status = getActivityStatus(activity);
	const { mutate, isPending } = useMutation({
		mutationKey: ["update-activity-status", activity._id],
		mutationFn: editActivity,
		onError: (error) => toast.error(getErrorMessage(error)),
		onSettled: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["activities-dashboard"] }),
				queryClient.invalidateQueries({ queryKey: ["activities"] }),
				queryClient.invalidateQueries({ queryKey: ["activity-by-id", activity._id] }),
			]);
		},
	});

	function updateStatus(nextStatus: TActivityStatus) {
		if (nextStatus === status || isPending) return;
		const now = new Date().toISOString();
		const changes =
			nextStatus === "PENDENTE"
				? { dataInicio: null, dataConclusao: null }
				: nextStatus === "EM_ANDAMENTO"
					? { dataInicio: activity.dataInicio ?? now, dataConclusao: null }
					: { dataInicio: activity.dataInicio ?? now, dataConclusao: now };
		mutate({ id: activity._id, changes });
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					disabled={isPending}
					aria-label={`Alterar status da atividade. Status atual: ${getStatusLabel(status)}`}
					onClick={(event) => event.stopPropagation()}
					onKeyDown={(event) => event.stopPropagation()}
					className={cn(
						"inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[0.65rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-wait disabled:opacity-70",
						getStatusPillClass(status),
					)}
				>
					{isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <StatusIcon status={status} />}
					{getStatusLabel(status)}
					<ChevronDown className="h-3 w-3 opacity-60" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="z-110 w-56" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
				<DropdownMenuLabel className="text-xs">STATUS DA ATIVIDADE</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{ACTIVITY_STATUS_OPTIONS.map((option) => (
					<DropdownMenuItem key={option} disabled={isPending} onSelect={() => updateStatus(option)} className="justify-between">
						<span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.65rem] font-semibold", getStatusPillClass(option))}>
							<StatusIcon status={option} />
							{getStatusLabel(option)}
						</span>
						{status === option ? <Check className="h-4 w-4" /> : null}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function StatusIcon({ status }: { status: TActivityStatus }) {
	if (status === "CONCLUIDA") return <Check className="h-3 w-3" />;
	if (status === "EM_ANDAMENTO") return <CircleDot className="h-3 w-3" />;
	return <Clock3 className="h-3 w-3" />;
}

function getStatusLabel(status: TActivityStatus) {
	if (status === "CONCLUIDA") return "CONCLUÍDA";
	if (status === "EM_ANDAMENTO") return "EM ANDAMENTO";
	return "PENDENTE";
}

function getStatusPillClass(status: TActivityStatus) {
	if (status === "CONCLUIDA") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300";
	if (status === "EM_ANDAMENTO") return "border-blue-500/20 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300";
	return "border-orange-500/20 bg-orange-500/10 text-orange-700 hover:bg-orange-500/15 dark:text-orange-300";
}
