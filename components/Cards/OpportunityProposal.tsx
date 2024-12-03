import React from 'react'
import dayjs from 'dayjs'

import { BsCalendarFill, BsCalendarPlus } from 'react-icons/bs'
import { ImPower, ImPriceTag } from 'react-icons/im'

import { formatToMoney } from '@/utils/methods'
import Link from 'next/link'
import { MdAttachMoney } from 'react-icons/md'
import { TProposalDTO } from '@/utils/schemas/proposal.schema'
import { formatDateAsLocale, formatDecimalPlaces } from '@/lib/methods/formatting'
import Avatar from '../utils/Avatar'

type GetColorArgs = {
  proposalId: string
  opportunityHasContractRequested: boolean
  opportunityIsWon: boolean
  opportunityWonProposalId?: string | null
  opportunityActiveProposalId?: string | null
}
function getTagColor({ proposalId, opportunityHasContractRequested, opportunityIsWon, opportunityWonProposalId, opportunityActiveProposalId }: GetColorArgs) {
  if (opportunityIsWon && opportunityWonProposalId == proposalId) return 'bg-green-500'
  if (opportunityHasContractRequested && opportunityWonProposalId == proposalId) return 'bg-orange-500'
  if (opportunityActiveProposalId == proposalId) return 'bg-blue-500'
  return 'bg-gray-500'
}
function getStatusColor({
  proposalId,
  opportunityHasContractRequested,
  opportunityIsWon,
  opportunityWonProposalId,
  opportunityActiveProposalId,
}: GetColorArgs) {
  if (opportunityIsWon && opportunityWonProposalId == proposalId)
    return <h1 className="w-fit self-center rounded border border-green-500 p-1 text-center text-[0.6rem] font-black text-green-500">GANHA</h1>
  if (opportunityHasContractRequested && opportunityWonProposalId == proposalId)
    return <h1 className="w-fit self-center rounded border border-orange-500 p-1 text-center text-[0.6rem] font-black text-orange-500">CONTRATO SOLICITADO</h1>
  if (opportunityActiveProposalId == proposalId)
    return <h1 className="w-fit self-center rounded border border-blue-500 p-1 text-center text-[0.6rem] font-black text-blue-500">ATIVA</h1>
  return <h1 className="w-fit self-center rounded border border-gray-500 p-1 text-center text-[0.6rem] font-black text-gray-500">GERADA</h1>
}

type OpportunityProposalProps = {
  info: TProposalDTO
  opportunityHasContractRequested: boolean
  opportunityActiveProposalId?: string | null
  opportunityIsWon: boolean
  opportunityWonProposalId?: string | null
}
function OpportunityProposal({
  info,
  opportunityHasContractRequested,
  opportunityActiveProposalId,
  opportunityIsWon,
  opportunityWonProposalId,
}: OpportunityProposalProps) {
  return (
    <div className="flex w-full items-center rounded-md border border-gray-200">
      <div
        className={`h-full w-[5px] rounded-bl-md rounded-tl-md ${getTagColor({
          proposalId: info._id,
          opportunityIsWon,
          opportunityHasContractRequested,
          opportunityActiveProposalId: opportunityActiveProposalId,
          opportunityWonProposalId: opportunityWonProposalId,
        })}`}
      ></div>
      <div className="flex grow flex-col p-3">
        <div className="flex w-full flex-col items-center justify-between gap-1 lg:flex-row lg:items-start">
          <div className="flex grow flex-col items-center lg:items-start">
            <Link href={`/comercial/proposta/${info._id}`}>
              <h1 className="w-full text-center text-sm font-bold leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500 lg:text-start">
                {info.nome}
              </h1>
            </Link>
            <p className="mt-1 w-full text-center text-[0.5rem] font-medium text-gray-500 lg:text-start lg:text-[0.6rem]">#{info._id}</p>
          </div>
          <div className="flex w-full min-w-fit items-center justify-center lg:w-fit lg:justify-end">
            {getStatusColor({
              proposalId: info._id,
              opportunityIsWon,
              opportunityHasContractRequested,
              opportunityActiveProposalId: opportunityActiveProposalId,
              opportunityWonProposalId: opportunityWonProposalId,
            })}
          </div>
        </div>
        <div className="mt-1 flex w-full flex-col items-center justify-between gap-1 lg:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start lg:gap-4">
            <div className="flex items-center gap-1 text-gray-500">
              <ImPower style={{ fontSize: '20px' }} />
              <p className="text-[0.6rem] text-black lg:text-xs">{info.potenciaPico} kWp</p>
            </div>
            <div className="flex items-center gap-1 text-gray-500 ">
              <ImPriceTag style={{ fontSize: '20px' }} />
              <p className="text-[0.6rem] text-black lg:text-xs">{info.valor ? formatToMoney(info.valor) : '-'} </p>
            </div>
            <div className="flex items-center gap-1 text-gray-500 ">
              <MdAttachMoney style={{ fontSize: '20px' }} />
              <p className="text-[0.6rem] text-black lg:text-xs">
                {info.valor && info.potenciaPico ? `${formatDecimalPlaces(info.valor / (1000 * info.potenciaPico))} R$ / Wp` : '-'}{' '}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-between">
            <div className={`flex items-center gap-1`}>
              <BsCalendarPlus />
              <p className="text-[0.65rem] font-medium text-gray-500">{formatDateAsLocale(info.dataInsercao, true)}</p>
            </div>
            <div className="flex items-center gap-1">
              <Avatar fallback={'R'} url={info.autor.avatar_url || undefined} height={20} width={20} />
              <p className="text-[0.65rem] font-medium text-gray-500">{info.autor.nome}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpportunityProposal
