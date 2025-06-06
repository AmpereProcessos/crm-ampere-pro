import React, { useState } from "react";

import NewUserModal from "@/components/Modals/User/NewUser";
import CardUserControl from "@/components/Cards/User";
import { Sidebar } from "@/components/Sidebar";

import { useUsers } from "@/utils/queries/users";

import EditUser from "@/components/Modals/User/EditUser";
import LoadingPage from "@/components/utils/LoadingPage";
import NotAuthorizedPage from "@/components/utils/NotAuthorizedPage";
import LoadingComponent from "@/components/utils/LoadingComponent";
import ErrorComponent from "@/components/utils/ErrorComponent";
import type { TUserSession } from "@/lib/auth/session";

type UsersProps = {
	session: TUserSession;
};
function Users({ session }: UsersProps) {
	const { data: users, isSuccess, isLoading, isError } = useUsers();

	const [newUserModalIsOpen, setUserModalIsOpen] = useState(false);
	const [editUserModal, setEditUserModal] = useState<{ isOpen: boolean; userId: string | null }>({
		isOpen: false,
		userId: null,
	});

	function handleOpenModal(id: string) {
		setEditUserModal({ isOpen: true, userId: id });
	}
	// Unauthorized
	if (!session?.user.permissoes.usuarios.visualizar) return <NotAuthorizedPage session={session} />;

	return (
		<div className="flex h-full flex-col md:flex-row">
			<Sidebar session={session} />
			<div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa]">
				<div className="flex h-[80px] w-full items-center justify-center bg-gray-800 p-2">
					<h1 className="text-center font-bold text-white">CONTROLE DE USUÁRIOS</h1>
				</div>
				<div className="flex items-center justify-center" />
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Erro ao buscar usuários" /> : null}
				{isSuccess && (
					<div className="flex w-full flex-wrap justify-around gap-2 p-2">
						{users.map((user, index: number) => (
							<CardUserControl key={user._id?.toString()} userInfo={user} admin={user.permissoes.usuarios.editar} openModal={handleOpenModal} />
						))}
					</div>
				)}
				<button
					type="button"
					onClick={() => setUserModalIsOpen(true)}
					className="fixed bottom-10 left-[100px] cursor-pointer rounded-lg bg-[#15599a] p-3 text-white hover:bg-[#fead61] hover:text-[#15599a]"
				>
					<p className="font-bold">NOVO USUÁRIO</p>
				</button>
			</div>
			{newUserModalIsOpen ? <NewUserModal closeModal={() => setUserModalIsOpen(false)} users={users} userId={session.user.id} partnerId={session.user.idParceiro} /> : null}
			{editUserModal.isOpen && editUserModal.userId ? (
				<EditUser userId={editUserModal.userId} closeModal={() => setEditUserModal({ isOpen: false, userId: null })} partnerId={session.user.idParceiro} users={users} />
			) : null}
		</div>
	);
}

export default Users;
