import { TUpgrateLeadInput } from '@/app/api/leads/upgrade/route';
import SelectInput from '@/components/Inputs/SelectInput';
import SelectWithImages from '@/components/Inputs/SelectWithImages';
import ResponsiveDialogDrawer from '@/components/utils/ResponsiveDialogDrawer';
import { TUserSession } from '@/lib/auth/session';
import { getErrorMessage } from '@/lib/methods/errors';
import { upgradeLead } from '@/utils/mutations/leads';
import { useFunnels } from '@/utils/queries/funnels';
import { useLeadById } from '@/utils/queries/leads';
import { useProjectTypes } from '@/utils/queries/project-types';
import { useOpportunityCreators } from '@/utils/queries/users';
import { useMutation } from '@tanstack/react-query';
import { CircleFadingArrowUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

type UpgrateLeadProps = {
  leadId: string;
  sessionUser: TUserSession;
  closeModal: () => void;
  callbacks?: {
    onMutate?: () => void;
    onSuccess?: () => void;
    onSettled?: () => void;
    onError?: (error: Error) => void;
  };
};
export default function UpgrateLead({ leadId, sessionUser, closeModal, callbacks }: UpgrateLeadProps) {
  const { data: lead, isLoading, isError, isSuccess } = useLeadById({ id: leadId });
  const [infoHolder, setInfoHolder] = useState<TUpgrateLeadInput>({
    leadId,
    atribuidoId: '',
    tipoProjetoId: '',
    funilId: '',
    estagioFunilId: '',
    anotacoes: [],
  });

  function updateInfoHolder(newInfo: Partial<TUpgrateLeadInput>) {
    setInfoHolder((prev) => ({ ...prev, ...newInfo }));
  }
  const { mutate: handleUpgrateLeadMutation, isPending } = useMutation({
    mutationFn: upgradeLead,
    mutationKey: ['upgrate-lead'],
    onMutate: async () => {
      if (callbacks?.onMutate) callbacks.onMutate();
    },
    onSuccess: async (data) => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
      toast.success(data.message);
      return closeModal();
    },
    onSettled: async () => {
      if (callbacks?.onSettled) callbacks.onSettled();
    },
    onError: async (error) => {
      if (callbacks?.onError) callbacks.onError(error);
      return toast.error(getErrorMessage(error));
    },
  });

  return (
    <ResponsiveDialogDrawer
      menuTitle='NOVO LEAD'
      menuDescription='Preencha os campos abaixo para criar um novo lead.'
      menuActionButtonText='CRIAR LEAD'
      menuCancelButtonText='CANCELAR'
      closeMenu={closeModal}
      actionFunction={() => handleUpgrateLeadMutation(infoHolder)}
      actionIsPending={isPending}
      stateIsLoading={false}
    >
      <UpgrateLeadContent infoHolder={infoHolder} updateInfoHolder={updateInfoHolder} />
    </ResponsiveDialogDrawer>
  );
}

type UpgrateLeadContentProps = {
  infoHolder: TUpgrateLeadInput;
  updateInfoHolder: (newInfo: Partial<TUpgrateLeadInput>) => void;
};
function UpgrateLeadContent({ infoHolder, updateInfoHolder }: UpgrateLeadContentProps) {
  const { data: projectTypes } = useProjectTypes();
  const { data: users } = useOpportunityCreators();
  const { data: funnels } = useFunnels();
  return (
    <div className='flex w-full flex-col gap-2'>
      <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
        <CircleFadingArrowUp size={15} />
        <h1 className='text-xs tracking-tight font-medium text-start w-fit'>ATUALIZAR LEAD PARA OPORTUNIDADE</h1>
      </div>
      <SelectWithImages
        label='USUÁRIO PARA ATRIBUIÇÃO'
        value={infoHolder.atribuidoId}
        resetOptionLabel='NÃO DEFINIDO'
        options={
          users?.map((user) => ({
            id: user._id,
            value: user._id,
            label: user.nome,
            url: user.avatar_url || undefined,
          })) ?? []
        }
        handleChange={(value) => updateInfoHolder({ atribuidoId: value })}
        onReset={() => updateInfoHolder({ atribuidoId: '' })}
        width='100%'
      />
      <SelectInput
        label='TIPO DE PROJETO'
        value={infoHolder.tipoProjetoId}
        resetOptionLabel='NÃO DEFINIDO'
        options={
          projectTypes?.map((projectType) => ({
            id: projectType._id,
            value: projectType._id,
            label: projectType.nome,
          })) ?? []
        }
        handleChange={(value) => updateInfoHolder({ tipoProjetoId: value })}
        onReset={() => updateInfoHolder({ tipoProjetoId: '' })}
        width='100%'
      />

      <SelectInput
        label='FUNIL'
        value={infoHolder.funilId}
        resetOptionLabel='NÃO DEFINIDO'
        options={
          funnels?.map((funnel) => ({
            id: funnel._id,
            value: funnel._id,
            label: funnel.nome,
          })) ?? []
        }
        handleChange={(value) => updateInfoHolder({ funilId: value })}
        onReset={() => updateInfoHolder({ funilId: '' })}
        width='100%'
      />
      <SelectInput
        label='ESTÁGIO DO FUNIL'
        value={infoHolder.estagioFunilId}
        resetOptionLabel='NÃO DEFINIDO'
        options={
          funnels
            ?.find((funnel) => funnel._id === infoHolder.funilId)
            ?.etapas?.map((stage) => ({
              id: stage.id.toString(),
              value: stage.id.toString(),
              label: stage.nome,
            })) ?? []
        }
        handleChange={(value) => updateInfoHolder({ estagioFunilId: value })}
        onReset={() => updateInfoHolder({ estagioFunilId: '' })}
        width='100%'
      />
    </div>
  );
}
