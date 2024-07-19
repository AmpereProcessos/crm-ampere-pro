import { useExpensesByPersonalizedFilters } from '@/utils/queries/expenses'
import { usePartnersSimplified } from '@/utils/queries/partners'
import { Session } from 'next-auth'
import React, { useState } from 'react'
import ExpensePaginationMenu from './PaginationMenu'
import ExpenseCard from '../Cards/ExpenseCard'

type ExpensesBlockProps = {
  session: Session
}

function ExpensesBlock({ session }: ExpensesBlockProps) {
  const userPartnersScope = session.user.permissoes.parceiros.escopo

  const [page, setPage] = useState<number>(1)
  const [partners, setPartners] = useState<string[] | null>(userPartnersScope || null)
  const { data: partnersOptions } = usePartnersSimplified()
  const { data, isLoading, isError, isSuccess, updateFilters } = useExpensesByPersonalizedFilters({ page, partners })
  const expenses = data?.expenses
  const expensesMatched = data?.expensesMatched
  const totalPages = data?.totalPages
  return (
    <div className="flex h-full w-full flex-col gap-2 rounded border border-gray-300 bg-[#fff] p-3 shadow-sm">
      <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 pb-2">
        <h1 className="w-full text-sm font-bold tracking-tight">DESPESAS</h1>
      </div>
      <ExpensePaginationMenu
        activePage={page}
        selectPage={(x) => setPage(x)}
        totalPages={totalPages || 0}
        queryLoading={isLoading}
        expensesMatched={expensesMatched}
        expensesShowing={expenses?.length}
      />
      <div className="flex w-full flex-col gap-2">
        {expenses?.map((expense, index) => (
          <div key={expense._id} className="w-full">
            <ExpenseCard expense={expense} session={session} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExpensesBlock
