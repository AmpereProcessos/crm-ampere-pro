import { TOpportunityHistoryDTO, TOpportunityInteractionTypeEnum } from '@/utils/schemas/opportunity-history.schema'
import React from 'react'
import Avatar from '../utils/Avatar'
import { IoIosCalendar } from 'react-icons/io'
import { formatDateAsLocale } from '@/lib/methods/formatting'
import { OpportunityInteractionTypes } from '@/utils/select-options'
import { MdMessage } from 'react-icons/md'
import { renderIcon } from '@/lib/methods/rendering'

type OpportunityHistoryProps = {
  history: TOpportunityHistoryDTO
}
function OpportunityHistory({ history }: OpportunityHistoryProps) {
  function getInteractionIcon(interactionType: TOpportunityInteractionTypeEnum) {
    const interactionInfo = OpportunityInteractionTypes.find((t) => t.value == interactionType)
    return interactionInfo?.icon || MdMessage
  }
  if (history.categoria == 'ANOTAÇÃO')
    return (
      <div className="flex w-full flex-col gap-2 rounded-md bg-yellow-100 p-2">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar fallback={'R'} url={history.autor?.avatar_url || undefined} height={22} width={22} />
            <p className="text-xs font-medium text-gray-500">{history.autor.nome}</p>
          </div>
          <div className="flex items-center gap-2">
            <IoIosCalendar style={{ fontSize: '20px' }} />
            <p className="text-xs font-medium text-gray-500">{formatDateAsLocale(history.dataInsercao, true)}</p>
          </div>
        </div>
        <div className="flex w-full items-center justify-center border border-gray-200 bg-[#F4F0BB] p-2">
          <p className="w-full text-center text-sm text-gray-500">{history.conteudo}</p>
        </div>
      </div>
    )

  if (history.categoria == 'INTERAÇÃO')
    return (
      <div className="flex w-full flex-col gap-2 border border-gray-200 p-3 shadow-sm">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="rounded-lg bg-[#15599a] px-2 py-0.5 text-[0.65rem] font-medium text-white">INTERAÇÃO</p>

            {renderIcon(getInteractionIcon(history.tipoInteracao))}
            <p className="text-xs font-medium text-gray-500">{history.tipoInteracao}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Avatar fallback={'R'} url={history.autor?.avatar_url || undefined} height={22} width={22} />
              <p className="text-xs font-medium text-gray-500">{history.autor.nome}</p>
            </div>
            <div className="flex items-center gap-2">
              <IoIosCalendar style={{ fontSize: '20px' }} />
              <p className="text-xs font-medium text-gray-500">{formatDateAsLocale(history.dataInsercao, true)}</p>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-center border border-gray-200 p-2">
          <p className="w-full text-center text-sm text-gray-500">{history.conteudo}</p>
        </div>
      </div>
    )
  return <></>
}

export default OpportunityHistory
