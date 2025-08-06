import TextareaInput from "@/components/Inputs/TextareaInput";
import TextInput from "@/components/Inputs/TextInput";
import UserGroupPermissionsPannel from "@/components/UserGroups/PermissionsPannel";
import ErrorComponent from "@/components/utils/ErrorComponent";
import LoadingComponent from "@/components/utils/LoadingComponent";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { createUserGroup, editUserGroup } from "@/utils/mutations/user-groups";
import { useUserGroupById } from "@/utils/queries/user-groups";
import { TUserGroup, TUserGroupDTO } from "@/utils/schemas/user-groups.schema";
import { useQueryClient } from "@tanstack/react-query";
import type { TUserSession } from "@/lib/auth/session";
import React, { useEffect, useState } from "react";
import { VscChromeClose } from "react-icons/vsc";

type EditUserGroupProps = {
	id: string;
	session: TUserSession;
	closeModal: () => void;
};
function EditUserGroup({ id, session, closeModal }: EditUserGroupProps) {
	const queryClient = useQueryClient();
	const { data: group, isLoading, isSuccess, isError } = useUserGroupById({ id });
	const [infoHolder, setInfoHolder] = useState<TUserGroupDTO>({
		_id: "id-holder",
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
	const { mutate: handleUserGroupUpdate, isPending } = useMutationWithFeedback({
		mutationKey: ["edit-user-group", id],
		mutationFn: editUserGroup,
		queryClient: queryClient,
		affectedQueryKey: ["user-group-by-id", id],
		callbackFn: async () => await queryClient.invalidateQueries({ queryKey: ["user-groups"] }),
	});
	useEffect(() => {
		if (group) setInfoHolder(group);
	}, [group]);
	return (
		<div id="new-user-group" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)] font-Inter">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[30%]">
				<div className="flex h-full w-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-300 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">EDITAR GRUPO DE USUÁRIOS</h3>
						<button onClick={closeModal} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Erro ao buscar grupo de usuários." /> : null}
					{isSuccess ? (
						<>
							<div className="flex h-full grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
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
								<UserGroupPermissionsPannel infoHolder={infoHolder as TUserGroup} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TUserGroup>>} session={session} />
							</div>
							<div className="flex w-full items-center justify-end p-2">
								<button
									disabled={isPending}
									//@ts-ignore
									onClick={() => handleUserGroupUpdate({ id: id, changes: infoHolder })}
									className="h-9 whitespace-nowrap rounded bg-blue-800 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-blue-800 enabled:hover:text-white"
								>
									ATUALIZAR GRUPO
								</button>
							</div>
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default EditUserGroup;
