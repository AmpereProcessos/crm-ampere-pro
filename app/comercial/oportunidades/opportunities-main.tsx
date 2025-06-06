"use client";
import { useState } from "react";

import type { GetServerSidePropsContext } from "next";

import LoadingPage from "@/components/utils/LoadingPage";

import { useOpportunitiesQueryOptions } from "@/utils/queries/opportunities";

import OpportunitiesCardModePage from "@/components/Opportunities/OpportunitiesCardModePage";
import OpportunitiesKanbanModePage from "@/components/Opportunities/OpportunitiesKanbanModePage";
import nookies, { setCookie, parseCookies } from "nookies";
import { handleSetCookie } from "@/lib/methods/cookies";
import type { TUserSession } from "@/lib/auth/session";

export type TOpportunitiesPageModes = "card" | "kanban";

type OpportunitiesMainPageProps = { initialMode: TOpportunitiesPageModes | null | undefined; session: TUserSession };

export default function OpportunitiesMainPage({ initialMode, session }: OpportunitiesMainPageProps) {
	console.log(initialMode);
	const { data: queryOptions } = useOpportunitiesQueryOptions();

	const responsiblesOptions = queryOptions?.responsibles || [];
	const partnersOptions = queryOptions?.partners || [];
	const projectTypesOptions = queryOptions?.projectTypes || [];
	const funnelsOptions = queryOptions?.funnels || [];

	const [mode, setMode] = useState<TOpportunitiesPageModes>(initialMode || "kanban");

	function handleSetMode(selected: TOpportunitiesPageModes) {
		// Setting selected mode in a cookie for futher preference use
		handleSetCookie({ ctx: null, key: "opportunities-page-mode", value: selected, path: "/comercial/oportunidades" });
		setMode(selected);
	}

	if (mode === "card")
		return (
			<OpportunitiesCardModePage
				session={session}
				partnersOptions={partnersOptions}
				responsiblesOptions={responsiblesOptions}
				projectTypesOptions={projectTypesOptions}
				funnelsOptions={funnelsOptions}
				handleSetMode={handleSetMode}
			/>
		);
	if (mode === "kanban")
		return <OpportunitiesKanbanModePage session={session} funnelsOptions={funnelsOptions} responsiblesOptions={responsiblesOptions} handleSetMode={handleSetMode} />;
	return <></>;
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
	const cookies = nookies.get(context);
	console.log(cookies);
	const initialMode = cookies["opportunities-page-mode"] || null;
	return {
		props: {
			initialMode,
		},
	};
}
