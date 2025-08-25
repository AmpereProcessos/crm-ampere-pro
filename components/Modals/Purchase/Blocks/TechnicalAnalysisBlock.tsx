import CheckboxInput from '@/components/Inputs/CheckboxInput';
import { useState } from 'react';
import TechnicalAnalysisInformation from './Utils/TechnicalAnalysisInformation';

type TechnicalAnalysisBlockProps = {
  analysisId?: string | null;
};
function TechnicalAnalysisBlock({ analysisId }: TechnicalAnalysisBlockProps) {
  const [showInfo, setShowInfo] = useState<boolean>(false);
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full rounded-sm bg-primary/70 p-1 text-center font-bold text-primary-foreground'>INFORMAÇÕES DA ANÁLISE TÉCNICA</h1>
      <div className='flex w-full grow flex-wrap justify-around gap-2'>
        {!analysisId ? (
          <p className='w-full text-center text-xs font-medium italic text-primary/70'>Não há análise técnica disponível.</p>
        ) : (
          <div className='flex w-full items-center justify-center py-2'>
            <div className='w-fit'>
              <CheckboxInput
                labelFalse='MOSTRAR INFORMAÇÕES'
                labelTrue='MOSTRAR INFORMAÇÕES'
                checked={showInfo}
                handleChange={(value) => setShowInfo(value)}
              />
            </div>
          </div>
        )}
      </div>
      {showInfo && analysisId ? <TechnicalAnalysisInformation analysisId={analysisId} /> : null}
    </div>
  );
}

export default TechnicalAnalysisBlock;
