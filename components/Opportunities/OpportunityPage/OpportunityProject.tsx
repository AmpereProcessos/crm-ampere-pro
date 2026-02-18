import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
	BadgeDollarSign,
	Calendar,
	CheckCheck,
	Code,
	Diamond,
	FileText,
	FileTextIcon,
	GitBranch,
	IdCard,
	LayoutGrid,
	LinkIcon,
	Mail,
	MapPin,
	Phone,
	ShoppingCart,
	TrafficCone,
	UserRound,
	Zap,
} from "lucide-react";
import { useId, useState } from "react";
import { toast } from "react-hot-toast";
import DateInput from "@/components/Inputs/DateInput";
import { AnimatedSpinner } from "@/components/icons";
import ErrorComponent from "@/components/utils/ErrorComponent";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { uploadFile } from "@/lib/methods/firebase";
import {
	formatDateAsLocale,
	formatDateForInputValue,
	formatDateOnInputChange,
	formatDecimalPlaces,
	formatLocation,
	formatToMoney,
} from "@/lib/methods/formatting";
import { cn } from "@/lib/utils";
import type { TGetProjectsOutputById } from "@/pages/api/integration/app-ampere/projects";
import { updateAppProject } from "@/utils/mutations/app-projects";
import { createFileReference } from "@/utils/mutations/file-references";
import { useProjectById } from "@/utils/queries/project";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";

