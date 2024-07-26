import React, { useState } from 'react'
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from 'react-icons/io'
import { MdAdd } from 'react-icons/md'
import LoadingComponent from '../utils/LoadingComponent'
import ErrorComponent from '../utils/ErrorComponent'
import { Session } from 'next-auth'
import { TOpportunityDTOWithClient } from '@/utils/schemas/opportunity.schema'
import { useOpportunityHomologations } from '@/utils/queries/homologations'
import OpportunityHomologationCard from '../Cards/OpportunityHomologation'
import NewHomologation from '@/app/components/Modals/Homologations/NewHomologation'

type OpportunityHomologationsProps = {
  opportunity: TOpportunityDTOWithClient
  session: Session
}
function OpportunityHomologations({ opportunity, session }: OpportunityHomologationsProps) {
  const { data: homologations, isLoading, isError, isSuccess } = useOpportunityHomologations({ opportunityId: opportunity._id })
  const [newHomologationModalIsOpen, setNewHomologationModalIsOpen] = useState<boolean>(false)
  const [blockIsOpen, setBlockIsOpen] = useState<boolean>(false)

  return (
    <div className="flex max-h-[250px] w-full flex-col rounded-md border border-gray-200 bg-[#fff] p-3 shadow-lg">
      <div className="flex  h-[40px] items-center  justify-between border-b border-gray-200 pb-2">
        <div className="flex items-center justify-center gap-5">
          <h1 className="p-1 text-center font-bold text-black">Homologação</h1>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setNewHomologationModalIsOpen(true)} className="hidden rounded bg-green-600 p-1 text-[0.7rem] font-bold text-white lg:flex">
            SOLICITAR HOMOLOGAÇÃO
          </button>
          <button onClick={() => setNewHomologationModalIsOpen(true)} className="flex rounded bg-green-600 p-1 text-sm font-bold text-white lg:hidden">
            <MdAdd />
          </button>
          {blockIsOpen ? (
            <button className="text-gray-600 hover:text-blue-400">
              <IoMdArrowDropupCircle style={{ fontSize: '25px' }} onClick={() => setBlockIsOpen(false)} />
            </button>
          ) : (
            <button className="text-gray-600 hover:text-blue-400">
              <IoMdArrowDropdownCircle style={{ fontSize: '25px' }} onClick={() => setBlockIsOpen(true)} />
            </button>
          )}
        </div>
      </div>
      {blockIsOpen ? (
        <div className="overscroll-y flex w-full grow flex-col gap-1 overflow-y-auto py-1 pr-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent msg="Erro ao buscar homologações da oportunidade." /> : null}
          {isSuccess ? (
            homologations.length > 0 ? (
              homologations.map((homologation) => <OpportunityHomologationCard key={homologation._id} homologation={homologation} />)
            ) : (
              <p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-gray-500">
                Sem homologações vinculadas a essa oportunidade.
              </p>
            )
          ) : null}
        </div>
      ) : null}

      {newHomologationModalIsOpen ? (
        <NewHomologation opportunity={opportunity} session={session} closeModal={() => setNewHomologationModalIsOpen(false)} />
      ) : null}
    </div>
  )
}

export default OpportunityHomologations
