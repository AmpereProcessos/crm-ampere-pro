import { useOpportunityTechnicalAnalysis } from "@/utils/queries/technical-analysis";
import { TProposal } from "@/utils/schemas/proposal.schema";
import { TTechnicalAnalysisDTO } from "@/utils/schemas/technical-analysis.schema";
import React from "react";
import ProposalTechnicalAnalysis from "../Cards/ProposalTechnicalAnalysis";

type TechnicalAnalysisVinculationProps = {
	opportunityId: string;
	userHasPricingViewPermission: boolean;
	infoHolder: TProposal;
	setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>;
};
function TechnicalAnalysisVinculation({ infoHolder, setInfoHolder, opportunityId, userHasPricingViewPermission }: TechnicalAnalysisVinculationProps) {
	const {
		data: analysis,
		isLoading: analysisLoading,
		isError: analysisError,
		isSuccess: analysisSuccess,
	} = useOpportunityTechnicalAnalysis({ opportunityId: opportunityId, concludedOnly: true });

	function vinculateAnalysis(analysis: TTechnicalAnalysisDTO) {
		const totals = analysis.custos.reduce(
			(acc, current) => {
				const category = current.categoria;
				const total = current.total || 0;
				if (!category) return acc;
				acc[category] += total;
				return acc;
			},
			{
				INSTALAÇÃO: 0,
				PADRÃO: 0,
				ESTRUTURA: 0,
				OUTROS: 0,
			},
		);
		setInfoHolder((prev) => ({
			...prev,
			idAnaliseTecnica: analysis._id,
			premissas: {
				...prev.premissas,
				custosInstalacao: totals.INSTALAÇÃO,
				custosPadraoEnergia: totals.PADRÃO,
				custosEstruturaInstalacao: totals.ESTRUTURA,
				custosOutros: totals.OUTROS,
			},
		}));
	}
	function unvinculateAnalysis() {
		setInfoHolder((prev) => ({
			...prev,
			idAnaliseTecnica: null,
			premissas: {
				...prev.premissas,
				custosInstalacao: null,
				custosPadraoEnergia: null,
				custosEstruturaInstalacao: null,
				custosOutros: null,
			},
		}));
	}
	return (
		<div>
			{analysisSuccess ? (
				<div className="mt-2 flex w-full flex-col">
					<h1 className="w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-primary-foreground">ANÁLISES TÉCNICAS</h1>
					<div className="flex w-full flex-col gap-1 py-2">
						{analysis.length > 0 ? (
							analysis.map((analysis) => (
								<ProposalTechnicalAnalysis
									key={analysis._id}
									isSelected={analysis._id == infoHolder.idAnaliseTecnica}
									analysis={analysis}
									vinculateAnalysis={(a) => vinculateAnalysis(a)}
									unvinculateAnalysis={unvinculateAnalysis}
									userHasPricingViewPermission={userHasPricingViewPermission}
								/>
							))
						) : (
							<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
								Sem análises técnicas concluídas disponíveis.
							</p>
						)}
					</div>
				</div>
			) : null}
		</div>
	);
}

export default TechnicalAnalysisVinculation;
