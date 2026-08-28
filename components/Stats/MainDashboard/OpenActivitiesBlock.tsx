"use client";

import { useQueryClient } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import ControlActivity from "@/components/Activities/ControlActivity";
import NewActivity from "@/components/Activities/NewActivity";
import ActivityCard from "@/components/Cards/ActivityCard";
import { DashboardMultiSelect } from "@/components/Stats/MainDashboard/DashboardSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TUserSession } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { useActivitiesDashboard } from "@/utils/queries/activities";
import { useUsers } from "@/utils/queries/users";
import { getActivityStatus, type TActivityDTO } from "@/utils/schemas/activities.schema";
import "dayjs/locale/pt-br";
import { CalendarDays, Check, ChevronLeft, ChevronRight, CircleDot, Clock3, LayoutList, Play, Plus, PlusCircle, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

dayjs.locale("pt-br");

type OpenActivitiesBlockProps = {
	session: TUserSession;
	period?: { after: string; before: string };
	responsibleIds?: string[] | null;
};

type ViewMode = "calendar" | "list";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const EMPTY_ACTIVITY_VINCULATIONS = {};

function OpenActivitiesBlock({ session, period, responsibleIds: parentResponsibleIds }: OpenActivitiesBlockProps) {
	const queryClient = useQueryClient();
	const initialMonth = dayjs(period?.after ?? undefined).startOf("month");
	const allowedResponsibleIds = session.user.permissoes.oportunidades.escopo ?? null;
	const [month, setMonth] = useState(initialMonth);
	const [viewMode, setViewMode] = useState<ViewMode>("calendar");
	const [responsibleIds, setResponsibleIds] = useState<string[] | null>(() => normalizeResponsibleFilter(parentResponsibleIds, allowedResponsibleIds));
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);
	const [newActivityDate, setNewActivityDate] = useState<string | false>(false);
	const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
	const [selectedDay, setSelectedDay] = useState<string | null>(null);
	const { data: users } = useUsers();

	useEffect(() => {
		if (period?.after) setMonth(dayjs(period.after).startOf("month"));
	}, [period?.after]);

	useEffect(() => {
		setPage(1);
		setResponsibleIds(normalizeResponsibleFilter(parentResponsibleIds, allowedResponsibleIds));
	}, [allowedResponsibleIds, parentResponsibleIds]);

	const params = useMemo(
		() => ({
			after: month.startOf("month").toISOString(),
			before: month.endOf("month").toISOString(),
			responsibleIds,
			page,
			search: deferredSearch,
		}),
		[deferredSearch, month, page, responsibleIds],
	);
	const dashboard = useActivitiesDashboard(params);
	const activitiesByDay = useMemo(() => {
		const result = new Map<string, TActivityDTO[]>();
		for (const activity of dashboard.data?.calendar ?? []) {
			const date = activity.agendamentoInicio ?? activity.dataVencimento;
			if (!date) continue;
			const key = dayjs(date).format("YYYY-MM-DD");
			const current = result.get(key) ?? [];
			current.push(activity);
			result.set(key, current);
		}
		return result;
	}, [dashboard.data?.calendar]);

	const availableUsers = useMemo(() => {
		return (users ?? [])
			.filter((user) => !allowedResponsibleIds || allowedResponsibleIds.includes(user._id))
			.map((user) => ({ id: user._id, value: user._id, label: user.nome }));
	}, [allowedResponsibleIds, users]);

	async function invalidateActivities() {
		await queryClient.invalidateQueries({ queryKey: ["activities-dashboard"] });
	}

	const stats = dashboard.data?.stats;
	const statItems = [
		{ label: "CRIADAS", value: stats?.createdActivitiesCount ?? 0, icon: <PlusCircle className="h-3.5 w-3.5" />, tone: "bg-primary/10" },
		{
			label: "INICIADAS",
			value: stats?.startedActivitiesCount ?? 0,
			icon: <Play className="h-3.5 w-3.5" />,
			tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
		},
		{
			label: "CONCLUÍDAS",
			value: stats?.finishedActivitiesCount ?? 0,
			icon: <Check className="h-3.5 w-3.5" />,
			tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
		},
		{
			label: "TEMPO MÉDIO",
			value: `${(stats?.avgCompletionTime ?? 0).toFixed(1)}h`,
			icon: <Clock3 className="h-3.5 w-3.5" />,
			tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
		},
		{
			label: "EM ANDAMENTO",
			value: stats?.ongoingActivitiesCount ?? 0,
			icon: <CircleDot className="h-3.5 w-3.5" />,
			tone: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
		},
		{
			label: "PENDENTES",
			value: stats?.pendingActivitiesCount ?? 0,
			icon: <CircleDot className="h-3.5 w-3.5" />,
			tone: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
		},
	];

	return (
		<div className="flex h-full min-h-[650px] w-full flex-col gap-3 rounded-xl border border-primary/20 bg-card px-3 py-4 shadow-xs lg:min-h-[500px]">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<h1 className="text-xs font-semibold uppercase tracking-tight">Atividades em aberto</h1>
					<p className="text-[0.65rem] text-primary/60">{dashboard.data?.list.activitiesMatched ?? 0} atividades no escopo atual</p>
				</div>
				<div className="flex items-center gap-1">
					<div className="hidden w-48 md:block">
						<DashboardMultiSelect
							value={responsibleIds}
							options={availableUsers}
							resetLabel="TODOS OS RESPONSÁVEIS"
							onChange={(ids) => {
								setPage(1);
								setResponsibleIds(normalizeResponsibleFilter(ids, allowedResponsibleIds));
							}}
							onReset={() => {
								setPage(1);
								setResponsibleIds(null);
							}}
						/>
					</div>
					<ViewButton active={viewMode === "calendar"} label="Calendário" onClick={() => setViewMode("calendar")}>
						<CalendarDays className="h-4 w-4" />
					</ViewButton>
					<ViewButton active={viewMode === "list"} label="Lista" onClick={() => setViewMode("list")}>
						<LayoutList className="h-4 w-4" />
					</ViewButton>
					<Button size="xs" onClick={() => setNewActivityDate("")}>
						<Plus className="h-3.5 w-3.5" />
						NOVA
					</Button>
				</div>
			</div>

			<div className="flex flex-wrap gap-1.5">
				{statItems.map((item) => (
					<div key={item.label} className={cn("inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-[0.65rem] font-semibold", item.tone)}>
						{item.icon}
						<strong className="tabular-nums">{item.value}</strong>
						<span>{item.label}</span>
					</div>
				))}
			</div>

			{viewMode === "calendar" ? (
				<ActivitiesCalendar
					month={month}
					setMonth={(nextMonth) => {
						setPage(1);
						setMonth(nextMonth);
					}}
					activitiesByDay={activitiesByDay}
					loading={dashboard.isLoading}
					onDayClick={setSelectedDay}
					onCreate={setNewActivityDate}
				/>
			) : (
				<div className="flex min-h-0 flex-1 flex-col gap-2">
					<div className="relative">
						<Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary/45" />
						<Input
							value={search}
							onChange={(event) => {
								setPage(1);
								setSearch(event.target.value);
							}}
							placeholder="Buscar atividade..."
							className="h-8 pl-8 text-xs"
						/>
					</div>
					<div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
						{dashboard.data?.list.activities.map((activity) => (
							<ActivityCard key={activity._id} activity={activity} onClick={() => setEditingActivityId(activity._id)} />
						))}
						{!dashboard.isLoading && dashboard.data?.list.activities.length === 0 ? (
							<p className="m-auto text-sm italic text-primary/60">Nenhuma atividade em aberto.</p>
						) : null}
					</div>
					{(dashboard.data?.list.totalPages ?? 0) > 1 ? (
						<div className="flex items-center justify-center gap-2">
							<Button size="xs" variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
								ANTERIOR
							</Button>
							<span className="text-xs text-primary/60">
								{page} / {dashboard.data?.list.totalPages}
							</span>
							<Button size="xs" variant="outline" disabled={page >= (dashboard.data?.list.totalPages ?? 1)} onClick={() => setPage((current) => current + 1)}>
								PRÓXIMA
							</Button>
						</div>
					) : null}
				</div>
			)}

			{selectedDay ? (
				<ActivitiesDaySheet
					date={selectedDay}
					activities={activitiesByDay.get(selectedDay) ?? []}
					onClose={() => setSelectedDay(null)}
					onCreate={() => setNewActivityDate(dayjs(selectedDay).hour(9).toISOString())}
					onEdit={setEditingActivityId}
				/>
			) : null}
			{newActivityDate !== false ? (
				<NewActivity
					session={session}
					vinculations={EMPTY_ACTIVITY_VINCULATIONS}
					initialDeadline={newActivityDate || null}
					closeModal={() => setNewActivityDate(false)}
					callbacks={{ onSettled: invalidateActivities }}
				/>
			) : null}
			{editingActivityId ? (
				<ControlActivity
					activityId={editingActivityId}
					session={session}
					vinculations={EMPTY_ACTIVITY_VINCULATIONS}
					closeModal={() => setEditingActivityId(null)}
					callbacks={{ onSettled: invalidateActivities }}
				/>
			) : null}
		</div>
	);
}

