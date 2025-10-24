import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import useClientStateHook, { type TUseClientStateHook } from "@/hooks/use-client-state-hook";
import type { TUserSession } from "@/lib/auth/session";
import { uploadFile } from "@/lib/methods/firebase";
import { createClient } from "@/utils/mutations/clients";
import type { TClient } from "@/utils/schemas/client.schema";
import ClientAddressBlock from "./Blocks/Address";
import ClientContactsBlock from "./Blocks/Contacts";
import ClientGeneralBlock from "./Blocks/General";

type NewClientModalProps = {
	session: TUserSession;
	partnerId: string;
	closeModal: () => void;
	callbacks?: {
		onMutate?: () => void;
		onSuccess?: () => void;
		onError?: (error: Error) => void;
		onSettled?: () => void;
	};
};

function NewClient({ session, partnerId, closeModal, callbacks }: NewClientModalProps) {
	const queryClient = useQueryClient();

	const { state, updateClient, updateClientAvatarHolder, resetState, redefineState } = useClientStateHook({
		initialState: {
			client: {
				nome: "",
				idParceiro: partnerId,
				cpfCnpj: "",
				telefonePrimario: "",
				telefoneSecundario: null,
				email: "",
				cep: "",
				uf: "",
				cidade: "",
				bairro: "",
				endereco: "",
				numeroOuIdentificador: "",
				complemento: "",
				dataNascimento: null,
				profissao: null,
				estadoCivil: null,
				canalAquisicao: "",
				idMarketing: null,
				indicador: {
					nome: "",
					contato: "",
				},
				autor: {
					id: session.user.id,
					nome: session.user.nome,
					avatar_url: session.user.avatar_url,
				},
				dataInsercao: new Date().toISOString(),
			},
			clientAvatarHolder: {
				file: null,
				previewUrl: null,
			},
		},
	});

	async function handleCreateClient(state: TUseClientStateHook["state"]) {
		let clientAvatarUrl = state.client.conecta?.avatar_url;

		if (state.clientAvatarHolder.file) {
			const fileName = `avatar_cliente_${state.client.nome.toLowerCase().replaceAll(" ", "_")}`;
			const { url } = await uploadFile({ file: state.clientAvatarHolder.file, fileName: fileName, vinculationId: state.client.idParceiro });
			clientAvatarUrl = url;
		}

		return await createClient({
			info: {
				...state.client,
				conecta: {
					...state.client.conecta,
					usuario: state.client.conecta?.usuario ?? "",
					senha: state.client.conecta?.senha ?? "",
					avatar_url: clientAvatarUrl,
				},
			},
		});
	}
	const {
		data: mutationData,
		mutate: handleCreateClientMutation,
		reset: resetMutation,
		isPending,
	} = useMutation({
		mutationKey: ["create-client"],
		mutationFn: createClient,
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

	return (
		<ResponsiveDialogDrawer
			menuTitle="NOVO CLIENTE"
			menuDescription="Preencha os campos abaixo para criar um novo cliente."
			menuActionButtonText="CRIAR CLIENTE"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={() => handleCreateClient(state)}
			actionIsLoading={isPending}
			stateIsLoading={false}
			dialogVariant="md"
			drawerVariant="md"
		>
			{mutationData ? (
				<div className="flex w-full grow flex-col items-center justify-center gap-2">
					<div className="flex flex-col items-center gap-1">
						<BadgeCheck className="h-10 min-h-10 w-10 min-w-10 text-green-500 lg:h-20 lg:w-20" />
						<h1 className="text-center font-bold text-lg text-primary tracking-tight">Cliente criado com sucesso!</h1>
					</div>
					<div className="flex flex-col items-center gap-2 lg:flex-row">
						<Button
							onClick={() => {
								resetState();
								resetMutation();
							}}
							variant={"secondary"}
						>
							NOVO CLIENTE
						</Button>
					</div>
				</div>
			) : null}
			<ClientGeneralBlock
				infoHolder={state.client}
				updateInfoHolder={updateClient}
				avatarHolder={state.clientAvatarHolder}
				updateAvatarHolder={updateClientAvatarHolder}
			/>
			<ClientContactsBlock infoHolder={state.client} updateInfoHolder={updateClient} />
			<ClientAddressBlock infoHolder={state.client} updateInfoHolder={updateClient} />
		</ResponsiveDialogDrawer>
	);
}

export default NewClient;
