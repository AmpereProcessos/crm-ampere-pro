import DateInput from '@/components/Inputs/DateInput'
import { Sidebar } from '@/components/Sidebar'
import ErrorComponent from '@/components/utils/ErrorComponent'
import LoadingComponent from '@/components/utils/LoadingComponent'
import { getPeriodDateParamsByReferenceDate } from '@/lib/methods/dates'
import { formatDateInputChange } from '@/lib/methods/formatting'
import { formatDateForInput } from '@/utils/methods'
import { useProcessTrackingStats } from '@/utils/queries/stats/operation/process-tracking'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'

const currentDate = new Date()
const { start, end } = getPeriodDateParamsByReferenceDate({ reference: currentDate, resetStart: true })

function OperationFollowUp() {
  const { data: session, status } = useSession({ required: true })
  const [projectType, setProjectType] = useState<string>('SISTEMA FOTOVOLTAICO')
  const [period, setPeriod] = useState<{ after: string; before: string }>({ after: start.toISOString(), before: end.toISOString() })

  const { data: stats, isLoading, isError, isSuccess } = useProcessTrackingStats({ after: period.after, before: period.before, projectType })
  if (status != 'authenticated') return <LoadingComponent />
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
        <div className="flex w-full flex-col items-center justify-between gap-4 border-b border-black pb-2 lg:flex-row lg:items-end">
          <h1 className="text-center font-Raleway text-xl font-black text-black lg:text-start lg:text-2xl">ACOMPANHAMENTO DE OPERAÇÃO</h1>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-4 lg:flex-row">
              <h1 className="text-end text-sm font-medium uppercase tracking-tight">PERÍODO</h1>
              <div className="flex w-full flex-col items-center gap-2 md:flex-row lg:w-fit">
                <div className="w-full md:w-[150px]">
                  <DateInput
                    showLabel={false}
                    label="PERÍODO"
                    value={formatDateForInput(period.after)}
                    handleChange={(value) =>
                      setPeriod((prev) => ({
                        ...prev,
                        after: formatDateInputChange(value) || start.toISOString(),
                      }))
                    }
                    width="100%"
                  />
                </div>
                <div className="w-full md:w-[150px]">
                  <DateInput
                    showLabel={false}
                    label="PERÍODO"
                    value={formatDateForInput(period.before)}
                    handleChange={(value) =>
                      setPeriod((prev) => ({
                        ...prev,
                        before: formatDateInputChange(value) || end.toISOString(),
                      }))
                    }
                    width="100%"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg="Oops, houve um erro ao buscar resultados." /> : null}
        {isSuccess ? <></> : null}
      </div>
    </div>
  )
}

export default OperationFollowUp
