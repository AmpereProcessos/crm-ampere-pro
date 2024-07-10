import DateInput from '@/components/Inputs/DateInput'
import { Sidebar } from '@/components/Sidebar'
import ErrorComponent from '@/components/utils/ErrorComponent'
import LoadingComponent from '@/components/utils/LoadingComponent'
import { getPeriodDateParamsByReferenceDate } from '@/lib/methods/dates'
import { formatDateInputChange, formatDecimalPlaces } from '@/lib/methods/formatting'
import { formatDateForInput } from '@/utils/methods'
import { ProcessTrackedByProjectType } from '@/utils/process-tracking'
import { useProcessTrackingStats } from '@/utils/queries/stats/operation/process-tracking'
import { Session } from 'next-auth'
import React, { useState } from 'react'
import { BsCheckCircle } from 'react-icons/bs'
import { MdOutlineTimer } from 'react-icons/md'
import { TbProgress } from 'react-icons/tb'

const currentDate = new Date()
const { start, end } = getPeriodDateParamsByReferenceDate({ reference: currentDate, resetStart: true })

type ProcessTrackingPageProps = {
  session: Session
}
function ProcessTrackingPage({ session }: ProcessTrackingPageProps) {
  const [projectType, setProjectType] = useState<string>('SISTEMA FOTOVOLTAICO')
  const [period, setPeriod] = useState<{ after: string; before: string }>({ after: start.toISOString(), before: end.toISOString() })

  const { data: stats, isLoading, isError, isSuccess } = useProcessTrackingStats({ after: period.after, before: period.before, projectType })

  return (
    <div className="flex w-full grow flex-col">
      {isLoading ? <LoadingComponent /> : null}
      {isError ? <ErrorComponent msg="Oops, houve um erro ao buscar resultados." /> : null}
      {isSuccess ? (
        <>
          <div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
            <div className="flex grow items-center gap-2">
              <h1 className="py-6 text-center text-lg font-black leading-4 tracking-tighter">PROCESSOS</h1>
              {Object.keys(ProcessTrackedByProjectType).map((type, index) => (
                <button
                  key={index}
                  data-type-selected={projectType == type ? 'true' : 'false'}
                  onClick={() => setProjectType(type)}
                  className="rounded-lg border border-blue-800 px-3 py-2 text-[0.65rem] font-bold text-blue-800 duration-300 ease-out data-[type-selected=true]:bg-blue-800 data-[type-selected=true]:text-white"
                >
                  {type}
                </button>
              ))}
            </div>

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

          <div className="flex w-full flex-col gap-6">
            {Object.entries(stats).map(([category, processes], index) => (
              <div key={index} className="flex w-full flex-col rounded border border-blue-800">
                <h1 className="rounded-bl-0 rounded-br-0 w-full rounded bg-blue-800 p-2 text-center text-sm font-bold text-white">{category}</h1>
                <div className="flex w-full flex-wrap items-center justify-around gap-6 bg-[#fff] p-6">
                  {Object.entries(processes).map(([process, metrics], processIndex) => (
                    <div key={processIndex} className="flex w-[400px] flex-col gap-4 rounded-lg border border-gray-500 bg-[#fff] p-1 shadow-sm">
                      <div className="flex w-full items-center justify-center rounded-lg rounded-bl-none rounded-br-none border-b border-gray-500 p-1">
                        <h2 className="text-center text-xs font-bold leading-6 tracking-tighter text-black">{process}</h2>
                      </div>
                      <div className="flex w-full grow flex-col gap-2 p-3">
                        <div className="flex w-full justify-between gap-2">
                          <div className="flex items-center justify-start gap-1">
                            <TbProgress size={16} />
                            <h3 className="text-xs tracking-tight text-gray-500">EM ANDAMENTO</h3>
                          </div>
                          <h1 className="text-center font-bold">{metrics.andamento}</h1>
                        </div>
                        <div className="flex w-full justify-between gap-2">
                          <div className="flex items-center justify-center gap-1">
                            <BsCheckCircle size={16} />
                            <h3 className="text-xs tracking-tight text-gray-500">CONCLUÍDOS NO PERÍODO</h3>
                          </div>
                          <h1 className="text-center font-bold">{metrics.concluidos}</h1>
                        </div>
                        <div className="flex w-full justify-between gap-2">
                          <div className="flex items-center justify-center gap-1">
                            <MdOutlineTimer size={18} />
                            <h3 className="text-xs tracking-tight text-gray-500">TEMPO MÉDIO</h3>
                          </div>
                          <h1 className="text-center font-bold">{formatDecimalPlaces(metrics.tempoTotalConclusao / metrics.concluidos / 24)} dias</h1>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default ProcessTrackingPage
