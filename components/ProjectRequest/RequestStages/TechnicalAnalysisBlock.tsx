import OpportunityHomologationCard from "@/components/Cards/OpportunityHomologation";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";

import { TProject } from "@/utils/schemas/project.schema";
import type { TUserSession } from "@/lib/auth/session";
import React from "react";
import SelectableHomologation from "./Utils/SelectableHomologation";
import { useOpportunityTechnicalAnalysis } from "@/utils/queries/technical-analysis";
import OpportunityTechnicalAnalysisItem from "@/components/Cards/OpportunityTechnicalAnalysisItem";
import ActiveTechnicalAnalysis from "./Utils/ActiveTechnicalAnalysis";
import SelectableTechnicalAnalysis from "./Utils/SelectableTechnicalAnalysis";

type TechnicalAnalysisBlockProps = {
	infoHolder: TProject;
	setInfoHolder: React.Dispatch<React.SetStateAction<TProject>>;
	moveToNextStage: () => void;
	moveToPreviousStage: () => void;
	session: TUserSession;
};
function TechnicalAnalysisBlock({ infoHolder, setInfoHolder, moveToNextStage, moveToPreviousStage, session }: TechnicalAnalysisBlockProps) {
	const opportunityId = infoHolder.oportunidade.id;
	const { data: analysis, isLoading, isError, isSuccess } = useOpportunityTechnicalAnalysis({ opportunityId, concludedOnly: true });

	const activeAnalysis = infoHolder.idAnaliseTecnica ? analysis?.find((h) => h._id == infoHolder.idAnaliseTecnica) : null;
	const selectableAnalysis = analysis?.filter((h) => h._id != infoHolder.idAnaliseTecnica);
	function validateAndProceed() {
		moveToNextStage();
	}
	return (
		<div className="flex w-full grow flex-col gap-2">
			<h1 className="w-full rounded bg-gray-800 p-1 text-center font-bold text-white">INFORMAÇÕES DA ANÁLISE TÉCNICA</h1>
			<div className="flex w-full grow flex-col gap-2">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Oops, houve um erro ao buscar as homologações vinculadas a oportunidade." /> : null}
				{isSuccess ? (
					<>
						{activeAnalysis ? (
							<div className="mb-6 flex w-full flex-col items-center justify-center rounded border border-green-500">
								<h1 className="w-full rounded-md rounded-tl rounded-tr bg-green-500 p-1 text-center text-sm font-bold text-white">ANÁLISE TÉCNICA ATIVA</h1>
								<div className="flex w-full items-center justify-center p-2">
									<ActiveTechnicalAnalysis analysis={activeAnalysis} userHasPricingViewPermission={session.user.permissoes.precos.visualizar} />
								</div>
							</div>
						) : null}
						<h1 className="text-[0.65rem] font-bold leading-none tracking-tight text-gray-500 lg:text-xs">LISTA DE ANÁLISES TÉCNICAS DA OPORTUNIDADE</h1>
						{selectableAnalysis ? (
							selectableAnalysis.length > 0 ? (
								selectableAnalysis.map((analysis) => (
									<SelectableTechnicalAnalysis
										key={analysis._id}
										analysis={analysis}
										selectAnalysis={(id) => setInfoHolder((prev) => ({ ...prev, idAnaliseTecnica: id }))}
										userHasPricingViewPermission={session.user.permissoes.precos.visualizar}
									/>
								))
							) : (
								<p className="w-full text-center text-sm font-medium tracking-tight text-gray-500">Nenhuma análise técnica encontrada.</p>
							)
						) : null}
					</>
				) : null}
			</div>
			<div className="flex w-full items-center justify-between">
				<button
					onClick={() => {
						moveToPreviousStage();
					}}
					className="rounded p-2 font-bold text-gray-500 duration-300 hover:scale-105"
				>
					VOLTAR
				</button>
				{activeAnalysis ? (
					<button onClick={() => validateAndProceed()} className="rounded bg-black px-4 py-1 text-sm font-medium text-white duration-300 ease-in-out hover:bg-gray-700">
						PROSSEGUIR
					</button>
				) : (
					<button onClick={() => validateAndProceed()} className="rounded bg-orange-700 px-4 py-1 text-sm font-medium text-white duration-300 ease-in-out hover:bg-orange-800">
						PROSSEGUIR SEM ANÁLISE TÉCNICA
					</button>
				)}
			</div>
		</div>
	);
}

export default TechnicalAnalysisBlock;
