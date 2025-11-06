import type { TUserSession } from "@/lib/auth/session";
import { useFileReferencesByOpportunityId } from "@/utils/queries/file-references";
import { useState } from "react";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import { MdAdd } from "react-icons/md";
import FileReferenceCard from "../../FileReference/FileReferenceCard";
import ControlFileReference from "../../Modals/FileReference/ControlFileReference";
import NewFileReference from "../../Modals/FileReference/NewFileReference";
import ErrorComponent from "../../utils/ErrorComponent";
import LoadingComponent from "../../utils/LoadingComponent";
import { Plus } from "lucide-react";
import { Button } from "../../ui/button";
type OpportunityFilesProps = {
	session: TUserSession;
	opportunityId: string;
	clientId: string;
};
function OpportunityFiles({ session, opportunityId, clientId }: OpportunityFilesProps) {
	const [newFileReferenceModalIsOpen, setNewFileReferenceModalIsOpen] = useState<boolean>(false);
	const [editFileReferenceModal, setEditFileReferenceModal] = useState({
		id: null as string | null,
		isOpen: false as boolean,
	});
	const { data: fileReferences, isSuccess, isLoading, isError } = useFileReferencesByOpportunityId({ opportunityId });

	return (
		<div className={"bg-card border-primary/20 flex w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs"}>
			<div className="flex items-center justify-between">
				<h1 className="text-xs font-bold tracking-tight uppercase">ARQUIVOS</h1>
				<div className="flex items-center gap-2">
					<Button variant="ghost" size={"xs"} className="flex items-center gap-1" onClick={() => setNewFileReferenceModalIsOpen(true)}>
						<Plus className="h-4 w-4 min-h-4 min-w-4" />
						<p className="text-xs font-medium">NOVO ARQUIVO</p>
					</Button>
				</div>
			</div>
			<div className="grow flex flex-col w-full max-h-[250px] pr-2 gap-1 overscroll-y overflow-y-auto scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Erro ao carregar arquivos anexados da oportunidade." /> : null}
				{isSuccess ? (
					fileReferences && fileReferences.length > 0 ? (
						fileReferences.map((fileReference) => (
							<FileReferenceCard
								key={fileReference._id.toString()}
								info={fileReference}
								handleClick={() => setEditFileReferenceModal({ id: fileReference._id.toString(), isOpen: true })}
							/>
						))
					) : (
						<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70">
							Nenhum arquivo anexado a essa oportunidade...
						</p>
					)
				) : null}
			</div>
			{newFileReferenceModalIsOpen ? (
				<NewFileReference session={session} closeModal={() => setNewFileReferenceModalIsOpen(false)} opportunityId={opportunityId} clientId={clientId} />
			) : null}
			{editFileReferenceModal.isOpen && editFileReferenceModal.id ? (
				<ControlFileReference
					fileReferenceId={editFileReferenceModal.id}
					session={session}
					vinculations={{
						opportunityId: { value: opportunityId, blocked: true },
						clientId: { value: clientId, blocked: false },
					}}
					affectedQueryKey={["file-references-by-opportunity", opportunityId]}
					closeModal={() => setEditFileReferenceModal({ id: null, isOpen: false })}
				/>
			) : null}
		</div>
	);
}

export default OpportunityFiles;
