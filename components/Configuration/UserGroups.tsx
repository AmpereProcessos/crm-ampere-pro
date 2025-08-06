import React, { useState } from "react";
import NewUserGroup from "../Modals/UserGroups/NewUserGroup";
import type { TUserSession } from "@/lib/auth/session";
import { useUserGroups } from "@/utils/queries/user-groups";
import LoadingComponent from "../utils/LoadingComponent";
import ErrorComponent from "../utils/ErrorComponent";
import UserGroup from "../Cards/UserGroup";
import EditUserGroup from "../Modals/UserGroups/EditUserGroup";

type UserGroupsProps = {
	session: TUserSession;
};
function UserGroups({ session }: UserGroupsProps) {
	const [newUserGroupModalIsOpen, setNewUserGroupModalIsOpen] = useState<boolean>(false);
	const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
	const { data: groups, isLoading, isSuccess, isError } = useUserGroups();
	return (
		<div className="flex h-full grow flex-col">
			<div className="flex w-full flex-col items-center justify-between border-b border-gray-300 pb-2 lg:flex-row">
				<div className="flex flex-col">
					<h1 className={`text-lg font-bold`}>Controle de grupos de usuário</h1>
					<p className="text-sm text-[#71717A]">Gerencie, adicione e edite os grupos de usuários.</p>
				</div>
				<button
					onClick={() => setNewUserGroupModalIsOpen(true)}
					className="h-9 whitespace-nowrap rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
				>
					NOVO GRUPO
				</button>
			</div>
			<div className="flex w-full flex-col gap-2 py-2">
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Oops, houve um erro ao buscar grupos de usuários." /> : null}
				{isSuccess ? groups.map((group) => <UserGroup key={group._id} group={group} openModal={(id) => setEditModal({ id: id, isOpen: true })} />) : null}
			</div>
			{newUserGroupModalIsOpen ? <NewUserGroup session={session} closeModal={() => setNewUserGroupModalIsOpen(false)} /> : null}
			{editModal.id && editModal.isOpen ? <EditUserGroup session={session} id={editModal.id} closeModal={() => setEditModal({ id: null, isOpen: false })} /> : null}
		</div>
	);
}

export default UserGroups;
