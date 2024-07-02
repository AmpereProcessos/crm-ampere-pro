import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import DateInput from '../Inputs/DateInput'
import { formatDateForInput, getFirstDayOfYear, getLastDayOfYear } from '@/utils/methods'
import { Session } from 'next-auth'
import { TPartnerSimplifiedDTO } from '@/utils/schemas/partner.schema'
import { useRevenueStats } from '@/utils/queries/stats/revenues'
import { VscChromeClose } from 'react-icons/vsc'
import { formatDateInputChange, formatToMoney } from '@/lib/methods/formatting'
import LoadingComponent from '../utils/LoadingComponent'
import ErrorComponent from '../utils/ErrorComponent'
import { TbAlertTriangle, TbSum } from 'react-icons/tb'
import { BsCalendarEvent, BsPatchCheck } from 'react-icons/bs'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import dayjs from 'dayjs'
import { getPeriodDateParamsByReferenceDate } from '@/lib/methods/dates'
import PeriodReceiptsGraph from './Utils/PeriodReceiptsGraph'

const currentDate = new Date().toISOString()

const periodParams = getPeriodDateParamsByReferenceDate({ reference: currentDate })
const firstDayOfMonth = periodParams.start.toISOString()
const lastDayOfMonth = periodParams.end.toISOString()
type RevenueStatsProps = {
  session: Session
  partnerOptions: TPartnerSimplifiedDTO[]
  closeMenu: () => void
}
function RevenueStats({ session, partnerOptions, closeMenu }: RevenueStatsProps) {
  const userPartnerScope = session.user.permissoes.parceiros.escopo
  const [partners, setParners] = useState<string[] | null>(userPartnerScope || null)
  const [projectTypes, setProjectTypes] = useState(null)
  const [period, setPeriod] = useState<{ after: string; before: string }>({ after: firstDayOfMonth, before: lastDayOfMonth })

  console.log(period)
  const { data: stats, isLoading, isError, isSuccess } = useRevenueStats({ after: period.after, before: period.before, partners, projectTypes })
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
            <h1 className="text-sm font-bold tracking-tight">ESTÁTISTICAS DE RECEITAS</h1>
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
                    after: formatDateInputChange(value) || firstDayOfMonth,
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
                    before: formatDateInputChange(value) || lastDayOfMonth,
                  }))
                }
                width="100%"
              />
            </div>
          </div>
        </div>
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg="Erro ao buscar estatísticas de receitas." /> : null}
        {isSuccess ? (
          <div className="flex w-full flex-col gap-2">
            <div className="my-2 flex w-full flex-col items-center justify-center gap-3 lg:flex-row">
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-3 shadow-sm lg:w-1/4">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">TOTAL</h1>
                  <TbSum />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{formatToMoney(stats.total)}</div>
                </div>
              </div>
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-3 shadow-sm lg:w-1/4">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">TOTAL RECEBIDO</h1>
                  <BsPatchCheck />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{formatToMoney(stats.totalRecebido)}</div>
                </div>
              </div>
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-3 shadow-sm lg:w-1/4">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">TOTAL A RECEBER</h1>
                  <BsCalendarEvent />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{formatToMoney(stats.totalAReceber)}</div>
                </div>
                <p className="text-sm tracking-tight">{formatToMoney(stats.totalAReceberHoje)} para hoje</p>
              </div>
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-3 shadow-sm lg:w-1/4">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">TOTAL EM ATRASO</h1>
                  <TbAlertTriangle />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{formatToMoney(stats.totalAReceberEmAtraso)}</div>
                </div>
              </div>
            </div>
            <div className="my-2 flex w-full flex-col gap-3">
              <PeriodReceiptsGraph dailyData={stats.diario} />
            </div>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  )
}

export default RevenueStats
