import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	BadgeDollarSign,
	Calendar,
	Code,
	Diamond,
	FileText,
	GitBranch,
	IdCard,
	LayoutGrid,
	Mail,
	MapPin,
	Phone,
	ShoppingCart,
	TrafficCone,
	UserRound,
	Zap,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { MdAttachFile } from "react-icons/md";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import ResponsiveDialogDrawerViewOnly from "@/components/utils/ResponsiveDialogDrawerViewOnly";
import { getErrorMessage } from "@/lib/methods/errors";
import { uploadFile } from "@/lib/methods/firebase";
import { formatDateAsLocale, formatDecimalPlaces, formatLocation, formatToMoney, formatToSlug } from "@/lib/methods/formatting";
import type { TGetProjectsOutputById } from "@/pages/api/integration/app-ampere/projects";
import { updateAppProject } from "@/utils/mutations/app-projects";
import { useProjectById } from "@/utils/queries/project";
import type { TProject } from "@/utils/schemas/project.schema";

type ViewProjectProps = {
	projectId: string;
	closeModal: () => void;
};
export function ViewProject({ projectId, closeModal }: ViewProjectProps) {
	const queryClient = useQueryClient();
	const { data: project, queryKey, isLoading, isError, error, isSuccess } = useProjectById({ id: projectId });

	const handleOnMutate = async () => {
		await queryClient.cancelQueries({ queryKey });
		return { previousData: queryClient.getQueryData(queryKey) };
	};
	const handleOnSettled = async () => {
		await queryClient.invalidateQueries({ queryKey });
	};
	return (
		<ResponsiveDialogDrawerViewOnly
			closeMenu={closeModal}
			menuTitle="VISUALIZAR PROJETO"
			menuDescription="Visualize as informações do projeto"
			menuCancelButtonText="FECHAR"
		>
			{isLoading ? <LoadingComponent /> : null}
			{isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
			{isSuccess ? (
				<>
					<GeneralInformationBlock
						project={project}
						callbacks={{
							onMutate: handleOnMutate,
							onSettled: handleOnSettled,
						}}
					/>
					<ContractInformationBlock project={project} />
					<PurchaseInformationBlock project={project} />
					<HomologationInformationBlock project={project} />
					<ExecutionInformationBlock project={project} />
				</>
			) : null}
		</ResponsiveDialogDrawerViewOnly>
	);
}

function InformationItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
	return (
		<div className="w-full flex items-center gap-1.5">
			{icon}
			<h3 className="text-sm font-semibold tracking-tighter text-primary/80">{label}</h3>
			<h3 className="text-sm font-semibold tracking-tight">{value}</h3>
		</div>
	);
}

