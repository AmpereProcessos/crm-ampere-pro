import TextareaInput from '@/components/Inputs/TextareaInput';
import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import { useTechnicalAnalysisById } from '@/utils/queries/technical-analysis';
import { FaRegCompass } from 'react-icons/fa';
import { MdOutlineRoofing, MdSettingsInputComponent } from 'react-icons/md';
import { RxSquare } from 'react-icons/rx';
import { TbAtom } from 'react-icons/tb';

type TechnicalAnalysisInformationProps = {
  analysisId: string;
};
function TechnicalAnalysisInformation({ analysisId }: TechnicalAnalysisInformationProps) {
  const { data: analysis, isLoading, isError, isSuccess } = useTechnicalAnalysisById({ id: analysisId });
  return (
    <div className='flex w-full flex-col gap-y-2 py-2'>
      {isLoading ? <LoadingComponent /> : null}
      {isError ? <ErrorComponent msg='Houve um erro ao buscar informações da análise técnica.' /> : null}
      {isSuccess ? (
        <>
          <h1 className='w-full bg-primary/50 p-1 text-center text-xs font-medium text-white'>DETALHES</h1>
          <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
            <div className='flex flex-col items-center gap-1 lg:items-start'>
              <div className='flex items-center gap-1'>
                <TbAtom size={12} />
                <p className='text-[0.65rem] font-medium text-primary/50'>MATERIAL DA ESTRUTURA</p>
              </div>
              <p className='text-[0.6rem] font-medium leading-none tracking-tight'>{analysis.detalhes.materialEstrutura || 'NÃO DEFINIDO'}</p>
            </div>
            <div className='flex flex-col items-center gap-1 lg:items-end'>
              <div className='flex items-center gap-1'>
                <MdOutlineRoofing size={12} />
                <p className='text-[0.65rem] font-medium text-primary/50'>TIPO DA ESTRUTURA</p>
              </div>
              <p className='text-[0.6rem] font-medium leading-none tracking-tight'>{analysis.detalhes.tipoEstrutura || 'NÃO DEFINIDO'}</p>
            </div>
          </div>
          <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
            <div className='flex flex-col items-center gap-1 lg:items-start'>
              <div className='flex items-center gap-1'>
                <FaRegCompass size={12} />
                <p className='text-[0.65rem] font-medium text-primary/50'>ORIENTAÇÃO</p>
              </div>
              <p className='text-[0.6rem] font-medium leading-none tracking-tight'>{analysis.detalhes.orientacao || 'NÃO DEFINIDO'}</p>
            </div>
            <div className='flex flex-col items-center gap-1 lg:items-end'>
              <div className='flex items-center gap-1'>
                <RxSquare size={12} />
                <p className='text-[0.65rem] font-medium text-primary/50'>TIPO DA TELHA</p>
              </div>
              <p className='text-[0.6rem] font-medium leading-none tracking-tight'>{analysis.detalhes.tipoTelha || 'NÃO DEFINIDO'}</p>
            </div>
          </div>
          <h1 className='w-full bg-primary/50 p-1 text-center text-xs font-medium text-white'>SUPRIMENTOS</h1>
          <div className='flex items-center gap-1'>
            <MdSettingsInputComponent size={12} />
            <p className='text-[0.65rem] font-medium text-primary/50'>ITENS DE INSUMO</p>
          </div>
          <div className='flex w-full flex-wrap items-center gap-2'>
            {analysis.suprimentos?.itens.map((item, index) => (
              <div key={index} className='rounded border border-primary/50 bg-[#f8f8f8] p-2 text-center shadow-md'>
                <p className='text-[0.6rem] font-medium leading-none tracking-tight'>
                  {item.qtde} x {item.descricao}
                </p>
              </div>
            ))}
          </div>
          <TextareaInput
            label='OBSERVAÇÕES PARA SUPRIMENTAÇÃO'
            editable={false}
            value={analysis.suprimentos?.observacoes || ''}
            handleChange={(value) => {}}
            placeholder='Observações e detalhes da suprimentação...'
          />
        </>
      ) : null}
    </div>
  );
}

export default TechnicalAnalysisInformation;
