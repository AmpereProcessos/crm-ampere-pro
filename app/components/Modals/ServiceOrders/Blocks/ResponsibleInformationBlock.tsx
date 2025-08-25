import CheckboxInput from '@/components/Inputs/CheckboxInput';
import SelectWithImages from '@/components/Inputs/SelectWithImages';
import TextInput from '@/components/Inputs/TextInput';
import Avatar from '@/components/utils/Avatar';
import { formatNameAsInitials } from '@/lib/methods/formatting';
import { useUsers } from '@/utils/queries/users';
import { TServiceOrder } from '@/utils/schemas/service-order.schema';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
const variants = {
  hidden: {
    opacity: 0.2,
    transition: {
      duration: 0.8, // Adjust the duration as needed
    },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8, // Adjust the duration as needed
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.01, // Adjust the duration as needed
    },
  },
};
type ResponsibleInformationBlockProps = {
  infoHolder: TServiceOrder;
  setInfoHolder: React.Dispatch<React.SetStateAction<TServiceOrder>>;
};
function ResponsibleInformationBlock({ infoHolder, setInfoHolder }: ResponsibleInformationBlockProps) {
  const { data: users } = useUsers();

  const [newResponsibleHolder, setNewResponsibleHolder] = useState<TServiceOrder['responsaveis'][number]>({
    id: '',
    nome: '',
    avatar_url: null,
    tipo: 'INTERNO',
  });

  function addResponsible(responsible: TServiceOrder['responsaveis'][number]) {
    const responsibles = [...infoHolder.responsaveis];
    responsibles.push(responsible);
    setInfoHolder((prev) => ({ ...prev, responsaveis: responsibles }));
    return toast.success('Responsável adicionado !', { position: 'bottom-center' });
  }
  function removeResponsible(index: number) {
    const responsibles = [...infoHolder.responsaveis];
    responsibles.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, responsaveis: responsibles }));
    return toast.success('Responsável removido !', { position: 'bottom-center' });
  }

  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-primary-foreground'>RESPONSÁVEIS</h1>
      <div className='flex w-full flex-col gap-1'>
        {infoHolder.responsaveis.length > 0 ? (
          <div className='flex w-full flex-col gap-1'>
            <h1 className='w-full text-center text-sm font-medium tracking-tight text-primary/70 lg:text-start'>
              Os responsáveis pela execução do serviço são:
            </h1>
            <div className='flex flex-wrap items-center justify-center gap-2 lg:gap-6'>
              {infoHolder.responsaveis.map((responsible, index) => (
                <div
                  onClick={() => removeResponsible(index)}
                  key={index}
                  className='flex cursor-pointer items-center gap-2 rounded-xl border border-primary/50 px-2 py-0.5 text-primary/80 hover:border-red-500 lg:p-2'
                >
                  <Avatar url={responsible.avatar_url || undefined} height={20} width={20} fallback={formatNameAsInitials(responsible.nome)} />
                  <p className='text-xs font-medium tracking-tight lg:text-sm'>{responsible.nome}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className='w-full text-center text-sm font-medium tracking-tight text-primary/70'>Nenhum responsável adicionado ao serviço.</p>
        )}

        <div className='flex w-full flex-col gap-1'>
          {newResponsibleHolder.tipo == 'INTERNO' ? (
            <SelectWithImages
              label={'RESPONSÁVEL'}
              editable={true}
              value={newResponsibleHolder.id}
              options={
                users?.map((resp) => ({
                  id: resp._id,
                  label: resp.nome,
                  value: resp._id,
                  url: resp.avatar_url || undefined,
                  fallback: formatNameAsInitials(resp.nome),
                })) || []
              }
              handleChange={(value) => {
                const responsible = users?.find((u) => u._id == value);
                setNewResponsibleHolder((prev) => ({
                  id: responsible?._id || '',
                  nome: responsible?.nome || '',
                  tipo: 'INTERNO',
                  avatar_url: responsible?.avatar_url,
                }));
              }}
              onReset={() =>
                setNewResponsibleHolder({
                  id: '',
                  nome: '',
                  tipo: 'INTERNO',
                  avatar_url: null,
                })
              }
              resetOptionLabel={'USUÁRIO NÃO DEFINIDO'}
              width='100%'
            />
          ) : (
            <TextInput
              label='NOME DO RESPONSÁVEL'
              placeholder='Preencha aqui o nome do responsável...'
              value={newResponsibleHolder.nome}
              handleChange={(value) => setNewResponsibleHolder((prev) => ({ ...prev, nome: value }))}
              width='100%'
            />
          )}
          <div className='flex flex-col items-center justify-end gap-4 lg:flex-row'>
            <div className='w-fit'>
              <CheckboxInput
                labelFalse='RESPONSÁVEL INTERNO'
                labelTrue='RESPONSÁVEL INTERNO'
                checked={newResponsibleHolder.tipo == 'INTERNO'}
                handleChange={(value) =>
                  setNewResponsibleHolder((prev) => ({ id: '', nome: '', tipo: value ? 'INTERNO' : 'EXTERNO', avatar_url: null }))
                }
              />
            </div>
            <button
              className='rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70'
              onClick={() => addResponsible(newResponsibleHolder)}
            >
              ADICIONAR RESPONSÁVEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResponsibleInformationBlock;
