import DateInput from '@/components/Inputs/DateInput'
import { Sidebar } from '@/components/Sidebar'
import ProcessTrackingPage from '@/components/Operation/Management/ProcessTrackingPage'

import ErrorComponent from '@/components/utils/ErrorComponent'
import LoadingComponent from '@/components/utils/LoadingComponent'
import { getPeriodDateParamsByReferenceDate } from '@/lib/methods/dates'
import { formatDateInputChange, formatDecimalPlaces } from '@/lib/methods/formatting'
import { formatDateForInput } from '@/utils/methods'
import { useProcessTrackingStats } from '@/utils/queries/stats/operation/process-tracking'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { BsCheckCircle } from 'react-icons/bs'
import { MdOutlineTimer, MdTimer } from 'react-icons/md'
import { TbProgress } from 'react-icons/tb'
import ProjectsFollowUpPage from '@/components/Operation/Management/ProjectsFollowUpPage'
import MainManagementPage from '@/components/Operation/Management/MainManagementPage'

function OperationFollowUp() {
  const { data: session, status } = useSession({ required: true })
  const [mode, setMode] = useState<'process-tracking' | 'projects-follow-up'>('process-tracking')

  if (status != 'authenticated') return <LoadingComponent />
  return <MainManagementPage session={session} />
}

export default OperationFollowUp
