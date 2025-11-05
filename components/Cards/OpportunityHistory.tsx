import type { TUserSession } from "@/lib/auth/session";
import { formatDateAsLocale } from "@/lib/methods/formatting";
import { renderIcon } from "@/lib/methods/rendering";
import type {
	TOpportunityAnnotation,
	TOpportunityHistoryDTO,
	TOpportunityInteraction,
	TOpportunityInteractionTypeEnum,
} from "@/utils/schemas/opportunity-history.schema";
import { OpportunityInteractionTypes } from "@/utils/select-options";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { IoIosCalendar } from "react-icons/io";
import { MdMessage } from "react-icons/md";
import ControlOpportunityHistory from "../OpportunityHistories/ControlOpportunityHistory";
import { Button } from "../ui/button";
import Avatar from "../utils/Avatar";

type OpportunityHistoryProps = {
	session: TUserSession;
	history: TOpportunityHistoryDTO;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
	};
};
function OpportunityHistory({ history, session, callbacks }: OpportunityHistoryProps) {
	const [editHistoryModalIsOpen, setEditHistoryModalIsOpen] = useState(false);
	return (
		<>
			{history.categoria === "ANOTAÇÃO" ? (
				<OpportunityHistoryAnnotation annotation={history as TOpportunityAnnotation} handleEditHistory={() => setEditHistoryModalIsOpen(true)} />
			) : null}
			{history.categoria === "INTERAÇÃO" ? (
				<OpportunityHistoryInteraction interaction={history as TOpportunityInteraction} handleEditHistory={() => setEditHistoryModalIsOpen(true)} />
			) : null}
			{editHistoryModalIsOpen ? (
				<ControlOpportunityHistory
					opportunityHistoryId={history._id}
					session={session}
					closeModal={() => setEditHistoryModalIsOpen(false)}
					callbacks={callbacks}
				/>
			) : null}
		</>
	);
}

export default OpportunityHistory;

type OpportunityHistoryAnnotationProps = {
	annotation: TOpportunityAnnotation;
	handleEditHistory: () => void;
};
function OpportunityHistoryAnnotation({ annotation, handleEditHistory }: OpportunityHistoryAnnotationProps) {
	return (
		<div className="flex w-full flex-col gap-2 rounded-md bg-yellow-100 p-2 text-black">
			<div className="flex w-full items-center justify-between">
				<div className="flex items-center gap-2">
					<Avatar fallback={"R"} url={annotation.autor?.avatar_url || undefined} height={22} width={22} />
					<p className="text-xs font-medium text-black/70">{annotation.autor.nome}</p>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={handleEditHistory} variant="ghost" size="fit" className="rounded-full p-1">
						<Pencil className="h-4 w-4 min-w-4 min-h-4" />
					</Button>
					<div className="flex items-center gap-2">
						<IoIosCalendar style={{ fontSize: "20px" }} />
						<p className="text-xs font-medium text-black/70">{formatDateAsLocale(annotation.dataInsercao, true)}</p>
					</div>
				</div>
			</div>
			<div className="flex w-full items-center justify-center border border-primary/30 bg-[#F4F0BB] p-2">
				<p className="w-full text-center text-sm text-black/70">{annotation.conteudo}</p>
			</div>
		</div>
	);
}

type OpportunityHistoryInteractionProps = {
	interaction: TOpportunityInteraction;
	handleEditHistory: () => void;
};
function OpportunityHistoryInteraction({ interaction, handleEditHistory }: OpportunityHistoryInteractionProps) {
	function getInteractionIcon(interactionType: TOpportunityInteractionTypeEnum) {
		const interactionInfo = OpportunityInteractionTypes.find((t) => t.value === interactionType);
		return interactionInfo?.icon || MdMessage;
	}
	return (
		<div className="flex w-full flex-col gap-2 border border-primary/30 p-3 shadow-md">
			<div className="flex w-full items-center justify-between flex-col lg:flex-row gap-2">
				<div className="flex items-center gap-2 flex-wrap">
					<p className="rounded-lg bg-[#15599a] px-2 py-0.5 text-[0.65rem] font-medium text-white">INTERAÇÃO</p>
					<div className="flex items-center gap-1">
						{renderIcon(getInteractionIcon(interaction.tipoInteracao))}
						<p className="text-xs font-medium text-primary/70">{interaction.tipoInteracao}</p>
					</div>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<Button onClick={handleEditHistory} variant="ghost" size="fit" className="rounded-full p-1">
						<Pencil className="h-4 w-4 min-w-4 min-h-4" />
					</Button>
					<div className="flex items-center gap-2">
						<Avatar fallback={"R"} url={interaction.autor?.avatar_url || undefined} height={22} width={22} />
						<p className="text-xs font-medium text-primary/70">{interaction.autor.nome}</p>
					</div>
					<div className="flex items-center gap-2">
						<IoIosCalendar style={{ fontSize: "20px" }} />
						<p className="text-xs font-medium text-primary/70">{formatDateAsLocale(interaction.dataInsercao, true)}</p>
					</div>
				</div>
			</div>
			<div className="flex w-full items-center justify-center border border-primary/30 p-2">
				<p className="w-full text-center text-sm text-primary/70">{interaction.conteudo}</p>
			</div>
		</div>
	);
}
