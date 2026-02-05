import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { editFunnel } from "@/utils/mutations/funnels";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { DEFAULT_KANBAN_CARD_BLOCKS, type TKanbanCardBlock, type TKanbanCardConfig } from "@/utils/schemas/funnel.schema";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import FunnelCardConfigSection from "./Blocks/FunnelCardConfigSection";

type KanbanCardConfigModalProps = {
	funnelId: string;
	currentConfig: TKanbanCardConfig | null;
	closeModal: () => void;
};

export default function KanbanCardConfigModal({ funnelId, currentConfig, closeModal }: KanbanCardConfigModalProps) {
	const queryClient = useQueryClient();

	const [blocks, setBlocks] = useState<TKanbanCardBlock[]>(() => {
		if (currentConfig?.blocos && currentConfig.blocos.length > 0) {
			return [...currentConfig.blocos];
		}
		return [...DEFAULT_KANBAN_CARD_BLOCKS];
	});

	const { mutate: handleSave, isPending } = useMutationWithFeedback({
		mutationKey: ["edit-funnel-card-config"],
		mutationFn: editFunnel,
		queryClient,
		affectedQueryKey: ["funnels"],
		callbackFn: () => {
			queryClient.invalidateQueries({ queryKey: ["opportunities-query-definitions"] });
			closeModal();
		},
	});

	function onSave() {
		const orderedBlocks = blocks.map((b, i) => ({ ...b, ordem: i }));
		handleSave({
			id: funnelId,
			changes: {
				configuracaoCartao: { blocos: orderedBlocks },
			},
		});
	}

	return (
		<ResponsiveDialogDrawer
			menuTitle="CONFIGURAR CARTAO"
			menuDescription="Configure os blocos que aparecem nos cartoes do kanban deste funil."
			menuActionButtonText="SALVAR"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={onSave}
			actionIsLoading={isPending}
			stateIsLoading={false}
			dialogVariant="md"
			drawerVariant="lg"
		>
			<FunnelCardConfigSection blocks={blocks} setBlocks={setBlocks} />
		</ResponsiveDialogDrawer>
	);
}
