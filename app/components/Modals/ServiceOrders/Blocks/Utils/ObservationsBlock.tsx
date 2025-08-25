import TextInput from '@/components/Inputs/TextInput';
import { TServiceOrder } from '@/utils/schemas/service-order.schema';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { MdDelete } from 'react-icons/md';

type ObservationsBlockProps = {
  infoHolder: TServiceOrder;
  setInfoHolder: React.Dispatch<React.SetStateAction<TServiceOrder>>;
};
function ObservationsBlock({ infoHolder, setInfoHolder }: ObservationsBlockProps) {
  const [observationHolder, setObservationHolder] = useState<TServiceOrder['observacoes'][number]>({
    topico: '',
    descricao: '',
  });

  function addObservation(observation: TServiceOrder['observacoes'][number]) {
    const observations = [...infoHolder.observacoes];
    observations.push(observation);
    setInfoHolder((prev) => ({ ...prev, observacoes: observations }));
    return toast.success('Observação adicionada !', { position: 'bottom-center' });
  }
  function removeObservation(index: number) {
    const observations = [...infoHolder.observacoes];
    observations.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, observacoes: observations }));
    return toast.success('Observação removida !', { position: 'bottom-center' });
  }
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/50 p-1 text-center text-xs font-medium text-primary-foreground'>OBSERVAÇÕES P/ EXECUÇÃO</h1>
      <div className='flex w-full flex-col gap-1'>
        {infoHolder.observacoes.length > 0 ? (
          <div className='flex w-full flex-col gap-1'>
            <h1 className='w-full text-start text-sm font-medium tracking-tight text-primary/70'>
              Aqui estão as observações definidas para execução dessa ordem de serviço:
            </h1>

            {infoHolder.observacoes.map((observation, index) => (
              <div key={index} className='flex w-full flex-col rounded-md border border-primary/50'>
                <div className='flex min-h-[25px] w-full flex-col items-start justify-between gap-1 lg:flex-row'>
                  <div className='flex w-full items-center justify-center rounded-br-md rounded-tl-md bg-cyan-700 lg:w-[40%]'>
                    <p className='w-full text-center text-xs font-medium text-primary-foreground'>{observation.topico}</p>
                  </div>
                  <div className='flex grow items-center justify-end gap-2 p-2'>
                    <button
                      onClick={() => removeObservation(index)}
                      type='button'
                      className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
                    >
                      <MdDelete style={{ color: 'red' }} size={10} />
                    </button>
                  </div>
                </div>
                <h1 className='w-full p-2 text-center text-xs font-medium tracking-tight text-primary/70'>{observation.descricao}</h1>
              </div>
            ))}
          </div>
        ) : (
          <p className='w-full text-center text-sm font-medium tracking-tight text-primary/70'>Nenhum observação de execução definida.</p>
        )}
      </div>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='TÓPICO'
              placeholder='Preencha o tópico da observação...'
              value={observationHolder.topico}
              handleChange={(value) => setObservationHolder((prev) => ({ ...prev, topico: value }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-2/3'>
            <TextInput
              label='DESCRIÇÃO'
              placeholder='Preencha aqui o texto da observação...'
              value={observationHolder.descricao}
              handleChange={(value) => setObservationHolder((prev) => ({ ...prev, descricao: value }))}
              width='100%'
            />
          </div>
        </div>
        <div className='flex items-center justify-end gap-4'>
          <button
            className='rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70'
            onClick={() => addObservation(observationHolder)}
          >
            ADICIONAR OBSERVAÇÃO
          </button>
        </div>
      </div>
    </div>
  );
}

export default ObservationsBlock;
