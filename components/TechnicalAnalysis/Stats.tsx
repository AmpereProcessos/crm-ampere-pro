import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants'
import { formatDateForInput, getFirstDayOfYear, getLastDayOfYear } from '@/utils/methods'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import DateInput from '../Inputs/DateInput'
import { formatDateInputChange, formatDecimalPlaces, formatNameAsInitials } from '@/lib/methods/formatting'
import { VscChromeClose, VscDiffAdded } from 'react-icons/vsc'
import { useTechnicalAnalysisStats } from '@/utils/queries/stats/technical-analysis'
import LoadingComponent from '../utils/LoadingComponent'
import ErrorComponent from '../utils/ErrorComponent'
import { BsPatchCheck } from 'react-icons/bs'
import { FaDiamond, FaRegHourglassHalf } from 'react-icons/fa6'
import Avatar from '../utils/Avatar'

const StatusColors = {
  CONCLUIDO: 'bg-green-500',
  'EM ANÁLISE TÉCNICA': 'bg-yellow-500',
  'VISITA IN LOCO': 'bg-blue-500',
  'PENDÊNCIA COMERCIAL': 'bg-cyan-500',
  'PENDÊNCIA OPERACIONAL': 'bg-indigo-500',
  REJEITADA: 'bg-red-300',
  PENDENTE: 'bg-gray-500',
}

const currentDate = new Date().toISOString()

const firstDayOfYear = getFirstDayOfYear(currentDate).toISOString()
const lastDayOfYear = getLastDayOfYear(currentDate).toISOString()

type StatsProps = {
  closeMenu: () => void
}
function Stats({ closeMenu }: StatsProps) {
  const [period, setPeriod] = useState<{ after: string; before: string }>({ after: firstDayOfYear, before: lastDayOfYear })
  const { data: stats, isLoading, isError, isSuccess } = useTechnicalAnalysisStats({ after: period.after, before: period.before })
  return (
    <AnimatePresence>
      <motion.div
        key={'editor'}
        variants={GeneralVisibleHiddenExitMotionVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="mt-2 flex w-full flex-col gap-2 rounded-md border border-gray-300 bg-[#fff] p-2"
      >
        <div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
          <div className="flex items-center gap-2">
            <button
              onClick={() => closeMenu()}
              type="button"
              className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
            <h1 className="text-sm font-bold tracking-tight">ESTÁTISTICAS DE ANÁLISES TÉCNICAS</h1>
          </div>
          <div className="flex w-full flex-col items-center gap-2 md:flex-row lg:w-fit">
            <div className="w-full md:w-[150px]">
              <DateInput
                showLabel={false}
                label="PERÍODO"
                value={formatDateForInput(period.after)}
                handleChange={(value) =>
                  setPeriod((prev) => ({
                    ...prev,
                    after: formatDateInputChange(value) || firstDayOfYear,
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
                    before: formatDateInputChange(value) || lastDayOfYear,
                  }))
                }
                width="100%"
              />
            </div>
          </div>
        </div>
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg="Erro ao buscar análises técnicas." /> : null}
        {isSuccess ? (
          <div className="flex w-full flex-col gap-2">
            <div className="my-2 flex w-full flex-col items-center justify-center gap-3 lg:flex-row">
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-3 shadow-sm lg:w-1/4">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">ANÁLISES SOLICITADAS</h1>
                  <VscDiffAdded />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{stats.created}</div>
                </div>
              </div>
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-3 shadow-sm lg:w-1/4">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">ANÁLISES CONCLUÍDAS</h1>
                  <BsPatchCheck />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{stats.concluded}</div>
                </div>
              </div>
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-3 shadow-sm lg:w-1/4">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">TEMPO MÉDIDO PARA FINALIZAÇÃO</h1>
                  <FaRegHourglassHalf />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{formatDecimalPlaces(stats.avgTimeTillConclusion)} horas</div>
                </div>
              </div>
            </div>
            <div className="flex min-h-[70px] w-full flex-col gap-2 rounded-xl border border-gray-200 bg-[#fff] p-3 shadow-sm lg:flex-row">
              <div className="flex min-w-fit items-center gap-2">
                <FaDiamond />
                <h1 className="text-sm font-medium uppercase tracking-tight">SOLICITAÇÕES POR STATUS</h1>
              </div>
              <div className="mt-2 flex grow flex-wrap items-center justify-around gap-2">
                {stats.byStatus.map((byStatus, index) => (
                  <p key={index} className={`rounded-md px-2 py-1 text-[0.8rem] text-white ${StatusColors[byStatus.status as keyof typeof StatusColors]}`}>
                    {byStatus.status}: <strong>{byStatus.value}</strong>
                  </p>
                ))}
              </div>
            </div>
            <div className="flex min-h-[70px] w-full flex-col gap-2 rounded-xl border border-gray-200 bg-[#fff] p-3 shadow-sm lg:flex-row">
              <div className="flex min-w-fit items-center gap-2">
                <FaDiamond />
                <h1 className="text-sm font-medium uppercase tracking-tight">SOLICITAÇÕES POR TIPO</h1>
              </div>
              <div className="mt-2 flex grow flex-wrap items-center justify-around gap-2">
                {stats.byType.map((byType, index) => (
                  <div key={index} className="flex flex-col rounded-md border border-gray-500 px-2 py-1">
                    <h1 className="text-[0.8rem] text-gray-800">{byType.type}</h1>
                    <div className="flex w-full items-center justify-around gap-2">
                      <div className="flex items-center gap-1">
                        <VscDiffAdded />
                        <h1 className="text-[0.6rem] font-normal text-gray-500">{byType.created} criadas</h1>
                      </div>
                      <div className="flex items-center gap-1">
                        <BsPatchCheck color="rgb(22,163,74)" />
                        <h1 className="text-[0.6rem] font-normal text-gray-500">{byType.concluded} concluídas</h1>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaRegHourglassHalf color="rgb(249,115,22)" />
                        <h1 className="text-[0.6rem] font-normal text-gray-500">{formatDecimalPlaces(byType.avgTimeTillConclusion)} horas</h1>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex min-h-[70px] w-full flex-col gap-2 rounded-xl border border-gray-200 bg-[#fff] p-3 shadow-sm lg:flex-row">
              <div className="flex min-w-fit items-center gap-2">
                <FaDiamond />
                <h1 className="text-sm font-medium uppercase tracking-tight">SOLICITAÇÕES POR REQUERENTE</h1>
              </div>
              <div className="mt-2 flex grow flex-wrap items-center justify-around gap-2">
                {stats.byApplicant.map((byApplicant, index) => (
                  <div key={index} className="flex items-center gap-2 rounded border border-cyan-500 px-2 py-1">
                    <div className="flex items-center gap-1">
                      <Avatar width={20} height={20} url={byApplicant.applicantAvatarUrl || undefined} fallback={formatNameAsInitials(byApplicant.applicant)} />
                      <p className="text-[0.8rem] text-gray-500">{byApplicant.applicant}</p>
                    </div>
                    <p key={index} className="text-[0.8rem] font-black text-gray-500">
                      {byApplicant.analysis}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  )
}

export default Stats
