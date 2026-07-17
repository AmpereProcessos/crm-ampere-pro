"use client";
import { CalendarDays, Code, LayoutGrid, ListFilter, MapPin, User, UserRound } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type React from "react";
import { ViewProject } from "@/components/Modals/Projects/ViewProject";
import { Button } from "@/components/ui/button";
import { InteractiveFilter, type InteractiveFilterOption } from "@/components/ui/interactive-filter";
import { Input } from "@/components/ui/input";
import ErrorComponent from "@/components/utils/ErrorComponent";
import GeneralQueryPaginationMenu from "@/components/utils/GeneralQueryPaginationMenu";
import LoadingComponent from "@/components/utils/LoadingComponent";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { formatInteractiveDateRangeSummary, formatInteractiveOptionSummary, formatInteractiveSingleOptionSummary } from "@/lib/interactive-filter-formatting";
import { cn } from "@/lib/utils";
import type { TGetManyProjectsInput, TGetProjectsOutputDefault } from "@/pages/api/integration/app-ampere/projects";
import { getProjectTypeColor } from "@/utils/constants";
import { useProjects } from "@/utils/queries/project";
import { useOpportunityCreators } from "@/utils/queries/users";

type OperationalProjectsPageProps = {
	session: TUserSession;
};

export default function OperationalProjectsPage({ session }: OperationalProjectsPageProps) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [viewProjectId, setViewProjectId] = useState<string | null>(null);
	const deepLinkedProjectId = searchParams?.get("projectId") ?? null;
	const activeProjectId = deepLinkedProjectId ?? viewProjectId;
	const userOpportunityScope = session.user.permissoes.oportunidades.escopo || null;
	const { data: opportunityCreators } = useOpportunityCreators();
	const { data: projectsResult, isLoading, isError, error, isSuccess, filters, updateFilters } = useProjects({
		initialFilters: {
			responsiblesIds: userOpportunityScope,
		},
	});

	const projects = projectsResult?.projects;
	const projectsTotal = projectsResult?.projects?.length ?? 0;
	const projectsMatched = projectsResult?.projectsMatched ?? 0;
	const totalPages = projectsResult?.totalPages ?? 0;

	const responsibleSelectableOptions = opportunityCreators
		? userOpportunityScope
			? opportunityCreators
					.filter((a) => userOpportunityScope.includes(a._id))
					.map((c) => ({ id: c._id, label: c.nome, value: c._id, url: c.avatar_url ?? undefined }))
			: opportunityCreators.map((c) => ({ id: c._id, label: c.nome, value: c._id, url: c.avatar_url ?? undefined }))
		: [];
	function closeProject() {
		if (deepLinkedProjectId) {
			const nextSearchParams = new URLSearchParams(searchParams?.toString() ?? "");
			nextSearchParams.delete("projectId");
			const queryString = nextSearchParams.toString();
			const currentPathname = pathname || "/operacional/projetos";
			router.replace(queryString ? `${currentPathname}?${queryString}` : currentPathname);
		}
		setViewProjectId(null);
	}

	return (
		<>
			<div className="flex w-full min-w-0 flex-col gap-6">
				<div className="flex w-full flex-col gap-2 border-b border-primary pb-2">
					<Input
						value={filters.search ?? ""}
						placeholder="Pesquisar projeto..."
						onChange={(event) => updateFilters({ search: event.target.value, page: 1 })}
						className="w-full"
					/>
					<OperationalProjectsPageFilters filters={filters} updateFilters={updateFilters} responsibleOptions={responsibleSelectableOptions} />
				</div>
				<GeneralQueryPaginationMenu
					activePage={filters.page}
					totalPages={totalPages}
					selectPage={(x) => updateFilters({ page: x })}
					queryLoading={isLoading}
					itemsMatched={projectsMatched}
					itemsShowing={projectsTotal}
				/>

				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
				{isSuccess && projects ? (
					projects.length > 0 ? (
						<div className="flex w-full flex-wrap items-center justify-around gap-x-4 gap-y-2">
							{projects.map((project) => (
								<ProjectCard key={project._id} project={project} handleViewClick={() => setViewProjectId(project._id)} />
							))}
						</div>
					) : (
						<p className="w-full text-center italic text-primary/70">Nenhum projeto encontrado...</p>
					)
				) : null}
			</div>
			{activeProjectId ? <ViewProject projectId={activeProjectId} closeModal={closeProject} /> : null}
		</>
	);
}

