import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import { useTechnicalAnalysisById } from "@/utils/queries/technical-analysis";
import ActiveTechnicalAnalysis from "./ActiveTechnicalAnalysis";

type ReviewActiveTechnicalAnalysisProps = {
	analysisId: string;
	userHasPricingViewPermission: boolean;
};
function ReviewActiveTechnicalAnalysis({ analysisId, userHasPricingViewPermission }: ReviewActiveTechnicalAnalysisProps) {
	const { data: analysis, isLoading, isError, isSuccess } = useTechnicalAnalysisById({ id: analysisId });
	return (
		<div className="flex w-full flex-col gap-2">
			<h1 className="w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-primary-foreground">INFORMAÇÕES DA ANÁLISE TÉCNICA</h1>
			<div className="flex w-full flex-col gap-2">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Oops, houve um erro ao buscar informações da análise técnica escolhida." /> : null}
				{isSuccess ? (
					<div className="mb-6 flex w-full flex-col items-center justify-center rounded-sm border border-green-500">
						<h1 className="w-full rounded-md rounded-tl rounded-tr bg-green-500 p-1 text-center text-sm font-bold text-primary-foreground">
							ANÁLISE TÉCNICA ATIVA
						</h1>
						<div className="flex w-full items-center justify-center p-2">
							<ActiveTechnicalAnalysis analysis={analysis} userHasPricingViewPermission={userHasPricingViewPermission} />
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}

export default ReviewActiveTechnicalAnalysis;
