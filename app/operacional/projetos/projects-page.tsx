"use client";
import DateInput from "@/components/Inputs/DateInput";
import MultipleSelectWithImages from "@/components/Inputs/MultipleSelectWithImages";
import SelectInput from "@/components/Inputs/SelectInput";
import TextInput from "@/components/Inputs/TextInput";
import { ViewProject } from "@/components/Modals/Projects/ViewProject";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import ErrorComponent from "@/components/utils/ErrorComponent";
import GeneralQueryPaginationMenu from "@/components/utils/GeneralQueryPaginationMenu";
import LoadingComponent from "@/components/utils/LoadingComponent";
import { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { formatDateForInputValue, formatDateOnInputChange } from "@/lib/methods/formatting";
import { cn } from "@/lib/utils";
import { TGetManyProjectsInput, TGetProjectsOutputDefault } from "@/pages/api/integration/app-ampere/projects";
import { getProjectTypeColor, SlideMotionVariants } from "@/utils/constants";
import { useProjects } from "@/utils/queries/project";
import { useOpportunityCreators } from "@/utils/queries/users";
import { AnimatePresence, motion } from "framer-motion";
import { Code, Filter, MapPin, User } from "lucide-react";
import { useState } from "react";

type OperationalProjectsPageProps = {
	session: TUserSession;
};
export default function OperationalProjectsPage({ session }: OperationalProjectsPageProps) {
	const [filtersMenuIsOpen, setFiltersMenuIsOpen] = useState(false);
	const [viewProjectId, setViewProjectId] = useState<string | null>(null);

	const userOpportunityScope = session.user.permissoes.oportunidades.escopo || null;

	const { data: opportunityCreators } = useOpportunityCreators();
	const {
		data: projectsResult,
		isLoading,
		isError,
		error,
		isSuccess,
		filters,
		updateFilters,
	} = useProjects({
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
	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full grow flex-col bg-background p-6 gap-6">
				<div className="flex w-full flex-col gap-2 border-b border-primary pb-2">
					<div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row">
						<h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">PROJETOS</h1>
						<Button
							variant={filtersMenuIsOpen ? "default" : "ghost"}
							size="fit"
							className="rounded-lg p-2"
							onClick={() => setFiltersMenuIsOpen((prev) => !prev)}
						>
							<Filter className="w-4 h-4 min-w-4 min-h-4" />
						</Button>
					</div>
					<AnimatePresence>
						{filtersMenuIsOpen ? (
							<OperationalProjectsPageFilters filters={filters} updateFilters={updateFilters} responsibleOptions={responsibleSelectableOptions} />
						) : null}
					</AnimatePresence>
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
						<div className="w-full flex items-center justify-around gap-x-4 gap-y-2 flex-wrap">
							{projects.map((project) => (
								<div key={project._id} className="w-full md:w-[500px]">
									<ProjectCard project={project} handleViewClick={() => setViewProjectId(project._id)} />
								</div>
							))}
						</div>
					) : (
						<p className="w-full text-center italic text-primary/70">Nenhum projeto encontrado...</p>
					)
				) : null}
			</div>
			{viewProjectId ? <ViewProject projectId={viewProjectId} closeModal={() => setViewProjectId(null)} /> : null}
		</div>
	);
}

type OperationalProjectsPageFiltersProps = {
	filters: TGetManyProjectsInput;
	updateFilters: (filters: Partial<TGetManyProjectsInput>) => void;
	responsibleOptions: { id: string; label: string; value: string; url: string | undefined }[];
};
function OperationalProjectsPageFilters({ filters, updateFilters, responsibleOptions }: OperationalProjectsPageFiltersProps) {
	const periodFieldOptions: { id: number; label: string; value: TGetManyProjectsInput["periodField"] }[] = [
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
	return (
		<motion.div
			variants={SlideMotionVariants}
			initial="initial"
			animate="animate"
			exit="exit"
			className={"bg-card border-primary/20 flex w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs"}
		>
			<h1 className="text-[0.65rem] font-medium tracking-tight uppercase">FILTROS</h1>
			<div className="flex w-full flex-col items-center justify-start gap-2 md:flex-row">
				<div className="w-full md:w-[300px]">
					<TextInput
						label="PESQUISA"
						placeholder="Pesquise por um projeto..."
						value={filters.search ?? ""}
						handleChange={(value) => updateFilters({ search: value })}
						width="100%"
					/>
				</div>
				<div className="w-full md:w-[300px]">
					<MultipleSelectWithImages
						label="RESPONSÁVEIS"
						selected={filters.responsiblesIds ?? []}
						handleChange={(value) => updateFilters({ responsiblesIds: value })}
						width="100%"
						options={responsibleOptions}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => updateFilters({ responsiblesIds: null })}
					/>
				</div>
				<div className="w-full md:w-[300px]">
					<SelectInput
						label="PERÍODO - CAMPO DE FILTRO"
						value={filters.periodField ?? ""}
						resetOptionLabel="NÃO DEFINIDO"
						onReset={() => updateFilters({ periodField: null })}
						handleChange={(value) => updateFilters({ periodField: value as TGetManyProjectsInput["periodField"] })}
						options={periodFieldOptions}
						width="100%"
					/>
				</div>
				<div className="w-full md:w-[300px]">
					<DateInput
						label="PERÍODO - DEPOIS DE"
						value={formatDateForInputValue(filters.periodAfter)}
						handleChange={(value) => updateFilters({ periodAfter: formatDateOnInputChange(value) })}
						width="100%"
					/>
				</div>
				<div className="w-full md:w-[300px]">
					<DateInput
						label="PERÍODO - ANTES DE"
						value={formatDateForInputValue(filters.periodBefore)}
						handleChange={(value) => updateFilters({ periodBefore: formatDateOnInputChange(value) })}
						width="100%"
					/>
				</div>
			</div>
		</motion.div>
	);
}

