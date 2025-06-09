import ProposalPage from "@/components/Proposal/ProposalPage";
import ErrorComponent from "@/components/utils/ErrorComponent";
import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ProposalById({ params }: { params: { id: string } }) {
	const session = await getCurrentSession();

	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}

	const awaitedParams = await params;
	const proposalId = awaitedParams.id;
	if (!proposalId) return <ErrorComponent msg="ID da proposta não encontrado" />;

	return <ProposalPage proposalId={proposalId} session={session} />;
}
