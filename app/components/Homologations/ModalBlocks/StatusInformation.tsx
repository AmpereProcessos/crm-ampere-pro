import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import { THomologation } from '@/utils/schemas/homologation.schema';
import { HomologationControlStatus } from '@/utils/select-options';
import React from 'react';

type StatusInformationProps = {
  infoHolder: THomologation;
  setInfoHolder: React.Dispatch<React.SetStateAction<THomologation>>;
};

function StatusInformation({ infoHolder, setInfoHolder }: StatusInformationProps) {
  return (
    <div className='flex w-full flex-col gap-2'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-primary-foreground'>CONTROLE</h1>
      <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
        <div className='w-full lg:w-1/2'>
          <SelectInput
            label='STATUS'
            options={HomologationControlStatus}
            value={infoHolder.status}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, status: value }))}
            resetOptionLabel='NÃO DEFINIDO'
            onReset={() => setInfoHolder((prev) => ({ ...prev, status: 'PENDENTE' }))}
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/2'>
          <NumberInput
            label='POTÊNCIA PARA HOMOLOGAÇÃO'
            placeholder='Preencha aqui a potência a ser homologada...'
            value={infoHolder.potencia || null}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, potencia: value }))}
            width='100%'
          />
        </div>
      </div>
    </div>
  );
}

export default StatusInformation;
