import React, { useState } from "react";
import axios from "axios";

import Avatar from "../utils/Avatar";
import NumberInput from "../Inputs/NumberInput";
import TextInput from "../Inputs/TextInput";

import { formatToPhone } from "@/utils/methods";
import { uploadFile } from "@/lib/methods/firebase";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { GeneralUserSchema, type TAuthor, type TUser } from "@/utils/schemas/user.schema";
import { useQueryClient } from "@tanstack/react-query";
import { createUser } from "@/utils/mutations/onboarding";
import { UserGroups } from "@/utils/select-options";

type UserProps = {
	partnerId: string;
	setAuthorHolder: React.Dispatch<React.SetStateAction<TAuthor>>;
	goToNextStage: () => void;
	goToPreviousStage: () => void;
};
function User({ partnerId, setAuthorHolder, goToNextStage, goToPreviousStage }: UserProps) {
	const queryClient = useQueryClient();
	const [userHolder, setUserHolder] = useState<TUser>({
		nome: "",
		administrador: false,
		telefone: "",
		email: "",
		senha: "",
		avatar_url: null,
		idParceiro: partnerId,
		idGrupo: "1",
		permissoes: UserGroups[0].permissoes,
		comissoes: {
			semSDR: 0,
			comSDR: 0,
		},
		ativo: true,
		dataInsercao: new Date().toISOString(),
	});
	const [editImage, setEditImage] = useState<{ enabled: boolean; temporaryUrl: null | string }>({
		enabled: false,
		temporaryUrl: null,
	});
	const [avatarFile, setAvatarFile] = useState<File | null>(null);

	async function handleUserCreation() {
		try {
			GeneralUserSchema.parse(userHolder);
			var avatar_url = userHolder.avatar_url;
			if (avatarFile) {
				const fileName = `avatar_${userHolder.nome.toLowerCase().replaceAll(" ", "_")}`;
				const { url } = await uploadFile({ file: avatarFile, fileName: fileName, vinculationId: partnerId });
				avatar_url = url;
			}
			const insertedId = await createUser({ info: userHolder });
			const author = { id: insertedId, nome: userHolder.nome, avatar_url: avatar_url };
			setAuthorHolder(author);
			goToNextStage();
			return "Usuário criado com sucesso !";
		} catch (error) {
			throw error;
		}
	}
	const { mutate, isPending } = useMutationWithFeedback({
		mutationKey: ["create-user"],
		mutationFn: handleUserCreation,
		queryClient: queryClient,
		affectedQueryKey: ["users"],
	});
	return (
		<div className="flex grow flex-col gap-y-2">
			<div className="flex w-full grow flex-col gap-y-2">
				<h1 className="mt-4 w-full text-center text-lg tracking-tight text-gray-500">Agora, precisamos que você crie o primeiro usuário para a sua empresa.</h1>
				<h1 className="mb-4 w-full text-center text-lg tracking-tight text-gray-500">Lembrando que esse primeiro usuário será criado com permissões gerais de administrador.</h1>
				<h1 className="w-full self-center bg-[#fead41] p-1 text-center font-bold text-white">DADOS DE USUÁRIO</h1>
				<div className="flex w-full flex-col px-2">
					<div className="relative flex h-[200px] w-[200px] flex-col items-center justify-center gap-2 self-center rounded-full">
						{userHolder.avatar_url && !editImage.enabled ? (
							<div className="flex h-[150px] w-full flex-col items-center gap-2">
								<div className="flex h-[120px] w-[120px] items-center justify-center self-center">
									<Avatar url={userHolder.avatar_url} width={120} height={120} fallback="L" />
								</div>
								<button
									onClick={() => setEditImage((prev) => ({ ...prev, enabled: true }))}
									className="w-fit rounded border border-black p-1 font-Raleway text-xs font-medium duration-300 ease-in-out hover:bg-black hover:text-white"
								>
									EDITAR IMAGEM
								</button>
							</div>
						) : (
							<div className="flex h-[150px] w-full flex-col items-center gap-2">
								<div className="relative flex h-[200px] w-[200px]  items-center justify-center">
									{avatarFile && !!editImage.temporaryUrl ? (
										<div className="flex h-[120px] w-[120px] items-center justify-center self-center">
											<Avatar url={editImage.temporaryUrl} width={120} height={120} fallback="L" />
										</div>
									) : (
										<div className=" flex h-[120px] w-[120px] items-center justify-center rounded-full border border-gray-300 bg-gray-200">
											<p className="absolute w-full text-center text-xxs font-bold text-gray-700">ESCOLHA SEU AVATAR</p>
										</div>
									)}
									<input
										onChange={(e) => {
											if (e.target.files && e.target.files[0]) {
												const file = e.target.files[0];
												setAvatarFile(file);
												const previewURL = URL.createObjectURL(file);
												setEditImage((prev) => ({ ...prev, temporaryUrl: previewURL }));
											} else {
												setAvatarFile(null);
												setEditImage((prev) => ({ ...prev, temporaryUrl: null }));
											}
										}}
										className="absolute h-full w-full opacity-0"
										type="file"
										accept=".png, .jpeg"
									/>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 px-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="NOME E SOBRENOME"
							value={userHolder.nome}
							placeholder="Preencha aqui o nome do usuário."
							handleChange={(value) =>
								setUserHolder((prev) => ({
									...prev,
									nome: value,
								}))
							}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<TextInput
							label="EMAIL"
							value={userHolder.email}
							placeholder="Preencha aqui o email do usuário."
							handleChange={(value) =>
								setUserHolder((prev) => ({
									...prev,
									email: value,
								}))
							}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 px-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<TextInput
							label="TELEFONE"
							value={userHolder.telefone || ""}
							placeholder="Preencha aqui o telefone do usuário."
							handleChange={(value) =>
								setUserHolder((prev) => ({
									...prev,
									telefone: formatToPhone(value),
								}))
							}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<TextInput
							label="SENHA"
							value={userHolder.senha}
							placeholder="Preencha aqui o senha do usuário."
							handleChange={(value) =>
								setUserHolder((prev) => ({
									...prev,
									senha: value,
								}))
							}
							width="100%"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col items-center gap-2 px-2 lg:flex-row">
					<div className="w-full lg:w-1/2">
						<NumberInput
							label="COMISSÃO SEM SDR"
							placeholder="% SEM SDR"
							value={userHolder.comissoes?.semSDR || null}
							handleChange={(value) =>
								setUserHolder((prev) => ({
									...prev,
									comissoes: {
										...prev.comissoes,
										semSDR: value,
									},
								}))
							}
							width="100%"
						/>
					</div>
					<div className="w-full lg:w-1/2">
						<NumberInput
							label="COMISSÃO COM SDR"
							placeholder="% COM SDR"
							value={userHolder.comissoes?.comSDR || null}
							handleChange={(value) =>
								setUserHolder((prev) => ({
									...prev,
									comissoes: {
										...prev.comissoes,
										comSDR: value,
									},
								}))
							}
							width="100%"
						/>
					</div>
				</div>
			</div>

			<div className="flex w-full items-center justify-end px-2">
				<button
					disabled={isPending}
					className="rounded bg-black p-1 px-4 text-xs font-medium text-white duration-300 ease-in-out disabled:bg-gray-400 disabled:text-black enabled:hover:bg-gray-600"
					onClick={() => mutate()}
				>
					PROSSEGUIR
				</button>
			</div>
		</div>
	);
}

export default User;
