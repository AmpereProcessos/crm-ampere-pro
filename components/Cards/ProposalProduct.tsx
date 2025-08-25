import { renderCategoryIcon } from '@/lib/methods/rendering';
import { formatToMoney } from '@/utils/methods';
import { TPricingConditionData, TPricingVariableData, getPricingTotal, handlePricingCalculation } from '@/utils/pricing/methods';
import { TOpportunityDTO } from '@/utils/schemas/opportunity.schema';
import { TProductDTOWithPricingMethod } from '@/utils/schemas/products.schema';
import { TProposal } from '@/utils/schemas/proposal.schema';
import { useState } from 'react';
import { AiOutlineSafety } from 'react-icons/ai';
import { FaIndustry } from 'react-icons/fa';
import { ImPower } from 'react-icons/im';
import { IoMdAdd } from 'react-icons/io';
import { MdAttachMoney } from 'react-icons/md';

type ProposalProductProps = {
  product: TProductDTOWithPricingMethod;
  proposal: TProposal;
  opportunity: TOpportunityDTO;
  handleClick: (info: TProductDTOWithPricingMethod & { qtde: number; valorFinal: number }) => void;
  userHasPricingView: boolean;
};
function ProposalProduct({ product, proposal, opportunity, handleClick, userHasPricingView }: ProposalProductProps) {
  const [qtyHolder, setQtyHolder] = useState<number>(1);
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
    numModulos: product.categoria == 'MÓDULO' ? 1 : 0,
    product: product.preco || 0,
    service: 0,
    numInversores: product.categoria == 'INVERSOR' ? 1 : 0,
    potenciaPico: product.potencia || 0,
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
    methodology: product.metodologia,
    conditionData,
    variableData,
  });
  const proposalTotalPreview = getPricingTotal({ pricing: pricing });

  return (
    <div className='flex w-full flex-col rounded-md border border-primary/40 bg-background p-3 lg:w-[450px]'>
      <div className='flex w-full items-center justify-between gap-2'>
        <div className='flex items-center gap-1 text-primary '>
          <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
            {renderCategoryIcon(product.categoria)}
          </div>
          <p className='text-xs font-medium leading-none tracking-tight lg:text-sm'>{product.modelo}</p>
        </div>
        <h1 className='rounded-full bg-black px-2 py-1 text-[0.65rem] font-bold text-primary-foreground lg:text-xs'>
          {formatToMoney(proposalTotalPreview)}
        </h1>
      </div>
      <div className='mt-2 flex w-full flex-col gap-1'>
        <div className='flex w-full items-center justify-end gap-2 pl-2'>
          {userHasPricingView ? (
            <div className='flex items-center gap-1'>
              <MdAttachMoney size={12} />
              <p className='text-[0.6rem] font-light text-primary/70 lg:text-xs'>{formatToMoney(product.preco || 0)}</p>
            </div>
          ) : null}

          <div className='flex items-center gap-1'>
            <FaIndustry size={12} />
            <p className='text-[0.6rem] font-light text-primary/70 lg:text-xs'>{product.fabricante}</p>
          </div>
          <div className='flex items-center gap-1'>
            <ImPower size={12} />
            <p className='text-[0.6rem] font-light text-primary/70 lg:text-xs'>{product.potencia} W</p>
          </div>
          <div className='flex items-center gap-1'>
            <AiOutlineSafety size={12} />
            <p className='text-[0.6rem] font-light text-primary/70 lg:text-xs'>{product.garantia} ANOS</p>
          </div>
        </div>
      </div>

      <div className='mt-4 flex w-full items-center justify-end gap-1'>
        <input
          value={qtyHolder}
          onChange={(e) => setQtyHolder(Number(e.target.value))}
          type='number'
          className='w-[100px] rounded-md border border-primary/30 p-2 text-xs shadow-md outline-hidden'
          placeholder='Quantidade'
        />
        <button
          onClick={() =>
            handleClick({ ...product, preco: qtyHolder * (product.preco || 0), qtde: qtyHolder, valorFinal: qtyHolder * proposalTotalPreview })
          }
          className='rounded-full border border-cyan-500 p-1 text-cyan-500 duration-300 ease-in-out hover:bg-cyan-500 hover:text-primary-foreground'
        >
          <IoMdAdd />
        </button>
      </div>
    </div>
  );
}

export default ProposalProduct;
