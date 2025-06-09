import ProposalPage from "@/components/Proposal/ProposalPage";
import ErrorComponent from "@/components/utils/ErrorComponent";
import { getCurrentSession } from "@/lib/auth/session";
import { getProposalDocumentById } from "@/repositories/proposals/queries";
import { redirect } from "next/navigation";
import ProposalDocumentPage from "../document-page";
import type { TProposalDTO } from "@/utils/schemas/proposal.schema";
import type { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import type { TPartnerDTO } from "@/utils/schemas/partner.schema";

export default async function ProposalDocumentById({ params }: { params: { id: string } }) {
	const session = await getCurrentSession();

	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}

	const awaitedParams = await params;
	const proposalId = awaitedParams.id;
	if (!proposalId) return <ErrorComponent msg="ID da proposta não encontrado" />;

	const { proposal, partner, opportunity } = await getProposalDocumentById({ id: proposalId });
	if (!proposal || !partner || !opportunity) return <ErrorComponent msg="Proposta não encontrada" />;
	return (
		<ProposalDocumentPage
			proposal={proposal as unknown as TProposalDTO}
			opportunity={opportunity as unknown as TOpportunityDTOWithClient}
			partner={partner as unknown as TPartnerDTO}
		/>
	);
}
