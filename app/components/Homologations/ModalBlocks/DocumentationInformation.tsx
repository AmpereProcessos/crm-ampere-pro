import DateInput from '@/components/Inputs/DateInput';
import { formatDateOnInputChange } from '@/lib/methods/formatting';
import { formatDateForInputValue } from '@/utils/methods';
import { THomologationDTO } from '@/utils/schemas/homologation.schema';
import React from 'react';

type DocumentationInformationProps = {
  infoHolder: THomologationDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<THomologationDTO>>;
};
function DocumentationInformation({ infoHolder, setInfoHolder }: DocumentationInformationProps) {
  return (
    <div className='flex w-full flex-col gap-2'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-white'>INFORMAÇÕES SOBRE A DOCUMENTAÇÃO</h1>
      <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
        <div className='w-full lg:w-1/2'>
          <DateInput
            label='DATA DE LIBERAÇÃO PARA ASSINATURA'
            value={formatDateForInputValue(infoHolder.documentacao.dataLiberacao)}
            handleChange={(value) =>
              setInfoHolder((prev) => ({ ...prev, documentacao: { ...prev.documentacao, dataLiberacao: formatDateOnInputChange(value) } }))
            }
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/2'>
          <DateInput
            label='DATA DE ASSINATURA DA DOCUMENTAÇÃO'
            value={formatDateForInputValue(infoHolder.documentacao.dataAssinatura)}
            handleChange={(value) =>
              setInfoHolder((prev) => ({ ...prev, documentacao: { ...prev.documentacao, dataAssinatura: formatDateOnInputChange(value) } }))
            }
            width='100%'
          />
        </div>
      </div>
      <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
        <div className='w-full lg:w-1/2'>
          <DateInput
            label='INÍCIO DA ELABORAÇÃO DAS DOCUMENTAÇÕES'
            value={formatDateForInputValue(infoHolder.documentacao.dataInicioElaboracao)}
            handleChange={(value) =>
              setInfoHolder((prev) => ({ ...prev, documentacao: { ...prev.documentacao, dataInicioElaboracao: formatDateOnInputChange(value) } }))
            }
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/2'>
          <DateInput
            label='CONCLUSÃO DA ELABORAÇÃO DAS DOCUMENTAÇÕES'
            value={formatDateForInputValue(infoHolder.documentacao.dataConclusaoElaboracao)}
            handleChange={(value) =>
              setInfoHolder((prev) => ({ ...prev, documentacao: { ...prev.documentacao, dataConclusaoElaboracao: formatDateOnInputChange(value) } }))
            }
            width='100%'
          />
        </div>
      </div>
    </div>
  );
}

export default DocumentationInformation;
