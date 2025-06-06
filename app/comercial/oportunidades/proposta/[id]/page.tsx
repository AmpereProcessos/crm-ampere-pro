export const dynamic = "force-dynamic";

import NewProposalPage from "@/components/Proposal/NewProposalPage";
import ErrorComponent from "@/components/utils/ErrorComponent";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ProposalById({ params }: { params: { id: string } }) {
	const session = await getCurrentSession();

	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}

	const awaitedParams = await params;
	const opportunityId = awaitedParams.id;
	if (!opportunityId) return <ErrorComponent msg="ID da proposta não encontrado" />;

	return <NewProposalPage opportunityId={opportunityId} session={session} />;
}
