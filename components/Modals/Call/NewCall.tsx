import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { uploadFile } from "@/lib/methods/firebase";
import { storage } from "@/services/firebase/storage-config";
import { fileTypes } from "@/utils/constants";
import { createPPSCall, updatePPSCall } from "@/utils/mutations/pps-calls";
import type { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import type { TPPSCall } from "@/utils/schemas/pps-calls.schema";
import type { TAttachmentState } from "@/utils/schemas/utils";
import { useMutation } from "@tanstack/react-query";
import { type UploadResult, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { AttachFileBlock, ClientBlock, GeneralBlock, PremissesBlock } from "./Content";

type NewCallProps = {
	opportunity?: TOpportunityDTOWithClient;
	session: TUserSession;
	closeModal: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
		onError?: () => void;
	};
};
export default function NewCall({ opportunity, session, closeModal, callbacks }: NewCallProps) {
	const initialState: TPPSCall = {
		status: "PENDENTE",
		anotacoes: "",
		tipoSolicitacao: null,
		requerente: {
			idCRM: session?.user?.id || "",
			nomeCRM: session?.user.nome || "",
			apelido: "",
			avatar_url: session?.user.avatar_url || "",
		},
		projeto: {
			id: opportunity?._id,
			nome: opportunity?.nome,
			codigo: opportunity?.identificador,
		},
		premissas: {
			geracao: null,
			cargas: undefined,
			topologia: null,
			tipoEstrutura: null,
			valorFinanciamento: null,
		},
		cliente: {
			nome: opportunity?.cliente?.nome || "",
			tipo: opportunity?.instalacao.tipoTitular === "PESSOA JURÍDICA" ? "CNPJ" : "CPF",
			telefone: opportunity?.cliente?.telefonePrimario || "",
			cep: opportunity?.cliente?.cep,
			uf: opportunity?.cliente?.uf || "",
			cidade: opportunity?.cliente?.cidade || "",
			bairro: opportunity?.cliente?.bairro,
			endereco: opportunity?.cliente?.endereco,
			numeroOuIdentificador: opportunity?.cliente?.numeroOuIdentificador,
			cpfCnpj: opportunity?.cliente?.cpfCnpj || "",
			dataNascimento: opportunity?.cliente?.dataNascimento,
			email: opportunity?.cliente?.email || "",
			renda: null,
			profissao: null,
		},
		observacoes: "",
		dataInsercao: new Date().toISOString(),
	};
	const [infoHolder, setInfoHolder] = useState<TPPSCall>(initialState);

	const [attachments, setAttachments] = useState<TAttachmentState[]>([]);
	function addAttachment(attachment: TAttachmentState) {
		setAttachments((prev) => [...prev, attachment]);
	}
	function removeAttachment(index: number) {
		setAttachments((prev) => prev.filter((_, i) => i !== index));
	}
	function addCharge(charge: Exclude<TPPSCall["premissas"]["cargas"], undefined | null>[number]) {
		setInfoHolder((prev) => ({
			...prev,
			premissas: {
				...prev.premissas,
				cargas: [...(prev.premissas.cargas || []), charge],
			},
		}));
	}
	function removeCharge(index: number) {
		setInfoHolder((prev) => ({
			...prev,
			premissas: {
				...prev.premissas,
				cargas: prev.premissas.cargas?.filter((_, i) => i !== index) || [],
			},
		}));
	}
	function updateInfoHolder(changes: Partial<TPPSCall>) {
		setInfoHolder((prev) => ({ ...prev, ...changes }));
	}
	function updatePremisses(changes: Partial<TPPSCall["premissas"]>) {
		setInfoHolder((prev) => ({
			...prev,
			premissas: { ...prev.premissas, ...changes },
		}));
	}
	function updateClient(changes: Partial<TPPSCall["cliente"]>) {
		setInfoHolder((prev) => ({
			...prev,
			cliente: { ...prev.cliente, ...changes },
		}));
	}

	function validateFields() {
		if (!infoHolder.tipoSolicitacao) {
			toast.error("Preencha o tipo de solicitação desejada.");
			return false;
		}
		if (infoHolder.tipoSolicitacao === "DUVIDAS E AUXILIOS TÉCNICOS") {
			if (infoHolder.observacoes.trim().length < 5) {
				toast.error("Preencha a dúvida/questionamento/demanda no campo de observações.");
				return false;
			}
		}
		if (infoHolder.tipoSolicitacao === "PROPOSTA COMERCIAL (ON GRID)") {
			if (!infoHolder.projeto?.id) {
				toast.error("Vincule um projeto do CRM para requisitar uma proposta comercial.");
				return false;
			}
			if (!infoHolder.premissas.geracao || infoHolder.premissas.geracao <= 0) {
				toast.error("Preencha uma geração válida para requisitar uma proposta comercial.");
				return false;
			}
			if (!infoHolder.premissas.tipoEstrutura) {
				toast.error("Preencha o tipo de estrutura para requisitar uma proposta comercial.");
				return false;
			}
			if (!infoHolder.premissas.topologia) {
				toast.error("Preencha a topologia desejada para requisitar uma proposta comercial.");
				return false;
			}
		}
		if (infoHolder.tipoSolicitacao === "PROPOSTA COMERCIAL (OFF GRID)") {
			if (!infoHolder.premissas.cargas || infoHolder.premissas.cargas?.length === 0) {
				toast.error("Adicione cargas para requisitar uma proposta comercial OFF GRID.");
				return false;
			}
		}
		if (infoHolder.tipoSolicitacao === "ANÁLISE DE CRÉDITO") {
			if (!infoHolder.cliente.cpfCnpj || infoHolder.cliente.cpfCnpj.length < 14) {
				toast.error("Preencha um CPF/CNPJ válido.");
				return false;
			}
			if (!infoHolder.premissas.valorFinanciamento) {
				toast.error("Preencha o valor a ser financiado.");
				return false;
			}
			if (!infoHolder.cliente.renda || infoHolder.cliente.renda <= 0) {
				toast.error("Preencha a renda mensal média do cliente.");
				return false;
			}
			if (!infoHolder.cliente.profissao) {
				toast.error("Preencha a profissão do cliente.");
				return false;
			}
		}
		return true;
	}
	async function handleUploadFiles({ callId, attachments }: { callId: string; attachments: TAttachmentState[] }) {
		const filesToUpload = attachments
			.flatMap((attachment) =>
				attachment.arquivos.map((f) => ({
					title: attachment.arquivos.length > 0 ? `${attachment.titulo} (${attachment.arquivos.length})` : attachment.titulo,
					arquivo: f.arquivo as File,
				})),
			)
			.filter((f) => f.arquivo !== null);

		const links = await Promise.all(
			filesToUpload.map(async (file) => {
				const { url, format } = await uploadFile({
					prefix: "crm/chamados",
					file: file.arquivo,
					fileName: file.title,
					vinculationId: callId,
				});
				return {
					title: file.title,
					format: format,
					link: url,
				};
			}),
		);
		return links;
	}
	async function handleCallCreation({ call, attachments }: { call: TPPSCall; attachments: TAttachmentState[] }) {
		if (!validateFields()) return;
		const loadingToastId = toast.loading("Criando chamado...");
		const createPPSCallResponse = await createPPSCall({ ...call });
		const links = await handleUploadFiles({
			callId: createPPSCallResponse.data.insertedId,
			attachments: attachments,
		});
		const updatePPSCallResponse = await updatePPSCall(createPPSCallResponse.data.insertedId, { links: links });
		toast.dismiss(loadingToastId);
		toast.success(createPPSCallResponse.message);
		return createPPSCallResponse.message;
	}

	const { mutate: handleCallCreationMutation, isPending } = useMutation({
		mutationFn: handleCallCreation,
		mutationKey: ["create-call"],
		onMutate: async () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			return toast.success(data as string);
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError: async (error) => {
			const msg = getErrorMessage(error);
			if (callbacks?.onError) callbacks.onError();
			return toast.error(msg);
		},
	});

	return (
		<ResponsiveDialogDrawer
			menuTitle="NOVO CHAMADO"
			menuDescription="Preencha os campos abaixo para criar um novo chamado."
			menuActionButtonText="CRIAR CHAMADO"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={() =>
				handleCallCreationMutation({
					call: infoHolder,
					attachments: attachments,
				})
			}
			actionIsLoading={isPending}
			stateIsLoading={false}
			dialogVariant="md"
			drawerVariant="md"
		>
			<GeneralBlock infoHolder={infoHolder} updateInfoHolder={updateInfoHolder} />
			<ClientBlock client={infoHolder.cliente} updateClient={updateClient} requestType={infoHolder.tipoSolicitacao} />
			<PremissesBlock
				requestType={infoHolder.tipoSolicitacao}
				premissas={infoHolder.premissas}
				updatePremissas={updatePremisses}
				addCharge={addCharge}
				removeCharge={removeCharge}
			/>
			<AttachFileBlock attachments={attachments} addAttachment={addAttachment} removeAttachment={removeAttachment} />
		</ResponsiveDialogDrawer>
	);
}
