import DateInput from '@/components/Inputs/DateInput'
import { Sidebar } from '@/components/Sidebar'
import ErrorComponent from '@/components/utils/ErrorComponent'
import LoadingComponent from '@/components/utils/LoadingComponent'
import LoadingPage from '@/components/utils/LoadingPage'
import { getPeriodDateParamsByReferenceDate } from '@/lib/methods/dates'
import { formatDateInputChange, formatDecimalPlaces, formatToMoney } from '@/lib/methods/formatting'
import { formatDateForInput } from '@/utils/methods'
import { useOperationGeneralViewStats } from '@/utils/queries/stats/operation/operation-general-view'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { BsCart, BsFileEarmarkText, BsJournal, BsPatchCheck, BsTruck } from 'react-icons/bs'
import { FaBolt, FaTools } from 'react-icons/fa'
import { FaRegHourglassHalf } from 'react-icons/fa6'
import { VscDebugStart, VscDiffAdded } from 'react-icons/vsc'

const currentDate = new Date()
const { start, end } = getPeriodDateParamsByReferenceDate({ reference: currentDate, resetStart: true })

function GeneralOperationalDashboard() {
  const { data: session, status } = useSession({ required: true })
  const [period, setPeriod] = useState<{ after: string; before: string }>({ after: start.toISOString(), before: end.toISOString() })
  const { data: stats, isLoading, isError, isSuccess } = useOperationGeneralViewStats({ after: period.after, before: period.before })
  if (status != 'authenticated') return <LoadingPage />
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
        <div className="flex w-full flex-col items-center justify-between gap-4 border-b border-black pb-2 lg:flex-row lg:items-end">
          <h1 className="text-center font-Raleway text-xl font-black text-black lg:text-start lg:text-2xl">ACOMPANHAMENTO DE RESULTADOS</h1>
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
        {isSuccess ? (
          <>
            <h1 className="mt-4 rounded-md bg-[#15599a] text-center text-xl font-black text-white">MÉTRICAS GERAIS</h1>
            <div className="mt-2 flex w-full flex-col items-center justify-around gap-2 lg:flex-row">
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:w-1/5">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">PROJETOS VENDIDOS</h1>
                  <VscDiffAdded />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{stats.projetosVendidos}</div>
                </div>
              </div>
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:w-1/5">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">TOTAL VENDIDO</h1>
                  <BsFileEarmarkText />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{stats?.valorVendido ? formatToMoney(stats?.valorVendido) : 0}</div>
                </div>
              </div>
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:w-1/5">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">POTÊNCIA VENDIDA</h1>
                  <FaBolt />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{stats?.potenciaVendida ? formatDecimalPlaces(stats?.potenciaVendida) : 0} kWp</div>
                </div>
              </div>
            </div>
            <h1 className="mt-4 rounded-md bg-[#15599a] text-center text-xl font-black text-white">MÉTRICAS OPERACIONAIS</h1>
            <div className="mt-2 flex w-full flex-col items-center justify-around gap-2 lg:flex-row">
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:w-1/6">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">CONTRATOS ELABORADOS</h1>
                  <BsJournal />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{stats.contratosElaborados.qtde}</div>
                  <div className="flex items-center gap-1">
                    <FaRegHourglassHalf color="rgb(249,115,22)" />
                    <h1 className="text-xs font-normal text-gray-500">{formatDecimalPlaces(stats.contratosElaborados.tempoMedio)} horas (em média)</h1>
                  </div>
                </div>
              </div>
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:w-1/6">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">HOMOLOGAÇÕES</h1>
                  <BsPatchCheck />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{stats.homologacoes.qtde}</div>
                  <div className="flex items-center gap-1">
                    <FaRegHourglassHalf color="rgb(249,115,22)" />
                    <h1 className="text-xs font-normal text-gray-500">{formatDecimalPlaces(stats.homologacoes.tempoMedio)} horas (em média)</h1>
                  </div>
                </div>
              </div>
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:w-1/6">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">LIBERAÇÕES PARA COMPRA</h1>
                  <VscDebugStart />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{stats.liberacaoCompras.qtde}</div>
                  <div className="flex items-center gap-1">
                    <FaRegHourglassHalf color="rgb(249,115,22)" />
                    <h1 className="text-xs font-normal text-gray-500">{formatDecimalPlaces(stats.liberacaoCompras.tempoMedio)} horas (em média)</h1>
                  </div>
                </div>
              </div>
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:w-1/6">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">PEDIDOS</h1>
                  <BsCart />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{stats.pedidos.qtde}</div>
                  <div className="flex items-center gap-1">
                    <FaRegHourglassHalf color="rgb(249,115,22)" />
                    <h1 className="text-xs font-normal text-gray-500">{formatDecimalPlaces(stats.pedidos.tempoMedio)} horas (em média)</h1>
                  </div>
                </div>
              </div>
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:w-1/6">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">ENTREGAS</h1>
                  <BsTruck />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{stats.entregas.qtde}</div>
                  <div className="flex items-center gap-1">
                    <FaRegHourglassHalf color="rgb(249,115,22)" />
                    <h1 className="text-xs font-normal text-gray-500">{formatDecimalPlaces(stats.entregas.tempoMedio)} horas (em média)</h1>
                  </div>
                </div>
              </div>
              <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:w-1/6">
                <div className="flex items-center justify-between">
                  <h1 className="text-sm font-medium uppercase tracking-tight">EXECUÇÕES</h1>
                  <FaTools />
                </div>
                <div className="mt-2 flex w-full flex-col">
                  <div className="text-2xl font-bold text-[#15599a]">{stats.execucao.qtde}</div>
                  <div className="flex items-center gap-1">
                    <FaRegHourglassHalf color="rgb(249,115,22)" />
                    <h1 className="text-xs font-normal text-gray-500">{formatDecimalPlaces(stats.execucao.tempoMedio)} horas (em média)</h1>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default GeneralOperationalDashboard
