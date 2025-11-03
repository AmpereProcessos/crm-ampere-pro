import { redirect } from "next/navigation";
import TechnicalAnalysisPage from "@/components/TechnicalAnalysis/TechnicalAnalysisPage";
import { getCurrentSession } from "@/lib/auth/session";

export default async function TechnicalAnalysis() {
	const session = await getCurrentSession();
	if (!session.user || !session.session) {
		return redirect("/auth/signin");
	}
	return <TechnicalAnalysisPage session={session} />;
}
