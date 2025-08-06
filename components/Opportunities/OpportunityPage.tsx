"use client";
import React, { useState } from "react";

import OpportunityDetails from "./OpportunityDetails";
import OpportunityHistory from "./OpportunityHistory";
import OpportunityProposals from "./OpportunityProposals";
import OpportunityFiles from "./OpportunityFiles";
import OpportunityPPSCalls from "./OpportunityPPSCalls";
import OpportunityTechnicalAnalysis from "./OpportunityTechnicalAnalysis";
import OpportunityHomologations from "./OpportunityHomologations";
import LoadingComponent from "../utils/LoadingComponent";
import Avatar from "../utils/Avatar";

import { BsCalendarPlus, BsCalendarX, BsCode, BsFillMegaphoneFill } from "react-icons/bs";

import { useOpportunityById } from "@/utils/queries/opportunities";
import OpportunityLossBlock from "./OpportunityLossBlock";
import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";
import type { TUserSession } from "@/lib/auth/session";
import OpportunityWonFlag from "./OpportunityWonFlag";
import OpportunityContractRequestedFlag from "./OpportunityContractRequestedFlag";
import OpportunityClient from "./OpportunityClient";
import { Share2 } from "lucide-react";
import { MdDelete } from "react-icons/md";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useQueryClient } from "@tanstack/react-query";
import { deleteOpportunity } from "@/utils/mutations/opportunities";
import { Sidebar } from "../Sidebar";

export type TOpportunityBlockMode = "PROPOSES" | "FILES" | "TECHNICAL ANALYSIS";

