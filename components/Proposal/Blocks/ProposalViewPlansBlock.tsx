import { formatToMoney } from "@/lib/methods/formatting";

import { TProposalDTO } from "@/utils/schemas/proposal.schema";
import React, { useState } from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import ProposalPlan from "./ProposalPlan";
import { fetchSignaturePlanById } from "@/utils/queries/signature-plans";
import { TOpportunityDTO } from "@/utils/schemas/opportunity.schema";

import { editProposal } from "@/utils/mutations/proposals";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useQueryClient } from "@tanstack/react-query";
import { boolean } from "zod";
import DefinePlan from "./DefinePlan";
import type { TUserSession } from "@/lib/auth/session";
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
	const [definePlanModal, setDefinePlanModal] = useState<{ plan: TProposalDTO["planos"][number] | null; isOpen: boolean }>({ plan: null, isOpen: false });
	const [editPriceModal, setEditPriceModal] = useState<TEditPriceModal>({ isOpen: false, index: null });
	return (
		<div className="mt-4 flex w-full flex-col gap-2 rounded border border-gray-500 bg-[#fff]">
			<h1 className="w-full rounded bg-gray-800 py-2 text-center font-bold text-white ">PLANOS DE ASSINATURA</h1>
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
