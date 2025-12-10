import { useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, Plus } from "lucide-react";
import { useState } from "react";
import { AiFillInteraction } from "react-icons/ai";
import { BsClipboardCheck } from "react-icons/bs";
import { TbNotes } from "react-icons/tb";
import type { TUserSession } from "@/lib/auth/session";

import { useOpportunityHistoryAndActivities } from "@/utils/queries/opportunity-history";
import type { TActivityDTO } from "@/utils/schemas/activities.schema";
import type { TOpportunityHistoryDTO } from "@/utils/schemas/opportunity-history.schema";
import NewActivity from "../../Activities/NewActivity";
import OpportunityActivity from "../../Cards/OpportunityActivity";
import OpportunityHistoryCard from "../../Cards/OpportunityHistory";
import NewOpportunityHistory from "../../OpportunityHistories/NewOpportunityHistory";
import { Button } from "../../ui/button";
import ErrorComponent from "../../utils/ErrorComponent";
import LoadingComponent from "../../utils/LoadingComponent";

type OpportunityHistoryProps = {
	opportunityName: string;
	opportunityId: string;
	opportunityIdentifier: string;
	session: TUserSession;
};
function OpportunityHistory({ session, opportunityName, opportunityId, opportunityIdentifier }: OpportunityHistoryProps) {
	const queryClient = useQueryClient();
	const { data: historyAndActivities, isLoading, isError, isSuccess } = useOpportunityHistoryAndActivities({ opportunityId: opportunityId });

	const handleOnMutate = async () =>
		await queryClient.cancelQueries({
			queryKey: ["opportunity-history-and-activities", opportunityId],
		});
	const handleOnSettled = async () =>
		await queryClient.invalidateQueries({
			queryKey: ["opportunity-history-and-activities", opportunityId],
		});
	// In open activities using activities with no conclusion date defined
	const openActivities = historyAndActivities?.filter((h) => !!(h as TActivityDTO).responsaveis && !(h as TActivityDTO).dataConclusao);
	// In history, considering both opportunity history and closed opportunities
	const history = historyAndActivities?.filter(
		(h) =>
			(h as TOpportunityHistoryDTO).categoria === "ANOTAÇÃO" || (h as TOpportunityHistoryDTO).categoria === "INTERAÇÃO" || !!(h as TActivityDTO).dataConclusao,
	);
	const [view, setView] = useState<"NEW NOTE" | "NEW ACTIVITY" | "NEW INTERACTION" | null>(null);

	return (
		<div className={"bg-card border-primary/20 flex w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs"}>
			<div className="flex items-center justify-between flex-col lg:flex-row gap-2">
				<h1 className="text-xs font-bold tracking-tight uppercase">HISTÓRICO</h1>
				<div className="flex items-center gap-x-2 flex-wrap gap-y-1">
					<Button
						variant="ghost"
						size={"xs"}
						className="flex items-center gap-1"
						onClick={() => setView((prev) => (prev === "NEW INTERACTION" ? null : "NEW INTERACTION"))}
					>
						<AiFillInteraction className="h-4 w-4 min-h-4 min-w-4" />
						<p className="text-xs font-medium">NOVA INTERAÇÃO</p>
					</Button>
					<Button
						variant="ghost"
						size={"xs"}
						className="flex items-center gap-1"
						onClick={() => setView((prev) => (prev === "NEW ACTIVITY" ? null : "NEW ACTIVITY"))}
					>
						<ClipboardCheck className="h-4 w-4 min-h-4 min-w-4" />
						<p className="text-xs font-medium">NOVA ATIVIDADE</p>
					</Button>
					<Button variant="ghost" size={"xs"} className="flex items-center gap-1" onClick={() => setView((prev) => (prev === "NEW NOTE" ? null : "NEW NOTE"))}>
						<TbNotes className="h-4 w-4 min-h-4 min-w-4" />
						<p className="text-xs font-medium">NOVA ANOTAÇÃO</p>
					</Button>
				</div>
			</div>
			{view === "NEW NOTE" || view === "NEW INTERACTION" ? (
				<NewOpportunityHistory
					initialCategory={view === "NEW NOTE" ? "ANOTAÇÃO" : "INTERAÇÃO"}
					session={session}
					opportunity={{
						id: opportunityId,
						nome: opportunityName,
						identificador: opportunityIdentifier,
					}}
					callbacks={{
						onMutate: handleOnMutate,
						onSettled: handleOnSettled,
					}}
					closeModal={() => setView(null)}
				/>
			) : null}
			{view === "NEW ACTIVITY" ? (
				<NewActivity
					session={session}
					vinculations={{
						opportunity: {
							blocked: true,
							id: opportunityId,
							name: opportunityName,
							identifier: opportunityIdentifier,
						},
					}}
					callbacks={{
						onMutate: handleOnMutate,
						onSettled: handleOnSettled,
					}}
					closeModal={() => setView(null)}
				/>
			) : null}

			<div className="flex w-full grow flex-col gap-2">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent /> : null}
				{isSuccess ? (
					<>
						{/** OPEN ACTIVITIES BLOCK */}
						{openActivities && openActivities.length > 0 ? (
							<div className="flex w-full flex-col gap-2">
								<h1 className="w-full text-start font-medium">Atividades em aberto</h1>
								{openActivities.map((activity) => (
									<OpportunityActivity
										key={activity._id}
										activity={activity as TActivityDTO}
										opportunityId={opportunityId}
										session={session}
										callbacks={{
											onMutate: handleOnMutate,
											onSettled: handleOnSettled,
										}}
									/>
								))}
								<div className="my-4 h-1 w-full rounded-sm bg-primary/30" />
							</div>
						) : null}

						{/** GENERAL HISTORY BLOCK */}
						{history ? (
							history.length > 0 ? (
								history.map((history) => {
									if ((history as TActivityDTO).dataConclusao)
										return (
											<OpportunityActivity
												key={history._id}
												activity={history as TActivityDTO}
												opportunityId={opportunityId}
												session={session}
												callbacks={{
													onMutate: handleOnMutate,
													onSettled: handleOnSettled,
												}}
											/>
										);
									return (
										<OpportunityHistoryCard
											key={history._id}
											session={session}
											history={history as TOpportunityHistoryDTO}
											callbacks={{
												onMutate: handleOnMutate,
												onSettled: handleOnSettled,
											}}
										/>
									);
								})
							) : (
								<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
									Não foram encontrados registros do histórico dessa oportunidade.
								</p>
							)
						) : null}
					</>
				) : null}
			</div>
		</div>
	);
}

export default OpportunityHistory;
