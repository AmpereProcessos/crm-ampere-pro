import { useQueryClient } from '@tanstack/react-query';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { BsCheckLg } from 'react-icons/bs';

import { LoadingButton } from '@/components/Buttons/loading-button';
import SelectInput from '@/components/Inputs/SelectInput';
import SelectWithImages from '@/components/Inputs/SelectWithImages';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import ComissionPannel from '@/components/Users/ComissionPannel';
import type { TUserSession } from '@/lib/auth/session';
import { getErrorMessage } from '@/lib/methods/errors';
import { useMediaQuery } from '@/lib/utils';
import { storage } from '@/services/firebase/storage-config';
import { formatToPhone } from '@/utils/methods';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { editUser } from '@/utils/mutations/users';
import { usePartnersSimplified } from '@/utils/queries/partners';
import { useUserGroups } from '@/utils/queries/user-groups';
import { useUserById, useUsers } from '@/utils/queries/users';
import type { TUser, TUserDTO } from '@/utils/schemas/user.schema';
import CheckboxInput from '../../Inputs/CheckboxInput';
import TextInput from '../../Inputs/TextInput';
import PermissionsPannel from '../../Users/PermissionsPannel';
import ErrorComponent from '../../utils/ErrorComponent';
import LoadingComponent from '../../utils/LoadingComponent';
type EditUserProps = {
  closeModal: () => void;
  userId: string;
  partnerId: string;
  session: TUserSession;
};

