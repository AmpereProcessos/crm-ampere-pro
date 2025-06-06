import React, { useState } from "react";
import { VscChromeClose } from "react-icons/vsc";

import type { TUserSession } from "@/lib/auth/session";

import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";
import SimplifiedActivityCard from "../Opportunities/SimplifiedActivityCard";
import { useActivitiesByOpportunityId } from "@/utils/queries/activities";
import { TActivityDTO } from "@/utils/schemas/activities.schema";
type OpportunityOpenActivitesProps = {
	opportunityId: string;
	session: TUserSession;
	closeModal: () => void;
};
function OpportunityOpenActivites({ opportunityId, session, closeModal }: OpportunityOpenActivitesProps) {
	const { data: activities, isSuccess, isLoading, isError } = useActivitiesByOpportunityId({ opportunityId });

	return (
		<div id="dropdown" className="absolute -right-10 z-10 flex w-64 list-none flex-col divide-y divide-gray-100 rounded bg-white text-base shadow">
			<div className="flex w-full flex-col p-1">
				<div className="flex w-full justify-between border-b border-gray-200 pb-1">
					<h1 className="text-xs font-medium text-gray-700">ATIVIDADES</h1>
					<button
						onClick={() => {
							closeModal();
						}}
						type="button"
						className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
					>
						<VscChromeClose style={{ color: "red", fontSize: "12px" }} />
					</button>
				</div>
				<div className="flex w-full flex-col gap-1 py-2">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Erro ao buscar atividades da oportunidade." /> : null}
					{isSuccess ? activities.map((activity) => <SimplifiedActivityCard activity={activity as TActivityDTO} opportunityId={opportunityId} />) : null}
				</div>
			</div>
		</div>
	);
}

export default OpportunityOpenActivites;