type OpportunityPageProps = {
	session: TUserSession;
	opportunityId: string;
};
function OpportunityPage({ session, opportunityId }: OpportunityPageProps) {
	const queryClient = useQueryClient();
	const [blockMode, setBlockMode] = useState<TOpportunityBlockMode>("PROPOSES");
	const {
		data: opportunity,
		status,
		isLoading: opportunityLoading,
		isSuccess: opportunitySuccess,
		isError: opportunityError,
	} = useOpportunityById({ opportunityId: opportunityId });

	const { mutate: mutateDeleteOpportunity, isPending } = useMutationWithFeedback({
		mutationKey: ["deleteOpportunity", opportunityId],
		mutationFn: deleteOpportunity,
		queryClient: queryClient,
		affectedQueryKey: ["opportunity-by-id", opportunityId],
	});
	if (opportunityLoading) return <LoadingComponent />;
	if (opportunityError)
		return (
			<div className="flex h-full flex-col md:flex-row">
				<Sidebar session={session} />
				<div className="flex w-full max-w-full grow flex-col items-center justify-center overflow-x-hidden bg-[#f8f9fa] p-6">
					<p className="text-lg italic text-gray-700">Oops, houve um erro no carregamento das informações do projeto em questão.</p>
				</div>
			</div>
		);
	if (opportunitySuccess)
		return (
			<div className="flex h-full flex-col md:flex-row">
				<Sidebar session={session} />
				<div className="flex w-full max-w-full grow flex-col gap-2 overflow-x-hidden bg-[#f8f9fa] p-6">
					<div className="flex w-full flex-col gap-1 border-b border-gray-800 pb-2">
						<div className="flex w-full flex-col justify-center gap-2 lg:flex-row lg:justify-between">
							<div className="flex flex-col items-center gap-1 lg:flex-row">
								<div className="flex items-center gap-1 rounded bg-[#15599a] px-2 py-1 text-white">
									<BsCode />
									<h1 className="text-sm font-black">{opportunity.identificador}</h1>
								</div>
								<h1 className="flex text-center font-Raleway text-2xl font-bold leading-none tracking-tight text-blue-900 lg:text-start">{opportunity.nome}</h1>
								{session.user.permissoes.oportunidades.excluir ? (
									opportunity.dataExclusao ? null : (
										<button
											type="button"
											disabled={isPending}
											className="p-2 rounded-full flex items-center justify-center bg-red-500 text-white"
											onClick={() =>
												mutateDeleteOpportunity({
													id: opportunityId,
												})
											}
										>
											<MdDelete />
										</button>
									)
								) : null}
								{opportunity.dataExclusao ? (
									<div className={"flex items-center gap-2"}>
										<p className="text-[0.65rem] font-medium text-gray-500">EXCLUÍDA EM:</p>
										<BsCalendarX color="#ef4444" />
										<p className="text-[0.65rem] font-medium text-red-500">{formatDateAsLocale(opportunity.dataExclusao, true)}</p>
									</div>
								) : null}
								{opportunity.idMarketing ? (
									<div className="flex items-center gap-1 rounded border border-[#3e53b2] p-1 text-[#3e53b2]">
										<BsFillMegaphoneFill />
										<p className="text-sm font-bold italic leading-none tracking-tight">VINDO DE MARKETING</p>
									</div>
								) : null}
								{opportunity.idIndicacao ? (
									<div className="flex items-center gap-1 rounded border border-cyan-500 p-1 text-cyan-500">
										<Share2 size={16} />
										<p className="text-sm font-bold italic leading-none tracking-tight">VINDO DE INDICAÇÃO</p>
									</div>
								) : null}
							</div>
							<OpportunityContractRequestedFlag requestDate={opportunity.ganho.dataSolicitacao} />
							<OpportunityWonFlag wonDate={opportunity.ganho.data} />
						</div>

						{opportunity.descricao ? (
							<div className="flex w-full flex-col gap-1 rounded-lg bg-gray-100 p-2">
								<h1 className="block text-[0.6rem] font-medium tracking-tight lg:hidden">ANOTAÇÕES</h1>
								<p className="text-center text-xs italic text-gray-500 lg:text-start">{opportunity.descricao}</p>
							</div>
						) : null}
						<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
							<div className="flex w-full flex-wrap items-center justify-start gap-2 lg:grow">
								<h1 className="py-0.5 text-center text-[0.6rem] font-medium italic text-primary/80 ">RESPONSÁVEIS</h1>
								{opportunity.responsaveis.map((resp) => (
									<div key={resp.id} className="flex items-center gap-1">
										<Avatar width={20} height={20} url={resp.avatar_url || undefined} fallback={formatNameAsInitials(resp.nome)} />
										<p className="text-xs font-medium leading-none tracking-tight text-gray-500">{resp.nome}</p>{" "}
										<p className="ml-1 rounded-md border border-cyan-400 p-1 text-xxs font-bold text-cyan-400">{resp.papel}</p>
									</div>
								))}
							</div>
							<div className="flex w-full flex-col items-center justify-center gap-2 lg:min-w-fit lg:flex-row lg:justify-end">
								<div className={"flex items-center gap-2"}>
									<p className="text-[0.65rem] font-medium text-gray-500">CRIADA EM:</p>
									<BsCalendarPlus />
									<p className="text-[0.65rem] font-medium text-gray-500">{formatDateAsLocale(opportunity.dataInsercao, true)}</p>
								</div>
								{opportunity.ganho.data ? null : (
									<OpportunityLossBlock
										opportunityId={opportunity._id}
										opportunityIsLost={!!opportunity.perda.data}
										opportunityLossDate={opportunity.perda.data}
										idMarketing={opportunity.idMarketing}
										opportunityEmail={opportunity.cliente?.email}
									/>
								)}
							</div>
						</div>
						{opportunity.perda.descricaoMotivo ? (
							<div className="w-fit self-center flex flex-col items-center justify-center border-[#F31559] bg-[#F31559]/20 p-2 rounded-lg gap-1">
								<h3 className="text-[0.65rem] leading-none tracking-tight">MOTIVO DA PERDA</h3>
								<h1 className="w-full text-center font-bold text-[#F31559] text-xs tracking-tight leading-none">{opportunity.perda.descricaoMotivo}</h1>
							</div>
						) : null}
					</div>
					{/* <div className="flex w-full flex-col items-start gap-6 py-4 lg:flex-row"></div> */}
					<div className="flex w-full flex-col gap-6">
						<div className="flex w-full flex-col gap-6 lg:flex-row">
							<div className="w-full lg:w-[40%]">
								<OpportunityClient client={opportunity.cliente} session={session} opportunityId={opportunityId} responsibles={opportunity.responsaveis} />
							</div>
							<div className="w-full lg:w-[60%]">
								<OpportunityProposals
									city={opportunity.localizacao.cidade}
									uf={opportunity.localizacao.uf}
									session={session}
									opportunityId={opportunity._id ? opportunity._id : ""}
									idActiveProposal={opportunity.idPropostaAtiva || undefined}
									setBlockMode={setBlockMode}
									opportunityHasContractRequested={!!opportunity.ganho.dataSolicitacao}
									opportunityIsWon={!!opportunity.ganho.data}
									opportunityWonProposalId={opportunity.ganho.idProposta}
								/>
							</div>
						</div>
						<div className="flex w-full flex-col gap-4 lg:w-[40%]" />
						<div className="flex w-full flex-col gap-6 lg:flex-row">
							<div className="flex w-full flex-col gap-4 lg:w-[40%]">
								<OpportunityDetails info={opportunity} session={session} opportunityId={opportunity._id} />
							</div>
							<div className="flex w-full flex-col gap-4 lg:w-[60%]">
								<OpportunityFiles opportunityId={opportunity._id} clientId={opportunity.idCliente} session={session} />
								<OpportunityPPSCalls opportunity={opportunity} session={session} />
								<OpportunityTechnicalAnalysis session={session} opportunity={opportunity} />
								<OpportunityHomologations opportunity={opportunity} session={session} />
								<OpportunityHistory opportunityName={opportunity.nome} opportunityId={opportunity._id} opportunityIdentifier={opportunity.identificador || ""} session={session} />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	return <></>;
}

export default OpportunityPage;