function GeneralInformationBlock({
	project,
	callbacks,
}: {
	project: TGetProjectsOutputById;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onError?: (error: Error) => void;
		onSettled?: () => void;
	};
}) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<LayoutGrid size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES GERAIS</h1>
			</div>
			<div className="w-full flex flex-col gap-1.5">
				<ProjectCoverImage projectId={project._id} projectName={project.nome} projectCoverImage={project.imagemCapaUrl} callbacks={callbacks} />
				<InformationItem icon={<Code className="w-4 h-4 min-w-4 min-h-4" />} label="ÍNDICE DE PROJETO" value={project.inxedador.toString()} />
				<InformationItem icon={<LayoutGrid className="w-4 h-4 min-w-4 min-h-4" />} label="TIPO DE SERVIÇO" value={project.tipo} />
				<InformationItem icon={<BadgeDollarSign className="w-4 h-4 min-w-4 min-h-4" />} label="VALOR DO CONTRATO" value={formatToMoney(project.valor)} />
				<InformationItem
					icon={<Zap className="w-4 h-4 min-w-4 min-h-4" />}
					label="POTÊNCIA (kWp)"
					value={`${formatDecimalPlaces(project.metadados.potencia ?? 0)} kWp`}
				/>
				<InformationItem icon={<UserRound className="w-4 h-4 min-w-4 min-h-4" />} label="NOME DO PROJETO" value={project.nome} />
				<InformationItem icon={<IdCard className="w-4 h-4 min-w-4 min-h-4" />} label="CPF/CNPJ" value={project.cpfCnpj ?? "N/A"} />
				<InformationItem icon={<Phone className="w-4 h-4 min-w-4 min-h-4" />} label="TELEFONE" value={project.telefone ?? "N/A"} />
				<InformationItem icon={<Mail className="w-4 h-4 min-w-4 min-h-4" />} label="EMAIL" value={project.email ?? "N/A"} />
				<InformationItem
					icon={<MapPin className="w-4 h-4 min-w-4 min-h-4" />}
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
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<FileText size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DO CONTRATO</h1>
			</div>
			<div className="w-full flex flex-col gap-1.5">
				<InformationItem icon={<Diamond size={15} />} label="STATUS" value={project.contrato.status ?? "N/A"} />
				<InformationItem icon={<Calendar size={15} />} label="DATA DE SOLICITAÇÃO" value={formatDateAsLocale(project.contrato.dataSolicitacao) ?? "N/A"} />
				<InformationItem icon={<Calendar size={15} />} label="DATA DE LIBERAÇÃO" value={formatDateAsLocale(project.contrato.dataLiberacao) ?? "N/A"} />
				<InformationItem icon={<Calendar size={15} />} label="DATA DE ASSINATURA" value={formatDateAsLocale(project.contrato.dataAssinatura) ?? "N/A"} />
			</div>
		</div>
	);
}

function PurchaseInformationBlock({ project }: { project: TGetProjectsOutputById }) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<ShoppingCart size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DE COMPRA</h1>
			</div>
			<div className="w-full flex flex-col gap-1.5">
				<InformationItem icon={<Diamond className="w-4 h-4 min-w-4 min-h-4" />} label="STATUS DA COMPRA" value={project.compra.status ?? "N/A"} />
				<InformationItem icon={<Calendar className="w-4 h-4 min-w-4 min-h-4" />} label="DATA DO PEDIDO" value={project.compra.dataPedido ?? "N/A"} />
				<InformationItem icon={<Calendar className="w-4 h-4 min-w-4 min-h-4" />} label="DATA DO PAGAMENTO" value={project.compra.dataPagamento ?? "N/A"} />
				<InformationItem icon={<Calendar className="w-4 h-4 min-w-4 min-h-4" />} label="DATA DE ENTREGA" value={project.compra.dataEntrega ?? "N/A"} />
			</div>
		</div>
	);
}

function HomologationInformationBlock({ project }: { project: TGetProjectsOutputById }) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<GitBranch size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DE HOMOLOGAÇÃO</h1>
			</div>
			<div className="w-full flex flex-col gap-1.5">
				<InformationItem icon={<Diamond className="w-4 h-4 min-w-4 min-h-4" />} label="STATUS DA HOMOLOGAÇÃO" value={project.homologacao.status ?? "N/A"} />
				<InformationItem
					icon={<Calendar className="w-4 h-4 min-w-4 min-h-4" />}
					label="DATA DE SOLICITAÇÃO DE ACESSO"
					value={project.homologacao.acessoDataSolicitacao ?? "N/A"}
				/>
				<InformationItem
					icon={<Calendar className="w-4 h-4 min-w-4 min-h-4" />}
					label="DATA DE RESPOSTA DE ACESSO"
					value={project.homologacao.acessoDataResposta ?? "N/A"}
				/>
				<InformationItem
					icon={<Calendar className="w-4 h-4 min-w-4 min-h-4" />}
					label="DATA DE SOLICITAÇÃO DA VISTORIA"
					value={project.homologacao.vistoriaDataSolicitacao ?? "N/A"}
				/>
				<InformationItem
					icon={<Calendar className="w-4 h-4 min-w-4 min-h-4" />}
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
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<TrafficCone size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DE EXECUÇÃO</h1>
			</div>
			<div className="w-full flex flex-col gap-1.5">
				<InformationItem icon={<Diamond className="w-4 h-4 min-w-4 min-h-4" />} label="STATUS" value={project.execucao.status ?? "N/A"} />
				<InformationItem icon={<Calendar className="w-4 h-4 min-w-4 min-h-4" />} label="DATA DE INÍCIO" value={project.execucao.inicio ?? "N/A"} />
				<InformationItem icon={<Calendar className="w-4 h-4 min-w-4 min-h-4" />} label="DATA DE TÉRMINO" value={project.execucao.fim ?? "N/A"} />
			</div>
		</div>
	);
}

