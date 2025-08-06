import { IProject, ITechnicalAnalysis } from "@/utils/models";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { MdAdd } from "react-icons/md";
import LoadingComponent from "../utils/LoadingComponent";
import dayjs from "dayjs";
import RequestTechnicalAnalysis from "../Modals/RequestTechnicalAnalysis";
import { AiFillEye } from "react-icons/ai";
import { VscChromeClose } from "react-icons/vsc";
import TechAnalysisItem from "../Cards/TechAnalysisKitItem";
import { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";
import { checkQueryEnableStatus } from "@/utils/methods";
import { useOpportunityTechnicalAnalysis } from "@/utils/queries/technical-analysis";
import { TOpportunityBlockMode } from "./OpportunityPage";

type TechAnalysisListBlockProps = {
	opportunityId: string;
	setBlockMode: React.Dispatch<React.SetStateAction<TOpportunityBlockMode>>;
};

function TechAnalysisListBlock({ opportunityId, setBlockMode }: TechAnalysisListBlockProps) {
	const { data: technicalAnalysis, isFetching: fetchingTechAnalysis, isSuccess: successTechAnalysis } = useOpportunityTechnicalAnalysis({ opportunityId });

	const [requestModalIsOpen, setRequestModalIsOpen] = useState<boolean>(false);
	return (
		<div className="flex h-[320px] w-full flex-col rounded-md border border-gray-300 bg-[#fff] p-3 shadow-lg lg:h-[230px] lg:w-[60%]">
			<div className="flex  h-[40px] items-center  justify-between border-b border-gray-300 pb-2">
				<div className="flex items-center justify-center gap-5">
					<h1 onClick={() => setBlockMode("PROPOSES")} className="w-[120px] cursor-pointer border-b border-transparent p-1 text-center font-bold text-black hover:border-blue-500">
						Propostas
					</h1>
					<h1 onClick={() => setBlockMode("TECHNICAL ANALYSIS")} className="w-fit cursor-pointer border-b border-[#15599a] p-1 text-center font-bold text-black hover:border-blue-500">
						Análises Técnicas
					</h1>
				</div>

				<button onClick={() => setRequestModalIsOpen(true)} className="hidden rounded bg-green-600 p-1 text-sm font-bold text-white lg:flex">
					SOLICITAR ANÁLISE
				</button>
				<button onClick={() => setRequestModalIsOpen(true)} className="flex rounded bg-green-600 p-1 text-sm font-bold text-white lg:hidden">
					<MdAdd />
				</button>
			</div>
			<div className="overscroll-y relative flex w-full grow flex-col gap-2 overflow-y-auto py-1 pr-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
				{fetchingTechAnalysis ? (
					<div className="flex grow items-center justify-center">
						<LoadingComponent />
					</div>
				) : null}
				{successTechAnalysis && technicalAnalysis ? (
					technicalAnalysis?.length > 0 ? (
						technicalAnalysis?.map((analysis, index) => <TechAnalysisItem key={analysis._id} info={analysis} />)
					) : (
						<p className="flex grow items-center justify-center italic text-gray-500">Não foram encontradas análises técnicas vinculadas a esse projeto...</p>
					)
				) : null}
			</div>
			{requestModalIsOpen ? <RequestTechnicalAnalysis project={project} closeModal={() => setRequestModalIsOpen(false)} /> : null}
		</div>
	);
}

export default TechAnalysisListBlock;
