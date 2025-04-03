import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { Sidebar } from "@/components/Sidebar";

import LoadingPage from "@/components/utils/LoadingPage";

import ProposalPage from "@/components/Proposal/ProposalPage";

function Proposal() {
	const { data: session, status } = useSession({ required: true });
	const { query } = useRouter();

	const proposalId = query.id;
	if (status !== "authenticated") return <LoadingPage />;
	if (!proposalId || typeof proposalId !== "string")
		return (
			<div className="flex h-full flex-col md:flex-row">
				<Sidebar session={session} />
				<div className="flex w-full max-w-full grow flex-col items-center justify-center overflow-x-hidden bg-[#f8f9fa] p-6">
					<p className="text-lg italic text-gray-700">Oops, ID inválido.</p>
				</div>
			</div>
		);
	return <ProposalPage proposalId={proposalId} session={session} />;
}

export default Proposal;
