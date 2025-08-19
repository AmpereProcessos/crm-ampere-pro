import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { updateGoal } from "@/utils/mutations/goals";
import { GoalProvider, useGoalStore } from "@/utils/stores/goal-store";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { GoalGeneralBlock } from "./blocks/General";
import GoalValuesBlock from "./blocks/Values";
import GoalUsersBlock from "./blocks/Users";
import { useGoalById } from "@/utils/queries/goals";



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
  const { data: goal, isLoading: isLoadingGoal, isError: isErrorGoal, isSuccess: isSuccessGoal, error: errorGoal } = useGoalById({id: goalId});
  return (
    <GoalProvider>
    <EditGoalContent goalId={goalId} callbacks={callbacks} closeMenu={closeMenu} session={session} />
    </GoalProvider>
  );
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
  const reset = useGoalStore((s) => s.reset);
  const getGoal = useGoalStore((s) => s.getGoal);
  const { mutate: updateGoalMutation, isPending } = useMutation({
    mutationKey: ['edit-goal'],
    mutationFn: updateGoal,
    onMutate: async () => {
      if (callbacks?.onMutate) callbacks.onMutate();
    },
    onSuccess(data, variables, context) {
      if (callbacks?.onSuccess) callbacks.onSuccess();
      reset();
      toast.success(data);
      closeMenu();
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
  return (
    <ResponsiveDialogDrawer
      actionFunction={() => {
        updateGoalMutation({
            changes: getGoal(),
            id: goalId,
        });
      }}
      actionIsPending={isPending}
      closeMenu={closeMenu}
      dialogContentClassName="min-w-[50%]"
      menuActionButtonText="CRIAR META"
      menuCancelButtonText="CANCELAR"
      menuDescription="Preencha os campos abaixo para criar uma nova meta."
      menuTitle="NOVA DE META"
    >
      <GoalGeneralBlock />
      <GoalValuesBlock />
      <GoalUsersBlock />
    </ResponsiveDialogDrawer>
  );
}
