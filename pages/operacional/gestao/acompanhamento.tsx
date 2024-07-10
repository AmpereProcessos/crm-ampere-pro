import DateInput from '@/components/Inputs/DateInput'
import { Sidebar } from '@/components/Sidebar'
import ProcessTrackingPage from '@/components/Stats/OperationFollowUpDashboard/ProcessTrackingPage'
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

const currentDate = new Date()
const { start, end } = getPeriodDateParamsByReferenceDate({ reference: currentDate, resetStart: true })

function OperationFollowUp() {
  const { data: session, status } = useSession({ required: true })
  const [mode, setMode] = useState<'process-tracking' | 'projects-follow-up'>('process-tracking')
  const [projectType, setProjectType] = useState<string>('SISTEMA FOTOVOLTAICO')
  const [period, setPeriod] = useState<{ after: string; before: string }>({ after: start.toISOString(), before: end.toISOString() })

  const { data: stats, isLoading, isError, isSuccess } = useProcessTrackingStats({ after: period.after, before: period.before, projectType })
  if (status != 'authenticated') return <LoadingComponent />
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow flex-col gap-2 overflow-x-hidden bg-[#f8f9fa] p-6">
        <div className="flex w-full flex-col items-center justify-between gap-4 border-b border-black pb-2 lg:flex-row lg:items-end">
          <h1 className="text-center font-Raleway text-xl font-black text-black lg:text-start lg:text-2xl">ACOMPANHAMENTO OPERACIONAL</h1>
        </div>
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg="Oops, houve um erro ao buscar resultados." /> : null}
        {isSuccess ? (
          <>
            <div className="flex w-full items-center gap-4">
              <div className="flex h-9 items-center gap-2 rounded-lg bg-gray-300 px-3 py-2">
                <button
                  onClick={() => setMode('process-tracking')}
                  className={`${
                    mode == 'process-tracking' ? 'bg-white text-black shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-200'
                  } whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium leading-none tracking-tight`}
                >
                  VISUALIZAÇÃO DE PROCESSOS
                </button>
                <button
                  onClick={() => setMode('projects-follow-up')}
                  className={`${
                    mode == 'projects-follow-up' ? 'bg-white text-black shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-200'
                  } whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium leading-none tracking-tight shadow-sm`}
                >
                  FOLLOW UP DE PROJETOS
                </button>
              </div>
            </div>
            {mode == 'process-tracking' ? <ProcessTrackingPage session={session} /> : null}
          </>
        ) : null}
      </div>
    </div>
  )
}

export default OperationFollowUp
