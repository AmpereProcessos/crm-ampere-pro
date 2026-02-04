import { ListFilter, Mail, Pencil, Phone, Plus } from "lucide-react";
import { useState } from "react";
import { BsCalendarMinus, BsCalendarPlus } from "react-icons/bs";
import type { TUserSession } from "@/lib/auth/session";
import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";
import type { TUsersWithFiltersResponse } from "@/pages/api/users/personalized";
import { useUsersWithFilters } from "@/utils/queries/users";
import EditUser from "../Modals/User/EditUser";
import NewUserModal from "../Modals/User/NewUser";
import ConfigUsersFilterMenu from "../Users/ConfigUsersFilterMenu";
import { Button } from "../ui/button";
import Avatar from "../utils/Avatar";
import ErrorComponent from "../utils/ErrorComponent";
import GeneralQueryPaginationMenu from "../utils/GeneralQueryPaginationMenu";
import LoadingComponent from "../utils/LoadingComponent";

type UsersProps = {
	session: TUserSession;
};
function Users({ session }: UsersProps) {
	const { data: usersResult, isSuccess, isLoading, isError, queryParams, updateQueryParams } = useUsersWithFilters({ filters: {} });
	const [filterMenuIsOpen, setFilterMenuIsOpen] = useState(false);
	const [newUserModalIsOpen, setUserModalIsOpen] = useState(false);
	const [editUserModal, setEditUserModal] = useState<{ isOpen: boolean; userId: string | null }>({
		isOpen: false,
		userId: null,
	});
	function handleOpenModal(id: string) {
		setEditUserModal({ isOpen: true, userId: id });
	}
	const users = usersResult?.users;
	const usersShowing = users?.length;
	const usersMatched = usersResult?.usersMatched || 0;
	const totalPages = usersResult?.totalPages || 0;
	return (
		<div className="flex h-full grow flex-col">
			<div className="flex w-full flex-col items-center justify-between border-b border-primary/30 pb-2 lg:flex-row">
				<div className="flex flex-col">
					<h1 className="text-lg font-bold">Controle de usuários</h1>
					<p className="text-sm text-[#71717A]">Gerencie, adicione e edite os usuários</p>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={() => setFilterMenuIsOpen((prev) => !prev)} size={"xs"} variant={"ghost"} className="flex items-center gap-1">
						<ListFilter className="w-4 h-4 min-w-4 min-h-4" />
						FILTRAR
					</Button>
					<Button onClick={() => setUserModalIsOpen(true)} size={"xs"} className="flex items-center gap-1">
						<Plus className="w-4 h-4 min-w-4 min-h-4" />
						NOVO USUÁRIO
					</Button>
				</div>
			</div>
			<div className="flex w-full flex-col gap-2 py-2">
				<GeneralQueryPaginationMenu
					activePage={queryParams.page}
					selectPage={(page) => updateQueryParams({ page })}
					totalPages={totalPages}
					queryLoading={isLoading}
					itemsMatched={usersMatched}
					itemsShowing={usersShowing}
				/>
				{isLoading ? <LoadingComponent /> : null}
				{isError ? <ErrorComponent msg="Erro ao buscar usuários" /> : null}
				{isSuccess && users && users.map((user, index: number) => <UserCard key={user._id?.toString()} user={user} handleClick={handleOpenModal} />)}
			</div>
			{newUserModalIsOpen ? (
				<NewUserModal closeModal={() => setUserModalIsOpen(false)} userId={session.user.id} partnerId={session.user.idParceiro} session={session} />
			) : null}
			{editUserModal.isOpen && editUserModal.userId ? (
				<EditUser
					userId={editUserModal.userId}
					closeModal={() => setEditUserModal({ isOpen: false, userId: null })}
					partnerId={session.user.idParceiro}
					session={session}
				/>
			) : null}
			{filterMenuIsOpen ? (
				<ConfigUsersFilterMenu queryParams={queryParams} updateQueryParams={updateQueryParams} closeMenu={() => setFilterMenuIsOpen(false)} />
			) : null}
		</div>
	);
}

export default Users;

type UserCardProps = {
	user: TUsersWithFiltersResponse["users"][number];
	handleClick: (id: string) => void;
};
function UserCard({ user, handleClick }: UserCardProps) {
	return (
		<div className="flex min-h-[100px] w-full flex-col items-center gap-2 rounded-md border border-primary/30 p-2 lg:flex-row">
			<div className="w-fit h-full flex items-center justify-center">
				<Avatar width={50} height={50} fallback={formatNameAsInitials(user.nome)} url={user.avatar_url || undefined} />
			</div>
			<div className="w-full h-full flex flex-col items-center gap-1">
				<h1 className="font-black leading-none tracking-tight w-full text-center lg:text-start">{user.nome}</h1>
				<div className="grow w-full flex items-center gap-2 flex-wrap justify-center lg:justify-start">
					<div className="flex items-center gap-1">
						<Mail className="w-4 h-4 min-w-4 min-h-4" />
						<p className="text-xs lg:text-sm text-primary/80 font-medium break-all">{user.email}</p>
					</div>
					<div className="flex items-center gap-1">
						<Phone className="w-4 h-4 min-w-4 min-h-4" />
						<p className="text-xs lg:text-sm text-primary/80 font-medium break-all">{user.telefone || "TELEFONE NÃO DEFINIDO"}</p>
					</div>
				</div>
				<div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-1">
							<BsCalendarPlus className="w-4 h-4 min-w-4 min-h-4" />
							<p className="text-xs lg:text-sm text-primary/80 font-medium">{formatDateAsLocale(user.dataInsercao, true)}</p>
						</div>
						{user.dataExclusao ? (
							<div className="flex items-center gap-1">
								<BsCalendarMinus className="w-4 h-4 min-w-4 min-h-4" color="#ef4444" />
								<p className="text-xs lg:text-sm text-primary/80 font-medium">Excluído em: {formatDateAsLocale(user.dataExclusao)}</p>
							</div>
						) : null}
					</div>
					<button
						onClick={() => handleClick(user._id)}
						type="button"
						className="px-2 py-1 rounded-lg flex items-center bg-primary text-primary-foreground hover:bg-primary/80 transition-colors gap-2"
					>
						<Pencil className="w-4 h-4 min-w-4 min-h-4" />
						<p className="text-xs font-medium">EDITAR</p>
					</button>
				</div>
			</div>
		</div>
	);
}
