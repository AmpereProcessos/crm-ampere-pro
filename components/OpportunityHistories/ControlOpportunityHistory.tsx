import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { useMediaQuery } from "@/lib/utils";
import { updateOpportunityHistory } from "@/utils/mutations/opportunity-history";
import { useOpportunityHistoryById } from "@/utils/queries/opportunity-history";
import { useOpportunityHistoryStore } from "@/utils/stores/opportunity-history-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { LoadingButton } from "../Buttons/loading-button";
import { Button } from "../ui/button";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";
import AnnotationInfo from "./Blocks/AnnotationInfo";
import InterationInfo from "./Blocks/InterationInfo";
import TypeSelector from "./Blocks/TypeSelector";

type ControlOpportunityHistoryProps = {
	opportunityHistoryId: string;
	session: TUserSession;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
	};
	closeModal: () => void;
};
function ControlOpportunityHistory({ opportunityHistoryId, session, callbacks, closeModal }: ControlOpportunityHistoryProps) {
	const queryClient = useQueryClient();
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const {
		data: opportunityHistory,
		isLoading: isLoadingOpportunityHistory,
		isError: isErrorOpportunityHistory,
		isSuccess: isSuccessOpportunityHistory,
		error: errorOpportunityHistory,
	} = useOpportunityHistoryById({ id: opportunityHistoryId });
	const reset = useOpportunityHistoryStore((s) => s.reset);
	const redefineOpportunityHistory = useOpportunityHistoryStore((s) => s.redefineOpportunityHistory);
	const getOpportunityHistory = useOpportunityHistoryStore((s) => s.getOpportunityHistory);

	const { mutate: handleUpdateOpportunityHistory, isPending } = useMutation({
		mutationKey: ["update-opportunity-history", opportunityHistoryId],
		mutationFn: updateOpportunityHistory,
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ["opportunity-history-by-id", opportunityHistoryId] });
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
			queryClient.invalidateQueries({ queryKey: ["opportunity-history-by-id", opportunityHistoryId] });
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onError(error, variables, context) {
			const msg = getErrorMessage(error);
			return toast.error(msg);
		},
	});
	useEffect(() => {
		// cleanup
		return () => reset();
	}, [reset]);
	useEffect(() => {
		if (opportunityHistory) {
			redefineOpportunityHistory(opportunityHistory);
		}
	}, [opportunityHistory, redefineOpportunityHistory]);

	const MENU_TITLE = "ATUALIZAR REGISTRO DA OPORTUNIDADE";
	const MENU_DESCRIPTION = "Preencha os campos abaixo para atualizar o registro da oportunidade.";
	const BUTTON_TEXT = "ATUALIZAR REGISTRO";
	return isDesktop ? (
		<Dialog open onOpenChange={(v) => (!v ? closeModal() : null)}>
			<DialogContent className="flex flex-col h-fit min-h-[60vh] max-h-[70vh] dark:bg-background">
				<DialogHeader>
					<DialogTitle>{MENU_TITLE}</DialogTitle>
					<DialogDescription>{MENU_DESCRIPTION}</DialogDescription>
				</DialogHeader>
				{isLoadingOpportunityHistory ? <LoadingComponent /> : null}
				{isErrorOpportunityHistory ? <ErrorComponent msg={getErrorMessage(errorOpportunityHistory)} /> : null}
				{isSuccessOpportunityHistory ? (
					<>
						<div className="flex-1 overflow-auto">
							<ControlOpportunityHistoryContent session={session} />
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">FECHAR</Button>
							</DialogClose>
							<LoadingButton
								onClick={() =>
									handleUpdateOpportunityHistory({
										id: opportunityHistoryId,
										changes: getOpportunityHistory(),
									})
								}
								loading={isPending}
							>
								{BUTTON_TEXT}
							</LoadingButton>
						</DialogFooter>
					</>
				) : null}
			</DialogContent>
		</Dialog>
	) : (
		<Drawer open onOpenChange={(v) => (!v ? closeModal() : null)}>
			<DrawerContent className="h-fit max-h-[70vh] flex flex-col">
				<DrawerHeader className="text-left">
					<DrawerTitle>{MENU_TITLE}</DrawerTitle>
					<DrawerDescription>{MENU_DESCRIPTION}</DrawerDescription>
				</DrawerHeader>
				{isLoadingOpportunityHistory ? <LoadingComponent /> : null}
				{isErrorOpportunityHistory ? <ErrorComponent msg={getErrorMessage(errorOpportunityHistory)} /> : null}
				{isSuccessOpportunityHistory ? (
					<>
						<div className="flex-1 overflow-auto">
							<ControlOpportunityHistoryContent session={session} />
						</div>
						<DrawerFooter>
							<DrawerClose asChild>
								<Button variant="outline">FECHAR</Button>
							</DrawerClose>
							<LoadingButton
								onClick={() =>
									handleUpdateOpportunityHistory({
										id: opportunityHistoryId,
										changes: getOpportunityHistory(),
									})
								}
								loading={isPending}
							>
								{BUTTON_TEXT}
							</LoadingButton>
						</DrawerFooter>
					</>
				) : null}
			</DrawerContent>
		</Drawer>
	);
}

export default ControlOpportunityHistory;

type ControlOpportunityHistoryContentProps = {
	session: TUserSession;
};
function ControlOpportunityHistoryContent({ session }: ControlOpportunityHistoryContentProps) {
	return (
		<div className="flex h-full w-full flex-col gap-6 px-4 lg:px-0">
			<TypeSelector />
			<AnnotationInfo />
			<InterationInfo />
		</div>
	);
}
