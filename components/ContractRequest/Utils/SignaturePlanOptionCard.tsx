import { formatToMoney } from '@/utils/methods';
import { getPricingTotal, handlePricingCalculation, TPricingConditionData, TPricingVariableData } from '@/utils/pricing/methods';
import { TOpportunityDTO } from '@/utils/schemas/opportunity.schema';
import { TProposalDTO } from '@/utils/schemas/proposal.schema';
import { TSignaturePlanDTOWithPricingMethod } from '@/utils/schemas/signature-plans.schema';
import { AiOutlineSafety } from 'react-icons/ai';
import { IoMdAdd } from 'react-icons/io';
import { MdOutlineMiscellaneousServices, MdReplay, MdSell } from 'react-icons/md';

type SignaturePlanOptionCardProps = {
  activePlanName: string;
  plan: TSignaturePlanDTOWithPricingMethod;
  proposal: TProposalDTO;
  opportunity: TOpportunityDTO;
  handleSelect: (x: TSignaturePlanDTOWithPricingMethod & { valorTotal: number }) => void;
};
function SignaturePlanOptionCard({ activePlanName, plan, proposal, opportunity, handleSelect }: SignaturePlanOptionCardProps) {
  // Getting proposal total preview
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
  console.log('AAAAAAAAAAAAAAAA', plan.nome, pricing, variableData);
  const proposalTotalPreview = getPricingTotal({ pricing: pricing });

  return (
    <div className='flex min-h-[250px] w-full gap-2 rounded-md border border-primary/30 shadow-md lg:w-[800px]'>
      <div className='flex w-full grow flex-col p-3'>
        <div className='flex w-full grow flex-col'>
          <div className='flex w-full items-center justify-between gap-2'>
            <h1 className='grow  text-center text-sm font-black leading-none tracking-tight lg:text-start'>{plan.nome || 'NÃO DEFINIDO'}</h1>
            {plan.nome == activePlanName ? (
              <h1 className='rounded-full bg-green-600 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs'>SELECIONADO</h1>
            ) : null}
          </div>
          <div className='mt-2 flex w-full items-center gap-2'>
            <div className='flex items-center gap-1 text-green-500'>
              <MdSell />
              <p className='text-[0.65rem] font-bold lg:text-sm'>{formatToMoney(proposalTotalPreview)}</p>
            </div>
            <div className='flex items-center gap-1'>
              <MdReplay />
              <p className='text-[0.65rem] font-light lg:text-sm'>{plan.intervalo.tipo}</p>
            </div>
          </div>
          <div className='flex w-full grow flex-col'>
            <h1 className='my-2 mb-0 text-xs font-bold leading-none tracking-tight text-primary/50 lg:text-sm'>SERVIÇOS</h1>
            <div className='flex w-full flex-wrap items-center gap-2'>
              {plan.servicos.map((service, index) => (
                <div key={index} className='mt-1 flex flex-col gap-1 rounded-md border border-primary/30 p-2'>
                  <div className='flex w-full items-center justify-between gap-2'>
                    <div className='flex items-center gap-1'>
                      <div className='flex h-[20px] w-[20px] items-center justify-center rounded-full border border-black p-1'>
                        <MdOutlineMiscellaneousServices />
                      </div>
                      <p className='text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs'>{service.descricao}</p>
                    </div>
                  </div>
                  <div className='flex w-full items-center justify-end gap-1'>
                    <AiOutlineSafety size={12} />
                    <p className='text-[0.6rem] font-light text-primary/50'>
                      {service.garantia > 1 ? `${service.garantia} ANOS` : `${service.garantia} ANO`}{' '}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className='mt-2 flex w-full items-center justify-end gap-2'>
            <button
              onClick={() => handleSelect({ ...plan, valorTotal: proposalTotalPreview })}
              className='rounded-full border border-cyan-500 p-1 text-cyan-500 duration-300 ease-in-out hover:bg-cyan-500 hover:text-white'
            >
              <IoMdAdd />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignaturePlanOptionCard;
