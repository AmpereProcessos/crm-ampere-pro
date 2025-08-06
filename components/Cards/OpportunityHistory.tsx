import type { TOpportunityHistoryDTO, TOpportunityInteraction, TOpportunityInteractionTypeEnum, TOpportunityAnnotation } from "@/utils/schemas/opportunity-history.schema";
import React, { useState } from "react";
import Avatar from "../utils/Avatar";
import { IoIosCalendar } from "react-icons/io";
import { formatDateAsLocale } from "@/lib/methods/formatting";
import { OpportunityInteractionTypes } from "@/utils/select-options";
import { MdMessage } from "react-icons/md";
import { renderIcon } from "@/lib/methods/rendering";
import ControlOpportunityHistory from "../OpportunityHistories/ControlOpportunityHistory";
import type { TUserSession } from "@/lib/auth/session";
import { Pencil } from "lucide-react";
import { Button } from "../ui/button";

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
				<ControlOpportunityHistory opportunityHistoryId={history._id} session={session} closeModal={() => setEditHistoryModalIsOpen(false)} callbacks={callbacks} />
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
		<div className="flex w-full flex-col gap-2 rounded-md bg-yellow-100 p-2">
			<div className="flex w-full items-center justify-between">
				<div className="flex items-center gap-2">
					<Avatar fallback={"R"} url={annotation.autor?.avatar_url || undefined} height={22} width={22} />
					<p className="text-xs font-medium text-gray-500">{annotation.autor.nome}</p>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={handleEditHistory} variant="ghost" size="fit" className="rounded-full p-1">
						<Pencil className="h-4 w-4 min-w-4 min-h-4" />
					</Button>
					<div className="flex items-center gap-2">
						<IoIosCalendar style={{ fontSize: "20px" }} />
						<p className="text-xs font-medium text-gray-500">{formatDateAsLocale(annotation.dataInsercao, true)}</p>
					</div>
				</div>
			</div>
			<div className="flex w-full items-center justify-center border border-gray-300 bg-[#F4F0BB] p-2">
				<p className="w-full text-center text-sm text-gray-500">{annotation.conteudo}</p>
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
		<div className="flex w-full flex-col gap-2 border border-gray-300 p-3 shadow-md">
			<div className="flex w-full items-center justify-between">
				<div className="flex items-center gap-2">
					<p className="rounded-lg bg-[#15599a] px-2 py-0.5 text-[0.65rem] font-medium text-white">INTERAÇÃO</p>

					{renderIcon(getInteractionIcon(interaction.tipoInteracao))}
					<p className="text-xs font-medium text-gray-500">{interaction.tipoInteracao}</p>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={handleEditHistory} variant="ghost" size="fit" className="rounded-full p-1">
						<Pencil className="h-4 w-4 min-w-4 min-h-4" />
					</Button>
					<div className="flex items-center gap-2">
						<Avatar fallback={"R"} url={interaction.autor?.avatar_url || undefined} height={22} width={22} />
						<p className="text-xs font-medium text-gray-500">{interaction.autor.nome}</p>
					</div>
					<div className="flex items-center gap-2">
						<IoIosCalendar style={{ fontSize: "20px" }} />
						<p className="text-xs font-medium text-gray-500">{formatDateAsLocale(interaction.dataInsercao, true)}</p>
					</div>
				</div>
			</div>
			<div className="flex w-full items-center justify-center border border-gray-300 p-2">
				<p className="w-full text-center text-sm text-gray-500">{interaction.conteudo}</p>
			</div>
		</div>
	);
}
