import DateInput from '@/components/Inputs/DateInput';
import TextInput from '@/components/Inputs/TextInput';
import { formatDateOnInputChange } from '@/lib/methods/formatting';
import { formatDateForInputValue } from '@/utils/methods';
import { TPurchaseDTO } from '@/utils/schemas/purchase.schema';
import React from 'react';

type BillingInformationBlockProps = {
  infoHolder: TPurchaseDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<TPurchaseDTO>>;
};
function BillingInformationBlock({ infoHolder, setInfoHolder }: BillingInformationBlockProps) {
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-white'>INFORMAÇÕES DE FATURAMENTO</h1>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <DateInput
              label='DATA DE FATURAMENTO'
              value={formatDateForInputValue(infoHolder.faturamento.data)}
              handleChange={(value) =>
                setInfoHolder((prev) => ({ ...prev, faturamento: { ...prev.faturamento, data: formatDateOnInputChange(value) } }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='CÓDIGO DA NOTA FISCAL'
              placeholder='Preencha o código da nota fiscal...'
              value={infoHolder.faturamento.codigoNotaFiscal || ''}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, faturamento: { ...prev.faturamento, codigoNotaFiscal: value } }))}
              width='100%'
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingInformationBlock;
