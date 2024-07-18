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
}
function RevenueStats({ session, partnerOptions }: RevenueStatsProps) {
  const userPartnerScope = session.user.permissoes.parceiros.escopo
  const [partners, setParners] = useState<string[] | null>(userPartnerScope || null)
  const [projectTypes, setProjectTypes] = useState(null)
  const [period, setPeriod] = useState<{ after: string; before: string }>({ after: firstDayOfMonth, before: lastDayOfMonth })

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
            <div className="flex w-full grow flex-col items-center justify-around gap-3 lg:flex-row">
              <div className="flex min-h-[60px] w-full items-start justify-between gap-2 rounded border border-gray-500 p-2 lg:w-1/4">
                <div className="flex items-center gap-1">
                  <TbSum color="#1f2937" />
                  <h1 className="text-xs font-medium uppercase tracking-tight">TOTAL FATURADO</h1>
                </div>
                <h1 className="text-xs font-medium uppercase tracking-tight">{formatToMoney(stats.total)}</h1>
              </div>
              <div className="flex min-h-[60px] w-full items-start justify-between gap-2 rounded border border-gray-500 p-2 lg:w-1/4">
                <div className="flex items-center gap-1">
                  <BsPatchCheck color="#16a34a" />
                  <h1 className="text-xs font-medium uppercase tracking-tight">TOTAL RECEBIDO</h1>
                </div>
                <h1 className="text-xs font-medium uppercase tracking-tight">{formatToMoney(stats.totalRecebido)}</h1>
              </div>
              <div className="flex min-h-[60px] w-full items-start justify-between gap-2 rounded border border-gray-500 p-2 lg:w-1/4">
                <div className="flex items-center gap-1">
                  <BsCalendarEvent color="#ca8a04" />
                  <h1 className="text-xs font-medium uppercase tracking-tight">TOTAL A RECEBER</h1>
                </div>
                <div className="flex flex-col items-end">
                  <h1 className="text-xs font-medium uppercase tracking-tight">{formatToMoney(stats.totalAReceber)}</h1>
                  <h1 className="text-[0.6rem]  uppercase tracking-tight">{formatToMoney(stats.totalAReceberHoje)} para hoje</h1>
                </div>
              </div>
              <div className="flex min-h-[60px] w-full items-start justify-between gap-2 rounded border border-gray-500 p-2 lg:w-1/4">
                <div className="flex items-center gap-1">
                  <TbAlertTriangle color="#dc2626" />
                  <h1 className="text-xs font-medium uppercase tracking-tight">TOTAL EM ATRASO</h1>
                </div>
                <h1 className="text-xs font-medium uppercase tracking-tight">{formatToMoney(stats.totalAReceberEmAtraso)}</h1>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3">
              <PeriodReceiptsGraph dailyData={stats.diario} />
            </div>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  )
}

export default RevenueStats
