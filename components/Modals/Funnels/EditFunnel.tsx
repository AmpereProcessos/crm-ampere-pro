import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { TUserSession } from "@/lib/auth/session";
import { editFunnel } from "@/utils/mutations/funnels";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useFunnelById } from "@/utils/queries/funnels";
import { usePartnersSimplified } from "@/utils/queries/partners";
import { DEFAULT_KANBAN_CARD_BLOCKS, type TFunnel, type TKanbanCardBlock } from "@/utils/schemas/funnel.schema";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import FunnelBasicInfoSection from "./Blocks/FunnelBasicInfoSection";
import FunnelCardConfigSection from "./Blocks/FunnelCardConfigSection";
import FunnelStagesSection from "./Blocks/FunnelStagesSection";

type EditFunnelProps = {
	session: TUserSession;
	funnelId: string;
	closeModal: () => void;
};

function EditFunnel({ session, funnelId, closeModal }: EditFunnelProps) {
	const queryClient = useQueryClient();
	const { data: partners } = usePartnersSimplified();
	const { data: funnel, isLoading, isError } = useFunnelById({ id: funnelId });

	const [infoHolder, setInfoHolder] = useState<TFunnel>({
		nome: "",
		descricao: "",
		etapas: [],
		idParceiro: session.user.idParceiro || "",
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});

	const [cardBlocks, setCardBlocks] = useState<TKanbanCardBlock[]>([...DEFAULT_KANBAN_CARD_BLOCKS]);

	const { mutate: handleEditFunnel, isPending } = useMutationWithFeedback({
		mutationKey: ["edit-funnel"],
		mutationFn: editFunnel,
		queryClient,
		affectedQueryKey: ["funnels"],
		callbackFn: () => {
			queryClient.invalidateQueries({ queryKey: ["opportunities-query-definitions"] });
		},
	});

	useEffect(() => {
		if (funnel) {
			setInfoHolder(funnel);
			if (funnel.configuracaoCartao?.blocos && funnel.configuracaoCartao.blocos.length > 0) {
				setCardBlocks([...funnel.configuracaoCartao.blocos]);
			}
		}
	}, [funnel]);

	function handleSave() {
		const orderedBlocks = cardBlocks.map((b, i) => ({ ...b, ordem: i }));
		handleEditFunnel({
			id: funnelId,
			changes: {
				...infoHolder,
				configuracaoCartao: { blocos: orderedBlocks },
			},
		});
	}

	return (
		<ResponsiveDialogDrawer
			menuTitle="EDITAR FUNIL"
			menuDescription="Altere as informacoes do funil conforme necessario."
			menuActionButtonText="ATUALIZAR FUNIL"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={handleSave}
			actionIsLoading={isPending}
			stateIsLoading={isLoading}
			stateError={isError ? "Erro ao buscar informacoes do funil." : null}
			dialogVariant="md"
			drawerVariant="lg"
		>
			<FunnelBasicInfoSection infoHolder={infoHolder} setInfoHolder={setInfoHolder} partners={partners} />
			<FunnelStagesSection infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
			<FunnelCardConfigSection blocks={cardBlocks} setBlocks={setCardBlocks} />
		</ResponsiveDialogDrawer>
	);
}

export default EditFunnel;
