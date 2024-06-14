import DocumentationInformationBlock from '@/components/ProjectType/DocumentationInformationBlock'
import GeneralInformationBlock from '@/components/ProjectType/GeneralInformationBlock'
import ProcessSettingsBlock from '@/components/ProjectType/ProcessSettingsBlock'
import ProposalTemplatesInformationBlock from '@/components/ProjectType/ProposalTemplatesInformationBlock'
import SizingInformationBlock from '@/components/ProjectType/SizingInformationBlock'
import { useMutationWithFeedback } from '@/utils/mutations/general-hook'
import { createProjectType, editProjectType } from '@/utils/mutations/project-types'
import { useProjectTypeById } from '@/utils/queries/project-types'
import { TProjectType } from '@/utils/schemas/project-types.schema'
import { useQueryClient } from '@tanstack/react-query'
import { Session } from 'next-auth'
import React, { useEffect, useState } from 'react'
import { VscChromeClose } from 'react-icons/vsc'

type EditProjectTypeProps = {
  projectTypeId: string
  session: Session
  closeModal: () => void
}
function EditProjectType({ projectTypeId, session, closeModal }: EditProjectTypeProps) {
  const queryClient = useQueryClient()
  const { data: type, isLoading, isError, isSuccess } = useProjectTypeById({ id: projectTypeId })
  const [infoHolder, setInfoHolder] = useState<TProjectType>({
    idParceiro: session.user.idParceiro || '',
    nome: '',
    categoriaVenda: 'KIT',
    dimensionamento: [],
    modelosProposta: [],
    documentacao: [],
    autor: {
      id: session.user.id,
      nome: session.user.nome,
      avatar_url: session.user.avatar_url,
    },
    dataInsercao: new Date().toISOString(),
  })
  const { mutate: handleEditProjectType, isPending } = useMutationWithFeedback({
    mutationKey: ['edit-project-type', projectTypeId],
    mutationFn: editProjectType,
    queryClient: queryClient,
    affectedQueryKey: ['project-types'],
    callbackFn: async () => await queryClient.invalidateQueries({ queryKey: ['project-type-by-id', projectTypeId] }),
  })
  useEffect(() => {
    if (type) setInfoHolder(type)
  }, [type])
  return (
    <div id="new-product" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
      <div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[60%]">
        <div className="flex h-full flex-col">
          <div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
            <h3 className="text-xl font-bold text-[#353432] dark:text-white ">EDITAR TIPO DE PROJETO</h3>
            <button
              onClick={() => closeModal()}
              type="button"
              className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          <div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
            <div className="my-5 flex flex-col">
              <p className="w-full text-center text-gray-500">
                Edite aqui o tipo de projeto, defina a <strong className="text-[#E25E3E]">categoria de venda aplicável</strong> e personalize os campos de
                dimensionamento de proposta comerciais.
              </p>
            </div>
            <GeneralInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
            <SizingInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
            <ProposalTemplatesInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
            <DocumentationInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
            {/* <ProcessSettingsBlock projectTypeId={projectTypeId} /> */}
          </div>
          <div className="flex w-full items-center justify-end p-2">
            <button
              disabled={isPending}
              onClick={() => {
                // @ts-ignore
                handleEditProjectType({ id: projectTypeId, changes: { nome: infoHolder.nome.toUpperCase(), ...infoHolder } })
              }}
              className="h-9 whitespace-nowrap rounded bg-blue-800 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-blue-800 enabled:hover:text-white"
            >
              ATUALIZAR TIPO DE PROJETO
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProjectType
