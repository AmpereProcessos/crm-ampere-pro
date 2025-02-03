import React, { useState } from 'react'

import { AiFillEdit } from 'react-icons/ai'

import { TOpportunityDTOWithClient, TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from '@/utils/schemas/opportunity.schema'
import { TPricingItem, TProposal } from '@/utils/schemas/proposal.schema'
import PricingTable from '../Blocks/PricingTable'
import { Session } from 'next-auth'
import { getPricingTotal } from '@/utils/pricing/methods'
import { formatToMoney } from '@/utils/methods'
import EditFinalPrice from '../Blocks/EditFinalPrice'
import { MdAdd } from 'react-icons/md'
import AddPricingItem from '../Blocks/AddPricingItem'
type PricingProps = {
  infoHolder: TProposal
  setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>
  opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences
  moveToNextStage: () => void
  moveToPreviousStage: () => void
  session: Session
}
function Pricing({ opportunity, infoHolder, setInfoHolder, moveToNextStage, moveToPreviousStage, session }: PricingProps) {
  const userHasPricingEditPermission = session?.user.permissoes.precos.editar
  const userHasPricingViewPermission = session.user.permissoes.precos.visualizar
  const alterationLimit = userHasPricingEditPermission ? undefined : infoHolder.idMetodologiaPrecificacao == '66912b265a6c1f632a3970dd' ? 0.04 : 0.02

  const [pricing, setPricing] = useState<TPricingItem[]>(infoHolder.precificacao)
  const [addNewPriceItemModalIsOpen, setAddNewPriceItemModalIsOpen] = useState<boolean>(false)
  const [editFinalPriceModalIsOpen, setEditFinalPriceModalIsOpen] = useState<boolean>(false)
  const pricingTotal = getPricingTotal({ pricing: pricing })
  const [addCostModalIsOpen, setAddCostModalIsOpen] = useState<boolean>(false)

  function handleProceed() {
    const updatePlanPrice = infoHolder.planos.length == 1
    const proposalPlans: TProposal['planos'] = updatePlanPrice ? [{ ...infoHolder.planos[0], valor: pricingTotal }] : infoHolder.planos
    // Updating proposal final price
    setInfoHolder((prev) => ({ ...prev, planos: proposalPlans, precificacao: pricing, valor: pricingTotal }))
    // Moving to next stage
    moveToNextStage()
  }
  return (
    <>
      <div className="flex w-full flex-col gap-4 py-4">
        <h1 className="font-Raleway font-bold text-gray-800">DESCRITIVO DA VENDA</h1>
      </div>
      <PricingTable
        pricing={pricing}
        setPricing={setPricing}
        userHasPricingEditPermission={userHasPricingEditPermission}
        userHasPricingViewPermission={userHasPricingViewPermission}
        opportunity={opportunity}
        proposal={infoHolder}
      />
      {userHasPricingEditPermission ? (
        <div className="my-4 flex w-full items-center justify-center">
          <button
            onClick={() => setAddNewPriceItemModalIsOpen(true)}
            className="flex items-center gap-2 rounded bg-orange-600 px-4 py-2 text-white duration-100 ease-in-out hover:bg-orange-700"
          >
            <MdAdd />
            <h1 className="text-xs font-bold">NOVO CUSTO</h1>
          </button>
        </div>
      ) : null}

      <div className="flex w-full items-center justify-center gap-2 py-1">
        <div className="flex gap-2 rounded border border-gray-600 px-2 py-1 font-medium text-gray-600">
          <p>{formatToMoney(pricingTotal)}</p>
          {session?.user.permissoes.precos.editar ? (
            <button onClick={() => setEditFinalPriceModalIsOpen((prev) => !prev)} className="text-md text-gray-400 hover:text-[#fead61]">
              <AiFillEdit />
            </button>
          ) : (
            <button onClick={() => setEditFinalPriceModalIsOpen((prev) => !prev)} className="text-md text-gray-400 hover:text-[#fead61]">
              <AiFillEdit />
            </button>
          )}
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-2 px-1">
        <button onClick={() => moveToPreviousStage()} className="rounded p-2 font-bold text-gray-500 duration-300 hover:scale-105">
          Voltar
        </button>
        <button onClick={handleProceed} className="rounded p-2 font-bold hover:bg-black hover:text-white">
          Prosseguir
        </button>
      </div>
      {addNewPriceItemModalIsOpen ? (
        <AddPricingItem pricing={pricing} setPricing={setPricing} proposal={infoHolder} closeModal={() => setAddNewPriceItemModalIsOpen(false)} />
      ) : null}
      {editFinalPriceModalIsOpen ? (
        <EditFinalPrice pricing={pricing} setPricing={setPricing} closeModal={() => setEditFinalPriceModalIsOpen(false)} alterationLimit={alterationLimit} />
      ) : null}
    </>
  )
}

export default Pricing
