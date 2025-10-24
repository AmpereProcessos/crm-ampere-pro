import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import useClientStateHook, { type TUseClientStateHook } from "@/hooks/use-client-state-hook";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { uploadFile } from "@/lib/methods/firebase";
import { updateClient as updateClientMutation } from "@/utils/mutations/clients";
import { useClientById } from "@/utils/queries/clients";
import ClientAddressBlock from "./Blocks/Address";
import ClientContactsBlock from "./Blocks/Contacts";
import ClientGeneralBlock from "./Blocks/General";
import ClientIdBlock from "./Blocks/Id";

type EditClientModalProps = {
	clientId: string;
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

function EditClient({ clientId, session, partnerId, closeModal, callbacks }: EditClientModalProps) {
	const queryClient = useQueryClient();
	const { data: client, queryKey, isError, isLoading, error } = useClientById({ id: clientId });

	const { state, updateClient, updateClientAvatarHolder, redefineState } = useClientStateHook({
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

	async function handleUpdateClient(state: TUseClientStateHook["state"]) {
		let clientAvatarUrl = state.client.conecta?.avatar_url;
		if (state.clientAvatarHolder.file) {
			const fileName = `avatar_cliente_${state.client.nome.toLowerCase().replaceAll(" ", "_")}`;
			const { url } = await uploadFile({ file: state.clientAvatarHolder.file, fileName: fileName, vinculationId: state.client.idParceiro });
			clientAvatarUrl = url;
		}
		return await updateClientMutation({
			id: clientId,
			changes: {
				...state.client,
				conecta: {
					...state.client.conecta,
					avatar_url: clientAvatarUrl,
					usuario: state.client.conecta?.usuario ?? "",
					senha: state.client.conecta?.senha ?? "",
				},
			},
		});
	}
	const { mutate: handleUpdateClientMutation, isPending } = useMutation({
		mutationKey: ["update-client", clientId],
		mutationFn: handleUpdateClient,
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: queryKey });
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
			await queryClient.invalidateQueries({ queryKey: queryKey });
		},
	});
	useEffect(() => {
		if (client) redefineState({ client: client, clientAvatarHolder: { file: null, previewUrl: null } });
	}, [client, redefineState]);

	return (
		<ResponsiveDialogDrawer
			menuTitle="EDITAR CLIENTE"
			menuDescription="Preencha os campos abaixo para atualizar o registro do cliente."
			menuActionButtonText="ATUALIZAR CLIENTE"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={() => handleUpdateClientMutation(state)}
			actionIsLoading={isPending}
			stateIsLoading={isLoading}
			stateError={isError ? getErrorMessage(error) : null}
			dialogVariant="md"
			drawerVariant="md"
		>
			<ClientIdBlock clientId={clientId} />
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

export default EditClient;
