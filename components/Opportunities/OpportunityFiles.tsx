import React, { useState } from "react";
import { MdAdd } from "react-icons/md";
import NewFileReference from "../Modals/FileReference/NewFileReference";
import type { TUserSession } from "@/lib/auth/session";
import { useFileReferencesByOpportunityId } from "@/utils/queries/file-references";
import LoadingComponent from "../utils/LoadingComponent";
import ErrorComponent from "../utils/ErrorComponent";
import FileReferenceCard from "../FileReference/FileReferenceCard";
import { TOpportunityBlockMode } from "./OpportunityPage";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import ControlFileReference from "../Modals/FileReference/ControlFileReference";
type OpportunityFilesProps = {
	session: TUserSession;
	opportunityId: string;
	clientId: string;
};
function OpportunityFiles({ session, opportunityId, clientId }: OpportunityFilesProps) {
	const [blockIsOpen, setBlockIsOpen] = useState<boolean>(false);

	const [newFileReferenceModalIsOpen, setNewFileReferenceModalIsOpen] = useState<boolean>(false);
	const [editFileReferenceModal, setEditFileReferenceModal] = useState({
		id: null as string | null,
		isOpen: false as boolean,
	});
	const { data: fileReferences, isSuccess, isLoading, isError } = useFileReferencesByOpportunityId({ opportunityId });

	return (
		<div className="flex max-h-[250px] w-full flex-col rounded-md border border-gray-200 bg-[#fff] p-3 shadow-lg">
			<div className="flex  h-[40px] items-center  justify-between border-b border-gray-200 pb-2">
				<div className="flex items-center justify-center gap-5">
					<h1 className="p-1 text-center font-bold text-black">Arquivos</h1>
				</div>
				<div className="flex items-center gap-2">
					<button type="button" onClick={() => setNewFileReferenceModalIsOpen(true)} className="flex rounded bg-green-600 p-1 text-sm font-bold text-white lg:hidden">
						<MdAdd />
					</button>
					<button type="button" onClick={() => setNewFileReferenceModalIsOpen(true)} className="hidden rounded bg-green-600 p-1 text-[0.7rem] font-bold text-white lg:flex">
						ANEXAR ARQUIVO
					</button>
					{blockIsOpen ? (
						<button type="button" className="text-gray-600 hover:text-blue-400">
							<IoMdArrowDropupCircle style={{ fontSize: "25px" }} onClick={() => setBlockIsOpen(false)} />
						</button>
					) : (
						<button type="button" className="text-gray-600 hover:text-blue-400">
							<IoMdArrowDropdownCircle style={{ fontSize: "25px" }} onClick={() => setBlockIsOpen(true)} />
						</button>
					)}
				</div>
			</div>
			{blockIsOpen ? (
				<div className="overscroll-y flex w-full grow flex-col gap-1 overflow-y-auto py-1 pr-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Erro ao carregar arquivos anexados da oportunidade." /> : null}
					{isSuccess ? (
						fileReferences.length > 0 ? (
							fileReferences.map((fileReference) => (
								<FileReferenceCard key={fileReference._id} info={fileReference} handleClick={() => setEditFileReferenceModal({ id: fileReference._id, isOpen: true })} />
							))
						) : (
							<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-gray-500">
								Nenhum arquivo anexado a essa oportunidade...
							</p>
						)
					) : null}
				</div>
			) : null}
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
