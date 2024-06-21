import DateInput from '@/components/Inputs/DateInput'
import { Sidebar } from '@/components/Sidebar'
import { formatDateInputChange, formatToMoney } from '@/lib/methods/formatting'
import { formatDate, getFirstDayOfMonth, getLastDayOfMonth } from '@/utils/methods'
import { usePartnersSimplified } from '@/utils/queries/partners'
import { useOpportunityCreators } from '@/utils/queries/users'
import { Session } from 'next-auth'
import Link from 'next/link'
import React, { useState } from 'react'
import { AiOutlineCloseCircle, AiOutlineTeam } from 'react-icons/ai'
import { BsFileEarmarkText, BsPatchCheck, BsTicketPerforated } from 'react-icons/bs'
import { VscDiffAdded } from 'react-icons/vsc'
import PendingWinsBlock from './PendingWinsBlock'
import WinsBlock from './WinsBlock'
import PPSOpenCallsBlock from './PPSOpenCallsBlock'
import OpenActivitiesBlock from './OpenActivitiesBlock'
import MultipleSelectInput from '@/components/Inputs/MultipleSelectInput'
import { useStats, useStatsQueryOptions } from '@/utils/queries/stats'

const currentDate = new Date()
const firstDayOfMonth = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()).toISOString()
const lastDayOfMonth = getLastDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()).toISOString()

type TQueryFilters = {
  period: { after: string; before: string }
  responsibles: string[] | null
  partners: string[] | null
  projectTypes: string[] | null
}

