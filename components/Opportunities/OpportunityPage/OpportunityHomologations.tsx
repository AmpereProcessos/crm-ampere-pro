import NewHomologation from "@/app/components/Modals/Homologations/NewHomologation";
import type { TUserSession } from "@/lib/auth/session";
import { useOpportunityHomologations } from "@/utils/queries/homologations";
import { TOpportunityDTOWithClient } from "@/utils/schemas/opportunity.schema";
import { useState } from "react";
import OpportunityHomologationCard from "../../Cards/OpportunityHomologation";
import ErrorComponent from "../../utils/ErrorComponent";
import LoadingComponent from "../../utils/LoadingComponent";
import { Plus } from "lucide-react";
import { Button } from "../../ui/button";

type OpportunityHomologationsProps = {
	opportunity: TOpportunityDTOWithClient;
	session: TUserSession;
};
function OpportunityHomologations({ opportunity, session }: OpportunityHomologationsProps) {
	const { data: homologations, isLoading, isError, isSuccess } = useOpportunityHomologations({ opportunityId: opportunity._id });
	const [newHomologationModalIsOpen, setNewHomologationModalIsOpen] = useState<boolean>(false);
	const [blockIsOpen, setBlockIsOpen] = useState<boolean>(false);

	return (
		<div className={"bg-card border-primary/20 flex w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs"}>
			<div className="flex items-center justify-between">
				<h1 className="text-xs font-bold tracking-tight uppercase">HOMOLOGAÇÕES</h1>
				<div className="flex items-center gap-2">
					<Button variant="ghost" size={"xs"} className="flex items-center gap-1" onClick={() => setNewHomologationModalIsOpen(true)}>
						<Plus className="h-4 w-4 min-h-4 min-w-4" />
						<p className="text-xs font-medium">NOVA HOMOLOGAÇÃO</p>
					</Button>
				</div>
			</div>
			{blockIsOpen ? (
				<div className="grow flex flex-col w-full max-h-[250px] pr-2 gap-1 overscroll-y overflow-y-auto scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Erro ao buscar homologações da oportunidade." /> : null}
					{isSuccess ? (
						homologations.length > 0 ? (
							homologations.map((homologation) => <OpportunityHomologationCard key={homologation._id} homologation={homologation} />)
						) : (
							<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
								Sem homologações vinculadas a essa oportunidade.
							</p>
						)
					) : null}
				</div>
			) : null}

			{newHomologationModalIsOpen ? (
				<NewHomologation opportunity={opportunity} session={session} closeModal={() => setNewHomologationModalIsOpen(false)} />
			) : null}
		</div>
	);
}

export default OpportunityHomologations;
