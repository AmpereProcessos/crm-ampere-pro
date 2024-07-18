import { formatToMoney } from '@/lib/methods/formatting'
import { useReceiptsByPersonalizedFilters } from '@/utils/queries/revenues'
import { TRevenueDTO } from '@/utils/schemas/revenues.schema'
import React, { useState } from 'react'
import ReceiptCard from '../Cards/ReceiptCard'
import ReceiptsPaginationMenu from './Utils/ReceiptsPaginationMenu'

type ReceiptsBlockProps = {}
function ReceiptsBlock({}: ReceiptsBlockProps) {
  const [page, setPage] = useState<number>(1)
  const { data, isLoading } = useReceiptsByPersonalizedFilters({ page })
  const receipts = data?.receipts
  const receiptsMatched = data?.receiptsMatched
  const totalPages = data?.totalPages
  return (
    <div className="flex h-full w-full flex-col gap-2 rounded border border-gray-300 bg-[#fff] p-3 shadow-sm">
      <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 pb-2">
        <h1 className="w-full text-sm font-bold tracking-tight">RECEBIMENTOS</h1>
      </div>
      <ReceiptsPaginationMenu
        activePage={page}
        selectPage={(x) => setPage(x)}
        totalPages={totalPages || 0}
        queryLoading={isLoading}
        receiptsMatched={receiptsMatched}
        receiptsShowing={receipts?.length}
      />
      <div className="flex w-full flex-col gap-2">
        {receipts?.map((receipt, index) => (
          <ReceiptCard key={`${receipt._id}-${receipt.indexRecebimento}`} receipt={receipt} affectedQueryKey={['receipts-by-personalized-filters', 1]} />
        ))}
      </div>
    </div>
  )
}

export default ReceiptsBlock
