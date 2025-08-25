import dayjs from 'dayjs';
import { BsCalendar, BsCalendarCheck } from 'react-icons/bs';
import { MdEdit } from 'react-icons/md';

import EditPayment from '../Expenses/Utils/EditPayment';
import { Dialog, DialogTrigger } from '../ui/dialog';

import { formatDateAsLocale, formatToMoney } from '@/lib/methods/formatting';
import { TPayment } from '@/utils/schemas/expenses.schema';

function getPaymentStatusTag({ paymentDate, isPaid }: { paymentDate: string | null; isPaid: boolean }) {
  if (!!isPaid) return <div className='rounded-md bg-green-600 px-2 py-0.5 text-xxs font-medium text-primary-foreground lg:text-[0.6rem]'>PAGO</div>;
  if (!paymentDate)
    return <div className='rounded-md bg-yellow-600 px-2 py-0.5 text-xxs font-medium text-primary-foreground lg:text-[0.6rem]'>A PAGAR</div>;
  const isOverDue = dayjs(new Date()).isAfter(paymentDate);
  console.log(paymentDate, isOverDue);
  if (!isOverDue)
    return <div className='rounded-md bg-yellow-600 px-2 py-0.5 text-xxs font-medium text-primary-foreground lg:text-[0.6rem]'>A PAGAR</div>;
  return <div className='rounded-md bg-red-600 px-2 py-0.5 text-xxs font-medium text-primary-foreground lg:text-[0.6rem]'>EM ATRASO</div>;
}
function getPaymentDateTag({ paymentDate, isPaid }: { paymentDate: string | null; isPaid: boolean }) {
  if (!!isPaid)
    return (
      <div className='flex items-center gap-1'>
        <BsCalendarCheck color=' rgb(22,163,74)' />
        <p className='text-[0.6rem] tracking-tight lg:text-[0.65rem]'>{formatDateAsLocale(paymentDate || undefined)}</p>
      </div>
    );
  if (!paymentDate) return null;
  const isOverDue = dayjs(new Date()).isAfter(paymentDate);
  if (!isOverDue)
    return (
      <div className='flex items-center gap-1'>
        <BsCalendar color='rgb(202,138,4)' />
        <p className='text-[0.6rem] tracking-tight lg:text-[0.65rem]'>{formatDateAsLocale(paymentDate || undefined)}</p>
      </div>
    );
  return (
    <div className='flex items-center gap-1'>
      <BsCalendar color='rgb(220,38,38)' />
      <p className='text-[0.6rem] tracking-tight lg:text-[0.65rem]'>{formatDateAsLocale(paymentDate || undefined)}</p>
    </div>
  );
}

type PaymentCardProps = {
  payment: TPayment;
  affectedQueryKey: any[];
};
function PaymentCard({ payment, affectedQueryKey }: PaymentCardProps) {
  return (
    <Dialog>
      <div className='flex flex-col rounded-sm border border-primary/50 p-2'>
        <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
          <div className='flex w-full items-center justify-start gap-2 lg:w-fit'>
            {getPaymentStatusTag({ paymentDate: payment.pagamentos.dataPagamento || null, isPaid: payment.pagamentos.efetivado })}
            <h1 className='text-[0.65rem] font-bold tracking-tight text-primary/80 lg:text-xs'>{payment.titulo}</h1>
            <DialogTrigger asChild>
              <button className='flex items-center justify-center rounded-full border border-primary/90 bg-primary/10p-1 text-primary/90'>
                <MdEdit size={10} />
                <p className='text-xxs'>EDITAR</p>
              </button>
            </DialogTrigger>
          </div>
          <div className='flex w-full items-center justify-end gap-2 lg:w-fit'>
            {getPaymentDateTag({ paymentDate: payment.pagamentos.dataPagamento || null, isPaid: payment.pagamentos.efetivado })}
            <h1 className='rounded-lg bg-black px-2 py-0.5 text-center text-[0.65rem] font-bold text-primary-foreground lg:py-1'>
              {formatToMoney(payment.pagamentos.valor)}
            </h1>
          </div>
        </div>
      </div>
      <EditPayment payment={payment} affectedQueryKey={affectedQueryKey} />
    </Dialog>
  );
}

export default PaymentCard;
