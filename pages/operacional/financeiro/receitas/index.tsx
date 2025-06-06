import { useSession } from "@/app/providers/SessionProvider";
import RevenuesPage from "@/components/Revenues/RevenuesPage";
import LoadingPage from "@/components/utils/LoadingPage";
import React from "react";

function MainRevenuesPage() {
	const { session, status } = useSession({ required: true });

	if (status !== "authenticated") return <LoadingPage />;
	return <RevenuesPage session={session} />;
}

export default MainRevenuesPage;
