import { TRevenueDTO, TRevenueDTOSimplified } from '@/utils/schemas/revenues.schema'
import React, { useState } from 'react'
import RevenueCard from '../Cards/RevenueCard'
import { Session } from 'next-auth'
import { usePartnersSimplified } from '@/utils/queries/partners'
import { useRevenuesByPersonalizedFilters } from '@/utils/queries/revenues'
import RevenuePaginationMenu from './PaginationMenu'

type RevenuesBlockProps = {
  session: Session
}
function RevenuesBlock({ session }: RevenuesBlockProps) {
  const userPartnersScope = session.user.permissoes.parceiros.escopo

  const [page, setPage] = useState<number>(1)
  const [partners, setPartners] = useState<string[] | null>(userPartnersScope || null)
  const { data: partnersOptions } = usePartnersSimplified()
  const { data, isLoading, isError, isSuccess, updateFilters } = useRevenuesByPersonalizedFilters({ page, partners })
  const revenues = data?.revenues
  const revenuesMatched = data?.revenuesMatched
  const totalPages = data?.totalPages
  return (
    <div className="flex h-full w-full flex-col gap-2 rounded border border-gray-300 bg-[#fff] p-3 shadow-sm">
      <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 pb-2">
        <h1 className="w-full text-sm font-bold tracking-tight">RECEITAS</h1>
      </div>
      <RevenuePaginationMenu
        activePage={page}
        selectPage={(x) => setPage(x)}
        totalPages={totalPages || 0}
        queryLoading={isLoading}
        revenuesMatched={revenuesMatched}
        revenuesShowing={revenues?.length}
      />
      <div className="flex w-full flex-col gap-2">
        {revenues?.map((revenue, index) => (
          <div key={revenue._id} className="w-full">
            <RevenueCard revenue={revenue} session={session} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default RevenuesBlock