type ProjectCardProps = {
	project: TGetProjectsOutputDefault["projects"][number];
	handleViewClick: () => void;
};
function ProjectCard({ project, handleViewClick }: ProjectCardProps) {
	function ProjectCardMetadata({ icon, label, value }: { icon: React.ReactNode; label?: string; value: string }) {
		return (
			<div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-lg">
				{icon}
				{label && <p className="text-[0.6rem] italic">{label}</p>}
				<p className="text-[0.6rem] font-medium">{value}</p>
			</div>
		);
	}
	function ProjectCheckpoint({ label, checked }: { label: string; checked: boolean }) {
		return (
			<div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-lg">
				<div className={cn("w-2 h-2 rounded-full", checked ? "bg-green-500" : "bg-red-500")} />
				{label && <p className="text-[0.6rem] font-medium">{label}</p>}
			</div>
		);
	}
	return (
		<div className={cn("bg-card border-primary/20 flex w-full flex-col gap-1 rounded-xl border  shadow-xs")}>
			<div className={cn("text-[0.65rem] font-bold px-2 py-0.5 rounded-lg rounded-b-none w-full text-center", getProjectTypeColor(project.tipo))}>
				{project.tipo}
			</div>
			<div className="w-full flex flex-col gap-3 px-3 pt-2 pb-4">
				{/** HEADING */}
				<div className="w-full flex items-center justify-start gap-2">
					<div className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-0.5 rounded-lg">
						<Code className="w-4 h-4" />
						<p className="text-[0.6rem] font-bold">{project.inxedador}</p>
					</div>
					<h1 className="grow text-sm font-medium  text-truncate">{project.nome}</h1>
				</div>
				{/** CONTENT */}
				<div className="w-full flex flex-col gap-3 grow">
					<div className="w-full flex flex-col gap-1">
						<h3 className="text-[0.65rem] font-medium">INFORMAÇÕES</h3>
						<div className="w-full flex items-center justify-start gap-2 flex-wrap">
							<ProjectCardMetadata icon={<MapPin className="w-4 h-4" />} value={`${project.cidade}${project.uf ? `(${project.uf})` : ""}`} />
							<ProjectCardMetadata icon={<User className="w-4 h-4" />} value={`${project.vendedor}${project.insider ? ` + ${project.insider}` : ""}`} />
						</div>
					</div>
					<div className="w-full flex flex-col gap-1">
						<h3 className="text-[0.65rem] font-medium">CHECKPOINTS</h3>
						<div className="w-full flex items-center justify-start gap-2 flex-wrap">
							<ProjectCheckpoint label="CONTRATO ASSINADO" checked={project.contrato?.status === "ASSINADO"} />
							<ProjectCheckpoint label="PAGAMENTO FEITO" checked={!!project.compra?.dataPagamento} />
							<ProjectCheckpoint label="COMPRA FEITA" checked={!!project.compra?.dataPedido} />
							<ProjectCheckpoint label="HOMOLOGADO" checked={!!project.homologacao?.acessoDataResposta} />
							<ProjectCheckpoint label="OBRA EXECUTADA" checked={!!project.execucao?.fim} />
							<ProjectCheckpoint label="VISTORIA REALIZADA" checked={!!project.homologacao?.vistoriaDataEfetivacao} />
						</div>
					</div>
				</div>
				<div className="w-full flex items-center justify-end">
					<Button variant="ghost" size="fit" className="text-xs px-2 py-1" onClick={handleViewClick}>
						VISUALIZAR
					</Button>
				</div>
			</div>
		</div>
	);
}
