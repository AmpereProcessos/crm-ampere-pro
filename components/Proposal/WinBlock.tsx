import { formatDateAsLocale } from '@/lib/methods/formatting'
import { useMutationWithFeedback } from '@/utils/mutations/general-hook'
import { winOpportunity } from '@/utils/mutations/opportunities'
import { updateRDOpportunity } from '@/utils/mutations/rd-opportunities'
import { useQueryClient } from '@tanstack/react-query'
import { Trophy } from 'lucide-react'
import React from 'react'
import { BsFillCalendarCheckFill } from 'react-icons/bs'

type WinBlockProps = {
  isWon: boolean
  wonDate?: string | null
  contractRequestDate?: string | null
  wonProposalId?: string | null
  proposalId: string
  proposalValue: number
  opportunityId: string
  opportunityEmail?: string | null
  idMarketing?: string | null
  handleWin: () => void
}
function WinBlock({
  isWon,
  wonDate,
  contractRequestDate,
  wonProposalId,
  proposalId,
  proposalValue,
  opportunityId,
  opportunityEmail,
  idMarketing,
  handleWin,
}: WinBlockProps) {
  if (wonDate)
    return (
      <div className="flex w-[80%] flex-col items-center rounded-md bg-green-400  p-2 shadow-md lg:w-fit">
        <h1 className="text-center font-Raleway text-xs font-bold text-black">OPORTUNIDADE GANHA</h1>
        {wonProposalId != proposalId ? <p className="text-center font-Raleway text-xxs font-thin text-gray-700">(ATRAVÉS DE OUTRA PROPOSTA)</p> : null}
        <div className="flex items-center justify-center gap-2">
          <BsFillCalendarCheckFill style={{ color: '#000', fontSize: '15px' }} />
          <p className="text-center text-xs font-bold text-black">{wonDate ? formatDateAsLocale(wonDate, true) : '-'}</p>
        </div>
      </div>
    )
  if (contractRequestDate)
    return (
      <div className="flex w-[80%] flex-col items-center rounded-md bg-orange-400  p-2 shadow-md lg:w-fit">
        <h1 className="text-center font-Raleway text-xs font-bold text-black">CONTRATO SOLICITADO</h1>
        {wonProposalId != proposalId ? <p className="text-center font-Raleway text-xxs font-thin text-gray-700">(ATRAVÉS DE OUTRA PROPOSTA)</p> : null}
        <div className="flex items-center justify-center gap-2">
          <BsFillCalendarCheckFill style={{ color: '#000', fontSize: '15px' }} />
          <p className="text-center text-xs font-bold text-black">{contractRequestDate ? formatDateAsLocale(contractRequestDate, true) : '-'}</p>
        </div>
      </div>
    )
  return (
    <button
      // @ts-ignore
      onClick={() => handleWin()}
      className="flex w-fit items-center gap-2 rounded bg-green-500 px-2 py-1 ease-in-out hover:bg-green-600"
    >
      <h1 className="text-xs font-bold text-white">DAR GANHO NA PROPOSTA</h1>
      <Trophy size={15} color="white" />
    </button>
  )
  // return (
  //   <>
  //     {/* <button
  //             onClick={() => setNewContractRequestIsOpen(true)}
  //             className="rounded border border-green-600 px-4 py-2 text-sm font-bold text-green-600 duration-300 ease-in-out hover:bg-green-600 hover:text-white"
  //           >
  //             REQUISITAR CONTRATO
  //           </button> */}
  //     {isWon ? (
  //       <div className="flex w-[80%] flex-col items-center rounded-md bg-green-400  p-2 shadow-md lg:w-fit">
  //         <h1 className="text-center font-Raleway text-xs font-bold text-black">OPORTUNIDADE GANHA</h1>
  //         {wonProposalId != proposalId ? <p className="text-center font-Raleway text-xxs font-thin text-gray-700">(ATRAVÉS DE OUTRA PROPOSTA)</p> : null}
  //         <div className="flex items-center justify-center gap-2">
  //           <BsFillCalendarCheckFill style={{ color: '#000', fontSize: '15px' }} />
  //           <p className="text-center text-xs font-bold text-black">{wonDate ? formatDateAsLocale(wonDate, true) : '-'}</p>
  //         </div>
  //       </div>
  //     ) : (
  //       <button
  //         // @ts-ignore
  //         onClick={() => handleWin()}
  //         className="rounded border border-green-600 px-4 py-2 text-sm font-bold text-green-600 duration-300 ease-in-out hover:bg-green-600 hover:text-white"
  //       >
  //         DAR GANHO
  //       </button>
  //     )}
  //   </>
  // )
}

export default WinBlock
