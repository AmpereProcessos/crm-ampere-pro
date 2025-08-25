import { TPartner } from '@/utils/schemas/partner.schema'
import React from 'react'
import TextInput from '../Inputs/TextInput'
import { formatToPhone } from '@/utils/methods'

type ContactInformationBlockProps = {
  infoHolder: TPartner
  setInfoHolder: React.Dispatch<React.SetStateAction<TPartner>>
}
function ContactInformationBlock({ infoHolder, setInfoHolder }: ContactInformationBlockProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <h1 className="w-full rounded-sm bg-[#fead41] p-1 text-center text-sm font-bold text-white">CONTATOS</h1>
      <div className="flex w-full flex-col items-center gap-2 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <TextInput
            label="TELEFONE PRIMÁRIO"
            placeholder="Preencha aqui o telefone principal do novo parceiro..."
            value={infoHolder.contatos.telefonePrimario || ''}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, contatos: { ...prev.contatos, telefonePrimario: formatToPhone(value) } }))}
            width="100%"
          />
        </div>
        <div className="w-full lg:w-1/2">
          <TextInput
            label="TELEFONE SECUNDÁRIO"
            placeholder="Preencha aqui, se necessáiro, o telefone secundário do novo parceiro..."
            value={infoHolder.contatos.telefoneSecundario || ''}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, contatos: { ...prev.contatos, telefoneSecundario: formatToPhone(value) } }))}
            width="100%"
          />
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-2 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <TextInput
            label="EMAIL"
            placeholder="Preencha aqui o email do novo parceiro..."
            value={infoHolder.contatos.email || ''}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, contatos: { ...prev.contatos, email: value } }))}
            width="100%"
          />
        </div>
      </div>
    </div>
  )
}

export default ContactInformationBlock