function EditUser({ closeModal, userId, partnerId, session }: EditUserProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const queryClient = useQueryClient();
  const { data: user, isLoading, isError, isSuccess, error } = useUserById({ id: userId });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  function updateAvatarFile(file: File | null) {
    setAvatarFile(file);
  }
  const [userInfo, setUserInfo] = useState<TUserDTO>({
    _id: 'id-holder',
    nome: '',
    administrador: false,
    telefone: '',
    email: '',
    senha: '',
    avatar_url: null,
    idParceiro: partnerId,
    idGrupo: '',
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
    comissionamento: [],
    ativo: true,
    dataInsercao: new Date().toISOString(),
  });
  function updateUserInfo(info: Partial<TUserDTO>) {
    setUserInfo((prev) => ({ ...prev, ...info }));
  }

  async function handleUserUpdate({ userInfo, avatarFile }: { userInfo: TUserDTO; avatarFile: File | null }) {
    try {
      let avatar_url = userInfo.avatar_url;
      if (userInfo.nome.trim().length < 3) return toast.error('Preencha um nome de ao menos 3 caracteres.');
      if (avatarFile) {
        const storageName = `saas-crm/usuarios/${userInfo.nome}`;
        const fileRef = ref(storage, storageName);
        const firebaseResponse = await uploadBytes(fileRef, avatarFile);
        const fileUrl = await getDownloadURL(ref(storage, firebaseResponse.metadata.fullPath));
        avatar_url = fileUrl;
      }
      const response = await editUser({ userId: userId, changes: { ...userInfo, avatar_url: avatar_url } });
      return response;
    } catch (error) {
      console.log('Error running handleUserUpdate', error);
      throw error;
    }
  }
  const { mutate, isPending } = useMutationWithFeedback({
    mutationKey: ['edit-user', userId],
    mutationFn: handleUserUpdate,
    affectedQueryKey: ['user-by-id', userId],
    queryClient: queryClient,
    callbackFn: async () => await queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
  useEffect(() => {
    if (user) setUserInfo(user);
  }, [user]);
  const MENU_TITLE = 'EDITAR USUÁRIO';
  const MENU_DESCRIPTION = 'Preencha os campos abaixo para editar o usuário.';
  const BUTTON_TEXT = 'ATUALIZAR USUÁRIO';
  return isDesktop ? (
    <Dialog open onOpenChange={(v) => (!v ? closeModal() : null)}>
      <DialogContent className='flex flex-col h-fit min-h-[60vh] max-h-[70vh] dark:bg-background min-w-[60%]'>
        <DialogHeader>
          <DialogTitle>{MENU_TITLE}</DialogTitle>
          <DialogDescription>{MENU_DESCRIPTION}</DialogDescription>
        </DialogHeader>
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
        {isSuccess ? (
          <>
            <div className='flex-1 overflow-auto'>
              <UseDataContent
                userId={userId}
                session={session}
                userInfo={userInfo}
                updateUserInfo={updateUserInfo}
                avatarFile={avatarFile}
                updateAvatarFile={updateAvatarFile}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline'>FECHAR</Button>
              </DialogClose>
              <LoadingButton onClick={() => mutate({ userInfo: userInfo, avatarFile: avatarFile })} loading={isPending}>
                {BUTTON_TEXT}
              </LoadingButton>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open onOpenChange={(v) => (!v ? closeModal() : null)}>
      <DrawerContent className='h-fit max-h-[70vh] flex flex-col'>
        <DrawerHeader className='text-left'>
          <DrawerTitle>{MENU_TITLE}</DrawerTitle>
          <DrawerDescription>{MENU_DESCRIPTION}</DrawerDescription>
        </DrawerHeader>

        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
        {isSuccess ? (
          <>
            <div className='flex-1 overflow-auto'>
              <UseDataContent
                userId={userId}
                session={session}
                userInfo={userInfo}
                updateUserInfo={updateUserInfo}
                avatarFile={avatarFile}
                updateAvatarFile={updateAvatarFile}
              />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant='outline'>FECHAR</Button>
              </DrawerClose>
              <LoadingButton onClick={() => mutate({ userInfo: userInfo, avatarFile: avatarFile })} loading={isPending}>
                {BUTTON_TEXT}
              </LoadingButton>
            </DrawerFooter>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

export default EditUser;

type UseDataContentProps = {
  userId: string;
  session: TUserSession;
  userInfo: TUser;
  updateUserInfo: (info: Partial<TUser>) => void;
  avatarFile: File | null;
  updateAvatarFile: (file: File | null) => void;
};
function UseDataContent({ userId, session, userInfo, updateUserInfo, avatarFile, updateAvatarFile }: UseDataContentProps) {
  const { data: partners } = usePartnersSimplified();
  const { data: groups } = useUserGroups();
  const { data: users } = useUsers();

  return (
    <div className='w-full h-full flex flex-col gap-6'>
      <div className='my-2 flex w-full items-center justify-center'>
        <div className='w-fit'>
          <CheckboxInput
            labelFalse='USUÁRIO ATIVO'
            labelTrue='USUÁRIO ATIVO'
            checked={userInfo.ativo}
            handleChange={(value) => updateUserInfo({ ativo: value })}
          />
        </div>
      </div>
      <div className='flex h-[200px]  flex-col items-center justify-center'>
        {!avatarFile && userInfo.avatar_url ? (
          <div className='relative mb-3 h-[120px] w-[120px] cursor-pointer rounded-full'>
            <Image
              src={userInfo.avatar_url}
              // width={96}
              // height={96}
              fill={true}
              alt='AVATAR'
              style={{
                borderRadius: '100%',
                objectFit: 'cover',
                position: 'absolute',
              }}
            />
            <input
              onChange={(e) => {
                if (e.target.files) updateAvatarFile(e.target.files[0]);
              }}
              className='h-full w-full opacity-0'
              type='file'
              accept='image/png, image/jpeg'
            />
          </div>
        ) : avatarFile ? (
          <div className='relative mb-3 flex h-[120px] w-[120px] cursor-pointer items-center justify-center rounded-full bg-primary/30'>
            <div className='absolute flex items-center justify-center'>
              <BsCheckLg style={{ color: 'green', fontSize: '25px' }} />
            </div>
            <input
              onChange={(e) => {
                if (e.target.files) updateAvatarFile(e.target.files[0]);
              }}
              className='h-full w-full opacity-0'
              type='file'
              accept='image/png, image/jpeg'
            />
          </div>
        ) : (
          <div className='relative flex h-[120px] w-[120px] items-center justify-center rounded-full border border-primary/30 bg-primary/30'>
            {avatarFile ? (
              <div className='absolute flex items-center justify-center'>
                <BsCheckLg style={{ color: 'green', fontSize: '25px' }} />
              </div>
            ) : (
              <p className='absolute w-full text-center text-xs font-bold text-primary/70'>ESCOLHA UMA IMAGEM</p>
            )}

            <input
              onChange={(e) => {
                if (e.target.files) updateAvatarFile(e.target.files[0]);
              }}
              className='h-full w-full opacity-0'
              type='file'
              accept='.png, .jpeg'
            />
          </div>
        )}
      </div>
      <div className='grid w-full grid-cols-1 grid-rows-2 items-center gap-2 lg:grid-cols-2 lg:grid-rows-1'>
        <TextInput
          label='NOME E SOBRENOME'
          value={userInfo.nome}
          placeholder='Preencha aqui o nome do usuário.'
          handleChange={(value) =>
            updateUserInfo({
              nome: value,
            })
          }
          width='100%'
        />
        <TextInput
          label='EMAIL'
          value={userInfo.email}
          placeholder='Preencha aqui o email do usuário.'
          handleChange={(value) =>
            updateUserInfo({
              email: value,
            })
          }
          width='100%'
        />
      </div>
      <div className='grid w-full grid-cols-1 grid-rows-2 items-center gap-2 lg:grid-cols-2 lg:grid-rows-1'>
        <TextInput
          label='TELEFONE'
          value={userInfo.telefone || ''}
          placeholder='Preencha aqui o telefone do usuário.'
          handleChange={(value) =>
            updateUserInfo({
              telefone: formatToPhone(value),
            })
          }
          width='100%'
        />
        <TextInput
          label='SENHA'
          value={userInfo.senha}
          placeholder='Preencha aqui o senha do usuário.'
          handleChange={(value) =>
            updateUserInfo({
              senha: value,
            })
          }
          width='100%'
        />
      </div>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full items-center'>
          <SelectWithImages
            label='PARCEIRO'
            value={userInfo.idParceiro}
            handleChange={(value) => updateUserInfo({ idParceiro: value })}
            options={partners?.map((p) => ({ id: p._id, label: p.nome, value: p._id, url: p.logo_url || undefined })) || []}
            resetOptionLabel='NÃO DEFINIDO'
            onReset={() => updateUserInfo({ idParceiro: partners ? partners[0]._id : '' })}
            width='100%'
          />
        </div>
        <SelectInput
          label='GRUPO DE PERMISSÃO'
          options={
            groups?.map((role) => {
              return {
                id: role._id,
                label: role.titulo,
                value: role._id,
              };
            }) || []
          }
          resetOptionLabel='NÃO DEFINIDO'
          value={userInfo.idGrupo}
          handleChange={(value) => {
            const group = groups?.find((g) => g._id === value);
            if (!group) return;
            const permissions: TUser['permissoes'] = {
              usuarios: {
                visualizar: session.user.permissoes.usuarios.visualizar
                  ? group.permissoes.usuarios.visualizar
                  : session.user.permissoes.usuarios.visualizar,
                criar: session.user.permissoes.usuarios.criar ? group.permissoes.usuarios.criar : session.user.permissoes.usuarios.criar,
                editar: session.user.permissoes.usuarios.editar ? group.permissoes.usuarios.editar : session.user.permissoes.usuarios.editar,
              },
              comissoes: {
                visualizar: session.user.permissoes.comissoes.visualizar
                  ? group.permissoes.comissoes.visualizar
                  : session.user.permissoes.comissoes.visualizar,
                editar: session.user.permissoes.comissoes.editar ? group.permissoes.comissoes.editar : session.user.permissoes.comissoes.editar,
              },
              kits: {
                visualizar: session.user.permissoes.kits.visualizar ? group.permissoes.kits.visualizar : session.user.permissoes.kits.visualizar,
                editar: session.user.permissoes.kits.editar ? group.permissoes.kits.editar : session.user.permissoes.kits.editar,
                criar: session.user.permissoes.kits.criar ? group.permissoes.kits.criar : session.user.permissoes.kits.criar,
              },
              produtos: {
                visualizar: session.user.permissoes.produtos.visualizar
                  ? group.permissoes.produtos.visualizar
                  : session.user.permissoes.produtos.visualizar,
                editar: session.user.permissoes.produtos.editar ? group.permissoes.produtos.editar : session.user.permissoes.produtos.editar,
                criar: session.user.permissoes.produtos.criar ? group.permissoes.produtos.criar : session.user.permissoes.produtos.visualizar,
              },
              servicos: {
                visualizar: session.user.permissoes.servicos.visualizar
                  ? group.permissoes.servicos.visualizar
                  : session.user.permissoes.servicos.visualizar,
                editar: session.user.permissoes.servicos.editar ? group.permissoes.servicos.editar : session.user.permissoes.servicos.editar,
                criar: session.user.permissoes.servicos.criar ? group.permissoes.servicos.criar : session.user.permissoes.servicos.criar,
              },
              planos: {
                visualizar: session.user.permissoes.planos.visualizar
                  ? group.permissoes.planos.visualizar
                  : session.user.permissoes.planos.visualizar,
                editar: session.user.permissoes.planos.editar ? group.permissoes.planos.editar : session.user.permissoes.planos.editar,
                criar: session.user.permissoes.planos.criar ? group.permissoes.planos.criar : session.user.permissoes.planos.criar,
              },
              propostas: {
                escopo: [userId],
                visualizar: session.user.permissoes.propostas.visualizar
                  ? group.permissoes.propostas.visualizar
                  : session.user.permissoes.propostas.visualizar,
                editar: session.user.permissoes.propostas.editar ? group.permissoes.propostas.editar : session.user.permissoes.propostas.editar,
                criar: session.user.permissoes.propostas.criar ? group.permissoes.propostas.criar : session.user.permissoes.propostas.criar,
              },
              oportunidades: {
                escopo: [userId], // refere-se ao escopo de atuação
                visualizar: session.user.permissoes.oportunidades.visualizar
                  ? group.permissoes.oportunidades.visualizar
                  : session.user.permissoes.oportunidades.visualizar,
                editar: session.user.permissoes.oportunidades.editar
                  ? group.permissoes.oportunidades.editar
                  : session.user.permissoes.oportunidades.editar,
                criar: session.user.permissoes.oportunidades.criar
                  ? group.permissoes.oportunidades.criar
                  : session.user.permissoes.oportunidades.criar,
                excluir: session.user.permissoes.oportunidades.excluir
                  ? group.permissoes.oportunidades.excluir
                  : session.user.permissoes.oportunidades.excluir,
              },
              analisesTecnicas: {
                escopo: [userId], // refere-se ao escopo de atuação
                visualizar: session.user.permissoes.analisesTecnicas.visualizar
                  ? group.permissoes.analisesTecnicas.visualizar
                  : session.user.permissoes.analisesTecnicas.visualizar,
                editar: session.user.permissoes.analisesTecnicas.editar
                  ? group.permissoes.analisesTecnicas.editar
                  : session.user.permissoes.analisesTecnicas.editar,
                criar: session.user.permissoes.analisesTecnicas.criar
                  ? group.permissoes.analisesTecnicas.criar
                  : session.user.permissoes.analisesTecnicas.criar,
              },
              homologacoes: {
                escopo: [userId], // refere-se ao escopo de atuação
                visualizar: session.user.permissoes.homologacoes.visualizar
                  ? group.permissoes.homologacoes.visualizar
                  : session.user.permissoes.homologacoes.visualizar,
                editar: session.user.permissoes.homologacoes.editar
                  ? group.permissoes.homologacoes.editar
                  : session.user.permissoes.homologacoes.editar,
                criar: session.user.permissoes.homologacoes.criar ? group.permissoes.homologacoes.criar : session.user.permissoes.homologacoes.criar,
              },
              clientes: {
                escopo: [userId],
                visualizar: session.user.permissoes.clientes.visualizar
                  ? group.permissoes.clientes.visualizar
                  : session.user.permissoes.clientes.visualizar,
                editar: session.user.permissoes.clientes.editar ? group.permissoes.clientes.editar : session.user.permissoes.clientes.editar,
                criar: session.user.permissoes.clientes.criar ? group.permissoes.clientes.criar : session.user.permissoes.clientes.criar,
              },
              projetos: {
                escopo: [userId],
                visualizar: session.user.permissoes.projetos.visualizar
                  ? group.permissoes.projetos.visualizar
                  : session.user.permissoes.projetos.visualizar,
                editar: session.user.permissoes.projetos.editar ? group.permissoes.projetos.editar : session.user.permissoes.projetos.editar,
                criar: session.user.permissoes.projetos.criar ? group.permissoes.projetos.criar : session.user.permissoes.projetos.criar,
              },
              parceiros: {
                escopo: session.user.idParceiro ? [session.user.idParceiro] : null,
                visualizar: session.user.permissoes.parceiros.visualizar
                  ? group.permissoes.parceiros.visualizar
                  : session.user.permissoes.parceiros.visualizar,
                editar: session.user.permissoes.parceiros.editar ? group.permissoes.parceiros.editar : session.user.permissoes.parceiros.editar,
                criar: session.user.permissoes.parceiros.criar ? group.permissoes.parceiros.criar : session.user.permissoes.parceiros.criar,
              },
              precos: {
                visualizar: session.user.permissoes.precos.visualizar
                  ? group.permissoes.precos.visualizar
                  : session.user.permissoes.precos.visualizar,
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
                funis: session.user.permissoes.configuracoes.funis
                  ? group.permissoes.configuracoes.funis
                  : session.user.permissoes.configuracoes.funis,
                parceiro: session.user.permissoes.configuracoes.parceiro
                  ? group.permissoes.configuracoes.parceiro
                  : session.user.permissoes.configuracoes.parceiro,
                precificacao: session.user.permissoes.configuracoes.precificacao
                  ? group.permissoes.configuracoes.precificacao
                  : session.user.permissoes.configuracoes.precificacao,
                metodosPagamento: session.user.permissoes.configuracoes.metodosPagamento
                  ? group.permissoes.configuracoes.metodosPagamento
                  : session.user.permissoes.configuracoes.metodosPagamento,
                tiposProjeto: session.user.permissoes.configuracoes.tiposProjeto
                  ? group.permissoes.configuracoes.tiposProjeto
                  : session.user.permissoes.configuracoes.tiposProjeto,
                gruposUsuarios: session.user.permissoes.configuracoes.gruposUsuarios
                  ? group.permissoes.configuracoes.gruposUsuarios
                  : session.user.permissoes.configuracoes.gruposUsuarios,
              },
              integracoes: {
                receberLeads: group.permissoes.integracoes.receberLeads,
              },
            };
            updateUserInfo({ idGrupo: value, permissoes: permissions });
          }}
          onReset={() => updateUserInfo({ idGrupo: '' })}
          width='100%'
        />
      </div>
      <PermissionsPannel referenceId={userId} userInfo={userInfo as TUser} updateUserInfo={updateUserInfo} users={users} session={session} />
      <ComissionPannel infoHolder={userInfo} updateUserInfo={updateUserInfo} />
    </div>
  );
}
