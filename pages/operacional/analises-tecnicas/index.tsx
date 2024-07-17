import TechnicalAnalysisPage from '@/components/TechnicalAnalysis/TechnicalAnalysisPage'

import LoadingPage from '@/components/utils/LoadingPage'

import { useSession } from 'next-auth/react'
import React from 'react'

function TechnicalAnalysis() {
  const { data: session, status } = useSession({ required: true })

  if (status != 'authenticated') return <LoadingPage />
  return <TechnicalAnalysisPage session={session} />
}

export default TechnicalAnalysis
