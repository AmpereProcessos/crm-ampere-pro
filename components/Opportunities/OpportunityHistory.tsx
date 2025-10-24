import { useState } from "react";
import { BsClipboardCheck } from "react-icons/bs";
import { TbNotes } from "react-icons/tb";

import { useQueryClient } from "@tanstack/react-query";

import LoadingComponent from "../utils/LoadingComponent";

import type { TUserSession } from "@/lib/auth/session";
import type { TOpportunityHistoryDTO } from "@/utils/schemas/opportunity-history.schema";

import { useOpportunityHistoryAndActivities } from "@/utils/queries/opportunity-history";
import ErrorComponent from "../utils/ErrorComponent";

import type { TActivityDTO } from "@/utils/schemas/activities.schema";
import { AiFillInteraction } from "react-icons/ai";
import NewActivity from "../Activities/NewActivity";
import OpportunityActivity from "../Cards/OpportunityActivity";
import OpportunityHistoryCard from "../Cards/OpportunityHistory";
import NewOpportunityHistory from "../OpportunityHistories/NewOpportunityHistory";
type GetInitialState = {
	type?: "ATIVIDADE" | "ANOTAÇÃO";
	project: {
		id: string;
		name: string;
		identifier: string;
	};
	session: TUserSession;
};

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
		<div className="flex w-full flex-col gap-2 rounded-md border border-primary/30 bg-background p-3 shadow-lg">
			<div className="flex h-fit flex-col items-center justify-between border-b border-primary/30 pb-2 lg:h-[40px] lg:flex-row">
				<h1 className="font-bold text-primary">Histórico</h1>
				<div className="mt-2 flex w-full grow flex-col items-center justify-end gap-2 lg:mt-0 lg:w-fit lg:flex-row">
					<button
						type="button"
						onClick={() => {
							setView((prev) => (prev === "NEW INTERACTION" ? null : "NEW INTERACTION"));
						}}
						className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#15599a] text-white p-1.5 font-medium hover:bg-blue-800 lg:w-fit"
					>
						<AiFillInteraction />
						<p className="text-xs font-normal">Nova Interação</p>
					</button>
					<button
						type="button"
						onClick={() => {
							setView((prev) => (prev === "NEW ACTIVITY" ? null : "NEW ACTIVITY"));
						}}
						className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#15599a] text-white p-1.5 font-medium hover:bg-blue-800 lg:w-fit"
					>
						<BsClipboardCheck />
						<p className="text-xs font-normal">Nova Atividade</p>
					</button>
					<button
						type="button"
						onClick={() => {
							setView((prev) => (prev === "NEW NOTE" ? null : "NEW NOTE"));
						}}
						className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#15599a] text-white p-1.5 font-medium hover:bg-blue-800 lg:w-fit"
					>
						<TbNotes />
						<p className="text-xs font-normal">Nova Anotação</p>
					</button>
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
