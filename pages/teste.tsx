import TextareaInput from '@/components/Inputs/TextareaInput'
import TextInput from '@/components/Inputs/TextInput'
import ProjectNode from '@/components/ReactFlowTesting/ProjectNode'
import { Sidebar } from '@/components/Sidebar'
import LoadingPage from '@/components/utils/LoadingPage'
import { useMutationWithFeedback } from '@/utils/mutations/general-hook'
import { createProcessFlow } from '@/utils/mutations/process-flows'
import { getActiveProcessAutomationReference } from '@/utils/process-settings'
import { nodeTypes, useProjectSettingStore } from '@/utils/process-settings/store'
import { TProcessFlow } from '@/utils/schemas/process-flow.schema'
import { useQueryClient } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import { useSession } from 'next-auth/react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import ReactFlow, { addEdge, applyEdgeChanges, applyNodeChanges, Background, Connection, Controls } from 'reactflow'
import 'reactflow/dist/style.css'

function Testing() {
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()
  const store = useProjectSettingStore()

  const {
    mutate: handleCreateProcessFlow,
    isPending,
    isError,
    isSuccess,
  } = useMutationWithFeedback({
    mutationKey: ['create-flow'],
    mutationFn: createProcessFlow,
    queryClient: queryClient,
    affectedQueryKey: ['process-flows'],
  })
  console.log('EDGES', store.edges)
  console.log('NODES', store.nodes)
  if (status != 'authenticated') return <LoadingPage />
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow overflow-x-hidden bg-[#f8f9fa]">
        <div className="h-full w-[80%]">
          <ReactFlow
            nodes={store.nodes}
            edges={store.edges}
            nodeTypes={nodeTypes}
            onNodesChange={store.onNodesChange}
            onEdgesChange={store.onEdgesChange}
            onConnect={store.addEdge}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        <div className="flex h-full w-[20%] flex-col gap-4 rounded-bl rounded-tl border-l border-gray-500 bg-[#fff] p-6 shadow-md">
          <h1 className="text-xl font-black leading-none tracking-tight">CONSTRUÇÃO DE FLUXO DE PROCESSOS</h1>
          <div className="flex w-full flex-col gap-2">
            <TextInput
              label="NOME DO FLUXO"
              placeholder="Preencha o nome a ser dado ao fluxo de processos."
              value={store.name}
              handleChange={(value) => store.updateName(value)}
              width="100%"
            />
            <TextareaInput
              label="DESCRIÇÃO DO FLUXO"
              placeholder="Preencha a descrição do fluxo de processos."
              value={store.description}
              handleChange={(value) => store.updateDescription(value)}
            />
          </div>
          <div className="flex w-full items-center justify-end">
            <button
              disabled={isPending}
              onClick={() => {
                const flow: TProcessFlow = {
                  ativo: true,
                  nome: store.name,
                  descricao: store.description,
                  processos: store.nodes.map((node) => {
                    return {
                      id: node.data.id,
                      idProcessoPai: node.data.idProcessoPai,
                      referencia: node.data.referencia,
                      gatilho: node.data.gatilho,
                      retorno: node.data.retorno,
                      customizacao: node.data.customizacao,
                      canvas: {
                        id: node.id,
                        posX: node.position.x,
                        posY: node.position.y,
                      },
                    }
                  }),
                  arestas: store.edges,
                  autor: {
                    id: session.user.id,
                    nome: session.user.nome,
                    avatar_url: session.user.avatar_url,
                  },
                  dataInsercao: new Date().toISOString(),
                }
                // @ts-ignore
                handleCreateProcessFlow({ info: flow })
              }}
              className="h-9 whitespace-nowrap rounded bg-green-700 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-green-600 enabled:hover:text-white"
            >
              CRIAR FLUXO
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Testing
