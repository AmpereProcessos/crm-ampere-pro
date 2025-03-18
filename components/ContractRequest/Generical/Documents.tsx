import DocumentFileInput from "@/components/Inputs/DocumentFileInput";
import { getContractDocumentation, type TContractRequestTypes } from "@/lib/methods/contract-requests";
import { cn } from "@/lib/utils";
import { GeneralVisibleHiddenExitMotionVariants } from "@/utils/constants";
import { useFileReferencesByOpportunityId } from "@/utils/queries/file-references";
import type { TContractRequest } from "@/utils/schemas/integrations/app-ampere/contract-request.schema";
import { useState, type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";
import { MdAttachFile, MdDelete } from "react-icons/md";
import { BsCloudUploadFill } from "react-icons/bs";
import { AnimatePresence, motion } from "framer-motion";
import { set } from "lodash";
import { formatLongString } from "@/utils/methods";
import TextInput from "@/components/Inputs/TextInput";
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";
type DocumentsProps = {
	opportunityId: string;
	documentsFile: { [key: string]: File | string | null };
	setDocumentsFile: React.Dispatch<React.SetStateAction<{ [key: string]: File | string | null }>>;
	requestInfo: TContractRequest;
	setRequestInfo: Dispatch<SetStateAction<TContractRequest>>;
	showActions: boolean;
	goToPreviousStage: () => void;
	goToNextStage: () => void;
};
function Documents({ opportunityId, documentsFile, setDocumentsFile, requestInfo, setRequestInfo, showActions, goToPreviousStage, goToNextStage }: DocumentsProps) {
	const { data: fileReferences } = useFileReferencesByOpportunityId({ opportunityId: opportunityId });

	const documentationMap = getContractDocumentation({
		type: requestInfo.tipoDeServico as TContractRequestTypes,
		data: {
			"TIPO DA INSTALAÇÃO": requestInfo.tipoDaInstalacao,
			"TIPO DA LIGAÇÃO DA INSTALAÇÃO": requestInfo.tipoDaLigacao,
			"TIPO DO TITULAR DA INSTALAÇÃO": requestInfo.tipoDoTitular,
			"ORIGEM DOS RECURSOS": requestInfo.origemRecurso,
			"TITULAR DO CONTRATO = TITULAR DA INSTALAÇÃO": requestInfo.cpf_cnpj === requestInfo.cpf_cnpjTitularProjeto,
			DISTRIBUIÇÕES: requestInfo.distribuicoes,
		},
	});
	const documentationMapKeys = Object.keys(documentationMap);
	function validateDocumentsAndProcceed(documents: { [key: string]: File | string | null }) {
		const missingAttachment = Object.entries(documentationMap).find(([key, value]) => {
			if (value && !documents[key]) {
				return true;
			}
			return false;
		});
		if (missingAttachment) {
			const [key] = missingAttachment;
			return toast.error(`Por favor, anexe o arquivo: ${key}`);
		}
		return goToNextStage();
	}

	return (
		<div className="flex w-full flex-col bg-[#fff] pb-2 gap-6 grow">
			<div className="w-full flex flex-col gap-2">
				<div className="w-full flex items-center justify-center gap-2">
					<CloudUpload size={15} />
					<span className="text-sm tracking-tight font-bold">DOCUMENTAÇÃO</span>
				</div>
				<h1 className="w-full text-center font-medium tracking-tight">Anexe aqui os documentos necessários para solicitação de contrato.</h1>
				<h1 className="w-full text-center font-medium tracking-tight">
					Se existirem arquivos vinculados ao projeto, você pode utilizá-los clicando em <strong className="text-blue-800">MOSTRAR OPÇÕES</strong> e escolhendo o arquivo desejado.
				</h1>
			</div>
			<div className="w-full flex flex-col gap-4 grow">
				<div className="flex w-full flex-wrap items-start justify-center gap-2">
					{Object.entries(documentationMap)
						.filter(([key, value]) => value)
						.map(([key, value]) => (
							<div key={key} className="w-full lg:w-[600px]">
								<DocumentFileInput
									label={key}
									value={documentsFile[key]}
									handleChange={(value) => setDocumentsFile((prev) => ({ ...prev, [key]: value }))}
									fileReferences={fileReferences}
								/>
							</div>
						))}
				</div>
				<AttachmentsMenu
					requiredDocumentsKeys={documentationMapKeys}
					files={documentsFile}
					addFiles={(value) => setDocumentsFile((prev) => ({ ...prev, ...value }))}
					removeFile={(key) => setDocumentsFile((prev) => ({ ...prev, [key]: null }))}
				/>
			</div>

			{showActions ? (
				<div className="mt-2 flex w-full flex-wrap justify-between  gap-2">
					<button
						type="button"
						onClick={() => {
							goToPreviousStage();
						}}
						className="rounded p-2 font-bold text-gray-500 duration-300 hover:scale-105"
					>
						Voltar
					</button>
					<button
						type="button"
						onClick={() => {
							validateDocumentsAndProcceed(documentsFile);
						}}
						className="rounded p-2 font-bold hover:bg-black hover:text-white"
					>
						Prosseguir
					</button>
				</div>
			) : null}
		</div>
	);
}

export default Documents;

type AttachmentsMenuProps = {
	requiredDocumentsKeys: string[];
	files: { [key: string]: File | string | null };
	addFiles: (info: { [key: string]: File }) => void;
	removeFile: (key: string) => void;
};
function AttachmentsMenu({ requiredDocumentsKeys, files, addFiles, removeFile }: AttachmentsMenuProps) {
	const [newAttachmentFileMenuIsOpen, setNewScopeItemMenuState] = useState<boolean>(false);
	const otherAttachments = Object.entries(files)
		.filter(([key, value]) => !requiredDocumentsKeys.includes(key))
		.map(([key, value]) => ({
			title: key,
			file: value,
		}));
	return (
		<div className="w-full flex flex-col gap-2">
			<div className="flex w-full items-center justify-end gap-2">
				<button
					type="button"
					onClick={() => setNewScopeItemMenuState((prev) => !prev)}
					className={cn("flex items-center gap-1 rounded-lg px-2 py-1 text-black duration-300 ease-in-out", {
						"bg-gray-300  hover:bg-red-300": newAttachmentFileMenuIsOpen,
						"bg-green-300  hover:bg-green-400": !newAttachmentFileMenuIsOpen,
					})}
				>
					<MdAttachFile />
					<h1 className="text-xs font-medium tracking-tight">{!newAttachmentFileMenuIsOpen ? "ABRIR MENU DE NOVO SERVIÇO" : "FECHAR MENU DE NOVO SERVIÇO"}</h1>
				</button>
			</div>
			<AnimatePresence>{newAttachmentFileMenuIsOpen && <NewAttachmentsMenu addFiles={addFiles} />}</AnimatePresence>
			<div className="w-full flex flex-col gap-3">
				{otherAttachments.map((f) => (
					<div key={`attachment-${f.title}`} className="flex w-full justify-between items-center gap-1 rounded border border-primary bg-[#fff] p-2">
						<div className="flex items-center gap-1">
							<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
								<MdAttachFile />
							</div>
							<p className="text-sm font-bold leading-none tracking-tight">{f.title}</p>
						</div>
						<button type="button" onClick={() => removeFile(f.title)} className="flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1 text-[0.6rem] text-white hover:bg-red-500">
							<MdDelete width={10} height={10} />
							<p>REMOVER</p>
						</button>
					</div>
				))}
			</div>
		</div>
	);
}

type NewAttachmentsMenuProps = {
	addFiles: (info: { [key: string]: File }) => void;
};
function NewAttachmentsMenu({ addFiles }: NewAttachmentsMenuProps) {
	const [attachmentsTitle, setAttachmentsTitle] = useState<string>("");
	const [attachments, setAttachments] = useState<File[]>([]);
	function removeAttachment(index: number) {
		setAttachments((prev) => prev.filter((_, i) => i !== index));
	}
	function handleAddFiles({ title, files }: { title: string; files: File[] }) {
		if (title.trim().length === 0) {
			return toast.error("Por favor, preencha o título dos arquivos.");
		}
		if (files.length === 0) {
			return toast.error("Por favor, selecione os arquivos.");
		}

		const filesMap = files.reduce((acc: { [key: string]: File }, current, index) => {
			acc[`${title} ${index + 1}`] = current;
			return acc;
		}, {});

		addFiles(filesMap);
		toast.success("Arquivos adicionados com sucesso.");
		setAttachments([]);
		setAttachmentsTitle("");
	}
	console.log("ATTACHMENTS", attachments);
	return (
		<motion.div
			key={"menu-open"}
			variants={GeneralVisibleHiddenExitMotionVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			className="flex w-full flex-col gap-2 rounded border border-green-600 bg-[#fff] shadow-sm"
		>
			<h1 className="rounded-tl rounded-tr bg-green-600 p-1 text-center text-xs text-white">NOVOS ANEXOS</h1>
			<div className="flex w-full flex-col gap-2 p-3">
				<div className="relative flex w-full items-center justify-center">
					<label
						htmlFor="dropzone-file"
						className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/20 bg-[#fff] hover:bg-primary/10"
					>
						<div className="flex flex-col items-center justify-center px-6 pb-6 pt-5 text-primary">
							<BsCloudUploadFill color={"rgb(31,41,55)"} size={50} />
							<p className="text-center text-xs font-medium tracking-tight">Clique para escolher um ou mais arquivos ou os arraste para a àrea demarcada</p>
						</div>
						<input
							onChange={(e) => {
								if (e.target.files) {
									const files = Array.from(e.target.files);
									return setAttachments((prev) => [...prev, ...files]);
								}
								return;
							}}
							multiple={true}
							id="dropzone-file"
							type="file"
							className="absolute h-full w-full opacity-0"
						/>
					</label>
				</div>
				<div className="w-full flex items-center flex-wrap gap-2">
					{attachments.map((attachment, index) => (
						<div key={`attachment-${attachment.name}-${index}`} className="flex w-full justify-between items-center gap-1 rounded border border-primary bg-[#fff] p-2">
							<div className="flex items-center gap-1">
								<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
									<MdAttachFile />
								</div>
								<p className="text-sm font-bold leading-none tracking-tight">{formatLongString(attachment.name, 20)}</p>
							</div>
							<button type="button" onClick={() => removeAttachment(index)} className="flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1 text-[0.6rem] text-white hover:bg-red-500">
								<MdDelete width={10} height={10} />
								<p>REMOVER</p>
							</button>
						</div>
					))}
				</div>
				<TextInput
					label="TÍTULO DOS ARQUIVOS"
					labelClassName="text-[0.6rem]"
					inputClassName="text-xs p-2 min-h-[34px]"
					placeholder="Preencha aqui o título para os arquivos..."
					value={attachmentsTitle}
					handleChange={(value) => setAttachmentsTitle(value)}
					width="100%"
				/>
				<div className="flex items-center justify-end">
					<Button onClick={() => handleAddFiles({ title: attachmentsTitle, files: attachments })} size={"sm"} type="button">
						ADICIONAR ARQUIVOS
					</Button>
				</div>
			</div>
		</motion.div>
	);
}
