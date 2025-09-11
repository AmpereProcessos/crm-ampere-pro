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

type OpportunityTechnicalAnalysisBlockProps = {
	session: TUserSession;
	opportunity: TOpportunityDTOWithClient;
};
function OpportunityPPSCallsBlock({
	session,
	opportunity,
}: OpportunityTechnicalAnalysisBlockProps) {
	const queryClient = useQueryClient();
	const [blockIsOpen, setBlockIsOpen] = useState<boolean>(false);

	const [newPPSCallModalIsOpen, setNewPPSCallModalIsOpen] =
		useState<boolean>(false);
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

	const handleOnMutatee = async () =>
		await queryClient.cancelQueries({ queryKey: queryKey });
	const handleOnSettle = async () =>
		await queryClient.invalidateQueries({ queryKey: queryKey });
	return (
		<div className="flex max-h-[250px] w-full flex-col rounded-md border border-primary/30 bg-background p-3 shadow-lg">
			<div className="flex  h-[40px] items-center  justify-between border-b border-primary/30 pb-2">
				<div className="flex items-center justify-center gap-5">
					<h1 className="p-1 text-center font-bold text-primary">Chamados</h1>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setNewPPSCallModalIsOpen(true)}
						className="hidden rounded-sm bg-green-600 p-1 text-[0.7rem] font-bold text-primary-foreground lg:flex"
					>
						ABRIR CHAMADO
					</button>
					<button
						type="button"
						onClick={() => setNewPPSCallModalIsOpen(true)}
						className="flex rounded-sm bg-green-600 p-1 text-sm font-bold text-primary-foreground lg:hidden"
					>
						<MdAdd />
					</button>
					{blockIsOpen ? (
						<button
							type="button"
							className="text-primary/60 hover:text-blue-400"
						>
							<IoMdArrowDropupCircle
								style={{ fontSize: "25px" }}
								onClick={() => setBlockIsOpen(false)}
							/>
						</button>
					) : (
						<button
							type="button"
							className="text-primary/60 hover:text-blue-400"
						>
							<IoMdArrowDropdownCircle
								style={{ fontSize: "25px" }}
								onClick={() => setBlockIsOpen(true)}
							/>
						</button>
					)}
				</div>
			</div>
			{blockIsOpen ? (
				<div className="overscroll-y flex w-full grow flex-col gap-1 overflow-y-auto py-1 pr-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? (
						<ErrorComponent msg="Erro ao buscar análises técnicas da oportunidade." />
					) : null}
					{isSuccess ? (
						calls.length > 0 ? (
							calls.map((call) => (
								<OpenPPSCall key={call._id} session={session} call={call} />
							))
						) : (
							<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
								Sem chamados vinculados a essa oportunidade.
							</p>
						)
					) : null}
				</div>
			) : null}

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
