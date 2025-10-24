import LaudoFormularioVisitaRural from "@/components/TechnicalAnalysis/Reports/LaudoFormularioVisitaRural";
import LaudoFormularioVisitaUrbano from "@/components/TechnicalAnalysis/Reports/LaudoFormularioVisitaUrbano";
import LaudoIntermediarioUrbano from "@/components/TechnicalAnalysis/Reports/LaudoIntermediarioUrbano";
import LaudoSimplesRural from "@/components/TechnicalAnalysis/Reports/LaudoSimplesRural";
import LaudoSimplesUrbano from "@/components/TechnicalAnalysis/Reports/LaudoSimplesUrbano";
import LaudoTecnicoRural from "@/components/TechnicalAnalysis/Reports/LaudoTecnicoRural";
import LaudoTecnicoUrbano from "@/components/TechnicalAnalysis/Reports/LaudoTecnicoUrbano";
import ErrorComponent from "@/components/utils/ErrorComponent";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { TTechnicalAnalysis, TTechnicalAnalysisDTO } from "@/utils/schemas/technical-analysis.schema";
import { Collection, ObjectId } from "mongodb";
import { GetServerSidePropsContext } from "next";
import React from "react";

type TechnicalReportPageProps = {
	analysisJSON: string;
	type: string;
	error: string | null | undefined;
};
function TechnicalReportPage({ analysisJSON, type, error }: TechnicalReportPageProps) {
	if (error) return <ErrorComponent msg={error} />;
	const analysis: TTechnicalAnalysisDTO = JSON.parse(analysisJSON);
	return (
		<>
			{type == "LAUDO TÉCNICO(URBANO)" && <LaudoTecnicoUrbano analysis={analysis} />}
			{type == "LAUDO SIMPLES(URBANO)" && <LaudoSimplesUrbano analysis={analysis} />}
			{type == "LAUDO INTERMEDIÁRIO(URBANO)" && <LaudoIntermediarioUrbano analysis={analysis} />}
			{type == "LAUDO TÉCNICO(RURAL)" && <LaudoTecnicoRural analysis={analysis} />}
			{type == "LAUDO SIMPLES(RURAL)" && <LaudoSimplesRural analysis={analysis} />}
			{type == "FORMULÁRIO(URBANO)" && <LaudoFormularioVisitaUrbano analysis={analysis} />}
			{type == "FORMULÁRIO(RURAL)" && <LaudoFormularioVisitaRural analysis={analysis} />}
		</>
	);
}

export default TechnicalReportPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const { query } = context;
	const { id, type } = query;

	if (!id || typeof id != "string" || !ObjectId.isValid(id))
		return {
			props: {
				error: "Oops, id inválido.",
			},
		};
	if (!type)
		return {
			props: {
				error: "Oops, tipo de laudo inválido inválido.",
			},
		};
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const analysisCollection: Collection<TTechnicalAnalysis> = db.collection("technical-analysis");

	const analysis = await analysisCollection.findOne({ _id: new ObjectId(id) });

	if (!analysis)
		return {
			props: {
				error: "Oops, análise não encontrada.",
			},
		};

	return {
		props: {
			analysisJSON: JSON.stringify(analysis),
			type: type,
		},
	};
}
