import { formatDateAsLocale } from '@/lib/methods/formatting'
import { TRevenueDTO } from '@/utils/schemas/revenues.schema'
import React from 'react'
import { BsCalendar } from 'react-icons/bs'
import { FaTag } from 'react-icons/fa'

function getStatusTag({ total, receipts }: { total: number; receipts: TRevenueDTO['recebimentos'] }) {
  const totalReceipt = receipts.reduce((acc, current) => (current.efetivado ? acc + current.valor : acc), 0)

  if (totalReceipt >= total)
    return <h1 className={`w-fit self-center rounded border border-green-500 p-1 text-center text-[0.6rem] font-black text-green-500`}>RECEBIDO</h1>
  if (totalReceipt > 0)
    return <h1 className={`w-fit self-center rounded border border-orange-600 p-1 text-center text-[0.6rem] font-black text-orange-600`}>EM ANDAMENTO</h1>

  return <h1 className={`w-fit self-center rounded border border-gray-500 p-1 text-center text-[0.6rem] font-black text-gray-500`}>PENDENTE</h1>
}
type RevenueCardProps = {
  revenue: TRevenueDTO
  handleClick: (id: string) => void
}
function RevenueCard({ revenue, handleClick }: RevenueCardProps) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-md border border-gray-500 bg-[#fff] p-4">
      <div className="flex w-full items-center justify-between">
        {true ? (
          <h1
            onClick={() => handleClick(revenue._id)}
            className="cursor-pointer text-sm font-black leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500"
          >
            {revenue.titulo}
          </h1>
        ) : (
          <h1 className="text-sm font-black leading-none tracking-tight">{revenue.titulo}</h1>
        )}
        <div className="flex items-center gap-2">{getStatusTag({ total: revenue.total, receipts: revenue.recebimentos })}</div>
      </div>
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center gap-1">
          <FaTag size={12} />
          <p className="text-[0.65rem] font-medium text-gray-500">CATEGORIAS</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2">
          {revenue.categorias.map((item, index) => (
            <div key={index} className="rounded border border-blue-600 bg-blue-50 p-2 text-center shadow-sm">
              <p className="text-[0.6rem] font-medium leading-none tracking-tight text-blue-600">{item}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
        <div className="flex flex-col items-center gap-1 lg:items-start">
          <div className="flex items-center gap-1">
            <BsCalendar size={12} />
            <p className="text-[0.65rem] font-medium text-gray-500">COMPETÊNCIA</p>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-[0.6rem] font-medium leading-none tracking-tight">{formatDateAsLocale(revenue.dataCompetencia)}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 lg:items-end">
          <div className="flex items-center gap-1">
            <FaTruck size={12} />
            <p className="text-[0.65rem] font-medium text-gray-500">TRANSPORTE</p>
          </div>
          {purchase.transporte.transportadora.nome.trim().length > 0 ? (
            <div className="flex items-center gap-2">
              <p className="text-[0.6rem] font-medium leading-none tracking-tight">TRANSPORTE SERÁ REALIZADO POR {purchase.transporte.transportadora.nome}</p>
            </div>
          ) : (
            <p className="text-[0.6rem] font-medium leading-none tracking-tight">TRANSPORTADORA NÃO DEFINIDA</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default RevenueCard
