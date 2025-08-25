import React, { useState } from 'react';

import { TKit, TServiceItem } from '@/utils/schemas/kits.schema';
import toast from 'react-hot-toast';
import NumberInput from '../Inputs/NumberInput';
import TextInput from '../Inputs/TextInput';

import { CommonServicesByProjectType } from '@/utils/constants';
import { AiOutlineSafety } from 'react-icons/ai';
import { MdDelete, MdOutlineMiscellaneousServices } from 'react-icons/md';
import TextareaInput from '../Inputs/TextareaInput';

type ServicesCompositionBlockProps = {
  infoHolder: TKit;
  setInfoHolder: React.Dispatch<React.SetStateAction<TKit>>;
};
function ServicesCompositionBlock({ infoHolder, setInfoHolder }: ServicesCompositionBlockProps) {
  const [serviceHolder, setServiceHolder] = useState<TServiceItem>({
    descricao: '',
    observacoes: '',
    garantia: 0,
  });

  function addServiceToKit() {
    if (serviceHolder.descricao.trim().length < 2) return toast.error('Preencha uma descrição de serviço válida.');
    if (serviceHolder.garantia < 0) return toast.error('Preencha uma garantia válida.');
    var serviceArr = [...infoHolder.servicos];
    serviceArr.push(serviceHolder);
    setInfoHolder((prev) => ({ ...prev, servicos: serviceArr }));
    setServiceHolder({
      descricao: '',
      observacoes: '',
      garantia: 0,
    });
    return;
  }
  function removeServiceFromKit(index: number) {
    const currentServices = [...infoHolder.servicos];
    currentServices.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, servicos: currentServices }));
  }
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-primary-foreground'>COMPOSIÇÃO DE SERVIÇOS</h1>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-3/4'>
            <TextInput
              label='DESCRIÇÃO'
              placeholder='Preencha a descrição do serviço...'
              value={serviceHolder.descricao}
              handleChange={(value) => setServiceHolder((prev) => ({ ...prev, descricao: value }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <NumberInput
              label='GARANTIA'
              placeholder='Preencha a garantia do serviço...'
              value={serviceHolder.garantia}
              handleChange={(value) => setServiceHolder((prev) => ({ ...prev, garantia: value }))}
              width='100%'
            />
          </div>
        </div>
        <TextareaInput
          label='OBSERVAÇÕES DO SERVIÇO'
          value={serviceHolder.observacoes}
          handleChange={(value) => setServiceHolder((prev) => ({ ...prev, observacoes: value }))}
          placeholder='Preencha aqui uma descrição acerca do serviço...'
        />
        <div className='flex items-center justify-end'>
          <button
            className='rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70'
            onClick={() => addServiceToKit()}
          >
            ADICIONAR SERVIÇO
          </button>
        </div>
      </div>
      <div className='flex w-full flex-col gap-1'>
        <h1 className='text-start font-Inter text-xs font-medium leading-none tracking-tight'>SERVIÇOS COMUNS</h1>
        <div className='flex w-full flex-wrap items-start justify-start gap-2'>
          {CommonServicesByProjectType.map((type, index) => (
            <button
              onClick={() => setInfoHolder((prev) => ({ ...prev, servicos: [...prev.servicos, ...type.servicos] }))}
              key={index}
              className={`rounded-lg px-2 py-1 text-xs font-medium bg-[${type.cores.texto}] text-[${type.cores.fundo}]  w-fit`}
            >
              {type.nome}
            </button>
          ))}
        </div>
      </div>
      <div className='mt-2 flex min-h-[150px] w-full flex-col rounded-md border border-primary/50 p-3 shadow-md'>
        <h1 className='mb-2 text-start font-Inter font-bold leading-none tracking-tight'>SERVIÇOS ADICIONADOS</h1>
        <div className='flex w-full flex-wrap items-center justify-around gap-2'>
          {infoHolder.servicos.length > 0 ? (
            infoHolder.servicos.map((service, index) => (
              <div className='flex w-full flex-col rounded-md border border-primary/30 p-2 lg:w-[450px]'>
                <div className='flex w-full items-center justify-between gap-2'>
                  <div className='flex  items-center gap-1'>
                    <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
                      <MdOutlineMiscellaneousServices />
                    </div>
                    <p className='text-xs font-medium leading-none tracking-tight lg:text-sm'>{service.descricao}</p>
                  </div>
                  <button
                    onClick={() => removeServiceFromKit(index)}
                    type='button'
                    className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
                  >
                    <MdDelete style={{ color: 'red' }} size={15} />
                  </button>
                </div>
                <div className='mt-1 flex w-full items-center justify-end gap-2 pl-2'>
                  <div className='flex items-center gap-1'>
                    <AiOutlineSafety size={12} />
                    <p className='text-[0.6rem] font-light text-primary/70 lg:text-xs'>
                      {service.garantia} {service.garantia > 0 ? 'ANOS' : 'ANO'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='text-center font-light text-primary/70'>Nenhum serviço adicionado</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServicesCompositionBlock;
