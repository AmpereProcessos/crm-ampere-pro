import { formatToMoney } from '@/utils/methods';
import { TPricingConditionData, TPricingVariableData, getPricingTotal, handlePricingCalculation } from '@/utils/pricing/methods';
import { TOpportunityDTO } from '@/utils/schemas/opportunity.schema';
import { TProposal } from '@/utils/schemas/proposal.schema';
import { TServiceDTOWithPricingMethod } from '@/utils/schemas/service.schema';
import { AiOutlineSafety } from 'react-icons/ai';
import { IoMdAdd } from 'react-icons/io';
import { MdAttachMoney, MdOutlineMiscellaneousServices, MdOutlineRemove } from 'react-icons/md';

type ProposalServiceProps = {
  index: number;
  selectedIds: string[];
  service: TServiceDTOWithPricingMethod;
  proposal: TProposal;
  opportunity: TOpportunityDTO;
  handleSelect: (id: TServiceDTOWithPricingMethod & { valorFinal: number }) => void;
  handleRemove: (index: number) => void;
  userHasPricingView: boolean;
};
function ProposalService({
  index,
  selectedIds,
  service,
  proposal,
  opportunity,
  handleSelect,
  handleRemove,
  userHasPricingView,
}: ProposalServiceProps) {
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
    plan: 0,
    numModulos: proposal.premissas.numModulos || 0,
    product: 0,
    service: service.preco || 0,
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
    methodology: service.metodologia,
    conditionData,
    variableData,
  });
  const proposalTotalPreview = getPricingTotal({ pricing: pricing });

  return (
    <div className='flex w-full flex-col rounded-md border border-primary/40 bg-background p-3 lg:w-[450px]'>
      <div className='flex w-full items-center justify-between gap-2'>
        <div className='flex items-center gap-1 text-primary '>
          <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
            <MdOutlineMiscellaneousServices />
          </div>
          <p className='text-xs font-medium leading-none tracking-tight lg:text-sm'>{service.descricao}</p>
        </div>
        <h1 className='rounded-full bg-black px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs'>{formatToMoney(proposalTotalPreview)}</h1>
      </div>
      <div className='mt-2 flex w-full items-center justify-end gap-2 pl-2'>
        <div className='flex items-center gap-1'>
          {userHasPricingView ? (
            <div className='flex items-center gap-1'>
              <MdAttachMoney size={12} />
              <p className='text-[0.6rem] font-light text-primary/50 lg:text-xs'>{formatToMoney(service.preco || 0)}</p>
            </div>
          ) : null}

          <AiOutlineSafety size={12} />
          <p className='text-[0.6rem] font-light text-primary/50 lg:text-xs'>{service.garantia} ANOS</p>
        </div>
      </div>

      <div className='mt-4 flex w-full items-center justify-end gap-1'>
        {!selectedIds.includes(service._id) ? (
          <button
            onClick={() => handleSelect({ ...service, valorFinal: proposalTotalPreview })}
            className='rounded-full border border-cyan-500 p-1 text-cyan-500 duration-300 ease-in-out hover:bg-cyan-500 hover:text-white'
          >
            <IoMdAdd />
          </button>
        ) : (
          <button
            onClick={() => handleRemove(index)}
            className='rounded-full border border-red-500 p-1 text-red-500 duration-300 ease-in-out hover:bg-red-500 hover:text-white'
          >
            <MdOutlineRemove />
          </button>
        )}
      </div>
    </div>
  );
}

export default ProposalService;
