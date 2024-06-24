import { formatDateAsLocale, formatDecimalPlaces, formatNameAsInitials, formatToMoney } from '@/lib/methods/formatting'
import { TOpportunitySimplifiedDTOWithProposal } from '@/utils/schemas/opportunity.schema'
import Link from 'next/link'
import React from 'react'
import { BsCalendarPlus, BsFillMegaphoneFill } from 'react-icons/bs'
import { FaBolt } from 'react-icons/fa'
import { MdAttachMoney } from 'react-icons/md'
import Avatar from '../utils/Avatar'

function getBarColor(requested: boolean, signed: boolean, lost: boolean) {
  if (signed) return 'bg-green-500'
  if (requested) return 'bg-orange-400'
  if (lost) return 'bg-red-500'
  return 'bg-blue-400'
}
type OpportunitiesCardModeProps = {
  opportunity: TOpportunitySimplifiedDTOWithProposal
}
function OpportunityCardMode({ opportunity }: OpportunitiesCardModeProps) {
  return (
    <div className="relative flex min-h-[110px] w-full flex-col justify-between rounded border border-gray-200 bg-[#fff] p-2 shadow-sm">
      {!!opportunity.ganho.data ? (
        <div className="z-8 absolute right-2 top-4 flex items-center justify-center text-green-500">
          <p className="text-sm font-medium italic">GANHO</p>
        </div>
      ) : null}
      <div className="flex w-full flex-col">
        <div
          className={`h-1 w-full rounded-sm  ${getBarColor(!!opportunity.ganho.dataSolicitacao, !!opportunity.ganho.data, !!opportunity.perda.data)} `}
        ></div>
        <div className="flex items-center gap-1">
          <h1 className="text-xs font-bold text-[#fead41]">{opportunity.identificador}</h1>
          {opportunity.idMarketing ? <BsFillMegaphoneFill color="#3e53b2" /> : null}
        </div>
        <Link href={`/comercial/oportunidades/id/${opportunity._id}`}>
          <h1 className="font-bold text-[#353432] hover:text-blue-400">{opportunity.nome}</h1>
        </Link>
      </div>
      {opportunity.proposta?.nome ? (
        <div className="my-2 flex w-full grow flex-col rounded-md border border-gray-300 p-2">
          <h1 className="text-[0.6rem] font-extralight text-gray-500">PROPOSTA ATIVA</h1>
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
        </div>
      ) : (
        <div className="my-2 flex w-full grow flex-col rounded-md border border-gray-300 p-2">
          <h1 className="text-[0.6rem] font-extralight text-gray-500">PROPOSTA ATIVA</h1>
          <h1 className="text-xs font-medium text-gray-500">NENHUMA PROPOSTA ATIVA</h1>
        </div>
      )}

      <div className="flex w-full items-center justify-between">
        <div className="flex grow flex-wrap items-center gap-2">
          {opportunity.responsaveis.map((resp) => (
            <div className="flex items-center gap-1">
              <Avatar url={resp.avatar_url || undefined} fallback={formatNameAsInitials(resp.nome)} height={18} width={18} />
              <p className="text-sm font-light text-gray-400">{resp.nome}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex w-full items-center justify-end gap-2">
        <div className={`flex items-center gap-2`}>
          <div className="ites-center flex gap-1">
            <BsCalendarPlus />
            <p className={`text-[0.65rem] font-medium text-gray-500`}>{formatDateAsLocale(opportunity.dataInsercao, true)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpportunityCardMode
