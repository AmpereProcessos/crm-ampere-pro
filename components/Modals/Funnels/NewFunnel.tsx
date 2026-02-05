import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { TUserSession } from "@/lib/auth/session";
import { createFunnel } from "@/utils/mutations/funnels";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { usePartnersSimplified } from "@/utils/queries/partners";
import type { TFunnel } from "@/utils/schemas/funnel.schema";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import FunnelBasicInfoSection from "./Blocks/FunnelBasicInfoSection";
import FunnelStagesSection from "./Blocks/FunnelStagesSection";

type NewFunnelProps = {
	session: TUserSession;
	closeModal: () => void;
};

function NewFunnel({ session, closeModal }: NewFunnelProps) {
	const queryClient = useQueryClient();
	const { data: partners } = usePartnersSimplified();

	function getDefaultInfoHolder(): TFunnel {
		return {
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
		};
	}

	const [infoHolder, setInfoHolder] = useState<TFunnel>(getDefaultInfoHolder);

	const { mutate: handleCreateFunnel, isPending } = useMutationWithFeedback({
		mutationKey: ["create-funnel"],
		mutationFn: createFunnel,
		queryClient,
		affectedQueryKey: ["funnels"],
		callbackFn: () => setInfoHolder(getDefaultInfoHolder()),
	});

	return (
		<ResponsiveDialogDrawer
			menuTitle="NOVO FUNIL"
			menuDescription="Preencha as informacoes abaixo para criar um novo funil."
			menuActionButtonText="CRIAR FUNIL"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={() => handleCreateFunnel({ info: infoHolder })}
			actionIsLoading={isPending}
			stateIsLoading={false}
			dialogVariant="md"
			drawerVariant="lg"
		>
			<FunnelBasicInfoSection infoHolder={infoHolder} setInfoHolder={setInfoHolder} partners={partners} />
			<FunnelStagesSection infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
		</ResponsiveDialogDrawer>
	);
}

export default NewFunnel;
