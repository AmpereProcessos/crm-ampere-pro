import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { editProposal } from '@/utils/mutations/proposals';
import {
  getPricingSuggestedTotal,
  getPricingTotal,
  handleFinalPriceCorrection,
  handlePricingCalculation,
  TPricingConditionData,
  TPricingVariableData,
} from '@/utils/pricing/methods';
import { useSignaturePlanById } from '@/utils/queries/signature-plans';
import { TOpportunityDTO } from '@/utils/schemas/opportunity.schema';
import { TPricingItem, TProposal, TProposalDTO } from '@/utils/schemas/proposal.schema';
import { TSignaturePlanDTOWithPricingMethod } from '@/utils/schemas/signature-plans.schema';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { VscChromeClose } from 'react-icons/vsc';
import PricingTable from './PricingTable';

type DefinePlanProps = {
  proposalPlan: TProposal['planos'][number];
  proposal: TProposalDTO;
  opportunity: TOpportunityDTO;
  userHasPricingViewPermission: boolean;
  userHasPricingEditPermission: boolean;
  closeModal: () => void;
};
function DefinePlan({
  proposalPlan,
  proposal,
  opportunity,
  userHasPricingEditPermission,
  userHasPricingViewPermission,
  closeModal,
}: DefinePlanProps) {
  const queryClient = useQueryClient();
  const { data: plan } = useSignaturePlanById({ id: proposalPlan.id });
  const [pricing, setPricing] = useState<TPricingItem[]>([]);
  function getPricing(plan?: TSignaturePlanDTOWithPricingMethod) {
    if (!plan) return [];
    const conditionData: TPricingConditionData = {
      uf: opportunity.localizacao.uf,
      cidade: opportunity.localizacao.cidade,
      topologia: proposal.premissas.topologia || 'INVERSOR',
      grupoInstalacao: proposal.premissas.grupoInstalacao || 'RESIDENCIAL',
      tipoEstrutura: proposal.premissas.tipoEstrutura || 'Fibrocimento',
      faseamentoEletrico: proposal.premissas.faseamentoEletrico || 'MONOFÁSICO',
      idParceiro: opportunity.idParceiro,
      numModulos: proposal.premissas.numModulos || 0,
      numInversores: proposal.premissas.numInversores || 0,
      potenciaPico: proposal.premissas.potenciaPico || 0,
      distancia: proposal.premissas.distancia || 0,
      valorReferencia: proposal.premissas.valorReferencia || 0,
      ativacaoReferencia: proposal.premissas.ativacaoReferencia || 'NÃO',
    };
    const variableData: TPricingVariableData = {
      kit: 0,
      plan: plan.preco,
      numModulos: proposal.premissas.numModulos || 0,
      product: 0,
      service: 0,
      numInversores: proposal.premissas.numInversores || 0,
      potenciaPico: proposal.premissas.potenciaPico || 0,
      distancia: proposal.premissas.distancia || 0,
      valorReferencia: proposal.premissas.valorReferencia || 0,
      consumoEnergiaMensal: proposal.premissas.consumoEnergiaMensal || 0,
      tarifaEnergia: proposal.premissas.tarifaEnergia || 0,
      custosInstalacao: proposal.premissas.custosInstalacao || 0,
      custosPadraoEnergia: proposal.premissas.custosPadraoEnergia || 0,
      custosEstruturaInstalacao: proposal.premissas.custosEstruturaInstalacao || 0,
      custosOutros: proposal.premissas.custosOutros || 0,
    };
    const pricing = handlePricingCalculation({
      methodology: plan.metodologia,
      plan: { name: plan.nome, price: plan.preco, tax: 0, profitMargin: 12 },
      conditionData,
      variableData,
    });
    return pricing;
  }
  async function defineProposalPlan({ newPricing }: { newPricing: TPricingItem[] }) {
    const definedPricingTotal = getPricingTotal({ pricing: newPricing });
    const definedPlan: TProposal['planos'][number] = { ...proposalPlan, valor: definedPricingTotal };
    // Updating the proposal for the defined plan and is corresponding pricing
    await editProposal({ id: proposal._id, changes: { precificacao: newPricing, planos: [definedPlan], valor: definedPricingTotal } });
    return 'Plano selecionado com sucesso !';
  }
  const { mutate: handleDefineProposalPlan, isPending } = useMutationWithFeedback({
    mutationKey: ['define-proposal-plan'],
    mutationFn: defineProposalPlan,
    queryClient: queryClient,
    affectedQueryKey: ['proposal-by-id', proposal._id],
    callbackFn: () => closeModal(),
  });
  useEffect(() => {
    if (!plan) return;
    const p = getPricing(plan);
    console.log(p);
    const pricingSuggestedTotal = getPricingSuggestedTotal({ pricing: p });
    const diff = pricingSuggestedTotal - (proposalPlan.valor || 0);
    const diffPercentage = diff / pricingSuggestedTotal;
    // Getting the ajusted pricing given the percentage of the difference
    const ajustedPricing = handleFinalPriceCorrection({ diffPercentage, pricing: p });
    setPricing(ajustedPricing);
  }, [plan]);
  return (
    <div id='edit-final-price' className='fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]'>
      <div className='fixed left-[50%] top-[50%] z-100 flex h-fit max-h-[90%] w-[90%] translate-x-[-50%] translate-y-[-50%] flex-col rounded-md bg-background p-[10px] lg:w-[80%]'>
        <div className='flex flex-wrap items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg'>
          <h3 className='text-xl font-bold text-primary  '>DEFINIÇÃO DE PLANO</h3>
          <button
            onClick={() => closeModal()}
            type='button'
            className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
          >
            <VscChromeClose style={{ color: 'red' }} />
          </button>
        </div>
        <div className='flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
          <p className='w-full text-center text-sm tracking-tight text-primary/70'>
            Escolha somente quando houver certeza do plano de assinatura a ser vendido.
          </p>
          <p className='w-full text-center text-sm tracking-tight text-primary/70'>
            A ação de escolha do plano é <strong className='text-orange-500'>irreversível.</strong>{' '}
          </p>
          <p className='w-full text-center text-sm tracking-tight text-primary/70'>
            Ao escolher um plano, sua proposta perderá as opções dos demais planos selecionados.
          </p>
          {userHasPricingViewPermission ? (
            <PricingTable
              opportunity={opportunity}
              proposal={proposal}
              pricing={pricing}
              setPricing={setPricing}
              userHasPricingEditPermission={userHasPricingEditPermission}
              userHasPricingViewPermission={userHasPricingViewPermission}
            />
          ) : null}
        </div>
        <div className='flex w-full items-center justify-end p-2'>
          <button
            onClick={() => {
              // @ts-ignore
              handleDefineProposalPlan({ newPricing: pricing });
            }}
            disabled={isPending}
            className='h-9 whitespace-nowrap rounded-sm bg-blue-800 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-blue-800 enabled:hover:text-primary-foreground'
          >
            ESCOLHER PLANO
          </button>
        </div>
      </div>
    </div>
  );
}

export default DefinePlan;
