import { TRevenue, TRevenueReceiptItem } from '@/utils/schemas/revenues.schema'
import React from 'react'
import ReceiptTableItem from './ReceiptTableItem'
import toast from 'react-hot-toast'

type RevenueReceiptsTableProps = {
  infoHolder: TRevenue
  setInfoHolder: React.Dispatch<React.SetStateAction<TRevenue>>
}
function RevenueReceiptsTable({ infoHolder, setInfoHolder }: RevenueReceiptsTableProps) {
  function updateItem({ item, index }: { item: TRevenueReceiptItem; index: number }) {
    const items = [...infoHolder.recebimentos]
    items[index] = item
    const updatedTotalReceived = items.reduce((acc, current) => current.valor + acc, 0)
    if (updatedTotalReceived > infoHolder.total) return toast.error('O total recebido não deve ultrapassar o valor total da receita.')
    setInfoHolder((prev) => ({ ...prev, recebimentos: items }))
  }
  function removeItem(index: number) {
    const items = [...infoHolder.recebimentos]
    items.splice(index, 1)
    setInfoHolder((prev) => ({ ...prev, recebimentos: items }))
  }
  return (
    <div className="flex w-full flex-col rounded border border-gray-800">
      <div className="hidden w-full items-center gap-2 rounded rounded-bl-[0] rounded-br-[0] bg-gray-800 p-1 lg:flex">
        <h1 className="w-[25%] text-center text-sm font-bold text-white">VALOR</h1>
        <h1 className="w-[25%] text-center text-sm font-bold text-white">MÉTODO</h1>
        <h1 className="w-[25%] text-center text-sm font-bold text-white">DATA/PREVISÃO DE RECEBIMENTO</h1>
        <h1 className="w-[25%] text-center text-sm font-bold text-white">RECEBIDO</h1>
      </div>
      <div className="flex w-full flex-col gap-2 p-1">
        {infoHolder.recebimentos.length > 0 ? (
          infoHolder.recebimentos.map((item, index) => (
            <ReceiptTableItem key={index} item={item} handleUpdate={(item) => updateItem({ item, index })} handleRemove={() => removeItem(index)} />
          ))
        ) : (
          <p className="flex w-full grow items-center justify-center py-2 text-center text-sm font-medium italic tracking-tight text-gray-500">
            Não há registros de recebimentos da receita.
          </p>
        )}
      </div>
    </div>
  )
}

export default RevenueReceiptsTable