type TSimpleAttachment = {
	file: File | null;
	previewUrl: string | null;
};
type ProjectCoverImageProps = {
	projectId: string;
	projectName: string;
	projectCoverImage: TProject["imagemCapaUrl"];
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onError?: (error: Error) => void;
		onSettled?: () => void;
	};
};
function ProjectCoverImage({ projectId, projectName, projectCoverImage, callbacks }: ProjectCoverImageProps) {
	const [imageHolder, setImageHolder] = useState<TSimpleAttachment>({ file: null, previewUrl: null });

	async function handleUpdateProjectCoverImage(attachment: TSimpleAttachment) {
		if (!attachment.file) {
			setImageHolder((prev) => ({ ...prev, file: null, previewUrl: null }));
			throw new Error("Imagem não informada.");
		}
		const { url } = await uploadFile({
			vinculationId: projectId,
			fileName: `${formatToSlug(projectName)}-imagem-capa`,
			file: attachment.file,
			prefix: "projetos",
		});
		setImageHolder((prev) => ({ ...prev, file: null, previewUrl: null }));
		return await updateAppProject(projectId, {
			imagemCapaUrl: url,
		});
	}

	const { mutate: handleUpdateProjectCoverImageMutation, isPending } = useMutation({
		mutationKey: ["update-project-cover-image", projectId],
		mutationFn: handleUpdateProjectCoverImage,
		onMutate: async () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			return toast.success("Imagem da capa atualizada com sucesso!");
		},
		onError: async (error) => {
			if (callbacks?.onError) callbacks.onError(error);
			return toast.error(getErrorMessage(error));
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
	});
	return (
		<div className="w-full flex flex-col gap-2 items-center justify-center">
			<ImageContent imageUrl={projectCoverImage} imageHolder={imageHolder} handleDefineProjectCover={handleUpdateProjectCoverImageMutation} />
		</div>
	);
}
export default ProjectCoverImage;

function ImageContent({
	imageUrl,
	imageHolder,
	handleDefineProjectCover,
}: {
	imageUrl: TProject["imagemCapaUrl"];
	imageHolder: TSimpleAttachment;
	handleDefineProjectCover: (image: TSimpleAttachment) => void;
}) {
	return (
		<div className="flex items-center justify-center min-h-[250px] min-w-[250px]">
			<label className="relative aspect-square w-full max-w-[250px] cursor-pointer overflow-hidden rounded-lg" htmlFor="dropzone-file">
				<ImagePreview imageHolder={imageHolder} imageUrl={imageUrl} />
				<input
					accept=".png,.jpeg,.jpg"
					className="absolute h-full w-full cursor-pointer opacity-0"
					id="dropzone-file"
					multiple={false}
					onChange={(e) => {
						const file = e.target.files?.[0] ?? null;
						handleDefineProjectCover({
							file,
							previewUrl: file ? URL.createObjectURL(file) : null,
						});
					}}
					tabIndex={-1}
					type="file"
				/>
			</label>
		</div>
	);
}

function ImagePreview({ imageUrl, imageHolder }: { imageUrl: TProject["imagemCapaUrl"]; imageHolder: TSimpleAttachment }) {
	if (imageHolder.previewUrl) {
		return <Image src={imageHolder.previewUrl} alt="Imagem da capa do projeto." fill className="object-cover" />;
	}
	if (imageUrl) {
		return <Image src={imageUrl} alt="Imagem da capa do projeto." fill className="object-cover" />;
	}

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-primary/20">
			<MdAttachFile className="h-6 w-6" />
			<p className="text-center font-medium text-xs">DEFINIR IMAGEM DA CAPA</p>
		</div>
	);
}
