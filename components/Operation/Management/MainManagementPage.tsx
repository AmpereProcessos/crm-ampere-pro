import { Sidebar } from '@/components/Sidebar'
import { Session } from 'next-auth'
import React, { useState } from 'react'
import ProcessTrackingPage from './ProcessTrackingPage'
import ProjectsFollowUpPage from './ProjectsFollowUpPage'
import { getPeriodDateParamsByReferenceDate } from '@/lib/methods/dates'
import { after, before } from 'lodash'
import { useOperationGeneralStats } from '@/utils/queries/stats/operation/general'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, Label, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import GeneralStats from './GeneralStats'

const currentDate = new Date()
const { start, end } = getPeriodDateParamsByReferenceDate({ reference: currentDate, type: 'year', resetStart: true })

type MainManagementPageProps = {
  session: Session
}
function MainManagementPage({ session }: MainManagementPageProps) {
  const [mode, setMode] = useState<'process-tracking' | 'projects-follow-up'>('process-tracking')

  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow flex-col gap-2 overflow-x-hidden bg-[#f8f9fa] p-6">
        <div className="flex w-full flex-col items-center justify-between gap-4 border-b border-black pb-2 lg:flex-row lg:items-end">
          <h1 className="text-center font-Raleway text-xl font-black text-black lg:text-start lg:text-2xl">ACOMPANHAMENTO OPERACIONAL</h1>
          <div className="flex h-9 items-center gap-2 rounded-lg bg-gray-300 px-1 py-2 lg:px-3">
            <button
              onClick={() => setMode('process-tracking')}
              className={`${
                mode == 'process-tracking' ? 'bg-white text-black shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-200'
              } whitespace-nowrap rounded-md px-3 py-2 text-[0.57rem] font-medium leading-none tracking-tight lg:text-sm`}
            >
              VISUALIZAÇÃO DE PROCESSOS
            </button>
            <button
              onClick={() => setMode('projects-follow-up')}
              className={`${
                mode == 'projects-follow-up' ? 'bg-white text-black shadow-sm' : 'bg-transparent text-gray-500 hover:bg-gray-200'
              } whitespace-nowrap rounded-md px-3 py-2 text-[0.57rem] font-medium leading-none tracking-tight shadow-sm lg:text-sm`}
            >
              FOLLOW UP DE PROJETOS
            </button>
          </div>
        </div>
        <GeneralStats />
        <>
          {mode == 'process-tracking' ? <ProcessTrackingPage session={session} /> : null}
          {mode == 'projects-follow-up' ? <ProjectsFollowUpPage session={session} /> : null}
        </>
      </div>
    </div>
  )
}

export default MainManagementPage
