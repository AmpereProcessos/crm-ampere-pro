import TextInput from "@/components/Inputs/TextInput";
import type { TFileReference, TFileReferenceVinculations } from "@/utils/schemas/file-reference.schema";
import type { TUserSession } from "@/lib/auth/session";
import React, { useEffect, useState } from "react";
import { VscChromeClose } from "react-icons/vsc";
import FileReferencesVinculations from "./Blocks/Vinculations";
import Image from "next/image";
import { getFileTypeTitle, getTitleFileType, isFileFormatImage, isFileImage, uploadFile } from "@/lib/methods/firebase";
import { MdAttachFile } from "react-icons/md";
import { LoadingButton } from "@/components/Buttons/loading-button";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useQueryClient } from "@tanstack/react-query";
import { deleteFileReference, updateFileReference } from "@/utils/mutations/file-references";
import { useFileReferenceById } from "@/utils/queries/file-references";
import LoadingComponent from "@/components/utils/LoadingComponent";
import ErrorComponent from "@/components/utils/ErrorComponent";

type TAttachmentHolder = {
	file: File;
	type: string;
	previewUrl: string;
};
type ControlFileReferenceProps = {
	fileReferenceId: string;
	vinculations: TFileReferenceVinculations;
	session: TUserSession;
	affectedQueryKey: any[];
	closeModal: () => void;
};
function ControlFileReference({ fileReferenceId, vinculations, session, affectedQueryKey, closeModal }: ControlFileReferenceProps) {
	const queryClient = useQueryClient();

	const { data: fileReference, isLoading, isError, isSuccess, error } = useFileReferenceById({ id: fileReferenceId });
	const [fileHolder, setFileHolder] = useState<TAttachmentHolder | null>(null);
	const [infoHolder, setInfoHolder] = useState<TFileReference>({
		titulo: "",
		idParceiro: session.user.idParceiro || "",
		idCliente: vinculations.clientId?.blocked ? vinculations.clientId.value : undefined,
		idOportunidade: vinculations.opportunityId?.blocked ? vinculations.opportunityId.value : undefined,
		idHomologacao: vinculations.homologationId?.blocked ? vinculations.homologationId.value : undefined,
		idAnaliseTecnica: vinculations.technicalAnalysisId?.blocked ? vinculations.technicalAnalysisId.value : undefined,
		idProjeto: vinculations.projectId?.blocked ? vinculations.projectId.value : undefined,
		idCompra: vinculations.purchaseId?.blocked ? vinculations.purchaseId.value : undefined,
		idReceita: vinculations.revenueId?.blocked ? vinculations.revenueId.value : undefined,
		idDespesa: vinculations.expenseId?.blocked ? vinculations.expenseId.value : undefined,
		idOrdemServico: vinculations.serviceOrderId?.blocked ? vinculations.serviceOrderId.value : undefined,

		formato: "",
		url: "",
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});
	function updateHolder(changes: Partial<TFileReference>) {
		setInfoHolder((prev) => ({ ...prev, ...changes }));
	}

	async function handleUpdateFileReference({
		fileReference,
		attachment,
	}: {
		fileReference: TFileReference;
		attachment: TAttachmentHolder | null;
	}) {
		try {
			let fileMetadata = {
				url: fileReference.url,
				formato: fileReference.formato,
				tamanho: fileReference.tamanho,
			};
			if (attachment?.file) {
				const { url, size, format } = await uploadFile({
					file: attachment.file,
					fileName: fileReference.titulo,
					vinculationId: fileReferenceId,
				});
				fileMetadata = { url, formato: format, tamanho: size };
			}

			return await updateFileReference({
				id: fileReferenceId,
				changes: { ...fileReference, ...fileMetadata },
			});
		} catch (error) {
			console.log("Errror running handleUpdateFileReference", error);
			throw error;
		}
	}
	const { mutate: mutateUpdateFileReference, isPending: isUpdateLoading } = useMutationWithFeedback({
		mutationKey: ["update-file-reference", fileReferenceId],
		mutationFn: handleUpdateFileReference,
		queryClient,
		affectedQueryKey: affectedQueryKey,
	});
	const { mutate: mutateDeleteFileReference, isPending: isDeleteLoading } = useMutationWithFeedback({
		mutationKey: ["delete-file-reference", fileReferenceId],
		mutationFn: deleteFileReference,
		queryClient,
		affectedQueryKey: affectedQueryKey,
		callbackFn: () => closeModal(),
	});
	useEffect(() => {
		if (fileReference) setInfoHolder(fileReference);
	}, [fileReference]);
	return (
		<div id="control-file-reference" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[60%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[40%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-wrap items-center justify-between border-b border-gray-300 px-2 pb-2 text-lg">
						<h3 className="text-xl font-bold text-black">EDITAR ANEXOS</h3>
						<button onClick={() => closeModal()} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent /> : null}
					{isSuccess ? (
						<>
							<div className="flex grow flex-col overflow-x-hidden overflow-y-auto overscroll-y-auto py-4 gap-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
								<TextInput
									label="TÍTULO DO(s) ANEXO(s)"
									placeholder="Preencha aqui o titulo a ser dado ao(s) anexo(s)..."
									value={infoHolder.titulo}
									handleChange={(value) => updateHolder({ titulo: value })}
									width="100%"
								/>
								<FileReferencesVinculations
									data={{
										idCliente: infoHolder.idCliente,
										idOportunidade: infoHolder.idOportunidade,
										idAnaliseTecnica: infoHolder.idAnaliseTecnica,
										idHomologacao: infoHolder.idHomologacao,
										idProjeto: infoHolder.idProjeto,
										idCompra: infoHolder.idCompra,
										idReceita: infoHolder.idReceita,
										idDespesa: infoHolder.idDespesa,
										idOrdemServico: infoHolder.idOrdemServico,
									}}
									updateReference={updateHolder}
									vinculations={vinculations}
								/>
								<ControlFileReferenceFileAttachment fileReference={infoHolder} attachmentHolder={fileHolder} updateAttachment={(info) => setFileHolder(info)} />
							</div>
							<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row px-2">
								<LoadingButton variant={"destructive"} loading={isDeleteLoading} onClick={() => mutateDeleteFileReference({ id: fileReferenceId })} type="button">
									REMOVER ANEXO
								</LoadingButton>
								<LoadingButton
									loading={isUpdateLoading}
									onClick={() =>
										mutateUpdateFileReference({
											fileReference: infoHolder,
											attachment: fileHolder,
										})
									}
									type="button"
								>
									ATUALIZAR ANEXO
								</LoadingButton>
							</div>
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default ControlFileReference;

type ControlFileReferenceFileAttachmentProps = {
	fileReference: TFileReference;
	attachmentHolder: TAttachmentHolder | null;
	updateAttachment: (attachment: TAttachmentHolder | null) => void;
};
function ControlFileReferenceFileAttachment({ fileReference, attachmentHolder, updateAttachment }: ControlFileReferenceFileAttachmentProps) {
	const fileType = getTitleFileType(attachmentHolder?.type || fileReference.formato);
	const isImage = isFileImage(fileType);
	const imageUrl = isImage ? attachmentHolder?.previewUrl || fileReference.url : null;

	console.log(fileType, isImage, imageUrl);
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex h-[200px] w-[200px] flex-col self-center rounded border border-primary/50">
				<div className="relative flex h-[200px] w-full grow items-center justify-center bg-gradient-to-b from-sky-400 to-sky-200">
					{imageUrl ? (
						<Image src={imageUrl} alt={fileReference.titulo} fill={true} />
					) : (
						<h1 className="rounded-lg bg-blue-600 px-4 py-1 text-[0.65rem] font-bold text-white">{getFileTypeTitle(fileType)}</h1>
					)}
				</div>
			</div>
			<div className="flex w-full items-center justify-end">
				<label
					htmlFor="new-images"
					className="relative flex items-center gap-1 rounded-lg border border-green-500 bg-green-50 px-2 py-1 text-xs text-green-500 duration-300 ease-in-out hover:border-green-700 hover:text-green-700"
				>
					<div className="flex items-center justify-center gap-1">
						<MdAttachFile />
						<p className="font-medium">REDEFINIR ANEXO</p>
					</div>
					<input
						onChange={(e) => {
							const file = e.target.files ? e.target.files[0] : undefined;
							if (!file) {
								return updateAttachment(null);
							}

							return updateAttachment({
								file: file,
								previewUrl: URL.createObjectURL(file),
								type: file.type,
							});
						}}
						id="dropzone-file"
						type="file"
						className="absolute h-full w-full opacity-0"
						accept=".png,.jpeg,.jpg"
						multiple={false}
					/>
				</label>
			</div>
		</div>
	);
}
