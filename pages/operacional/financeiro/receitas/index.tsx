import RevenuesPage from '@/components/Revenues/RevenuesPage'
import LoadingPage from '@/components/utils/LoadingPage'
import { useSession } from 'next-auth/react'
import React from 'react'

function MainRevenuesPage() {
  const { data: session, status } = useSession({ required: true })

  if (status != 'authenticated') return <LoadingPage />
  return <RevenuesPage session={session} />
}

export default MainRevenuesPage
