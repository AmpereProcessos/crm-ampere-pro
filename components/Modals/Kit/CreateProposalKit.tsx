import GeneralInformationBlock from '@/components/Kits/GeneralInformationBlock'
import ProductCompositionBlock from '@/components/Kits/ProductCompositionBlock'
import ServicesCompositionBlock from '@/components/Kits/ServicesCompositionBlock'
import { combineUniqueProducts, combineUniqueServices } from '@/lib/methods/array-manipulation'
import { getInverterQty, getModulesPeakPotByProducts, getModulesQty } from '@/lib/methods/extracting'
import { getPricingTotal, getPricingTotals, handlePricingCalculation, TPricingConditionData, TPricingVariableData } from '@/utils/pricing/methods'
import { usePricingMethods } from '@/utils/queries/pricing-methods'
import { TKit } from '@/utils/schemas/kits.schema'
import { TOpportunity } from '@/utils/schemas/opportunity.schema'
import { TPricingMethodDTO } from '@/utils/schemas/pricing-method.schema'
import { TProposal } from '@/utils/schemas/proposal.schema'
import { Session } from 'next-auth'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { VscChromeClose } from 'react-icons/vsc'

type CreateProposalKitProps = {
  proposal: TProposal
  setProposal: React.Dispatch<React.SetStateAction<TProposal>>
  opportunity: TOpportunity
  closeModal: () => void
  session: Session
  goToNextStage: () => void
}
function CreateProposalKit({ proposal, setProposal, opportunity, closeModal, session, goToNextStage }: CreateProposalKitProps) {
  const { data: pricingMethods } = usePricingMethods()
  const [kitInfo, setKitInfo] = useState<TKit>({
    nome: '',
    idParceiro: session.user.idParceiro || '',
    idMetodologiaPrecificacao: '660dab0b0fcb72da4ed8c35e',
    ativo: true,
    topologia: 'MICRO-INVERSOR',
    potenciaPico: 0,
    preco: 0,
    estruturasCompativeis: [],
    produtos: [],
    servicos: [],
    autor: {
      id: session.user.id,
      nome: session.user.nome,
      avatar_url: session.user.avatar_url,
    },
    dataInsercao: new Date().toISOString(),
  })
  function handleProceed() {
    if (!pricingMethods) return toast.error('Oops, não foi possível encontrar informações referentes a metodologia de precificação.')
    const kitIds = []
    const kitName = kitInfo.nome
    const topology = kitInfo.topologia
    const methodology = pricingMethods?.find((p) => p._id == kitInfo.idMetodologiaPrecificacao) as TPricingMethodDTO
    const methodologyId = kitInfo.idMetodologiaPrecificacao
    const selectedProducts = kitInfo.produtos
    const selectedServices = kitInfo.servicos

    const products = combineUniqueProducts(selectedProducts)
    const services = combineUniqueServices(selectedServices)
    const price = kitInfo.preco
    const moduleQty = getModulesQty(products)
    const inverterQty = getInverterQty(products)
    const modulePeakPower = getModulesPeakPotByProducts(products)
    const conditionData: TPricingConditionData = {
      uf: opportunity.localizacao.uf,
      cidade: opportunity.localizacao.cidade,
      topologia: topology,
      grupoInstalacao: proposal.premissas.grupoInstalacao || 'RESIDENCIAL',
      tipoEstrutura: proposal.premissas.tipoEstrutura || 'Fibrocimento',
      faseamentoEletrico: proposal.premissas.faseamentoEletrico || 'MONOFÁSICO',
      idParceiro: opportunity.idParceiro,
      numModulos: moduleQty,
      numInversores: inverterQty,
      potenciaPico: inverterQty,
      distancia: proposal.premissas.distancia || 0,
      valorReferencia: proposal.premissas.valorReferencia || 0,
      ativacaoReferencia: proposal.premissas.ativacaoReferencia || 'NÃO',
    }
    const variableData: TPricingVariableData = {
      kit: price,
      numModulos: moduleQty,
      plan: 0,
      product: 0,
      service: 0,
      potenciaPico: modulePeakPower,
      distancia: proposal.premissas.distancia || 0,
      numInversores: inverterQty,
      valorReferencia: proposal.premissas.valorReferencia || 0,
      consumoEnergiaMensal: proposal.premissas.consumoEnergiaMensal || 0,
      tarifaEnergia: proposal.premissas.tarifaEnergia || 0,
      custosInstalacao: proposal.premissas.custosInstalacao || 0,
      custosPadraoEnergia: proposal.premissas.custosPadraoEnergia || 0,
      custosEstruturaInstalacao: proposal.premissas.custosEstruturaInstalacao || 0,
      custosOutros: proposal.premissas.custosOutros || 0,
    }

    const pricing = handlePricingCalculation({
      methodology: methodology,
      conditionData,
      variableData,
    })
    const total = getPricingTotal({ pricing })
    setProposal((prev) => ({
      ...prev,
      idMetodologiaPrecificacao: methodologyId,
      kits: [{ id: '', nome: kitName, preco: price, valor: total }],
      produtos: products,
      servicos: services,
      precificacao: pricing,
      potenciaPico: modulePeakPower,
    }))
    goToNextStage()
  }
  return (
    <div id="new-proposa-only-kit" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
      <div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[70%]">
        <div className="flex h-full flex-col">
          <div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
            <h3 className="text-xl font-bold text-[#353432] dark:text-white ">NOVO KIT</h3>
            <button
              onClick={() => closeModal()}
              type="button"
              className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          <div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
            <GeneralInformationBlock infoHolder={kitInfo} setInfoHolder={setKitInfo} pricingMethods={pricingMethods || []} />
            <ProductCompositionBlock infoHolder={kitInfo} setInfoHolder={setKitInfo} />
            <ServicesCompositionBlock infoHolder={kitInfo} setInfoHolder={setKitInfo} />
            <div className="flex w-full items-center justify-end p-2">
              <button
                onClick={() => {
                  handleProceed()
                }}
                className="h-9 whitespace-nowrap rounded bg-green-700 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-green-600 enabled:hover:text-white"
              >
                PROSSEGUIR COM KIT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProposalKit
