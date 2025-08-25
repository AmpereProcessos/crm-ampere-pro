import { THomologationDTO } from '@/utils/schemas/homologation.schema';
import React, { useState } from 'react';

import DateTimeInput from '@/components/Inputs/DateTimeInput';
import TextInput from '@/components/Inputs/TextInput';
import Avatar from '@/components/utils/Avatar';
import type { TUserSession } from '@/lib/auth/session';
import { formatDateAsLocale, formatDateForInputValue, formatDateOnInputChange } from '@/lib/methods/formatting';
import toast from 'react-hot-toast';
import { BsCalendarPlus } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';

type UpdatesInformationProps = {
  session: TUserSession;
  infoHolder: THomologationDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<THomologationDTO>>;
};
function UpdatesInformation({ session, infoHolder, setInfoHolder }: UpdatesInformationProps) {
  const [updateHolder, setUpdateHolder] = useState<THomologationDTO['atualizacoes'][number]>({
    data: new Date().toISOString(),
    descricao: '',
    autor: {
      id: session.user.id,
      nome: session.user.nome,
      avatar_url: session.user.avatar_url,
    },
  });

  function addUpdate(info: THomologationDTO['atualizacoes'][number]) {
    if (!updateHolder.data) return toast.error('Preencha uma data válida.');
    if (updateHolder.descricao.trim().length < 3) return toast.error('Preencha uma descrição de ao menos 3 caractéres...');
    const updates = [...infoHolder.atualizacoes];
    updates.push(info);

    return setInfoHolder((prev) => ({ ...prev, atualizacoes: updates }));
  }
  function removeUpdate(index: number) {
    const updates = [...infoHolder.atualizacoes];
    updates.splice(index, 1);

    return setInfoHolder((prev) => ({ ...prev, atualizacoes: updates }));
  }
  return (
    <div className='flex w-full flex-col gap-2'>
      <h1 className='w-full rounded-sm bg-cyan-800 p-1 text-center font-bold text-primary-foreground'>ATUALIZAÇÕES</h1>
      <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
        <div className='w-full lg:w-1/2'>
          <TextInput
            label='DESCRIÇÃO DA ATUALIZAÇÃO'
            placeholder='Preencha a descrição da atualização...'
            value={updateHolder.descricao}
            handleChange={(value) => setUpdateHolder((prev) => ({ ...prev, descricao: value }))}
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/2'>
          <DateTimeInput
            label='DATA DA ATUALIZAÇÃO'
            value={formatDateForInputValue(updateHolder.data, 'datetime')}
            handleChange={(value) => {
              console.log(value);
              setUpdateHolder((prev) => ({ ...prev, data: formatDateOnInputChange(value) || new Date().toISOString() }));
            }}
            width='100%'
          />
        </div>
      </div>
      <div className='flex items-center justify-end'>
        <button
          className='rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70'
          onClick={() => addUpdate(updateHolder)}
        >
          ADICIONAR ATUALIZAÇÃO
        </button>
      </div>

      <div className='mt-2 flex w-full flex-col gap-1'>
        <h1 className='mb-2 text-start font-Inter font-bold leading-none tracking-tight'>ATUALIZAÇÕES DA HOMOLOGAÇÃO</h1>
        {infoHolder.atualizacoes.length > 0 ? (
          infoHolder.atualizacoes.map((update, index) => (
            <div key={index} className='flex w-full flex-col gap-1 rounded-md border border-primary/50 p-3'>
              <div className='flex w-full items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <BsCalendarPlus />
                    <h1 className='cursor-pointer text-xs font-black leading-none tracking-tight'>{formatDateAsLocale(update.data, true)}</h1>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Avatar fallback={'R'} url={update.autor.avatar_url || undefined} height={20} width={20} />
                    <p className='text-xs font-medium text-primary/70'>{update.autor.nome}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeUpdate(index)}
                  type='button'
                  className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
                >
                  <MdDelete style={{ color: 'red' }} size={15} />
                </button>
              </div>
              <div className='flex w-full items-center justify-center rounded-md bg-primary/10 p-2 text-center text-xs font-medium text-primary/70'>
                {update.descricao}
              </div>
            </div>
          ))
        ) : (
          <p className='flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70'>
            Sem atualizações adicionadas.
          </p>
        )}
      </div>
    </div>
  );
}

export default UpdatesInformation;
