import type { TUserSession } from "@/lib/auth/session";
import { GeneralVisibleHiddenExitMotionVariants } from "@/utils/constants";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createOpportunityHistory } from "@/utils/mutations/opportunity-history";
import { TOpportunityHistory } from "@/utils/schemas/opportunity-history.schema";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";

const variants = {
	hidden: {
		opacity: 0.2,
		transition: {
			duration: 0.8, // Adjust the duration as needed
		},
	},
	visible: {
		opacity: 1,
		transition: {
			duration: 0.8, // Adjust the duration as needed
		},
	},
	exit: {
		opacity: 0,
		transition: {
			duration: 0.01, // Adjust the duration as needed
		},
	},
};

type NewOpportunityNoteMenuProps = {
	session: TUserSession;
	opportunity: { id: string; nome: string; identificador: string };
	closeMenu: () => void;
};
function NewOpportunityNoteMenu({ session, opportunity, closeMenu }: NewOpportunityNoteMenuProps) {
	const queryClient = useQueryClient();
	const [newNoteHolder, setNewNoteHolder] = useState<TOpportunityHistory>({
		oportunidade: opportunity,
		idParceiro: session.user.idParceiro || "",
		categoria: "ANOTAÇÃO",
		conteudo: "",
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
				<label htmlFor={"opportunity-note"} className={"font-sans font-bold  text-primary"}>
					ANOTAÇÃO
				</label>
				<textarea
					id={"opportunity-note"}
					placeholder="Preencha aqui uma anotação sobre a oportunidade..."
					value={newNoteHolder.conteudo}
					onChange={(e) => {
						setNewNoteHolder((prev) => ({ ...prev, conteudo: e.target.value }));
					}}
					className="min-h-[80px] w-full resize-none rounded-md border border-primary/30  p-3 text-center text-sm shadow-md outline-hidden"
				/>
			</div>
			<div className="flex w-full items-center justify-between">
				<button
					onClick={() => closeMenu()}
					className="whitespace-nowrap rounded-sm bg-primary/50 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
				>
					FECHAR
				</button>
				<button
					disabled={isPending}
					// @ts-ignore
					onClick={() => handleCreateOpportunityHistory({ info: newNoteHolder })}
					className="whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground"
				>
					CRIAR ANOTAÇÃO
				</button>
			</div>
		</motion.div>
	);
}

export default NewOpportunityNoteMenu;
