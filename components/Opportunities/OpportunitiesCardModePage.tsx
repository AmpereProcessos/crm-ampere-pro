import { useOpportunitiesByPersonalizedFilters } from "@/utils/queries/opportunities";
import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import { Sidebar } from "../Sidebar";
import OpportunitiesFiltersMenu from "./FilterMenu";
import { useUsers } from "@/utils/queries/users";
import { usePartnersSimplified } from "@/utils/queries/partners";
import OpportunitiesCardPagePagination from "./OpportunitiesCardPagePagination";
import LoadingComponent from "../utils/LoadingComponent";
import ErrorComponent from "../utils/ErrorComponent";
import OpportunityCardMode from "../Cards/OpportunityCardMode";
import { TOpportunitiesPageModes } from "@/pages/comercial/oportunidades";
import { FaRotate } from "react-icons/fa6";
import { TPartnerSimplifiedDTO } from "@/utils/schemas/partner.schema";
import { TUserDTOSimplified } from "@/utils/schemas/user.schema";
import { TProjectTypeDTOSimplified } from "@/utils/schemas/project-types.schema";
import NewOpportunity from "../Modals/Opportunity/NewOpportunity";
import { TFunnelDTO } from "@/utils/schemas/funnel.schema";
import { AiOutlinePlus } from "react-icons/ai";
import { MdFilterList } from "react-icons/md";
import { cn } from "@/lib/utils";

type OpportunitiesCardModePageProps = {
	session: TUserSession;
	partnersOptions: TPartnerSimplifiedDTO[];
	responsiblesOptions: TUserDTOSimplified[];
	projectTypesOptions: TProjectTypeDTOSimplified[];
	funnelsOptions: TFunnelDTO[];
	handleSetMode: (mode: TOpportunitiesPageModes) => void;
};
function OpportunitiesCardModePage({ session, partnersOptions, responsiblesOptions, projectTypesOptions, funnelsOptions, handleSetMode }: OpportunitiesCardModePageProps) {
	const userPartnersScope = session.user.permissoes.parceiros.escopo || null;
	const userOpportunityScope = session.user.permissoes.oportunidades.escopo || null;

	const [filterMenuIsOpen, setFilterMenuIsOpen] = useState<boolean>(false);
	const [newProjectModalIsOpen, setNewProjectModalIsOpen] = useState<boolean>(false);

	const [page, setPage] = useState(1);
	const [responsibles, setResponsibles] = useState<string[] | null>(userOpportunityScope);
	const [partners, setPartners] = useState<string[] | null>(userPartnersScope);
	const [projectTypes, setProjectTypes] = useState<string[] | null>(null);
	const { data, isLoading, isError, isSuccess, updateFilters } = useOpportunitiesByPersonalizedFilters({ page, responsibles, partners, projectTypes });
	const opportunities = data?.opportunities;
	const opportunitiesMatched = data?.opportunitiesMatched;
	const totalPages = data?.totalPages;

	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
				<div className="flex w-full flex-col gap-2 border-b border-black pb-2">
					<div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row">
						<div className="flex flex-col items-center gap-1 lg:flex-row">
							<div className="flex flex-col items-center gap-1">
								<h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">OPORTUNIDADES</h1>
							</div>
							<button onClick={() => handleSetMode("kanban")} className="flex items-center gap-1 px-2 text-xs text-gray-500 duration-300 ease-out hover:text-gray-800">
								<FaRotate />
								<h1 className="font-medium">ALTERAR MODO</h1>
							</button>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setFilterMenuIsOpen((prev) => !prev)}
								className={cn(
									"flex h-[46.6px] items-center justify-center gap-2 rounded-md border bg-[#fead41] p-2 px-3 text-sm font-medium text-white shadow-md duration-300 ease-in-out hover:scale-105 hover:bg-orange-500",
									filterMenuIsOpen && "bg-orange-600",
								)}
							>
								<MdFilterList style={{ fontSize: "18px" }} />
							</button>
							<button
								onClick={() => setNewProjectModalIsOpen(true)}
								className="flex h-[46.6px] items-center justify-center gap-2 rounded-md border bg-[#15599a] p-2 px-3 text-sm font-medium text-white shadow-md duration-300 ease-in-out hover:scale-105"
							>
								<AiOutlinePlus style={{ fontSize: "18px" }} />
							</button>
						</div>
					</div>
					{filterMenuIsOpen ? (
						<OpportunitiesFiltersMenu
							updateFilters={updateFilters}
							selectedResponsibles={responsibles}
							setResponsibles={setResponsibles}
							responsiblesOptions={responsiblesOptions || []}
							selectedPartners={partners}
							setPartners={setPartners}
							partnersOptions={partnersOptions || []}
							selectedProjectTypes={projectTypes}
							setProjectTypes={setProjectTypes}
							projectTypesOptions={projectTypesOptions || []}
							session={session}
							queryLoading={isLoading}
							resetSelectedPage={() => setPage(1)}
						/>
					) : null}
				</div>
				<OpportunitiesCardPagePagination
					activePage={page}
					totalPages={totalPages || 0}
					selectPage={(x) => setPage(x)}
					queryLoading={isLoading}
					opportunitiesMatched={opportunitiesMatched}
					opportunitiesShowing={opportunities?.length}
				/>
				<div className="flex flex-wrap justify-between gap-4 py-2">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Erro ao buscar oportunidades." /> : null}
					{isSuccess && opportunities ? (
						opportunities.length > 0 ? (
							opportunities.map((opportunity) => (
								<div key={opportunity._id} className="w-full lg:w-[500px]">
									<OpportunityCardMode opportunity={opportunity} />
								</div>
							))
						) : (
							<p className="w-full text-center italic text-gray-500">Nenhuma oportunidade encontrada...</p>
						)
					) : null}
				</div>
			</div>
			{newProjectModalIsOpen ? (
				<NewOpportunity session={session} opportunityCreators={responsiblesOptions || []} funnels={funnelsOptions || []} closeModal={() => setNewProjectModalIsOpen(false)} />
			) : null}
		</div>
	);
}

export default OpportunitiesCardModePage;
