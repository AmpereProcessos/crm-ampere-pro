import NumberInput from "@/components/Inputs/NumberInput";
import SelectWithImages from "@/components/Inputs/SelectWithImages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import { formatNameAsInitials } from "@/lib/methods/formatting";
import { useOpportunityCreators } from "@/utils/queries/users";
import type { TGoal } from "@/utils/schemas/goal.schema";
import { type TGoalStore, useGoalStore } from "@/utils/stores/goal-store";
import {
	BadgeDollarSign,
	Check,
	Goal,
	Percent,
	Plus,
	Send,
	UsersRound,
	Zap,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

function GoalUsersBlock() {
	const [newUserModalIsOpen, setNewUserModalIsOpen] = useState(false);
	const [editUserModalId, setEditUserModalId] = useState<string | null>(null);
	const users = useGoalStore((s) => s.goal.usuarios);
	const addUser = useGoalStore((s) => s.addUser);
	const updateUser = useGoalStore((s) => s.updateUser);
	const removeUser = useGoalStore((s) => s.removeUser);
	function handleAddUser(info: TGoal["usuarios"][number]) {
		const hasExistingUser = users.find((user) => user.id === info.id);
		if (hasExistingUser) return toast.error("Meta de usuário já definida.");
		return addUser(info);
	}

	const editingUser = users.find((user) => user.id === editUserModalId);
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex w-fit items-center gap-2 rounded-sm bg-primary/20 px-2 py-1">
				<UsersRound size={15} />
				<h1 className="w-fit text-start font-medium text-xs tracking-tight">
					USUÁRIOS
				</h1>
			</div>
			<div className="flex w-full items-center justify-end">
				<Button
					className="text-xs"
					onClick={() => setNewUserModalIsOpen(true)}
					size={"fit"}
					variant={"ghost"}
				>
					ADICIONAR META DE USUÁRIO
				</Button>
			</div>
			<div className="flex w-full flex-col items-center gap-2">
				{users.map((user) => (
					<UserCard
						handleEditClick={() => setEditUserModalId(user.id)}
						handleRemoveClick={() =>
							removeUser(users.findIndex((u) => u.id === user.id))
						}
						index={users.findIndex((u) => u.id === user.id)}
						key={user.id}
						user={user}
					/>
				))}
			</div>
			{newUserModalIsOpen ? (
				<NewUserMenu
					addUser={handleAddUser}
					closeMenu={() => setNewUserModalIsOpen(false)}
				/>
			) : null}
			{editUserModalId && editingUser ? (
				<EditUserMenu
					closeMenu={() => setEditUserModalId(null)}
					initialUser={editingUser}
					updateUser={(change) =>
						updateUser({
							index: users.findIndex((user) => user.id === editUserModalId),
							change,
						})
					}
				/>
			) : null}
		</div>
	);
}

export default GoalUsersBlock;

