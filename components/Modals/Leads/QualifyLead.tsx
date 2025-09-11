import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import type { TUserSession } from "@/lib/auth/session";
import { DEFAULT_LEAD_QUALIFICATION_ATTRIBUTES } from "@/lib/leads";
import { updateLead } from "@/utils/mutations/leads";
import { useLeadById } from "@/utils/queries/leads";
import type { TLead } from "@/utils/schemas/leads.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { QualificationBlock } from "./Blocks/LeadContent";

type QualifyLeadProps = {
	leadId: string;
	sessionUser: TUserSession;
	closeModal: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
		onError?: (error: Error) => void;
	};
};
export default function QualifyLead({
	leadId,
	closeModal,
	callbacks,
	sessionUser,
}: QualifyLeadProps) {
	const queryClient = useQueryClient();
	const [infoHolder, setInfoHolder] = useState<TLead["qualificacao"]>({
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
	});
	function updateInfoHolder(newInfo: Partial<TLead["qualificacao"]>) {
		setInfoHolder((prev) => ({ ...prev, ...newInfo }));
	}
	const {
		data: lead,
		isLoading,
		isError,
		isSuccess,
		error,
		queryKey,
	} = useLeadById({ id: leadId });

	const { mutate: handleCreateLeadMutation, isPending } = useMutation({
		mutationFn: updateLead,
		mutationKey: ["update-lead"],
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: queryKey });
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			return toast.success(data.message);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKey });
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError: async (error) => {
			if (callbacks?.onError) callbacks.onError(error);
		},
	});
	useEffect(() => {
		if (isSuccess) setInfoHolder(lead.qualificacao);
	}, [isSuccess, lead]);

	return (
		<ResponsiveDialogDrawer
			menuTitle="QUALIFICAÇÃO LEAD"
			menuDescription="Preencha algumas informações para qualificação do lead."
			menuActionButtonText="QUALIFICAR LEAD"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={() =>
				handleCreateLeadMutation({
					id: leadId,
					lead: {
						qualificacao: { ...infoHolder, data: new Date().toISOString() },
					},
				})
			}
			actionIsLoading={isPending}
			stateIsLoading={false}
		>
			<QualificationBlock
				qualification={infoHolder}
				updateQualification={updateInfoHolder}
			/>
		</ResponsiveDialogDrawer>
	);
}
