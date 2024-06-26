import ProjectPurchaseCard from '@/components/Cards/ProjectPurchaseCard'
import TextareaInput from '@/components/Inputs/TextareaInput'
import TextInput from '@/components/Inputs/TextInput'
import ProjectNode from '@/components/ReactFlowTesting/ProjectNode'
import { Sidebar } from '@/components/Sidebar'
import LoadingPage from '@/components/utils/LoadingPage'
import { useMutationWithFeedback } from '@/utils/mutations/general-hook'
import { createProcessFlow } from '@/utils/mutations/process-flows'
import { getActiveProcessAutomationReference, ProcessAutomationEntitiesSpecs } from '@/utils/process-settings'
import { nodeTypes, useProjectSettingStore } from '@/utils/process-settings/store'
import { TProcessFlow } from '@/utils/schemas/process-flow.schema'
import { TPurchaseDTO } from '@/utils/schemas/purchase.schema'
import { useQueryClient } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import { useSession } from 'next-auth/react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import ReactFlow, { addEdge, applyEdgeChanges, applyNodeChanges, Background, Connection, Controls } from 'reactflow'
import 'reactflow/dist/style.css'

function Testing() {
  const { data: session, status } = useSession()
  const purchase = {
    _id: '667ad35e43f86083effc1a10',
    status: 'AGUARDANDO LIBERAÇÃO',
    titulo: 'TESTANDO COMPRAS',
    idParceiro: '65454ba15cf3e3ecf534b308',
    projeto: {
      id: '666365a55af5b4beccfc06fb',
      nome: 'TESTANDO INTEGRAÇÃO 2',
      tipo: 'SISTEMA FOTOVOLTAICO',
      indexador: 0,
      identificador: 'CRM-974',
    },
    liberacao: {
      data: '2024-06-25T14:24:27.735Z',
      autor: {
        id: '6463ccaa8c5e3e227af54d89',
        nome: 'LUCAS FERNANDES',
        avatar_url:
          'https://firebasestorage.googleapis.com/v0/b/sistemaampere.appspot.com/o/saas-crm%2Fusuarios%2FLUCAS%20FERNANDES?alt=media&token=3b345c22-c4d2-46cc-865e-8544e29e76a4',
      },
    },
    anotacoes: '',
    composicao: [
      {
        categoria: 'INSUMO',
        descricao: 'TESTE 1',
        unidade: 'UN',
        valor: 0,
        qtde: 1,
      },
      {
        categoria: 'MÓDULO',
        descricao: 'XPOWER 550W',
        unidade: 'UN',
        valor: 2500,
        qtde: 4,
      },
    ],
    total: 10000,
    fornecedor: {
      nome: 'ALDO',
      contato: '(34) 99999-9999',
    },
    linkRastreio: null,
    faturamento: {},
    entrega: {},
    dataInsercao: '2024-06-25T14:24:27.735Z',
  }

  if (status != 'authenticated') return <LoadingPage />
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
        <div className="w-full self-center lg:w-[40%]">
          <ProjectPurchaseCard purchase={purchase as TPurchaseDTO} />
        </div>
      </div>
    </div>
  )
}

export default Testing
