import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { formatToCPForCNPJ, formatToPhone } from '@/utils/methods';
import { THomologation } from '@/utils/schemas/homologation.schema';
import { SigningForms } from '@/utils/select-options';
import React from 'react';

type HolderInformationProps = {
  infoHolder: THomologation;
  setInfoHolder: React.Dispatch<React.SetStateAction<THomologation>>;
};
function HolderInformation({ infoHolder, setInfoHolder }: HolderInformationProps) {
  return (
    <div className='flex w-full flex-col gap-2'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-white'>INFORMAÇÕES DO TITULAR DA INSTALAÇÃO ELÉTRICA</h1>
      <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
        <div className='w-full lg:w-1/3'>
          <TextInput
            label='NOME DO TITULAR'
            placeholder='Preencha o nome do titular da instalação...'
            value={infoHolder.titular.nome}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, titular: { ...prev.titular, nome: value } }))}
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/3'>
          <TextInput
            label='CPF/CNPJ DO TITULAR'
            placeholder='Preencha o cpf ou cpnj do titular da instalação...'
            value={infoHolder.titular.identificador}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, titular: { ...prev.titular, identificador: formatToCPForCNPJ(value) } }))}
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/3'>
          <TextInput
            label='TELEFONE DO TITULAR'
            placeholder='Preencha o telefone do titular da instalação...'
            value={infoHolder.titular.contato}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, titular: { ...prev.titular, contato: formatToPhone(value) } }))}
            width='100%'
          />
        </div>
      </div>
      <div className='flex w-full items-center justify-center'>
        <div className='w-full lg:w-1/3'>
          <SelectInput
            label='FORMA DE ASSINATURA'
            resetOptionLabel='NÃO DEFINIDO'
            options={SigningForms}
            value={infoHolder.documentacao.formaAssinatura}
            handleChange={(value) =>
              setInfoHolder((prev) => ({
                ...prev,
                documentacao: { ...prev.documentacao, formaAssinatura: value },
              }))
            }
            onReset={() => {
              setInfoHolder((prev) => ({
                ...prev,
                documentacao: { ...prev.documentacao, formaAssinatura: 'FÍSICA' },
              }));
            }}
            width='100%'
          />
        </div>
      </div>
    </div>
  );
}

export default HolderInformation;
