import { type Collection, ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import ErrorComponent from "@/components/utils/ErrorComponent";
import { getCurrentSession } from "@/lib/auth/session";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TTechnicalAnalysis } from "@/utils/schemas/technical-analysis.schema";
import TechnicalAnalysisReportPage from "./technical-analysis-report-page";

export default async function TechnicalAnalysisReport({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type: string }> }) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const id = awaitedParams.id;
	const type = awaitedSearchParams.type;
	if (!id) return <ErrorComponent msg="ID da análise técnica não encontrado" />;

	const session = await getCurrentSession();
	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}

	const db = await connectToDatabase();
	const analysisCollection: Collection<TTechnicalAnalysis> = db.collection("technical-analysis");

	const analysis = await analysisCollection.findOne({ _id: new ObjectId(id) });

	if (!analysis) return <ErrorComponent msg="Análise técnica não encontrada" />;
	return <TechnicalAnalysisReportPage analysis={{ ...analysis, _id: analysis._id.toString() }} type={type} />;
}
