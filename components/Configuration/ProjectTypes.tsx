import { useProjectTypes } from "@/utils/queries/project-types";
import type { TUserSession } from "@/lib/auth/session";
import React, { useState } from "react";
import LoadingComponent from "../utils/LoadingComponent";
import ErrorComponent from "../utils/ErrorComponent";
import NewProjectType from "../Modals/ProjectTypes/NewProjectType";
import { MdDashboard } from "react-icons/md";
import { BsCalendarPlus } from "react-icons/bs";
import Avatar from "../utils/Avatar";
import { formatDateAsLocale } from "@/lib/methods/formatting";
import EditProjectType from "../Modals/ProjectTypes/EditProjectType";

const FixedProjectTypes = ["6615785ddcb7a6e66ede9785"];

type ProjectTypesProps = {
	session: TUserSession;
};
function ProjectTypes({ session }: ProjectTypesProps) {
	const userHasProjectTypeEditingPermission = session.user.permissoes.configuracoes.tiposProjeto;
	const [newProjectTypeModalIsOpen, setNewProjectTypeModalIsOpen] = useState<boolean>(false);
	const { data: types, isSuccess, isLoading, isError } = useProjectTypes();
	const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
	return (
		<div className="flex h-full grow flex-col">
			<div className="flex w-full flex-col items-center justify-between border-b border-gray-300 pb-2 lg:flex-row">
				<div className="flex flex-col">
					<h1 className={`text-lg font-bold`}>Controle de tipos de projeto</h1>
					<p className="text-sm text-[#71717A]">Gerencie, adicione e edite os tipos de projeto</p>
				</div>
				<button
					onClick={() => setNewProjectTypeModalIsOpen(true)}
					className="h-9 whitespace-nowrap rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
				>
					NOVO TIPO DE PROJETO
				</button>
			</div>
			<div className="flex w-full flex-col gap-2 py-2">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Erro ao buscar tipos de projeto." /> : null}
				{isSuccess ? (
					types.length > 0 ? (
						types.map((type) => (
							<div key={type._id.toString()} className="flex w-full flex-col rounded-md border border-gray-300 p-2">
								<div className="flex w-full items-center justify-between gap-2">
									<div className="flex grow items-center gap-1">
										<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
											<MdDashboard size={13} />
										</div>
										{userHasProjectTypeEditingPermission ? (
											<p
												onClick={() => setEditModal({ id: type._id, isOpen: true })}
												className="cursor-pointer text-sm font-medium leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500"
											>
												{type.nome}
											</p>
										) : (
											<p className="text-sm font-medium leading-none tracking-tight">{type.nome}</p>
										)}
									</div>
									{FixedProjectTypes.includes(type._id) ? <h1 className="rounded-full bg-black px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">FIXO</h1> : null}
								</div>

								<h1 className='"w-full mt-2 text-start text-xs font-medium'>SEÇÕES DE DIMENSIONAMENTO</h1>
								<div className="flex w-full items-center justify-start gap-2">
									{type.dimensionamento.map((item, itemIndex) => (
										<div key={itemIndex} className="rounded-lg border border-gray-300 bg-gray-50 px-2 py-1 text-[0.57rem] font-medium">
											{item.titulo}
										</div>
									))}
								</div>
								<div className="mt-2 flex w-full items-center justify-end gap-2">
									<div className={`flex items-center gap-2`}>
										<div className="ites-center flex gap-1">
											<BsCalendarPlus />
											<p className={`text-xs font-medium text-gray-500`}>{formatDateAsLocale(type.dataInsercao, true)}</p>
										</div>
									</div>
									<div className="flex items-center justify-center gap-1">
										<Avatar fallback={"U"} height={20} width={20} url={type.autor?.avatar_url || undefined} />
										<p className="text-xs font-medium text-gray-500">{type.autor?.nome}</p>
									</div>
								</div>
							</div>
						))
					) : (
						<p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-gray-500">Nenhum tipo de projeto encontrado.</p>
					)
				) : null}
			</div>
			{newProjectTypeModalIsOpen ? <NewProjectType session={session} closeModal={() => setNewProjectTypeModalIsOpen(false)} /> : null}
			{editModal.id && editModal.isOpen ? <EditProjectType session={session} projectTypeId={editModal.id} closeModal={() => setEditModal({ id: null, isOpen: false })} /> : null}
		</div>
	);
}

export default ProjectTypes;
