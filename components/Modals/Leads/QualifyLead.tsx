import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import ResponsiveDialogDrawer from '@/components/utils/ResponsiveDialogDrawer';
import { DEFAULT_LEAD_QUALIFICATION_ATTRIBUTES } from '@/lib/leads';
import { renderIconWithClassNames } from '@/lib/methods/rendering';
import { cn } from '@/lib/utils';
import { updateLead } from '@/utils/mutations/leads';
import { useLeadById } from '@/utils/queries/leads';
import { TLead } from '@/utils/schemas/leads.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const computeLeadScore = (attributes: TLead['qualificacao']['atributos']): number => {
  let totalScore = 0;
  for (const config of DEFAULT_LEAD_QUALIFICATION_ATTRIBUTES) {
    const selectedAttribute = attributes.find((a) => a.identificador === config.identifier);
    if (!selectedAttribute) continue;
    let weightMultipler = 0;
    if (config.inputType === 'select') {
      const selectedOption = config.inputOptions.find((opt) => opt.value === selectedAttribute.valor);
      weightMultipler = selectedOption ? selectedOption.weightMultipler : 0;
    } else if (config.inputType === 'text') {
      weightMultipler = selectedAttribute.valor.trim() ? 1 : 0;
    }
    totalScore += config.weight * weightMultipler;
  }
  const clamped = Math.max(0, Math.min(10, totalScore));
  return Number(clamped.toFixed(2));
};

const upsertQualificationAttribute = (
  prevAttributes: TLead['qualificacao']['atributos'],
  params: { identifier: string; name: string; weight: number; value: string }
): TLead['qualificacao']['atributos'] => {
  const { identifier, name, weight, value } = params;
  const exists = prevAttributes.some((a) => a.identificador === identifier);
  if (exists) {
    return prevAttributes.map((attr) => (attr.identificador === identifier ? { ...attr, valor: value, nome: name, peso: weight } : attr));
  }
  return [...prevAttributes, { identificador: identifier, nome: name, valor: value, peso: weight }];
};

type QualifyLeadProps = {
  leadId: string;
  closeModal: () => void;
  callbacks?: {
    onMutate?: () => void;
    onSuccess?: () => void;
    onSettled?: () => void;
    onError?: (error: Error) => void;
  };
};
export default function QualifyLead({ leadId, closeModal, callbacks }: QualifyLeadProps) {
  const queryClient = useQueryClient();
  const [infoHolder, setInfoHolder] = useState<TLead['qualificacao']>({
    score: 0,
    atributos: [],
    responsavel: null,
    data: null,
  });
  function updateInfoHolder(newInfo: Partial<TLead['qualificacao']>) {
    setInfoHolder((prev) => ({ ...prev, ...newInfo }));
  }
  const { data: lead, isLoading, isError, isSuccess, error, queryKey } = useLeadById({ id: leadId });

  const { mutate: handleCreateLeadMutation, isPending } = useMutation({
    mutationFn: updateLead,
    mutationKey: ['update-lead'],
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKey });
      if (callbacks?.onMutate) callbacks.onMutate();
    },
    onSuccess: async (data) => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
      return toast.success(data.message);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKey });
      if (callbacks?.onSettled) callbacks.onSettled();
    },
    onError: async (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
  useEffect(() => {
    if (isSuccess) setInfoHolder(lead.qualificacao);
  }, [isSuccess, lead]);

  useEffect(() => {
    setInfoHolder((prev) => {
      const nextScore = computeLeadScore(prev.atributos);
      if (prev.score === nextScore) return prev;
      return { ...prev, score: nextScore };
    });
  }, [infoHolder.atributos]);
  return (
    <ResponsiveDialogDrawer
      menuTitle='QUALIFICAÇÃO LEAD'
      menuDescription='Preencha algumas informações para qualificação do lead.'
      menuActionButtonText='QUALIFICAR LEAD'
      menuCancelButtonText='CANCELAR'
      closeMenu={closeModal}
      actionFunction={() => handleCreateLeadMutation({ id: leadId, lead: { qualificacao: { ...infoHolder, data: new Date().toISOString() } } })}
      actionIsPending={isPending}
      stateIsLoading={false}
    >
      <Qualification infoHolder={infoHolder} updateInfoHolder={updateInfoHolder} />
    </ResponsiveDialogDrawer>
  );
}

type QualificationProps = {
  infoHolder: TLead['qualificacao'];
  updateInfoHolder: (newInfo: Partial<TLead['qualificacao']>) => void;
};
function Qualification({ infoHolder, updateInfoHolder }: QualificationProps) {
  return (
    <div className='w-full h-full flex flex-col gap-6'>
      <h3
        className={cn('px-2 py-0.5 rounded-lg bg-primary/20 text-xs font-medium self-center', {
          'bg-green-200 text-green-700': infoHolder.score >= 7,
          'bg-yellow-200 text-yellow-700': infoHolder.score >= 4 && infoHolder.score < 7,
          'bg-red-200 text-red-700': infoHolder.score < 4,
        })}
      >
        NOTA {infoHolder.score}
      </h3>
      {DEFAULT_LEAD_QUALIFICATION_ATTRIBUTES.map((attribute) => (
        <div className='flex w-full flex-col gap-4 p-6 border border-primary/10 rounded-md bg-[#fff] dark:bg-[#121212] shadow-sm'>
          <div className='w-full flex flex-col gap-1'>
            <div className='w-full flex items-center gap-2'>
              {renderIconWithClassNames(attribute.icon)}
              <h1 className='text-sm font-bold leading-none tracking-tight'>{attribute.name}</h1>
            </div>
            <p className='text-xs font-light leading-none text-primary/80'>{attribute.call}</p>
          </div>
          {attribute.inputType === 'text' ? (
            <TextInput
              label={attribute.name}
              labelClassName='text-[0.6rem]'
              holderClassName='text-xs p-2 min-h-[34px]'
              placeholder={attribute.inputPlaceholder}
              value={infoHolder.atributos.find((a) => a.identificador === attribute.identifier)?.valor || ''}
              handleChange={(value) => {
                const newAttributes = upsertQualificationAttribute(infoHolder.atributos, {
                  identifier: attribute.identifier,
                  name: attribute.name,
                  weight: attribute.weight,
                  value,
                });
                updateInfoHolder({ atributos: newAttributes });
              }}
              width='100%'
            />
          ) : null}
          {attribute.inputType === 'select' ? (
            <SelectInput
              label={attribute.name}
              labelClassName='text-[0.6rem]'
              holderClassName='text-xs p-2 min-h-[34px]'
              value={infoHolder.atributos.find((a) => a.identificador === attribute.identifier)?.valor || ''}
              options={attribute.inputOptions}
              handleChange={(value) => {
                const newAttributes = upsertQualificationAttribute(infoHolder.atributos, {
                  identifier: attribute.identifier,
                  name: attribute.name,
                  weight: attribute.weight,
                  value,
                });
                updateInfoHolder({ atributos: newAttributes });
              }}
              onReset={() => {
                const newAttributes = upsertQualificationAttribute(infoHolder.atributos, {
                  identifier: attribute.identifier,
                  name: attribute.name,
                  weight: attribute.weight,
                  value: '',
                });
                updateInfoHolder({ atributos: newAttributes });
              }}
              resetOptionLabel='NÃO DEFINIDO'
              width='100%'
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
