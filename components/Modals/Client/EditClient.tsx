import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import type { TUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/methods/errors";
import { updateClient } from "@/utils/mutations/clients";
import { useClientById } from "@/utils/queries/clients";
import type { TClient } from "@/utils/schemas/client.schema";
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
	const [clientInfo, setClientInfo] = useState<TClient>({
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
	});

	function updateClientInfo(changes: Partial<TClient>) {
		setClientInfo((prev) => ({ ...prev, ...changes }));
	}

	const { mutate: handleUpdateClient, isPending } = useMutation({
		mutationKey: ["update-client", clientId],
		mutationFn: updateClient,
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
		if (client) setClientInfo(client);
	}, [client]);

	return (
		<ResponsiveDialogDrawer
			menuTitle="EDITAR CLIENTE"
			menuDescription="Preencha os campos abaixo para atualizar o registro do cliente."
			menuActionButtonText="ATUALIZAR CLIENTE"
			menuCancelButtonText="CANCELAR"
			closeMenu={closeModal}
			actionFunction={() => handleUpdateClient({ id: clientId, changes: clientInfo })}
			actionIsLoading={isPending}
			stateIsLoading={isLoading}
			stateError={isError ? getErrorMessage(error) : null}
			dialogVariant="md"
			drawerVariant="md"
		>
			<ClientIdBlock clientId={clientId} />
			<ClientGeneralBlock infoHolder={clientInfo} updateInfoHolder={updateClientInfo} />
			<ClientContactsBlock infoHolder={clientInfo} updateInfoHolder={updateClientInfo} />
			<ClientAddressBlock infoHolder={clientInfo} updateInfoHolder={updateClientInfo} />
		</ResponsiveDialogDrawer>
	);
}

export default EditClient;
