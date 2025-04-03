import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import LoadingPage from "@/components/utils/LoadingPage";

import NewProposalPage from "@/components/Proposal/NewProposalPage";

function PropostaPage() {
	const router = useRouter();
	const opportunityId = router.query.id as string;
	const { data: session, status } = useSession({ required: true });

	if (status !== "authenticated") return <LoadingPage />;
	return <NewProposalPage opportunityId={opportunityId} session={session} />;
}

export default PropostaPage;
