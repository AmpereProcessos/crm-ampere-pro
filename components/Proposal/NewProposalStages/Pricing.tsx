import type React from 'react';
import { useState } from 'react';

import { AiFillEdit } from 'react-icons/ai';

import type { TUserSession } from '@/lib/auth/session';
import { formatToMoney } from '@/utils/methods';
import { getPricingTotal } from '@/utils/pricing/methods';
import type { TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from '@/utils/schemas/opportunity.schema';
import type { TPricingItem, TProposal } from '@/utils/schemas/proposal.schema';
import { MdAdd } from 'react-icons/md';
import AddPricingItem from '../Blocks/AddPricingItem';
import EditFinalPrice from '../Blocks/EditFinalPrice';
import PricingTable from '../Blocks/PricingTable';
type PricingProps = {
  infoHolder: TProposal;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
  opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
  moveToNextStage: () => void;
  moveToPreviousStage: () => void;
  session: TUserSession;
};
function Pricing({ opportunity, infoHolder, setInfoHolder, moveToNextStage, moveToPreviousStage, session }: PricingProps) {
  const userHasPricingEditPermission = session?.user.permissoes.precos.editar;
  const userHasPricingViewPermission = session.user.permissoes.precos.visualizar;
  const alterationLimit = userHasPricingEditPermission
    ? undefined
    : infoHolder.idMetodologiaPrecificacao === '66912b265a6c1f632a3970dd'
      ? 0.045
      : 0.02;

  const [pricing, setPricing] = useState<TPricingItem[]>(infoHolder.precificacao);
  const [addNewPriceItemModalIsOpen, setAddNewPriceItemModalIsOpen] = useState<boolean>(false);
  const [editFinalPriceModalIsOpen, setEditFinalPriceModalIsOpen] = useState<boolean>(false);
  const pricingTotal = getPricingTotal({ pricing: pricing });
  const [addCostModalIsOpen, setAddCostModalIsOpen] = useState<boolean>(false);

  function handleProceed() {
    const updatePlanPrice = infoHolder.planos.length === 1;
    const proposalPlans: TProposal['planos'] = updatePlanPrice ? [{ ...infoHolder.planos[0], valor: pricingTotal }] : infoHolder.planos;
    // Updating proposal final price
    setInfoHolder((prev) => ({
      ...prev,
      planos: proposalPlans,
      precificacao: pricing,
      valor: pricingTotal,
    }));
    // Moving to next stage
    moveToNextStage();
  }
  return (
    <>
      <div className='flex w-full flex-col gap-4 py-4'>
        <h1 className='font-Raleway font-bold text-primary/80'>DESCRITIVO DA VENDA</h1>
      </div>
      <PricingTable
        pricing={pricing}
        setPricing={setPricing}
        userHasPricingEditPermission={userHasPricingEditPermission}
        userHasPricingViewPermission={userHasPricingViewPermission}
        opportunity={opportunity}
        proposal={infoHolder}
      />
      {userHasPricingEditPermission ? (
        <div className='my-4 flex w-full items-center justify-center'>
          <button
            type='button'
            onClick={() => setAddNewPriceItemModalIsOpen(true)}
            className='flex items-center gap-2 rounded-sm bg-orange-600 px-4 py-2 text-primary-foreground duration-100 ease-in-out hover:bg-orange-700'
          >
            <MdAdd />
            <h1 className='text-xs font-bold'>NOVO CUSTO</h1>
          </button>
        </div>
      ) : null}

      <div className='flex w-full items-center justify-center gap-2 py-1'>
        <div className='flex gap-2 rounded-sm border border-primary/60 px-2 py-1 font-medium text-primary/60'>
          <p>{formatToMoney(pricingTotal)}</p>
          {session?.user.permissoes.precos.editar ? (
            <button
              type='button'
              onClick={() => setEditFinalPriceModalIsOpen((prev) => !prev)}
              className='text-md text-primary/40 hover:text-[#fead61]'
            >
              <AiFillEdit />
            </button>
          ) : (
            <button
              type='button'
              onClick={() => setEditFinalPriceModalIsOpen((prev) => !prev)}
              className='text-md text-primary/40 hover:text-[#fead61]'
            >
              <AiFillEdit />
            </button>
          )}
        </div>
      </div>
      <div className='flex w-full items-center justify-between gap-2 px-1'>
        <button type='button' onClick={() => moveToPreviousStage()} className='rounded p-2 font-bold text-primary/70 duration-300 hover:scale-105'>
          Voltar
        </button>
        <button type='button' onClick={handleProceed} className='rounded p-2 font-bold hover:bg-black hover:text-primary-foreground'>
          Prosseguir
        </button>
      </div>
      {addNewPriceItemModalIsOpen ? (
        <AddPricingItem pricing={pricing} setPricing={setPricing} proposal={infoHolder} closeModal={() => setAddNewPriceItemModalIsOpen(false)} />
      ) : null}
      {editFinalPriceModalIsOpen ? (
        <EditFinalPrice
          pricing={pricing}
          setPricing={setPricing}
          closeModal={() => setEditFinalPriceModalIsOpen(false)}
          alterationLimit={alterationLimit}
        />
      ) : null}
    </>
  );
}

export default Pricing;