export default OpenActivitiesBlock;

function normalizeResponsibleFilter(requestedIds: string[] | null | undefined, allowedIds: string[] | null) {
	if (!requestedIds?.length) return null;
	const uniqueRequestedIds = Array.from(new Set(requestedIds));
	const scopedIds = allowedIds ? uniqueRequestedIds.filter((id) => allowedIds.includes(id)) : uniqueRequestedIds;
	if (allowedIds && allowedIds.length === scopedIds.length && allowedIds.every((id) => scopedIds.includes(id))) return null;
	return scopedIds;
}

function ViewButton({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button size="fit" variant={active ? "default" : "ghost"} className="h-7 w-7 rounded-full p-0" onClick={onClick} aria-pressed={active}>
					{children}
				</Button>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}

function ActivitiesCalendar({
	month,
	setMonth,
	activitiesByDay,
	loading,
	onDayClick,
	onCreate,
}: {
	month: Dayjs;
	setMonth: (month: Dayjs) => void;
	activitiesByDay: Map<string, TActivityDTO[]>;
	loading: boolean;
	onDayClick: (date: string) => void;
	onCreate: (date: string) => void;
}) {
	const blanks = Array.from({ length: month.startOf("month").day() });
	const days = Array.from({ length: month.daysInMonth() }, (_, index) => index + 1);
	return (
		<div className="flex min-h-0 flex-1 flex-col gap-1.5">
			<div className="flex items-center justify-between">
				<Button size="fit" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => setMonth(month.subtract(1, "month"))}>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<span className="text-xs font-semibold uppercase">{month.format("MMMM [de] YYYY")}</span>
				<Button size="fit" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => setMonth(month.add(1, "month"))}>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
			<div className="grid grid-cols-7">
				{WEEKDAYS.map((weekday) => (
					<span key={weekday} className="text-center text-[0.6rem] font-semibold uppercase text-primary/45">
						{weekday}
					</span>
				))}
			</div>
			<div className={cn("grid min-h-0 flex-1 grid-cols-7 auto-rows-fr gap-0.5 transition-opacity", loading && "opacity-40")}>
				{blanks.map((_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Empty calendar placeholders have no identity or state and only preserve the weekday offset.
					<div key={`blank-${index}`} />
				))}
				{days.map((day) => {
					const date = month.date(day);
					const key = date.format("YYYY-MM-DD");
					const activities = activitiesByDay.get(key) ?? [];
					const isToday = date.isSame(dayjs(), "day");
					return (
						// biome-ignore lint/a11y/useSemanticElements: A calendar cell contains its own create button, so rendering the whole cell as a button would create invalid nested buttons.
						<div
							key={day}
							role="button"
							tabIndex={0}
							onClick={() => onDayClick(key)}
							onKeyDown={(event) => {
								if (event.key === "Enter" || event.key === " ") onDayClick(key);
							}}
							className={cn(
								"group relative flex min-h-12 cursor-pointer flex-col justify-between rounded-md border border-primary/10 p-1 hover:bg-primary/5",
								isToday && "border-primary/50 bg-primary/10",
							)}
						>
							<div className="flex items-start justify-between">
								<button
									type="button"
									aria-label={`Criar atividade em ${date.format("DD/MM/YYYY")}`}
									onClick={(event) => {
										event.stopPropagation();
										onCreate(date.hour(9).toISOString());
									}}
									className="flex items-center rounded-full px-1 text-[0.55rem] font-semibold opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
								>
									<Plus className="h-3 w-3" />
								</button>
								<span className={cn("text-[0.65rem] font-semibold", isToday && "rounded-full bg-primary px-1 text-primary-foreground")}>{day}</span>
							</div>
							<div className="flex flex-wrap gap-0.5">
								{activities.slice(0, 5).map((activity) => (
									<span key={activity._id} className={cn("h-2 w-2 rounded-full", activityDotClass(activity))} />
								))}
								{activities.length > 5 ? <span className="text-[0.55rem] font-semibold text-primary/50">+{activities.length - 5}</span> : null}
							</div>
						</div>
					);
				})}
			</div>
			<div className="flex flex-wrap items-center gap-3 border-t border-primary/10 pt-1 text-[0.6rem] text-primary/60">
				<Legend color="bg-orange-500" label="Pendente" />
				<Legend color="bg-blue-500" label="Em andamento" />
				<Legend color="bg-emerald-500" label="Concluída" />
				<Legend color="bg-red-500" label="Prazo vencido" />
			</div>
		</div>
	);
}

