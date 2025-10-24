import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import type { TUserSession } from "@/lib/auth/session";
import { DEFAULT_LEAD_QUALIFICATION_ATTRIBUTES } from "@/lib/leads";
import { createLead } from "@/utils/mutations/leads";
import type { TLead } from "@/utils/schemas/leads.schema";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { GeneralBlock, QualificationBlock } from "./Blocks/LeadContent";

type NewLeadProps = {
	sessionUser: TUserSession;
	closeModal: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
		onError?: (error: Error) => void;
	};
};

export default function NewLead({ closeModal, callbacks, sessionUser }: NewLeadProps) {
	const initialInfoHolder: TLead = {
		nome: "",
		telefone: "",
		canalAquisicao: "PROSPECÇÃO ATIVA",
		qualificacao: {
			score: 0,
			atributos: DEFAULT_LEAD_QUALIFICATION_ATTRIBUTES.map((attribute) => ({
				nome: attribute.name,
				identificador: attribute.identifier,
				valor: "",
				peso: attribute.weight,
			})),
			responsavel: {
				id: sessionUser.user.id,
				nome: sessionUser.user.nome,
				avatar_url: sessionUser.user.avatar_url,
			},
		},
		dataInsercao: new Date().toISOString(),
	};
	const [infoHolder, setInfoHolder] = useState<TLead>(initialInfoHolder);

	function updateInfoHolder(newInfo: Partial<TLead>) {
		setInfoHolder((prev) => ({ ...prev, ...newInfo }));
	}
	function updateQualification(newInfo: Partial<TLead["qualificacao"]>) {
		setInfoHolder((prev) => ({
			...prev,
			qualificacao: { ...prev.qualificacao, ...newInfo },
		}));
	}
	const { mutate: handleCreateLeadMutation, isPending } = useMutation({
		mutationFn: createLead,
		mutationKey: ["create-lead"],
		onMutate: async () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			setInfoHolder(initialInfoHolder);
			return toast.success(data.message);
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError: async (error) => {
			if (callbacks?.onError) callbacks.onError(error);
		},
	});

	return (
		<ResponsiveDialogDrawer
			menuTitle="NOVO LEAD"
			menuDescription="Preencha os campos abaixo para criar um novo lead."
			menuActionButtonText="CRIAR LEAD"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={() => handleCreateLeadMutation({ type: "single", lead: infoHolder })}
			actionIsLoading={isPending}
			stateIsLoading={false}
		>
			<GeneralBlock
				name={infoHolder.nome}
				phone={infoHolder.telefone}
				uf={infoHolder.uf}
				city={infoHolder.cidade}
				acquisitionChannel={infoHolder.canalAquisicao}
				updateInfoHolder={updateInfoHolder}
			/>
			<QualificationBlock qualification={infoHolder.qualificacao} updateQualification={updateQualification} />
		</ResponsiveDialogDrawer>
	);
}
