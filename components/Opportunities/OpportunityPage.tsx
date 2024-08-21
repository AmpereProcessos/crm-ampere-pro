import React, { useState } from 'react'
import { useSession } from 'next-auth/react'

import OpportunityDetails from './OpportunityDetails'
import OpportunityHistory from './OpportunityHistory'
import OpportunityProposals from './OpportunityProposals'
import OpportunityFiles from './OpportunityFiles'
import OpportunityPPSCalls from './OpportunityPPSCalls'
import OpportunityTechnicalAnalysis from './OpportunityTechnicalAnalysis'
import OpportunityHomologations from './OpportunityHomologations'
import LoadingComponent from '../utils/LoadingComponent'
import Avatar from '../utils/Avatar'
import { Sidebar } from '../Sidebar'

import { GiPositionMarker } from 'react-icons/gi'
import { FaCity } from 'react-icons/fa'
import { HiIdentification } from 'react-icons/hi'
import { BsFillCalendarCheckFill, BsFillMegaphoneFill, BsTelephoneFill } from 'react-icons/bs'
import { MdEmail } from 'react-icons/md'
import { AiFillEdit, AiOutlineUser } from 'react-icons/ai'

import { useRepresentatives, useResponsibles } from '@/utils/methods'
import { useOpportunityById } from '@/utils/queries/opportunities'
import OpportunityLossBlock from './OpportunityLossBlock'
import { formatDateAsLocale, formatNameAsInitials } from '@/lib/methods/formatting'
import { Session } from 'next-auth'
import OpportunityWonFlag from './OpportunityWonFlag'
import OpportunityContractRequestedFlag from './OpportunityContractRequestedFlag'
import OpportunityClient from './OpportunityClient'

export type TOpportunityBlockMode = 'PROPOSES' | 'FILES' | 'TECHNICAL ANALYSIS'

type OpportunityPageProps = {
  session: Session
  opportunityId: string
}
function OpportunityPage({ session, opportunityId }: OpportunityPageProps) {
  const [blockMode, setBlockMode] = useState<TOpportunityBlockMode>('PROPOSES')
  const {
    data: opportunity,
    status,
    isLoading: opportunityLoading,
    isSuccess: opportunitySuccess,
    isError: opportunityError,
  } = useOpportunityById({ opportunityId: opportunityId })

  if (opportunityLoading) return <LoadingComponent />
  if (opportunityError)
    return (
      <div className="flex h-full flex-col md:flex-row">
        <Sidebar session={session} />
        <div className="flex w-full max-w-full grow flex-col items-center justify-center overflow-x-hidden bg-[#f8f9fa] p-6">
          <p className="text-lg italic text-gray-700">Oops, houve um erro no carregamento das informações do projeto em questão.</p>
        </div>
      </div>
    )
  if (opportunitySuccess)
    return (
      <div className="flex h-full flex-col md:flex-row">
        <Sidebar session={session} />
        <div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
          <div className="flex w-full flex-col items-start justify-between border-b border-[#000] pb-2 lg:flex-row">
            <div className="flex w-full flex-col items-start">
              <div className="mb-2 flex w-full flex-col items-center gap-0 lg:mb-0 lg:w-fit lg:flex-row lg:gap-2">
                <h1 className="flex text-center font-Raleway text-2xl font-bold text-[#fead41] lg:text-start">{opportunity.identificador}</h1>
                <h1 className="flex text-center font-Raleway text-2xl font-bold text-blue-900 lg:text-start">{opportunity.nome}</h1>
                {opportunity.idMarketing ? (
                  <div className="flex items-center gap-1 rounded border border-[#3e53b2] p-1 text-[#3e53b2]">
                    <BsFillMegaphoneFill />
                    <p className="text-sm font-bold italic leading-none tracking-tight">VINDO DE MARKETING</p>
                  </div>
                ) : null}
              </div>
              <p className="w-full text-start text-xs italic text-gray-500">{opportunity.descricao}</p>
              <div className="mt-1 flex w-full flex-row flex-wrap items-start gap-3">
                {opportunity.responsaveis.map((resp) => (
                  <div className="flex items-center gap-1">
                    <Avatar width={20} height={20} url={resp.avatar_url || undefined} fallback={formatNameAsInitials(resp.nome)} />
                    <p className="text-sm font-medium leading-none tracking-tight text-gray-500">{resp.nome}</p>{' '}
                    <p className="ml-1 rounded-md border border-cyan-400 p-1 text-xxs font-bold text-cyan-400">{resp.papel}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex w-full flex-col items-center gap-4 lg:mt-0 lg:w-fit lg:flex-row">
              {!!opportunity.ganho.data ? null : (
                <OpportunityLossBlock
                  opportunityId={opportunity._id}
                  opportunityIsLost={!!opportunity.perda.data}
                  opportunityLossDate={opportunity.perda.data}
                  idMarketing={opportunity.idMarketing}
                  opportunityEmail={opportunity.cliente.email}
                />
              )}
              <OpportunityContractRequestedFlag requestDate={opportunity.ganho.dataSolicitacao} />
              <OpportunityWonFlag wonDate={opportunity.ganho.data} />
            </div>
          </div>

          {/* <div className="flex w-full flex-col items-start gap-6 py-4 lg:flex-row"></div> */}
          <div className="flex w-full flex-col gap-6 lg:flex-row">
            <div className="flex w-full flex-col gap-4 lg:w-[40%]">
              <OpportunityClient client={opportunity.cliente} session={session} opportunityId={opportunityId} responsibles={opportunity.responsaveis} />
              <OpportunityDetails info={opportunity} session={session} opportunityId={opportunity._id} />
            </div>

            <div className="flex w-full flex-col gap-4 lg:w-[60%]">
              <OpportunityProposals
                city={opportunity.localizacao.cidade}
                uf={opportunity.localizacao.uf}
                session={session}
                opportunityId={opportunity._id ? opportunity._id : ''}
                idActiveProposal={opportunity.idPropostaAtiva || undefined}
                setBlockMode={setBlockMode}
                opportunityHasContractRequested={!!opportunity.ganho.dataSolicitacao}
                opportunityIsWon={!!opportunity.ganho.data}
                opportunityWonProposalId={opportunity.ganho.idProposta}
              />
              <OpportunityFiles opportunityId={opportunity._id} clientId={opportunity.idCliente} session={session} />
              <OpportunityPPSCalls opportunity={opportunity} session={session} />
              <OpportunityTechnicalAnalysis session={session} opportunity={opportunity} />
              <OpportunityHomologations opportunity={opportunity} session={session} />
              <OpportunityHistory
                opportunityName={opportunity.nome}
                opportunityId={opportunity._id}
                opportunityIdentifier={opportunity.identificador || ''}
                session={session}
              />
            </div>
          </div>
        </div>
      </div>
    )
  return <></>
}

export default OpportunityPage
