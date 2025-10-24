import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { useMediaQuery } from "@/lib/utils";
import { createActivity } from "@/utils/mutations/activities";
import { useActivityStore } from "@/utils/stores/activity-store";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { LoadingButton } from "../Buttons/loading-button";
import { Button } from "../ui/button";
import ActivityGeneralBlock from "./Blocks/General";
import ActivityResponsiblesBlock from "./Blocks/Responsibles";
import type { TActivityVinculations } from "./Blocks/Vinculations";
import ActivityVinculationsBlock from "./Blocks/Vinculations";

type NewActivityProps = {
	session: TUserSession;
	vinculations: TActivityVinculations;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
	};
	closeModal: () => void;
};
function NewActivity({ session, callbacks, closeModal, vinculations }: NewActivityProps) {
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const reset = useActivityStore((s) => s.reset);
	const updateActivity = useActivityStore((s) => s.updateActivity);
	const getActivity = useActivityStore((s) => s.getActivity);

	const { mutate: handleCreateActivity, isPending } = useMutation({
		mutationKey: ["create-activity"],
		mutationFn: createActivity,
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
	// Inicializar a store com os valores iniciais
	useEffect(() => {
		updateActivity({
			idParceiro: session.user.idParceiro || "",
			oportunidade: vinculations.opportunity?.blocked
				? {
						id: vinculations.opportunity?.id,
						nome: vinculations.opportunity?.name,
					}
				: {
						id: null,
						nome: null,
					},
			idHomologacao: vinculations.homologation?.blocked ? vinculations.homologation?.id : null,
			idAnaliseTecnica: vinculations.technicalAnalysis?.blocked ? vinculations.technicalAnalysis?.id : null,
			autor: {
				id: session.user.id,
				nome: session.user.nome,
				avatar_url: session.user.avatar_url,
			},
		});
		// Cleanup quando o componente for desmontado
		return () => {
			reset();
		};
	}, [session, vinculations, updateActivity, reset]);

	const MENU_TITLE = "NOVA ATIVIDADE";
	const MENU_DESCRIPTION = "Preencha os campos abaixo para criar uma nova atividade.";
	const BUTTON_TEXT = "CRIAR ATIVIDADE";
	return isDesktop ? (
		<Dialog open onOpenChange={(v) => (!v ? closeModal() : null)}>
			<DialogContent className="flex flex-col h-fit min-h-[60vh] max-h-[70vh] dark:bg-background">
				<DialogHeader>
					<DialogTitle>{MENU_TITLE}</DialogTitle>
					<DialogDescription>{MENU_DESCRIPTION}</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-auto">
					<NewActivityContent session={session} vinculations={vinculations} />
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">FECHAR</Button>
					</DialogClose>
					<LoadingButton
						onClick={() =>
							handleCreateActivity({
								info: getActivity(),
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
					<NewActivityContent session={session} vinculations={vinculations} />
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button variant="outline">FECHAR</Button>
					</DrawerClose>
					<LoadingButton
						onClick={() =>
							handleCreateActivity({
								info: getActivity(),
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

export default NewActivity;

type NewActivityContentProps = {
	session: TUserSession;
	vinculations: TActivityVinculations;
};
function NewActivityContent({ session, vinculations }: NewActivityContentProps) {
	return (
		<div className="flex h-full w-full flex-col gap-6 px-4 lg:px-0">
			<ActivityGeneralBlock />
			<ActivityVinculationsBlock vinculations={vinculations} />
			<ActivityResponsiblesBlock />
		</div>
	);
}
