import { TOpportunityHistory, TOpportunityInteraction, TOpportunityInteractionTypeEnum } from "@/utils/schemas/opportunity-history.schema";
import { OpportunityInteractionTypes } from "@/utils/select-options";
import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { GeneralVisibleHiddenExitMotionVariants } from "@/utils/constants";
import { cn } from "@/lib/utils";
import { renderIcon } from "@/lib/methods/rendering";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createOpportunityHistory } from "@/utils/mutations/opportunity-history";
import { useQueryClient } from "@tanstack/react-query";
type NewOpportunityInteractionMenuProps = {
	session: TUserSession;
	opportunity: { id: string; nome: string; identificador: string };
	closeMenu: () => void;
};
function NewOpportunityInteractionMenu({ session, opportunity, closeMenu }: NewOpportunityInteractionMenuProps) {
	const queryClient = useQueryClient();

	const [newInteractionHolder, setNewInteractionHolder] = useState<TOpportunityHistory>({
		oportunidade: opportunity,
		idParceiro: session.user.idParceiro || "",
		categoria: "INTERAÇÃO",
		tipoInteracao: OpportunityInteractionTypes[0].value as TOpportunityInteractionTypeEnum,
		conteudo: OpportunityInteractionTypes[0].generalContent,
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});

	const { mutate: handleCreateOpportunityHistory, isPending } = useMutationWithFeedback({
		mutationKey: ["create-opportunity-history"],
		mutationFn: createOpportunityHistory,
		queryClient: queryClient,
		affectedQueryKey: [],
	});
	return (
		<motion.div variants={GeneralVisibleHiddenExitMotionVariants} initial="hidden" animate="visible" exit="exit" className="flex w-full flex-col gap-2 p-2">
			<div className="flex w-full flex-col gap-1">
				<h1 className={"font-sans font-bold  text-[#353432]"}>TIPO DE INTERAÇÃO</h1>
				<div className="flex w-full flex-wrap items-center justify-start gap-x-4 gap-y-1">
					{OpportunityInteractionTypes.map((interactionType) => (
						<button
							onClick={() =>
								setNewInteractionHolder((prev) => ({
									...prev,
									tipoInteracao: interactionType.value as TOpportunityInteractionTypeEnum,
									conteudo: interactionType.generalContent,
								}))
							}
							type="button"
							className={cn("flex items-center gap-1 rounded border border-black px-2 py-1 text-black", {
								"bg-black text-white": interactionType.value == (newInteractionHolder as TOpportunityInteraction).tipoInteracao,
							})}
						>
							{renderIcon(interactionType.icon)}
							<h1 className="text-xs">{interactionType.label}</h1>
						</button>
					))}
				</div>
			</div>
			<div className="flex w-full flex-col rounded-md border border-gray-200 p-2 shadow-sm">
				<h1 className="text-sm font-medium leading-none tracking-tight text-gray-500">CONTEÚDO DA INTERAÇÃO</h1>
				<input
					value={newInteractionHolder.conteudo}
					onChange={(e) => setNewInteractionHolder((prev) => ({ ...prev, conteudo: e.target.value }))}
					type="text"
					placeholder="Preencha aqui o conteúdo da interação..."
					className="w-full p-3 text-start text-sm outline-none"
				/>
			</div>
			<div className="flex w-full items-center justify-between">
				<button
					onClick={() => closeMenu()}
					className="whitespace-nowrap rounded bg-gray-500 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
				>
					FECHAR
				</button>
				<button
					disabled={isPending}
					// @ts-ignore
					onClick={() => handleCreateOpportunityHistory({ info: newInteractionHolder })}
					className="whitespace-nowrap rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
				>
					CRIAR INTERAÇÃO
				</button>
			</div>
		</motion.div>
	);
}

export default NewOpportunityInteractionMenu;
