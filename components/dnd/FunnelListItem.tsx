import { ProjectActivity } from '@/utils/models'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Draggable } from 'react-beautiful-dnd'
import { AiOutlineRight } from 'react-icons/ai'
import { MdAttachMoney, MdDashboard, MdOpenInNew } from 'react-icons/md'
import { VscChromeClose } from 'react-icons/vsc'

import { BsCalendarPlus, BsFillMegaphoneFill, BsPatchCheckFill } from 'react-icons/bs'
import { TOpportunityDTO, TOpportunityDTOWithFunnelReferenceAndActivitiesByStatus } from '@/utils/schemas/opportunity.schema'
import Avatar from '../utils/Avatar'
import { formatDateAsLocale, formatDecimalPlaces, formatNameAsInitials, formatToMoney } from '@/lib/methods/formatting'

import { getDateDifference } from '@/lib/methods/extracting'
import { Session } from 'next-auth'
import OpportunityActivitiesModal from '../Activities/OpportunityActivitiesModal'
import { FaBolt } from 'react-icons/fa'

function getTagColor(activitiesByStatus: TOpportunityDTOWithFunnelReferenceAndActivitiesByStatus['statusAtividades']) {
  const overDue = activitiesByStatus['EM ATRASO']
  const comingDue = activitiesByStatus['EM VENCIMENTO']
  if (overDue > 0) return 'bg-red-500'
  if (comingDue > 0) return 'bg-orange-500'
  else return 'bg-green-500'
}
function getBarColor({ isWon, isRequested, isLost }: { isWon: boolean; isRequested: boolean; isLost: boolean }) {
  if (isWon) return 'bg-green-500'
  if (isRequested) return 'bg-orange-400'
  if (isLost) return 'bg-red-500'
  return 'bg-blue-400'
}

interface FunnelListItemProps {
  index: number
  session: Session
  item: {
    id: number | string
    idOportunidade: string
    nome: string
    identificador?: string
    tipo: string
    responsaveis: TOpportunityDTO['responsaveis']
    idMarketing?: string
    statusAtividades?: TOpportunityDTOWithFunnelReferenceAndActivitiesByStatus['statusAtividades']
    proposta?: {
      nome: string
      valor: number
      potenciaPico?: number | null
    }
    ganho?: boolean
    perca?: boolean
    contratoSolicitado?: boolean
    dataInsercao: string
  }
}

function FunnelListItem({ item, session, index }: FunnelListItemProps) {
  const isWon = !!item.ganho
  const isRequested = !!item.contratoSolicitado
  const isLost = !!item.perca

  const [activitiesModalIsOpen, setActivitiesModalIsOpen] = useState<boolean>(false)
  return (
    <Draggable draggableId={item.id.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="relative flex min-h-[110px] w-full flex-col justify-between rounded border border-gray-400 bg-[#fff] shadow-sm"
        >
          <div className={`h-1 w-full rounded-sm  ${getBarColor({ isWon, isRequested, isLost })}`}></div>
          <div className="flex w-full flex-col p-2">
            {item.ganho ? (
              <div className="z-8 absolute right-2 top-4 flex items-center justify-center text-green-500">
                <p className="text-sm font-medium italic">GANHO</p>
              </div>
            ) : null}
            {item.statusAtividades ? (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  setActivitiesModalIsOpen((prev) => !prev)
                }}
                className={`absolute right-2 top-9 flex h-[15px] w-[15px] cursor-pointer items-center justify-center rounded-full text-white  ${getTagColor(
                  item.statusAtividades
                )}`}
              >
                <AiOutlineRight style={{ fontSize: '10px' }} />
              </div>
            ) : null}
            {activitiesModalIsOpen ? (
              <OpportunityActivitiesModal opportunityId={item.idOportunidade} closeModal={() => setActivitiesModalIsOpen(false)} />
            ) : null}
            <div className="flex w-full flex-col">
              <div className="flex items-center gap-1">
                <h1 className="text-xs font-bold text-[#fead41]">{item.identificador}</h1>
                {item.idMarketing ? <BsFillMegaphoneFill color="#3e53b2" /> : null}
              </div>
              <Link href={`/comercial/oportunidades/id/${item.idOportunidade}`}>
                <h1 className="font-bold text-[#353432] hover:text-blue-400">{item.nome}</h1>
              </Link>
              <div className="flex items-center gap-1">
                <MdDashboard />
                <h3 className="text-[0.6rem] font-light">{item.tipo}</h3>
              </div>
            </div>
            {item.proposta?.nome ? (
              <div className="my-2 flex w-full grow flex-col rounded-md border border-gray-300 p-2">
                <h1 className="text-[0.6rem] font-extralight text-gray-500">PROPOSTA ATIVA</h1>
                <div className="flex w-full flex-col justify-between">
                  <p className="text-xs font-medium text-cyan-500">{item.proposta.nome}</p>
                  <div className="flex  items-center justify-between">
                    <div className="flex items-center gap-1">
                      <FaBolt color="rgb(6,182,212)" />
                      <p className="text-xs  text-gray-500">
                        {formatDecimalPlaces(item.proposta.potenciaPico || 0)}
                        kWp
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <MdAttachMoney color="rgb(6,182,212)" />
                      <p className="text-xs  text-gray-500">{formatToMoney(item.proposta.valor)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="mt-2 flex w-full items-center justify-between gap-2">
              <div className="flex grow flex-wrap items-center gap-2">
                {item.responsaveis.map((resp, index) => {
                  if (index <= 1)
                    return (
                      <div className="flex items-center gap-1">
                        <Avatar url={resp.avatar_url || undefined} fallback={formatNameAsInitials(resp.nome)} height={18} width={18} />
                        <p className="text-[0.65rem] font-light text-gray-400">{resp.nome}</p>
                      </div>
                    )
                  else return null
                })}
                {item.responsaveis.length > 2 ? <p className="text-[0.65rem] font-light text-gray-400">...</p> : null}
              </div>

              <div className="ites-center flex min-w-fit gap-1">
                <BsCalendarPlus />
                <p className={`text-[0.65rem] font-medium text-gray-500`}>{formatDateAsLocale(item.dataInsercao, true)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}

export default FunnelListItem
