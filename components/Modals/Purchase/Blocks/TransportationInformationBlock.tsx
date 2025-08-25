import TextInput from '@/components/Inputs/TextInput';
import { formatToPhone } from '@/utils/methods';
import { TPurchaseDTO } from '@/utils/schemas/purchase.schema';
import React from 'react';

type TransportationInformationBlockProps = {
  infoHolder: TPurchaseDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<TPurchaseDTO>>;
};
function TransportationInformationBlock({ infoHolder, setInfoHolder }: TransportationInformationBlockProps) {
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70 p-1 text-center font-medium text-white'>INFORMAÇÕES DO FRETE</h1>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='NOME DA TRANSPORTADORA'
              placeholder='Preencha o nome da transportadora...'
              value={infoHolder.transporte.transportadora.nome}
              handleChange={(value) =>
                setInfoHolder((prev) => ({
                  ...prev,
                  transporte: { ...prev.transporte, transportadora: { ...prev.transporte.transportadora, nome: value } },
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='CONTATO DA TRANSPORTADORA'
              placeholder='Preencha o telefone de contato da transportadora...'
              value={infoHolder.transporte.transportadora.contato}
              handleChange={(value) =>
                setInfoHolder((prev) => ({
                  ...prev,
                  transporte: { ...prev.transporte, transportadora: { ...prev.transporte.transportadora, contato: formatToPhone(value) } },
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='LINK DE RASTREIO (SE HOUVER)'
              placeholder='Preencha, se houver, o link de rastreio...'
              value={infoHolder.transporte.linkRastreio || ''}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, transporte: { ...prev.transporte, linkRastreio: value } }))}
              width='100%'
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransportationInformationBlock;
