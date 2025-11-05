import type { TUserSession } from "@/lib/auth/session";
import type { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import { useState } from "react";
import { MdAdd } from "react-icons/md";

import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";

import { usePPSCallsByOpportunityId } from "@/utils/queries/pps-calls";
import { useQueryClient } from "@tanstack/react-query";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import OpenPPSCall from "../Cards/OpportunityPPSCall";
import NewCall from "../Modals/Call/NewCall";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

type OpportunityTechnicalAnalysisBlockProps = {
	session: TUserSession;
	opportunity: TOpportunityDTOWithClient;
};
function OpportunityPPSCallsBlock({ session, opportunity }: OpportunityTechnicalAnalysisBlockProps) {
	const queryClient = useQueryClient();
	const [blockIsOpen, setBlockIsOpen] = useState<boolean>(false);

	const [newPPSCallModalIsOpen, setNewPPSCallModalIsOpen] = useState<boolean>(false);
	const {
		data: calls,
		isLoading,
		isError,
		isSuccess,
		queryKey,
	} = usePPSCallsByOpportunityId({
		opportunityId: opportunity._id,
		openOnly: false,
	});

	const handleOnMutatee = async () => await queryClient.cancelQueries({ queryKey: queryKey });
	const handleOnSettle = async () => await queryClient.invalidateQueries({ queryKey: queryKey });
	return (
		<div className={"bg-card border-primary/20 flex w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs"}>
			<div className="flex items-center justify-between">
				<h1 className="text-xs font-bold tracking-tight uppercase">CHAMADOS</h1>
				<div className="flex items-center gap-2">
					<Button variant="ghost" size={"xs"} className="flex items-center gap-1" onClick={() => setNewPPSCallModalIsOpen(true)}>
						<Plus className="h-4 w-4 min-h-4 min-w-4" />
						<p className="text-xs font-medium">NOVO CHAMADO</p>
					</Button>
				</div>
			</div>
			<div className="grow flex flex-col w-full max-h-[250px] pr-2 gap-1 overscroll-y overflow-y-auto scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Erro ao buscar chamados da oportunidade." /> : null}
				{isSuccess ? (
					calls && calls.length > 0 ? (
						calls.map((call) => <OpenPPSCall key={call._id} session={session} call={call} />)
					) : (
						<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
							Sem chamados vinculados a essa oportunidade.
						</p>
					)
				) : null}
			</div>

			{newPPSCallModalIsOpen ? (
				<NewCall
					opportunity={opportunity}
					session={session}
					closeModal={() => setNewPPSCallModalIsOpen(false)}
					callbacks={{
						onMutate: handleOnMutatee,
						onSettled: handleOnSettle,
					}}
				/>
			) : null}
		</div>
	);
}

export default OpportunityPPSCallsBlock;
