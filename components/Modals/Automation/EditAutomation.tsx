import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import useAutomationStateHook from "@/hooks/use-automation-state-hook";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { updateAutomation as updateAutomationMutation } from "@/utils/mutations/automations";
import { useAutomationById } from "@/utils/queries/automations";
import AutomationActionBlock from "./Blocks/Action";
import AutomationExecutionBlock from "./Blocks/Execution";
import AutomationGeneralBlock from "./Blocks/General";
import AutomationTriggerBlock from "./Blocks/Trigger";

type EditAutomationModalProps = {
	automationId: string;
	session: TUserSession;
	closeModal: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onError?: (error: Error) => void;
		onSettled?: () => void;
	};
};

function EditAutomation({ automationId, session, closeModal, callbacks }: EditAutomationModalProps) {
	const queryClient = useQueryClient();
	const { data: automation, queryKey, isError, isLoading, error } = useAutomationById({ id: automationId });

	const { state, updateAutomation, updateTrigger, updateExecution, updateAction, redefineState } = useAutomationStateHook({
		initialState: {
			automation: {
				ativo: true,
				titulo: "",
				descricao: "",
				gatilho: {
					tipo: "OPORTUNIDADE-MUDANÇA-ESTÁGIO-FUNIL",
					funilId: "",
					estagioFunilInicialId: "",
					estagioFunilFinalId: "",
				},
				execucao: {
					tipo: "AGENDADA",
					tempoDelayMedida: "HORAS",
					tempoDelayValor: 1,
				},
				acao: {
					tipo: "ENVIO-CLIENTE-EMAIL",
					templateId: "",
				},
				execucoesContagemTotal: 0,
				execucoesContagemTotalSucessos: 0,
				execucoesContagemTotalFalhas: 0,
				autor: {
					id: session.user.id,
					nome: session.user.nome,
					avatar_url: session.user.avatar_url,
				},
				dataInsercao: new Date().toISOString(),
				dataUltimaExecucao: null,
			},
		},
	});

	const { mutate: handleUpdateAutomationMutation, isPending } = useMutation({
		mutationKey: ["update-automation", automationId],
		mutationFn: async () => {
			return await updateAutomationMutation({
				id: automationId,
				changes: state.automation,
			});
		},
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: queryKey });
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			return toast.success(data);
		},
		onError: async (error) => {
			if (callbacks?.onError) callbacks.onError(error);
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
			await queryClient.invalidateQueries({ queryKey: queryKey });
			await queryClient.invalidateQueries({ queryKey: ["automations"] });
		},
	});

	useEffect(() => {
		if (automation) {
			redefineState({ automation: automation });
		}
	}, [automation, redefineState]);

	return (
		<ResponsiveDialogDrawer
			menuTitle="EDITAR AUTOMAÇÃO"
			menuDescription="Atualize as configurações da automação."
			menuActionButtonText="ATUALIZAR AUTOMAÇÃO"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={() => handleUpdateAutomationMutation()}
			actionIsLoading={isPending}
			stateIsLoading={isLoading}
			stateError={isError ? getErrorMessage(error) : null}
			dialogVariant="lg"
			drawerVariant="lg"
		>
			<div className="flex flex-col gap-4">
				<AutomationGeneralBlock infoHolder={state.automation} updateInfoHolder={updateAutomation} />
				<AutomationTriggerBlock
					trigger={state.automation.gatilho}
					updateTrigger={updateTrigger}
					currentExecution={state.automation.execucao}
					updateExecution={updateExecution}
				/>
				<AutomationExecutionBlock execution={state.automation.execucao} updateExecution={updateExecution} triggerType={state.automation.gatilho.tipo} />
				<AutomationActionBlock action={state.automation.acao} updateAction={updateAction} />
			</div>
		</ResponsiveDialogDrawer>
	);
}

export default EditAutomation;
