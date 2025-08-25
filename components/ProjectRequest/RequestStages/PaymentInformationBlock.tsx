import TextareaInput from '@/components/Inputs/TextareaInput';
import TextInput from '@/components/Inputs/TextInput';
import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import type { TUserSession } from '@/lib/auth/session';
import { formatToCPForCNPJ, formatToPhone } from '@/utils/methods';
import { usePaymentMethods } from '@/utils/queries/payment-methods';
import { TClientDTO } from '@/utils/schemas/client.schema';
import { TProject } from '@/utils/schemas/project.schema';
import React from 'react';
import toast from 'react-hot-toast';
import ActivePaymentMethod from './Utils/ActivePaymentMethod';
import CreditorBlock from './Utils/CreditorBlock';
import SelectablePaymentMethod from './Utils/SelectablePaymentMethod';

type PaymentInformationBlockProps = {
  infoHolder: TProject;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProject>>;
  client: TClientDTO;
  moveToNextStage: () => void;
  moveToPreviousStage: () => void;
  session: TUserSession;
};
function PaymentInformationBlock({ infoHolder, setInfoHolder, client, moveToNextStage, moveToPreviousStage, session }: PaymentInformationBlockProps) {
  const { data: methods, isLoading, isError, isSuccess } = usePaymentMethods();
  function validateAndProceed() {
    moveToNextStage();
  }
  function useClientData(client: TClientDTO) {
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
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-white'>INFORMAÇÕES DE PAGAMENTO</h1>
      <div className='flex w-full grow flex-col gap-2'>
        <div className='my-2 flex w-full items-center justify-center'>
          <button
            onClick={() => useClientData(client)}
            className='rounded-lg bg-blue-500 px-2 py-1 text-center text-xs font-medium tracking-tight text-white duration-300 ease-in-out hover:bg-blue-600'
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
        <h1 className='w-full rounded-md bg-blue-500 p-1 text-center text-sm font-bold text-white'>MÉTODO DE PAGAMENTO</h1>
        <div className='my-1 flex w-full flex-col'>
          <p className='w-full text-center text-sm font-light tracking-tighter text-primary/70'>
            Escolha a metodologia de pagamento aplicável à esse projeto.
          </p>
          <p className='w-full text-center text-sm font-light tracking-tighter text-primary/70'>
            Lembrando que valores de fracionamento são meras aproximações.
          </p>
        </div>

        <div className='mb-6 flex w-full flex-col items-center justify-center rounded-sm border border-green-500'>
          <h1 className='w-full rounded-md rounded-tl rounded-tr bg-green-500 p-1 text-center text-sm font-bold text-white'>
            MÉTODO DE PAGAMENTO ATIVO
          </h1>
          <div className='flex w-full items-center justify-center p-2'>
            <ActivePaymentMethod method={infoHolder.pagamento.metodo} saleValue={infoHolder.valor} />
          </div>
        </div>
        <h1 className='text-[0.65rem] font-bold leading-none tracking-tight text-primary/50 lg:text-xs'>LISTA DE MÉTODOS DE PAGAMENTO DISPONÍVEIS</h1>
        <div className='flex w-full grow flex-col gap-2'>
          {isLoading ? <LoadingComponent /> : null} {isError ? <ErrorComponent msg='Erro ao buscar métodos de pagamento.' /> : null}{' '}
          {isSuccess ? (
            methods.length > 0 ? (
              methods.map((method) => (
                <SelectablePaymentMethod
                  key={method._id}
                  method={{ id: method._id, nome: method.nome, descricao: method.descricao, fracionamento: method.fracionamento }}
                  selectMethod={(method) => {
                    setInfoHolder((prev) => ({ ...prev, pagamento: { ...prev.pagamento, metodo: method } }));
                    return toast.success('Metódo de pagamento escolhido com sucesso !');
                  }}
                  saleValue={infoHolder.valor}
                />
              ))
            ) : (
              <p className='w-full text-center text-sm font-medium tracking-tight text-primary/50'>Nenhuma método de pagamento encontrado.</p>
            )
          ) : null}
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
      <div className='flex w-full items-center justify-between'>
        <button
          onClick={() => {
            moveToPreviousStage();
          }}
          className='rounded p-2 font-bold text-primary/50 duration-300 hover:scale-105'
        >
          VOLTAR
        </button>
        <button
          onClick={() => validateAndProceed()}
          className='rounded bg-black px-4 py-1 text-sm font-medium text-white duration-300 ease-in-out hover:bg-primary/70'
        >
          PROSSEGUIR
        </button>
      </div>
    </div>
  );
}

export default PaymentInformationBlock;
