import React from "react";

import CheckboxInput from "../Inputs/CheckboxInput";
import { TUser, TUserDTO, TUserEntity } from "@/utils/schemas/user.schema";

import type { TUserSession } from "@/lib/auth/session";
import { usePartners, usePartnersSimplified } from "@/utils/queries/partners";
import { TUserGroup } from "@/utils/schemas/user-groups.schema";

type UserGroupPermissionsPannelProps = {
	infoHolder: TUserGroup;
	setInfoHolder: React.Dispatch<React.SetStateAction<TUserGroup>>;
	session: TUserSession;
};
function UserGroupPermissionsPannel({ infoHolder, setInfoHolder, session }: UserGroupPermissionsPannelProps) {
	return (
		<>
			<h1 className="w-full pt-4 text-center text-sm font-medium">PERMISSÕES BASE DO GRUPO</h1>
			{/**USUÁRIOS */}
			<h1 className="w-full text-start text-sm text-gray-500">USUÁRIOS</h1>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR TODOS OS USUÁRIOS"
				labelTrue="APTO A VISUALIZAR TODOS OS USUÁRIOS"
				checked={infoHolder.permissoes.usuarios.visualizar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							usuarios: {
								...prev.permissoes.usuarios,
								visualizar: value,
							},
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A CRIAR USUÁRIOS"
				labelTrue="APTO A CRIAR USUÁRIOS"
				checked={infoHolder.permissoes.usuarios.criar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							usuarios: { ...prev.permissoes.usuarios, criar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A EDITAR USUÁRIOS"
				labelTrue="APTO A EDITAR USUÁRIOS"
				checked={infoHolder.permissoes.usuarios.editar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							usuarios: { ...prev.permissoes.usuarios, editar: value },
						},
					}))
				}
			/>
			{/**COMISSÕES */}
			<h1 className="w-full text-start text-sm text-gray-500">COMISSÕES</h1>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR COMISSÕES"
				labelTrue="APTO A VISUALIZAR COMISSÕES"
				checked={infoHolder.permissoes.comissoes.visualizar}
				editable={session.user.permissoes.comissoes.visualizar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							comissoes: { ...prev.permissoes.comissoes, visualizar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A EDITAR COMISSÕES"
				labelTrue="APTO A EDITAR COMISSÕES"
				checked={infoHolder.permissoes.comissoes.editar}
				editable={session.user.permissoes.comissoes.editar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							comissoes: { ...prev.permissoes.comissoes, editar: value },
						},
					}))
				}
			/>
			{/**KITS */}
			<h1 className="w-full text-start text-sm text-gray-500">KITS</h1>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR TODOS OS KITS"
				labelTrue="APTO A VISUALIZAR TODOS OS KITS"
				checked={infoHolder.permissoes.kits.visualizar}
				editable={session.user.permissoes.kits.visualizar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							kits: { ...prev.permissoes.kits, visualizar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A CRIAR KITS"
				labelTrue="APTO A CRIAR KITS"
				checked={infoHolder.permissoes.kits.criar}
				editable={session.user.permissoes.kits.criar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							kits: { ...prev.permissoes.kits, criar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A EDITAR KITS"
				labelTrue="APTO A EDITAR KITS"
				checked={infoHolder.permissoes.kits.editar}
				editable={session.user.permissoes.kits.editar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							kits: { ...prev.permissoes.kits, editar: value },
						},
					}))
				}
			/>
			{/**PRODUTOS */}
			<h1 className="w-full text-start text-sm text-gray-500">PRODUTOS</h1>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR TODOS OS PRODUTOS"
				labelTrue="APTO A VISUALIZAR TODOS OS PRODUTOS"
				checked={infoHolder.permissoes.produtos.visualizar}
				editable={session.user.permissoes.produtos.visualizar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							produtos: { ...prev.permissoes.produtos, visualizar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A CRIAR PRODUTOS"
				labelTrue="APTO A CRIAR PRODUTOS"
				checked={infoHolder.permissoes.produtos.criar}
				editable={session.user.permissoes.produtos.criar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							produtos: { ...prev.permissoes.produtos, criar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A EDITAR PRODUTOS"
				labelTrue="APTO A EDITAR PRODUTOS"
				checked={infoHolder.permissoes.produtos.editar}
				editable={session.user.permissoes.produtos.editar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							produtos: { ...prev.permissoes.produtos, editar: value },
						},
					}))
				}
			/>
			{/**SERVIÇOS */}
			<h1 className="w-full text-start text-sm text-gray-500">SERVIÇOS</h1>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR TODOS OS SERVIÇOS"
				labelTrue="APTO A VISUALIZAR TODOS OS SERVIÇOS"
				checked={infoHolder.permissoes.servicos.visualizar}
				editable={session.user.permissoes.servicos.visualizar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							servicos: { ...prev.permissoes.servicos, visualizar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A CRIAR SERVIÇOS"
				labelTrue="APTO A CRIAR SERVIÇOS"
				checked={infoHolder.permissoes.servicos.criar}
				editable={session.user.permissoes.servicos.criar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							servicos: { ...prev.permissoes.servicos, criar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A EDITAR SERVIÇOS"
				labelTrue="APTO A EDITAR SERVIÇOS"
				checked={infoHolder.permissoes.servicos.editar}
				editable={session.user.permissoes.servicos.editar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							servicos: { ...prev.permissoes.servicos, editar: value },
						},
					}))
				}
			/>
			{/**PLANOS */}
			<h1 className="w-full text-start text-sm text-gray-500">PLANOS</h1>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR TODOS OS PLANOS"
				labelTrue="APTO A VISUALIZAR TODOS OS PLANOS"
				checked={infoHolder.permissoes.planos.visualizar}
				editable={session.user.permissoes.planos.visualizar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							planos: { ...prev.permissoes.planos, visualizar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A CRIAR PLANOS"
				labelTrue="APTO A CRIAR PLANOS"
				checked={infoHolder.permissoes.planos.criar}
				editable={session.user.permissoes.planos.criar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							planos: { ...prev.permissoes.planos, criar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A EDITAR PLANOS"
				labelTrue="APTO A EDITAR PLANOS"
				checked={infoHolder.permissoes.planos.editar}
				editable={session.user.permissoes.planos.editar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							planos: { ...prev.permissoes.planos, editar: value },
						},
					}))
				}
			/>
			{/**CLIENTES */}
			<div className="flex w-full items-center justify-between">
				<h1 className="w-full text-start text-sm text-gray-500">CLIENTES</h1>
			</div>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR TODOS OS CLIENTES"
				labelTrue="APTO A VISUALIZAR TODOS OS CLIENTES"
				checked={infoHolder.permissoes.clientes.visualizar}
				editable={session.user.permissoes.clientes.visualizar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							clientes: {
								...prev.permissoes.clientes,
								visualizar: value,
							},
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A CRIAR CLIENTES"
				labelTrue="APTO A CRIAR CLIENTES"
				checked={infoHolder.permissoes.clientes.criar}
				editable={session.user.permissoes.clientes.criar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							clientes: { ...prev.permissoes.clientes, criar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A EDITAR CLIENTE"
				labelTrue="APTO A EDITAR CLIENTE"
				checked={infoHolder.permissoes.clientes.editar}
				editable={session.user.permissoes.clientes.editar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							clientes: { ...prev.permissoes.clientes, editar: value },
						},
					}))
				}
			/>
			{/**OPORTUNIDADES */}
			<div className="flex w-full items-center justify-between">
				<h1 className="w-full text-start text-sm text-gray-500">OPORTUNIDADES</h1>
			</div>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR OPORTUNIDADES"
				labelTrue="APTO A VISUALIZAR OPORTUNIDADES"
				checked={infoHolder.permissoes.oportunidades.visualizar}
				editable={session.user.permissoes.oportunidades.visualizar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							oportunidades: { ...prev.permissoes.oportunidades, visualizar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A CRIAR OPORTUNIDADES"
				labelTrue="APTO A CRIAR OPORTUNIDADES"
				checked={infoHolder.permissoes.oportunidades.criar}
				editable={session.user.permissoes.oportunidades.criar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							oportunidades: { ...prev.permissoes.oportunidades, criar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A EDITAR OPORTUNIDADES"
				labelTrue="APTO A EDITAR OPORTUNIDADES"
				checked={infoHolder.permissoes.oportunidades.editar}
				editable={session.user.permissoes.oportunidades.editar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							oportunidades: { ...prev.permissoes.oportunidades, editar: value },
						},
					}))
				}
			/>
			{/**ANÁLISES TÉCNICAS */}
			<div className="flex w-full items-center justify-between">
				<h1 className="w-full text-start text-sm text-gray-500">ANÁLISES TÉCNICAS</h1>
			</div>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR ANÁLISES TÉCNICAS"
				labelTrue="APTO A VISUALIZAR ANÁLISES TÉCNICAS"
				checked={infoHolder.permissoes.analisesTecnicas.visualizar}
				editable={session.user.permissoes.analisesTecnicas.visualizar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							analisesTecnicas: { ...prev.permissoes.analisesTecnicas, visualizar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A CRIAR ANÁLISES TÉCNICAS"
				labelTrue="APTO A CRIAR ANÁLISES TÉCNICAS"
				checked={infoHolder.permissoes.analisesTecnicas.criar}
				editable={session.user.permissoes.analisesTecnicas.criar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							analisesTecnicas: { ...prev.permissoes.analisesTecnicas, criar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A EDITAR ANÁLISES TÉCNICAS"
				labelTrue="APTO A EDITAR ANÁLISES TÉCNICAS"
				checked={infoHolder.permissoes.analisesTecnicas.editar}
				editable={session.user.permissoes.analisesTecnicas.editar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							analisesTecnicas: { ...prev.permissoes.analisesTecnicas, editar: value },
						},
					}))
				}
			/>
			{/**HOMOLOGAÇÕES*/}
			<div className="flex w-full items-center justify-between">
				<h1 className="w-full text-start text-sm text-gray-500">HOMOLOGAÇÕES</h1>
			</div>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR HOMOLOGAÇÕES"
				labelTrue="APTO A VISUALIZAR HOMOLOGAÇÕES"
				checked={infoHolder.permissoes.homologacoes.visualizar}
				editable={session.user.permissoes.homologacoes.visualizar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							homologacoes: { ...prev.permissoes.homologacoes, visualizar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A CRIAR HOMOLOGAÇÕES"
				labelTrue="APTO A CRIAR HOMOLOGAÇÕES"
				checked={infoHolder.permissoes.homologacoes.criar}
				editable={session.user.permissoes.homologacoes.criar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							homologacoes: { ...prev.permissoes.homologacoes, criar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A EDITAR HOMOLOGAÇÕES"
				labelTrue="APTO A EDITAR HOMOLOGAÇÕES"
				checked={infoHolder.permissoes.homologacoes.editar}
				editable={session.user.permissoes.homologacoes.editar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							homologacoes: { ...prev.permissoes.homologacoes, editar: value },
						},
					}))
				}
			/>
			{/**PARCEIROS */}
			<div className="flex w-full items-center justify-between">
				<h1 className="w-full text-start text-sm text-gray-500">PARCEIROS</h1>
			</div>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR PARCEIROS"
				labelTrue="APTO A VISUALIZAR PARCEIROS"
				checked={infoHolder.permissoes.parceiros.visualizar}
				editable={session.user.permissoes.parceiros.visualizar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							parceiros: { ...prev.permissoes.parceiros, visualizar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A CRIAR PARCEIROS"
				labelTrue="APTO A CRIAR PARCEIROS"
				checked={infoHolder.permissoes.parceiros.criar}
				editable={session.user.permissoes.parceiros.criar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							parceiros: { ...prev.permissoes.parceiros, criar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A EDITAR PARCEIROS"
				labelTrue="APTO A EDITAR PARCEIROS"
				checked={infoHolder.permissoes.parceiros.editar}
				editable={session.user.permissoes.parceiros.editar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							parceiros: { ...prev.permissoes.parceiros, editar: value },
						},
					}))
				}
			/>
			{/**PROPOSTAS */}
			<div className="flex w-full items-center justify-between">
				<h1 className="w-full text-start text-sm text-gray-500">PROPOSTAS</h1>
			</div>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR PROPOSTAS"
				labelTrue="APTO A VISUALIZAR PROPOSTAS"
				checked={infoHolder.permissoes.propostas.visualizar}
				editable={session.user.permissoes.propostas.visualizar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							propostas: { ...prev.permissoes.propostas, visualizar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A CRIAR PROPOSTAS"
				labelTrue="APTO A CRIAR PROPOSTAS"
				checked={infoHolder.permissoes.propostas.criar}
				editable={session.user.permissoes.propostas.criar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							propostas: { ...prev.permissoes.propostas, criar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A EDITAR PROPOSTAS"
				labelTrue="APTO A EDITAR PROPOSTAS"
				checked={infoHolder.permissoes.propostas.editar}
				editable={session.user.permissoes.propostas.editar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							propostas: { ...prev.permissoes.propostas, editar: value },
						},
					}))
				}
			/>
			{/**PREÇOS */}
			<h1 className="w-full text-start text-sm text-gray-500">PREÇOS</h1>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR DESCRITIVO DE PRECIFICAÇÃO"
				labelTrue="APTO A VISUALIZAR DESCRITIVO DE PRECIFICAÇÃO"
				checked={infoHolder.permissoes.precos.visualizar}
				editable={session.user.permissoes.precos.visualizar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							precos: { ...prev.permissoes.precos, visualizar: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A EDITAR PRECIFICAÇÃO"
				labelTrue="APTO A EDITAR PRECIFICAÇÃO"
				checked={infoHolder.permissoes.precos.editar}
				editable={session.user.permissoes.precos.editar}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							precos: { ...prev.permissoes.precos, editar: value },
						},
					}))
				}
			/>
			{/**RESULTADOS */}
			<div className="flex w-full items-center justify-between">
				<h1 className="w-full text-start text-sm text-gray-500">RESULTADOS</h1>
			</div>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR RESULTADOS COMERCIAIS"
				labelTrue="APTO A VISUALIZAR RESULTADOS COMERCIAIS"
				checked={infoHolder.permissoes.resultados.visualizarComercial}
				editable={session.user.permissoes.resultados.visualizarComercial}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							resultados: { ...prev.permissoes.resultados, visualizarComercial: value },
						},
					}))
				}
			/>
			<CheckboxInput
				labelFalse="APTO A VISUALIZAR RESULTADOS OPERACIONAIS"
				labelTrue="APTO A VISUALIZAR RESULTADOS OPERACIONAIS"
				checked={infoHolder.permissoes.resultados.visualizarOperacional}
				editable={session.user.permissoes.resultados.visualizarOperacional}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							resultados: { ...prev.permissoes.resultados, visualizarOperacional: value },
						},
					}))
				}
			/>
			<h1 className="w-full text-start text-sm text-gray-500">CONFIGURAÇÕES</h1>
			{session.user.permissoes.configuracoes.parceiro ? (
				<CheckboxInput
					labelFalse="APTO A CONFIGURAR PARCEIRO"
					labelTrue="APTO A CONFIGURAR PARCEIRO"
					checked={infoHolder.permissoes.configuracoes.parceiro}
					justify="justify-start"
					handleChange={(value) =>
						setInfoHolder((prev) => ({
							...prev,
							permissoes: {
								...prev.permissoes,
								configuracoes: { ...prev.permissoes.configuracoes, parceiro: value },
							},
						}))
					}
				/>
			) : null}
			{session.user.permissoes.configuracoes.precificacao ? (
				<CheckboxInput
					labelFalse="APTO A CONFIGURAR MÉTODOS DE PRECIFICAÇÃO"
					labelTrue="APTO A CONFIGURAR MÉTODOS DE PRECIFICAÇÃO"
					checked={infoHolder.permissoes.configuracoes.precificacao}
					editable={session.user.permissoes.configuracoes.precificacao}
					justify="justify-start"
					handleChange={(value) =>
						setInfoHolder((prev) => ({
							...prev,
							permissoes: {
								...prev.permissoes,
								configuracoes: { ...prev.permissoes.configuracoes, precificacao: value },
							},
						}))
					}
				/>
			) : null}
			{session.user.permissoes.configuracoes.funis ? (
				<CheckboxInput
					labelFalse="APTO A CONFIGURAR FUNIS"
					labelTrue="APTO A CONFIGURAR FUNIS"
					checked={infoHolder.permissoes.configuracoes.funis}
					editable={session.user.permissoes.configuracoes.funis}
					justify="justify-start"
					handleChange={(value) =>
						setInfoHolder((prev) => ({
							...prev,
							permissoes: {
								...prev.permissoes,
								configuracoes: { ...prev.permissoes.configuracoes, funis: value },
							},
						}))
					}
				/>
			) : null}
			{session.user.permissoes.configuracoes.metodosPagamento ? (
				<CheckboxInput
					labelFalse="APTO A CONFIGURAR MÉTODOS DE PAGAMENTO"
					labelTrue="APTO A CONFIGURAR MÉTODOS DE PAGAMENTO"
					checked={infoHolder.permissoes.configuracoes.metodosPagamento}
					editable={session.user.permissoes.configuracoes.metodosPagamento}
					justify="justify-start"
					handleChange={(value) =>
						setInfoHolder((prev) => ({
							...prev,
							permissoes: {
								...prev.permissoes,
								configuracoes: { ...prev.permissoes.configuracoes, metodosPagamento: value },
							},
						}))
					}
				/>
			) : null}
			{session.user.permissoes.configuracoes.tiposProjeto ? (
				<CheckboxInput
					labelFalse="APTO A CONFIGURAR TIPOS DE PROJETO"
					labelTrue="APTO A CONFIGURAR TIPOS DE PROJETO"
					checked={infoHolder.permissoes.configuracoes.tiposProjeto}
					editable={session.user.permissoes.configuracoes.tiposProjeto}
					justify="justify-start"
					handleChange={(value) =>
						setInfoHolder((prev) => ({
							...prev,
							permissoes: {
								...prev.permissoes,
								configuracoes: { ...prev.permissoes.configuracoes, tiposProjeto: value },
							},
						}))
					}
				/>
			) : null}
			{session.user.permissoes.configuracoes.gruposUsuarios ? (
				<CheckboxInput
					labelFalse="APTO A CONFIGURAR GRUPOS DE USUÁRIO"
					labelTrue="APTO A CONFIGURAR GRUPOS DE USUÁRIO"
					checked={infoHolder.permissoes.configuracoes.gruposUsuarios}
					editable={session.user.permissoes.configuracoes.gruposUsuarios}
					justify="justify-start"
					handleChange={(value) =>
						setInfoHolder((prev) => ({
							...prev,
							permissoes: {
								...prev.permissoes,
								configuracoes: { ...prev.permissoes.configuracoes, gruposUsuarios: value },
							},
						}))
					}
				/>
			) : null}
			{/**INTEGRAÇÕES */}
			<h1 className="w-full text-start text-sm text-gray-500">INTEGRAÇÕES</h1>
			<CheckboxInput
				labelFalse="APTO A RECEBER LEADS"
				labelTrue="APTO A RECEBER LEADS"
				checked={infoHolder.permissoes.integracoes.receberLeads}
				justify="justify-start"
				handleChange={(value) =>
					setInfoHolder((prev) => ({
						...prev,
						permissoes: {
							...prev.permissoes,
							integracoes: { ...prev.permissoes.integracoes, receberLeads: value },
						},
					}))
				}
			/>
		</>
	);
}

export default UserGroupPermissionsPannel;
