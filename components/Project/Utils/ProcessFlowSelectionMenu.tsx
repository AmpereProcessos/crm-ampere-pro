import ErrorComponent from '@/components/utils/ErrorComponent'
import { useProcessFlows } from '@/utils/queries/process-flows'
import React, { useState } from 'react'
import { FaCodeBranch } from 'react-icons/fa'
import ProcessFlowSelectionSetting from './ProcessFlowSelectionSetting'
import { useMutationWithFeedback } from '@/utils/mutations/general-hook'
import { useQueryClient } from '@tanstack/react-query'
import { createManyProcessFlowReferences } from '@/utils/mutations/process-flow-references'
import { useProjectSettingStore } from '@/utils/process-settings/store'
import { TIndividualProcess } from '@/utils/schemas/process-flow.schema'

type ProcessFlowSelectionMenuProps = {
  projectId: string
}
function ProcessFlowSelectionMenu({ projectId }: ProcessFlowSelectionMenuProps) {
  const queryClient = useQueryClient()
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null)
  const { data: flows, isLoading, isError, isSuccess } = useProcessFlows()

  const store = useProjectSettingStore()

  const activeFlow = flows ? flows.find((f) => f._id == activeFlowId) || null : null
  const { mutate: handleCreateManyProcessFlowReferences, isPending } = useMutationWithFeedback({
    mutationKey: ['create-many-process-flow-references'],
    mutationFn: createManyProcessFlowReferences,
    queryClient: queryClient,
    affectedQueryKey: [],
  })
  console.log('EDGES', store.edges)
  console.log('NODES', store.nodes)
  return (
    <div className="flex w-full flex-col gap-2 rounded border border-gray-800">
      <h1 className="w-full rounded bg-gray-800 p-1 text-center font-bold text-white">ESCOLHA DO FLUXO DE PROCESSOS</h1>
      <div className="flex w-full grow flex-col gap-2 p-2">
        <div className="flex w-full flex-wrap items-center justify-around gap-2">
          {isLoading ? <h1 className="w-full animate-pulse py-2 text-center font-medium tracking-tight text-gray-500">Carregando fluxos...</h1> : null}
          {isError ? <ErrorComponent msg="Erro ao buscar fluxos de processo" /> : null}
          {isSuccess
            ? flows.map((flow) => (
                <button
                  key={flow._id}
                  onClick={() => setActiveFlowId(flow._id)}
                  className={`flex w-fit items-center gap-2 rounded border border-gray-500 p-2 text-gray-500 duration-300 ease-in-out ${
                    flow._id == activeFlowId
                      ? 'border-gray-800 bg-gray-800 text-white'
                      : 'bg-transparent text-gray-500 hover:border-gray-800 hover:text-gray-800'
                  }`}
                >
                  <FaCodeBranch />
                  <p className="text-sm font-bold">{flow.nome}</p>
                </button>
              ))
            : null}
        </div>
        {activeFlow ? (
          <>
            <ProcessFlowSelectionSetting flow={activeFlow} />
            <div className="flex w-full items-center justify-end">
              <button
                disabled={isPending}
                onClick={() => {
                  const individualProcess: TIndividualProcess[] = store.nodes.map((node) => {
                    return {
                      id: node.data.id,
                      idProcessoPai: node.data.idProcessoPai,
                      entidade: node.data.entidade,
                      ativacao: node.data.ativacao,
                      canvas: {
                        id: node.id,
                        posX: node.position.x,
                        posY: node.position.y,
                      },
                    }
                  })
                  // @ts-ignore
                  handleCreateManyProcessFlowReferences({ individualProcess, projectId })
                }}
                className="h-9 whitespace-nowrap rounded bg-green-700 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-green-600 enabled:hover:text-white"
              >
                DEFINIR FLUXO
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default ProcessFlowSelectionMenu
