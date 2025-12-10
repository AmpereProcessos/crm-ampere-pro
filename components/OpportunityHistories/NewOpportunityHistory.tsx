import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { useMediaQuery } from "@/lib/utils";
import { createOpportunityHistory } from "@/utils/mutations/opportunity-history";
import type { TOpportunityHistory } from "@/utils/schemas/opportunity-history.schema";
import { useOpportunityHistoryStore } from "@/utils/stores/opportunity-history-store";
import { LoadingButton } from "../Buttons/loading-button";
import { Button } from "../ui/button";
import AnnotationInfo from "./Blocks/AnnotationInfo";
import InterationInfo from "./Blocks/InterationInfo";
import TypeSelector from "./Blocks/TypeSelector";

type NewOpportunityHistoryProps = {
	initialCategory: TOpportunityHistory["categoria"];
	closeModal: () => void;
	session: TUserSession;
	opportunity: { id: string; nome: string; identificador: string };
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
	};
};
function NewOpportunityHistory({ closeModal, session, opportunity, initialCategory, callbacks }: NewOpportunityHistoryProps) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const queryClient = useQueryClient();

	const reset = useOpportunityHistoryStore((s) => s.reset);
	const updateOpportunityHistory = useOpportunityHistoryStore((s) => s.updateOpportunityHistory);
	const setCategory = useOpportunityHistoryStore((s) => s.setCategory);
	const getOpportunityHistory = useOpportunityHistoryStore((s) => s.getOpportunityHistory);

	const { mutate: handleCreateOpportunityHistory, isPending } = useMutation({
		mutationKey: ["create-opportunity-history"],
		mutationFn: createOpportunityHistory,
		onMutate: async () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess(data, variables, context) {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			reset();
			toast.success(data);
			closeModal();
			return;
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError(error, variables, context) {
			const msg = getErrorMessage(error);
			return toast.error(msg);
		},
	});

	// Initialize the store with the initial values
	useEffect(() => {
		const current = getOpportunityHistory();
		// Reset if the stored opportunity is different from the current one
		if (current.oportunidade.id && current.oportunidade.id !== opportunity.id) {
			reset();
		}

		setCategory(initialCategory);
		updateOpportunityHistory({
			oportunidade: opportunity,
			idParceiro: session.user.idParceiro || "",
			autor: {
				id: session.user.id,
				nome: session.user.nome,
				avatar_url: session.user.avatar_url,
			},
		});
	}, [session, opportunity, initialCategory, updateOpportunityHistory, setCategory, reset, getOpportunityHistory]);
	const MENU_TITLE = "NOVA REGISTRO DA OPORTUNIDADE";
	const MENU_DESCRIPTION = "Preencha os campos abaixo para criar uma nova interação ou anotação.";
	const BUTTON_TEXT = "CADASTRAR";
	return isDesktop ? (
		<Dialog open onOpenChange={(v) => (!v ? closeModal() : null)}>
			<DialogContent className="flex flex-col h-fit min-h-[60vh] max-h-[70vh] dark:bg-background">
				<DialogHeader>
					<DialogTitle>{MENU_TITLE}</DialogTitle>
					<DialogDescription>{MENU_DESCRIPTION}</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-auto">
					<OpportunityHistoryContent />
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">FECHAR</Button>
					</DialogClose>
					<LoadingButton
						onClick={() =>
							handleCreateOpportunityHistory({
								info: getOpportunityHistory(),
							})
						}
						loading={isPending}
					>
						{BUTTON_TEXT}
					</LoadingButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	) : (
		<Drawer open onOpenChange={(v) => (!v ? closeModal() : null)}>
			<DrawerContent className="h-fit max-h-[70vh] flex flex-col">
				<DrawerHeader className="text-left">
					<DrawerTitle>{MENU_TITLE}</DrawerTitle>
					<DrawerDescription>{MENU_DESCRIPTION}</DrawerDescription>
				</DrawerHeader>

				<div className="flex-1 overflow-auto">
					<OpportunityHistoryContent />
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button variant="outline">FECHAR</Button>
					</DrawerClose>
					<LoadingButton
						onClick={() =>
							handleCreateOpportunityHistory({
								info: getOpportunityHistory(),
							})
						}
						loading={isPending}
					>
						{BUTTON_TEXT}
					</LoadingButton>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export default NewOpportunityHistory;

function OpportunityHistoryContent() {
	return (
		<div className="flex h-full w-full flex-col gap-6 px-4 lg:px-0">
			<TypeSelector />
			<AnnotationInfo />
			<InterationInfo />
		</div>
	);
}
