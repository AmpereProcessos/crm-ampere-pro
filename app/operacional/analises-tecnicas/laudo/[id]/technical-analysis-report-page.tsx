"use client";
import LaudoFormularioVisitaRural from "@/components/TechnicalAnalysis/Reports/LaudoFormularioVisitaRural";
import LaudoFormularioVisitaUrbano from "@/components/TechnicalAnalysis/Reports/LaudoFormularioVisitaUrbano";
import LaudoIntermediarioUrbano from "@/components/TechnicalAnalysis/Reports/LaudoIntermediarioUrbano";
import LaudoSimplesRural from "@/components/TechnicalAnalysis/Reports/LaudoSimplesRural";
import LaudoSimplesUrbano from "@/components/TechnicalAnalysis/Reports/LaudoSimplesUrbano";
import LaudoTecnicoRural from "@/components/TechnicalAnalysis/Reports/LaudoTecnicoRural";
import LaudoTecnicoUrbano from "@/components/TechnicalAnalysis/Reports/LaudoTecnicoUrbano";
import type { TTechnicalAnalysisDTO } from "@/utils/schemas/technical-analysis.schema";

type TechnicalAnalysisReportPageProps = {
	analysis: TTechnicalAnalysisDTO;
	type: string;
};
function TechnicalAnalysisReportPage({ analysis, type }: TechnicalAnalysisReportPageProps) {
	return (
		<>
			{type === "LAUDO TÉCNICO(URBANO)" && <LaudoTecnicoUrbano analysis={analysis} />}
			{type === "LAUDO SIMPLES(URBANO)" && <LaudoSimplesUrbano analysis={analysis} />}
			{type === "LAUDO INTERMEDIÁRIO(URBANO)" && <LaudoIntermediarioUrbano analysis={analysis} />}
			{type === "LAUDO TÉCNICO(RURAL)" && <LaudoTecnicoRural analysis={analysis} />}
			{type === "LAUDO SIMPLES(RURAL)" && <LaudoSimplesRural analysis={analysis} />}
			{type === "FORMULÁRIO(URBANO)" && <LaudoFormularioVisitaUrbano analysis={analysis} />}
			{type === "FORMULÁRIO(RURAL)" && <LaudoFormularioVisitaRural analysis={analysis} />}
		</>
	);
}

export default TechnicalAnalysisReportPage;
