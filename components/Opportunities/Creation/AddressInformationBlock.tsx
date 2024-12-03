import SelectInput from '@/components/Inputs/SelectInput'
import TextInput from '@/components/Inputs/TextInput'
import { stateCities } from '@/utils/estados_cidades'
import { formatToCEP, getCEPInfo } from '@/utils/methods'
import { TClient } from '@/utils/schemas/client.schema'
import { TOpportunity } from '@/utils/schemas/opportunity.schema'
import React from 'react'
import toast from 'react-hot-toast'

type AddressInformationBlockProps = {
  opportunity: TOpportunity
  setOpportunity: React.Dispatch<React.SetStateAction<TOpportunity>>
  client: TClient
  setClient: React.Dispatch<React.SetStateAction<TClient>>
}
function AddressInformationBlock({ opportunity, setOpportunity, client, setClient }: AddressInformationBlockProps) {
  async function setAddressDataByCEP(cep: string) {
    const addressInfo = await getCEPInfo(cep)
    const toastID = toast.loading('Buscando informações sobre o CEP...', {
      duration: 2000,
    })
    setTimeout(() => {
      if (addressInfo) {
        toast.dismiss(toastID)
        toast.success('Dados do CEP buscados com sucesso.', {
          duration: 1000,
        })
        setClient((prev) => ({
          ...prev,
          endereco: addressInfo.logradouro,
          bairro: addressInfo.bairro,
          uf: addressInfo.uf as keyof typeof stateCities,
          cidade: addressInfo.localidade.toUpperCase(),
        }))
        setOpportunity((prev) => ({
          ...prev,
          localizacao: {
            ...prev.localizacao,
            endereco: addressInfo.logradouro,
            bairro: addressInfo.bairro,
            uf: addressInfo.uf as keyof typeof stateCities,
            cidade: addressInfo.localidade.toUpperCase(),
          },
        }))
      }
    }, 1000)
  }
  return (
    <div className="flex w-full flex-col gap-2">
      <h1 className="w-full rounded bg-gray-800 p-1 text-center text-sm font-bold text-white lg:text-base">INFORMAÇÕES DE ENDEREÇO</h1>
      <div className="grid grid-cols-1 grid-rows-3 items-center gap-6 px-2 lg:grid-cols-3 lg:grid-rows-1">
        <TextInput
          label="CEP"
          value={client.cep || ''}
          placeholder="Preencha aqui o CEP do cliente."
          handleChange={(value) => {
            if (value.length == 9) {
              setAddressDataByCEP(value)
            }
            setClient((prev) => ({
              ...prev,
              cep: formatToCEP(value),
            }))
            setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cep: formatToCEP(value) } }))
          }}
          width="100%"
        />
        <SelectInput
          label="ESTADO"
          value={client.uf}
          handleChange={(value) => {
            setClient((prev) => ({ ...prev, uf: value, cidade: stateCities[value as keyof typeof stateCities][0] as string }))
            setOpportunity((prev) => ({
              ...prev,
              localizacao: { ...prev.localizacao, uf: value, cidade: stateCities[value as keyof typeof stateCities][0] as string },
            }))
          }}
          selectedItemLabel="NÃO DEFINIDO"
          onReset={() => {
            setClient((prev) => ({ ...prev, uf: '', cidade: '' }))
            setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, uf: '', cidade: '' } }))
          }}
          options={Object.keys(stateCities).map((state, index) => ({
            id: index + 1,
            label: state,
            value: state,
          }))}
          width="100%"
        />
        <SelectInput
          label="CIDADE"
          value={client.cidade}
          handleChange={(value) => {
            setClient((prev) => ({ ...prev, cidade: value }))
            setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: value } }))
          }}
          options={client.uf ? stateCities[client.uf as keyof typeof stateCities].map((city, index) => ({ id: index + 1, value: city, label: city })) : null}
          selectedItemLabel="NÃO DEFINIDO"
          onReset={() => {
            setClient((prev) => ({ ...prev, cidade: '' }))
            setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, cidade: '' } }))
          }}
          width="100%"
        />
      </div>
      <div className="grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
        <TextInput
          label="BAIRRO"
          value={client.bairro || ''}
          placeholder="Preencha aqui o bairro do cliente."
          handleChange={(value) => {
            setClient((prev) => ({ ...prev, bairro: value }))
            setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, bairro: value } }))
          }}
          width="100%"
        />
        <TextInput
          label="LOGRADOURO/RUA"
          value={client.endereco || ''}
          placeholder="Preencha aqui o logradouro do cliente."
          handleChange={(value) => {
            setClient((prev) => ({ ...prev, endereco: value }))
            setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, endereco: value } }))
          }}
          width="100%"
        />
      </div>
      <div className="mb-2 grid grid-cols-1 grid-rows-2 items-center gap-6 px-2 lg:grid-cols-2 lg:grid-rows-1">
        <TextInput
          label="NÚMERO/IDENTIFICADOR"
          value={client.numeroOuIdentificador || ''}
          placeholder="Preencha aqui o número ou identificador da residência do cliente."
          handleChange={(value) => {
            setClient((prev) => ({
              ...prev,
              numeroOuIdentificador: value,
            }))
            setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, numeroOuIdentificador: value } }))
          }}
          width="100%"
        />
        <TextInput
          label="COMPLEMENTO"
          value={client.complemento || ''}
          placeholder="Preencha aqui algum complemento do endereço."
          handleChange={(value) => {
            setClient((prev) => ({
              ...prev,
              complemento: value,
            }))
            setOpportunity((prev) => ({ ...prev, localizacao: { ...prev.localizacao, complemento: value } }))
          }}
          width="100%"
        />
      </div>
    </div>
  )
}

export default AddressInformationBlock
