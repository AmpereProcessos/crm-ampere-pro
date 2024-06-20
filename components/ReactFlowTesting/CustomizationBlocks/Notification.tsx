import SelectWithImages from '@/components/Inputs/SelectWithImages'
import Avatar from '@/components/utils/Avatar'
import { formatNameAsInitials } from '@/lib/methods/formatting'
import { TProcessSettingNode, useProjectSettingStore } from '@/utils/process-settings/store'
import { useUsers } from '@/utils/queries/users'
import { TNotification } from '@/utils/schemas/notification.schema'
import { TUserDTO } from '@/utils/schemas/user.schema'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

function Notification(node: TProcessSettingNode) {
  const { id, data } = node
  const { data: users } = useUsers()
  const updateNodeData = useProjectSettingStore((state) => state.updateNodeData)

  const [newResponsibleHolder, setNewResponsibleHolder] = useState<string | null>(null)
  function vinculateResponsible({
    userId,
    users,
    previousResponsibles,
  }: {
    userId: string | null
    users: TUserDTO[]
    previousResponsibles?: TNotification['destinatarios']
  }) {
    console.log(userId, users, previousResponsibles)
    if (!userId) return toast.error('Escolha um usuário válido.')
    const user = users?.find((u: any) => u._id == userId)
    if (!user) return
    const newResponsible = {
      id: user._id as string,
      nome: user.nome as string,
      avatar_url: user.avatar_url as string | null,
    }
    const responsibles = [...(previousResponsibles || [])]
    responsibles.push(newResponsible)
    console.log(responsibles)
    updateNodeData(id, { ...data, entidade: { ...data.entidade, customizacao: { ...data.entidade.customizacao, destinatarios: responsibles } } })
  }
  function removeResponsible(index: number, previousResponsibles?: TNotification['destinatarios']) {
    const responsibles = [...(previousResponsibles || [])]
    responsibles.splice(index, 1)
    updateNodeData(id, { ...data, entidade: { ...data.entidade, customizacao: { ...data.entidade.customizacao, destinatarios: responsibles } } })
  }
  return (
    <div draggable={false} className="flex w-full flex-col gap-2">
      <div className="flex items-end gap-2">
        <SelectWithImages
          label={'DESTINATÁRIO'}
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
          draggable={false}
          onClick={() =>
            vinculateResponsible({ userId: newResponsibleHolder, users: users || [], previousResponsibles: data.entidade.customizacao.destinatarios })
          }
          className="min-h-[46.6px]  rounded border border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 shadow hover:bg-orange-500 hover:text-white"
        >
          ADICIONAR
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-start gap-2">
        {(data.entidade.customizacao.destinatarios as TNotification['destinatarios'])?.map((resp, index) => (
          <div
            key={index}
            onClick={() => removeResponsible(index)}
            draggable={false}
            className="flex items-center gap-2 rounded-lg border border-cyan-500 p-2 shadow-sm"
          >
            <Avatar width={15} height={15} url={resp.avatar_url || undefined} fallback={formatNameAsInitials(resp.nome)} />
            <p className="text-[0.6rem] font-medium tracking-tight text-gray-500">{resp.nome}</p>
          </div>
        ))}
      </div>
      <div className="flex w-full flex-col rounded-md border border-gray-200 p-2 shadow-sm">
        <h1 className="text-sm font-medium leading-none tracking-tight text-gray-500">MENSAGEM DA NOTIFICAÇÃO</h1>
        <input
          value={data.entidade.customizacao.mensagem}
          onChange={(e) =>
            updateNodeData(id, { ...data, entidade: { ...data.entidade, customizacao: { ...data.entidade.customizacao, mensagem: e.target.value } } })
          }
          type="text"
          placeholder="Preencha aqui uma mensagem padrão para a notificação..."
          className="w-full p-3 text-start text-sm outline-none"
        />
      </div>
    </div>
  )
}

export default Notification
