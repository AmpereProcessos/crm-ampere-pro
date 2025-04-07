import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { VscChromeClose } from "react-icons/vsc";
import { BsCheckLg } from "react-icons/bs";

import TextInput from "../../Inputs/TextInput";
import CheckboxInput from "../../Inputs/CheckboxInput";
import NumberInput from "../../Inputs/NumberInput";

import type { TUser, TUserDTO, TUserEntity } from "@/utils/schemas/user.schema";
import { storage } from "@/services/firebase/storage-config";
import { createUser, editUser } from "@/utils/mutations/users";
import { formatToPhone } from "@/utils/methods";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import { useUserById, useUsers } from "@/utils/queries/users";
import LoadingComponent from "../../utils/LoadingComponent";
import ErrorComponent from "../../utils/ErrorComponent";
import PermissionsPannel from "../../Users/PermissionsPannel";
import type { Session } from "next-auth";
import { usePartnersSimplified } from "@/utils/queries/partners";
import SelectWithImages from "@/components/Inputs/SelectWithImages";
import { useUserGroups } from "@/utils/queries/user-groups";
import SelectInput from "@/components/Inputs/SelectInput";
import ComissionPannel from "@/components/Users/ComissionPannel";
import { LoadingButton } from "@/components/Buttons/loading-button";
type EditUserProps = {
	closeModal: () => void;
	userId: string;
	partnerId: string;
	session: Session;
};

