import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import ResponsiveDialogDrawer from "@/components/utils/ResponsiveDialogDrawer";
import type { TUserSession } from "@/lib/auth/session";
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

	function resetClient() {
		setClientInfo({
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
	}
	const {
		data: mutationData,
		mutate: handleCreateClient,
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
			actionFunction={() => handleCreateClient({ info: clientInfo })}
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
								resetClient();
								resetMutation();
							}}
							variant={"secondary"}
						>
							NOVO CLIENTE
						</Button>
					</div>
				</div>
			) : null}
			<ClientGeneralBlock infoHolder={clientInfo} updateInfoHolder={updateClientInfo} />
			<ClientContactsBlock infoHolder={clientInfo} updateInfoHolder={updateClientInfo} />
			<ClientAddressBlock infoHolder={clientInfo} updateInfoHolder={updateClientInfo} />
		</ResponsiveDialogDrawer>
	);
}

export default NewClient;
