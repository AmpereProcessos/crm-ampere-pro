import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';

import { TContractRequest } from '@/utils/schemas/integrations/app-ampere/contract-request.schema';
import React from 'react';
import { toast } from 'react-hot-toast';

type PAInfoProps = {
  requestInfo: TContractRequest;
  setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
  goToPreviousStage: () => void;
  goToNextStage: () => void;
};
function PAInfo({ requestInfo, setRequestInfo, goToPreviousStage, goToNextStage }: PAInfoProps) {
  function validateFields() {
    if (!requestInfo.aumentoDeCarga) {
      toast.error('Por favor, preencha se há aumento de carga.');
      return false;
    }
    if (requestInfo.aumentoDeCarga == 'SIM') {
      if (!requestInfo.caixaConjugada) {
        toast.error('Por favor, preencha se há caixa conjugada.');
        return false;
      }
      if (!requestInfo.tipoDePadrao) {
        toast.error('Por favor, preencha o tipo de padrão.');
        return false;
      }
      if (requestInfo.respTrocaPadrao == 'NÃO SE APLICA' && requestInfo.aumentoDeCarga == 'SIM') {
        toast.error('Por favor, preencha o responsável pela troca do padrão.');
        return false;
      }
      if ((requestInfo.formaPagamentoPadrao == 'NÃO SE APLICA' || !requestInfo.formaPagamentoPadrao) && requestInfo.aumentoDeCarga == 'SIM') {
        toast.error('Por favor, preencha a forma de pagamento do padrão.');
        return false;
      }
      if (requestInfo.valorPadrao == null) {
        toast.error('Por favor, preencha o valor do padrão.');
        return false;
      }
      return true;
    }
    return true;
  }
  return (
    <div className='flex w-full grow flex-col bg-background pb-2'>
      <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>AUMENTO DE CARGA</span>
      <div className='flex w-full grow flex-col'>
        <div className='mt-2 flex justify-center p-2'>
          <SelectInput
            label={'HAVERÁ TROCA DE PADRÃO/AUMENTO DE CARGA?'}
            editable={true}
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
            value={requestInfo.aumentoDeCarga}
            handleChange={(value) => setRequestInfo({ ...requestInfo, aumentoDeCarga: value })}
            resetOptionLabel='NÃO DEFINIDO'
            onReset={() => setRequestInfo((prev) => ({ ...prev, aumentoDeCarga: null }))}
          />
        </div>
        {requestInfo.aumentoDeCarga == 'SIM' ? (
          <div className='col-span-3 flex items-center justify-center'>
            <SelectInput
              label={'RESPONSÁVEL PELA TROCA'}
              editable={true}
              value={requestInfo.respTrocaPadrao}
              handleChange={(value) => setRequestInfo({ ...requestInfo, respTrocaPadrao: value })}
              options={[
                {
                  id: 1,
                  label: 'AMPERE',
                  value: 'AMPERE',
                },
                {
                  id: 2,
                  label: 'CLIENTE',
                  value: 'CLIENTE',
                },
                {
                  id: 3,
                  label: 'NÃO SE APLICA',
                  value: 'NÃO SE APLICA',
                },
              ]}
              resetOptionLabel='NÃO DEFINIDO'
              onReset={() => {
                setRequestInfo((prev) => ({
                  ...prev,
                  respTrocaPadrao: null,
                }));
              }}
            />
          </div>
        ) : null}

        {requestInfo.aumentoDeCarga == 'SIM' && (
          <div className='flex flex-col gap-2 p-2 lg:grid lg:grid-cols-3'>
            <div className='flex items-center justify-center'>
              <SelectInput
                width={'450px'}
                label={'TIPO DO PADRÃO'}
                editable={true}
                value={requestInfo.tipoDePadrao}
                handleChange={(value) => setRequestInfo({ ...requestInfo, tipoDePadrao: value })}
                options={[
                  {
                    label: 'MONO 40A',
                    value: 'MONO 40A',
                  },
                  {
                    label: 'MONO 63A',
                    value: 'MONO 63A',
                  },
                  {
                    label: 'BIFASICO 63A',
                    value: 'BIFASICO 63A',
                  },
                  {
                    label: 'BIFASICO 70A',
                    value: 'BIFASICO 70A',
                  },
                  {
                    label: 'BIFASICO 100A',
                    value: 'BIFASICO 100A',
                  },
                  {
                    label: 'BIFASICO 125A',
                    value: 'BIFASICO 125A',
                  },
                  {
                    label: 'BIFASICO 150A',
                    value: 'BIFASICO 150A',
                  },
                  {
                    label: 'BIFASICO 200A',
                    value: 'BIFASICO 200A',
                  },
                  {
                    label: 'TRIFASICO 63A',
                    value: 'TRIFASICO 63A',
                  },
                  {
                    label: 'TRIFASICO 100A',
                    value: 'TRIFASICO 100A',
                  },
                  {
                    label: 'TRIFASICO 125A',
                    value: 'TRIFASICO 125A',
                  },
                  {
                    label: 'TRIFASICO 150A',
                    value: 'TRIFASICO 150A',
                  },
                  {
                    label: 'TRIFASICO 200A',
                    value: 'TRIFASICO 200A',
                  },
                ].map((type, index) => {
                  return {
                    id: index + 1,
                    label: type.label,
                    value: type.value,
                  };
                })}
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => {
                  setRequestInfo((prev) => ({
                    ...prev,
                    tipoDePadrao: null,
                  }));
                }}
              />
            </div>
            <div className='flex items-center justify-center'>
              <SelectInput
                width={'450px'}
                label={'HAVERÁ AUMENTO DO DISJUNTOR?'}
                editable={true}
                value={requestInfo.aumentoDisjuntor}
                handleChange={(value) => setRequestInfo({ ...requestInfo, aumentoDisjuntor: value })}
                options={[
                  {
                    id: 1,
                    label: 'SIM',
                    value: 'SIM',
                  },
                  {
                    id: 2,
                    label: 'NÃO',
                    value: 'NÃO',
                  },
                ]}
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => {
                  setRequestInfo((prev) => ({
                    ...prev,
                    aumentoDisjuntor: null,
                  }));
                }}
              />
            </div>
            <div className='flex items-center justify-center'>
              <SelectInput
                width={'450px'}
                label={'CAIXA CONJUGADA?'}
                editable={true}
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
                value={requestInfo.caixaConjugada}
                handleChange={(value) => setRequestInfo({ ...requestInfo, caixaConjugada: value })}
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => {
                  setRequestInfo((prev) => ({ ...prev, caixaConjugada: null }));
                }}
              />
            </div>
            <h1 className='col-span-3 py-2 text-center font-bold text-[#fead61]'>PAGAMENTO</h1>
            <div className='col-span-3 flex flex-wrap items-center justify-center gap-2'>
              <SelectInput
                width={'450px'}
                label={'PAGAMENTO DO PADRÃO'}
                editable={true}
                value={requestInfo.formaPagamentoPadrao}
                options={[
                  {
                    id: 1,
                    label: 'CLIENTE IRÁ COMPRAR EM SEPARADO',
                    value: 'CLIENTE IRÁ COMPRAR EM SEPARADO',
                  },
                  {
                    id: 2,
                    label: 'CLIENTE PAGAR POR FORA',
                    value: 'CLIENTE PAGAR POR FORA',
                  },
                  {
                    id: 3,
                    label: 'INCLUSO NO CONTRATO',
                    value: 'INCLUSO NO CONTRATO',
                  },
                  {
                    id: 4,
                    label: 'NÃO HAVERA TROCA PADRÃO',
                    value: 'NÃO HAVERA TROCA PADRÃO',
                  },
                ]}
                handleChange={(value) => {
                  setRequestInfo({
                    ...requestInfo,
                    formaPagamentoPadrao: value,
                  });
                }}
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() =>
                  setRequestInfo((prev) => ({
                    ...prev,
                    formaPagamentoPadrao: null,
                  }))
                }
              />
              <NumberInput
                width={'450px'}
                label={'VALOR DO PADRÃO'}
                editable={true}
                value={requestInfo.valorPadrao ? requestInfo.valorPadrao : null}
                handleChange={(value) => setRequestInfo({ ...requestInfo, valorPadrao: Number(value) })}
                placeholder='Preencha aqui o valor do padrão.'
              />
            </div>
          </div>
        )}
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

export default PAInfo;
