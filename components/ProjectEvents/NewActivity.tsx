import { projectActivityTypes } from '@/utils/constants';
import dayjs from 'dayjs';
import React from 'react';
import SelectInput from '../Inputs/SelectInput';
import SelectWithImages from '../Inputs/SelectWithImages';
import TextInput from '../Inputs/TextInput';

import type { TUserSession } from '@/lib/auth/session';
import { useOpportunityCreators } from '@/utils/queries/users';
import type { TActivity } from '@/utils/schemas/activities.schema';
import { UseMutateFunction, useQueryClient } from '@tanstack/react-query';
type NewActivityProps = {
  session: TUserSession;
  opportunityId: string;
  newEvent: TActivity;
  setNewEvent: React.Dispatch<React.SetStateAction<TActivity>>;
  setView: React.Dispatch<React.SetStateAction<'HISTORY' | 'NEW NOTE' | 'NEW ACTIVITY'>>;
  opportunityName: string;
  opportunityIdentifier: string;
  handleCreate: UseMutateFunction<
    unknown,
    Error,
    void,
    {
      loadingToast: string;
    }
  >;
};
function NewActivity({
  session,
  newEvent,
  setNewEvent,
  setView,
  opportunityId,
  opportunityName,
  opportunityIdentifier,
  handleCreate,
}: NewActivityProps) {
  const queryClient = useQueryClient();
  const initialResponsible = {
    id: session?.user.id || '',
    nome: session?.user.nome || '',
    avatar_url: session?.user.avatar_url || null,
  };
  const { data: responsibles } = useOpportunityCreators();

  return (
    <div className='flex w-full flex-col gap-2'>
      <div className='flex w-full grow flex-col gap-2'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-[50%]'>
            <TextInput
              label='TÍTULO DA ATIVIDADE'
              placeholder='Preencha o título da atividade.'
              value={newEvent.titulo}
              handleChange={(value) => setNewEvent((prev) => ({ ...prev, titulo: value }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[50%]'>
            <SelectWithImages
              label='RESPONSÁVEL'
              // editable={session?.user.permissoes.projetos.editar}
              options={
                responsibles?.map((resp) => ({ id: resp._id, label: resp.nome, value: resp, url: resp.avatar_url || undefined, fallback: 'R' })) || []
              }
              value={newEvent.responsavel.id}
              handleChange={(value) =>
                setNewEvent((prev) => ({ ...prev, responsavel: { id: value._id || '', nome: value.nome, avatar_url: value.avatar_url || null } }))
              }
              onReset={() => setNewEvent((prev) => ({ ...prev, responsavel: initialResponsible }))}
              resetOptionLabel='NÃO DEFINIDO'
              width='100%'
            />
          </div>
        </div>
        <div className='mt-2 flex flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-[50%]'>
            <SelectInput
              label='TIPO'
              value={newEvent.tipo}
              options={Object.entries(projectActivityTypes).map(([key, activity], index) => ({
                id: index + 1,
                label: activity.label,
                value: activity.value,
              }))}
              handleChange={(value) => setNewEvent((prev) => ({ ...prev, tipo: value }))}
              onReset={() => setNewEvent((prev) => ({ ...prev, tipo: 'LIGAÇÃO' }))}
              resetOptionLabel='RESETAR'
              width='100%'
            />
          </div>
          <div className='flex w-full flex-col gap-1 lg:w-[50%]'>
            <label htmlFor={'DATAVENCIMENTO'} className='font-sans font-bold  text-primary'>
              DATA DE VENCIMENTO
            </label>
            <input
              value={dayjs(newEvent.dataVencimento).isValid() ? dayjs(newEvent.dataVencimento).format('YYYY-MM-DDTHH:mm') : undefined}
              onChange={(e) => {
                // @ts-ignore
                setNewEvent((prev) => ({
                  ...prev,
                  dataVencimento: e.target.value != '' ? new Date(e.target.value).toISOString() : undefined,
                }));
              }}
              id={'DATAVENCIMENTO'}
              onReset={() =>
                // @ts-ignore
                setNewEvent((prev) => ({
                  ...prev,
                  dataVencimento: undefined,
                }))
              }
              type='datetime-local'
              className='w-full rounded-md border border-primary/30 p-3 text-sm outline-hidden placeholder:italic'
            />
          </div>
        </div>
        <textarea
          value={newEvent.observacoes}
          onChange={(e) =>
            setNewEvent((prev) => ({
              ...prev,
              observacoes: e.target.value,
            }))
          }
          placeholder='Observações sobre a atividade...'
          className='h-[80px] resize-none border border-primary/30 bg-primary/10 p-2 text-center outline-hidden'
        />
      </div>
      <div className='flex w-full items-center justify-end gap-3 border-t border-primary/30 p-1'>
        <button onClick={() => setView('HISTORY')} className='text-primary/50 duration-300 ease-in-out disabled:opacity-50 hover:scale-105'>
          FECHAR
        </button>
        <button onClick={() => handleCreate()} className='font-bold text-[#15599a] duration-300 ease-in-out hover:scale-105'>
          CRIAR
        </button>
      </div>
    </div>
  );
}

export default NewActivity;
