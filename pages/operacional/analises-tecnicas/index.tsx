import TechnicalAnalysisPage from "@/components/TechnicalAnalysis/TechnicalAnalysisPage";

import LoadingPage from "@/components/utils/LoadingPage";

import React from "react";
import { useSession } from "@/app/providers/SessionProvider";

function TechnicalAnalysis() {
	const { session, status } = useSession({ required: true });

	if (status !== "authenticated") return <LoadingPage />;
	return <TechnicalAnalysisPage session={session} />;
}

export default TechnicalAnalysis;
