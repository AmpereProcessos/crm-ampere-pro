import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import ResponsiveDialogDrawer from '@/components/utils/ResponsiveDialogDrawer';
import type { TUserSession } from '@/lib/auth/session';
import { getErrorMessage } from '@/lib/methods/errors';
import { createGoal } from '@/utils/mutations/goals';
import { GoalProvider, useGoalStore } from '@/utils/stores/goal-store';
import { GoalGeneralBlock } from './blocks/General';
import GoalUsersBlock from './blocks/Users';
import GoalValuesBlock from './blocks/Values';

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
  return (
    <GoalProvider>
      <NewGoalContent callbacks={callbacks} closeMenu={closeMenu} session={session} />
    </GoalProvider>
  );
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
  const reset = useGoalStore((s) => s.reset);
  const getGoal = useGoalStore((s) => s.getGoal);
  const { mutate: createGoalMutation, isPending } = useMutation({
    mutationKey: ['create-goal'],
    mutationFn: createGoal,
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
    >
      <GoalGeneralBlock />
      <GoalValuesBlock />
      <GoalUsersBlock />
    </ResponsiveDialogDrawer>
  );
}
