import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { formatToPhone } from '@/utils/methods';
import { TProject } from '@/utils/schemas/project.schema';
import { ComercialSegments, SigningForms } from '@/utils/select-options';
import React from 'react';

type SaleAdditionalInfoBlockProps = {
  infoHolder: TProject;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProject>>;
};
function SaleAdditionalInfoBlock({ infoHolder, setInfoHolder }: SaleAdditionalInfoBlockProps) {
  return (
    <div className='flex w-full flex-col gap-2'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-white'>INFORMAÇÕES ADICIONAIS</h1>
      <div className='flex w-full grow flex-col gap-2'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <SelectInput
              label='SEGMENTO'
              value={infoHolder.segmento}
              options={ComercialSegments}
              handleChange={(value) => {
                setInfoHolder((prev) => ({
                  ...prev,
                  segmento: value as TProject['segmento'],
                }));
              }}
              resetOptionLabel='NÃO DEFINIDO'
              onReset={() =>
                setInfoHolder((prev) => ({
                  ...prev,
                  segmento: 'RESIDENCIAL',
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <SelectInput
              label='FORMA DE ASSINATURA'
              resetOptionLabel='NÃO DEFINIDO'
              options={SigningForms}
              value={infoHolder.contrato.formaAssinatura}
              handleChange={(value) =>
                setInfoHolder((prev) => ({
                  ...prev,
                  contrato: { ...prev.contrato, formaAssinatura: value },
                }))
              }
              onReset={() => {
                setInfoHolder((prev) => ({
                  ...prev,
                  contrato: { ...prev.contrato, formaAssinatura: 'FÍSICA' },
                }));
              }}
              width='100%'
            />
          </div>
        </div>
        <div className='mt-2 flex w-full flex-col'>
          <h1 className='w-full rounded-tl-sm rounded-tr-sm bg-primary/50 p-1 text-center font-bold text-white'>OBSERVAÇÕES SOBRE O PROJETO</h1>
          <textarea
            placeholder='Preencha aqui informações relevantes sobre esse projeto. Peculiaridades sobre os serviços/produtos a serem prestados, detalhes adicionais, entre outras informações.'
            value={infoHolder.contatos.observacoes || ''}
            onChange={(e) => {
              setInfoHolder((prev) => ({
                ...prev,
                contatos: { ...prev.contatos, observacoes: e.target.value },
              }));
            }}
            className='min-h-[80px] w-full resize-none rounded-bl-sm rounded-br-sm bg-primary/10 p-3 text-center text-xs font-medium text-primary/60 outline-hidden'
          />
        </div>
        <h1 className='w-full text-center font-bold text-blue-800'>INFORMAÇÕES PARA CONTATO</h1>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='NOME DO CONTATO PRIMÁRIO'
              value={infoHolder.contatos.nomePrimario}
              placeholder='Preencha aqui o nome do contato primário.'
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, contatos: { ...prev.contatos, nomePrimario: value } }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='TELEFONE DO CONTATO PRIMÁRIO'
              value={infoHolder.contatos.telefonePrimario}
              placeholder='Preencha aqui o telefone do contato primário.'
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, contatos: { ...prev.contatos, telefonePrimario: formatToPhone(value) } }))}
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='NOME DO CONTATO SECUNDÁRIO'
              value={infoHolder.contatos.nomeSecundario}
              placeholder='Preencha aqui o nome do contato secundário.'
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, contatos: { ...prev.contatos, nomeSecundario: value } }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='TELEFONE DO CONTATO SECUNDÁRIO'
              value={infoHolder.contatos.telefoneSecundario || ''}
              placeholder='Preencha aqui o telefone do contato secundário.'
              handleChange={(value) =>
                setInfoHolder((prev) => ({ ...prev, contatos: { ...prev.contatos, telefoneSecundario: formatToPhone(value) } }))
              }
              width='100%'
            />
          </div>
        </div>
        <div className='mt-2 flex w-full flex-col'>
          <h1 className='w-full rounded-tl-sm rounded-tr-sm bg-primary/50 p-1 text-center font-bold text-white'>OBSERVAÇÕES PARA O CONTATO</h1>
          <textarea
            placeholder='Preencha aqui informações relevantes em relação ao contato com o cliente. Melhores horários para contato, preferência por áudio ou texto, etc.'
            value={infoHolder.contatos.observacoes || ''}
            onChange={(e) => {
              setInfoHolder((prev) => ({
                ...prev,
                contatos: { ...prev.contatos, observacoes: e.target.value },
              }));
            }}
            className='min-h-[80px] w-full resize-none rounded-bl-sm rounded-br-sm bg-primary/10 p-3 text-center text-xs font-medium text-primary/60 outline-hidden'
          />
        </div>
      </div>
    </div>
  );
}

export default SaleAdditionalInfoBlock;
