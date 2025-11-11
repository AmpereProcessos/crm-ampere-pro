import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import useAutomationStateHook from "@/hooks/use-automation-state-hook";
import type { TUserSession } from "@/lib/auth/session";
import { createAutomation } from "@/utils/mutations/automations";
import AutomationActionBlock from "./Blocks/Action";
import AutomationExecutionBlock from "./Blocks/Execution";
import AutomationGeneralBlock from "./Blocks/General";
import AutomationTriggerBlock from "./Blocks/Trigger";

type NewAutomationModalProps = {
	session: TUserSession;
	closeModal: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onError?: (error: Error) => void;
		onSettled?: () => void;
	};
};

function NewAutomation({ session, closeModal, callbacks }: NewAutomationModalProps) {
	const queryClient = useQueryClient();

	const { state, updateAutomation, updateTrigger, updateExecution, updateAction, resetState } = useAutomationStateHook({
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
			},
		},
	});

	const {
		data: mutationData,
		mutate: handleCreateAutomationMutation,
		reset: resetMutation,
		isPending,
	} = useMutation({
		mutationKey: ["create-automation"],
		mutationFn: async () => {
			return await createAutomation({
				info: {
					automation: state.automation,
				},
			});
		},
		onMutate: async () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			await queryClient.invalidateQueries({ queryKey: ["automations"] });
			if (callbacks?.onSuccess) callbacks.onSuccess();
			return toast.success(data);
		},
		onError: async (error) => {
			if (callbacks?.onError) callbacks.onError(error);
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
	});

	return (
		<ResponsiveDialogDrawer
			menuTitle="NOVA AUTOMAÇÃO"
			menuDescription="Configure uma nova automação para seu CRM."
			menuActionButtonText="CRIAR AUTOMAÇÃO"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={() => handleCreateAutomationMutation()}
			actionIsLoading={isPending}
			stateIsLoading={false}
			dialogVariant="md"
			drawerVariant="md"
		>
			{mutationData ? (
				<div className="flex w-full grow flex-col items-center justify-center gap-2">
					<div className="flex flex-col items-center gap-1">
						<BadgeCheck className="h-10 min-h-10 w-10 min-w-10 text-green-500 lg:h-20 lg:w-20" />
						<h1 className="text-center font-bold text-lg text-primary tracking-tight">Automação criada com sucesso!</h1>
					</div>
					<div className="flex flex-col items-center gap-2 lg:flex-row">
						<Button
							onClick={() => {
								resetState();
								resetMutation();
							}}
							variant="secondary"
						>
							NOVA AUTOMAÇÃO
						</Button>
					</div>
				</div>
			) : (
				<div className="flex w-full flex-col gap-4 px-2">
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
			)}
		</ResponsiveDialogDrawer>
	);
}

export default NewAutomation;
