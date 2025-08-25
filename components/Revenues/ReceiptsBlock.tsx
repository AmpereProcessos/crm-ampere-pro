import { useReceiptsByPersonalizedFilters } from '@/utils/queries/revenues';
import { useState } from 'react';
import ReceiptCard from '../Cards/ReceiptCard';
import ReceiptsPaginationMenu from './Utils/ReceiptsPaginationMenu';

type ReceiptsBlockProps = {};
function ReceiptsBlock({}: ReceiptsBlockProps) {
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useReceiptsByPersonalizedFilters({ page });
  const receipts = data?.receipts;
  const receiptsMatched = data?.receiptsMatched;
  const totalPages = data?.totalPages;
  return (
    <div className='flex h-full w-full flex-col gap-2 rounded-sm border border-primary/30 bg-background p-3 shadow-md'>
      <div className='flex w-full items-center justify-between gap-2 border-b border-primary/30 pb-2'>
        <h1 className='w-full text-sm font-bold tracking-tight'>RECEBIMENTOS</h1>
      </div>
      <ReceiptsPaginationMenu
        activePage={page}
        selectPage={(x) => setPage(x)}
        totalPages={totalPages || 0}
        queryLoading={isLoading}
        receiptsMatched={receiptsMatched}
        receiptsShowing={receipts?.length}
      />
      <div className='flex w-full flex-col gap-2'>
        {receipts?.map((receipt, index) => (
          <ReceiptCard
            key={`${receipt._id}-${receipt.indexRecebimento}`}
            receipt={receipt}
            affectedQueryKey={['receipts-by-personalized-filters', 1]}
          />
        ))}
      </div>
    </div>
  );
}

export default ReceiptsBlock;
