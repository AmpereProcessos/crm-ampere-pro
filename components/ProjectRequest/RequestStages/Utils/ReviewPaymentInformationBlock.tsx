import TextareaInput from '@/components/Inputs/TextareaInput';
import TextInput from '@/components/Inputs/TextInput';
import { formatToCPForCNPJ, formatToPhone } from '@/utils/methods';
import { TClientDTO } from '@/utils/schemas/client.schema';
import { TProject } from '@/utils/schemas/project.schema';
import React from 'react';
import ActivePaymentMethod from './ActivePaymentMethod';
import CreditorBlock from './CreditorBlock';

type ReviewPaymentInformationBlockProps = {
  infoHolder: TProject;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProject>>;
  client: TClientDTO;
};

function ReviewPaymentInformationBlock({ infoHolder, setInfoHolder, client }: ReviewPaymentInformationBlockProps) {
  function useClientDataInPayment(client: TClientDTO) {
    setInfoHolder((prev) => ({
      ...prev,
      pagamento: {
        ...prev.pagamento,
        pagador: {
          ...prev.pagamento.pagador,
          nome: client.nome,
          cpfCnpj: client.cpfCnpj || '',
          email: client.email || '',
          telefone: client.telefonePrimario,
        },
      },
    }));
  }
  const isFinancing = infoHolder.pagamento.metodo.fracionamento.some((f) => f.metodo == 'FINANCIAMENTO');
  return (
    <div className='flex w-full grow flex-col gap-2'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-primary-foreground'>INFORMAÇÕES DE PAGAMENTO</h1>
      <div className='flex w-full grow flex-col gap-2'>
        <div className='my-2 flex w-full items-center justify-center'>
          <button
            onClick={() => useClientDataInPayment(client)}
            className='rounded-lg bg-blue-500 px-2 py-1 text-center text-xs font-medium tracking-tight text-primary-foreground duration-300 ease-in-out hover:bg-blue-600'
          >
            UTILIZAR DOS DADOS DO CLIENTE
          </button>
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='NOME DO PAGADOR'
              value={infoHolder.pagamento.pagador.nome}
              placeholder='Preencha aqui o nome do pagador.'
              handleChange={(value) =>
                setInfoHolder((prev) => ({
                  ...prev,
                  pagamento: {
                    ...prev.pagamento,
                    pagador: {
                      ...prev.pagamento.pagador,
                      nome: value,
                    },
                  },
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='CPF/CNPJ DO PAGADOR'
              value={infoHolder.pagamento.pagador.cpfCnpj}
              placeholder='Preencha aqui o CPF/CNPJ do pagador.'
              handleChange={(value) =>
                setInfoHolder((prev) => ({
                  ...prev,
                  pagamento: {
                    ...prev.pagamento,
                    pagador: {
                      ...prev.pagamento.pagador,
                      cpfCnpj: formatToCPForCNPJ(value),
                    },
                  },
                }))
              }
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
              handleChange={(value) =>
                setInfoHolder((prev) => ({
                  ...prev,
                  pagamento: {
                    ...prev.pagamento,
                    pagador: {
                      ...prev.pagamento.pagador,
                      telefone: formatToPhone(value),
                    },
                  },
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <TextInput
              label='EMAIL DO PAGADOR'
              value={infoHolder.pagamento.pagador.email}
              placeholder='Preencha aqui o email do projeto.'
              handleChange={(value) =>
                setInfoHolder((prev) => ({
                  ...prev,
                  pagamento: {
                    ...prev.pagamento,
                    pagador: {
                      ...prev.pagamento.pagador,
                      email: value,
                    },
                  },
                }))
              }
              width='100%'
            />
          </div>
        </div>
        <h1 className='w-full rounded-md bg-blue-500 p-1 text-center text-sm font-bold text-primary-foreground'>MÉTODO DE PAGAMENTO</h1>
        <div className='my-1 flex w-full flex-col'>
          <p className='w-full text-center text-sm font-light tracking-tighter text-primary/70'>
            Escolha a metodologia de pagamento aplicável à esse projeto.
          </p>
          <p className='w-full text-center text-sm font-light tracking-tighter text-primary/70'>
            Lembrando que valores de fracionamento são meras aproximações.
          </p>
        </div>

        <div className='mb-6 flex w-full flex-col items-center justify-center rounded-sm border border-green-500'>
          <h1 className='w-full rounded-md rounded-tl rounded-tr bg-green-500 p-1 text-center text-sm font-bold text-primary-foreground'>
            MÉTODO DE PAGAMENTO ATIVO
          </h1>
          <div className='flex w-full items-center justify-center p-2'>
            <ActivePaymentMethod method={infoHolder.pagamento.metodo} saleValue={infoHolder.valor} />
          </div>
        </div>
        {isFinancing ? <CreditorBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} /> : null}
        <TextareaInput
          label='OBSERVAÇÕES DO PAGAMENTO'
          placeholder='Preencha aqui informações relevantes a cerca do pagamento...'
          value={infoHolder.pagamento.observacoes || ''}
          handleChange={(value) =>
            setInfoHolder((prev) => ({
              ...prev,
              pagamento: { ...prev.pagamento, observacoes: value },
            }))
          }
        />
      </div>
    </div>
  );
}

export default ReviewPaymentInformationBlock;
