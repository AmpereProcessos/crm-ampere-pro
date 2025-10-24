import type { TUserSession } from "@/lib/auth/session";
import { renderIcon } from "@/lib/methods/rendering";
import { cn } from "@/lib/utils";
import { GeneralVisibleHiddenExitMotionVariants } from "@/utils/constants";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createOpportunityHistory } from "@/utils/mutations/opportunity-history";
import type { TOpportunityHistory, TOpportunityInteraction, TOpportunityInteractionTypeEnum } from "@/utils/schemas/opportunity-history.schema";
import { OpportunityInteractionTypes } from "@/utils/select-options";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
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
				<h1 className={"font-sans font-bold  text-primary"}>TIPO DE INTERAÇÃO</h1>
				<div className="flex w-full flex-wrap items-center justify-start gap-x-4 gap-y-1">
					{OpportunityInteractionTypes.map((interactionType) => (
						<button
							key={interactionType.value}
							onClick={() =>
								setNewInteractionHolder((prev) => ({
									...prev,
									tipoInteracao: interactionType.value as TOpportunityInteractionTypeEnum,
									conteudo: interactionType.generalContent,
								}))
							}
							type="button"
							className={cn("flex items-center gap-1 rounded-sm border border-black px-2 py-1 text-primary", {
								"bg-black text-primary-foreground": interactionType.value === (newInteractionHolder as TOpportunityInteraction).tipoInteracao,
							})}
						>
							{renderIcon(interactionType.icon)}
							<h1 className="text-xs">{interactionType.label}</h1>
						</button>
					))}
				</div>
			</div>
			<div className="flex w-full flex-col rounded-md border border-primary/30 p-2 shadow-md">
				<h1 className="text-sm font-medium leading-none tracking-tight text-primary/70">CONTEÚDO DA INTERAÇÃO</h1>
				<input
					value={newInteractionHolder.conteudo}
					onChange={(e) => setNewInteractionHolder((prev) => ({ ...prev, conteudo: e.target.value }))}
					type="text"
					placeholder="Preencha aqui o conteúdo da interação..."
					className="w-full p-3 text-start text-sm outline-hidden"
				/>
			</div>
			<div className="flex w-full items-center justify-between">
				<button
					type="button"
					onClick={() => closeMenu()}
					className="whitespace-nowrap rounded-sm bg-primary/50 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
				>
					FECHAR
				</button>
				<button
					type="button"
					disabled={isPending}
					// @ts-ignore
					onClick={() => handleCreateOpportunityHistory({ info: newInteractionHolder })}
					className="whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
				>
					CRIAR INTERAÇÃO
				</button>
			</div>
		</motion.div>
	);
}

export default NewOpportunityInteractionMenu;
