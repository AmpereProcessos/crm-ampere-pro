import ExpensesPage from '@/components/Expenses/ExpensesPage'
import LoadingPage from '@/components/utils/LoadingPage'
import { useSession } from 'next-auth/react'
import React from 'react'

function MainExpensesPage() {
  const { data: session, status } = useSession()

  if (status != 'authenticated') return <LoadingPage />
  return <ExpensesPage session={session} />
}

export default MainExpensesPage
