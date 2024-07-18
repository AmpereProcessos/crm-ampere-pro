import { formatDateAsLocale, formatToMoney } from '@/lib/methods/formatting'
import { TReceipt } from '@/utils/schemas/revenues.schema'
import dayjs from 'dayjs'
import React from 'react'
import { BsCalendar, BsCalendarCheck, BsCode } from 'react-icons/bs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { MdEdit } from 'react-icons/md'
import EditReceipt from '../Revenues/Utils/EditReceipt'

function getPaymentStatusTag({ paymentDate, isPaid }: { paymentDate: string | null; isPaid: boolean }) {
  if (!!isPaid) return <div className="rounded-md bg-green-600 px-2 py-0.5 text-[0.5rem] font-medium text-white lg:text-[0.6rem]">RECEBIDO</div>
  if (!paymentDate) return <div className="rounded-md bg-yellow-600 px-2 py-0.5 text-[0.5rem] font-medium text-white lg:text-[0.6rem]">A RECEBER</div>
  const isOverDue = dayjs(new Date()).isBefore(paymentDate)
  if (!isOverDue) return <div className="rounded-md bg-yellow-600 px-2 py-0.5 text-[0.5rem] font-medium text-white lg:text-[0.6rem]">A RECEBER</div>
  return <div className="rounded-md bg-red-600 px-2 py-0.5 text-[0.5rem] font-medium text-white lg:text-[0.6rem]">EM ATRASO</div>
}
function getPaymentDateTag({ paymentDate, isPaid }: { paymentDate: string | null; isPaid: boolean }) {
  if (!!isPaid)
    return (
      <div className="flex items-center gap-1">
        <BsCalendarCheck color=" rgb(22,163,74)" />
        <p className="text-[0.6rem] tracking-tight lg:text-[0.65rem]">{formatDateAsLocale(paymentDate || undefined)}</p>
      </div>
    )
  if (!paymentDate) return null
  const isOverDue = dayjs(new Date()).isBefore(paymentDate)
  if (!isOverDue)
    return (
      <div className="flex items-center gap-1">
        <BsCalendar color="rgb(202,138,4)" />
        <p className="text-[0.6rem] tracking-tight lg:text-[0.65rem]">{formatDateAsLocale(paymentDate || undefined)}</p>
      </div>
    )
  return (
    <div className="flex items-center gap-1">
      <BsCalendar color="rgb(220,38,38)" />
      <p className="text-[0.6rem] tracking-tight lg:text-[0.65rem]">{formatDateAsLocale(paymentDate || undefined)}</p>
    </div>
  )
}

type ReceiptCardProps = {
  receipt: TReceipt
  affectedQueryKey: any[]
}
function ReceiptCard({ receipt, affectedQueryKey }: ReceiptCardProps) {
  return (
    <Dialog>
      <div className="flex flex-col rounded border border-gray-500 p-2">
        <div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
          <div className="flex w-full items-center justify-start gap-2 lg:w-fit">
            {getPaymentStatusTag({ paymentDate: receipt.recebimentos.dataRecebimento || null, isPaid: receipt.recebimentos.efetivado })}
            <h1 className="text-[0.65rem] font-bold tracking-tight text-gray-800 lg:text-xs">{receipt.titulo}</h1>
            <DialogTrigger asChild>
              <button className="flex items-center justify-center rounded-full border border-gray-900 bg-gray-50 p-1 text-gray-900">
                <MdEdit size={10} />
                <p className="text-[0.5rem]">EDITAR</p>
              </button>
            </DialogTrigger>
          </div>
          <div className="flex w-full items-center justify-end gap-2 lg:w-fit">
            {getPaymentDateTag({ paymentDate: receipt.recebimentos.dataRecebimento || null, isPaid: receipt.recebimentos.efetivado })}
            <h1 className="rounded-lg bg-black px-2 py-0.5 text-center text-[0.65rem] font-bold text-white lg:py-1">
              {formatToMoney(receipt.recebimentos.valor)}
            </h1>
          </div>
        </div>
      </div>
      <EditReceipt receipt={receipt} affectedQueryKey={affectedQueryKey} />
    </Dialog>
  )
}

export default ReceiptCard