type OperationalProjectsPageFiltersProps = {
	filters: TGetManyProjectsInput;
	updateFilters: (filters: Partial<TGetManyProjectsInput>) => void;
	responsibleOptions: { id: string; label: string; value: string; url: string | undefined }[];
};

function OperationalProjectsPageFilters({ filters, updateFilters, responsibleOptions }: OperationalProjectsPageFiltersProps) {
	const periodFieldOptions: InteractiveFilterOption<NonNullable<TGetManyProjectsInput["periodField"]>>[] = [
		{ id: 1, label: "CONTRATO - DATA DE SOLICITAÇÃO", value: "contrato.dataSolicitacao" },
		{ id: 2, label: "CONTRATO - DATA DE LIBERAÇÃO", value: "contrato.dataLiberacao" },
		{ id: 3, label: "CONTRATO - DATA DE ASSINATURA", value: "contrato.dataAssinatura" },
		{ id: 4, label: "COMPRA - DATA DE PAGAMENTO", value: "compra.dataPagamento" },
		{ id: 5, label: "COMPRA - DATA DE ENTREGA", value: "compra.dataEntrega" },
		{ id: 6, label: "HOMOLOGADO - DATA DE RESPOSTA", value: "homologacao.acesso.dataResposta" },
		{ id: 7, label: "HOMOLOGADO - DATA DE EFETIVAÇÃO", value: "homologacao.vistoria.dataResposta" },
		{ id: 8, label: "EXECUÇÃO - DATA DE INÍCIO", value: "obra.entrada" },
		{ id: 9, label: "EXECUÇÃO - DATA DE FIM", value: "obra.saida" },
	];
	const hasResponsibles = (filters.responsiblesIds ?? []).length > 0;
	const hasPeriodField = !!filters.periodField;
	const hasPeriodRange = !!filters.periodAfter || !!filters.periodBefore;
	const periodFieldValue = filters.periodField ?? periodFieldOptions[0].value;

	return (
		<div className="flex w-full flex-wrap items-center gap-2">
			{hasResponsibles ? (
				<InteractiveFilter.Root className="w-fit">
					<InteractiveFilter.Trigger>
						<InteractiveFilter.Icon>
							<UserRound className="h-4 w-4" />
							<InteractiveFilter.Label>RESPONSÁVEIS</InteractiveFilter.Label>
						</InteractiveFilter.Icon>
						<InteractiveFilter.Value>{formatInteractiveOptionSummary(responsibleOptions, filters.responsiblesIds ?? [])}</InteractiveFilter.Value>
						<InteractiveFilter.Clear onClear={() => updateFilters({ responsiblesIds: null, page: 1 })} />
					</InteractiveFilter.Trigger>
					<InteractiveFilter.Content className="w-72 p-0">
						<InteractiveFilter.MultiContent
							options={responsibleOptions}
							value={filters.responsiblesIds ?? []}
							onChange={(responsiblesIds) => updateFilters({ responsiblesIds, page: 1 })}
							onClear={() => updateFilters({ responsiblesIds: null, page: 1 })}
							clearLabel="TODOS"
						/>
					</InteractiveFilter.Content>
				</InteractiveFilter.Root>
			) : null}
			{hasPeriodField ? (
				<InteractiveFilter.Root className="w-fit">
					<InteractiveFilter.Trigger>
						<InteractiveFilter.Icon>
							<ListFilter className="h-4 w-4" />
							<InteractiveFilter.Label>CAMPO DE PERÍODO</InteractiveFilter.Label>
						</InteractiveFilter.Icon>
						<InteractiveFilter.Value>{formatInteractiveSingleOptionSummary(periodFieldOptions, filters.periodField)}</InteractiveFilter.Value>
						<InteractiveFilter.Clear onClear={() => updateFilters({ periodField: null, page: 1 })} />
					</InteractiveFilter.Trigger>
					<InteractiveFilter.Content className="w-80 p-0">
						<InteractiveFilter.SingleContent
							options={periodFieldOptions}
							value={filters.periodField}
							onChange={(periodField) => updateFilters({ periodField, page: 1 })}
							onClear={() => updateFilters({ periodField: null, page: 1 })}
							clearLabel="NÃO DEFINIDO"
						/>
					</InteractiveFilter.Content>
				</InteractiveFilter.Root>
			) : null}
			{hasPeriodRange ? (
				<InteractiveFilter.Root className="w-fit">
					<InteractiveFilter.Trigger>
						<InteractiveFilter.Icon>
							<CalendarDays className="h-4 w-4" />
							<InteractiveFilter.Label>PERÍODO</InteractiveFilter.Label>
						</InteractiveFilter.Icon>
						<InteractiveFilter.Value>{formatInteractiveDateRangeSummary(filters.periodAfter, filters.periodBefore)}</InteractiveFilter.Value>
						<InteractiveFilter.Clear onClear={() => updateFilters({ periodAfter: null, periodBefore: null, page: 1 })} />
					</InteractiveFilter.Trigger>
					<InteractiveFilter.Content className="w-auto p-0">
						<InteractiveFilter.DateRangeContent
							value={{
								from: filters.periodAfter ? new Date(filters.periodAfter) : undefined,
								to: filters.periodBefore ? new Date(filters.periodBefore) : undefined,
							}}
							onChange={(period) =>
								updateFilters({
									periodField: filters.periodField ?? periodFieldValue,
									periodAfter: period.from ? period.from.toISOString() : null,
									periodBefore: period.to ? period.to.toISOString() : null,
									page: 1,
								})
							}
						/>
					</InteractiveFilter.Content>
				</InteractiveFilter.Root>
			) : null}
			<InteractiveFilter.AddFilterRoot className="w-fit">
				<InteractiveFilter.AddFilterTrigger>
					<ListFilter className="h-4 w-4" />
					<InteractiveFilter.Label>ADICIONAR FILTRO</InteractiveFilter.Label>
				</InteractiveFilter.AddFilterTrigger>
				<InteractiveFilter.AddFilterContent>
					<InteractiveFilter.AddFilterSection heading="Filtros">
						{!hasResponsibles ? (
							<InteractiveFilter.AddFilterItem id="responsibles" label="RESPONSÁVEIS" icon={<UserRound className="h-4 w-4" />}>
								<InteractiveFilter.MultiContent
									options={responsibleOptions}
									value={filters.responsiblesIds ?? []}
									onChange={(responsiblesIds) => updateFilters({ responsiblesIds, page: 1 })}
									clearLabel="TODOS"
								/>
							</InteractiveFilter.AddFilterItem>
						) : null}
						{!hasPeriodField ? (
							<InteractiveFilter.AddFilterItem id="periodField" label="CAMPO DE PERÍODO" icon={<ListFilter className="h-4 w-4" />}>
								<InteractiveFilter.SingleContent
									options={periodFieldOptions}
									value={filters.periodField}
									onChange={(periodField) => updateFilters({ periodField, page: 1 })}
									onClear={() => updateFilters({ periodField: null, page: 1 })}
									clearLabel="NÃO DEFINIDO"
								/>
							</InteractiveFilter.AddFilterItem>
						) : null}
						{!hasPeriodRange ? (
							<InteractiveFilter.AddFilterItem id="period" label="PERÍODO" icon={<CalendarDays className="h-4 w-4" />}>
								<InteractiveFilter.DateRangeContent
									value={{
										from: filters.periodAfter ? new Date(filters.periodAfter) : undefined,
										to: filters.periodBefore ? new Date(filters.periodBefore) : undefined,
									}}
									onChange={(period) =>
										updateFilters({
											periodField: filters.periodField ?? periodFieldValue,
											periodAfter: period.from ? period.from.toISOString() : null,
											periodBefore: period.to ? period.to.toISOString() : null,
											page: 1,
										})
									}
								/>
							</InteractiveFilter.AddFilterItem>
						) : null}
					</InteractiveFilter.AddFilterSection>
				</InteractiveFilter.AddFilterContent>
			</InteractiveFilter.AddFilterRoot>
		</div>
	);
}

