import { formatDateAsLocale, formatNameAsInitials, formatToMoney } from '@/lib/methods/formatting'
import { TRevenueDTO } from '@/utils/schemas/revenues.schema'
import React from 'react'
import { BsCalendar, BsCalendarPlus, BsCircleHalf, BsPatchCheck } from 'react-icons/bs'
import { FaTag } from 'react-icons/fa'
import Avatar from '../utils/Avatar'
import { MdAttachMoney } from 'react-icons/md'

function getStatusTag({ total, receipts }: { total: number; receipts: TRevenueDTO['recebimentos'] }) {
  const totalReceipt = receipts.reduce((acc, current) => (current.efetivado ? acc + current.valor : acc), 0)

  if (totalReceipt >= total)
    return <h1 className={`w-fit self-center rounded border border-green-500 p-1 text-center text-[0.6rem] font-black text-green-500`}>RECEBIDO TOTAL</h1>
  if (totalReceipt > 0)
    return <h1 className={`w-fit self-center rounded border border-orange-600 p-1 text-center text-[0.6rem] font-black text-orange-600`}>RECEBIDO PARCIAL</h1>

  return <h1 className={`w-fit self-center rounded border border-gray-500 p-1 text-center text-[0.6rem] font-black text-gray-500`}>PENDENTE</h1>
}
type RevenueCardProps = {
  revenue: TRevenueDTO
  handleClick: (id: string) => void
}
function RevenueCard({ revenue, handleClick }: RevenueCardProps) {
  const totalReceived = revenue.recebimentos.reduce((acc, current) => (current.efetivado ? acc + current.valor : acc), 0)
  return (
    <div className="flex w-full flex-col gap-2 rounded-md border border-gray-500 bg-[#fff] p-4">
      <div className="flex w-full items-center justify-between">
        <h1
          onClick={() => handleClick(revenue._id)}
          className="cursor-pointer text-sm font-black leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500"
        >
          {revenue.titulo}
        </h1>

        <div className="flex items-center gap-2">{getStatusTag({ total: revenue.total, receipts: revenue.recebimentos })}</div>
      </div>
      <div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
        <div className="flex flex-col items-center gap-1 lg:items-start">
          <div className="flex items-center gap-1">
            <MdAttachMoney size={12} />
            <p className="text-[0.65rem] font-medium text-gray-500">TOTAL</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[0.6rem] font-medium leading-none tracking-tight">{formatToMoney(revenue.total)}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 lg:items-end">
          <div className="flex items-center gap-1">
            <BsPatchCheck size={12} />
            <p className="text-[0.65rem] font-medium text-gray-500">RECEBIDO</p>
          </div>
          <p className="text-[0.6rem] font-medium leading-none tracking-tight">{formatToMoney(totalReceived)}</p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center gap-1">
          <FaTag size={12} />
          <p className="text-[0.65rem] font-medium text-gray-500">CATEGORIAS</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2">
          {revenue.categorias.length > 0 ? (
            revenue.categorias.map((item, index) => (
              <div key={index} className="rounded border border-blue-600 bg-blue-50 p-2 text-center shadow-sm">
                <p className="text-[0.6rem] font-medium leading-none tracking-tight text-blue-600">{item}</p>
              </div>
            ))
          ) : (
            <p className="text-[0.6rem] font-medium leading-none tracking-tight text-gray-500">SEM CATEGORIAS DEFINIDAS</p>
          )}
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
            <BsCircleHalf size={12} />
            <p className="text-[0.65rem] font-medium text-gray-500">FRACIONAMENTO</p>
          </div>
          <p className="text-[0.6rem] font-medium leading-none tracking-tight">
            {revenue.recebimentos.length > 1 ? `${revenue.recebimentos.length} RECEBIMENTOS` : `${revenue.recebimentos.length} RECEBIMENTO`}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <div className={`flex items-center gap-1`}>
          <BsCalendarPlus />
          <p className="text-[0.65rem] font-medium text-gray-500">{formatDateAsLocale(revenue.dataInsercao, true)}</p>
        </div>
        <div className="flex items-center gap-1">
          <Avatar fallback={formatNameAsInitials(revenue.autor.nome)} url={revenue.autor.avatar_url || undefined} height={20} width={20} />
          <p className="text-[0.65rem] font-medium text-gray-500">{revenue.autor.nome}</p>
        </div>
      </div>
    </div>
  )
}

export default RevenueCard
