import React, { useState } from "react";
import { BsClipboardCheck } from "react-icons/bs";
import { TbNotes } from "react-icons/tb";

import { useQueryClient } from "@tanstack/react-query";

import LoadingComponent from "../utils/LoadingComponent";

import type { TUserSession } from "@/lib/auth/session";
import type { TOpportunityHistoryDTO } from "@/utils/schemas/opportunity-history.schema";

import { useOpportunityHistoryAndActivities } from "@/utils/queries/opportunity-history";
import ErrorComponent from "../utils/ErrorComponent";

import NewOpportunityActivityMenu from "../Activities/NewOpportunityActivityMenu";
import NewOpportunityNoteMenu from "../OpportunityHistories/NewNoteMenu";
import type { TActivityDTO } from "@/utils/schemas/activities.schema";
import OpportunityActivity from "../Cards/OpportunityActivity";
import OpportunityHistoryCard from "../Cards/OpportunityHistory";
import { AnimatePresence } from "framer-motion";
import NewOpportunityInteractionMenu from "../OpportunityHistories/NewInteractionMenu";
import { AiFillInteraction } from "react-icons/ai";
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

	// In open activities using activities with no conclusion date defined
	const openActivities = historyAndActivities?.filter((h) => !!(h as TActivityDTO).responsaveis && !(h as TActivityDTO).dataConclusao);
	// In history, considering both opportunity history and closed opportunities
	const history = historyAndActivities?.filter(
		(h) => (h as TOpportunityHistoryDTO).categoria === "ANOTAÇÃO" || (h as TOpportunityHistoryDTO).categoria === "INTERAÇÃO" || !!(h as TActivityDTO).dataConclusao,
	);
	const [view, setView] = useState<"NEW NOTE" | "NEW ACTIVITY" | "NEW INTERACTION" | null>(null);
	console.log("ACTIVITIES", openActivities);
	console.log("HISTORY", history);
	return (
		<div className="flex w-full flex-col gap-2 rounded-md border border-gray-200 bg-[#fff] p-3 shadow-lg">
			<div className="flex h-fit flex-col items-center justify-between border-b border-gray-200 pb-2 lg:h-[40px] lg:flex-row">
				<h1 className="font-bold text-black">Histórico</h1>
				<div className="mt-2 flex w-full grow flex-col items-center justify-end gap-2 lg:mt-0 lg:w-fit lg:flex-row">
					<button
						type="button"
						onClick={() => {
							setView((prev) => (prev === "NEW INTERACTION" ? null : "NEW INTERACTION"));
						}}
						className="flex w-full items-center justify-center gap-2 rounded bg-[#15599a] p-1.5 font-medium text-white hover:bg-blue-800 lg:w-fit"
					>
						<AiFillInteraction />
						<p className="text-xs font-normal">Nova Interação</p>
					</button>
					<button
						type="button"
						onClick={() => {
							setView((prev) => (prev === "NEW ACTIVITY" ? null : "NEW ACTIVITY"));
						}}
						className="flex w-full items-center justify-center gap-2 rounded bg-[#15599a] p-1.5 font-medium text-white hover:bg-blue-800 lg:w-fit"
					>
						<BsClipboardCheck />
						<p className="text-xs font-normal">Nova Atividade</p>
					</button>
					<button
						type="button"
						onClick={() => {
							setView((prev) => (prev === "NEW NOTE" ? null : "NEW NOTE"));
						}}
						className="flex w-full items-center justify-center gap-2 rounded bg-[#15599a] p-1.5 font-medium text-white hover:bg-blue-800 lg:w-fit"
					>
						<TbNotes />
						<p className="text-xs font-normal">Nova Anotação</p>
					</button>
				</div>
			</div>
			<AnimatePresence>
				{view === "NEW ACTIVITY" ? <NewOpportunityActivityMenu session={session} opportunity={{ id: opportunityId, nome: opportunityName }} closeMenu={() => setView(null)} /> : null}
				{view === "NEW NOTE" ? (
					<NewOpportunityNoteMenu session={session} opportunity={{ id: opportunityId, nome: opportunityName, identificador: opportunityIdentifier }} closeMenu={() => setView(null)} />
				) : null}
				{view === "NEW INTERACTION" ? (
					<NewOpportunityInteractionMenu
						session={session}
						opportunity={{ id: opportunityId, nome: opportunityName, identificador: opportunityIdentifier }}
						closeMenu={() => setView(null)}
					/>
				) : null}
			</AnimatePresence>

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
									<OpportunityActivity key={activity._id} activity={activity as TActivityDTO} opportunityId={opportunityId} />
								))}
								<div className="my-4 h-1 w-full rounded bg-gray-300" />
							</div>
						) : null}

						{/** GENERAL HISTORY BLOCK */}
						{history ? (
							history.length > 0 ? (
								history.map((history) => {
									if ((history as TActivityDTO).dataConclusao) return <OpportunityActivity key={history._id} activity={history as TActivityDTO} opportunityId={opportunityId} />;
									return <OpportunityHistoryCard key={history._id} history={history as TOpportunityHistoryDTO} />;
								})
							) : (
								<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-gray-500">
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
