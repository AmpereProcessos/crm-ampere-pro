import CheckboxInput from '@/components/Inputs/CheckboxInput';
import DateInput from '@/components/Inputs/DateInput';
import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import { formatDateOnInputChange } from '@/lib/methods/formatting';
import { formatDateForInputValue } from '@/utils/methods';
import { TRevenue, TRevenueReceiptItem } from '@/utils/schemas/revenues.schema';
import { PaymentMethods } from '@/utils/select-options';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import RevenueReceiptsTable from './Utils/ReceiptsTable';

type RevenueReceiptInformationBlockProps = {
  infoHolder: TRevenue;
  setInfoHolder: React.Dispatch<React.SetStateAction<TRevenue>>;
};
function RevenueReceiptInformationBlock({ infoHolder, setInfoHolder }: RevenueReceiptInformationBlockProps) {
  const pendingTotal = infoHolder.total - infoHolder.recebimentos.reduce((acc, current) => current.valor + acc, 0);
  const [receiptHolder, setReceiptHolder] = useState<TRevenueReceiptItem>({
    valor: pendingTotal,
    metodo: PaymentMethods[0].value,
    dataRecebimento: null,
    efetivado: false,
  });
  function addReceipt(receipt: TRevenueReceiptItem) {
    if (receipt.valor > pendingTotal) return toast.error('Valor do novo recebimento não pode exceder o valor total pendente.');
    if (receipt.efetivado && !receipt.dataRecebimento) return toast.error('Para recebimentos efetivados, preencher a data de recebimento.');

    const receipts = [...infoHolder.recebimentos];
    receipts.push({ ...receipt });
    setInfoHolder((prev) => ({ ...prev, recebimentos: receipts }));
    const newPendingTotal = infoHolder.total - receipts.reduce((acc, current) => current.valor + acc, 0);
    setReceiptHolder({ valor: newPendingTotal, metodo: PaymentMethods[0].value, dataRecebimento: null, efetivado: false });
  }

  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-white'>INFORMAÇÕES DE RECEBIMENTO</h1>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full items-center justify-center lg:justify-end'>
          <DateInput
            label='DATA DE COMPETÊNCIA'
            value={formatDateForInputValue(infoHolder.dataCompetencia)}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, dataCompetencia: formatDateOnInputChange(value) || prev.dataCompetencia }))}
          />
        </div>
        <h1 className='w-full bg-primary/50 p-1 text-center text-xs font-medium text-white'>RECEBIMENTOS DA RECEITA</h1>
        <div className='flex w-full flex-col gap-2'>
          <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
            <div className='w-full lg:w-[25%]'>
              <NumberInput
                label='VALOR'
                placeholder='Preencha o valor do recebimento...'
                value={receiptHolder.valor}
                handleChange={(value) => setReceiptHolder((prev) => ({ ...prev, valor: value }))}
                width='100%'
              />
            </div>
            <div className='w-full lg:w-[25%]'>
              <SelectInput
                label='MÉTODO DE PAGAMENTO'
                resetOptionLabel='NÃO DEFINIDO'
                options={PaymentMethods}
                value={receiptHolder.metodo}
                handleChange={(value) =>
                  setReceiptHolder((prev) => ({
                    ...prev,
                    metodo: value,
                  }))
                }
                onReset={() => {
                  setReceiptHolder((prev) => ({
                    ...prev,
                    metodo: 'UN',
                  }));
                }}
                width='100%'
              />
            </div>
            <div className='w-full lg:w-[25%]'>
              <DateInput
                label='DATA/PREVISÃO DE RECEBIMENTO'
                value={formatDateForInputValue(receiptHolder.dataRecebimento)}
                handleChange={(value) =>
                  setReceiptHolder((prev) => ({
                    ...prev,
                    dataRecebimento: formatDateOnInputChange(value),
                  }))
                }
                width='100%'
              />
            </div>
            <div className='flex w-full items-center justify-center lg:w-[25%]'>
              <div className='w-fit'>
                <CheckboxInput
                  labelFalse='RECEBIDO'
                  labelTrue='RECEBIDO'
                  checked={receiptHolder.efetivado}
                  handleChange={(value) => setReceiptHolder((prev) => ({ ...prev, efetivado: value }))}
                />
              </div>
            </div>
          </div>
          <div className='flex items-center justify-end'>
            <button
              className='rounded bg-black p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-primary/70'
              onClick={() => addReceipt(receiptHolder)}
            >
              ADICIONAR RECEBIMENTO
            </button>
          </div>
        </div>
        <RevenueReceiptsTable infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
      </div>
    </div>
  );
}

export default RevenueReceiptInformationBlock;