function EditUser({ closeModal, userId, partnerId, session }: EditUserProps) {
	const queryClient = useQueryClient();
	const { data: users } = useUsers();
	const { data: user, isLoading, isError, isSuccess } = useUserById({ id: userId });
	const { data: partners } = usePartnersSimplified();
	const { data: groups } = useUserGroups();
	const [image, setImage] = useState<File | null>();
	const [userInfo, setUserInfo] = useState<TUserDTO>({
		_id: "id-holder",
		nome: "",
		administrador: false,
		telefone: "",
		email: "",
		senha: "",
		avatar_url: null,
		idParceiro: partnerId,
		idGrupo: "",
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
				visualizar: true,
				editar: false,
				criar: false,
			},
			produtos: {
				visualizar: true,
				editar: false,
				criar: false,
			},
			servicos: {
				visualizar: true,
				editar: false,
				criar: false,
			},
			planos: {
				visualizar: true,
				editar: false,
				criar: false,
			},
			propostas: {
				visualizar: true,
				editar: true,
				criar: true,
			},
			oportunidades: {
				escopo: null, // refere-se ao escopo de atuação, com IDs dos usuários a quem ele tem acesso
				visualizar: true,
				editar: true,
				criar: true,
			},
			analisesTecnicas: {
				escopo: null, // refere-se ao escopo de atuação, com IDs dos usuários a quem ele tem acesso
				visualizar: true,
				editar: false,
				criar: true,
			},
			homologacoes: {
				escopo: null, // refere-se ao escopo de atuação, com IDs dos usuários a quem ele tem acesso
				visualizar: true,
				editar: false,
				criar: true,
			},
			clientes: {
				escopo: null,
				visualizar: true,
				editar: true,
				criar: true,
			},
			projetos: {
				escopo: null,
				visualizar: true,
				editar: true,
				criar: true,
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
				gruposUsuarios: false,
			},
			integracoes: {
				receberLeads: false,
			},
		},
		comissoes: {
			comSDR: null,
			semSDR: null,
		},
		comissionamento: {
			aplicavel: false,
			resultados: [],
		},
		ativo: true,
		dataInsercao: new Date().toISOString(),
	});

	async function handleUserUpdate() {
		try {
			let avatar_url = userInfo.avatar_url;
			if (userInfo.nome.trim().length < 3) return toast.error("Preencha um nome de ao menos 3 caracteres.");
			if (image) {
				const storageName = `saas-crm/usuarios/${userInfo.nome}`;
				const fileRef = ref(storage, storageName);
				const firebaseResponse = await uploadBytes(fileRef, image);
				const fileUrl = await getDownloadURL(ref(storage, firebaseResponse.metadata.fullPath));
				avatar_url = fileUrl;
			}
			const response = await editUser({ userId: userId, changes: { ...userInfo, avatar_url: avatar_url } });
			return response;
		} catch (error) {
			console.log("Error running handleUserUpdate", error);
			throw error;
		}
	}
	const { mutate, isPending } = useMutationWithFeedback({
		mutationKey: ["edit-user", userId],
		mutationFn: handleUserUpdate,
		affectedQueryKey: ["user-by-id", userId],
		queryClient: queryClient,
		callbackFn: async () => await queryClient.invalidateQueries({ queryKey: ["users"] }),
	});
	useEffect(() => {
		if (user) setUserInfo(user);
	}, [user]);
	return (
		<div id="defaultModal" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
			<div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[50%]">
				<div className="flex h-full flex-col">
					<div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
						<h3 className="text-xl font-bold text-[#353432] dark:text-white ">EDITAR USUÁRIO</h3>
						<button onClick={closeModal} type="button" className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200">
							<VscChromeClose style={{ color: "red" }} />
						</button>
					</div>
					{isLoading ? <LoadingComponent /> : null}
					{isError ? <ErrorComponent msg="Erro ao buscar informações do usuário." /> : null}
					{isSuccess && userInfo ? (
						<>
							<div className="flex h-full grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
								<div className="my-2 flex w-full items-center justify-center">
									<div className="w-fit">
										<CheckboxInput
											labelFalse="USUÁRIO ATIVO"
											labelTrue="USUÁRIO ATIVO"
											checked={userInfo.ativo}
											handleChange={(value) => setUserInfo((prev) => ({ ...prev, ativo: value }))}
										/>
									</div>
								</div>
								<div className="flex h-[200px]  flex-col items-center justify-center">
									{!image && userInfo.avatar_url ? (
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
													if (e.target.files) setImage(e.target.files[0]);
												}}
												className="h-full w-full opacity-0"
												type="file"
												accept="image/png, image/jpeg"
											/>
										</div>
									) : image ? (
										<div className="relative mb-3 flex h-[120px] w-[120px] cursor-pointer items-center justify-center rounded-full bg-gray-200">
											<div className="absolute flex items-center justify-center">
												<BsCheckLg style={{ color: "green", fontSize: "25px" }} />
											</div>
											<input
												onChange={(e) => {
													if (e.target.files) setImage(e.target.files[0]);
												}}
												className="h-full w-full opacity-0"
												type="file"
												accept="image/png, image/jpeg"
											/>
										</div>
									) : (
										<div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-full border border-gray-300 bg-gray-200">
											{image ? (
												<div className="absolute flex items-center justify-center">
													<BsCheckLg style={{ color: "green", fontSize: "25px" }} />
												</div>
											) : (
												<p className="absolute w-full text-center text-xs font-bold text-gray-700">ESCOLHA UMA IMAGEM</p>
											)}

											<input
												onChange={(e) => {
													if (e.target.files) setImage(e.target.files[0]);
												}}
												className="h-full w-full opacity-0"
												type="file"
												accept=".png, .jpeg"
											/>
										</div>
									)}
								</div>
								<div className="grid w-full grid-cols-1 grid-rows-2 items-center gap-2 lg:grid-cols-2 lg:grid-rows-1">
									<TextInput
										label="NOME E SOBRENOME"
										value={userInfo.nome}
										placeholder="Preencha aqui o nome do usuário."
										handleChange={(value) =>
											setUserInfo((prev) => ({
												...prev,
												nome: value,
											}))
										}
										width="100%"
									/>
									<TextInput
										label="EMAIL"
										value={userInfo.email}
										placeholder="Preencha aqui o email do usuário."
										handleChange={(value) =>
											setUserInfo((prev) => ({
												...prev,
												email: value,
											}))
										}
										width="100%"
									/>
								</div>
								<div className="grid w-full grid-cols-1 grid-rows-2 items-center gap-2 lg:grid-cols-2 lg:grid-rows-1">
									<TextInput
										label="TELEFONE"
										value={userInfo.telefone || ""}
										placeholder="Preencha aqui o telefone do usuário."
										handleChange={(value) =>
											setUserInfo((prev) => ({
												...prev,
												telefone: formatToPhone(value),
											}))
										}
										width="100%"
									/>
									<TextInput
										label="SENHA"
										value={userInfo.senha}
										placeholder="Preencha aqui o senha do usuário."
										handleChange={(value) =>
											setUserInfo((prev) => ({
												...prev,
												senha: value,
											}))
										}
										width="100%"
									/>
								</div>
								<div className="flex w-full flex-col gap-1">
									<div className="flex w-full items-center gap-2">
										<div className="w-[50%]">
											<NumberInput
												label="COMISSÃO SEM SDR"
												placeholder="% SEM SDR"
												value={userInfo.comissoes?.semSDR || null}
												handleChange={(value) =>
													setUserInfo((prev) => ({
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
										<div className="w-[50%]">
											<NumberInput
												label="COMISSÃO COM SDR"
												placeholder="% COM SDR"
												value={userInfo.comissoes?.comSDR || null}
												handleChange={(value) =>
													setUserInfo((prev) => ({
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
									<div className="flex w-full items-center">
										<SelectWithImages
											label="PARCEIRO"
											value={userInfo.idParceiro}
											handleChange={(value) => setUserInfo((prev) => ({ ...prev, idParceiro: value }))}
											options={partners?.map((p) => ({ id: p._id, label: p.nome, value: p._id, url: p.logo_url || undefined })) || []}
											selectedItemLabel="NÃO DEFINIDO"
											onReset={() => setUserInfo((prev) => ({ ...prev, idParceiro: partners ? partners[0]._id : "" }))}
											width="100%"
										/>
									</div>
									<SelectInput
										label="GRUPO DE PERMISSÃO"
										options={
											groups?.map((role) => {
												return {
													id: role._id,
													label: role.titulo,
													value: role._id,
												};
											}) || []
										}
										selectedItemLabel="NÃO DEFINIDO"
										value={userInfo.idGrupo}
										handleChange={(value) => {
											const group = groups?.find((g) => g._id === value);
											if (!group) return;
											const permissions: TUser["permissoes"] = {
												usuarios: {
													visualizar: session.user.permissoes.usuarios.visualizar ? group.permissoes.usuarios.visualizar : session.user.permissoes.usuarios.visualizar,
													criar: session.user.permissoes.usuarios.criar ? group.permissoes.usuarios.criar : session.user.permissoes.usuarios.criar,
													editar: session.user.permissoes.usuarios.editar ? group.permissoes.usuarios.editar : session.user.permissoes.usuarios.editar,
												},
												comissoes: {
													visualizar: session.user.permissoes.comissoes.visualizar ? group.permissoes.comissoes.visualizar : session.user.permissoes.comissoes.visualizar,
													editar: session.user.permissoes.comissoes.editar ? group.permissoes.comissoes.editar : session.user.permissoes.comissoes.editar,
												},
												kits: {
													visualizar: session.user.permissoes.kits.visualizar ? group.permissoes.kits.visualizar : session.user.permissoes.kits.visualizar,
													editar: session.user.permissoes.kits.editar ? group.permissoes.kits.editar : session.user.permissoes.kits.editar,
													criar: session.user.permissoes.kits.criar ? group.permissoes.kits.criar : session.user.permissoes.kits.criar,
												},
												produtos: {
													visualizar: session.user.permissoes.produtos.visualizar ? group.permissoes.produtos.visualizar : session.user.permissoes.produtos.visualizar,
													editar: session.user.permissoes.produtos.editar ? group.permissoes.produtos.editar : session.user.permissoes.produtos.editar,
													criar: session.user.permissoes.produtos.criar ? group.permissoes.produtos.criar : session.user.permissoes.produtos.visualizar,
												},
												servicos: {
													visualizar: session.user.permissoes.servicos.visualizar ? group.permissoes.servicos.visualizar : session.user.permissoes.servicos.visualizar,
													editar: session.user.permissoes.servicos.editar ? group.permissoes.servicos.editar : session.user.permissoes.servicos.editar,
													criar: session.user.permissoes.servicos.criar ? group.permissoes.servicos.criar : session.user.permissoes.servicos.criar,
												},
												planos: {
													visualizar: session.user.permissoes.planos.visualizar ? group.permissoes.planos.visualizar : session.user.permissoes.planos.visualizar,
													editar: session.user.permissoes.planos.editar ? group.permissoes.planos.editar : session.user.permissoes.planos.editar,
													criar: session.user.permissoes.planos.criar ? group.permissoes.planos.criar : session.user.permissoes.planos.criar,
												},
												propostas: {
													escopo: [userId],
													visualizar: session.user.permissoes.propostas.visualizar ? group.permissoes.propostas.visualizar : session.user.permissoes.propostas.visualizar,
													editar: session.user.permissoes.propostas.editar ? group.permissoes.propostas.editar : session.user.permissoes.propostas.editar,
													criar: session.user.permissoes.propostas.criar ? group.permissoes.propostas.criar : session.user.permissoes.propostas.criar,
												},
												oportunidades: {
													escopo: [userId], // refere-se ao escopo de atuação
													visualizar: session.user.permissoes.oportunidades.visualizar ? group.permissoes.oportunidades.visualizar : session.user.permissoes.oportunidades.visualizar,
													editar: session.user.permissoes.oportunidades.editar ? group.permissoes.oportunidades.editar : session.user.permissoes.oportunidades.editar,
													criar: session.user.permissoes.oportunidades.criar ? group.permissoes.oportunidades.criar : session.user.permissoes.oportunidades.criar,
													excluir: session.user.permissoes.oportunidades.excluir ? group.permissoes.oportunidades.excluir : session.user.permissoes.oportunidades.excluir,
												},
												analisesTecnicas: {
													escopo: [userId], // refere-se ao escopo de atuação
													visualizar: session.user.permissoes.analisesTecnicas.visualizar ? group.permissoes.analisesTecnicas.visualizar : session.user.permissoes.analisesTecnicas.visualizar,
													editar: session.user.permissoes.analisesTecnicas.editar ? group.permissoes.analisesTecnicas.editar : session.user.permissoes.analisesTecnicas.editar,
													criar: session.user.permissoes.analisesTecnicas.criar ? group.permissoes.analisesTecnicas.criar : session.user.permissoes.analisesTecnicas.criar,
												},
												homologacoes: {
													escopo: [userId], // refere-se ao escopo de atuação
													visualizar: session.user.permissoes.homologacoes.visualizar ? group.permissoes.homologacoes.visualizar : session.user.permissoes.homologacoes.visualizar,
													editar: session.user.permissoes.homologacoes.editar ? group.permissoes.homologacoes.editar : session.user.permissoes.homologacoes.editar,
													criar: session.user.permissoes.homologacoes.criar ? group.permissoes.homologacoes.criar : session.user.permissoes.homologacoes.criar,
												},
												clientes: {
													escopo: [userId],
													visualizar: session.user.permissoes.clientes.visualizar ? group.permissoes.clientes.visualizar : session.user.permissoes.clientes.visualizar,
													editar: session.user.permissoes.clientes.editar ? group.permissoes.clientes.editar : session.user.permissoes.clientes.editar,
													criar: session.user.permissoes.clientes.criar ? group.permissoes.clientes.criar : session.user.permissoes.clientes.criar,
												},
												projetos: {
													escopo: [userId],
													visualizar: session.user.permissoes.projetos.visualizar ? group.permissoes.projetos.visualizar : session.user.permissoes.projetos.visualizar,
													editar: session.user.permissoes.projetos.editar ? group.permissoes.projetos.editar : session.user.permissoes.projetos.editar,
													criar: session.user.permissoes.projetos.criar ? group.permissoes.projetos.criar : session.user.permissoes.projetos.criar,
												},
												parceiros: {
													escopo: session.user.idParceiro ? [session.user.idParceiro] : null,
													visualizar: session.user.permissoes.parceiros.visualizar ? group.permissoes.parceiros.visualizar : session.user.permissoes.parceiros.visualizar,
													editar: session.user.permissoes.parceiros.editar ? group.permissoes.parceiros.editar : session.user.permissoes.parceiros.editar,
													criar: session.user.permissoes.parceiros.criar ? group.permissoes.parceiros.criar : session.user.permissoes.parceiros.criar,
												},
												precos: {
													visualizar: session.user.permissoes.precos.visualizar ? group.permissoes.precos.visualizar : session.user.permissoes.precos.visualizar,
													editar: session.user.permissoes.precos.editar ? group.permissoes.precos.editar : session.user.permissoes.precos.editar,
												},
												resultados: {
													escopo: [userId], // refere-se ao escopo de atuação
													visualizarComercial: session.user.permissoes.resultados.visualizarComercial
														? group.permissoes.resultados.visualizarComercial
														: session.user.permissoes.resultados.visualizarComercial,
													visualizarOperacional: session.user.permissoes.resultados.visualizarOperacional
														? group.permissoes.resultados.visualizarOperacional
														: session.user.permissoes.resultados.visualizarOperacional,
												},
												configuracoes: {
													funis: session.user.permissoes.configuracoes.funis ? group.permissoes.configuracoes.funis : session.user.permissoes.configuracoes.funis,
													parceiro: session.user.permissoes.configuracoes.parceiro ? group.permissoes.configuracoes.parceiro : session.user.permissoes.configuracoes.parceiro,
													precificacao: session.user.permissoes.configuracoes.precificacao ? group.permissoes.configuracoes.precificacao : session.user.permissoes.configuracoes.precificacao,
													metodosPagamento: session.user.permissoes.configuracoes.metodosPagamento
														? group.permissoes.configuracoes.metodosPagamento
														: session.user.permissoes.configuracoes.metodosPagamento,
													tiposProjeto: session.user.permissoes.configuracoes.tiposProjeto ? group.permissoes.configuracoes.tiposProjeto : session.user.permissoes.configuracoes.tiposProjeto,
													gruposUsuarios: session.user.permissoes.configuracoes.gruposUsuarios
														? group.permissoes.configuracoes.gruposUsuarios
														: session.user.permissoes.configuracoes.gruposUsuarios,
												},
												integracoes: {
													receberLeads: group.permissoes.integracoes.receberLeads,
												},
											};
											setUserInfo((prev) => ({ ...prev, idGrupo: value, permissoes: permissions }));
										}}
										onReset={() => setUserInfo((prev) => ({ ...prev, idGrupo: "" }))}
										width="100%"
									/>
								</div>

								<PermissionsPannel referenceId={userId} userInfo={userInfo as TUser} setUserInfo={setUserInfo as Dispatch<SetStateAction<TUser>>} users={users} session={session} />
								<ComissionPannel infoHolder={userInfo} setInfoHolder={setUserInfo as Dispatch<SetStateAction<TUser>>} />
							</div>
							<div className="mt-1 flex w-full items-end justify-end">
								<LoadingButton
									loading={isPending}
									onClick={() =>
										// @ts-ignore
										mutate()
									}
								>
									ATUALIZAR USUÁRIO
								</LoadingButton>
							</div>
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}

export default EditUser;
