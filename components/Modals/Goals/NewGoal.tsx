import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import toast from "react-hot-toast";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { createGoal } from "@/utils/mutations/goals";
import { useGoalStore, useGoalStoreWithSync } from "@/utils/stores/goal-store";
import { GoalGeneralBlock } from "./blocks/General";
import GoalUsersBlock from "./blocks/Users";
import GoalValuesBlock from "./blocks/Values";

type NewGoalProps = {
	session: TUserSession;
	closeMenu: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
	};
};
function NewGoal({ closeMenu, callbacks, session }: NewGoalProps) {
	return <NewGoalContent callbacks={callbacks} closeMenu={closeMenu} session={session} />;
}

export default NewGoal;

type NewGoalContentProps = {
	session: TUserSession;
	closeMenu: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
	};
};
function NewGoalContent({ session, closeMenu, callbacks }: NewGoalContentProps) {
	const reset = useGoalStoreWithSync(null)((s) => s.reset);
	const getGoal = useGoalStoreWithSync(null)((s) => s.getGoal);
	const { mutate: createGoalMutation, isPending } = useMutation({
		mutationFn: createGoal,
		mutationKey: ["create-goal"],
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
	useEffect(() => {
		reset();
		// Cleanup function to reset the store when the component unmounts
		return () => {
			reset();
		};
	}, [reset]);
	return (
		<ResponsiveDialogDrawer
			actionFunction={() => {
				createGoalMutation({
					goal: getGoal(),
				});
			}}
			actionIsPending={isPending}
			closeMenu={closeMenu}
			dialogContentClassName="min-w-[50%]"
			menuActionButtonText="CRIAR META"
			menuCancelButtonText="CANCELAR"
			menuDescription="Preencha os campos abaixo para criar uma nova meta."
			menuTitle="NOVA DE META"
			stateIsLoading={false}
		>
			<GoalGeneralBlock />
			<GoalValuesBlock />
			<GoalUsersBlock />
		</ResponsiveDialogDrawer>
	);
}
