import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { BsCheckLg } from "react-icons/bs";

import DateInput from "@/components/Inputs/DateInput";

import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import type { TUserSession } from "@/lib/auth/session";
import { formatDateOnInputChange } from "@/lib/methods/formatting";
import type { TUpdateProfileInput } from "@/pages/api/users/profile";
import { storage } from "@/services/firebase/storage-config";
import { formatDateForInputValue, formatToPhone } from "@/utils/methods";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { editProfile, editUser } from "@/utils/mutations/users";

import TextInput from "../../Inputs/TextInput";

type EditUserProps = {
	closeModal: () => void;
	userId: string;
	partnerId: string;
	session: TUserSession;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onSettled?: () => void;
		onError?: (error: Error) => void;
	};
};

function EditUserProfile({ closeModal, userId, partnerId, session, callbacks }: EditUserProps) {
	const queryClient = useQueryClient();

	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	function updateAvatarFile(file: File | null) {
		setAvatarFile(file);
	}
	const [userInfo, setUserInfo] = useState<TUpdateProfileInput>({
		nome: session.user.nome,
		telefone: session.user.telefone || "",
		avatar_url: session.user.avatar_url || null,
		dataNascimento: session.user.dataNascimento || null,
	});
	function updateUserInfo(info: Partial<TUpdateProfileInput>) {
		setUserInfo((prev) => ({ ...prev, ...info }));
	}

	async function handleUserUpdate({ userInfo, avatarFile }: { userInfo: TUpdateProfileInput; avatarFile: File | null }) {
		try {
			let avatar_url = userInfo.avatar_url;
			if (userInfo.nome.trim().length < 3) return toast.error("Preencha um nome de ao menos 3 caracteres.");
			if (avatarFile) {
				const storageName = `saas-crm/usuarios/${userInfo.nome}`;
				const fileRef = ref(storage, storageName);
				const firebaseResponse = await uploadBytes(fileRef, avatarFile);
				const fileUrl = await getDownloadURL(ref(storage, firebaseResponse.metadata.fullPath));
				avatar_url = fileUrl;
			}
			const response = await editProfile({
				input: { ...userInfo, avatar_url: avatar_url },
			});
			return response;
		} catch (error) {
			console.log("Error running handleUserUpdate", error);
			throw error;
		}
	}
	const { mutate, isPending } = useMutation({
		mutationKey: ["edit-profile", userId],
		mutationFn: handleUserUpdate,
		onMutate: async () => {
			if (callbacks?.onMutate) callbacks.onMutate();
		},
		onSuccess: async (data) => {
			if (callbacks?.onSuccess) callbacks.onSuccess();
			return toast.success(data);
		},
		onError: async (error) => {
			if (callbacks?.onError) callbacks.onError(error);
		},
		onSettled: async () => {
			if (callbacks?.onSettled) callbacks.onSettled();
		},
	});

	const MENU_TITLE = "ATUALIZAR PERFIL";
	const MENU_DESCRIPTION = "Preencha os campos abaixo para editar o usuário.";
	const BUTTON_TEXT = "ATUALIZAR USUÁRIO";

	return (
		<ResponsiveDialogDrawer
			menuTitle={MENU_TITLE}
			menuDescription={MENU_DESCRIPTION}
			menuActionButtonText={BUTTON_TEXT}
			actionFunction={() => mutate({ userInfo: userInfo, avatarFile: avatarFile })}
			actionIsLoading={isPending}
			stateIsLoading={false}
			closeMenu={closeModal}
			menuCancelButtonText="CANCELAR"
			dialogVariant="fit"
			drawerVariant="fit"
		>
			<div className="flex flex-col h-[200px]  items-center justify-center">
				{!avatarFile && userInfo.avatar_url ? (
					<div className="relative mb-3 h-[120px] w-[120px] cursor-pointer rounded-full">
						<Image
							src={userInfo.avatar_url}
							// width={96}
							// height={96}
							fill={true}
							alt="AVATAR"
							style={{
								borderRadius: "100%",
								objectFit: "cover",
								position: "absolute",
							}}
						/>
						<input
							onChange={(e) => {
								if (e.target.files) updateAvatarFile(e.target.files[0]);
							}}
							className="h-full w-full opacity-0"
							type="file"
							accept="image/png, image/jpeg"
						/>
					</div>
				) : avatarFile ? (
					<div className="relative mb-3 flex h-[120px] w-[120px] cursor-pointer items-center justify-center rounded-full bg-primary/30">
						<div className="absolute flex items-center justify-center">
							<BsCheckLg style={{ color: "green", fontSize: "25px" }} />
						</div>
						<input
							onChange={(e) => {
								if (e.target.files) updateAvatarFile(e.target.files[0]);
							}}
							className="h-full w-full opacity-0"
							type="file"
							accept="image/png, image/jpeg"
						/>
					</div>
				) : (
					<div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border border-primary/30 bg-primary/30">
						{avatarFile ? (
							<div className="absolute flex items-center justify-center">
								<BsCheckLg style={{ color: "green", fontSize: "25px" }} />
							</div>
						) : (
							<p className="absolute w-full text-center text-xs font-bold text-primary/70">ESCOLHA UMA IMAGEM</p>
						)}

						<input
							onChange={(e) => {
								if (e.target.files) updateAvatarFile(e.target.files[0]);
							}}
							className="h-full w-full opacity-0"
							type="file"
							accept=".png, .jpeg"
						/>
					</div>
				)}
			</div>
			<TextInput
				label="NOME E SOBRENOME"
				value={userInfo.nome}
				placeholder="Preencha aqui o nome do usuário."
				handleChange={(value) => updateUserInfo({ nome: value })}
				width="100%"
			/>
			<TextInput
				label="TELEFONE"
				value={userInfo.telefone || ""}
				placeholder="Preencha aqui o telefone do usuário."
				handleChange={(value) => updateUserInfo({ telefone: formatToPhone(value) })}
				width="100%"
			/>
			<DateInput
				label="DATA DE NASCIMENTO"
				value={formatDateForInputValue(userInfo.dataNascimento)}
				handleChange={(value) => updateUserInfo({ dataNascimento: formatDateOnInputChange(value) })}
				width="100%"
			/>
		</ResponsiveDialogDrawer>
	);
}

export default EditUserProfile;
