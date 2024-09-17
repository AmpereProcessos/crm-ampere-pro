import ErrorComponent from '@/components/utils/ErrorComponent'
import LoadingComponent from '@/components/utils/LoadingComponent'
import { usePaymentMethods, usePaymentMethodsPersonalized } from '@/utils/queries/payment-methods'
import { TOpportunityDTOWithClient, TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from '@/utils/schemas/opportunity.schema'
import { TProposal, TProposalPaymentMethodItem } from '@/utils/schemas/proposal.schema'
import { Session } from 'next-auth'
import React, { useState } from 'react'
import { BsCircleHalf } from 'react-icons/bs'
import { FaPercentage } from 'react-icons/fa'
import { MdPayment } from 'react-icons/md'
import PaymentMethodCard from '../Blocks/PaymentMethodCard'
import toast from 'react-hot-toast'

type PaymentProps = {
  infoHolder: TProposal
  setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>
  opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences
  moveToNextStage: () => void
  moveToPreviousStage: () => void
  session: Session
}
function Payment({ infoHolder, setInfoHolder, moveToNextStage, moveToPreviousStage, session }: PaymentProps) {
  console.log(infoHolder.kits)
  const {
    data: paymentMethods,
    isLoading,
    isSuccess,
    isError,
  } = usePaymentMethodsPersonalized({
    kitsIds: infoHolder.kits.map((k) => k.id),
    plansIds: infoHolder.planos.map((p) => p.id),
    productsIds: infoHolder.produtos.map((p) => p.id || ''),
    servicesIds: infoHolder.servicos.map((s) => s.id || ''),
  })
  const [selectedMethods, setSelectedMethods] = useState<TProposalPaymentMethodItem[]>([])
  const proposalValue = infoHolder.valor
  function addMethod(method: TProposalPaymentMethodItem) {
    const methods = [...selectedMethods]
    methods.push(method)
    setSelectedMethods(methods)
  }
  function handleProceed() {
    if (!paymentMethods) return toast.error('Erro ao buscar métodos de pagamento.')
    if (paymentMethods.length > 0 && selectedMethods.length == 0) return toast.error('Selecione ao menos um método de pagamento a ser aplicável.')
    setInfoHolder((prev) => ({ ...prev, pagamento: { ...prev.pagamento, metodos: selectedMethods } }))
    return moveToNextStage()
  }
  return (
    <>
      <div className="flex w-full flex-col gap-4 py-4">
        <h1 className="font-Raleway font-bold text-gray-800">MÉTODOS DE PAGAMENTO</h1>
        <div className="flex w-full items-center justify-center">
          <h1 className="text-center font-medium italic text-[#fead61]">
            Nessa etapa, você pode escolher os métodos de pagamento aplicáveis para essa proposta. Os métodos escolhidos serão utilizados para compor o
            documento de apresentação das propostas.
          </h1>
        </div>
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg="Erro ao buscar metodologias de precificação" /> : null}
        {isSuccess ? (
          paymentMethods.length > 0 ? (
            paymentMethods.map((method, index) => (
              <PaymentMethodCard
                index={index}
                key={method._id}
                method={method}
                proposalValue={proposalValue}
                selectedMethods={selectedMethods}
                selectMethod={(id) => addMethod(id)}
                removeMethod={(id) => {
                  const filtered = [...selectedMethods].filter((s) => s.id != id)

                  setSelectedMethods(filtered)
                }}
              />
            ))
          ) : (
            <p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-gray-500">
              Nenhum método de pagamento disponível.
            </p>
          )
        ) : null}
        <div className="flex w-full items-center justify-between gap-2 px-1">
          <button onClick={() => moveToPreviousStage()} className="rounded p-2 font-bold text-gray-500 duration-300 hover:scale-105">
            Voltar
          </button>
          <button onClick={handleProceed} className="rounded p-2 font-bold hover:bg-black hover:text-white">
            Prosseguir
          </button>
        </div>
      </div>
    </>
  )
}

export default Payment
