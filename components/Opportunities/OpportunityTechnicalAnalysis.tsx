import type { TUserSession } from "@/lib/auth/session";
import { useOpportunityTechnicalAnalysis } from "@/utils/queries/technical-analysis";
import { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import { useState } from "react";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import { MdAdd } from "react-icons/md";
import OpportunityTechnicalAnalysisItem from "../Cards/OpportunityTechnicalAnalysisItem";
import NewTechnicalAnalysis from "../Modals/TechnicalAnalysis/NewTechnicalAnalysis";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

type OpportunityTechnicalAnalysisProps = {
	session: TUserSession;
	opportunity: TOpportunityDTOWithClient;
};
function OpportunityTechnicalAnalysis({ session, opportunity }: OpportunityTechnicalAnalysisProps) {
	const [blockIsOpen, setBlockIsOpen] = useState<boolean>(false);

	const [newTechnicalAnalysisBlockIsOpen, setNewTechnicalAnalysisBlockIsOpen] = useState<boolean>(false);
	const { data: analysis, isLoading, isError, isSuccess } = useOpportunityTechnicalAnalysis({ opportunityId: opportunity._id, concludedOnly: false });

	return (
		<div className={"bg-card border-primary/20 flex w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs"}>
			<div className="flex items-center justify-between">
				<h1 className="text-xs font-bold tracking-tight uppercase">ANÁLISES TÉCNICAS</h1>
				<div className="flex items-center gap-2">
					<Button variant="ghost" size={"xs"} className="flex items-center gap-1" onClick={() => setNewTechnicalAnalysisBlockIsOpen(true)}>
						<Plus className="h-4 w-4 min-h-4 min-w-4" />
						<p className="text-xs font-medium">NOVA ANÁLISE</p>
					</Button>
				</div>
			</div>

			<div className="grow flex flex-col w-full max-h-[250px] pr-2 gap-1 overscroll-y overflow-y-auto scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Erro ao buscar análises técnicas da oportunidade." /> : null}
				{isSuccess ? (
					analysis.length > 0 ? (
						analysis.map((analysis) => <OpportunityTechnicalAnalysisItem key={analysis._id} analysis={analysis} session={session} />)
					) : (
						<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
							Sem análises técnicas vinculadas a essa oportunidade.
						</p>
					)
				) : null}
			</div>

			{newTechnicalAnalysisBlockIsOpen ? (
				<NewTechnicalAnalysis opportunity={opportunity} session={session} closeModal={() => setNewTechnicalAnalysisBlockIsOpen(false)} />
			) : null}
		</div>
	);
}

export default OpportunityTechnicalAnalysis;
