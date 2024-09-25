import ProposalProduct from '@/components/Cards/ProposalProduct'
import ErrorComponent from '@/components/utils/ErrorComponent'
import LoadingComponent from '@/components/utils/LoadingComponent'
import { combineUniqueProducts } from '@/lib/methods/array-manipulation'
import { getInverterQty, getModulesPeakPotByProducts, getModulesQty } from '@/lib/methods/extracting'
import { formatToMoney } from '@/lib/methods/formatting'
import { renderCategoryIcon } from '@/lib/methods/rendering'
import { TPricingConditionData, TPricingVariableData, getPricingTotal, handlePricingCalculation } from '@/utils/pricing/methods'
import { useComercialProducts, useComercialProductsWithPricingMethod } from '@/utils/queries/products'
import { TProductItem } from '@/utils/schemas/kits.schema'
import { TOpportunityDTOWithClient, TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from '@/utils/schemas/opportunity.schema'
import { TProductDTOWithPricingMethod } from '@/utils/schemas/products.schema'
import { TProposal, TProposalProduct } from '@/utils/schemas/proposal.schema'
import { Session } from 'next-auth'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { AiOutlineSafety } from 'react-icons/ai'
import { FaIndustry } from 'react-icons/fa'
import { ImPower, ImSad } from 'react-icons/im'
import { MdAttachMoney } from 'react-icons/md'

type ProductsSelectionProps = {
  opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences
  infoHolder: TProposal
  setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>
  moveToNextStage: () => void
  moveToPreviousStage: () => void
  setApplicablePaymentMethodsIds: React.Dispatch<React.SetStateAction<string[]>>
  session: Session
}
function ProductsSelection({
  opportunity,
  infoHolder,
  setInfoHolder,
  moveToNextStage,
  moveToPreviousStage,
  setApplicablePaymentMethodsIds,
  session,
}: ProductsSelectionProps) {
  const [selectedProducts, setSelectedProducts] = useState<(TProductDTOWithPricingMethod & { qtde: number; valorFinal: number })[]>([])
  const { data: products, isLoading, isError, isSuccess } = useComercialProductsWithPricingMethod()
  const userHasPricingView = session.user.permissoes.precos.visualizar

  function selectProduct(product: TProductDTOWithPricingMethod & { qtde: number; valorFinal: number }) {
    if (product.qtde <= 0) return toast.error('Preencha uma quantidade válida para o produto.')
    if (selectedProducts.some((k) => k.idMetodologiaPrecificacao != product.idMetodologiaPrecificacao))
      return toast.error('Não é permitida a adição de produtos de diferentes metodologias de precificação.')

    const newSelectedProducts = [...selectedProducts]
    newSelectedProducts.push(product)
    setSelectedProducts([...newSelectedProducts])
    return toast.success('Produto adicionado com sucesso !')
  }

  function getCompositionData() {
    if (selectedProducts.length == 0) return null
    const topology = infoHolder.premissas.topologia
    const methodology = selectedProducts[0].metodologia
    const selectedProductsFormatted: TProposalProduct[] = selectedProducts.map((product) => ({
      id: product._id,
      categoria: product.categoria,
      fabricante: product.fabricante,
      modelo: product.modelo,
      qtde: product.qtde,
      potencia: product.potencia,
      garantia: product.garantia,
      valor: product.valorFinal,
      preco: product.preco,
    }))
    const productName = selectedProducts.map((s) => s.modelo).join(' + ')
    const products = combineUniqueProducts(selectedProductsFormatted)
    const productPrice = selectedProductsFormatted.reduce((acc, current) => acc + (current.preco || 0), 0)
    const moduleQty = getModulesQty(products)
    const inverterQty = getInverterQty(products)
    const modulePeakPower = getModulesPeakPotByProducts(products)
    const conditionData: TPricingConditionData = {
      uf: opportunity.localizacao.uf,
      cidade: opportunity.localizacao.cidade,
      topologia: topology || 'INVERSOR',
      tipoEstrutura: infoHolder.premissas.tipoEstrutura || 'Fibrocimento',
      grupoInstalacao: infoHolder.premissas.grupoInstalacao || 'RESIDENCIAL',
      faseamentoEletrico: infoHolder.premissas.faseamentoEletrico || 'MONOFÁSICO',
      idParceiro: opportunity.idParceiro,
      numModulos: infoHolder.premissas.numModulos || 0,
      numInversores: infoHolder.premissas.numInversores || 0,
      potenciaPico: infoHolder.premissas.potenciaPico || 0,
      distancia: infoHolder.premissas.distancia || 0,
      valorReferencia: infoHolder.premissas.valorReferencia || 0,
      ativacaoReferencia: infoHolder.premissas.ativacaoReferencia || 'NÃO',
    }
    const variableData: TPricingVariableData = {
      kit: 0,
      numModulos: moduleQty,
      product: productPrice,
      service: 0,
      potenciaPico: modulePeakPower,
      distancia: infoHolder.premissas.distancia || 0,
      plan: 0,
      numInversores: inverterQty,
      valorReferencia: infoHolder.premissas.valorReferencia || 0,
      consumoEnergiaMensal: infoHolder.premissas.consumoEnergiaMensal || 0,
      tarifaEnergia: infoHolder.premissas.tarifaEnergia || 0,
      custosInstalacao: infoHolder.premissas.custosInstalacao || 0,
      custosPadraoEnergia: infoHolder.premissas.custosPadraoEnergia || 0,
      custosEstruturaInstalacao: infoHolder.premissas.custosEstruturaInstalacao || 0,
      custosOutros: infoHolder.premissas.custosOutros || 0,
    }
    const pricing = handlePricingCalculation({
      methodology: methodology,
      conditionData,
      variableData,
    })

    const totalPrice = getPricingTotal({ pricing })

    return {
      nome: productName,
      topologia: topology,
      produtos: products,
      valor: totalPrice,
      potenciaPico: modulePeakPower,
    }
  }
  function renderComposition() {
    const data = getCompositionData()
    if (!data) return <p className="w-full text-center text-xs italic text-gray-500">Nenhum produto selecionado para a composição do sistema...</p>
    const { nome, topologia, produtos, valor, potenciaPico } = data
    return (
      <div className="flex w-full flex-col gap-1">
        <h1 className="font-bold leading-none tracking-tight">{nome}</h1>
        <div className="mt-2 flex w-full items-center gap-2">
          <div className="flex items-center gap-1 text-green-500">
            <MdAttachMoney />
            <p className="text-[0.65rem] font-bold lg:text-sm">{formatToMoney(valor)}</p>
          </div>
          <div className="flex items-center gap-1 text-red-500">
            <ImPower color="rgb(239,68,68)" />
            <p className="text-[0.65rem] font-bold lg:text-sm">{potenciaPico} kW</p>
          </div>
        </div>
        <h1 className="mb-0 mt-2 text-xs font-bold leading-none tracking-tight text-gray-500 lg:text-sm">PRODUTOS</h1>
        {produtos.map((product, index) => (
          <div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-200 p-2">
            <div className="flex w-full flex-col items-start justify-between gap-2">
              <div className="flex items-center gap-1">
                <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full border border-black p-1 text-[15px]">
                  {renderCategoryIcon(product.categoria)}
                </div>
                <p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">
                  <strong className="text-[#FF9B50]">{product.qtde}</strong> x {product.modelo}
                </p>
              </div>
              <div className="flex w-full items-center justify-end gap-2 pl-2">
                <div className="flex items-center gap-1">
                  <FaIndustry size={12} />
                  <p className="text-[0.6rem] font-light text-gray-500 lg:text-xs">{product.fabricante}</p>
                </div>
                <div className="flex items-center gap-1">
                  <ImPower size={12} />
                  <p className="text-[0.6rem] font-light text-gray-500 lg:text-xs">{product.potencia} W</p>
                </div>
                <div className="flex items-center gap-1">
                  <AiOutlineSafety size={12} />
                  <p className="text-[0.6rem] font-light text-gray-500 lg:text-xs">{product.garantia} ANOS</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  function handleProceed() {
    if (selectedProducts.length == 0) return toast.error('Selecione ao menos um produto para prosseguir.')
    const topology = infoHolder.premissas.topologia
    const methodology = selectedProducts[0].metodologia
    const methodologyId = selectedProducts[0].idMetodologiaPrecificacao
    const paymentMethodsIds = [...new Set(selectedProducts.flatMap((x) => x.idsMetodologiasPagamento))]
    const selectedProductsFormatted: TProposalProduct[] = selectedProducts.map((product) => ({
      id: product._id,
      categoria: product.categoria,
      fabricante: product.fabricante,
      modelo: product.modelo,
      qtde: product.qtde,
      potencia: product.potencia,
      garantia: product.garantia,
      valor: product.valorFinal,
      preco: product.preco,
    }))
    const productName = selectedProducts.map((s) => s.modelo).join(' + ')
    const products = combineUniqueProducts(selectedProductsFormatted)
    const price = selectedProductsFormatted.reduce((acc, current) => acc + (current.preco || 0), 0)
    const moduleQty = getModulesQty(products)
    const inverterQty = getInverterQty(products)
    const modulePeakPower = getModulesPeakPotByProducts(products)
    const conditionData: TPricingConditionData = {
      uf: opportunity.localizacao.uf,
      cidade: opportunity.localizacao.cidade,
      topologia: topology || 'INVERSOR',
      tipoEstrutura: infoHolder.premissas.tipoEstrutura || 'Fibrocimento',
      grupoInstalacao: infoHolder.premissas.grupoInstalacao || 'RESIDENCIAL',
      faseamentoEletrico: infoHolder.premissas.faseamentoEletrico || 'MONOFÁSICO',
      idParceiro: opportunity.idParceiro,
      numModulos: moduleQty,
      numInversores: inverterQty,
      potenciaPico: modulePeakPower,
      distancia: infoHolder.premissas.distancia || 0,
      valorReferencia: infoHolder.premissas.valorReferencia || 0,
      ativacaoReferencia: infoHolder.premissas.ativacaoReferencia || 'NÃO',
    }
    const variableData: TPricingVariableData = {
      kit: 0,
      numModulos: moduleQty,
      product: price,
      service: 0,
      potenciaPico: modulePeakPower,
      distancia: infoHolder.premissas.distancia || 0,
      plan: 0,
      numInversores: inverterQty,
      valorReferencia: infoHolder.premissas.valorReferencia || 0,
      consumoEnergiaMensal: infoHolder.premissas.consumoEnergiaMensal || 0,
      tarifaEnergia: infoHolder.premissas.tarifaEnergia || 0,
      custosInstalacao: infoHolder.premissas.custosInstalacao || 0,
      custosPadraoEnergia: infoHolder.premissas.custosPadraoEnergia || 0,
      custosEstruturaInstalacao: infoHolder.premissas.custosEstruturaInstalacao || 0,
      custosOutros: infoHolder.premissas.custosOutros || 0,
    }
    const pricing = handlePricingCalculation({
      methodology: methodology,
      conditionData,
      variableData,
    })
    setApplicablePaymentMethodsIds(paymentMethodsIds)
    setInfoHolder((prev) => ({
      ...prev,
      idMetodologiaPrecificacao: methodologyId,
      produtos: products,
      precificacao: pricing,
      potenciaPico: modulePeakPower,
    }))
    moveToNextStage()
  }
  console.log(selectedProducts)
  return (
    <div className="flex min-h-[400px] w-full flex-col gap-2 py-4">
      <div className="flex w-full items-center justify-center">
        <h1 className="text-center font-medium italic text-[#fead61]">
          Nessa etapa por favor escolha os produtos que melhor se adequem as necessidades desse projeto.
        </h1>
      </div>
      <div className="flex w-full flex-col rounded-md border border-gray-200 p-3">
        <div className="flex w-full items-center justify-between">
          <h1 className="font-bold leading-none tracking-tight">COMPOSIÇÃO</h1>
        </div>
        <div className="mt-2 flex w-full flex-col gap-1">{renderComposition()}</div>
      </div>
      <div className="flex h-[600px] w-full grow overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
        <div className="flex h-fit w-full flex-wrap items-stretch justify-center gap-2 py-2">
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent /> : null}
          {isSuccess ? (
            products.length > 0 ? (
              products.map((product) => (
                <ProposalProduct
                  key={product._id}
                  product={product}
                  opportunity={opportunity}
                  proposal={infoHolder}
                  handleClick={(product) => selectProduct(product)}
                  userHasPricingView={userHasPricingView}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-4">
                <ImSad style={{ fontSize: '50px', color: '#fead61' }} />
                <p className="flex w-full items-center justify-center py-2 text-center font-medium italic tracking-tight text-gray-500">
                  Nenhum produto encontrado.
                </p>
              </div>
            )
          ) : null}
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-2 px-1">
        <button onClick={() => moveToPreviousStage()} className="rounded p-2 font-bold text-gray-500 duration-300 hover:scale-105">
          Voltar
        </button>
        <button onClick={() => handleProceed()} className="rounded p-2 font-bold hover:bg-black hover:text-white">
          Prosseguir
        </button>
      </div>
    </div>
  )
}

export default ProductsSelection