type NewUserMenuProps = {
	closeMenu: () => void;
	addUser: TGoalStore["addUser"];
};
function NewUserMenu({ closeMenu, addUser }: NewUserMenuProps) {
	const { data: opportunityCreators } = useOpportunityCreators();
	const [userHolder, setUserHolder] = useState<TGoal["usuarios"][number]>({
		id: "",
		nome: "",
		avatar_url: null,
		objetivo: {
			oportunidadesCriadas: 0,
			oportunidadesEnviadas: 0,
			oportunidadesEnviadasConversao: 0,
			oportunidadesEnviadasGanhas: 0,
			oportunidadesEnviadasGanhasConversao: 0,
			oportunidadesGanhas: 0,
			oportunidadesGanhasConversao: 0,
			valorVendido: 0,
			potenciaVendida: 0,
		},
	});

	function handleAddUser(info: TGoal["usuarios"][number]) {
		if (!info.id) return toast.error("Usuário não selecionado.");
		return addUser(info);
	}
	return (
		<ResponsiveDialogDrawer
			actionFunction={() => handleAddUser(userHolder)}
			actionIsLoading={false}
			closeMenu={closeMenu}
			menuActionButtonText="CRIAR META DE USUÁRIO"
			menuCancelButtonText="CANCELAR"
			menuDescription="Preencha os campos abaixo para criar uma nova meta de usuário."
			menuTitle="NOVA META DE USUÁRIO"
		>
			<SelectWithImages
				handleChange={(value) => {
					const selectedUser = opportunityCreators?.find(
						(user) => user._id === value,
					);
					if (selectedUser) {
						return setUserHolder((prev) => ({
							...prev,
							id: selectedUser._id,
							nome: selectedUser.nome,
							avatar_url: selectedUser.avatar_url,
						}));
					}
					return;
				}}
				label="USUÁRIO"
				onReset={() => setUserHolder((prev) => ({ ...prev, id: "" }))}
				options={
					opportunityCreators?.map((user) => ({
						id: user._id,
						value: user._id,
						label: user.nome,
						url: user.avatar_url || undefined,
					})) || []
				}
				resetOptionLabel="SELECIONE UM USUÁRIO"
				value={userHolder.id}
				width="100%"
			/>
			<div className="flex w-full flex-col gap-2">
				<div className="flex w-fit items-center gap-2 rounded-sm bg-primary/20 px-2 py-1">
					<Goal size={15} />
					<h1 className="w-fit text-start font-medium text-xs tracking-tight">
						OBJETIVO
					</h1>
				</div>
				<div className="flex w-full flex-col gap-2">
					<NumberInput
						handleChange={(value) =>
							setUserHolder((prev) => ({
								...prev,
								objetivo: { ...prev.objetivo, oportunidadesCriadas: value },
							}))
						}
						label="OPORTUNIDADES CRIADAS"
						labelIcon={Plus}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de oportunidades criadas..."
						value={userHolder.objetivo.oportunidadesCriadas}
						width="100%"
					/>
					<NumberInput
						handleChange={(value) =>
							setUserHolder((prev) => ({
								...prev,
								objetivo: { ...prev.objetivo, oportunidadesEnviadas: value },
							}))
						}
						label="OPORTUNIDADES ENVIADAS"
						labelIcon={Send}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de oportunidades enviadas..."
						value={userHolder.objetivo.oportunidadesEnviadas}
						width="100%"
					/>
					<NumberInput
						handleChange={(value) =>
							setUserHolder((prev) => ({
								...prev,
								objetivo: { ...prev.objetivo, oportunidadesGanhas: value },
							}))
						}
						label="OPORTUNIDADES GANHAS"
						labelIcon={Check}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de oportunidades ganhas..."
						value={userHolder.objetivo.oportunidadesGanhas}
						width="100%"
					/>
					<NumberInput
						handleChange={(value) =>
							setUserHolder((prev) => ({
								...prev,
								objetivo: { ...prev.objetivo, valorVendido: value },
							}))
						}
						label="VALOR VENDIDO (R$)"
						labelIcon={BadgeDollarSign}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de valor vendido..."
						value={userHolder.objetivo.valorVendido}
						width="100%"
					/>
					<NumberInput
						handleChange={(value) =>
							setUserHolder((prev) => ({
								...prev,
								objetivo: { ...prev.objetivo, potenciaVendida: value },
							}))
						}
						label="POTÊNCIA VENDIDA (kWp)"
						labelIcon={Zap}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de potência vendida..."
						value={userHolder.objetivo.potenciaVendida}
						width="100%"
					/>

					<NumberInput
						handleChange={(value) =>
							setUserHolder((prev) => ({
								...prev,
								objetivo: {
									...prev.objetivo,
									oportunidadesEnviadasConversao: value,
								},
							}))
						}
						label="CONVERSÃO EM ENVIO (%)"
						labelIcon={Percent}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de conversão em envio..."
						value={userHolder.objetivo.oportunidadesEnviadasConversao}
						width="100%"
					/>
					<NumberInput
						handleChange={(value) =>
							setUserHolder((prev) => ({
								...prev,
								objetivo: {
									...prev.objetivo,
									oportunidadesGanhasConversao: value,
								},
							}))
						}
						label="CONVERSÃO EM GANHO (%)"
						labelIcon={Percent}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de conversão em ganho..."
						value={userHolder.objetivo.oportunidadesGanhasConversao}
						width="100%"
					/>
				</div>
			</div>
		</ResponsiveDialogDrawer>
	);
}

