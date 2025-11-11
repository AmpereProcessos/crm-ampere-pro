import { BsCalendarPlus } from "react-icons/bs";
import { FaRegUserCircle } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";
import type { TUserGroupDTOWithUsers } from "@/utils/schemas/user-groups.schema";
import Avatar from "../utils/Avatar";

type UserGroupProps = {
	group: TUserGroupDTOWithUsers;
	openModal: (id: string) => void;
};
function UserGroup({ group, openModal }: UserGroupProps) {
	return (
		<div className="flex w-full flex-col rounded-md border border-primary/30 p-2">
			<div className="flex grow items-center gap-1">
				<div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
					<FaUserGroup />
				</div>
				<button
					onClick={() => openModal(group._id)}
					type="button"
					className="cursor-pointer text-sm font-medium leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500"
				>
					{group.titulo}
				</button>
			</div>
			<div className="my-2 text-start text-xs tracking-tight text-primary/70">{group.descricao || "NENHUMA DESCRIÇÃO DEFINIDA."}</div>
			{group.usuarios ? (
				<>
					<div className="mt-2 flex w-full items-center justify-start gap-2">
						<div className="flex items-center gap-1 text-blue-500">
							<FaRegUserCircle />
							<h1 className="font-Inter text-xs font-bold">{group.usuarios.length}</h1>
						</div>
						<h1 className="font-Inter text-xs text-primary/70">USUÁRIOS</h1>
					</div>
					<div className="mt-2 flex w-full flex-wrap items-start justify-start gap-2">
						{group.usuarios.map((user, index) => {
							if (index < 10)
								return (
									<div key={user._id} className="flex items-center gap-1">
										<Avatar url={user.avatar_url || undefined} fallback={formatNameAsInitials(user.nome)} height={15} width={15} />
										<p className="font-Inter text-xs font-medium text-primary/70">{user.nome}</p>
									</div>
								);
							return null;
						})}
						{group.usuarios.length > 10 ? <p className="font-Inter text-xs font-medium text-primary/70">E MAIS...</p> : null}
					</div>
				</>
			) : null}
			<div className="flex w-full items-center justify-end gap-2">
				<div className={`flex items-center gap-1`}>
					<BsCalendarPlus />
					<p className="text-[0.65rem] font-medium text-primary/70">{formatDateAsLocale(group.dataInsercao, true)}</p>
				</div>
				<div className="flex items-center gap-1">
					<Avatar fallback={formatNameAsInitials(group.autor.nome)} url={group.autor.avatar_url || undefined} height={20} width={20} />
					<p className="text-[0.65rem] font-medium text-primary/70">{group.autor.nome}</p>
				</div>
			</div>
		</div>
	);
}

export default UserGroup;
