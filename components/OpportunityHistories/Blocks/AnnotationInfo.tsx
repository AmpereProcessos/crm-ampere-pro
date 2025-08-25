import type { TOpportunityAnnotation } from "@/utils/schemas/opportunity-history.schema";
import { useOpportunityHistoryStore } from "@/utils/stores/opportunity-history-store";
import { TbNotes } from "react-icons/tb";
import TextareaInput from "@/components/Inputs/TextareaInput";

function AnnotationInfo() {
	const category = useOpportunityHistoryStore((s) => s.opportunityHistory.categoria);
	const content = useOpportunityHistoryStore((s) => (s.opportunityHistory as TOpportunityAnnotation).conteudo);
	const setContent = useOpportunityHistoryStore((s) => s.setContent);

	// Only render if category is ANOTAÇÃO
	if (category !== "ANOTAÇÃO") return null;

	return (
		<div className="w-full flex flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit">
				<TbNotes size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DA ANOTAÇÃO</h1>
			</div>
			<TextareaInput label="CONTEÚDO DA ANOTAÇÃO" value={content} handleChange={(value) => setContent(value)} placeholder="Preencha aqui o conteúdo da anotação..." />
		</div>
	);
}

export default AnnotationInfo;