type EditUserMenuProps = {
	closeMenu: () => void;
	initialUser: TGoalStore["goal"]["usuarios"][number];
	updateUser: (change: Partial<TGoalStore["goal"]["usuarios"][number]>) => void;
};
function EditUserMenu({
	closeMenu,
	initialUser,
	updateUser,
}: EditUserMenuProps) {
	const { data: opportunityCreators } = useOpportunityCreators();
	const [userHolder, setUserHolder] =
		useState<TGoal["usuarios"][number]>(initialUser);

	function handleUpdateUser(info: TGoal["usuarios"][number]) {
		if (!info.id) return toast.error("Usuário não selecionado.");
		return updateUser(info);
	}
	return (
		<ResponsiveDialogDrawer
			actionFunction={() => handleUpdateUser(userHolder)}
			actionIsLoading={false}
			closeMenu={closeMenu}
			menuActionButtonText="ATUALIZAR META DE USUÁRIO"
			menuCancelButtonText="CANCELAR"
			menuDescription="Preencha os campos abaixo para atualizar a meta de usuário."
			menuTitle="ATUALIZAR META DE USUÁRIO"
		>
			<SelectWithImages
				editable={false}
				handleChange={(value) => {
					const selectedUser = opportunityCreators?.find(
						(user) => user._id === value,
					);
					if (selectedUser) {
						return setUserHolder((prev) => ({
							...prev,
							id: selectedUser._id,
							nome: selectedUser.nome,
							avatar_url: selectedUser.avatar_url,
						}));
					}
					return;
				}}
				label="USUÁRIO"
				onReset={() => setUserHolder((prev) => ({ ...prev, id: "" }))}
				options={
					opportunityCreators?.map((user) => ({
						id: user._id,
						value: user._id,
						label: user.nome,
						url: user.avatar_url || undefined,
					})) || []
				}
				resetOptionLabel="SELECIONE UM USUÁRIO"
				value={userHolder.id}
				width="100%"
			/>
			<div className="flex w-full flex-col gap-2">
				<div className="flex w-fit items-center gap-2 rounded-sm bg-primary/20 px-2 py-1">
					<Goal size={15} />
					<h1 className="w-fit text-start font-medium text-xs tracking-tight">
						OBJETIVO
					</h1>
				</div>
				<div className="flex w-full flex-col gap-2">
					<NumberInput
						handleChange={(value) =>
							setUserHolder((prev) => ({
								...prev,
								objetivo: { ...prev.objetivo, oportunidadesCriadas: value },
							}))
						}
						label="OPORTUNIDADES CRIADAS"
						labelIcon={Plus}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de oportunidades criadas..."
						value={userHolder.objetivo.oportunidadesCriadas}
						width="100%"
					/>
					<NumberInput
						handleChange={(value) =>
							setUserHolder((prev) => ({
								...prev,
								objetivo: { ...prev.objetivo, oportunidadesEnviadas: value },
							}))
						}
						label="OPORTUNIDADES ENVIADAS"
						labelIcon={Send}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de oportunidades enviadas..."
						value={userHolder.objetivo.oportunidadesEnviadas}
						width="100%"
					/>
					<NumberInput
						handleChange={(value) =>
							setUserHolder((prev) => ({
								...prev,
								objetivo: { ...prev.objetivo, oportunidadesGanhas: value },
							}))
						}
						label="OPORTUNIDADES GANHAS"
						labelIcon={Check}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de oportunidades ganhas..."
						value={userHolder.objetivo.oportunidadesGanhas}
						width="100%"
					/>
					<NumberInput
						handleChange={(value) =>
							setUserHolder((prev) => ({
								...prev,
								objetivo: { ...prev.objetivo, valorVendido: value },
							}))
						}
						label="VALOR VENDIDO (R$)"
						labelIcon={BadgeDollarSign}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de valor vendido..."
						value={userHolder.objetivo.valorVendido}
						width="100%"
					/>
					<NumberInput
						handleChange={(value) =>
							setUserHolder((prev) => ({
								...prev,
								objetivo: { ...prev.objetivo, potenciaVendida: value },
							}))
						}
						label="POTÊNCIA VENDIDA (kWp)"
						labelIcon={Zap}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de potência vendida..."
						value={userHolder.objetivo.potenciaVendida}
						width="100%"
					/>

					<NumberInput
						handleChange={(value) =>
							setUserHolder((prev) => ({
								...prev,
								objetivo: {
									...prev.objetivo,
									oportunidadesEnviadasConversao: value,
								},
							}))
						}
						label="CONVERSÃO EM ENVIO (%)"
						labelIcon={Percent}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de conversão em envio..."
						value={userHolder.objetivo.oportunidadesEnviadasConversao}
						width="100%"
					/>
					<NumberInput
						handleChange={(value) =>
							setUserHolder((prev) => ({
								...prev,
								objetivo: {
									...prev.objetivo,
									oportunidadesGanhasConversao: value,
								},
							}))
						}
						label="CONVERSÃO EM GANHO (%)"
						labelIcon={Percent}
						labelIconClassName="w-3.5 h-3.5"
						placeholder="Preencha aqui a meta de conversão em ganho..."
						value={userHolder.objetivo.oportunidadesGanhasConversao}
						width="100%"
					/>
				</div>
			</div>
		</ResponsiveDialogDrawer>
	);
}

