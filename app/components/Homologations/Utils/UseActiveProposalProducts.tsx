import { fetchProposalById } from '@/utils/queries/proposals'
import { THomologation } from '@/utils/schemas/homologation.schema'
import { TOpportunity } from '@/utils/schemas/opportunity.schema'

import React from 'react'

type UseActiveProposalProductsProps = {
  activeProposalId: string
  getProducts: (products: THomologation['equipamentos']) => void
}
function UseActiveProposalProducts({ activeProposalId, getProducts }: UseActiveProposalProductsProps) {
  async function handleUseProducts(id: string) {
    try {
      const proposal = await fetchProposalById(id)
      const products: THomologation['equipamentos'] = proposal.produtos
        .filter((p) => p.categoria == 'MÓDULO' || p.categoria == 'INVERSOR')
        .map((p) => ({
          categoria: p.categoria as 'MÓDULO' | 'INVERSOR',
          fabricante: p.fabricante,
          modelo: p.modelo,
          qtde: p.qtde,
          potencia: p.potencia || 0,
        }))
      return getProducts(products)
    } catch (error) {
      throw error
    }
  }
  return (
    <div className="my-2 flex w-full flex-col gap-1">
      <p className="w-full text-center text-sm leading-none tracking-tight text-gray-500">
        Deseja utilizar os equipamentos da proposta ativa ? <strong className="text-cyan-500">Clique no botão abaixo</strong>
      </p>
      <div className="flex w-full items-center justify-center">
        <button onClick={() => handleUseProducts(activeProposalId)} className="rounded-md bg-black px-2 py-1 text-sm font-bold text-white">
          UTILIZAR EQUIPAMENTOS
        </button>
      </div>
    </div>
  )
}

export default UseActiveProposalProducts
