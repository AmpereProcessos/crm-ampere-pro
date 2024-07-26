import React, { useEffect, useState } from 'react'
import { Session } from 'next-auth'
import { useQueryClient } from '@tanstack/react-query'
import { getMetadata, ref } from 'firebase/storage'
import Link from 'next/link'

import * as Dialog from '@radix-ui/react-dialog'

import { MdCode } from 'react-icons/md'
import { VscChromeClose } from 'react-icons/vsc'

import ErrorComponent from '@/components/utils/ErrorComponent'
import LoadingComponent from '@/components/utils/LoadingComponent'

import EquipmentsComposition from '@/app/components/Homologations/EquipmentsComposition'
import HolderInformation from '@/app/components/Homologations/HolderInformation'
import InstallationInformation from '@/app/components/Homologations/InstallationInformation'
import LocationInformation from '@/app/components/Homologations/LocationInformation'
import DocumentationInformation from '@/app/components/Homologations/DocumentationInformation'
import AccessInformation from '@/app/components/Homologations/AccessInformation'
import VistoryInformation from '@/app/components/Homologations/VistoryInformation'
import UpdatesInformation from '@/app/components/Homologations/UpdatesInformation'
import ActivitiesInformation from '@/app/components/Homologations/ActivitiesInformation'
import HomologationFiles from '@/app/components/Homologations/Files'
import StatusInformation from '@/app/components/Homologations/StatusInformation'
import ApplicantBlock from '@/app/components/Homologations/ApplicantBlock'

import { getErrorMessage } from '@/lib/methods/errors'

import { THomologation, THomologationDTO } from '@/utils/schemas/homologation.schema'

import { useHomologationById } from '@/utils/queries/homologations'

import { useMutationWithFeedback } from '@/utils/mutations/general-hook'
import { editHomologation } from '@/utils/mutations/homologations'

type ControlHomologationProps = {
  homologationId: string
  session: Session
  closeModal: () => void
}
function ControlHomologation({ homologationId, session, closeModal }: ControlHomologationProps) {
  const queryClient = useQueryClient()
  const { data: homologation, isLoading, isError, isSuccess, error } = useHomologationById({ id: homologationId })
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
  })

  const { mutate: handleUpdateHomologation, isPending } = useMutationWithFeedback({
    mutationKey: ['edit-homologation', homologationId],
    mutationFn: editHomologation,
    queryClient: queryClient,
    affectedQueryKey: ['homologations'],
  })
  useEffect(() => {
    if (homologation) setInfoHolder(homologation)
  }, [homologation])
  return (
    <Dialog.Root open onOpenChange={closeModal}>
      <Dialog.Overlay className="fixed inset-0 z-[100] bg-[rgba(0,0,0,.85)] backdrop-blur-sm" />
      <Dialog.Content className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[70%]">
        <div className="flex h-full w-full flex-col">
          <div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-[#353432] dark:text-white ">EDITAR HOMOLOGAÇÃO</h3>
              <h3 className="text-[0.65rem] font-bold text-gray-500 dark:text-white ">#{homologationId}</h3>
            </div>

            <button
              onClick={() => closeModal()}
              type="button"
              className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
          {isSuccess ? (
            <>
              <div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
                <div className="my-2 flex flex-col items-center justify-center">
                  <h1 className="font-bold">OPORTUNIDADE</h1>
                  <Link href={`/comercial/oportunidades/id/${infoHolder.oportunidade.id}`}>
                    <div className="flex items-center gap-1 rounded-lg bg-cyan-500 px-2 py-1 text-white">
                      <MdCode />
                      <p className="text-sm font-bold tracking-tight">{infoHolder.oportunidade.nome}</p>
                    </div>
                  </Link>
                </div>

                <ActivitiesInformation session={session} homologation={homologation} opportunity={homologation.oportunidade} />
                <UpdatesInformation session={session} infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
                <StatusInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>} />
                <ApplicantBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>} />
                <HolderInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>} />
                <HomologationFiles session={session} homologationId={homologationId} />
                <InstallationInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>} />
                <LocationInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>} />
                <EquipmentsComposition infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<THomologation>>} />
                <DocumentationInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
                <AccessInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
                <VistoryInformation infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
                {/* <AttachFiles opportunityId={homologation.oportunidade.id} files={files} setFiles={setFiles} /> */}
              </div>
              <div className="flex w-full items-center justify-end p-2">
                <button
                  disabled={isPending}
                  // @ts-ignore
                  onClick={() => handleUpdateHomologation({ id: homologationId, changes: infoHolder })}
                  className="h-9 whitespace-nowrap rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
                >
                  ATUALIZAR HOMOLOGAÇÃO
                </button>
              </div>
            </>
          ) : null}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default ControlHomologation
