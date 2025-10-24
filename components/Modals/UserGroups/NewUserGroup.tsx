import TextareaInput from "@/components/Inputs/TextareaInput";
import TextInput from "@/components/Inputs/TextInput";
import UserGroupPermissionsPannel from "@/components/UserGroups/PermissionsPannel";
import type { TUserSession } from "@/lib/auth/session";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createUserGroup } from "@/utils/mutations/user-groups";
import { TUserGroup } from "@/utils/schemas/user-groups.schema";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { VscChromeClose } from "react-icons/vsc";

type NewUserGroupProps = {
	session: TUserSession;
	closeModal: () => void;
};
function NewUserGroup({ session, closeModal }: NewUserGroupProps) {
	const queryClient = useQueryClient();
	const [infoHolder, setInfoHolder] = useState<TUserGroup>({
		titulo: "",
		descricao: "",
		permissoes: {
			usuarios: {
				visualizar: false,
				criar: false,
				editar: false,
			},
			comissoes: {
				visualizar: false,
				editar: false,
			},
			kits: {
				visualizar: false,
				editar: false,
				criar: false,
			},
			produtos: {
				visualizar: false,
				editar: false,
				criar: false,
			},
			servicos: {
				visualizar: false,
				editar: false,
				criar: false,
			},
			planos: {
				visualizar: false,
				editar: false,
				criar: false,
			},
			propostas: {
				escopo: null, // refere-se ao escopo de atuação, com IDs dos usuários a quem ele tem acesso
				visualizar: false,
				editar: false,
				criar: false,
			},
			oportunidades: {
				escopo: null, // refere-se ao escopo de atuação, com IDs dos usuários a quem ele tem acesso
				visualizar: false,
				editar: false,
				criar: false,
			},
			analisesTecnicas: {
				escopo: null, // refere-se ao escopo de atuação, com IDs dos usuários a quem ele tem acesso
				visualizar: false,
				editar: false,
				criar: false,
			},
			homologacoes: {
				escopo: null, // refere-se ao escopo de atuação, com IDs dos usuários a quem ele tem acesso
				visualizar: false,
				editar: false,
				criar: false,
			},
			clientes: {
				escopo: null,
				visualizar: false,
				editar: false,
				criar: false,
			},
			parceiros: {
				escopo: null,
				visualizar: false,
				editar: false,
				criar: false,
			},
			precos: {
				visualizar: false,
				editar: false,
			},
			resultados: {
				escopo: null,
				visualizarComercial: false,
				visualizarOperacional: false,
			},
			configuracoes: {
				parceiro: false,
				precificacao: false,
				funis: false,
				metodosPagamento: false,
				tiposProjeto: false,
				gruposUsuarios: true,
			},
			integracoes: {
				receberLeads: false,
			},
		},
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	});
	const { mutate: handleUserGroupCreation, isPending } = useMutationWithFeedback({
		mutationKey: ["create-user-group"],
		mutationFn: createUserGroup,
		queryClient: queryClient,
		affectedQueryKey: ["user-groups"],
	});
	return (
		<div id="new-user-group" className="fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)] font-Inter">
			<div className="fixed left-[50%] top-[50%] z-100 h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px] lg:w-[30%]">
				<div className="flex h-full w-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-primary  ">NOVO GRUPO DE USUÁRIOS</h3>
						<button
							onClick={closeModal}
							type="button"
							className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
						>
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					<div className="flex h-full grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30">
						<div className="w-full">
							<TextInput
								label="TÍTULO DO GRUPO"
								placeholder="Preencha aqui um título para identificação do grupo."
								value={infoHolder.titulo}
								handleChange={(value) => setInfoHolder((prev) => ({ ...prev, titulo: value }))}
								width="100%"
							/>
						</div>
						<TextareaInput
							label="DESCRIÇÃO DO GRUPO"
							placeholder="Preencha aqui uma descrição para o grupo de usuários."
							value={infoHolder.descricao}
							handleChange={(value) => setInfoHolder((prev) => ({ ...prev, descricao: value }))}
						/>
						<UserGroupPermissionsPannel infoHolder={infoHolder} setInfoHolder={setInfoHolder} session={session} />
					</div>
					<div className="flex w-full items-center justify-end p-2">
						<button
							disabled={isPending}
							onClick={() => {
								// @ts-ignore
								handleUserGroupCreation({ info: infoHolder });
							}}
							className="h-9 whitespace-nowrap rounded-sm bg-green-700 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-green-600 enabled:hover:text-primary-foreground"
						>
							CRIAR GRUPO
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewUserGroup;
