import { formatDateInputChange, formatDateTime, formatNameAsInitials } from '@/lib/methods/formatting'
import { useMutationWithFeedback } from '@/utils/mutations/general-hook'

import { useUsers } from '@/utils/queries/users'
import { TActivity } from '@/utils/schemas/activities.schema'
import { TUserDTO } from '@/utils/schemas/user.schema'
import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Session } from 'next-auth'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Avatar from '../utils/Avatar'
import SelectWithImages from '../Inputs/SelectWithImages'
import DateTimeInput from '../Inputs/DateTimeInput'
import TextInput from '../Inputs/TextInput'
import { createActivity } from '@/utils/mutations/activities'
import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants'

const variants = {
  hidden: {
    opacity: 0.2,
    transition: {
      duration: 0.8, // Adjust the duration as needed
    },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8, // Adjust the duration as needed
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.01, // Adjust the duration as needed
    },
  },
}

type NewOpportunityActivityMenuProps = {
  session: Session
  opportunity: { id: string; nome: string }
  closeMenu: () => void
}
function NewOpportunityActivityMenu({ session, opportunity, closeMenu }: NewOpportunityActivityMenuProps) {
  const queryClient = useQueryClient()
  const { data: users } = useUsers()
  const [newActivityMenuIsOpen, setNewActivityMenuIsOpen] = useState<boolean>(false)
  const [newResponsibleHolder, setNewResponsibleHolder] = useState<string | null>(null)

  const [newActivityHolder, setNewActivityHolder] = useState<TActivity>({
    idParceiro: session.user.idParceiro || '',
    titulo: '', // resume of the activity
    descricao: '', // description of what to be done
    responsaveis: [],
    oportunidade: opportunity,
    idHomologacao: undefined,
    idAnaliseTecnica: undefined,
    subatividades: [],
    dataVencimento: null,
    dataConclusao: null,
    dataInsercao: new Date().toISOString(),
    autor: {
      id: session.user.id,
      nome: session.user.nome,
      avatar_url: session.user.avatar_url,
    },
  })
  function vinculateResponsible({ id, users }: { id: string | null; users: TUserDTO[] }) {
    if (!id) return toast.error('Escolha um usuário válido.')
    const user = users?.find((u: any) => u._id == id)
    if (!user) return
    const newResponsible = {
      id: user._id as string,
      nome: user.nome as string,
      avatar_url: user.avatar_url as string | null,
    }
    const responsibles = [...newActivityHolder.responsaveis]
    responsibles.push(newResponsible)
    setNewActivityHolder((prev) => ({ ...prev, responsaveis: responsibles }))
  }
  function removeResponsible(index: number) {
    const responsibles = [...newActivityHolder.responsaveis]
    responsibles.splice(index, 1)
    return setNewActivityHolder((prev) => ({ ...prev, responsaveis: responsibles }))
  }
  const { mutate: handleCreateActivity } = useMutationWithFeedback({
    mutationKey: ['create-activity'],
    mutationFn: createActivity,
    queryClient: queryClient,
    affectedQueryKey: [],
  })
  return (
    <motion.div variants={GeneralVisibleHiddenExitMotionVariants} initial="hidden" animate="visible" exit="exit" className="flex w-full flex-col gap-2 p-2">
      <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
        <div className="w-1/2 lg:w-full">
          <TextInput
            label="TÍTULO DA ATIVIDADE"
            placeholder="Preencha aqui o titulo a ser dado à atividade..."
            value={newActivityHolder.titulo}
            handleChange={(value) => setNewActivityHolder((prev) => ({ ...prev, titulo: value }))}
            width="100%"
          />
        </div>
        <div className="w-1/2 lg:w-full">
          <DateTimeInput
            label="DATA DE VENCIMENTO"
            value={formatDateTime(newActivityHolder.dataVencimento)}
            handleChange={(value) => setNewActivityHolder((prev) => ({ ...prev, dataVencimento: formatDateInputChange(value, 'string', false) as string }))}
            width="100%"
          />
        </div>
      </div>
      <div className="flex w-full flex-col rounded-md border border-gray-200 p-2 shadow-sm">
        <h1 className="text-sm font-medium leading-none tracking-tight text-gray-500">DESCRIÇÃO DA ATIVIDADE</h1>
        <input
          value={newActivityHolder.descricao}
          onChange={(e) => setNewActivityHolder((prev) => ({ ...prev, descricao: e.target.value }))}
          type="text"
          placeholder="Preencha aqui uma descrição mais específica da atividade a ser feita..."
          className="w-full p-3 text-start text-sm outline-none"
        />
      </div>
      <h1 className="text-sm font-medium leading-none tracking-tight text-gray-500">VINCULE RESPONSÁVEIS</h1>
      <div className="flex w-full items-center gap-2">
        <div className="flex items-end gap-2">
          <SelectWithImages
            label={'RESPONSÁVEL'}
            editable={true}
            showLabel={false}
            value={newResponsibleHolder}
            options={
              users?.map((resp) => ({
                id: resp._id,
                label: resp.nome,
                value: resp._id,
                url: resp.avatar_url || undefined,
                fallback: formatNameAsInitials(resp.nome),
              })) || []
            }
            handleChange={(value: any) => setNewResponsibleHolder(value)}
            onReset={() => setNewResponsibleHolder(null)}
            selectedItemLabel={'USUÁRIO NÃO DEFINIDO'}
          />
          <button
            onClick={() => vinculateResponsible({ id: newResponsibleHolder, users: users || [] })}
            className="min-h-[46.6px]  rounded border border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 shadow hover:bg-orange-500 hover:text-white"
          >
            VINCULAR
          </button>
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center justify-start gap-2">
        {newActivityHolder.responsaveis.map((resp, index) => (
          <div
            onClick={() => removeResponsible(index)}
            key={index}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-500 p-2 shadow-sm duration-300 ease-in-out hover:border-red-500 hover:bg-red-100"
          >
            <Avatar width={25} height={25} url={resp.avatar_url || undefined} fallback={formatNameAsInitials(resp.nome)} />
            <p className="text-sm font-medium tracking-tight text-gray-500">{resp.nome}</p>
          </div>
        ))}
      </div>
      <div className="flex w-full items-center justify-between">
        <button
          onClick={() => closeMenu()}
          className="whitespace-nowrap rounded bg-gray-500 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
        >
          FECHAR
        </button>
        <button
          // @ts-ignore
          onClick={() => handleCreateActivity({ info: newActivityHolder })}
          className="whitespace-nowrap rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
        >
          CRIAR ATIVIDADE
        </button>
      </div>
    </motion.div>
  )
}

export default NewOpportunityActivityMenu