type MainDashboardPageProps = {
  session: Session
}
function MainDashboardPage({ session }: MainDashboardPageProps) {
  const userOpportunitiesScope = session.user.permissoes.oportunidades.escopo || null
  const userPartnersScope = session.user.permissoes.parceiros.escopo || null

  const [queryFilters, setQueryFilters] = useState<TQueryFilters>({
    period: { after: firstDayOfMonth, before: lastDayOfMonth },
    responsibles: userOpportunitiesScope,
    partners: userPartnersScope,
    projectTypes: null,
  })
  const { data: queryOptions } = useStatsQueryOptions()
  const { data, isLoading, isSuccess, isError, error } = useStats({
    after: queryFilters.period.after,
    before: queryFilters.period.before,
    partners: queryFilters.partners,
    responsibles: queryFilters.responsibles,
    projectTypes: queryFilters.projectTypes,
  })

  const responsiblesSelectableOptions = queryOptions?.responsibles
    ? userOpportunitiesScope
      ? queryOptions.responsibles.filter((a) => userOpportunitiesScope.includes(a._id))
      : queryOptions.responsibles
    : []
  const partnersSelectableOptions = queryOptions?.partners
    ? userPartnersScope
      ? queryOptions?.partners.filter((a) => userPartnersScope.includes(a._id))
      : queryOptions?.partners
    : []
  console.log(session)
  console.log(queryFilters)
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
        <div className="flex w-full flex-col items-center justify-between border-b border-black pb-2 lg:flex-row">
          <h1 className="font-Raleway text-2xl font-black text-black">DASHBOARD</h1>
          {session?.user.permissoes.resultados?.visualizarComercial ? (
            <Link href="/comercial/gestao/resultados">
              <div className="flex items-center gap-1 font-bold tracking-tight text-gray-500 duration-300 ease-in-out hover:text-cyan-500">
                <p className="text-sm">ACOMPANHAMENTO DE RESULTADOS</p>
                <AiOutlineTeam />
              </div>
            </Link>
          ) : null}
        </div>
        <div className="flex grow flex-col py-2">
          <div className="flex w-full flex-col items-end justify-end gap-2 lg:flex-row">
            <div className="w-full lg:w-[300px]">
              <MultipleSelectInput
                selectedItemLabel="TODOS OS USUÁRIOS"
                selected={queryFilters.responsibles}
                options={responsiblesSelectableOptions?.map((resp) => ({ id: resp._id || '', label: resp.nome || '', value: resp._id || '' })) || []}
                handleChange={(value) => setQueryFilters((prev) => ({ ...prev, responsibles: value as string[] }))}
                onReset={() => setQueryFilters((prev) => ({ ...prev, responsibles: userOpportunitiesScope }))}
                showLabel={false}
                label="USUÁRIOS"
                width="100%"
              />
            </div>
            <div className="w-full lg:w-[300px]">
              <MultipleSelectInput
                selectedItemLabel="TODOS OS PARCEIROS"
                selected={queryFilters.partners}
                options={partnersSelectableOptions?.map((resp) => ({ id: resp._id || '', label: resp.nome || '', value: resp._id || '' })) || []}
                handleChange={(value) => setQueryFilters((prev) => ({ ...prev, partners: value as string[] }))}
                onReset={() => setQueryFilters((prev) => ({ ...prev, partners: userPartnersScope }))}
                showLabel={false}
                label="USUÁRIOS"
                width="100%"
              />
            </div>
            <div className="w-full lg:w-[300px]">
              <MultipleSelectInput
                selectedItemLabel="TODOS OS PROJETOS"
                selected={queryFilters.projectTypes}
                options={queryOptions?.projectTypes?.map((resp) => ({ id: resp._id || '', label: resp.nome || '', value: resp._id || '' })) || null}
                handleChange={(value) => setQueryFilters((prev) => ({ ...prev, projectTypes: value as string[] }))}
                onReset={() => setQueryFilters((prev) => ({ ...prev, projectTypes: null }))}
                showLabel={false}
                label="USUÁRIOS"
                width="100%"
              />
            </div>

            <div className="flex w-full flex-col lg:w-fit">
              <h1 className="text-end text-sm font-medium uppercase tracking-tight">PERÍODO</h1>
              <div className="flex flex-col items-center gap-2 lg:flex-row">
                <div className="w-full lg:w-[150px]">
                  <DateInput
                    showLabel={false}
                    label="PERÍODO"
                    value={formatDate(queryFilters.period.after)}
                    handleChange={(value) =>
                      setQueryFilters((prev) => ({
                        ...prev,
                        period: {
                          ...prev.period,
                          after: formatDateInputChange(value) || firstDayOfMonth,
                        },
                      }))
                    }
                    width="100%"
                  />
                </div>
                <div className="w-full lg:w-[150px]">
                  <DateInput
                    showLabel={false}
                    label="PERÍODO"
                    value={formatDate(queryFilters.period.before)}
                    handleChange={(value) =>
                      setQueryFilters((prev) => ({
                        ...prev,
                        period: {
                          ...prev.period,
                          before: formatDateInputChange(value) || lastDayOfMonth,
                        },
                      }))
                    }
                    width="100%"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 flex w-full flex-col items-center justify-around gap-2 lg:flex-row">
            <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:w-1/5">
              <div className="flex items-center justify-between">
                <h1 className="text-sm font-medium uppercase tracking-tight">Projetos Criados</h1>
                <VscDiffAdded />
              </div>
              <div className="mt-2 flex w-full flex-col">
                <div className="text-2xl font-bold text-[#15599a]">{data?.simplificado.ATUAL.projetosCriados || 0}</div>
                <p className="text-xs text-gray-500">{data?.simplificado.ANTERIOR.projetosCriados || 0} no último período</p>
              </div>
            </div>
            <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:w-1/5">
              <div className="flex items-center justify-between">
                <h1 className="text-sm font-medium uppercase tracking-tight">Projetos Ganhos</h1>
                <BsPatchCheck />
              </div>
              <div className="mt-2 flex w-full flex-col">
                <div className="text-2xl font-bold text-[#15599a]">{data?.simplificado.ATUAL.projetosGanhos || 0}</div>
                <p className="text-xs text-gray-500">{data?.simplificado.ANTERIOR.projetosGanhos || 0} no último período</p>
              </div>
            </div>
            <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:w-1/5">
              <div className="flex items-center justify-between">
                <h1 className="text-sm font-medium uppercase tracking-tight">Projetos Perdidos</h1>
                <AiOutlineCloseCircle size={'20px'} />
              </div>
              <div className="mt-2 flex w-full flex-col">
                <div className="text-2xl font-bold text-[#15599a]">{data?.simplificado.ATUAL.projetosPerdidos || 0}</div>
                <p className="text-xs text-gray-500">{data?.simplificado.ANTERIOR.projetosPerdidos || 0} no último período</p>
              </div>
            </div>
            <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:w-1/5">
              <div className="flex items-center justify-between">
                <h1 className="text-sm font-medium uppercase tracking-tight">Total Vendido</h1>
                <BsFileEarmarkText />
              </div>
              <div className="mt-2 flex w-full flex-col">
                <div className="text-2xl font-bold text-[#15599a]">
                  {data?.simplificado.ATUAL.totalVendido ? formatToMoney(data.simplificado.ATUAL.totalVendido) : 0}
                </div>
                <p className="text-xs text-gray-500">
                  {data?.simplificado.ANTERIOR.totalVendido ? formatToMoney(data.simplificado.ANTERIOR.totalVendido) : 0} no último período
                </p>
              </div>
            </div>
            <div className="flex min-h-[110px] w-full flex-col rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm lg:w-1/5">
              <div className="flex items-center justify-between">
                <h1 className="text-sm font-medium uppercase tracking-tight">Ticket Médio</h1>
                <BsTicketPerforated />
              </div>
              <div className="mt-2 flex w-full flex-col">
                <div className="text-2xl font-bold text-[#15599a]">
                  {data?.simplificado.ATUAL.totalVendido ? formatToMoney(data.simplificado.ATUAL.totalVendido / data.simplificado.ATUAL.projetosGanhos) : 0}
                </div>
                <p className="text-xs text-gray-500">
                  {data?.simplificado.ANTERIOR.totalVendido
                    ? formatToMoney(data.simplificado.ANTERIOR.totalVendido / data.simplificado.ANTERIOR.projetosGanhos)
                    : 0}{' '}
                  no último período
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex w-full flex-col items-center justify-around gap-2 lg:flex-row">
            <div className="w-full lg:w-[40%]">
              <PendingWinsBlock data={data?.ganhosPendentes || []} session={session} />
            </div>
            <div className="w-full lg:w-[60%]">
              <WinsBlock data={data?.ganhos || []} session={session} />
            </div>
          </div>
          <div className="mt-4 flex w-full flex-col items-center gap-2 lg:flex-row">
            <div className="w-full lg:w-[50%]">
              <PPSOpenCallsBlock session={session} />
            </div>
            <div className="w-full lg:w-[50%]">
              <OpenActivitiesBlock session={session} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainDashboardPage
