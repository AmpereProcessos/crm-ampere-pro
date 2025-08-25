import { usePaymentsByPersonalizedFilters } from '@/utils/queries/expenses';
import { useState } from 'react';
import PaymentCard from '../Cards/PaymentCard';
import PaymentsPaginationMenu from './Utils/PaymentsPaginationMenu';

type PaymentsBlockProps = {};
function PaymentsBlock() {
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = usePaymentsByPersonalizedFilters({ page });
  const payments = data?.payments;
  const paymentsMatched = data?.paymentsMatched;
  const totalPages = data?.totalPages;
  return (
    <div className='flex h-full w-full flex-col gap-2 rounded-sm border border-primary/30 bg-background p-3 shadow-md'>
      <div className='flex w-full items-center justify-between gap-2 border-b border-primary/30 pb-2'>
        <h1 className='w-full text-sm font-bold tracking-tight'>PAGAMENTOS</h1>
      </div>
      <PaymentsPaginationMenu
        activePage={page}
        selectPage={(x) => setPage(x)}
        totalPages={totalPages || 0}
        queryLoading={isLoading}
        paymentsMatched={paymentsMatched}
        paymentsShowing={payments?.length}
      />
      <div className='flex w-full flex-col gap-2'>
        {payments?.map((payment, index) => (
          <PaymentCard
            key={`${payment._id}-${payment.indexPagamento}`}
            payment={payment}
            affectedQueryKey={['payments-by-personalized-filters', 1]}
          />
        ))}
      </div>
    </div>
  );
}

export default PaymentsBlock;
