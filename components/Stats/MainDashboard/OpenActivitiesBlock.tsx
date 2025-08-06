import ActivityCard from "@/components/Cards/ActivityCard";
import PendingActivityCard from "@/components/ProjectEvents/PendingActivityCard";
import { useActivities, useActivitiesByOpportunityId } from "@/utils/queries/activities";
import type { TUserSession } from "@/lib/auth/session";
import React from "react";
import { BsCheckSquare } from "react-icons/bs";

type OpenActivitiesBlockProps = {
	session: TUserSession;
};
function OpenActivitiesBlock({ session }: OpenActivitiesBlockProps) {
	const scope = session.user.permissoes.oportunidades.escopo;
	const { data: activities } = useActivities({ responsibleIds: scope ? scope : null, openOnly: true });
	return (
		<div className="flex h-[650px] w-full flex-col rounded-xl  border border-gray-300 bg-[#fff] p-6 shadow-md lg:h-[450px]">
			<div className="flex min-h-[42px] w-full flex-col">
				<div className="flex items-center justify-between">
					<h1 className="text-sm font-medium uppercase tracking-tight">ATIVIDADES EM ABERTO</h1>
					<BsCheckSquare />
				</div>
				<p className="text-sm text-gray-500">{activities?.length || 0} em aberto</p>
			</div>
			<div className="flex grow flex-col justify-start gap-2 overflow-y-auto overscroll-y-auto py-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
				{activities ? (
					activities.length > 0 ? (
						activities.map((activity, index: number) => <ActivityCard key={activity._id} activity={activity} />)
					) : (
						<div className="flex grow items-center justify-center">
							<p className="text-center text-sm italic text-gray-500">Sem atividades em aberto.</p>
						</div>
					)
				) : null}
			</div>
		</div>
	);
}

export default OpenActivitiesBlock;
