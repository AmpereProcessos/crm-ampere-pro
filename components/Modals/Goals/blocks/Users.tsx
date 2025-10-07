import NumberInput from "@/components/Inputs/NumberInput";
import SelectWithImages from "@/components/Inputs/SelectWithImages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import { getErrorMessage } from "@/lib/methods/errors";
import {
	getExcelFromJSON,
	getJSONFromExcelFile,
} from "@/lib/methods/excel-utils";
import { formatNameAsInitials } from "@/lib/methods/formatting";
import { useOpportunityCreators } from "@/utils/queries/users";
import type { TGoal } from "@/utils/schemas/goal.schema";
import type { TUserDTOSimplified } from "@/utils/schemas/user.schema";
import { type TGoalStore, useGoalStore } from "@/utils/stores/goal-store";
import {
	BadgeDollarSign,
	Check,
	FileDown,
	FileUp,
	Goal,
	Percent,
	Plus,
	Send,
	UsersRound,
	Zap,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { BsCloudUploadFill } from "react-icons/bs";
import z from "zod";

const GoalUsersTemplateSchema = z.object({
	ID: z.string({
		required_error: "ID não informado.",
		invalid_type_error: "ID não válido.",
	}),
	NOME: z.string({
		required_error: "Nome não informado.",
		invalid_type_error: "Nome não válido.",
	}),
	OPORTUNIDADES_CRIADAS: z.number({
		required_error: "Oportunidades criadas não informadas.",
		invalid_type_error: "Oportunidades criadas não válidas.",
	}),
	OPORTUNIDADES_ENVIADAS: z.number({
		required_error: "Oportunidades enviadas não informadas.",
		invalid_type_error: "Oportunidades enviadas não válidas.",
	}),
	OPORTUNIDADES_GANHAS: z.number({
		required_error: "Oportunidades ganhas não informadas.",
		invalid_type_error: "Oportunidades ganhas não válidas.",
	}),
	VALOR_VENDIDO: z.number({
		required_error: "Valor vendido não informado.",
		invalid_type_error: "Valor vendido não válido.",
	}),
	POTENCIA_VENDIDA: z.number({
		required_error: "Potência vendida não informada.",
		invalid_type_error: "Potência vendida não válida.",
	}),
	CONVERSAO_EM_ENVIO: z.number({
		required_error: "Conversão em envio não informada.",
		invalid_type_error: "Conversão em envio não válida.",
	}),
	CONVERSAO_EM_GANHO: z.number({
		required_error: "Conversão em ganho não informada.",
		invalid_type_error: "Conversão em ganho não válida.",
	}),
});
type TGoalUsersTemplate = z.infer<typeof GoalUsersTemplateSchema>;
function GoalUsersBlock() {
	const { data: opportunityCreators } = useOpportunityCreators();
	const [newUserModalIsOpen, setNewUserModalIsOpen] = useState(false);
	const [editUserModalId, setEditUserModalId] = useState<string | null>(null);
	const [uploadModalIsOpen, setUploadModalIsOpen] = useState(false);
	const users = useGoalStore((s) => s.goal.usuarios);
	const addUser = useGoalStore((s) => s.addUser);
	const updateUser = useGoalStore((s) => s.updateUser);
	const removeUser = useGoalStore((s) => s.removeUser);
	const setUsers = useGoalStore((s) => s.setUsers);
	function handleAddUser(info: TGoal["usuarios"][number]) {
		const hasExistingUser = users.find((user) => user.id === info.id);
		if (hasExistingUser) return toast.error("Meta de usuário já definida.");
		return addUser(info);
	}
	async function handleDownloadBaseSheet({
		opportunityCreators,
		users,
	}: {
		opportunityCreators: TUserDTOSimplified[];
		users: TGoal["usuarios"][number][];
	}) {
		const template: TGoalUsersTemplate[] = opportunityCreators.map(
			(creator) => {
				const user = users.find((user) => user.id === creator._id);
				return {
					ID: creator._id.toString(),
					NOME: creator.nome,
					OPORTUNIDADES_CRIADAS: user?.objetivo.oportunidadesCriadas ?? 0,
					OPORTUNIDADES_ENVIADAS: user?.objetivo.oportunidadesEnviadas ?? 0,
					OPORTUNIDADES_GANHAS: user?.objetivo.oportunidadesGanhas ?? 0,
					VALOR_VENDIDO: user?.objetivo.valorVendido ?? 0,
					POTENCIA_VENDIDA: user?.objetivo.potenciaVendida ?? 0,
					CONVERSAO_EM_ENVIO:
						user?.objetivo.oportunidadesEnviadasConversao ?? 0,
					CONVERSAO_EM_GANHO: user?.objetivo.oportunidadesGanhasConversao ?? 0,
				};
			},
		);

		await getExcelFromJSON(template, "TEMPLATE_METAS_USUARIOS.xlsx");
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
			<div className="flex w-full items-center justify-end gap-3 flex-wrap">
				<Button
					className="flex items-center gap-1 text-xs"
					onClick={() =>
						handleDownloadBaseSheet({
							opportunityCreators: opportunityCreators ?? [],
							users,
						})
					}
					size={"fit"}
					variant={"ghost"}
				>
					<FileDown className="w-3.5 h-3.5" />
					BAIXAR PLANILHA DE REFERÊNCIA
				</Button>
				<Button
					className="flex items-center gap-1 text-xs"
					onClick={() => setUploadModalIsOpen(true)}
					size={"fit"}
					variant={"ghost"}
				>
					<FileUp className="w-3.5 h-3.5" />
					IMPORTAR META DE USUÁRIOS
				</Button>
				<Button
					className="flex items-center gap-1 text-xs"
					onClick={() => setNewUserModalIsOpen(true)}
					size={"fit"}
					variant={"ghost"}
				>
					<Plus className="w-3.5 h-3.5" />
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
			{uploadModalIsOpen ? (
				<FileUploadMenu
					closeMenu={() => setUploadModalIsOpen(false)}
					opportunityCreators={opportunityCreators ?? []}
					setUsers={setUsers}
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
			stateIsLoading={false}
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
			stateIsLoading={false}
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

type FileUploadMenuProps = {
	closeMenu: () => void;
	opportunityCreators: TUserDTOSimplified[];
	setUsers: TGoalStore["setUsers"];
};
function FileUploadMenu({
	closeMenu,
	opportunityCreators,
	setUsers,
}: FileUploadMenuProps) {
	const [fileHolder, setFileHolder] = useState<File | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	async function handleFileUpload(file: File | null) {
		if (!file) return toast.error("Arquivo não vinculado.");
		setIsProcessing(true);
		try {
			// Parse Excel file to JSON
			const data = await getJSONFromExcelFile(file);
			console.log(
				"[INFO] [FILE_UPLOAD_MENU] [HANDLE_FILE_UPLOAD] [DATA]",
				data,
			);
			// Validate data against schema
			const validatedData = z.array(GoalUsersTemplateSchema).parse(data);
			console.log(
				"[INFO] [FILE_UPLOAD_MENU] [HANDLE_FILE_UPLOAD] [VALIDATED_DATA]",
				validatedData,
			);
			// Transform validated data to user goals format
			const mappedUsers = validatedData
				.map(
					(
						item,
					):
						| (TGoal["usuarios"][number] & {
								avatar_url: string | null | undefined;
						  })
						| null => {
						// Find the user in opportunityCreators to get additional info
						const creator = opportunityCreators.find(
							(creator) => creator._id === item.ID,
						);
						if (!creator) {
							toast.error(`Usuário com ID ${item.ID} não encontrado.`);
							return null;
						}

						return {
							id: item.ID,
							nome: item.NOME,
							avatar_url: creator.avatar_url,
							objetivo: {
								oportunidadesCriadas: item.OPORTUNIDADES_CRIADAS,
								oportunidadesEnviadas: item.OPORTUNIDADES_ENVIADAS,
								oportunidadesEnviadasConversao: item.CONVERSAO_EM_ENVIO,
								oportunidadesEnviadasGanhas: 0,
								oportunidadesEnviadasGanhasConversao: 0,
								oportunidadesGanhas: item.OPORTUNIDADES_GANHAS,
								oportunidadesGanhasConversao: item.CONVERSAO_EM_GANHO,
								valorVendido: item.VALOR_VENDIDO,
								potenciaVendida: item.POTENCIA_VENDIDA,
							},
						};
					},
				)
				.filter(
					(
						user,
					): user is TGoal["usuarios"][number] & {
						avatar_url: string | null | undefined;
					} => user !== null,
				);

			const updatedUsers: TGoal["usuarios"] = mappedUsers.map((u) => ({
				id: u.id,
				nome: u.nome,
				avatar_url: u.avatar_url ?? null,
				objetivo: u.objetivo,
			}));

			// Update the store with new users
			setUsers(updatedUsers);
			toast.success(
				`${updatedUsers.length} meta(s) de usuário(s) importada(s) com sucesso.`,
			);
			closeMenu();
		} catch (error) {
			console.error(error);
			const msg = getErrorMessage(error);
			toast.error(msg);
		} finally {
			setIsProcessing(false);
		}
	}

	return (
		<ResponsiveDialogDrawer
			actionFunction={() => handleFileUpload(fileHolder)}
			actionIsLoading={isProcessing}
			stateIsLoading={false}
			closeMenu={closeMenu}
			menuActionButtonText="IMPORTAR METAS"
			menuCancelButtonText="CANCELAR"
			menuDescription="Faça upload de um arquivo XLSX com as metas dos usuários. O arquivo deve seguir o template disponível para download."
			menuTitle="IMPORTAR METAS DE USUÁRIOS"
		>
			<div className="relative mb-4 flex w-full items-center justify-center">
				<label
					htmlFor="dropzone-file-upload"
					className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary"
				>
					<div className="flex flex-col items-center justify-center pb-6 pt-5 text-primary">
						<BsCloudUploadFill size={50} />
						{fileHolder ? (
							<p className="mb-2 px-2 text-center text-sm">
								<span className="font-semibold">{fileHolder.name}</span>
							</p>
						) : (
							<p className="mb-2 px-2 text-center text-sm">
								<span className="font-semibold">
									Clique para escolher um arquivo
								</span>{" "}
								ou o arraste para a área demarcada
							</p>
						)}
					</div>
					<input
						onChange={(e) => {
							const file = e.target.files?.[0] || null;
							setFileHolder(file);
						}}
						id="dropzone-file-upload"
						type="file"
						className="absolute h-full w-full opacity-0"
						accept=".xlsx"
					/>
				</label>
			</div>
		</ResponsiveDialogDrawer>
	);
}