const ProjectInformationSections = {
	"INFORMAÇÕES GERAIS": {
		icon: <LayoutGrid size={15} />,
		label: "INFORMAÇÕES GERAIS",
		value: "INFORMAÇÕES GERAIS",
		content: (project: TGetProjectsOutputById) => <GeneralInformationBlock project={project} />,
	},
	"INFORMAÇÕES DO CONTRATO": {
		icon: <FileText size={15} />,
		label: "INFORMAÇÕES DO CONTRATO",
		value: "INFORMAÇÕES DO CONTRATO",
		content: (project: TGetProjectsOutputById) => <ContractInformationBlock project={project} />,
	},
	"INFORMAÇÕES DE COMPRA": {
		icon: <ShoppingCart size={15} />,
		label: "INFORMAÇÕES DE COMPRA",
		value: "INFORMAÇÕES DE COMPRA",
		content: (project: TGetProjectsOutputById) => <PurchaseInformationBlock project={project} />,
	},
	"INFORMAÇÕES DE HOMOLOGAÇÃO": {
		icon: <GitBranch size={15} />,
		label: "INFORMAÇÕES DE HOMOLOGAÇÃO",
		value: "INFORMAÇÕES DE HOMOLOGAÇÃO",
		content: (project: TGetProjectsOutputById) => <HomologationInformationBlock project={project} />,
	},
	"INFORMAÇÕES DE EXECUÇÃO": {
		icon: <TrafficCone size={15} />,
		label: "INFORMAÇÕES DE EXECUÇÃO",
		value: "INFORMAÇÕES DE EXECUÇÃO",
		content: (project: TGetProjectsOutputById) => <ExecutionInformationBlock project={project} />,
	},
};
type OpportunityProjectProps = {
	opportunityProjectId: Exclude<TOpportunity["ganho"]["idProjeto"], undefined | null>;
	session: TUserSession;
};
export default function OpportunityProject({ opportunityProjectId, session }: OpportunityProjectProps) {
	const { data: project, isSuccess, isError, error, isLoading } = useProjectById({ id: opportunityProjectId });
	const [activeSection, setActiveSection] = useState<keyof typeof ProjectInformationSections>("INFORMAÇÕES GERAIS");
	return (
		<div className={"border-green-200 flex w-full h-full flex-col gap-3 rounded-xl border px-3 py-4 shadow-xs bg-green-100"}>
			<div className="flex items-center justify-between">
				<h1 className="text-xs font-bold tracking-tight uppercase text-black">DADOS DO GANHO</h1>
				{isSuccess ? <OpportunityProjectContractContent project={project} session={session} /> : null}
			</div>
			{isLoading ? (
				<div className="flex items-center gap-2 justify-center w-full animate-pulse">
					<AnimatedSpinner className="w-4 h-4 min-w-4 min-h-4 text-black" />
					<span className="text-xs font-medium text-black">Buscando informações do projeto...</span>
				</div>
			) : null}
			{isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
			{isSuccess ? (
				<div className="flex w-full grow flex-col gap-3">
					<div className="w-full flex items-center gap-2 flex-wrap">
						{Object.values(ProjectInformationSections).map((section) => (
							<motion.button
								key={section.value}
								type="button"
								className={cn("relative flex items-center gap-2 px-2 py-1 rounded-sm w-fit overflow-hidden", {
									"text-white": activeSection === section.value,
									"text-black bg-black/20": activeSection !== section.value,
								})}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								transition={{ type: "spring", stiffness: 340, damping: 24 }}
								onClick={() => setActiveSection(section.value as keyof typeof ProjectInformationSections)}
							>
								{activeSection === section.value ? (
									<motion.span
										layoutId="opportunity-project-active-tab"
										className="absolute inset-0 rounded-sm bg-green-500"
										transition={{ type: "spring", stiffness: 320, damping: 28 }}
									/>
								) : null}
								<span className="relative z-10 flex items-center gap-2">
									{section.icon}
									<h1 className="text-xs tracking-tight font-medium text-start w-fit">{section.label}</h1>
								</span>
							</motion.button>
						))}
					</div>
					<AnimatePresence initial={false} mode="wait">
						<motion.div
							key={activeSection}
							initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
							animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
							exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
							transition={{ duration: 0.22, ease: "easeOut" }}
							className="w-full"
						>
							{ProjectInformationSections[activeSection].content(project)}
						</motion.div>
					</AnimatePresence>
				</div>
			) : null}
		</div>
	);
}

type OpportunityProjectContractContentProps = {
	project: TGetProjectsOutputById;
	session: TUserSession;
};
function OpportunityProjectContractContent({ project, session }: OpportunityProjectContractContentProps) {
	const [controlAttachmentsMenuIsOpen, setControlAttachmentsMenuIsOpen] = useState(false);
	if (project.contrato.status === "RESCISÃO DE CONTRATO")
		return <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-medium">CONTRATO RESCINDIDO</div>;

	if (project.contrato.status === "ASSINADO")
		return <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-green-600 text-white text-xs font-medium">CONTRATO ASSINADO</div>;

	return (
		<div className="flex items-center gap-2">
			<div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-600 text-white text-xs font-medium">ASSINATURA PENDENTE</div>
			<button
				type="button"
				onClick={() => setControlAttachmentsMenuIsOpen(true)}
				className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold"
			>
				<LinkIcon className="w-4 h-4 min-w-4 min-h-4 text-white" />
				ANEXAR
			</button>
			{controlAttachmentsMenuIsOpen ? (
				<ContractAttachmentMenu projectId={project._id.toString()} session={session} closeMenu={() => setControlAttachmentsMenuIsOpen(false)} />
			) : null}
		</div>
	);
}

type TContractAttachmentMenuState = {
	file: File | null;
	signatureDate: string | null;
};
type ContractAttachmentMenuProps = {
	projectId: string;
	closeMenu: () => void;
	session: TUserSession;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onError?: (error: Error) => void;
		onSettled?: () => void;
	};
};
function ContractAttachmentMenu({ projectId, session, closeMenu, callbacks }: ContractAttachmentMenuProps) {
	const fileInputId = useId();
	const [holder, setHolder] = useState<TContractAttachmentMenuState>({
		file: null,
		signatureDate: new Date().toISOString(),
	});

	async function handleUpdateContract(state: TContractAttachmentMenuState) {
		if (!state.file) throw new Error("Arquivo não informado.");
		if (!state.signatureDate) throw new Error("Data de assinatura não informada.");

		const { url, format, size } = await uploadFile({
			file: state.file,
			fileName: `contrato-${state.signatureDate}`,
			vinculationId: projectId,
		});

		await createFileReference({
			info: {
				idParceiro: session.user.idParceiro || "",
				idProjeto: projectId,
				titulo: `CONTRATO ASSINADO`,
				url: url,
				formato: format,
				tamanho: size,
				categorias: ["CONTRATOS", "DOCUMENTOS"],
				autor: {
					id: session.user.id,
					nome: session.user.nome,
					avatar_url: session.user.avatar_url,
				},
				dataInsercao: new Date().toISOString(),
			},
		});
		await updateAppProject(projectId, {
			// @ts-expect-error
			"contrato.status": "ASSINADO",
			"contrato.dataAssinatura": state.signatureDate,
		});
		return "Contrato anexado e status do contrato atualizado com sucesso !";
	}

	const { mutate: mutateUpdateContract, isPending: isUpdateContractLoading } = useMutation({
		mutationKey: ["update-contract", projectId],
		mutationFn: handleUpdateContract,
		onMutate: async () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			toast.success(data as string);
			return closeMenu();
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError: async (error) => {
			if (callbacks?.onError) callbacks.onError(error);
			return toast.error(getErrorMessage(error));
		},
	});
	return (
		<ResponsiveDialogDrawer
			menuTitle="ANEXAR CONTRATO"
			menuDescription="Anexe o contrato assinado para o projeto"
			menuActionButtonText="ANEXAR"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeMenu}
			actionFunction={() => mutateUpdateContract(holder)}
			actionIsLoading={isUpdateContractLoading}
			stateIsLoading={false}
			stateError={null}
		>
			<div className="flex items-center justify-center min-h-[250px] min-w-[250px]">
				<label className="relative h-[250px] w-full max-w-[250px] cursor-pointer overflow-hidden rounded-lg" htmlFor={fileInputId}>
					<ContractAttachmentPreview file={holder.file} />
					<input
						accept=".pdf"
						className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
						id={fileInputId}
						multiple={false}
						onChange={(e) => {
							const file = e.target.files?.[0] ?? null;
							setHolder((prev) => ({
								...prev,
								file: file,
							}));
						}}
						tabIndex={-1}
						type="file"
					/>
				</label>
			</div>
			<DateInput
				label="DATA DE ASSINATURA"
				value={formatDateForInputValue(holder.signatureDate)}
				handleChange={(value) => setHolder((prev) => ({ ...prev, signatureDate: formatDateOnInputChange(value, "string") }))}
				width="100%"
			/>
		</ResponsiveDialogDrawer>
	);
}

