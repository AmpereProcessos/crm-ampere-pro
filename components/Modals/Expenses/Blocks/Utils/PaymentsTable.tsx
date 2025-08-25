import { TExpense, TExpensePaymentItem } from '@/utils/schemas/expenses.schema';
import React from 'react';
import toast from 'react-hot-toast';
import PaymentTableItem from './PaymentTableItem';

type PaymentsTableProps = {
  infoHolder: TExpense;
  setInfoHolder: React.Dispatch<React.SetStateAction<TExpense>>;
};
function PaymentsTable({ infoHolder, setInfoHolder }: PaymentsTableProps) {
  function updateItem({ item, index }: { item: TExpensePaymentItem; index: number }) {
    const items = [...infoHolder.pagamentos];
    items[index] = item;
    const updatedTotalReceived = items.reduce((acc, current) => current.valor + acc, 0);
    if (updatedTotalReceived > infoHolder.total) return toast.error('O total pago não deve ultrapassar o valor total da despesa.');

    if (item.efetivado && !item.dataPagamento) return toast.error('Para pagamentos efetivados, preencher a data de pagamento.');

    setInfoHolder((prev) => ({ ...prev, pagamentos: items }));
  }
  function removeItem(index: number) {
    const items = [...infoHolder.pagamentos];
    items.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, pagamentos: items }));
  }
  const paymentsTotal = infoHolder.pagamentos.reduce((acc, current) => acc + current.valor, 0);
  return (
    <div className='flex w-full flex-col rounded-sm border border-primary/80'>
      <div className='hidden w-full items-center gap-2 rounded-sm rounded-bl-none rounded-br-none bg-primary/80 p-1 lg:flex'>
        <h1 className='w-[25%] text-center text-sm font-bold text-primary-foreground'>VALOR</h1>
        <h1 className='w-[25%] text-center text-sm font-bold text-primary-foreground'>MÉTODO</h1>
        <h1 className='w-[25%] text-center text-sm font-bold text-primary-foreground'>DATA/PREVISÃO DE PAGAMENTO</h1>
        <h1 className='w-[25%] text-center text-sm font-bold text-primary-foreground'>PAGO</h1>
      </div>
      <div className='flex w-full flex-col gap-2 p-1'>
        {infoHolder.pagamentos.length > 0 ? (
          infoHolder.pagamentos.map((item, index) => (
            <PaymentTableItem
              key={index}
              item={item}
              expenseTotal={infoHolder.total}
              handleUpdate={(item) => updateItem({ item, index })}
              handleRemove={() => removeItem(index)}
            />
          ))
        ) : (
          <p className='flex w-full grow items-center justify-center py-2 text-center text-sm font-medium italic tracking-tight text-primary/70'>
            Não há registros de pagamentos da receita.
          </p>
        )}
        {paymentsTotal > infoHolder.total ? (
          <p className='w-full rounded-sm border border-orange-400 bg-orange-50 p-1 text-center text-xs italic tracking-tight text-orange-400'>
            Por favor, ajuste os valores dos pagamentos. A somatória dos pagamentos atuais excede o valor total estabelecido para a receita.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default PaymentsTable;
