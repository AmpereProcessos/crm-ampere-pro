import TextareaInput from "@/components/Inputs/TextareaInput";
import { Button } from "@/components/ui/button";
import { renderIcon } from "@/lib/methods/rendering";
import { cn } from "@/lib/utils";
import type { TOpportunityInteraction, TOpportunityInteractionTypeEnum } from "@/utils/schemas/opportunity-history.schema";
import { useOpportunityHistoryStore } from "@/utils/stores/opportunity-history-store";
import { OpportunityInteractionTypes } from "@/utils/select-options";
import { AiFillInteraction } from "react-icons/ai";

function InterationInfo() {
	const category = useOpportunityHistoryStore((s) => s.opportunityHistory.categoria);
	const interactionType = useOpportunityHistoryStore((s) => (s.opportunityHistory as TOpportunityInteraction).tipoInteracao);
	const content = useOpportunityHistoryStore((s) => (s.opportunityHistory as TOpportunityInteraction).conteudo);
	const setInteractionType = useOpportunityHistoryStore((s) => s.setInteractionType);
	const setContent = useOpportunityHistoryStore((s) => s.setContent);

	// Only render if category is INTERAÇÃO
	if (category !== "INTERAÇÃO") return null;

	return (
		<div className="w-full flex flex-col gap-2">
			<div className="flex items-center gap-2 bg-primary/20 px-2 py-1 rounded w-fit">
				<AiFillInteraction size={15} />
				<h1 className="text-xs tracking-tight font-medium text-start w-fit">INFORMAÇÕES DA INTERAÇÃO</h1>
			</div>
			<div className="flex w-full flex-col gap-3">
				<div className="flex w-full flex-col gap-1">
					<h1 className={"text-sm font-medium tracking-tight text-primary/80"}>TIPO DE INTERAÇÃO</h1>
					<div className="flex w-full flex-wrap items-center justify-start gap-x-4 gap-y-1">
						{OpportunityInteractionTypes.map((type) => (
							<Button
								key={type.value}
								onClick={() => setInteractionType(type.value as TOpportunityInteractionTypeEnum)}
								variant="ghost"
								size={"fit"}
								className={cn("px-2 py-1 flex items-center gap-2", interactionType === type.value && "bg-blue-500 text-white")}
							>
								{renderIcon(type.icon)}
								<h1 className="text-[0.65rem]">{type.label}</h1>
							</Button>
						))}
					</div>
				</div>
				<TextareaInput label="CONTEÚDO DA INTERAÇÃO" value={content} handleChange={(value) => setContent(value)} placeholder="Preencha aqui o conteúdo da interação..." />
			</div>
		</div>
	);
}

export default InterationInfo;
