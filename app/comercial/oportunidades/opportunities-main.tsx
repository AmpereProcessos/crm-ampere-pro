"use client";
import { useState } from "react";
import OpportunitiesCardModePage from "@/components/Opportunities/OpportunitiesCardModePage";
import OpportunitiesKanbanModePage from "@/components/Opportunities/OpportunitiesKanbanModePage";
import type { TUserSession } from "@/lib/auth/session";
import { useOpportunitiesQueryDefinitions, useOpportunitiesQueryOptions } from "@/utils/queries/opportunities";
import OpportunitiesKanbanModePageV2 from "@/components/Opportunities/OpportunitiesKanbanModePageV2";

export type TOpportunitiesPageModes = "card" | "kanban";

type OpportunitiesMainPageProps = { initialMode: TOpportunitiesPageModes | null | undefined; session: TUserSession };

export default function OpportunitiesMainPage({ initialMode, session }: OpportunitiesMainPageProps) {
	console.log(initialMode);
	const { data: queryOptions } = useOpportunitiesQueryOptions();
	const { data: opportunityViewPreferences } = useOpportunitiesQueryDefinitions();
	const responsiblesOptions = queryOptions?.responsibles || [];
	const partnersOptions = queryOptions?.partners || [];
	const projectTypesOptions = queryOptions?.projectTypes || [];
	const funnelsOptions = queryOptions?.funnels || [];

	const [mode, setMode] = useState<TOpportunitiesPageModes>(initialMode || "kanban");

	function handleSetMode(selected: TOpportunitiesPageModes) {
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
	if (mode === "kanban" && opportunityViewPreferences)
		return (
			<OpportunitiesKanbanModePageV2 session={session} opportunityViewPreferences={opportunityViewPreferences} />
		);
	return <></>;
}
