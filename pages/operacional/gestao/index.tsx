import LoadingComponent from "@/components/utils/LoadingComponent";

import React, { useState } from "react";

import MainManagementPage from "@/components/Operation/Management/MainManagementPage";
import { useSession } from "@/app/providers/SessionProvider";

function OperationFollowUp() {
	const { session, status } = useSession({ required: true });
	const [mode, setMode] = useState<"process-tracking" | "projects-follow-up">("process-tracking");

	if (status !== "authenticated") return <LoadingComponent />;
	return <MainManagementPage session={session} />;
}

export default OperationFollowUp;
