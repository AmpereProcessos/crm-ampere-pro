import { TExpense, TExpensePaymentItem } from '@/utils/schemas/expenses.schema'
import React from 'react'
import PaymentTableItem from './PaymentTableItem'
import toast from 'react-hot-toast'

type PaymentsTableProps = {
  infoHolder: TExpense
  setInfoHolder: React.Dispatch<React.SetStateAction<TExpense>>
}
function PaymentsTable({ infoHolder, setInfoHolder }: PaymentsTableProps) {
  function updateItem({ item, index }: { item: TExpensePaymentItem; index: number }) {
    const items = [...infoHolder.pagamentos]
    items[index] = item
    const updatedTotalReceived = items.reduce((acc, current) => current.valor + acc, 0)
    if (updatedTotalReceived > infoHolder.total) return toast.error('O total pago não deve ultrapassar o valor total da despesa.')

    if (item.efetivado && !item.dataPagamento) return toast.error('Para pagamentos efetivados, preencher a data de pagamento.')

    setInfoHolder((prev) => ({ ...prev, pagamentos: items }))
  }
  function removeItem(index: number) {
    const items = [...infoHolder.pagamentos]
    items.splice(index, 1)
    setInfoHolder((prev) => ({ ...prev, pagamentos: items }))
  }
  const paymentsTotal = infoHolder.pagamentos.reduce((acc, current) => acc + current.valor, 0)
  return (
    <div className="flex w-full flex-col rounded border border-gray-800">
      <div className="hidden w-full items-center gap-2 rounded rounded-bl-[0] rounded-br-[0] bg-gray-800 p-1 lg:flex">
        <h1 className="w-[25%] text-center text-sm font-bold text-white">VALOR</h1>
        <h1 className="w-[25%] text-center text-sm font-bold text-white">MÉTODO</h1>
        <h1 className="w-[25%] text-center text-sm font-bold text-white">DATA/PREVISÃO DE PAGAMENTO</h1>
        <h1 className="w-[25%] text-center text-sm font-bold text-white">PAGO</h1>
      </div>
      <div className="flex w-full flex-col gap-2 p-1">
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
          <p className="flex w-full grow items-center justify-center py-2 text-center text-sm font-medium italic tracking-tight text-gray-500">
            Não há registros de pagamentos da receita.
          </p>
        )}
        {paymentsTotal > infoHolder.total ? (
          <p className="w-full rounded border border-orange-400 bg-orange-50 p-1 text-center text-xs italic tracking-tight text-orange-400">
            Por favor, ajuste os valores dos pagamentos. A somatória dos pagamentos atuais excede o valor total estabelecido para a receita.
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default PaymentsTable