function ActivitiesDaySheet({
	date,
	activities,
	onClose,
	onCreate,
	onEdit,
}: {
	date: string;
	activities: TActivityDTO[];
	onClose: () => void;
	onCreate: () => void;
	onEdit: (id: string) => void;
}) {
	const [search, setSearch] = useState("");
	const filtered = activities.filter((activity) => `${activity.titulo} ${activity.descricao}`.toLowerCase().includes(search.toLowerCase()));
	return (
		<Sheet open onOpenChange={(open) => (!open ? onClose() : undefined)}>
			<SheetContent className="flex w-full flex-col sm:max-w-xl">
				<SheetHeader>
					<SheetTitle>ATIVIDADES DO DIA</SheetTitle>
					<SheetDescription>{dayjs(date).format("DD [de] MMMM [de] YYYY")}</SheetDescription>
				</SheetHeader>
				<div className="flex items-center gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/45" />
						<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar atividade..." className="pl-8" />
					</div>
					<Button onClick={onCreate}>
						<Plus className="h-4 w-4" />
						CRIAR
					</Button>
				</div>
				<div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
					{filtered.map((activity) => (
						<ActivityCard key={activity._id} activity={activity} onClick={() => onEdit(activity._id)} />
					))}
					{filtered.length === 0 ? <p className="m-auto text-sm italic text-primary/60">Nenhuma atividade nesta data.</p> : null}
				</div>
			</SheetContent>
		</Sheet>
	);
}

function activityDotClass(activity: TActivityDTO) {
	const status = getActivityStatus(activity);
	if (status === "CONCLUIDA") return "bg-emerald-500";
	if (status === "EM_ANDAMENTO") return "bg-blue-500";
	if (activity.dataVencimento && dayjs(activity.dataVencimento).isBefore(dayjs())) return "bg-red-500";
	return "bg-orange-500";
}

function Legend({ color, label }: { color: string; label: string }) {
	return (
		<span className="inline-flex items-center gap-1">
			<span className={cn("h-2 w-2 rounded-full", color)} />
			{label}
		</span>
	);
}
