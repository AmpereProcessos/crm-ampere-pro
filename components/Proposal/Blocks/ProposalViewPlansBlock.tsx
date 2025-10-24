import { TOpportunityDTO } from "@/utils/schemas/opportunity.schema";
import { TProposalDTO } from "@/utils/schemas/proposal.schema";
import { useState } from "react";
import ProposalPlan from "./ProposalPlan";

import { useQueryClient } from "@tanstack/react-query";
import DefinePlan from "./DefinePlan";
import EditPlanFinalPrice from "./EditPlanFinalPrice";

type TEditPriceModal = {
	isOpen: boolean;
	index: null | number;
};

type ProposalViewPlansBlockProps = {
	plans: TProposalDTO["planos"];
	proposal: TProposalDTO;
	opportunity: TOpportunityDTO;
	userHasPricingViewPermission: boolean;
	userHasPricingEditPermission: boolean;
};
function ProposalViewPlansBlock({ plans, proposal, opportunity, userHasPricingViewPermission, userHasPricingEditPermission }: ProposalViewPlansBlockProps) {
	const queryClient = useQueryClient();
	const alterationLimit = userHasPricingEditPermission ? undefined : 0.02;
	const [definePlanModal, setDefinePlanModal] = useState<{ plan: TProposalDTO["planos"][number] | null; isOpen: boolean }>({
		plan: null,
		isOpen: false,
	});
	const [editPriceModal, setEditPriceModal] = useState<TEditPriceModal>({ isOpen: false, index: null });
	return (
		<div className="mt-4 flex w-full flex-col gap-2 rounded-sm border border-primary/50 bg-background">
			<h1 className="w-full rounded-sm bg-primary/80 py-2 text-center font-bold text-primary-foreground ">PLANOS DE ASSINATURA</h1>
			<div className="my-4 flex h-fit w-full flex-wrap items-stretch justify-center gap-2 py-2">
				{plans.map((plan, index) => (
					<ProposalPlan
						key={plan.id}
						plan={plan}
						editPrice={() => setEditPriceModal({ index: index, isOpen: true })}
						definePlan={(plan) => setDefinePlanModal({ plan: plan, isOpen: true })}
						enableSelection={plans.length > 1}
						userHasPricingEditPermission={userHasPricingEditPermission}
					/>
				))}
			</div>
			{!!definePlanModal.plan && definePlanModal.isOpen ? (
				<DefinePlan
					proposalPlan={definePlanModal.plan}
					opportunity={opportunity}
					proposal={proposal}
					closeModal={() => setDefinePlanModal({ plan: null, isOpen: false })}
					userHasPricingViewPermission={userHasPricingViewPermission}
					userHasPricingEditPermission={userHasPricingEditPermission}
				/>
			) : null}
			{editPriceModal.isOpen && editPriceModal.index != null ? (
				<EditPlanFinalPrice
					plans={proposal.planos}
					planIndex={editPriceModal.index}
					proposalId={proposal._id}
					alterationLimit={alterationLimit}
					closeModal={() => setEditPriceModal({ isOpen: false, index: null })}
				/>
			) : null}
		</div>
	);
}

export default ProposalViewPlansBlock;
