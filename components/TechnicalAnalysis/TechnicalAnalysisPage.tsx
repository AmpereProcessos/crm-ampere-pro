"use client";
import { Activity, ListFilter, MapPin, Search, UserRound } from "lucide-react";
import { useState } from "react";
import type React from "react";
import { AiOutlineTeam } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { InteractiveFilter, type InteractiveFilterOption } from "@/components/ui/interactive-filter";
import { Input } from "@/components/ui/input";
import type { TUserSession } from "@/lib/auth/session";
import { formatInteractiveOptionSummary, formatInteractiveSingleOptionSummary } from "@/lib/interactive-filter-formatting";
import { useTechnicalAnalysisByPersonalizedFilters } from "@/utils/queries/technical-analysis";
import { useTechnicalAnalysts, useUsers } from "@/utils/queries/users";
import type { TPersonalizedTechnicalAnalysisFilter } from "@/utils/schemas/technical-analysis.schema";
import StatesAndCities from "@/utils/json-files/cities.json";
import { TechnicalAnalysisComplexity, TechnicalAnalysisSolicitationTypes, TechnicalAnalysisStatus } from "@/utils/select-options";
import TechnicalAnalysisCard from "../Cards/TechnicalAnalysisCard";
import ControlTechnicalAnalysis from "../Modals/TechnicalAnalysis/ControlTechnicalAnalysis";
import { Sidebar } from "../Sidebar";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";
import TechnicalAnalysisPagination from "./Pagination";
import Stats from "./Stats";

const AllCities = StatesAndCities.flatMap((s) => s.cidades).map((c, index) => ({ id: index + 1, label: c, value: c }));
const AllStates = StatesAndCities.map((e) => e.sigla).map((c, index) => ({ id: index + 1, label: c, value: c }));

type TechnicalAnalysisPageParams = {
	session: TUserSession;
};

