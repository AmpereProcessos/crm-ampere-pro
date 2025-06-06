import React, { useState } from "react";
import { MdAdd } from "react-icons/md";
import { TOpportunityBlockMode } from "./OpportunityPage";
import NewTechnicalAnalysis from "../Modals/TechnicalAnalysis/NewTechnicalAnalysis";
import type { TUserSession } from "@/lib/auth/session";
import { TOpportunityDTO, TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import { useOpportunityTechnicalAnalysis } from "@/utils/queries/technical-analysis";
import LoadingComponent from "../utils/LoadingComponent";
import ErrorComponent from "../utils/ErrorComponent";
import OpportunityTechnicalAnalysisItem from "../Cards/OpportunityTechnicalAnalysisItem";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";

type OpportunityTechnicalAnalysisProps = {
	session: TUserSession;
	opportunity: TOpportunityDTOWithClient;
};
function OpportunityTechnicalAnalysis({ session, opportunity }: OpportunityTechnicalAnalysisProps) {
	const [blockIsOpen, setBlockIsOpen] = useState<boolean>(false);

	const [newTechnicalAnalysisBlockIsOpen, setNewTechnicalAnalysisBlockIsOpen] = useState<boolean>(false);
	const { data: analysis, isLoading, isError, isSuccess } = useOpportunityTechnicalAnalysis({ opportunityId: opportunity._id, concludedOnly: false });

	return (
		<div className="flex max-h-[250px] w-full flex-col rounded-md border border-gray-200 bg-[#fff] p-3 shadow-lg">
			<div className="flex  h-[40px] items-center  justify-between border-b border-gray-200 pb-2">
				<div className="flex items-center justify-center gap-5">
					<h1 className="p-1 text-center font-bold text-black">Análises Técnicas</h1>
				</div>

				<div className="flex items-center gap-2">
					<button onClick={() => setNewTechnicalAnalysisBlockIsOpen(true)} className="hidden rounded bg-green-600 p-1 text-[0.7rem] font-bold text-white lg:flex">
						SOLICITAR ANÁLISE
					</button>
					<button onClick={() => setNewTechnicalAnalysisBlockIsOpen(true)} className="flex rounded bg-green-600 p-1 text-sm font-bold text-white lg:hidden">
						<MdAdd />
					</button>
					{blockIsOpen ? (
						<button className="text-gray-600 hover:text-blue-400">
							<IoMdArrowDropupCircle style={{ fontSize: "25px" }} onClick={() => setBlockIsOpen(false)} />
						</button>
					) : (
						<button className="text-gray-600 hover:text-blue-400">
							<IoMdArrowDropdownCircle style={{ fontSize: "25px" }} onClick={() => setBlockIsOpen(true)} />
						</button>
					)}
				</div>
			</div>
			{blockIsOpen ? (
				<div className="overscroll-y flex w-full grow flex-col gap-1 overflow-y-auto py-1 pr-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Erro ao buscar análises técnicas da oportunidade." /> : null}
					{isSuccess ? (
						analysis.length > 0 ? (
							analysis.map((analysis) => <OpportunityTechnicalAnalysisItem key={analysis._id} analysis={analysis} session={session} />)
						) : (
							<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-gray-500">
								Sem análises técnicas vinculadas a essa oportunidade.
							</p>
						)
					) : null}
				</div>
			) : null}

			{newTechnicalAnalysisBlockIsOpen ? <NewTechnicalAnalysis opportunity={opportunity} session={session} closeModal={() => setNewTechnicalAnalysisBlockIsOpen(false)} /> : null}
		</div>
	);
}

export default OpportunityTechnicalAnalysis;
