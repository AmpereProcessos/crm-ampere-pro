import { formatDateAsLocale, formatDecimalPlaces, formatNameAsInitials, formatToMoney } from '@/lib/methods/formatting'
import { TOpportunitySimplifiedDTOWithProposal } from '@/utils/schemas/opportunity.schema'
import Link from 'next/link'
import React from 'react'
import { BsCalendarPlus, BsFillMegaphoneFill } from 'react-icons/bs'
import { FaBolt } from 'react-icons/fa'
import { MdAttachMoney, MdDashboard } from 'react-icons/md'
import Avatar from '../utils/Avatar'

function getBarColor({ isWon, isRequested, isLost }: { isWon: boolean; isRequested: boolean; isLost: boolean }) {
  if (isWon) return 'bg-green-500'
  if (isRequested) return 'bg-orange-400'
  if (isLost) return 'bg-red-500'
  return 'bg-blue-400'
}
type OpportunitiesCardModeProps = {
  opportunity: TOpportunitySimplifiedDTOWithProposal
}
function OpportunityCardMode({ opportunity }: OpportunitiesCardModeProps) {
  const isWon = !!opportunity.ganho.data
  const isRequested = !!opportunity.ganho.dataSolicitacao
  const isLost = !!opportunity.perda.data
  return (
    <div className="relative flex min-h-[110px] w-full flex-col justify-between rounded border border-gray-400 bg-[#fff] shadow-sm">
      <div className={`h-1 w-full rounded-bl-sm rounded-br-sm ${getBarColor({ isWon, isRequested, isLost })}`}></div>
      <div className="flex w-full flex-col p-3">
        {isWon ? (
          <div className="z-8 absolute right-2 top-4 flex items-center justify-center text-green-500">
            <p className="text-sm font-medium italic">GANHO</p>
          </div>
        ) : null}
        <div className="flex w-full flex-col">
          <div className="flex items-center gap-1">
            <h1 className="text-xs font-bold text-[#fead41]">{opportunity.identificador}</h1>
            {opportunity.idMarketing ? <BsFillMegaphoneFill color="#3e53b2" /> : null}
          </div>
          <Link href={`/comercial/oportunidades/id/${opportunity._id}`}>
            <h1 className="font-bold text-[#353432] hover:text-blue-400">{opportunity.nome}</h1>
          </Link>
          <div className="flex items-center gap-1">
            <MdDashboard />
            <h3 className="text-[0.6rem] font-light">{opportunity.tipo.titulo}</h3>
          </div>
        </div>
        <div className="my-2 flex w-full grow flex-col rounded-md border border-gray-300 p-2">
          <h1 className="text-[0.6rem] font-extralight text-gray-500">PROPOSTA ATIVA</h1>
          {opportunity.proposta?.nome ? (
            <div className="flex w-full flex-col justify-between">
              <p className="text-xs font-medium text-cyan-500">{opportunity.proposta.nome}</p>
              <div className="flex  items-center justify-between">
                <div className="flex items-center gap-1">
                  <FaBolt color="rgb(6,182,212)" />
                  <p className="text-xs  text-gray-500">
                    {formatDecimalPlaces(opportunity.proposta.potenciaPico || 0)}
                    kWp
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <MdAttachMoney color="rgb(6,182,212)" />
                  <p className="text-xs  text-gray-500">{formatToMoney(opportunity.proposta.valor)}</p>
                </div>
              </div>
            </div>
          ) : (
            <h1 className="py-2 text-xs font-medium text-gray-500">NENHUMA PROPOSTA ATIVA</h1>
          )}
        </div>
        <div className="mt-2 flex w-full items-center justify-between gap-2">
          <div className="flex grow flex-wrap items-center gap-2">
            {opportunity.responsaveis.map((resp, index) => {
              if (index <= 1)
                return (
                  <div className="flex items-center gap-1">
                    <Avatar url={resp.avatar_url || undefined} fallback={formatNameAsInitials(resp.nome)} height={18} width={18} />
                    <p className="text-[0.65rem] font-light text-gray-400">{resp.nome}</p>
                  </div>
                )
              else return null
            })}
            {opportunity.responsaveis.length > 2 ? <p className="text-[0.65rem] font-light text-gray-400">...</p> : null}
          </div>
          <div className={`flex items-center gap-2`}>
            <div className="ites-center flex gap-1">
              <BsCalendarPlus />
              <p className={`text-[0.65rem] font-medium text-gray-500`}>{formatDateAsLocale(opportunity.dataInsercao, true)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpportunityCardMode
