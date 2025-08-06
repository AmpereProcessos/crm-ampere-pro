import PPSCallCard from "@/components/Cards/OpportunityPPSCall";
import PPSCall from "@/components/Cards/PPSCall";
import { usePPSCalls } from "@/utils/queries/pps-calls";
import type { TUserSession } from "@/lib/auth/session";
import React from "react";
import { GiBugleCall } from "react-icons/gi";
import { MdOutlineAttachMoney } from "react-icons/md";

type PPSOpenCallsBlockProps = {
	session: TUserSession;
};
function PPSOpenCallsBlock({ session }: PPSOpenCallsBlockProps) {
	const scope = session.user.permissoes.oportunidades.escopo;
	const { data: calls } = usePPSCalls({ applicantId: scope ? session.user.id : null, openOnly: true });

	return (
		<div className="flex h-[650px] w-full flex-col rounded-xl  border border-gray-300 bg-[#fff] p-6 shadow-md lg:h-[450px]">
			<div className="flex min-h-[42px] w-full flex-col">
				<div className="flex items-center justify-between">
					<h1 className="text-sm font-medium uppercase tracking-tight">Chamados</h1>
					<GiBugleCall />
				</div>
				<p className="text-sm text-gray-500">{calls?.length || 0} em aberto</p>
			</div>
			<div className="flex grow flex-col justify-start gap-2 overflow-y-auto overscroll-y-auto py-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
				{calls?.map((call, index: number) => (
					<PPSCall key={call._id} call={call} />
				))}
			</div>
		</div>
	);
}

export default PPSOpenCallsBlock;
