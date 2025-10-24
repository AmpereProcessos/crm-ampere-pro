import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { updateGoal } from "@/utils/mutations/goals";
import { useGoalById } from "@/utils/queries/goals";
import { useGoalStore, useGoalStoreWithSync } from "@/utils/stores/goal-store";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { GoalGeneralBlock } from "./blocks/General";
import GoalUsersBlock from "./blocks/Users";
import GoalValuesBlock from "./blocks/Values";

type EditGoalProps = {
	goalId: string;
	session: TUserSession;
	closeMenu: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
	};
};
function EditGoal({ goalId, closeMenu, callbacks, session }: EditGoalProps) {
	return <EditGoalContent callbacks={callbacks} closeMenu={closeMenu} goalId={goalId} session={session} />;
}
export default EditGoal;

type EditGoalContentProps = {
	goalId: string;
	session: TUserSession;
	closeMenu: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
	};
};
function EditGoalContent({ goalId, session, closeMenu, callbacks }: EditGoalContentProps) {
	const { data: fetchedGoal, isLoading: isLoadingGoal, isError: isErrorGoal, isSuccess: isSuccessGoal, error: errorGoal } = useGoalById({ id: goalId });

	const getGoal = useGoalStoreWithSync(fetchedGoal)((s) => s.getGoal);
	const reset = useGoalStoreWithSync(fetchedGoal)((s) => s.reset);
	const { mutate: updateGoalMutation, isPending } = useMutation({
		mutationFn: updateGoal,
		mutationKey: ["edit-goal"],
		onError(error) {
			const msg = getErrorMessage(error);
			return toast.error(msg);
		},
		onMutate: async () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
		onSuccess(data) {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			reset();
			toast.success(data);
			closeMenu();
			return;
		},
	});

	return (
		<ResponsiveDialogDrawer
			actionFunction={() => {
				updateGoalMutation({
					changes: getGoal(),
					id: goalId,
				});
			}}
			actionIsLoading={isPending}
			closeMenu={closeMenu}
			dialogContentClassName="min-w-[50%]"
			menuActionButtonText="CRIAR META"
			menuCancelButtonText="CANCELAR"
			menuDescription="Preencha os campos abaixo para criar uma nova meta."
			menuTitle="NOVA DE META"
			stateIsLoading={isLoadingGoal}
		>
			{isLoadingGoal ? <LoadingComponent /> : null}
			{isErrorGoal ? <ErrorComponent msg={getErrorMessage(errorGoal)} /> : null}
			{isSuccessGoal ? (
				<>
					<GoalGeneralBlock />
					<GoalValuesBlock />
					<GoalUsersBlock />
				</>
			) : null}
		</ResponsiveDialogDrawer>
	);
}
