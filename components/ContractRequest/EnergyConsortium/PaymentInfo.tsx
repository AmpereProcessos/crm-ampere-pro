import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { formatToCPForCNPJ, formatToPhone } from '@/utils/methods';
import { useCreditors } from '@/utils/queries/utils';
import { TContractRequest } from '@/utils/schemas/integrations/app-ampere/contract-request.schema';
import React from 'react';
import toast from 'react-hot-toast';

type PaymentInfoProps = {
  requestInfo: TContractRequest;
  setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
  goToPreviousStage: () => void;
  goToNextStage: () => void;
};
function PaymentInfo({ requestInfo, setRequestInfo, goToPreviousStage, goToNextStage }: PaymentInfoProps) {
  const { data: creditors } = useCreditors();

  function setPaymentInfoSameAsContract() {
    setRequestInfo((prev) => ({
      ...prev,
      nomePagador: prev.nomeDoContrato,
      contatoPagador: prev.telefone,
      cpf_cnpjNF: prev.cpf_cnpj,
    }));
  }
  function validateFields() {
    if (requestInfo.nomePagador.trim().length < 3) {
      toast.error('Por favor, preencha o nome do pagador.');
      return false;
    }
    if (requestInfo.contatoPagador.trim().length < 8) {
      toast.error('Por favor, preencha o contato do pagador.');
      return false;
    }
    if (requestInfo.cpf_cnpjNF.trim().length < 11) {
      toast.error('Por favor, preencha um CPF/CPNJ válido para NF');
      return false;
    }
    if (!requestInfo.necessidadeNFAdiantada) {
      toast.error('Por favor, preencha sobre a necessidade de NF adiantada.');
      return false;
    }
    if (!requestInfo.necessidaInscricaoRural) {
      toast.error('Por favor, preencha sobre a necessidade de faturamento por inscrição rural.');
      return false;
    }
    if (requestInfo.valorContrato == null || requestInfo.valorContrato == 0) {
      toast.error('Por favor, preencha o valor do contrato fotovoltaico.');
      return false;
    }
    if (!requestInfo.origemRecurso) {
      toast.error('Por favor, preencha a origem do recurso.');
      return false;
    }
    if (requestInfo.formaDePagamento == 'NÃO DEFINIDO') {
      toast.error('Por favor, preencha a forma de pagamento.');
      return false;
    }
    return true;
  }
  return (
    <div className='flex w-full grow flex-col bg-background pb-2'>
      <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>DADOS FINANCEIROS E NEGOCIAÇÃO</span>
      <div className='flex w-full grow flex-col'>
        <button
          onClick={() => setPaymentInfoSameAsContract()}
          className='w-fit self-center rounded-sm bg-[#15599a] p-2 text-xs font-medium text-primary-foreground'
        >
          Usar mesmas informações preenchidas para contrato
        </button>
        <div className='mt-2 flex flex-col gap-2 p-2 lg:grid lg:grid-cols-3'>
          <h1 className='col-span-3 py-2 text-center font-bold text-[#fead61]'>DADOS DO PAGADOR</h1>
          <div className='flex items-center justify-center'>
            <TextInput
              width={'450px'}
              label={'NOME DO PAGADOR'}
              placeholder='Preencha aqui o nome da pessoa/empresa que realizará o pagamento'
              editable={true}
              value={requestInfo.nomePagador}
              handleChange={(value) => setRequestInfo({ ...requestInfo, nomePagador: value })}
            />
          </div>
          <div className='flex items-center justify-center'>
            <TextInput
              width={'450px'}
              label={'CONTATO DO PAGADOR'}
              placeholder='Preencha aqui o contato da pessoa que realizará o pagamento'
              editable={true}
              value={requestInfo.contatoPagador}
              handleChange={(value) =>
                setRequestInfo({
                  ...requestInfo,
                  contatoPagador: formatToPhone(value),
                })
              }
            />
          </div>
          <div className='flex items-center justify-center'>
            <TextInput
              width={'450px'}
              label={'CPF/CNPJ PARA NF'}
              placeholder='Preencha aqui o CPF/CNPJ para faturamento do serviço/equipamentos.'
              editable={true}
              value={requestInfo.cpf_cnpjNF}
              handleChange={(value) =>
                setRequestInfo({
                  ...requestInfo,
                  cpf_cnpjNF: formatToCPForCNPJ(value),
                })
              }
            />
          </div>
        </div>
        <div className='flex flex-col p-2'>
          <h1 className='col-span-3 py-2 text-center font-bold text-[#fead61]'>SOBRE N.F</h1>
          <div className='mt-2 flex flex-wrap justify-around gap-2'>
            <SelectInput
              width={'450px'}
              label={'NECESSIDADE N.F ADIANTADA'}
              editable={true}
              value={requestInfo.necessidadeNFAdiantada}
              options={[
                {
                  id: 1,
                  label: 'NÃO',
                  value: 'NÃO',
                },
                {
                  id: 2,
                  label: 'SIM',
                  value: 'SIM',
                },
              ]}
              handleChange={(value) =>
                setRequestInfo({
                  ...requestInfo,
                  necessidadeNFAdiantada: value,
                })
              }
              resetOptionLabel='NÃO DEFINIDO'
              onReset={() => {
                setRequestInfo((prev) => ({
                  ...prev,
                  necessidadeNFAdiantada: null,
                }));
              }}
            />
            <SelectInput
              width={'450px'}
              label={'NECESSIDADE DE INSCRIÇÃO RURAL NA N.F?'}
              editable={true}
              value={requestInfo.necessidaInscricaoRural}
              handleChange={(value) =>
                setRequestInfo({
                  ...requestInfo,
                  necessidaInscricaoRural: value,
                })
              }
              options={[
                {
                  id: 1,
                  label: 'NÃO',
                  value: 'NÃO',
                },
                {
                  id: 2,
                  label: 'SIM',
                  value: 'SIM',
                },
              ]}
              resetOptionLabel='NÃO DEFINIDO'
              onReset={() => {
                setRequestInfo((prev) => ({
                  ...prev,
                  necessidaInscricaoRural: null,
                }));
              }}
            />
            {requestInfo.necessidaInscricaoRural == 'SIM' && (
              <TextInput
                width={'450px'}
                label={'INSCRIÇÃO RURAL'}
                placeholder='Preencha aqui a inscrição rural do cliente.'
                editable={true}
                value={requestInfo.inscriçãoRural}
                handleChange={(value) => setRequestInfo({ ...requestInfo, inscriçãoRural: value })}
              />
            )}
          </div>
        </div>

        <div className='flex flex-col p-2'>
          <h1 className='col-span-3 py-2 text-center font-bold text-[#fead61]'>SOBRE O PAGAMENTO</h1>
          <div className='mt-2 flex flex-col gap-2 lg:grid lg:grid-cols-3'>
            <div className='col-span-3 flex flex-col items-center justify-center gap-2'>
              <NumberInput
                width={'100%'}
                label={'VALOR FINAL DO SEGURO'}
                editable={true}
                value={requestInfo.valorContrato || null}
                placeholder={'Preencha aqui o valor final do seguro...'}
                handleChange={(value) =>
                  setRequestInfo((prev) => ({
                    ...prev,
                    valorContrato: Number(value),
                  }))
                }
              />
              <SelectInput
                width={'100%'}
                label={'ORIGEM DO RECURSO'}
                editable={true}
                value={requestInfo.origemRecurso}
                handleChange={(value) => setRequestInfo({ ...requestInfo, origemRecurso: value })}
                options={[
                  {
                    id: 1,
                    label: 'FINANCIAMENTO',
                    value: 'FINANCIAMENTO',
                  },
                  {
                    id: 2,
                    label: 'CAPITAL PRÓPRIO',
                    value: 'CAPITAL PRÓPRIO',
                  },
                ]}
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => {
                  setRequestInfo((prev) => ({ ...prev, origemRecurso: null }));
                }}
              />
            </div>
            {requestInfo.origemRecurso == 'FINANCIAMENTO' && (
              <div className='col-span-3 mt-2 flex flex-col gap-2 lg:grid lg:grid-cols-3'>
                <div className='flex items-center justify-center'>
                  <SelectInput
                    width={'450px'}
                    label={'CREDOR'}
                    editable={true}
                    options={creditors?.map((c) => ({ id: c._id, label: c.valor, value: c.valor })) || []}
                    value={requestInfo.credor}
                    handleChange={(value) => setRequestInfo({ ...requestInfo, credor: value })}
                    resetOptionLabel='NÃO DEFINIDO'
                    onReset={() => {
                      setRequestInfo((prev) => ({ ...prev, credor: null }));
                    }}
                  />
                </div>
                <div className='flex items-center justify-center'>
                  <TextInput
                    width={'450px'}
                    label={'NOME DO GERENTE'}
                    placeholder='Preencha aqui o nome do gerente.'
                    editable={true}
                    value={requestInfo.nomeGerente}
                    handleChange={(value) => setRequestInfo({ ...requestInfo, nomeGerente: value })}
                  />
                </div>
                <div className='flex items-center justify-center'>
                  <TextInput
                    width={'450px'}
                    label={'CONTATO DO GERENTE'}
                    placeholder='Preencha aqui o contato de telefone do gerente.'
                    editable={true}
                    value={requestInfo.contatoGerente}
                    handleChange={(value) =>
                      setRequestInfo({
                        ...requestInfo,
                        contatoGerente: formatToPhone(value),
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
          <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
            <div className='flex w-full items-center justify-center lg:w-1/2'>
              <NumberInput
                width={'100%'}
                label={'SE CARTÃO/CHEQUE/BOLETO, QUANTAS PARCELAS?'}
                placeholder='Preencha aqui o número de parcelas.'
                editable={true}
                value={requestInfo.numParcelas || null}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    numParcelas: Number(value),
                    valorParcela: requestInfo.valorContrato ? Number((requestInfo.valorContrato / Number(value)).toFixed(2)) : 0,
                  })
                }
              />
            </div>
            <div className='flex w-full items-center justify-center lg:w-1/2'>
              <NumberInput
                width={'100%'}
                label={'VALOR DA PARCELA'}
                placeholder='Preencha aqui o valor das parcelas.'
                editable={true}
                value={requestInfo.valorParcela || null}
                handleChange={(value) =>
                  setRequestInfo({
                    ...requestInfo,
                    valorParcela: Number(value),
                  })
                }
              />
            </div>
          </div>
          <div className='col-span-3 flex items-center justify-center'>
            <SelectInput
              width={'100%'}
              label={'FORMA DE PAGAMENTO'}
              editable={true}
              options={[
                {
                  id: 1,
                  label: 'NEGOCIAÇÃO DIFERENTE (DESCREVE ABAIXO)',
                  value: 'NEGOCIAÇÃO DIFERENTE (DESCREVE ABAIXO)',
                },
              ]}
              value={requestInfo.formaDePagamento}
              handleChange={(value) => setRequestInfo({ ...requestInfo, formaDePagamento: value })}
              resetOptionLabel='NÃO DEFINIDO'
              onReset={() => {
                setRequestInfo((prev) => ({
                  ...prev,
                  formaDePagamento: null,
                }));
              }}
            />
          </div>
        </div>
        <div className='mt-2 flex w-full flex-col items-center self-center px-2'>
          <span className='font-raleway text-center text-sm font-bold uppercase'>DESCRIÇÃO DA NEGOCIAÇÃO</span>
          <textarea
            placeholder={'Descreva aqui a negociação'}
            value={requestInfo.descricaoNegociacao}
            onChange={(e) =>
              setRequestInfo({
                ...requestInfo,
                descricaoNegociacao: e.target.value,
              })
            }
            className='block h-[80px] w-full resize-none rounded-lg border border-primary/30 bg-primary/10p-2.5 text-center text-primary/90 outline-hidden focus:border-blue-500 focus:ring-blue-500 dark:border-primary/60 dark:bg-primary/70  dark:placeholder-primary/40 dark:focus:border-blue-500 dark:focus:ring-blue-500'
          />
        </div>
      </div>
      <div className='mt-2 flex w-full flex-wrap justify-between  gap-2'>
        <button
          onClick={() => {
            goToPreviousStage();
          }}
          className='rounded p-2 font-bold text-primary/70 duration-300 hover:scale-105'
        >
          Voltar
        </button>
        <button
          onClick={() => {
            if (validateFields()) goToNextStage();
          }}
          className='rounded p-2 font-bold hover:bg-black hover:text-primary-foreground'
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default PaymentInfo;
