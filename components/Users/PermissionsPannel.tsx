import { useState } from 'react';

import type { TUserSession } from '@/lib/auth/session';
import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants';
import { usePartnersSimplified } from '@/utils/queries/partners';
import type { TUser, TUserDTO } from '@/utils/schemas/user.schema';
import { AnimatePresence, motion } from 'framer-motion';
import { IoMdArrowDropdownCircle } from 'react-icons/io';
import RotativeIconButton from '../Buttons/RotativeIconButton';
import CheckboxInput from '../Inputs/CheckboxInput';
import ScopeSelection from './ScopeSelection';

type PermissionsPannelProps = {
  userInfo: TUser;
  updateUserInfo: (info: Partial<TUser>) => void;
  users?: TUserDTO[];
  referenceId: string | null;
  session: TUserSession;
};
function PermissionsPannel({ userInfo, updateUserInfo, users, referenceId, session }: PermissionsPannelProps) {
  const [pannelIsOpen, setPannelIsOpen] = useState<boolean>(true);
  const { data: partners } = usePartnersSimplified();
  return (
    <div className='flex w-full flex-col gap-2 rounded-sm border border-blue-500'>
      <AnimatePresence>
        <div className='flex w-full items-center justify-center gap-1 rounded-sm bg-blue-500 p-2 text-primary-foreground'>
          <h1 className='text-sm font-medium text-primary-foreground'>PAINEL DE PERMISSÕES</h1>
          <RotativeIconButton active={pannelIsOpen} setActive={setPannelIsOpen} icon={<IoMdArrowDropdownCircle size={20} />} />
        </div>
        {pannelIsOpen ? (
          <motion.div
            key={'pannel'}
            variants={GeneralVisibleHiddenExitMotionVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='mt-1 flex w-full flex-col gap-4 bg-transparent p-2'
          >
            <div className='w-full flex flex-col gap-4'>
              <h1 className='w-full text-start text-sm text-primary/70'>USUÁRIOS</h1>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR TODOS OS USUÁRIOS'
                  labelTrue='APTO A VISUALIZAR TODOS OS USUÁRIOS'
                  checked={userInfo.permissoes.usuarios.visualizar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        usuarios: {
                          ...userInfo.permissoes.usuarios,
                          visualizar: value,
                        },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A CRIAR USUÁRIOS'
                  labelTrue='APTO A CRIAR USUÁRIOS'
                  checked={userInfo.permissoes.usuarios.criar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        usuarios: { ...userInfo.permissoes.usuarios, criar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A EDITAR USUÁRIOS'
                  labelTrue='APTO A EDITAR USUÁRIOS'
                  checked={userInfo.permissoes.usuarios.editar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        usuarios: { ...userInfo.permissoes.usuarios, editar: value },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className='w-full flex flex-col gap-4'>
              <h1 className='w-full text-start text-sm text-primary/70'>COMISSÕES</h1>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR COMISSÕES'
                  labelTrue='APTO A VISUALIZAR COMISSÕES'
                  checked={userInfo.permissoes.comissoes.visualizar}
                  editable={session.user.permissoes.comissoes.visualizar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        comissoes: { ...userInfo.permissoes.comissoes, visualizar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A EDITAR COMISSÕES'
                  labelTrue='APTO A EDITAR COMISSÕES'
                  checked={userInfo.permissoes.comissoes.editar}
                  editable={session.user.permissoes.comissoes.editar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        comissoes: { ...userInfo.permissoes.comissoes, editar: value },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className='w-full flex flex-col gap-4'>
              <h1 className='w-full text-start text-sm text-primary/70'>KITS</h1>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR TODOS OS KITS'
                  labelTrue='APTO A VISUALIZAR TODOS OS KITS'
                  checked={userInfo.permissoes.kits.visualizar}
                  editable={session.user.permissoes.kits.visualizar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        kits: { ...userInfo.permissoes.kits, visualizar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A CRIAR KITS'
                  labelTrue='APTO A CRIAR KITS'
                  checked={userInfo.permissoes.kits.criar}
                  editable={session.user.permissoes.kits.criar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        kits: { ...userInfo.permissoes.kits, criar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A EDITAR KITS'
                  labelTrue='APTO A EDITAR KITS'
                  checked={userInfo.permissoes.kits.editar}
                  editable={session.user.permissoes.kits.editar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        kits: { ...userInfo.permissoes.kits, editar: value },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className='w-full flex flex-col gap-4'>
              <h1 className='w-full text-start text-sm text-primary/70'>PRODUTOS</h1>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR TODOS OS PRODUTOS'
                  labelTrue='APTO A VISUALIZAR TODOS OS PRODUTOS'
                  checked={userInfo.permissoes.produtos.visualizar}
                  editable={session.user.permissoes.produtos.visualizar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        produtos: { ...userInfo.permissoes.produtos, visualizar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A CRIAR PRODUTOS'
                  labelTrue='APTO A CRIAR PRODUTOS'
                  checked={userInfo.permissoes.produtos.criar}
                  editable={session.user.permissoes.produtos.criar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        produtos: { ...userInfo.permissoes.produtos, criar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A EDITAR PRODUTOS'
                  labelTrue='APTO A EDITAR PRODUTOS'
                  checked={userInfo.permissoes.produtos.editar}
                  editable={session.user.permissoes.produtos.editar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        produtos: { ...userInfo.permissoes.produtos, editar: value },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className='w-full flex flex-col gap-4'>
              <h1 className='w-full text-start text-sm text-primary/70'>SERVIÇOS</h1>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR TODOS OS SERVIÇOS'
                  labelTrue='APTO A VISUALIZAR TODOS OS SERVIÇOS'
                  checked={userInfo.permissoes.servicos.visualizar}
                  editable={session.user.permissoes.servicos.visualizar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        servicos: { ...userInfo.permissoes.servicos, visualizar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A CRIAR SERVIÇOS'
                  labelTrue='APTO A CRIAR SERVIÇOS'
                  checked={userInfo.permissoes.servicos.criar}
                  editable={session.user.permissoes.servicos.criar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        servicos: { ...userInfo.permissoes.servicos, criar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A EDITAR SERVIÇOS'
                  labelTrue='APTO A EDITAR SERVIÇOS'
                  checked={userInfo.permissoes.servicos.editar}
                  editable={session.user.permissoes.servicos.editar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        servicos: { ...userInfo.permissoes.servicos, editar: value },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className='w-full flex flex-col gap-4'>
              <h1 className='w-full text-start text-sm text-primary/70'>PLANOS</h1>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR TODOS OS PLANOS'
                  labelTrue='APTO A VISUALIZAR TODOS OS PLANOS'
                  checked={userInfo.permissoes.planos.visualizar}
                  editable={session.user.permissoes.planos.visualizar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        planos: { ...userInfo.permissoes.planos, visualizar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A CRIAR PLANOS'
                  labelTrue='APTO A CRIAR PLANOS'
                  checked={userInfo.permissoes.planos.criar}
                  editable={session.user.permissoes.planos.criar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        planos: { ...userInfo.permissoes.planos, criar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A EDITAR PLANOS'
                  labelTrue='APTO A EDITAR PLANOS'
                  checked={userInfo.permissoes.planos.editar}
                  editable={session.user.permissoes.planos.editar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        planos: { ...userInfo.permissoes.planos, editar: value },
                      },
                    })
                  }
                />
              </div>
            </div>
            <div className='w-full flex flex-col gap-4'>
              <div className='flex w-full items-center lg:justify-between justify-center flex-col lg:flex-row gap-1'>
                <h1 className='w-full text-start text-sm text-primary/70'>CLIENTES</h1>
                <ScopeSelection
                  options={users?.map((u) => ({ id: u._id, label: u.nome, image_url: u.avatar_url })) || []}
                  referenceId={referenceId}
                  selected={userInfo.permissoes.clientes.escopo}
                  handleScopeSelection={(selected) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, clientes: { ...userInfo.permissoes.clientes, escopo: selected } },
                    })
                  }
                />
              </div>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR TODOS OS CLIENTES'
                  labelTrue='APTO A VISUALIZAR TODOS OS CLIENTES'
                  checked={userInfo.permissoes.clientes.visualizar}
                  editable={session.user.permissoes.clientes.visualizar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, clientes: { ...userInfo.permissoes.clientes, visualizar: value } },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A CRIAR CLIENTES'
                  labelTrue='APTO A CRIAR CLIENTES'
                  checked={userInfo.permissoes.clientes.criar}
                  editable={session.user.permissoes.clientes.criar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, clientes: { ...userInfo.permissoes.clientes, criar: value } },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A EDITAR CLIENTE'
                  labelTrue='APTO A EDITAR CLIENTE'
                  checked={userInfo.permissoes.clientes.editar}
                  editable={session.user.permissoes.clientes.editar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, clientes: { ...userInfo.permissoes.clientes, editar: value } },
                    })
                  }
                />
              </div>
            </div>

            <div className='w-full flex flex-col gap-4'>
              <div className='flex w-full items-center lg:justify-between justify-center flex-col lg:flex-row gap-1'>
                <h1 className='w-full text-start text-sm text-primary/70'>OPORTUNIDADES</h1>
                <ScopeSelection
                  options={users?.map((u) => ({ id: u._id, label: u.nome, image_url: u.avatar_url })) || []}
                  referenceId={referenceId}
                  selected={userInfo.permissoes.oportunidades.escopo}
                  handleScopeSelection={(selected) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, oportunidades: { ...userInfo.permissoes.oportunidades, escopo: selected } },
                    })
                  }
                />
              </div>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR OPORTUNIDADES'
                  labelTrue='APTO A VISUALIZAR OPORTUNIDADES'
                  checked={userInfo.permissoes.oportunidades.visualizar}
                  editable={session.user.permissoes.oportunidades.visualizar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        oportunidades: { ...userInfo.permissoes.oportunidades, visualizar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A CRIAR OPORTUNIDADES'
                  labelTrue='APTO A CRIAR OPORTUNIDADES'
                  checked={userInfo.permissoes.oportunidades.criar}
                  editable={session.user.permissoes.oportunidades.criar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        oportunidades: { ...userInfo.permissoes.oportunidades, criar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A EDITAR OPORTUNIDADES'
                  labelTrue='APTO A EDITAR OPORTUNIDADES'
                  checked={userInfo.permissoes.oportunidades.editar}
                  editable={session.user.permissoes.oportunidades.editar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        oportunidades: { ...userInfo.permissoes.oportunidades, editar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A EXCLUIR OPORTUNIDADES'
                  labelTrue='APTO A EXCLUIR OPORTUNIDADES'
                  checked={!!userInfo.permissoes.oportunidades.excluir}
                  editable={!!session.user.permissoes.oportunidades?.excluir}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, oportunidades: { ...userInfo.permissoes.oportunidades, excluir: value } },
                    })
                  }
                />
              </div>
            </div>

            <div className='w-full flex flex-col gap-4'>
              <div className='flex w-full items-center lg:justify-between justify-center flex-col lg:flex-row gap-1'>
                <h1 className='w-full text-start text-sm text-primary/70'>ANÁLISES TÉCNICAS</h1>
                <ScopeSelection
                  options={users?.map((u) => ({ id: u._id, label: u.nome, image_url: u.avatar_url })) || []}
                  referenceId={referenceId}
                  selected={userInfo.permissoes.analisesTecnicas.escopo}
                  handleScopeSelection={(selected) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, analisesTecnicas: { ...userInfo.permissoes.analisesTecnicas, escopo: selected } },
                    })
                  }
                />
              </div>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR ANÁLISES TÉCNICAS'
                  labelTrue='APTO A VISUALIZAR ANÁLISES TÉCNICAS'
                  checked={userInfo.permissoes.analisesTecnicas.visualizar}
                  editable={session.user.permissoes.analisesTecnicas.visualizar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        analisesTecnicas: { ...userInfo.permissoes.analisesTecnicas, visualizar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A CRIAR ANÁLISES TÉCNICAS'
                  labelTrue='APTO A CRIAR ANÁLISES TÉCNICAS'
                  checked={userInfo.permissoes.analisesTecnicas.criar}
                  editable={session.user.permissoes.analisesTecnicas.criar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        analisesTecnicas: { ...userInfo.permissoes.analisesTecnicas, criar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A EDITAR ANÁLISES TÉCNICAS'
                  labelTrue='APTO A EDITAR ANÁLISES TÉCNICAS'
                  checked={userInfo.permissoes.analisesTecnicas.editar}
                  editable={session.user.permissoes.analisesTecnicas.editar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        analisesTecnicas: { ...userInfo.permissoes.analisesTecnicas, editar: value },
                      },
                    })
                  }
                />
              </div>
            </div>
            <div className='w-full flex flex-col gap-4'>
              <div className='flex w-full items-center lg:justify-between justify-center flex-col lg:flex-row gap-1'>
                <h1 className='w-full text-start text-sm text-primary/70'>HOMOLOGAÇÕES</h1>
                <ScopeSelection
                  options={users?.map((u) => ({ id: u._id, label: u.nome, image_url: u.avatar_url })) || []}
                  referenceId={referenceId}
                  selected={userInfo.permissoes.homologacoes.escopo}
                  handleScopeSelection={(selected) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, homologacoes: { ...userInfo.permissoes.homologacoes, escopo: selected } },
                    })
                  }
                />
              </div>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR HOMOLOGAÇÕES'
                  labelTrue='APTO A VISUALIZAR HOMOLOGAÇÕES'
                  checked={userInfo.permissoes.homologacoes.visualizar}
                  editable={session.user.permissoes.homologacoes.visualizar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        homologacoes: { ...userInfo.permissoes.homologacoes, visualizar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A CRIAR HOMOLOGAÇÕES'
                  labelTrue='APTO A CRIAR HOMOLOGAÇÕES'
                  checked={userInfo.permissoes.homologacoes.criar}
                  editable={session.user.permissoes.homologacoes.criar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        homologacoes: { ...userInfo.permissoes.homologacoes, criar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A EDITAR HOMOLOGAÇÕES'
                  labelTrue='APTO A EDITAR HOMOLOGAÇÕES'
                  checked={userInfo.permissoes.homologacoes.editar}
                  editable={session.user.permissoes.homologacoes.editar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        homologacoes: { ...userInfo.permissoes.homologacoes, editar: value },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className='w-full flex flex-col gap-4'>
              <div className='flex w-full items-center lg:justify-between justify-center flex-col lg:flex-row gap-1'>
                <h1 className='w-full text-start text-sm text-primary/70'>PARCEIROS</h1>
                <ScopeSelection
                  options={partners?.map((p) => ({ id: p._id, label: p.nome, image_url: p.logo_url })) || []}
                  referenceId={userInfo.idParceiro || null}
                  selected={userInfo.permissoes.parceiros.escopo}
                  handleScopeSelection={(selected) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, parceiros: { ...userInfo.permissoes.parceiros, escopo: selected } },
                    })
                  }
                />
              </div>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR PARCEIROS'
                  labelTrue='APTO A VISUALIZAR PARCEIROS'
                  checked={userInfo.permissoes.parceiros.visualizar}
                  editable={session.user.permissoes.parceiros.visualizar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        parceiros: { ...userInfo.permissoes.parceiros, visualizar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A CRIAR PARCEIROS'
                  labelTrue='APTO A CRIAR PARCEIROS'
                  checked={userInfo.permissoes.parceiros.criar}
                  editable={session.user.permissoes.parceiros.criar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        parceiros: { ...userInfo.permissoes.parceiros, criar: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A EDITAR PARCEIROS'
                  labelTrue='APTO A EDITAR PARCEIROS'
                  checked={userInfo.permissoes.parceiros.editar}
                  editable={session.user.permissoes.parceiros.editar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        parceiros: { ...userInfo.permissoes.parceiros, editar: value },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className='w-full flex flex-col gap-4'>
              <div className='flex w-full items-center lg:justify-between justify-center flex-col lg:flex-row gap-1'>
                <h1 className='w-full text-start text-sm text-primary/70'>PROPOSTAS</h1>
                <ScopeSelection
                  options={users?.map((u) => ({ id: u._id, label: u.nome, image_url: u.avatar_url })) || []}
                  referenceId={referenceId}
                  selected={userInfo.permissoes.propostas.escopo}
                  handleScopeSelection={(selected) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, propostas: { ...userInfo.permissoes.propostas, escopo: selected } },
                    })
                  }
                />
              </div>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR PROPOSTAS'
                  labelTrue='APTO A VISUALIZAR PROPOSTAS'
                  checked={userInfo.permissoes.propostas.visualizar}
                  editable={session.user.permissoes.propostas.visualizar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, propostas: { ...userInfo.permissoes.propostas, visualizar: value } },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A CRIAR PROPOSTAS'
                  labelTrue='APTO A CRIAR PROPOSTAS'
                  checked={userInfo.permissoes.propostas.criar}
                  editable={session.user.permissoes.propostas.criar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, propostas: { ...userInfo.permissoes.propostas, criar: value } },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A EDITAR PROPOSTAS'
                  labelTrue='APTO A EDITAR PROPOSTAS'
                  checked={userInfo.permissoes.propostas.editar}
                  editable={session.user.permissoes.propostas.editar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, propostas: { ...userInfo.permissoes.propostas, editar: value } },
                    })
                  }
                />
              </div>
            </div>

            <div className='w-full flex flex-col gap-4'>
              <h1 className='w-full text-start text-sm text-primary/70'>PREÇOS</h1>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR DESCRITIVO DE PRECIFICAÇÃO'
                  labelTrue='APTO A VISUALIZAR DESCRITIVO DE PRECIFICAÇÃO'
                  checked={userInfo.permissoes.precos.visualizar}
                  editable={session.user.permissoes.precos.visualizar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, precos: { ...userInfo.permissoes.precos, visualizar: value } },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A EDITAR PRECIFICAÇÃO'
                  labelTrue='APTO A EDITAR PRECIFICAÇÃO'
                  checked={userInfo.permissoes.precos.editar}
                  editable={session.user.permissoes.precos.editar}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, precos: { ...userInfo.permissoes.precos, editar: value } },
                    })
                  }
                />
              </div>
            </div>

            <div className='w-full flex flex-col gap-4'>
              <div className='flex w-full items-center lg:justify-between justify-center flex-col lg:flex-row gap-1'>
                <h1 className='w-full text-start text-sm text-primary/70'>RESULTADOS</h1>
                <ScopeSelection
                  options={users?.map((u) => ({ id: u._id, label: u.nome, image_url: u.avatar_url })) || []}
                  referenceId={referenceId}
                  selected={userInfo.permissoes.resultados.escopo}
                  handleScopeSelection={(selected) =>
                    updateUserInfo({
                      permissoes: { ...userInfo.permissoes, resultados: { ...userInfo.permissoes.resultados, escopo: selected } },
                    })
                  }
                />
              </div>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR RESULTADOS COMERCIAIS'
                  labelTrue='APTO A VISUALIZAR RESULTADOS COMERCIAIS'
                  checked={userInfo.permissoes.resultados.visualizarComercial}
                  editable={session.user.permissoes.resultados.visualizarComercial}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        resultados: { ...userInfo.permissoes.resultados, visualizarComercial: value },
                      },
                    })
                  }
                />
                <CheckboxInput
                  labelFalse='APTO A VISUALIZAR RESULTADOS OPERACIONAIS'
                  labelTrue='APTO A VISUALIZAR RESULTADOS OPERACIONAIS'
                  checked={userInfo.permissoes.resultados.visualizarOperacional}
                  editable={session.user.permissoes.resultados.visualizarOperacional}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        resultados: { ...userInfo.permissoes.resultados, visualizarOperacional: value },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className='w-full flex flex-col gap-4'>
              <h1 className='w-full text-start text-sm text-primary/70'>CONFIGURAÇÕES</h1>
              <div className='w-full flex flex-col gap-2'>
                {session.user.permissoes.configuracoes.parceiro ? (
                  <CheckboxInput
                    labelFalse='APTO A CONFIGURAR PARCEIRO'
                    labelTrue='APTO A CONFIGURAR PARCEIRO'
                    checked={userInfo.permissoes.configuracoes.parceiro}
                    justify='justify-start'
                    handleChange={(value) =>
                      updateUserInfo({
                        permissoes: {
                          ...userInfo.permissoes,
                          configuracoes: { ...userInfo.permissoes.configuracoes, parceiro: value },
                        },
                      })
                    }
                  />
                ) : null}
                {session.user.permissoes.configuracoes.precificacao ? (
                  <CheckboxInput
                    labelFalse='APTO A CONFIGURAR MÉTODOS DE PRECIFICAÇÃO'
                    labelTrue='APTO A CONFIGURAR MÉTODOS DE PRECIFICAÇÃO'
                    checked={userInfo.permissoes.configuracoes.precificacao}
                    editable={session.user.permissoes.configuracoes.precificacao}
                    justify='justify-start'
                    handleChange={(value) =>
                      updateUserInfo({
                        permissoes: {
                          ...userInfo.permissoes,
                          configuracoes: { ...userInfo.permissoes.configuracoes, precificacao: value },
                        },
                      })
                    }
                  />
                ) : null}
                {session.user.permissoes.configuracoes.funis ? (
                  <CheckboxInput
                    labelFalse='APTO A CONFIGURAR FUNIS'
                    labelTrue='APTO A CONFIGURAR FUNIS'
                    checked={userInfo.permissoes.configuracoes.funis}
                    editable={session.user.permissoes.configuracoes.funis}
                    justify='justify-start'
                    handleChange={(value) =>
                      updateUserInfo({
                        permissoes: {
                          ...userInfo.permissoes,
                          configuracoes: { ...userInfo.permissoes.configuracoes, funis: value },
                        },
                      })
                    }
                  />
                ) : null}
                {session.user.permissoes.configuracoes.metodosPagamento ? (
                  <CheckboxInput
                    labelFalse='APTO A CONFIGURAR MÉTODOS DE PAGAMENTO'
                    labelTrue='APTO A CONFIGURAR MÉTODOS DE PAGAMENTO'
                    checked={userInfo.permissoes.configuracoes.metodosPagamento}
                    editable={session.user.permissoes.configuracoes.metodosPagamento}
                    justify='justify-start'
                    handleChange={(value) =>
                      updateUserInfo({
                        permissoes: {
                          ...userInfo.permissoes,
                          configuracoes: { ...userInfo.permissoes.configuracoes, metodosPagamento: value },
                        },
                      })
                    }
                  />
                ) : null}
                {session.user.permissoes.configuracoes.tiposProjeto ? (
                  <CheckboxInput
                    labelFalse='APTO A CONFIGURAR TIPOS DE PROJETO'
                    labelTrue='APTO A CONFIGURAR TIPOS DE PROJETO'
                    checked={userInfo.permissoes.configuracoes.tiposProjeto}
                    editable={session.user.permissoes.configuracoes.tiposProjeto}
                    justify='justify-start'
                    handleChange={(value) =>
                      updateUserInfo({
                        permissoes: {
                          ...userInfo.permissoes,
                          configuracoes: { ...userInfo.permissoes.configuracoes, tiposProjeto: value },
                        },
                      })
                    }
                  />
                ) : null}
                {session.user.permissoes.configuracoes.gruposUsuarios ? (
                  <CheckboxInput
                    labelFalse='APTO A CONFIGURAR GRUPOS DE USUÁRIO'
                    labelTrue='APTO A CONFIGURAR GRUPOS DE USUÁRIO'
                    checked={userInfo.permissoes.configuracoes.gruposUsuarios}
                    editable={session.user.permissoes.configuracoes.gruposUsuarios}
                    justify='justify-start'
                    handleChange={(value) =>
                      updateUserInfo({
                        permissoes: {
                          ...userInfo.permissoes,
                          configuracoes: { ...userInfo.permissoes.configuracoes, gruposUsuarios: value },
                        },
                      })
                    }
                  />
                ) : null}
              </div>
            </div>

            <div className='w-full flex flex-col gap-4'>
              <h1 className='w-full text-start text-sm text-primary/70'>INTEGRAÇÕES</h1>
              <div className='w-full flex flex-col gap-2'>
                <CheckboxInput
                  labelFalse='APTO A RECEBER LEADS'
                  labelTrue='APTO A RECEBER LEADS'
                  checked={userInfo.permissoes.integracoes.receberLeads}
                  justify='justify-start'
                  handleChange={(value) =>
                    updateUserInfo({
                      permissoes: {
                        ...userInfo.permissoes,
                        integracoes: { ...userInfo.permissoes.integracoes, receberLeads: value },
                      },
                    })
                  }
                />
              </div>
            </div>
          </motion.div>
        ) : null}
        {/**USUÁRIOS */}
      </AnimatePresence>
    </div>
  );
}

export default PermissionsPannel;
