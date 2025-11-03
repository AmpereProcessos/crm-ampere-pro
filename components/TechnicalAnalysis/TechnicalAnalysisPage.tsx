"use client";
import { useState } from "react";
import { AiOutlineTeam } from "react-icons/ai";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import type { TUserSession } from "@/lib/auth/session";
import { useTechnicalAnalysisByPersonalizedFilters } from "@/utils/queries/technical-analysis";
import { useTechnicalAnalysts, useUsers } from "@/utils/queries/users";
import TechnicalAnalysisCard from "../Cards/TechnicalAnalysisCard";
import ControlTechnicalAnalysis from "../Modals/TechnicalAnalysis/ControlTechnicalAnalysis";
import { Sidebar } from "../Sidebar";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";
import FilterMenu from "./FilterMenu";
import TechnicalAnalysisPagination from "./Pagination";
import Stats from "./Stats";

type TechnicalAnalysisPageParams = {
	session: TUserSession;
};
function TechnicalAnalysisPage({ session }: TechnicalAnalysisPageParams) {
	const userHasOperationalResultsViewPermission = session.user.permissoes.resultados.visualizarOperacional;
	const userAnalysisScope = session.user.permissoes.analisesTecnicas.escopo || null;
	const userPartnersScope = session.user.permissoes.parceiros.escopo || null;
	const [filterMenuIsOpen, setFilterMenuIsOpen] = useState<boolean>(false);
	const [statsBlockIsOpen, setStatsBlockIsOpen] = useState<boolean>(false);
	const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });

	const [page, setPage] = useState<number>(1);
	const [period, setPeriod] = useState<{ after: string | null; before: string | null }>({ after: null, before: null });
	const [applicants, setApplicants] = useState<string[] | null>(userAnalysisScope);
	const [analysts, setAnalysts] = useState<string[] | null>(null);
	const [partners, setPartners] = useState<string[] | null>(userPartnersScope);

	const { data: applicantOptions } = useUsers();
	const { data: analystsOptions } = useTechnicalAnalysts();

	const { data, isLoading, isError, isSuccess, updateFilters } = useTechnicalAnalysisByPersonalizedFilters({
		after: period.after,
		before: period.before,
		applicants: applicants,
		analysts: null,
		partners: partners,
		page: page,
	});
	const analysis = data?.analysis;
	const analysisMatched = data?.analysisMatched;
	const totalPages = data?.totalPages;
	console.log(totalPages);
	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6">
				<div className="flex w-full flex-col gap-2 border-b border-black pb-2">
					<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
						<div className="flex items-center gap-1">
							{filterMenuIsOpen ? (
								<div className="cursor-pointer text-primary/60 hover:text-blue-400">
									<IoMdArrowDropupCircle style={{ fontSize: "25px" }} onClick={() => setFilterMenuIsOpen(false)} />
								</div>
							) : (
								<div className="cursor-pointer text-primary/60 hover:text-blue-400">
									<IoMdArrowDropdownCircle style={{ fontSize: "25px" }} onClick={() => setFilterMenuIsOpen(true)} />
								</div>
							)}
							<div className="flex flex-col gap-1">
								<h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">CONTROLE DE ANÁLISES TÉCNICAS</h1>
							</div>
						</div>
						{userHasOperationalResultsViewPermission ? (
							<button
								type="button"
								onClick={() => setStatsBlockIsOpen(true)}
								className="flex items-center gap-1 font-bold tracking-tight text-primary/70 duration-300 ease-in-out hover:text-cyan-500"
							>
								<p className="text-sm">ACOMPANHAMENTO DE RESULTADOS</p>
								<AiOutlineTeam />
							</button>
						) : null}
					</div>
					{filterMenuIsOpen ? (
						<FilterMenu
							updateFilters={updateFilters}
							queryLoading={isLoading}
							session={session}
							analystsOptions={analystsOptions}
							applicantsOptions={applicantOptions}
							selectedApplicants={applicants}
							setApplicants={setApplicants}
							selectedAnalysts={analysts}
							setAnalysts={setAnalysts}
							resetSelectedPage={() => setPage(1)}
						/>
					) : null}
					{statsBlockIsOpen ? <Stats closeMenu={() => setStatsBlockIsOpen(false)} /> : null}
				</div>
				<TechnicalAnalysisPagination
					activePage={page}
					totalPages={totalPages || 0}
					selectPage={(x) => setPage(x)}
					queryLoading={isLoading}
					analysisMatched={analysisMatched}
					analysisShowing={analysis?.length}
				/>
				<div className="flex flex-wrap justify-between gap-2 py-2">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg={"Erro ao buscar análises técnicas."} /> : null}
					{isSuccess && analysis
						? analysis.map((analysisInfo) => (
								<TechnicalAnalysisCard
									key={analysisInfo._id}
									analysis={analysisInfo}
									handleClick={(id) => setEditModal({ id: id, isOpen: true })}
									userHasEditPermission={session.user.permissoes.analisesTecnicas.editar}
								/>
							))
						: null}
				</div>
			</div>
			{editModal.id && editModal.isOpen ? (
				<ControlTechnicalAnalysis analysisId={editModal.id} session={session} closeModal={() => setEditModal({ id: null, isOpen: false })} />
			) : null}
		</div>
	);
}

export default TechnicalAnalysisPage;