type ProjectCardProps = {
	project: TGetProjectsOutputDefault["projects"][number];
	handleViewClick: () => void;
};

function ProjectCard({ project, handleViewClick }: ProjectCardProps) {
	return (
		<div className={cn("flex w-full flex-col gap-2 rounded-xl border border-primary/20 bg-card p-4 shadow-xs sm:flex-row")}>
			<div className="flex items-center justify-center">
				<div className="relative h-32 max-h-32 min-h-32 w-32 min-w-32 max-w-32 overflow-hidden rounded-lg">
					{project.imagemCapaUrl ? (
						<Image src={project.imagemCapaUrl} alt={project.nome} fill={true} objectFit="cover" />
					) : (
						<div className="flex h-full w-full items-center justify-center bg-primary/50 text-primary-foreground">
							<LayoutGrid className="h-6 w-6" />
						</div>
					)}
				</div>
			</div>
			<div className="flex h-full grow flex-col gap-2">
				<div className="flex w-full flex-col gap-3">
					<div className="flex w-full flex-col-reverse items-center justify-between gap-2 lg:flex-row">
						<div className="flex flex-wrap items-center gap-2">
							<div className="flex items-center gap-1 rounded-lg bg-primary px-2 py-0.5 text-primary-foreground">
								<Code className="h-4 w-4" />
								<p className="text-[0.6rem] font-bold">{project.inxedador}</p>
							</div>
							<h1 className="text-truncate text-sm font-medium">{project.nome}</h1>
							<ProjectCardMetadata icon={<MapPin className="h-4 w-4" />} value={`${project.cidade}${project.uf ? `(${project.uf})` : ""}`} />
							<ProjectCardMetadata icon={<User className="h-4 w-4" />} value={`${project.vendedor}${project.insider ? ` + ${project.insider}` : ""}`} />
						</div>
						<div className={cn("rounded-lg px-2 py-0.5 text-center text-[0.65rem] font-bold", getProjectTypeColor(project.tipo))}>{project.tipo}</div>
					</div>
					<div className="flex w-full grow flex-col gap-3">
						<div className="flex w-full flex-col gap-1">
							<h3 className="text-[0.65rem] font-medium">CHECKPOINTS</h3>
							<div className="flex w-full flex-wrap items-center justify-start gap-2">
								<ProjectCheckpoint label="CONTRATO ASSINADO" checked={project.contrato?.status === "ASSINADO"} />
								<ProjectCheckpoint label="PAGAMENTO FEITO" checked={!!project.compra?.dataPagamento} />
								<ProjectCheckpoint label="COMPRA FEITA" checked={!!project.compra?.dataPedido} />
								<ProjectCheckpoint label="HOMOLOGADO" checked={!!project.homologacao?.acessoDataResposta} />
								<ProjectCheckpoint label="OBRA EXECUTADA" checked={!!project.execucao?.fim} />
								<ProjectCheckpoint label="VISTORIA REALIZADA" checked={!!project.homologacao?.vistoriaDataEfetivacao} />
							</div>
						</div>
					</div>
					<div className="flex w-full items-center justify-end">
						<Button variant="ghost" size="fit" className="px-2 py-1 text-xs" onClick={handleViewClick}>
							VISUALIZAR
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

function ProjectCardMetadata({ icon, label, value }: { icon: React.ReactNode; label?: string; value: string }) {
	return (
		<div className="flex items-center gap-1 rounded-lg bg-primary/20 px-2 py-0.5">
			{icon}
			{label && <p className="text-[0.6rem] italic">{label}</p>}
			<p className="text-[0.6rem] font-medium">{value}</p>
		</div>
	);
}

function ProjectCheckpoint({ label, checked }: { label: string; checked: boolean }) {
	return (
		<div className="flex items-center gap-1 rounded-lg bg-primary/20 px-2 py-0.5">
			<div className={cn("h-2 w-2 rounded-full", checked ? "bg-green-500" : "bg-red-500")} />
			{label && <p className="text-[0.6rem] font-medium">{label}</p>}
		</div>
	);
}
