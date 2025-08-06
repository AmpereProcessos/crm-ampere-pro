import type { TUserSession } from "@/lib/auth/session";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/methods/errors";
import { useMediaQuery } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TActivity } from "@/utils/schemas/activities.schema";
import type { TActivityVinculations } from "./Blocks/Vinculations";
import { createActivity, editActivity } from "@/utils/mutations/activities";
import { Button } from "../ui/button";
import { LoadingButton } from "../Buttons/loading-button";
import { useActivityStore } from "@/utils/stores/activity-store";
import ActivityGeneralBlock from "./Blocks/General";
import ActivityVinculationsBlock from "./Blocks/Vinculations";
import ActivityResponsiblesBlock from "./Blocks/Responsibles";
import { useActivityById } from "@/utils/queries/activities";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";

type ControlActivityProps = {
	activityId: string;
	session: TUserSession;
	vinculations: TActivityVinculations;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
	};
	closeModal: () => void;
};
function ControlActivity({ activityId, session, callbacks, closeModal, vinculations }: ControlActivityProps) {
	const queryClient = useQueryClient();
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const { data: activity, isLoading: isLoadingActivity, isError: isErrorActivity, isSuccess: isSuccessActivity, error: errorActivity } = useActivityById({ id: activityId });
	const reset = useActivityStore((s) => s.reset);
	const redefineActivity = useActivityStore((s) => s.redefineActivity);
	const getActivity = useActivityStore((s) => s.getActivity);

	const { mutate: handleUpdateActivity, isPending } = useMutation({
		mutationKey: ["update-activity", activityId],
		mutationFn: editActivity,
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ["activity-by-id", activityId] });
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
			queryClient.invalidateQueries({ queryKey: ["activity-by-id", activityId] });
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
	}, []);
	useEffect(() => {
		if (activity) {
			redefineActivity(activity);
		}
	}, [activity]);

	const MENU_TITLE = "ATUALIZAR ATIVIDADE";
	const MENU_DESCRIPTION = "Preencha os campos abaixo para atualizar a atividade.";
	const BUTTON_TEXT = "ATUALIZAR ATIVIDADE";
	return isDesktop ? (
		<Dialog open onOpenChange={(v) => (!v ? closeModal() : null)}>
			<DialogContent className="flex flex-col h-fit min-h-[60vh] max-h-[70vh] dark:bg-white">
				<DialogHeader>
					<DialogTitle>{MENU_TITLE}</DialogTitle>
					<DialogDescription>{MENU_DESCRIPTION}</DialogDescription>
				</DialogHeader>
				{isLoadingActivity ? <LoadingComponent /> : null}
				{isErrorActivity ? <ErrorComponent msg={getErrorMessage(errorActivity)} /> : null}
				{isSuccessActivity ? (
					<>
						<div className="flex-1 overflow-auto">
							<ControlActivityContent session={session} vinculations={vinculations} />
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">FECHAR</Button>
							</DialogClose>
							<LoadingButton
								onClick={() =>
									handleUpdateActivity({
										id: activityId,
										changes: getActivity(),
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
				{isLoadingActivity ? <LoadingComponent /> : null}
				{isErrorActivity ? <ErrorComponent msg={getErrorMessage(errorActivity)} /> : null}
				{isSuccessActivity ? (
					<>
						<div className="flex-1 overflow-auto">
							<ControlActivityContent session={session} vinculations={vinculations} />
						</div>
						<DrawerFooter>
							<DrawerClose asChild>
								<Button variant="outline">FECHAR</Button>
							</DrawerClose>
							<LoadingButton
								onClick={() =>
									handleUpdateActivity({
										id: activityId,
										changes: getActivity(),
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

export default ControlActivity;

type ControlActivityContentProps = {
	session: TUserSession;
	vinculations: TActivityVinculations;
};
function ControlActivityContent({ session, vinculations }: ControlActivityContentProps) {
	return (
		<div className="flex h-full w-full flex-col gap-6 px-4 lg:px-0">
			<ActivityGeneralBlock />
			<ActivityVinculationsBlock vinculations={vinculations} />
			<ActivityResponsiblesBlock />
		</div>
	);
}
