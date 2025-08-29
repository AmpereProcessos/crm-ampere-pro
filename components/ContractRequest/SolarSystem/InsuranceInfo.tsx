import CheckboxInput from '@/components/Inputs/CheckboxInput';
import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import { TContractRequest } from '@/utils/schemas//contract-request.schema';
import React from 'react';
import toast from 'react-hot-toast';

type InsuranceInfoProps = {
  requestInfo: TContractRequest;
  setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
  goToNextStage: () => void;
  goToPreviousStage: () => void;
};
function InsuranceInfo({ requestInfo, setRequestInfo, goToNextStage, goToPreviousStage }: InsuranceInfoProps) {
  function validateAndProceed() {
    if (requestInfo.clienteSegurado == 'SIM') {
      if (requestInfo.valorSeguro <= 0) return toast.error('Preencha um valor válido para o seguro');
      if (requestInfo.tempoSegurado == 'NÃO SE APLICA') return toast.error('Preencha o tempo de seguro aplicado.');
    }
    return goToNextStage();
  }
  return (
    <div className='flex w-full grow flex-col bg-background pb-2'>
      <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>SEGURO</span>
      <div className='flex grow flex-col gap-2 p-2'>
        <div className='flex w-full items-center justify-center'>
          <div className='w-fit'>
            <CheckboxInput
              labelFalse='CLIENTE SEGURADO'
              labelTrue='CLIENTE SEGURO'
              checked={requestInfo.clienteSegurado == 'SIM'}
              handleChange={(value) => setRequestInfo((prev) => ({ ...prev, clienteSegurado: !!value ? 'SIM' : 'NÃO' }))}
            />
          </div>
        </div>
        {requestInfo.clienteSegurado == 'SIM' ? (
          <div className='flex w-[70%] flex-col items-center gap-2 self-center lg:flex-row'>
            <div className='w-[50%] lg:w-full'>
              <NumberInput
                label='VALOR DO SEGURO'
                value={requestInfo.valorSeguro}
                placeholder='Preencha o valor do seguro...'
                handleChange={(value) => setRequestInfo((prev) => ({ ...prev, valorSeguro: value }))}
                width='100%'
              />
            </div>
            <div className='w-[50%] lg:w-full'>
              <SelectInput
                label='TEMPO SEGURADO'
                value={requestInfo.tempoSegurado}
                options={[
                  { id: 1, value: '1 ANO', label: '1 ANO' },
                  { id: 2, value: 'NÃO SE APLICA', label: 'NÃO SE APLICA' },
                ]}
                handleChange={(value) => setRequestInfo((prev) => ({ ...prev, tempoSegurado: value }))}
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => setRequestInfo((prev) => ({ ...prev, tempoSegurado: 'NÃO SE APLICA' }))}
              />
            </div>
          </div>
        ) : null}
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
            validateAndProceed();
          }}
          className='rounded p-2 font-bold hover:bg-black hover:text-primary-foreground'
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default InsuranceInfo;
