import ProposalSignaturePlanShowcase from '@/components/Cards/ProposalSignaturePlanShowcase';
import type { TUserSession } from '@/lib/auth/session';
import { TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from '@/utils/schemas/opportunity.schema';
import { TProposal } from '@/utils/schemas/proposal.schema';
import { TSignaturePlanDTOWithPricingMethod } from '@/utils/schemas/signature-plans.schema';
import React, { useState } from 'react';
import EditPlanPrice from '../Blocks/EditPlanPrice';

type TEditPriceModal = {
  isOpen: boolean;
  planIndex: null | number;
};

type PlansShowcaseProps = {
  signaturePlans: TSignaturePlanDTOWithPricingMethod[];
  infoHolder: TProposal;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
  opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences;
  moveToNextStage: () => void;
  moveToPreviousStage: () => void;
  session: TUserSession;
};
function PlansShowcase({
  signaturePlans,
  infoHolder,
  setInfoHolder,
  opportunity,
  moveToNextStage,
  moveToPreviousStage,
  session,
}: PlansShowcaseProps) {
  const [editPriceModal, setEditPriceModal] = useState<TEditPriceModal>({ isOpen: false, planIndex: null });
  function handleProceed() {
    return moveToNextStage();
  }
  return (
    <>
      <div className='flex w-full flex-col gap-4 py-4'>
        <h1 className='font-Raleway font-bold text-primary/80'>PLANOS DE ASSINATURA</h1>
      </div>
      <div className='flex w-full grow flex-wrap items-center justify-center gap-2'>
        {infoHolder.planos.map((plan, index) => (
          <div className='w-full lg:w-1/4'>
            <ProposalSignaturePlanShowcase
              key={plan.id}
              plan={plan}
              planIndex={index}
              userHasPricingEditPermission={session.user.permissoes.precos.editar}
              editPlanPrice={(id) => setEditPriceModal({ planIndex: id, isOpen: true })}
            />
          </div>
        ))}
      </div>
      <div className='flex w-full items-center justify-between gap-2 px-1'>
        <button onClick={() => moveToPreviousStage()} className='rounded p-2 font-bold text-primary/70 duration-300 hover:scale-105'>
          Voltar
        </button>
        <button onClick={() => handleProceed()} className='rounded p-2 font-bold hover:bg-black hover:text-primary-foreground'>
          Prosseguir
        </button>
      </div>
      {editPriceModal.isOpen && editPriceModal.planIndex != null ? (
        <EditPlanPrice
          infoHolder={infoHolder}
          setInfoHolder={setInfoHolder}
          planIndex={editPriceModal.planIndex}
          closeModal={() => setEditPriceModal({ isOpen: false, planIndex: null })}
          alterationLimit={undefined}
        />
      ) : null}
    </>
  );
}

export default PlansShowcase;
