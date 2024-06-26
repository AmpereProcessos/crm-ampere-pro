import DateInput from '@/components/Inputs/DateInput'
import TextInput from '@/components/Inputs/TextInput'
import { formatDateInputChange } from '@/lib/methods/formatting'
import { formatDate } from '@/utils/methods'
import { TPurchaseDTO } from '@/utils/schemas/purchase.schema'
import React from 'react'

type OrderInformationBlockProps = {
  infoHolder: TPurchaseDTO
  setInfoHolder: React.Dispatch<React.SetStateAction<TPurchaseDTO>>
}
function OrderInformationBlock({ infoHolder, setInfoHolder }: OrderInformationBlockProps) {
  return (
    <div className="flex w-full flex-col gap-y-2">
      <h1 className="w-full bg-gray-700  p-1 text-center font-medium text-white">INFORMAÇÕES DO PEDIDO</h1>
      <div className="flex w-full flex-col gap-1">
        <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
          <div className="w-full lg:w-1/3">
            <DateInput
              label="DATA DO PEDIDO"
              value={formatDate(infoHolder.pedido.data)}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, pedido: { ...prev.pedido, data: formatDateInputChange(value) } }))}
              width="100%"
            />
          </div>
          <div className="w-full lg:w-1/3">
            <TextInput
              label="NOME DO FORNECEDOR"
              placeholder="Preencha o nome do fornecedor..."
              value={infoHolder.pedido.fornecedor.nome}
              handleChange={(value) =>
                setInfoHolder((prev) => ({ ...prev, pedido: { ...prev.pedido, fornecedor: { ...prev.pedido.fornecedor, nome: value } } }))
              }
              width="100%"
            />
          </div>
          <div className="w-full lg:w-1/3">
            <TextInput
              label="CONTATO DO FORNECEDOR"
              placeholder="Preencha o telefone de contato do fornecedor..."
              value={infoHolder.pedido.fornecedor.contato}
              handleChange={(value) =>
                setInfoHolder((prev) => ({ ...prev, pedido: { ...prev.pedido, fornecedor: { ...prev.pedido.fornecedor, contato: value } } }))
              }
              width="100%"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderInformationBlock
