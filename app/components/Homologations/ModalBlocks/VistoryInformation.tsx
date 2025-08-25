import DateInput from '@/components/Inputs/DateInput';
import { formatDateOnInputChange } from '@/lib/methods/formatting';
import { formatDateForInputValue } from '@/utils/methods';
import { THomologationDTO } from '@/utils/schemas/homologation.schema';
import React from 'react';

type VistoryInformationProps = {
  infoHolder: THomologationDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<THomologationDTO>>;
};
function VistoryInformation({ infoHolder, setInfoHolder }: VistoryInformationProps) {
  return (
    <div className='flex w-full flex-col gap-2'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-white'>INFORMAÇÕES SOBRE A VISTORIA</h1>
      <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
        <div className='w-full lg:w-1/2'>
          <DateInput
            label='DATA DE SOLICITAÇÃO DA VISTORIA'
            value={formatDateForInputValue(infoHolder.vistoria.dataSolicitacao)}
            handleChange={(value) =>
              setInfoHolder((prev) => ({ ...prev, vistoria: { ...prev.vistoria, dataSolicitacao: formatDateOnInputChange(value) } }))
            }
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/2'>
          <DateInput
            label='DATA DE EXECUÇÃO DA VISTORIA'
            value={formatDateForInputValue(infoHolder.vistoria.dataEfetivacao)}
            handleChange={(value) =>
              setInfoHolder((prev) => ({ ...prev, vistoria: { ...prev.vistoria, dataEfetivacao: formatDateOnInputChange(value) } }))
            }
            width='100%'
          />
        </div>
      </div>
    </div>
  );
}

export default VistoryInformation;
