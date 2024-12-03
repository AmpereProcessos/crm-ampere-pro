import { formatDecimalPlaces } from '@/lib/methods/formatting'
import { getMaxHomologationPowerEstimation } from '@/utils/methods'
import { TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from '@/utils/schemas/opportunity.schema'
import { TProposal } from '@/utils/schemas/proposal.schema'
import React from 'react'
import { TbAlertTriangleFilled } from 'react-icons/tb'

type AccessGrantingWarningProps = {
  proposal: TProposal
  opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences
  type: 'warn' | 'alert'
  projectTypeId: string
}
function AccessGrantingWarning({ proposal, opportunity, type, projectTypeId }: AccessGrantingWarningProps) {
  // PHOTOVOLTAIC ONLY
  if (projectTypeId != '6615785ddcb7a6e66ede9785') return null

  const extimatedMaxHomologationPower = getMaxHomologationPowerEstimation({
    group: proposal.premissas.grupoInstalacao,
    avgConsumption: proposal.premissas.consumoEnergiaMensal || 0,
  })
  if (opportunity.localizacao.uf != 'MG') return null
  if (type == 'warn')
    return (
      <div className="my-1 flex w-full flex-col gap-2 rounded-md bg-orange-500 p-2">
        <div className="flex w-full items-center justify-center gap-2">
          <TbAlertTriangleFilled color="#fff" />
          <h1 className="font-bold text-white">AVISO</h1>
        </div>
        <h1 className="w-full text-center text-xs font-medium leading-none tracking-tight text-white lg:text-sm">
          Para projetos em MG, levando em conta o consumo médio fornecido ({formatDecimalPlaces(proposal.premissas.consumoEnergiaMensal || 0)} kWh), é estimado
          uma potência de homologação máxima de:
        </h1>
        <h1 className="w-full text-center text-lg font-black text-white">{formatDecimalPlaces(extimatedMaxHomologationPower)} kW</h1>
      </div>
    )
  if (type == 'alert' && (proposal.potenciaPico || 0) > extimatedMaxHomologationPower)
    return (
      <div className="my-1 flex w-full flex-col gap-2 rounded-md bg-red-500 p-3">
        <div className="flex w-full items-center justify-center gap-2">
          <TbAlertTriangleFilled color="#fff" />
          <h1 className="font-bold text-white">ALERTA</h1>
        </div>
        <h1 className="w-full text-center text-xs font-medium leading-none tracking-tight text-white lg:text-sm">
          A proposta em questão ultrapassa a estimativa de potência máxima para homologação{' '}
          <strong>({formatDecimalPlaces(extimatedMaxHomologationPower)} kW)</strong>, isso aumenta o risco de pareceres de acesso com redução de potência.
        </h1>
      </div>
    )
  return null
}

export default AccessGrantingWarning
