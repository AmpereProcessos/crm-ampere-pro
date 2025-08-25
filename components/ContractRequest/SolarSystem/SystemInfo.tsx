import { getInverterPeakPowerByProducts, getInverterQty, getModulesPeakPotByProducts, getModulesQty } from '@/lib/methods/extracting';
import { renderCategoryIcon } from '@/lib/methods/rendering';

import { TContractRequest } from '@/utils/schemas/integrations/app-ampere/contract-request.schema';
import { TProposalDTOWithOpportunity } from '@/utils/schemas/proposal.schema';
import React from 'react';
import { AiOutlineSafety } from 'react-icons/ai';
import { FaIndustry, FaSolarPanel } from 'react-icons/fa';
import { ImPower } from 'react-icons/im';
import { MdOutlineMiscellaneousServices } from 'react-icons/md';
import { TbTopologyFull } from 'react-icons/tb';
type SystemInfoProps = {
  requestInfo: TContractRequest;
  setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
  goToPreviousStage: () => void;
  goToNextStage: () => void;
  proposal: TProposalDTOWithOpportunity;
};
function SystemInfo({ requestInfo, setRequestInfo, goToPreviousStage, goToNextStage, proposal }: SystemInfoProps) {
  return (
    <div className='flex w-full grow flex-col bg-background pb-2'>
      <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>DADOS DO SISTEMA</span>
      <div className='mt-2 flex w-full flex-col items-center justify-around gap-2 lg:flex-row'>
        <div className='flex min-h-[80px] w-full flex-col rounded-xl border border-primary/30 bg-background p-4 shadow-md lg:w-1/4 lg:p-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-sm font-medium uppercase tracking-tight'>POTÊNCIA DE MÓDULOS</h1>
            <ImPower />
          </div>
          <div className='mt-2 flex w-full flex-col'>
            <div className='text-xl font-bold text-[#15599a] lg:text-2xl'>{getModulesPeakPotByProducts(proposal.produtos)} kWp</div>
          </div>
        </div>
        <div className='flex min-h-[80px] w-full flex-col rounded-xl border border-primary/30 bg-background p-4 shadow-md lg:w-1/4 lg:p-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-sm font-medium uppercase tracking-tight'>POTÊNCIA DE INVERSORES</h1>
            <ImPower />
          </div>
          <div className='mt-2 flex w-full flex-col'>
            <div className='text-xl font-bold text-[#15599a] lg:text-2xl'>{getInverterPeakPowerByProducts(proposal.produtos)} kWp</div>
          </div>
        </div>
        <div className='flex min-h-[80px] w-full flex-col rounded-xl border border-primary/30 bg-background p-4 shadow-md lg:w-1/4 lg:p-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-sm font-medium uppercase tracking-tight'>NÚMERO DE MÓDULOS</h1>
            <FaSolarPanel />
          </div>
          <div className='mt-2 flex w-full flex-col'>
            <div className='text-xl font-bold text-[#15599a] lg:text-2xl'>{getModulesQty(proposal.produtos)}</div>
          </div>
        </div>
        <div className='flex min-h-[80px] w-full flex-col rounded-xl border border-primary/30 bg-background p-4 shadow-md lg:w-1/4 lg:p-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-sm font-medium uppercase tracking-tight'>NÚMERO DE INVERSORES</h1>
            <TbTopologyFull />
          </div>
          <div className='mt-2 flex w-full flex-col'>
            <div className='text-xl font-bold text-[#15599a] lg:text-2xl'>{getInverterQty(proposal.produtos)}</div>
          </div>
        </div>
      </div>
      <h1 className='w-full text-start font-medium text-primary/50'>LISTA DE EQUIPAMENTOS</h1>
      <div className='flex w-full flex-col flex-wrap justify-around gap-2 lg:flex-row'>
        {proposal.produtos.map((product, index) => (
          <div key={index} className='mt-1 flex w-full flex-col rounded-md border border-primary/30 p-2'>
            <div className='flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center'>
              <div className='flex items-center gap-1'>
                <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1 text-[15px]'>
                  {renderCategoryIcon(product.categoria)}
                </div>
                <p className='text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs'>
                  <strong className='text-[#FF9B50]'>{product.qtde}</strong> x {product.modelo}
                </p>
              </div>
              <div className='flex w-full grow items-center justify-end gap-2 pl-2 lg:w-fit'>
                <div className='flex items-center gap-1'>
                  <FaIndustry size={15} />
                  <p className='text-[0.6rem] font-light text-primary/50'>{product.fabricante}</p>
                </div>
                <div className='flex items-center gap-1'>
                  <ImPower size={15} />
                  <p className='text-[0.6rem] font-light text-primary/50'>{product.potencia} W</p>
                </div>
                <div className='flex items-center gap-1'>
                  <AiOutlineSafety size={15} />
                  <p className='text-[0.6rem] font-light text-primary/50'>{product.garantia} ANOS</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <h1 className='w-full rounded-md bg-[#fead41] p-1 text-center text-sm font-medium text-white'>SERVIÇOS</h1>
      <h1 className='w-full text-start font-medium text-primary/50'>LISTA DE SERVIÇOS</h1>
      <div className='flex w-full flex-col flex-wrap justify-around gap-2 lg:flex-row'>
        {proposal.servicos.map((service, index) => (
          <div key={index} className='mt-1 flex w-full flex-col rounded-md border border-primary/30 p-2'>
            <div className='flex w-full items-center justify-between gap-2'>
              <div className='flex  items-center gap-1'>
                <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
                  <MdOutlineMiscellaneousServices />
                </div>
                <p className='text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs'>{service.descricao}</p>
              </div>
              <div className='flex  grow items-center justify-end gap-2 pl-2'>
                <div className='flex items-center gap-1'>
                  <AiOutlineSafety size={15} />
                  <p className='text-[0.6rem] font-light text-primary/50'>{service.garantia} ANOS</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='mt-2 flex w-full flex-wrap justify-between  gap-2'>
        <button
          onClick={() => {
            goToPreviousStage();
          }}
          className='rounded p-2 font-bold text-primary/50 duration-300 hover:scale-105'
        >
          Voltar
        </button>
        <button
          onClick={() => {
            goToNextStage();
          }}
          className='rounded p-2 font-bold hover:bg-black hover:text-white'
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default SystemInfo;
