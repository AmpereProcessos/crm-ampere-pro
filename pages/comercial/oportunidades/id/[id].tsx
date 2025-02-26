import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { Sidebar } from "@/components/Sidebar";
import OpportunityPage from "@/components/Opportunities/OpportunityPage";
import LoadingPage from "@/components/utils/LoadingPage";

function Opportunity() {
	const { data: session, status } = useSession({
		required: true,
	});
	const { query } = useRouter();

	const projectId = query.id;
	if (status !== "authenticated") return <LoadingPage />;
	if (!projectId || typeof projectId !== "string")
		return (
			<div className="flex h-full flex-col md:flex-row">
				<Sidebar session={session} />
				<div className="flex w-full max-w-full grow flex-col items-center justify-center overflow-x-hidden bg-[#f8f9fa] p-6">
					<p className="text-lg italic text-gray-700">Oops, ID inválido.</p>
				</div>
			</div>
		);
	return <OpportunityPage session={session} opportunityId={projectId} />;
}

export default Opportunity;