function TechnicalAnalysisPage({ session }: TechnicalAnalysisPageParams) {
	const userHasOperationalResultsViewPermission = session.user.permissoes.resultados.visualizarOperacional;
	const userAnalysisScope = session.user.permissoes.analisesTecnicas.escopo || null;
	const userPartnersScope = session.user.permissoes.parceiros.escopo || null;
	const [statsBlockIsOpen, setStatsBlockIsOpen] = useState<boolean>(false);
	const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
	const [page, setPage] = useState<number>(1);
	const [applicants, setApplicants] = useState<string[] | null>(userAnalysisScope);
	const [analysts, setAnalysts] = useState<string[] | null>(null);
	const [partners] = useState<string[] | null>(userPartnersScope);
	const { data: applicantOptions } = useUsers();
	const { data: analystsOptions } = useTechnicalAnalysts();
	const { data, isLoading, isError, isSuccess, updateFilters, filters } = useTechnicalAnalysisByPersonalizedFilters({
		after: null,
		before: null,
		applicants,
		analysts,
		partners,
		page,
	});
	const analysis = data?.analysis;
	const analysisMatched = data?.analysisMatched;
	const totalPages = data?.totalPages;

	function resetPage() {
		setPage(1);
	}

	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6">
				<div className="flex w-full flex-col gap-2 border-b border-black pb-2">
					<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
						<h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">CONTROLE DE ANÁLISES TÉCNICAS</h1>
						{userHasOperationalResultsViewPermission ? (
							<Button type="button" variant="ghost" onClick={() => setStatsBlockIsOpen(true)} className="flex items-center gap-2">
								<AiOutlineTeam />
								ACOMPANHAMENTO DE RESULTADOS
							</Button>
						) : null}
					</div>
					<Input
						value={filters.name}
						placeholder="Pesquisar análise técnica..."
						onChange={(event) => {
							resetPage();
							updateFilters({ name: event.target.value });
						}}
						className="w-full"
					/>
					<TechnicalAnalysisInlineFilters
						filters={filters}
						updateFilters={(changes) => {
							resetPage();
							updateFilters(changes);
						}}
						selectedApplicants={applicants}
						setApplicants={(value) => {
							resetPage();
							setApplicants(value);
						}}
						selectedAnalysts={analysts}
						setAnalysts={(value) => {
							resetPage();
							setAnalysts(value);
						}}
						applicantsOptions={applicantOptions ?? []}
						analystsOptions={analystsOptions ?? []}
						session={session}
					/>
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

type TechnicalAnalysisInlineFiltersProps = {
	filters: TPersonalizedTechnicalAnalysisFilter;
	updateFilters: (filters: Partial<TPersonalizedTechnicalAnalysisFilter>) => void;
	selectedApplicants: string[] | null;
	setApplicants: (authors: string[] | null) => void;
	selectedAnalysts: string[] | null;
	setAnalysts: (authors: string[] | null) => void;
	applicantsOptions: { _id: string; nome: string; avatar_url?: string | null }[];
	analystsOptions: { _id: string; nome: string; avatar_url?: string | null }[];
	session: TUserSession;
};

function TechnicalAnalysisInlineFilters({
	filters,
	updateFilters,
	selectedApplicants,
	setApplicants,
	selectedAnalysts,
	setAnalysts,
	applicantsOptions,
	analystsOptions,
	session,
}: TechnicalAnalysisInlineFiltersProps) {
	const userAnalysisScope = session.user.permissoes.analisesTecnicas.escopo;
	const applicantSelectableOptions = (userAnalysisScope ? applicantsOptions.filter((a) => userAnalysisScope.includes(a._id)) : applicantsOptions).map((a) => ({
		id: a._id,
		label: a.nome,
		value: a._id,
	}));
	const analystSelectableOptions = analystsOptions.map((a) => ({ id: a._id, label: a.nome, value: a._id }));
	const statusOptions = TechnicalAnalysisStatus as InteractiveFilterOption<string>[];
	const typeOptions = TechnicalAnalysisSolicitationTypes as InteractiveFilterOption<string>[];
	const complexityOptions = TechnicalAnalysisComplexity as InteractiveFilterOption<NonNullable<TPersonalizedTechnicalAnalysisFilter["complexity"]>>[];
	const hasApplicants = (selectedApplicants ?? []).length > 0;
	const hasAnalysts = (selectedAnalysts ?? []).length > 0;
	const hasStatus = filters.status.length > 0;
	const hasType = filters.type.length > 0;
	const hasComplexity = !!filters.complexity;
	const hasCities = filters.city.length > 0;
	const hasStates = filters.state.length > 0;
	const hasPending = filters.pending;

	return (
		<div className="flex w-full flex-wrap items-center gap-2">
			{hasApplicants ? (
				<TechnicalMultiFilter
					label="REQUERENTES"
					icon={<UserRound className="h-4 w-4" />}
					options={applicantSelectableOptions}
					value={selectedApplicants ?? []}
					onChange={setApplicants}
					onClear={() => setApplicants(null)}
				/>
			) : null}
			{hasAnalysts ? (
				<TechnicalMultiFilter
					label="ANALISTAS"
					icon={<UserRound className="h-4 w-4" />}
					options={analystSelectableOptions}
					value={selectedAnalysts ?? []}
					onChange={setAnalysts}
					onClear={() => setAnalysts(null)}
				/>
			) : null}
			{hasStatus ? (
				<TechnicalMultiFilter
					label="STATUS"
					icon={<ListFilter className="h-4 w-4" />}
					options={statusOptions}
					value={filters.status}
					onChange={(status) => updateFilters({ status })}
					onClear={() => updateFilters({ status: [] })}
				/>
			) : null}
			{hasPending ? (
				<InteractiveFilter.Root className="w-fit">
					<InteractiveFilter.Trigger>
						<InteractiveFilter.Icon>
							<Activity className="h-4 w-4" />
							<InteractiveFilter.Label>PENDENTES</InteractiveFilter.Label>
						</InteractiveFilter.Icon>
						<InteractiveFilter.Value>SOMENTE PENDENTES</InteractiveFilter.Value>
						<InteractiveFilter.Clear onClear={() => updateFilters({ pending: false })} />
					</InteractiveFilter.Trigger>
					<InteractiveFilter.Content className="w-72 p-0">
						<InteractiveFilter.BooleanContent value={filters.pending} onChange={(pending) => updateFilters({ pending })} label="Somente pendentes" />
					</InteractiveFilter.Content>
				</InteractiveFilter.Root>
			) : null}
			{hasComplexity ? (
				<InteractiveFilter.Root className="w-fit">
					<InteractiveFilter.Trigger>
						<InteractiveFilter.Icon>
							<Search className="h-4 w-4" />
							<InteractiveFilter.Label>COMPLEXIDADE</InteractiveFilter.Label>
						</InteractiveFilter.Icon>
						<InteractiveFilter.Value>{formatInteractiveSingleOptionSummary(complexityOptions, filters.complexity)}</InteractiveFilter.Value>
						<InteractiveFilter.Clear onClear={() => updateFilters({ complexity: null })} />
					</InteractiveFilter.Trigger>
					<InteractiveFilter.Content className="w-72 p-0">
						<InteractiveFilter.SingleContent
							options={complexityOptions}
							value={filters.complexity}
							onChange={(complexity) => updateFilters({ complexity })}
							onClear={() => updateFilters({ complexity: null })}
							clearLabel="TODAS"
						/>
					</InteractiveFilter.Content>
				</InteractiveFilter.Root>
			) : null}
			{hasType ? (
				<TechnicalMultiFilter label="TIPO" icon={<ListFilter className="h-4 w-4" />} options={typeOptions} value={filters.type} onChange={(type) => updateFilters({ type })} onClear={() => updateFilters({ type: [] })} />
			) : null}
			{hasCities ? (
				<TechnicalMultiFilter label="CIDADES" icon={<MapPin className="h-4 w-4" />} options={AllCities} value={filters.city} onChange={(city) => updateFilters({ city })} onClear={() => updateFilters({ city: [] })} />
			) : null}
			{hasStates ? (
				<TechnicalMultiFilter label="UFS" icon={<MapPin className="h-4 w-4" />} options={AllStates} value={filters.state} onChange={(state) => updateFilters({ state })} onClear={() => updateFilters({ state: [] })} />
			) : null}
			<InteractiveFilter.AddFilterRoot className="w-fit">
				<InteractiveFilter.AddFilterTrigger>
					<ListFilter className="h-4 w-4" />
					<InteractiveFilter.Label>ADICIONAR FILTRO</InteractiveFilter.Label>
				</InteractiveFilter.AddFilterTrigger>
				<InteractiveFilter.AddFilterContent>
					<InteractiveFilter.AddFilterSection heading="Filtros">
						{!hasApplicants ? (
							<InteractiveFilter.AddFilterItem id="applicants" label="REQUERENTES" icon={<UserRound className="h-4 w-4" />}>
								<InteractiveFilter.MultiContent options={applicantSelectableOptions} value={selectedApplicants ?? []} onChange={setApplicants} clearLabel="TODOS" />
							</InteractiveFilter.AddFilterItem>
						) : null}
						{!hasAnalysts ? (
							<InteractiveFilter.AddFilterItem id="analysts" label="ANALISTAS" icon={<UserRound className="h-4 w-4" />}>
								<InteractiveFilter.MultiContent options={analystSelectableOptions} value={selectedAnalysts ?? []} onChange={setAnalysts} clearLabel="TODOS" />
							</InteractiveFilter.AddFilterItem>
						) : null}
						{!hasStatus ? (
							<InteractiveFilter.AddFilterItem id="status" label="STATUS" icon={<ListFilter className="h-4 w-4" />}>
								<InteractiveFilter.MultiContent options={statusOptions} value={filters.status} onChange={(status) => updateFilters({ status })} clearLabel="TODOS" />
							</InteractiveFilter.AddFilterItem>
						) : null}
						{!hasPending ? (
							<InteractiveFilter.AddFilterItem id="pending" label="SOMENTE PENDENTES" icon={<Activity className="h-4 w-4" />}>
								<InteractiveFilter.BooleanContent value={filters.pending} onChange={(pending) => updateFilters({ pending })} label="Somente pendentes" />
							</InteractiveFilter.AddFilterItem>
						) : null}
						{!hasComplexity ? (
							<InteractiveFilter.AddFilterItem id="complexity" label="COMPLEXIDADE" icon={<Search className="h-4 w-4" />}>
								<InteractiveFilter.SingleContent options={complexityOptions} value={filters.complexity} onChange={(complexity) => updateFilters({ complexity })} clearLabel="TODAS" />
							</InteractiveFilter.AddFilterItem>
						) : null}
						{!hasType ? (
							<InteractiveFilter.AddFilterItem id="type" label="TIPO" icon={<ListFilter className="h-4 w-4" />}>
								<InteractiveFilter.MultiContent options={typeOptions} value={filters.type} onChange={(type) => updateFilters({ type })} clearLabel="TODOS" />
							</InteractiveFilter.AddFilterItem>
						) : null}
						{!hasCities ? (
							<InteractiveFilter.AddFilterItem id="city" label="CIDADES" icon={<MapPin className="h-4 w-4" />}>
								<InteractiveFilter.MultiContent options={AllCities} value={filters.city} onChange={(city) => updateFilters({ city })} clearLabel="TODAS" />
							</InteractiveFilter.AddFilterItem>
						) : null}
						{!hasStates ? (
							<InteractiveFilter.AddFilterItem id="state" label="UFS" icon={<MapPin className="h-4 w-4" />}>
								<InteractiveFilter.MultiContent options={AllStates} value={filters.state} onChange={(state) => updateFilters({ state })} clearLabel="TODAS" />
							</InteractiveFilter.AddFilterItem>
						) : null}
					</InteractiveFilter.AddFilterSection>
				</InteractiveFilter.AddFilterContent>
			</InteractiveFilter.AddFilterRoot>
		</div>
	);
}

function TechnicalMultiFilter({
	label,
	icon,
	options,
	value,
	onChange,
	onClear,
}: {
	label: string;
	icon: React.ReactNode;
	options: InteractiveFilterOption<string>[];
	value: string[];
	onChange: (value: string[]) => void;
	onClear: () => void;
}) {
	return (
		<InteractiveFilter.Root className="w-fit">
			<InteractiveFilter.Trigger>
				<InteractiveFilter.Icon>
					{icon}
					<InteractiveFilter.Label>{label}</InteractiveFilter.Label>
				</InteractiveFilter.Icon>
				<InteractiveFilter.Value>{formatInteractiveOptionSummary(options, value)}</InteractiveFilter.Value>
				<InteractiveFilter.Clear onClear={onClear} />
			</InteractiveFilter.Trigger>
			<InteractiveFilter.Content className="w-72 p-0">
				<InteractiveFilter.MultiContent options={options} value={value} onChange={onChange} onClear={onClear} clearLabel="TODOS" />
			</InteractiveFilter.Content>
		</InteractiveFilter.Root>
	);
}
