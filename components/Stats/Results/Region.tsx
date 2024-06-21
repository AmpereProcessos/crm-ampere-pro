import { formatToMoney } from '@/utils/methods'
import { useResultsByRegion } from '@/utils/queries/stats/region'
import React from 'react'

type RegionResultsProps = {
  after: string
  before: string
  responsibles: string[] | null
  partners: string[] | null
  projectTypes: string[] | null
}
function RegionResults({ after, before, responsibles, partners, projectTypes }: RegionResultsProps) {
  const { data: stats } = useResultsByRegion({ after, before, responsibles, partners, projectTypes })

  return (
    <div className="flex w-full flex-col">
      <h1 className="mt-4 rounded-md bg-[#15599a] text-center text-xl font-black text-white">RESULTADOS POR REGIÃO</h1>
      <div className="flex w-full flex-col gap-2 rounded-xl border border-gray-200 bg-[#fff] p-6 shadow-sm">
        <div className="flex w-full items-center gap-2">
          <div className="flex w-1/5 items-center justify-center">
            <h1 className="font-black text-cyan-500">CIDADE</h1>
          </div>
          <div className="flex w-1/5 items-center justify-center">
            <h1 className="font-black text-cyan-500">OPORTUNIDADES CRIADAS</h1>
          </div>
          <div className="flex w-1/5 items-center justify-center">
            <h1 className="font-black text-cyan-500">OPORTUNIDADES GANHAS</h1>
          </div>
          <div className="flex w-1/5 items-center justify-center">
            <h1 className="font-black text-cyan-500">OPORTUNIDADES PERDIDAS</h1>
          </div>
          <div className="flex w-1/5 items-center justify-center">
            <h1 className="font-black text-cyan-500">VALOR VENDIDO</h1>
          </div>
        </div>
        <div className="flex max-h-[700px] w-full flex-col gap-2 overflow-y-auto overscroll-y-auto px-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
          {stats?.map((stat, index) => (
            <div key={index} className="flex w-full items-center gap-2 rounded border border-gray-300 p-2">
              <div className="flex w-1/5 items-center justify-center">
                <h1 className="text-sm font-black text-gray-500">{stat.CIDADE}</h1>
              </div>
              <div className="flex w-1/5 flex-col items-center justify-center">
                <h1 className="text-sm font-black text-gray-500">{stat['OPORTUNIDADES CRIADAS'].INBOUND + stat['OPORTUNIDADES CRIADAS'].OUTBOUND}</h1>
                <div className="flex w-full items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <h1 className="text-[0.6rem] font-light">INBOUND</h1>
                    <h1 className="text-[0.6rem] font-medium">{stat['OPORTUNIDADES CRIADAS'].INBOUND}</h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <h1 className="text-[0.6rem] font-light">OUTBOUND</h1>
                    <h1 className="text-[0.6rem] font-medium">{stat['OPORTUNIDADES CRIADAS'].OUTBOUND}</h1>
                  </div>
                </div>
              </div>
              <div className="flex w-1/5 flex-col items-center justify-center">
                <h1 className="text-sm font-black text-gray-500">{stat['OPORTUNIDADES GANHAS'].INBOUND + stat['OPORTUNIDADES GANHAS'].OUTBOUND}</h1>
                <div className="flex w-full items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <h1 className="text-[0.6rem] font-light">INBOUND</h1>
                    <h1 className="text-[0.6rem] font-medium">{stat['OPORTUNIDADES GANHAS'].INBOUND}</h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <h1 className="text-[0.6rem] font-light">OUTBOUND</h1>
                    <h1 className="text-[0.6rem] font-medium">{stat['OPORTUNIDADES GANHAS'].OUTBOUND}</h1>
                  </div>
                </div>
              </div>
              <div className="flex w-1/5 flex-col items-center justify-center">
                <h1 className="text-sm font-black text-gray-500">{stat['OPORTUNIDADES PERDIDAS'].INBOUND + stat['OPORTUNIDADES PERDIDAS'].OUTBOUND}</h1>
                <div className="flex w-full items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <h1 className="text-[0.6rem] font-light">INBOUND</h1>
                    <h1 className="text-[0.6rem] font-medium">{stat['OPORTUNIDADES PERDIDAS'].INBOUND}</h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <h1 className="text-[0.6rem] font-light">OUTBOUND</h1>
                    <h1 className="text-[0.6rem] font-medium">{stat['OPORTUNIDADES PERDIDAS'].OUTBOUND}</h1>
                  </div>
                </div>
              </div>
              <div className="flex w-1/5 flex-col items-center justify-center">
                <h1 className="text-sm font-black text-gray-500">{formatToMoney(stat['VALOR VENDIDO'].INBOUND + stat['VALOR VENDIDO'].OUTBOUND)}</h1>
                <div className="flex w-full items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <h1 className="text-[0.6rem] font-light">INBOUND</h1>
                    <h1 className="text-[0.6rem] font-medium">{formatToMoney(stat['VALOR VENDIDO'].INBOUND)}</h1>
                  </div>
                  <div className="flex items-center gap-1">
                    <h1 className="text-[0.6rem] font-light">OUTBOUND</h1>
                    <h1 className="text-[0.6rem] font-medium">{formatToMoney(stat['VALOR VENDIDO'].OUTBOUND)}</h1>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RegionResults
