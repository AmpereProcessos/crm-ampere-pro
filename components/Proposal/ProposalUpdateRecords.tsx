import { useProposalUpdateRecords } from "@/utils/queries/proposal-update-records";
import { Library } from "lucide-react";
import ProposalUpdateRecord from "../Cards/ProposalUpdateRecord";
import ErrorComponent from "../utils/ErrorComponent";
import LoadingComponent from "../utils/LoadingComponent";

type ProposalUpdateRecordsProps = {
	proposalId: string;
};
function ProposalUpdateRecords({ proposalId }: ProposalUpdateRecordsProps) {
	const { data: records, isLoading, isError, isSuccess } = useProposalUpdateRecords({ proposalId });
	return (
		<div className="bg-card border-primary/20 flex w-full flex-col gap-3 rounded-xl border px-3 py-4 shadow-xs">
			<div className="flex w-full items-center gap-1">
				<Library className="h-4 w-4" />
				<h1 className="text-xs font-medium tracking-tight uppercase">REGISTROS DE ALTERAÇÃO</h1>
			</div>
			<div className="flex min-h-[50px] w-full flex-col gap-2 p-2">
				{isLoading ? <LoadingComponent /> : null} {isError ? <ErrorComponent msg="Erro ao buscar registros de alteração." /> : null}
				{isSuccess ? (
					records.length > 0 ? (
						records.map((record) => <ProposalUpdateRecord key={record._id} record={record} />)
					) : (
						<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
							Sem registros de alteração.
						</p>
					)
				) : null}
			</div>
		</div>
	);
}

export default ProposalUpdateRecords;
