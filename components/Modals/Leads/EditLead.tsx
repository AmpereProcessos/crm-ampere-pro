import ResponsiveDialogDrawer from '@/components/utils/ResponsiveDialogDrawer';
import { TUserSession } from '@/lib/auth/session';
import { DEFAULT_LEAD_QUALIFICATION_ATTRIBUTES } from '@/lib/leads';
import { updateLead } from '@/utils/mutations/leads';
import { useLeadById } from '@/utils/queries/leads';
import { TLead } from '@/utils/schemas/leads.schema';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GeneralBlock, QualificationBlock } from './LeadContent';

type EditLeadProps = {
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

export default function EditLead({ leadId, closeModal, callbacks, sessionUser }: EditLeadProps) {
  const { data: lead, isLoading, isError, isSuccess } = useLeadById({ id: leadId });
  const initialInfoHolder: TLead = {
    nome: '',
    telefone: '',
    canalAquisicao: 'PROSPECÇÃO ATIVA',
    qualificacao: {
      score: 0,
      atributos: DEFAULT_LEAD_QUALIFICATION_ATTRIBUTES.map((attribute) => ({
        nome: attribute.name,
        identificador: attribute.identifier,
        valor: '',
        peso: attribute.weight,
      })),
      responsavel: {
        id: sessionUser.user.id,
        nome: sessionUser.user.nome,
        avatar_url: sessionUser.user.avatar_url,
      },
    },
    dataInsercao: new Date().toISOString(),
  };
  const [infoHolder, setInfoHolder] = useState<TLead>(initialInfoHolder);

  function updateInfoHolder(newInfo: Partial<TLead>) {
    setInfoHolder((prev) => ({ ...prev, ...newInfo }));
  }
  const { mutate: handleUpdateLeadMutation, isPending } = useMutation({
    mutationFn: updateLead,
    mutationKey: ['update-lead', leadId],
    onMutate: async () => {
      if (callbacks?.onMutate) callbacks.onMutate();
    },
    onSuccess: async (data) => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
      setInfoHolder(initialInfoHolder);
      return toast.success(data.message);
    },
    onSettled: async () => {
      if (callbacks?.onSettled) callbacks.onSettled();
    },
    onError: async (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
  useEffect(() => {
    if (isSuccess) setInfoHolder(lead);
  }, [isSuccess, lead]);
  return (
    <ResponsiveDialogDrawer
      menuTitle='ATUAI LEAD'
      menuDescription='Preencha os campos abaixo para editar um lead.'
      menuActionButtonText='ATUALIZAR LEAD'
      menuCancelButtonText='CANCELAR'
      closeMenu={closeModal}
      actionFunction={() => handleUpdateLeadMutation({ id: leadId, lead: infoHolder })}
      actionIsPending={isPending}
      stateIsLoading={isLoading}
    >
      <QualificationBlock infoHolder={infoHolder} updateInfoHolder={updateInfoHolder} />
      <GeneralBlock infoHolder={infoHolder} updateInfoHolder={updateInfoHolder} />
    </ResponsiveDialogDrawer>
  );
}
