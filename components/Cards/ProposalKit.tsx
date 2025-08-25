import { AiOutlineSafety } from 'react-icons/ai';
import { BsCalendar3EventFill, BsCalendarPlusFill } from 'react-icons/bs';
import { FaBolt, FaIndustry } from 'react-icons/fa';
import { ImPower } from 'react-icons/im';
import { IoMdAdd } from 'react-icons/io';
import { MdAttachMoney, MdOutlineMiscellaneousServices, MdSell } from 'react-icons/md';
import { TbTopologyFull } from 'react-icons/tb';

import { TPricingConditionData, TPricingVariableData, getPricingTotal, handlePricingCalculation } from '@/utils/pricing/methods';
import { TKitDTOWithPricingMethod } from '@/utils/schemas/kits.schema';
import { TOpportunityDTO } from '@/utils/schemas/opportunity.schema';
import { TProposal } from '@/utils/schemas/proposal.schema';

import { formatToMoney, getEstimatedGen } from '@/utils/methods';

import { getInverterQty, getModulesPeakPotByProducts, getModulesQty } from '@/lib/methods/extracting';
import { formatDateAsLocale, formatDecimalPlaces } from '@/lib/methods/formatting';
import { renderCategoryIcon } from '@/lib/methods/rendering';
type KitCardProps = {
  kit: TKitDTOWithPricingMethod;
  proposal: TProposal;
  opportunity: TOpportunityDTO;
  handleClick: (info: TKitDTOWithPricingMethod & { valorFinal: number }) => void;
  userHasPricingView: boolean;
};
function ProposalKit({ kit, proposal, opportunity, handleClick, userHasPricingView }: KitCardProps) {
  // Getting proposal total preview
  const conditionData: TPricingConditionData = {
    uf: opportunity.localizacao.uf,
    cidade: opportunity.localizacao.cidade,
    topologia: kit.topologia,
    grupoInstalacao: proposal.premissas.grupoInstalacao || 'RESIDENCIAL',
    tipoEstrutura: proposal.premissas.tipoEstrutura || 'Fibrocimento',
    faseamentoEletrico: proposal.premissas.faseamentoEletrico || 'MONOFÁSICO',
    idParceiro: opportunity.idParceiro,
    numModulos: getModulesQty(kit.produtos),
    numInversores: getInverterQty(kit.produtos),
    potenciaPico: getModulesPeakPotByProducts(kit.produtos),
    distancia: proposal.premissas.distancia || 0,
    valorReferencia: proposal.premissas.valorReferencia || 0,
    ativacaoReferencia: proposal.premissas.ativacaoReferencia || 'NÃO',
  };
  const variableData: TPricingVariableData = {
    kit: kit.preco,
    plan: 0,
    product: 0,
    service: 0,
    numModulos: getModulesQty(kit.produtos),
    numInversores: getInverterQty(kit.produtos),
    potenciaPico: getModulesPeakPotByProducts(kit.produtos),
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
    methodology: kit.metodologia,
    kit: { name: kit.nome, price: kit.preco, tax: 0, profitMargin: 12 },
    conditionData,
    variableData,
  });
  const proposalTotalPreview = getPricingTotal({ pricing: pricing });
  const estimatedGeneration = getEstimatedGen(
    getModulesPeakPotByProducts(kit.produtos),
    opportunity.localizacao.cidade,
    opportunity.localizacao.uf,
    proposal.premissas.orientacao || 'NORTE'
  );
  return (
    <div className='flex min-h-[325px] w-full gap-2 rounded-md border border-primary/30 font-Inter shadow-md lg:w-[600px]'>
      <div className={`h-full w-[6px] ${kit.ativo ? 'bg-blue-500' : 'bg-primary/50'} rounded-bl-md rounded-tl-md`}></div>
      <div className='flex grow flex-col p-3'>
        <h1 className='font-Inter font-bold leading-none tracking-tight'>{kit.nome}</h1>

        <div className='flex w-full grow flex-col'>
          <div className='mt-2 flex w-full flex-wrap items-center gap-2'>
            <div className='flex items-center gap-1 text-green-500'>
              <MdSell />
              <p className='text-[0.65rem] font-bold lg:text-[0.8rem]'>{formatToMoney(proposalTotalPreview)}</p>
            </div>

            {userHasPricingView ? (
              <div className='flex items-center gap-1 text-yellow-500'>
                <MdAttachMoney />
                <p className='text-[0.65rem] font-bold lg:text-[0.8rem]'>{formatToMoney(kit.preco)}</p>
              </div>
            ) : null}

            <div className='flex items-center gap-1 text-red-500'>
              <ImPower color='rgb(239,68,68)' />
              <p className='text-[0.65rem] font-bold lg:text-[0.8rem]'>{kit.potenciaPico} kW</p>
            </div>
            {estimatedGeneration ? (
              <div className='flex items-center gap-1 text-[#9e0059]'>
                <FaBolt />
                <p className='text-[0.65rem] font-bold lg:text-[0.8rem]'>{formatDecimalPlaces(estimatedGeneration)} kWh</p>
              </div>
            ) : null}
            <div className='flex items-center gap-1'>
              <TbTopologyFull />
              <p className='text-[0.65rem] font-light lg:text-[0.8rem]'>{kit.topologia}</p>
            </div>
          </div>
          <h1 className='my-2 mb-0 text-xs font-bold leading-none tracking-tight text-primary/70 lg:text-sm'>PRODUTOS</h1>
          {kit.produtos.map((product, index) => (
            <div key={index} className='mt-1 flex w-full flex-col rounded-md border border-primary/30 p-2'>
              <div className='flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center'>
                <div className='flex items-center gap-1'>
                  <div className='flex h-[20px] w-[20px] items-center justify-center rounded-full border border-black p-1 text-[15px]'>
                    {renderCategoryIcon(product.categoria)}
                  </div>
                  <p className='text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs'>
                    <strong className='text-[#FF9B50]'>{product.qtde}</strong> x {product.modelo}
                  </p>
                </div>
                <div className='flex w-full grow items-center justify-end gap-2 pl-2 lg:w-fit'>
                  <div className='flex items-center gap-1'>
                    <FaIndustry size={12} />
                    <p className='text-[0.6rem] font-light text-primary/70'>{product.fabricante}</p>
                  </div>
                  <div className='flex items-center gap-1'>
                    <ImPower size={12} />
                    <p className='text-[0.6rem] font-light text-primary/70'>{product.potencia} W</p>
                  </div>
                  <div className='flex items-center gap-1'>
                    <AiOutlineSafety size={12} />
                    <p className='text-[0.6rem] font-light text-primary/70'>{product.garantia} ANOS</p>
                  </div>
                </div>
              </div>
            </div>
            // <ProductItem product={module} index={index} removeProductFromKit={(index) => console.log()} showRemoveButton={false} />
          ))}
          <h1 className='my-2 mb-0 text-xs font-bold leading-none tracking-tight text-primary/70 lg:text-sm'>SERVIÇOS</h1>
          <div className='flex w-full flex-wrap items-center gap-2'>
            {kit.servicos.map((service, index) => (
              <div key={index} className='mt-1 flex flex-col rounded-md border border-primary/30 p-2'>
                <div className='flex w-full items-center justify-between gap-2'>
                  <div className='flex  items-center gap-1'>
                    <div className='flex h-[20px] w-[20px] items-center justify-center rounded-full border border-black p-1'>
                      <MdOutlineMiscellaneousServices />
                    </div>
                    <p className='text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs'>{service.descricao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='mt-2 flex w-full items-center justify-between'>
          <div className='flex items-center gap-2'>
            {kit.dataValidade ? (
              <div className={`flex items-center gap-2 text-primary/70`}>
                <BsCalendar3EventFill />
                <p className='text-[0.6rem] font-medium'>
                  Valido até: <strong className='text-orange-500'>{formatDateAsLocale(kit.dataValidade)}</strong>{' '}
                </p>
              </div>
            ) : null}
          </div>

          <div className='flex items-center gap-2'>
            <div className={`hidden items-center gap-2 text-primary/70 lg:flex`}>
              <BsCalendarPlusFill />
              <p className='text-[0.6rem] font-medium'>{formatDateAsLocale(kit.dataInsercao)}</p>
            </div>
            <button
              onClick={() => handleClick({ ...kit, valorFinal: proposalTotalPreview })}
              className='rounded-full border border-cyan-500 p-1 text-cyan-500 duration-300 ease-in-out hover:bg-cyan-500 hover:text-primary-foreground'
            >
              <IoMdAdd />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProposalKit;
