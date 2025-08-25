import type { TUserSession } from '@/lib/auth/session';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

import * as Dialog from '@radix-ui/react-dialog';

import { VscChromeClose } from 'react-icons/vsc';

import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';

import AccessInformation from '@/app/components/Homologations/ModalBlocks/AccessInformation';
import ActivitiesInformation from '@/app/components/Homologations/ModalBlocks/ActivitiesInformation';
import ApplicantBlock from '@/app/components/Homologations/ModalBlocks/ApplicantBlock';
import DocumentationInformation from '@/app/components/Homologations/ModalBlocks/DocumentationInformation';
import EquipmentsComposition from '@/app/components/Homologations/ModalBlocks/EquipmentsComposition';
import HomologationFiles from '@/app/components/Homologations/ModalBlocks/Files';
import HolderInformation from '@/app/components/Homologations/ModalBlocks/HolderInformation';
import InstallationInformation from '@/app/components/Homologations/ModalBlocks/InstallationInformation';
import LocationInformation from '@/app/components/Homologations/ModalBlocks/LocationInformation';
import StatusInformation from '@/app/components/Homologations/ModalBlocks/StatusInformation';
import UpdatesInformation from '@/app/components/Homologations/ModalBlocks/UpdatesInformation';
import VistoryInformation from '@/app/components/Homologations/ModalBlocks/VistoryInformation';

import { getErrorMessage } from '@/lib/methods/errors';

import { THomologation, THomologationDTO } from '@/utils/schemas/homologation.schema';

import { useHomologationById } from '@/utils/queries/homologations';

import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { editHomologation } from '@/utils/mutations/homologations';
import OpportunityInformationBlock from '../../Homologations/ModalBlocks/OpportunityInformationBlock';
import PendenciesInformation from '../../Homologations/ModalBlocks/PendenciesInformation';

type ControlHomologationProps = {
  homologationId: string;
  session: TUserSession;
  closeModal: () => void;
};
function ControlHomologation({ homologationId, session, closeModal }: ControlHomologationProps) {
  const queryClient = useQueryClient();
  const { data: homologation, isLoading, isError, isSuccess, error } = useHomologationById({ id: homologationId });
  const [infoHolder, setInfoHolder] = useState<THomologationDTO>({
    _id: 'id-holder',
    status: 'PENDENTE',
    distribuidora: '',
    pendencias: {},
    idParceiro: session.user.idParceiro || '',
    oportunidade: {
      id: '',
      nome: '',
    },
    requerente: {
      id: session.user.id,
      nome: session.user.nome,
      apelido: session.user.nome,
      contato: session.user.telefone || '',
      avatar_url: session.user.avatar_url,
    },
    titular: {
      nome: '',
      identificador: '',
      contato: '',
    },
    equipamentos: [],
    localizacao: {
      cep: null,
      uf: '',
      cidade: '',
      bairro: null,
      endereco: null,
      numeroOuIdentificador: null,
      complemento: null,
      // distancia: z.number().optional().nullable(),
    },
    instalacao: {
      numeroInstalacao: '',
      numeroCliente: '',
      grupo: 'RESIDENCIAL',
      dependentes: [],
    },
    documentacao: {
      formaAssinatura: 'FÍSICA',
      dataLiberacao: null,
      dataAssinatura: null,
    },
    acesso: {
      codigo: '',
      dataSolicitacao: null,
      dataResposta: null,
    },
    atualizacoes: [],
    vistoria: {
      dataSolicitacao: null,
      dataEfetivacao: null,
    },
    autor: {
      id: session.user.id,
      nome: session.user.nome,
      avatar_url: session.user.avatar_url,
    },
    dataInsercao: new Date().toISOString(),
  });

  const { mutate: handleUpdateHomologation, isPending } = useMutationWithFeedback({
    mutationKey: ['edit-homologation', homologationId],
    mutationFn: editHomologation,
    queryClient: queryClient,
    affectedQueryKey: ['homologations'],
  });
  useEffect(() => {
    if (homologation) setInfoHolder(homologation);
  }, [homologation]);
  return (
    <Dialog.Root open onOpenChange={closeModal}>
      <Dialog.Overlay className='fixed inset-0 z-100 bg-[rgba(0,0,0,.85)] backdrop-blur-xs' />
      <Dialog.Content className='fixed left-[50%] top-[50%] z-100 h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px] lg:w-[70%]'>
        <div className='flex h-full w-full flex-col'>
          <div className='flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row'>
            <div className='flex flex-col'>
              <h3 className='text-xl font-bold text-primary  '>EDITAR HOMOLOGAÇÃO</h3>
              <h3 className='text-[0.65rem] font-bold text-primary/70  '>#{homologationId}</h3>
            </div>

            <button
              onClick={() => closeModal()}
              type='button'
              className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
          {isSuccess ? (
            <>
              <div className='flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
                <StatusInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>} />
                <ActivitiesInformation session={session} homologation={homologation} opportunity={homologation.oportunidade} />
                <UpdatesInformation session={session} infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
                <PendenciesInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>} />
                <OpportunityInformationBlock
                  infoHolder={infoHolder}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>}
                />
                <ApplicantBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>} />
                <HolderInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>} />
                <HomologationFiles session={session} homologationId={homologationId} />
                <InstallationInformation
                  infoHolder={infoHolder}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>}
                />
                <LocationInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>} />
                <EquipmentsComposition infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>} />
                <DocumentationInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
                <AccessInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
                <VistoryInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
              </div>
              <div className='flex w-full items-center justify-end p-2'>
                <button
                  disabled={isPending}
                  // @ts-ignore
                  onClick={() => handleUpdateHomologation({ id: homologationId, changes: infoHolder })}
                  className='h-9 whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground'
                >
                  ATUALIZAR HOMOLOGAÇÃO
                </button>
              </div>
            </>
          ) : null}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default ControlHomologation;
