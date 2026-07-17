"use client";
import { useQueryClient } from "@tanstack/react-query";
import type { TUserSession } from "@/lib/auth/session";
import { useOpportunityById } from "@/utils/queries/opportunities";
import LoadingComponent from "../../utils/LoadingComponent";
import OpportunityClient from "./OpportunityClient";
import OpportunityCustomFieldsBlock from "./OpportunityCustomFieldsBlock";
import OpportunityDetails from "./OpportunityDetails";
import OpportunityFiles from "./OpportunityFiles";
import OpportunityHistory from "./OpportunityHistory";
import OpportunityHomologations from "./OpportunityHomologations";
import OpportunityPageHeader from "./OpportunityPageHeader";
import OpportunityPPSCalls from "./OpportunityPPSCalls";
import OpportunityProject from "./OpportunityProject";
import OpportunityProposals from "./OpportunityProposals";
import OpportunityTechnicalAnalysis from "./OpportunityTechnicalAnalysis";

export type TOpportunityBlockMode = "PROPOSES" | "FILES" | "TECHNICAL ANALYSIS";

type OpportunityPageProps = {
	session: TUserSession;
	opportunityId: string;
};
function OpportunityPage({ session, opportunityId }: OpportunityPageProps) {
	const queryClient = useQueryClient();
	const {
		data: opportunity,
		queryKey,
		isLoading: opportunityLoading,
		isSuccess: opportunitySuccess,
		isError: opportunityError,
	} = useOpportunityById({ opportunityId: opportunityId });
	const handleOnMutate = async () => await queryClient.cancelQueries({ queryKey });
	const handleOnSettled = async () => await queryClient.invalidateQueries({ queryKey });

	if (opportunityLoading) return <LoadingComponent />;
	if (opportunityError)
		return (
			<div className="flex min-h-64 w-full flex-col items-center justify-center">
				<p className="text-base italic text-muted-foreground">Houve um erro no carregamento das informações desta oportunidade.</p>
			</div>
		);
	if (opportunitySuccess)
		return (
			<div className="flex w-full min-w-0 flex-col gap-4">
					<OpportunityPageHeader opportunity={opportunity} session={session} handleOnMutate={handleOnMutate} handleOnSettled={handleOnSettled} />
					<div className="flex w-full flex-col gap-4">
						{opportunity.ganho.idProjeto ? <OpportunityProject opportunityProjectId={opportunity.ganho.idProjeto} session={session} /> : null}
						<div className="flex w-full flex-col gap-4 lg:flex-row">
							<div className="w-full lg:w-[40%]">
								<OpportunityClient client={opportunity.cliente} session={session} responsibles={opportunity.responsaveis} />
							</div>
							<div className="w-full lg:w-[60%]">
								<OpportunityProposals
									city={opportunity.localizacao.cidade}
									uf={opportunity.localizacao.uf}
									session={session}
									opportunityId={opportunity._id ? opportunity._id : ""}
									idActiveProposal={opportunity.idPropostaAtiva || undefined}
									opportunityHasContractRequested={!!opportunity.ganho.dataSolicitacao}
									opportunityIsWon={!!opportunity.ganho.data}
									opportunityWonProposalId={opportunity.ganho.idProposta}
								/>
							</div>
						</div>
						<div className="flex w-full flex-col gap-4 lg:w-[40%]" />
						<div className="flex w-full flex-col gap-4 lg:flex-row">
							<div className="flex w-full flex-col gap-4 lg:w-[40%]">
								<OpportunityDetails
									info={opportunity}
									session={session}
									opportunityId={opportunity._id}
									opportunityQueryKey={queryKey}
									callbacks={{
										onMutate: handleOnMutate,
										onSettled: handleOnSettled,
									}}
								/>
							</div>
							<div className="flex w-full flex-col gap-4 lg:w-[60%]">
								<OpportunityCustomFieldsBlock
									opportunity={opportunity}
									session={session}
									opportunityQueryKey={queryKey}
									callbacks={{
										onMutate: handleOnMutate,
										onSettled: handleOnSettled,
									}}
								/>
								<OpportunityFiles opportunityId={opportunity._id} clientId={opportunity.idCliente} session={session} />
								<OpportunityPPSCalls opportunity={opportunity} session={session} />
								<OpportunityTechnicalAnalysis session={session} opportunity={opportunity} />
								<OpportunityHomologations opportunity={opportunity} session={session} />
								<OpportunityHistory
									opportunityName={opportunity.nome}
									opportunityId={opportunity._id}
									opportunityIdentifier={opportunity.identificador || ""}
									session={session}
								/>
							</div>
						</div>
					</div>
			</div>
		);
	return <></>;
}

export default OpportunityPage;