type UserCardProps = {
	user: TGoalStore["goal"]["usuarios"][number];
	index: number;
	handleEditClick: () => void;
	handleRemoveClick: () => void;
};
function UserCard({
	user,
	index,
	handleEditClick,
	handleRemoveClick,
}: UserCardProps) {
	function GoalValueCard({
		label,
		value,
		icon,
	}: { label: string; value: number; icon: React.ReactNode }) {
		return (
			<div className="flex items-center gap-2 rounded-lg bg-primary/10 px-2 py-0.5">
				<div className="flex items-center gap-1">
					{icon}
					<h1 className="text-[0.65rem]">{label}</h1>
				</div>
				<h1 className="font-medium text-xs">{value}</h1>
			</div>
		);
	}
	return (
		<div className="flex w-full flex-col gap-2 rounded-md border border-primary/20 bg-card p-2">
			<div className="flex w-full items-center justify-between gap-2">
				<div className="flex items-center gap-1">
					<Avatar className="h-6 min-h-6 w-6 min-w-6">
						<AvatarImage src={user.avatar_url ?? undefined} />
						<AvatarFallback>{formatNameAsInitials(user.nome)}</AvatarFallback>
					</Avatar>
					<h1 className="font-medium text-sm">{user.nome}</h1>
				</div>
				<div className="flex items-center gap-2">
					<Button
						className="px-2 py-1 text-xs"
						onClick={handleEditClick}
						size={"fit"}
						variant={"ghost"}
					>
						EDITAR
					</Button>
					<Button
						className="px-2 py-1 text-red-500 text-xs hover:text-red-600"
						onClick={handleRemoveClick}
						size={"fit"}
						variant={"ghost"}
					>
						REMOVER
					</Button>
				</div>
			</div>
			<div className="flex w-full flex-col gap-2">
				<h1 className="w-fit text-start text-xs tracking-tight">OBJETIVOS</h1>
				<div className="flex flex-wrap items-center justify-around gap-x-3 gap-y-1">
					<GoalValueCard
						icon={<Plus className="h-3.5 w-3.5" />}
						label="OPORTUNIDADES CRIADAS"
						value={user.objetivo.oportunidadesCriadas}
					/>
					<GoalValueCard
						icon={<Send className="h-3.5 w-3.5" />}
						label="OPORTUNIDADES ENVIADAS"
						value={user.objetivo.oportunidadesEnviadas}
					/>
					<GoalValueCard
						icon={<Check className="h-3.5 w-3.5" />}
						label="OPORTUNIDADES GANHAS"
						value={user.objetivo.oportunidadesGanhas}
					/>
					<GoalValueCard
						icon={<BadgeDollarSign className="h-3.5 w-3.5" />}
						label="VALOR VENDIDO (R$)"
						value={user.objetivo.valorVendido}
					/>
					<GoalValueCard
						icon={<Zap className="h-3.5 w-3.5" />}
						label="POTÊNCIA VENDIDA (kWp)"
						value={user.objetivo.potenciaVendida}
					/>
					<GoalValueCard
						icon={<Percent className="h-3.5 w-3.5" />}
						label="CONVERSÃO EM ENVIO (%)"
						value={user.objetivo.oportunidadesEnviadasConversao}
					/>
					<GoalValueCard
						icon={<Percent className="h-3.5 w-3.5" />}
						label="CONVERSÃO EM GANHO (%)"
						value={user.objetivo.oportunidadesGanhasConversao}
					/>
				</div>
			</div>
		</div>
	);
}