function ContractAttachmentPreview({ file }: { file: File | null }) {
	if (file) {
		return (
			<div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-green-300 bg-green-200 px-3 text-green-700">
				<CheckCheck className="h-6 w-6" />
				<p className="text-center font-semibold text-xs">CONTRATO ANEXADO</p>
				<p className="max-w-full truncate text-center text-[11px] font-medium">{file.name}</p>
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-primary/20 text-primary/90">
			<FileTextIcon className="h-6 w-6" />
			<p className="text-center font-medium text-xs">DEFINIR CONTRATO</p>
		</div>
	);
}

function GeneralInformationBlock({ project }: { project: TGetProjectsOutputById }) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="w-full flex flex-col gap-1.5">
				<InformationItem icon={<Code className="w-4 h-4 min-w-4 min-h-4 text-black" />} label="ÍNDICE DE PROJETO" value={project.inxedador.toString()} />
				<InformationItem icon={<LayoutGrid className="w-4 h-4 min-w-4 min-h-4 text-black" />} label="TIPO DE SERVIÇO" value={project.tipo} />
				<InformationItem
					icon={<BadgeDollarSign className="w-4 h-4 min-w-4 min-h-4 text-black" />}
					label="VALOR DO CONTRATO"
					value={formatToMoney(project.valor)}
				/>
				<InformationItem
					icon={<Zap className="w-4 h-4 min-w-4 min-h-4 text-black" />}
					label="POTÊNCIA (kWp)"
					value={`${formatDecimalPlaces(project.metadados.potencia ?? 0)} kWp`}
				/>
				<InformationItem icon={<UserRound className="w-4 h-4 min-w-4 min-h-4 text-black" />} label="NOME DO PROJETO" value={project.nome} />
				<InformationItem icon={<IdCard className="w-4 h-4 min-w-4 min-h-4 text-black" />} label="CPF/CNPJ" value={project.cpfCnpj ?? "N/A"} />
				<InformationItem icon={<Phone className="w-4 h-4 min-w-4 min-h-4 text-black" />} label="TELEFONE" value={project.telefone ?? "N/A"} />
				<InformationItem icon={<Mail className="w-4 h-4 min-w-4 min-h-4 text-black" />} label="EMAIL" value={project.email ?? "N/A"} />
				<InformationItem
					icon={<MapPin className="w-4 h-4 min-w-4 min-h-4 text-black" />}
					label="LOCALIZAÇÃO"
					value={formatLocation({
						location: {
							cep: project.cep,
							cidade: project.cidade,
							uf: project.uf,
							bairro: project.bairro,
							endereco: project.logradouro,
							numeroOuIdentificador: project.numeroOuIdentificador,
						},
						includeCity: true,
						includeUf: true,
					})}
				/>
			</div>
		</div>
	);
}

