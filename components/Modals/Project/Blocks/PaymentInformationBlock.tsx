import TextareaInput from '@/components/Inputs/TextareaInput';
import TextInput from '@/components/Inputs/TextInput';
import ActivePaymentMethod from '@/components/ProjectRequest/RequestStages/Utils/ActivePaymentMethod';
import CreditorBlock from '@/components/ProjectRequest/RequestStages/Utils/CreditorBlock';
import { formatToCPForCNPJ, formatToPhone } from '@/utils/methods';
import { TChangesControl, TProject, TProjectDTOWithReferences } from '@/utils/schemas/project.schema';
import React from 'react';

type PaymentInformationBlockProps = {
  infoHolder: TProjectDTOWithReferences;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProjectDTOWithReferences>>;
  changes: TChangesControl;
  setChanges: React.Dispatch<React.SetStateAction<TChangesControl>>;
};
function PaymentInformationBlock({ infoHolder, setInfoHolder, changes, setChanges }: PaymentInformationBlockProps) {
  const isFinancing = infoHolder.pagamento.metodo.fracionamento.some((f) => f.metodo == 'FINANCIAMENTO');
  return (
    <div className='flex w-full flex-col gap-2 rounded-sm border border-primary/80'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-white'>INFORMAÇÕES DE PAGAMENTO</h1>
      <div className='flex w-full grow flex-col gap-2 p-2'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='NOME DO PAGADOR'
              value={infoHolder.pagamento.pagador.nome}
              placeholder='Preencha aqui o nome do pagador.'
              handleChange={(value) => {
                setInfoHolder((prev) => ({
                  ...prev,
                  pagamento: {
                    ...prev.pagamento,
                    pagador: {
                      ...prev.pagamento.pagador,
                      nome: value,
                    },
                  },
                }));
                setChanges((prev) => ({ ...prev, project: { ...prev.project, 'pagamento.pagador.nome': value } }));
              }}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='CPF/CNPJ DO PAGADOR'
              value={infoHolder.pagamento.pagador.cpfCnpj}
              placeholder='Preencha aqui o CPF/CNPJ do pagador.'
              handleChange={(value) => {
                setInfoHolder((prev) => ({
                  ...prev,
                  pagamento: {
                    ...prev.pagamento,
                    pagador: {
                      ...prev.pagamento.pagador,
                      cpfCnpj: formatToCPForCNPJ(value),
                    },
                  },
                }));
                setChanges((prev) => ({ ...prev, project: { ...prev.project, 'pagamento.pagador.cpfCnpj': formatToCPForCNPJ(value) } }));
              }}
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='TELEFONE DO PAGADOR'
              value={infoHolder.pagamento.pagador.telefone}
              placeholder='Preencha aqui o telefone do pagador.'
              handleChange={(value) => {
                setInfoHolder((prev) => ({
                  ...prev,
                  pagamento: {
                    ...prev.pagamento,
                    pagador: {
                      ...prev.pagamento.pagador,
                      telefone: formatToPhone(value),
                    },
                  },
                }));
                setChanges((prev) => ({ ...prev, project: { ...prev.project, 'pagamento.pagador.telefone': formatToPhone(value) } }));
              }}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='EMAIL DO PAGADOR'
              value={infoHolder.pagamento.pagador.email}
              placeholder='Preencha aqui o email do projeto.'
              handleChange={(value) => {
                setInfoHolder((prev) => ({
                  ...prev,
                  pagamento: {
                    ...prev.pagamento,
                    pagador: {
                      ...prev.pagamento.pagador,
                      email: value,
                    },
                  },
                }));
                setChanges((prev) => ({ ...prev, project: { ...prev.project, 'pagamento.pagador.email': value } }));
              }}
              width='100%'
            />
          </div>
        </div>
        <h1 className='w-full rounded-md bg-blue-500 p-1 text-center text-sm font-bold text-white'>MÉTODO DE PAGAMENTO</h1>
        <div className='mb-6 flex w-full flex-col items-center justify-center rounded-sm border border-green-500'>
          <h1 className='w-full rounded-md rounded-tl rounded-tr bg-green-500 p-1 text-center text-sm font-bold text-white'>
            MÉTODO DE PAGAMENTO ATIVO
          </h1>
          <div className='flex w-full items-center justify-center p-2'>
            <ActivePaymentMethod method={infoHolder.pagamento.metodo} saleValue={infoHolder.valor} />
          </div>
        </div>
        {isFinancing ? (
          <CreditorBlock
            infoHolder={infoHolder}
            setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProject>>}
            changes={changes}
            setChanges={setChanges}
          />
        ) : null}
        <TextareaInput
          label='OBSERVAÇÕES DO PAGAMENTO'
          placeholder='Preencha aqui informações relevantes a cerca do pagamento...'
          value={infoHolder.pagamento.observacoes || ''}
          handleChange={(value) => {
            setInfoHolder((prev) => ({
              ...prev,
              pagamento: { ...prev.pagamento, observacoes: value },
            }));
            setChanges((prev) => ({ ...prev, project: { ...prev.project, 'pagamento.pagador.observacoes': value } }));
          }}
        />
      </div>
    </div>
  );
}

export default PaymentInformationBlock;
