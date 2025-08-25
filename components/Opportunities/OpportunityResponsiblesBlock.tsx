import type { TUserSession } from '@/lib/auth/session';
import { formatDateAsLocale, formatNameAsInitials } from '@/lib/methods/formatting';
import { useOpportunityCreators } from '@/utils/queries/users';
import type { TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from '@/utils/schemas/opportunity.schema';
import { OpportunityResponsibilityRoles } from '@/utils/select-options';
import { useQueryClient } from '@tanstack/react-query';
import { useState, type Dispatch, type SetStateAction } from 'react';
import toast from 'react-hot-toast';
import { AiOutlineCheck } from 'react-icons/ai';
import { MdDelete } from 'react-icons/md';
import SelectInput from '../Inputs/SelectInput';
import SelectWithImages from '../Inputs/SelectWithImages';
import Avatar from '../utils/Avatar';

import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { addResponsibleToOpportunity, removeResponsibleFromOpportunity } from '@/utils/mutations/opportunities';
import { BsCalendarPlus } from 'react-icons/bs';
type OpportunityResponsiblesBlockProps = {
  opportunityId: string;
  infoHolder: TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
  setInfoHolder: Dispatch<SetStateAction<TOpportunityDTOWithClientAndPartnerAndFunnelReferences>>;
  handleUpdateOpportunity: any;
  session: TUserSession;
};
function OpportunityResponsiblesBlock({
  opportunityId,
  infoHolder,
  setInfoHolder,
  handleUpdateOpportunity,
  session,
}: OpportunityResponsiblesBlockProps) {
  const queryClient = useQueryClient();
  const { data: opportunityCreators } = useOpportunityCreators();
  const [newResponsibleMenuIsOpen, setNewResponsibleMenuIsOpen] = useState<boolean>(false);
  const [newOpportunityResponsible, setNewOpportunityResponsible] = useState<{
    nome: string | null;
    id: string | null;
    papel: string | null;
    avatar_url?: string | null;
  }>({
    nome: session.user.nome,
    id: session.user.id,
    papel: null,
    avatar_url: session.user.avatar_url,
  });

  const { mutate: handleResponsibleRemoval, isPending: isRemovingResponsible } = useMutationWithFeedback({
    mutationKey: ['remove-responsible-from-opportunity'],
    mutationFn: removeResponsibleFromOpportunity,
    affectedQueryKey: ['opportunity-by-id', opportunityId],
    queryClient: queryClient,
  });

  const { mutate: handleAddResponsibleToOpportunity, isPending: isAddingResponsible } = useMutationWithFeedback({
    mutationKey: ['add-responsible-to-opportunity'],
    mutationFn: addResponsibleToOpportunity,
    affectedQueryKey: ['opportunity-by-id', opportunityId],
    queryClient: queryClient,
  });

  return (
    <div className=' flex w-full flex-col gap-2'>
      <h1 className='w-full rounded-md bg-[#fead41] p-1 text-center text-sm font-medium text-primary-foreground'>RESPONSÁVEIS DA OPORTUNIDADE</h1>
      <div className='flex flex-col gap-2'>
        {infoHolder.responsaveis.map((resp, index) => (
          <div key={resp.id} className='flex w-full flex-col rounded-md border border-primary/30 p-3'>
            <div className='flex w-full items-center gap-2'>
              <div className='flex items-center gap-2'>
                <Avatar url={resp.avatar_url || undefined} height={20} width={20} fallback={formatNameAsInitials(resp.nome)} />
                <h1 className='font-sans font-bold  text-primary'>{resp.nome}</h1>
              </div>
              <div className='flex grow items-center justify-end gap-2'>
                <button
                  disabled={isRemovingResponsible}
                  type='button'
                  onClick={() => handleResponsibleRemoval({ opportunityId, responsibleId: resp.id })}
                  className='flex items-center justify-center gap-2 rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
                >
                  <MdDelete style={{ color: 'red' }} size={15} />
                </button>
                <button
                  type='button'
                  // disabled={infoHolder.responsaveis[index].papel == info.responsaveis[index].papel}
                  onClick={() =>
                    // @ts-ignore
                    handleUpdateOpportunity({
                      id: infoHolder._id,
                      changes: { [`responsaveis.${index}.papel`]: infoHolder.responsaveis[index].papel },
                    })
                  }
                  className='flex items-end justify-center  text-green-200'
                >
                  <AiOutlineCheck
                    style={{
                      fontSize: '18px',
                      // color: infoHolder.responsaveis[index].papel != info.responsaveis[index].papel ? 'rgb(34,197,94)' : 'rgb(156,163,175)',
                      color: 'rgb(34,197,94)',
                    }}
                  />
                </button>
              </div>
            </div>
            <div className='mt-1 flex grow'>
              <SelectInput
                label='PAPEL'
                showLabel={false}
                value={resp.papel}
                options={OpportunityResponsibilityRoles}
                handleChange={(value) => {
                  const respList = [...infoHolder.responsaveis];
                  respList[index].papel = value;
                  setInfoHolder((prev) => ({ ...prev, responsaveis: respList }));
                }}
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => console.log()}
                width='100%'
              />
            </div>
            <div className='mt-2 flex w-full items-center justify-end'>
              <div className={'flex items-center gap-1'}>
                <BsCalendarPlus />
                <p className='text-[0.65rem] font-medium text-primary/70'>{formatDateAsLocale(resp.dataInsercao, true)}</p>
              </div>
            </div>
          </div>
        ))}
        <div className='flex w-full items-center justify-end'>
          <button
            type='button'
            onClick={() => setNewResponsibleMenuIsOpen((prev) => !prev)}
            className={`${
              newResponsibleMenuIsOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } rounded  p-1 px-4 text-xs font-medium text-primary-foreground duration-300 ease-in-out `}
          >
            {newResponsibleMenuIsOpen ? 'FECHAR' : 'ADICIONAR RESPONSÁVEL'}
          </button>
        </div>
        {newResponsibleMenuIsOpen ? (
          <div className='flex w-full flex-col gap-2'>
            <div className='flex w-full gap-2'>
              <div className='w-2/3'>
                <SelectWithImages
                  label='USUÁRIO'
                  value={newOpportunityResponsible.id}
                  options={
                    opportunityCreators?.map((user) => ({
                      id: user._id.toString(),
                      label: user.nome,
                      value: user._id.toString(),
                      url: user.avatar_url || undefined,
                    })) || []
                  }
                  handleChange={(value) => {
                    const equivalentUser = opportunityCreators?.find((opCreator) => value === opCreator._id.toString());
                    setNewOpportunityResponsible((prev) => ({
                      ...prev,
                      id: equivalentUser?._id.toString() || '',
                      nome: equivalentUser?.nome || '',
                      avatar_url: equivalentUser?.avatar_url || null,
                    }));
                  }}
                  resetOptionLabel='NÃO DEFINIDO'
                  onReset={() =>
                    setNewOpportunityResponsible({
                      nome: '',
                      id: '',
                      papel: '',
                      avatar_url: null,
                    })
                  }
                  width='100%'
                />
              </div>
              <div className='w-1/3'>
                <SelectInput
                  label='PAPEL'
                  value={newOpportunityResponsible.papel}
                  options={OpportunityResponsibilityRoles}
                  handleChange={(value) => setNewOpportunityResponsible((prev) => ({ ...prev, papel: value }))}
                  resetOptionLabel='NÃO DEFINIDO'
                  onReset={() => setNewOpportunityResponsible((prev) => ({ ...prev, papel: null }))}
                  width='100%'
                />
              </div>
            </div>
            <div className='flex w-full items-center justify-end'>
              <button
                type='button'
                disabled={isAddingResponsible}
                onClick={() => {
                  if (!newOpportunityResponsible.id || !newOpportunityResponsible.papel)
                    return toast.error('Preencha todos os campos para adicionar um responsável.');
                  handleAddResponsibleToOpportunity({
                    opportunityId,
                    responsibleId: newOpportunityResponsible.id,
                    responsibleRole: newOpportunityResponsible.papel as 'VENDEDOR' | 'SDR' | 'ANALISTA TÉCNICO',
                  });
                }}
                className={
                  'rounded-sm bg-green-500 p-1  px-4 text-xs font-medium text-primary-foreground duration-300 ease-in-out hover:bg-green-600'
                }
              >
                ADICIONAR
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default OpportunityResponsiblesBlock;
