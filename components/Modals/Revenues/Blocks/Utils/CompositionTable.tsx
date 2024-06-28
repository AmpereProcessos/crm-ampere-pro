import { TRevenue, TRevenueCompositionItem } from '@/utils/schemas/revenues.schema'
import React from 'react'
import CompositionTableItem from './CompositionTableItem'

type RevenueCompositionTableProps = {
  infoHolder: TRevenue
  setInfoHolder: React.Dispatch<React.SetStateAction<TRevenue>>
}
function RevenueCompositionTable({ infoHolder, setInfoHolder }: RevenueCompositionTableProps) {
  function updateItem({ item, index }: { item: TRevenueCompositionItem; index: number }) {
    const items = [...infoHolder.composicao]
    items[index] = item
    setInfoHolder((prev) => ({ ...prev, composicao: items }))
  }
  function removeItem(index: number) {
    const items = [...infoHolder.composicao]
    items.splice(index, 1)
    setInfoHolder((prev) => ({ ...prev, composicao: items }))
  }
  return (
    <div className="flex w-full flex-col rounded border border-gray-800">
      <div className="hidden w-full items-center gap-2 rounded rounded-bl-[0] rounded-br-[0] bg-gray-800 p-1 lg:flex">
        <h1 className="w-[30%] text-center text-sm font-bold text-white">ITEM</h1>
        <h1 className="w-[15%] text-center text-sm font-bold text-white">UNIDADE</h1>
        <h1 className="w-[15%] text-center text-sm font-bold text-white">QTDE</h1>
        <h1 className="w-[20%] text-center text-sm font-bold text-white">VALOR</h1>
        <h1 className="w-[20%] text-center text-sm font-bold text-white">TOTAL</h1>
      </div>
      <div className="flex w-full flex-col gap-2 p-1">
        {infoHolder.composicao.length > 0 ? (
          infoHolder.composicao.map((item, index) => (
            <CompositionTableItem key={index} item={item} handleUpdate={(item) => updateItem({ item, index })} handleRemove={() => removeItem(index)} />
          ))
        ) : (
          <p className="flex w-full grow items-center justify-center py-2 text-center text-sm font-medium italic tracking-tight text-gray-500">
            Não há itens de composição da receita.
          </p>
        )}
      </div>
    </div>
  )
}

export default RevenueCompositionTable
