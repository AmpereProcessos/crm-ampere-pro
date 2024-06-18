import { useProjectById } from '@/utils/queries/project'
import { TChangesControl, TProjectDTOWithReferences } from '@/utils/schemas/project.schema'
import { Session } from 'next-auth'
import React, { useEffect, useState } from 'react'
import { VscChromeClose } from 'react-icons/vsc'
import ClientBlock from './Blocks/ClientBlock'
import LoadingComponent from '@/components/utils/LoadingComponent'
import ErrorComponent from '@/components/utils/ErrorComponent'
import GeneralInformationBlock from './Blocks/GeneralInformationBlock'
import ActiveHomologationBlock from './Blocks/ActiveHomologationBlock'
import ActiveTechnicalAnalysisBlock from './Blocks/ActiveTechnicalAnalysisBlock'
import SaleCompositionBlock from './Blocks/SaleCompositionBlock'
import PaymentInformationBlock from './Blocks/PaymentInformationBlock'
import DocumentsBlock from './Blocks/DocumentsBlock'
import EntityReferencesBlock from './Blocks/EntityReferencesBlock'
import ProjectProcessFlowBlock from './Blocks/ProcessFlowBlock'

type GeneralControlModalProps = {
  projectId: string
  session: Session
  closeModal: () => void
}
function GeneralControlModal({ projectId, session, closeModal }: GeneralControlModalProps) {
  const userHasClientEditPermission = session.user.permissoes.clientes.editar
  const userHasPricingViewPermission = session.user.permissoes.precos.visualizar
  const { data: project, isLoading, isError, isSuccess } = useProjectById({ id: projectId })
  const [infoHolder, setInfoHolder] = useState<TProjectDTOWithReferences | null>(null)
  const [changes, setChanges] = useState<TChangesControl>({
    project: {},
    client: {},
  })
  useEffect(() => {
    if (project) setInfoHolder(project)
  }, [project])
  console.log(changes)
  return (
    <div id="project-general-control" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
      <div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[70%]">
        <div className="flex h-full flex-col">
          <div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
            <h3 className="text-xl font-bold text-[#353432] dark:text-white ">CONTROLE GERAL DO PROJETO</h3>
            <button
              onClick={closeModal}
              type="button"
              className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent msg="Houve um erro ao buscar informações do projeto." /> : null}
          {isSuccess && !!infoHolder ? (
            <div className="flex h-full flex-col gap-y-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
              <EntityReferencesBlock project={project} />
              <GeneralInformationBlock
                session={session}
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>}
                changes={changes}
                setChanges={setChanges}
              />
              <ClientBlock
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>}
                changes={changes}
                setChanges={setChanges}
                userHasClientEditPermission={userHasClientEditPermission}
              />
              <ActiveHomologationBlock
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>}
              />
              <ActiveTechnicalAnalysisBlock
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>}
                userHasPricingViewPermission={userHasPricingViewPermission}
              />
              <SaleCompositionBlock
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>}
                changes={changes}
                setChanges={setChanges}
              />
              <PaymentInformationBlock
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>}
                changes={changes}
                setChanges={setChanges}
              />
              <DocumentsBlock
                projectId={projectId}
                clientId={infoHolder.cliente.id}
                opportunityId={infoHolder.oportunidade.id}
                analysisId={infoHolder.idAnaliseTecnica}
                homologationId={infoHolder.idHomologacao}
              />
              <ProjectProcessFlowBlock projectId={projectId} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default GeneralControlModal