function ContractInformationBlock({ project }: { project: TGetProjectsOutputById }) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="w-full flex flex-col gap-1.5">
				<InformationItem icon={<Diamond className="w-4 h-4 min-w-4 min-h-4 text-black   " />} label="STATUS" value={project.contrato.status ?? "N/A"} />
				<InformationItem
					icon={<Calendar className="w-4 h-4 min-w-4 min-h-4 text-black" />}
					label="DATA DE SOLICITAÇÃO"
					value={formatDateAsLocale(project.contrato.dataSolicitacao) ?? "N/A"}
				/>
				<InformationItem
					icon={<Calendar className="w-4 h-4 min-w-4 min-h-4 text-black" />}
					label="DATA DE LIBERAÇÃO"
					value={formatDateAsLocale(project.contrato.dataLiberacao) ?? "N/A"}
				/>
				<InformationItem
					icon={<Calendar className="w-4 h-4 min-w-4 min-h-4 text-black" />}
					label="DATA DE ASSINATURA"
					value={formatDateAsLocale(project.contrato.dataAssinatura) ?? "N/A"}
				/>
			</div>
		</div>
	);
}

function PurchaseInformationBlock({ project }: { project: TGetProjectsOutputById }) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="w-full flex flex-col gap-1.5">
				<InformationItem icon={<Diamond className="w-4 h-4 min-w-4 min-h-4 text-black" />} label="STATUS DA COMPRA" value={project.compra.status ?? "N/A"} />
				<InformationItem icon={<Calendar className="w-4 h-4 min-w-4 min-h-4 text-black" />} label="DATA DO PEDIDO" value={project.compra.dataPedido ?? "N/A"} />
				<InformationItem
					icon={<Calendar className="w-4 h-4 min-w-4 min-h-4 text-black" />}
					label="DATA DO PAGAMENTO"
					value={project.compra.dataPagamento ?? "N/A"}
				/>
				<InformationItem
					icon={<Calendar className="w-4 h-4 min-w-4 min-h-4 text-black" />}
					label="DATA DE ENTREGA"
					value={project.compra.dataEntrega ?? "N/A"}
				/>
			</div>
		</div>
	);
}

function HomologationInformationBlock({ project }: { project: TGetProjectsOutputById }) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="w-full flex flex-col gap-1.5">
				<InformationItem
					icon={<Diamond className="w-4 h-4 min-w-4 min-h-4 text-black" />}
					label="STATUS DA HOMOLOGAÇÃO"
					value={project.homologacao.status ?? "N/A"}
				/>
				<InformationItem
					icon={<Calendar className="w-4 h-4 min-w-4 min-h-4 text-black" />}
					label="DATA DE SOLICITAÇÃO DE ACESSO"
					value={project.homologacao.acessoDataSolicitacao ?? "N/A"}
				/>
				<InformationItem
					icon={<Calendar className="w-4 h-4 min-w-4 min-h-4 text-black" />}
					label="DATA DE RESPOSTA DE ACESSO"
					value={project.homologacao.acessoDataResposta ?? "N/A"}
				/>
				<InformationItem
					icon={<Calendar className="w-4 h-4 min-w-4 min-h-4 text-black" />}
					label="DATA DE SOLICITAÇÃO DA VISTORIA"
					value={project.homologacao.vistoriaDataSolicitacao ?? "N/A"}
				/>
				<InformationItem
					icon={<Calendar className="w-4 h-4 min-w-4 min-h-4 text-black" />}
					label="DATA DE REALIZAÇÃO DA VISTORIA"
					value={project.homologacao.vistoriaDataEfetivacao ?? "N/A"}
				/>
			</div>
		</div>
	);
}

function ExecutionInformationBlock({ project }: { project: TGetProjectsOutputById }) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="w-full flex flex-col gap-1.5">
				<InformationItem icon={<Diamond className="w-4 h-4 min-w-4 min-h-4 text-black" />} label="STATUS" value={project.execucao.status ?? "N/A"} />
				<InformationItem icon={<Calendar className="w-4 h-4 min-w-4 min-h-4 text-black" />} label="DATA DE INÍCIO" value={project.execucao.inicio ?? "N/A"} />
				<InformationItem icon={<Calendar className="w-4 h-4 min-w-4 min-h-4 text-black" />} label="DATA DE TÉRMINO" value={project.execucao.fim ?? "N/A"} />
			</div>
		</div>
	);
}

function InformationItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
	return (
		<div className="w-full flex items-center gap-1.5">
			{icon}
			<h3 className="text-sm font-semibold tracking-tighter text-black">{label}</h3>
			<h3 className="text-sm font-semibold tracking-tight text-black">{value}</h3>
		</div>
	);
}
