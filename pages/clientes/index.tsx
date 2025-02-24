import React from "react";
import { useSession } from "next-auth/react";

import LoadingPage from "@/components/utils/LoadingPage";

import { getFirstDayOfYear, getLastDayOfYear } from "@/utils/methods";

import ClientsPage from "@/components/Clients/ClientsPage";

const currentDate = new Date();
const firstDayOfYear = getFirstDayOfYear(
	currentDate.toISOString(),
).toISOString();
const lastDayOfYear = getLastDayOfYear(currentDate.toISOString()).toISOString();

function Clients() {
	const { data: session, status } = useSession({ required: true });

	if (status !== "authenticated") return <LoadingPage />;
	return <ClientsPage session={session} />;
}

export default Clients;
