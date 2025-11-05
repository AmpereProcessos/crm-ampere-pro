import { useRouter } from "next/navigation";
import type React from "react";
import { toast } from "react-hot-toast";
import { MdAdd } from "react-icons/md";
import type { TUserSession } from "@/lib/auth/session";
import { useOpportunityProposals } from "@/utils/queries/proposals";
import type { TProposalDTO } from "@/utils/schemas/proposal.schema";
import ProposalItem from "../Cards/OpportunityProposal";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";
import type { TOpportunityBlockMode } from "./OpportunityPage";
import { Button } from "../ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../ui/tooltip";

type OpportunityProposalsProps = {
	city?: string | null;
	uf?: string | null;
	session: TUserSession;
	opportunityId: string;
	idActiveProposal?: string;
	setBlockMode: React.Dispatch<React.SetStateAction<TOpportunityBlockMode>>;
	opportunityHasContractRequested: boolean;
	opportunityIsWon: boolean;
	opportunityWonProposalId?: string | null;
};
function OpportunityProposals({
	city,
	uf,
	opportunityId,
	idActiveProposal,
	opportunityHasContractRequested,
	opportunityIsWon,
	opportunityWonProposalId,
}: OpportunityProposalsProps) {
	const router = useRouter();
	const {
		data: opportunityProposals,
		isLoading: opportunityProposalsLoading,
		isSuccess: opportunityProposalsSuccess,
		isError: opportunityProposalsError,
	} = useOpportunityProposals({ opportunityId: opportunityId });
	console.log("PROPOSTAS DA OPORTUNIDADE", opportunityProposals);
	function handleOrderProposals({
		proposals,
		idActiveProposal,
		idWonProposal,
	}: {
		proposals: TProposalDTO[];
		idActiveProposal?: string;
		idWonProposal?: string;
	}) {
		return proposals.sort((a, b) => {
			// Proposta ganha tem prioridade máxima
			if (a._id === idWonProposal) return -1;
			if (b._id === idWonProposal) return 1;

			// Proposta ativa tem a segunda maior prioridade
			if (a._id === idActiveProposal) return -1;
			if (b._id === idActiveProposal) return 1;

			// Se nenhuma das condições acima for verdadeira, ordena por data de inserção (mais recente primeiro)
			return new Date(b.dataInsercao).getTime() - new Date(a.dataInsercao).getTime();
		});
	}
	const isAllowedToGenerateProposal = city && uf;
	return (
		<div className={"bg-card border-primary/20 flex w-full h-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs"}>
			<div className="flex items-center justify-between">
				<h1 className="text-xs font-bold tracking-tight uppercase">PROPOSTAS</h1>
				<div className="flex items-center gap-2">
					{!opportunityIsWon ? (
						isAllowedToGenerateProposal ? (
							<Button variant="ghost" size={"xs"} className="flex items-center gap-1" asChild>
								<Link href={`/comercial/oportunidades/proposta/${opportunityId}`}>
									<Plus className="h-4 w-4 min-h-4 min-w-4" />
									<p className="text-xs font-medium">GERAR PROPOSTA</p>
								</Link>
							</Button>
						) : (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button variant="ghost" size={"xs"} className="flex items-center gap-1">
											<Plus className="h-4 w-4 min-h-4 min-w-4" />
											<p className="text-xs font-medium">GERAR PROPOSTA</p>
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p className="text-xs font-medium">Define a UF e a cidade para gerar a proposta.</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)
					) : null}
				</div>
			</div>
			<div className="grow flex flex-col w-full max-h-[250px] pr-2 gap-1 overscroll-y overflow-y-auto scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
				{opportunityProposalsLoading ? (
					<div className="flex grow items-center justify-center">
						<LoadingComponent />
					</div>
				) : null}
				{opportunityProposalsError ? <ErrorComponent msg="Oops, erro ao buscar propostas da oportunidade." /> : null}
				{opportunityProposalsSuccess ? (
					opportunityProposals.length > 0 ? (
						handleOrderProposals({
							proposals: opportunityProposals,
							idActiveProposal: idActiveProposal,
							idWonProposal: opportunityWonProposalId || undefined,
						}).map((proposal, index) => (
							<ProposalItem
								key={proposal._id}
								info={proposal}
								opportunityHasContractRequested={opportunityHasContractRequested}
								opportunityIsWon={opportunityIsWon}
								opportunityActiveProposalId={idActiveProposal}
								opportunityWonProposalId={opportunityWonProposalId}
							/>
						))
					) : (
						<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
							Sem propostas vinculadas a essa oportunidade.
						</p>
					)
				) : null}
			</div>
		</div>
	);
}

export default OpportunityProposals;
