import { formatDateAsLocale, formatNameAsInitials, formatToMoney } from '@/lib/methods/formatting'
import { TRevenueDTO, TRevenueDTOSimplified } from '@/utils/schemas/revenues.schema'
import React, { useState } from 'react'
import { BsCalendar, BsCalendarPlus, BsCircleHalf, BsPatchCheck } from 'react-icons/bs'
import { FaTag } from 'react-icons/fa'
import Avatar from '../utils/Avatar'
import { MdAttachMoney, MdEdit } from 'react-icons/md'
import { Dialog, DialogTrigger } from '../ui/dialog'
import EditRevenue from '../Modals/Revenues/EditRevenue'
import { Session } from 'next-auth'

type RevenueCardProps = {
  revenue: TRevenueDTOSimplified
  session: Session
}
function RevenueCard({ revenue, session }: RevenueCardProps) {
  const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false })
  return (
    <div className="flex w-full flex-col gap-2 rounded border border-gray-500 p-2">
      <div className="flex w-full flex-col items-center justify-between lg:flex-row">
        <div className="flex w-full items-center justify-start gap-2 lg:w-fit lg:grow">
          <h1 className="text-[0.65rem] font-bold tracking-tight text-gray-800 lg:text-xs">{revenue.titulo}</h1>
          <button
            onClick={() => setEditModal({ id: revenue._id, isOpen: true })}
            className="flex items-center justify-center rounded-full border border-gray-900 bg-gray-50 p-1 text-gray-900"
          >
            <MdEdit size={10} />
            <p className="text-[0.5rem]">EDITAR</p>
          </button>
          <div className="hidden grow flex-wrap items-center gap-2 lg:flex">
            {revenue.categorias.length > 0 ? (
              revenue.categorias.map((item, index) => (
                <div key={index} className="flex items-center gap-1 rounded-md border border-blue-600 bg-blue-50 px-2 py-0.5 text-center shadow-sm">
                  <FaTag size={12} color="rgb(37,99,235)" />
                  <p className="text-[0.6rem] font-medium leading-none tracking-tight text-blue-600">{item}</p>
                </div>
              ))
            ) : (
              <p className="text-[0.6rem] font-medium leading-none tracking-tight text-gray-500">SEM CATEGORIAS DEFINIDAS</p>
            )}
          </div>
        </div>
        <h1 className="rounded-lg bg-black px-2 py-0.5 text-center text-[0.65rem] font-bold text-white lg:py-1">{formatToMoney(revenue.total)}</h1>
      </div>

      {editModal.id && editModal.isOpen ? (
        <EditRevenue revenueId={revenue._id} session={session} closeModal={() => setEditModal({ id: null, isOpen: false })} />
      ) : null}
    </div>
  )
}

export default RevenueCard
