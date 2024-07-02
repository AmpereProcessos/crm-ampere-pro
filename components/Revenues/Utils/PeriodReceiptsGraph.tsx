import { TRevenueStatsResults } from '@/pages/api/stats/finances/revenues'
import React from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type PeriodReceiptsGraphProps = {
  dailyData: TRevenueStatsResults['diario']
}
function PeriodReceiptsGraph({ dailyData }: PeriodReceiptsGraphProps) {
  const graphData = dailyData.map((d) => ({ DIA: d.dia, EFETIVO: d.efetivo, PREVISTO: d.previsto }))
  return (
    <div className="flex w-full flex-col gap-3">
      <h1 className="text-sm font-medium tracking-tight">PROGRESSÃO</h1>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart width={730} height={300} data={graphData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis dataKey="DIA" fontSize={10} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="EFETIVO" label="EFETIVO" stackId={'a'} fill="#000" />
            <Bar dataKey="PREVISTO" label="PREVISTO" stackId={'a'} fill="rgb(107,114,128)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PeriodReceiptsGraph
