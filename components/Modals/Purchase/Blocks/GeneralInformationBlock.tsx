import CheckboxWithDate from '@/components/Inputs/CheckboxWithDate';
import SelectInput from '@/components/Inputs/SelectInput';
import TextareaInput from '@/components/Inputs/TextareaInput';
import TextInput from '@/components/Inputs/TextInput';
import { TPurchaseDTO } from '@/utils/schemas/purchase.schema';
import { PurchaseStatus } from '@/utils/select-options';
import React from 'react';

type GeneralInformationBlockProps = {
  infoHolder: TPurchaseDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<TPurchaseDTO>>;
};
function GeneralInformationBlock({ infoHolder, setInfoHolder }: GeneralInformationBlockProps) {
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-primary-foreground'>INFORMAÇÕES GERAIS</h1>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='TÍTULO DA COMPRA'
              placeholder='Preencha o título da registro de compra...'
              value={infoHolder.titulo}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, titulo: value }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <SelectInput
              label='STATUS DA COMPRA'
              value={infoHolder.status}
              options={PurchaseStatus}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, status: value }))}
              onReset={() => setInfoHolder((prev) => ({ ...prev, status: null }))}
              resetOptionLabel='NÃO DEFINIDO'
              width='100%'
            />
          </div>
        </div>
        <div className='my-3 flex w-full flex-col items-center justify-center gap-2 lg:flex-row'>
          <CheckboxWithDate
            labelFalse='COMPRA LIBERADA'
            labelTrue='COMPRA LIBERADA'
            date={infoHolder.liberacao.data || null}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, liberacao: { ...prev.liberacao, data: value } }))}
          />
        </div>
        <TextareaInput
          label='ANOTAÇÕES'
          placeholder='Preencha aqui detalhes da compra, informações relevantes, entre outros...'
          value={infoHolder.anotacoes}
          handleChange={(value) => setInfoHolder((prev) => ({ ...prev, anotacoes: value }))}
        />
      </div>
    </div>
  );
}

export default GeneralInformationBlock;
