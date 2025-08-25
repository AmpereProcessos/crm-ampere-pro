import { formatDateAsLocale, formatNameAsInitials } from '@/lib/methods/formatting';
import { TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema';
import { BsCalendarCheck, BsCalendarPlus } from 'react-icons/bs';
import Avatar from '../utils/Avatar';

type TechnicalAnalysisVinculationCardProps = {
  analysis: TTechnicalAnalysisDTO;
  selectedId?: string | null;
  handleClick: (info: TTechnicalAnalysisDTO) => void;
};
function TechnicalAnalysisVinculationCard({ analysis, selectedId, handleClick }: TechnicalAnalysisVinculationCardProps) {
  return (
    <div className='flex w-full items-center rounded-md border border-primary/30'>
      <div className='flex grow flex-col p-3'>
        <div className='flex w-full items-center justify-between gap-2'>
          <h1 className='font-Inter font-bold leading-none tracking-tight'>{analysis.nome}</h1>
          {selectedId == analysis._id ? (
            <button className='rounded-full bg-green-500 px-2 py-1 text-xs font-bold text-primary-foreground'>SELECIONADO</button>
          ) : (
            <button onClick={() => handleClick(analysis)} className='rounded-full bg-cyan-500 px-2 py-1 text-xs font-bold text-primary-foreground'>
              SELECIONAR ANÁLISE
            </button>
          )}
        </div>
        <div className='mt-1 flex w-full items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Avatar
              url={analysis.requerente.avatar_url || undefined}
              fallback={formatNameAsInitials(analysis.requerente.nome || analysis.requerente.apelido)}
              height={25}
              width={25}
            />
            <p className='text-xs font-medium'>{analysis.requerente.nome || analysis.requerente.apelido}</p>
            <div className={`flex items-center gap-2`}>
              <BsCalendarPlus />
              <p className='text-xs font-medium'>{formatDateAsLocale(analysis.dataInsercao, true)}</p>
            </div>

            {analysis.dataEfetivacao ? (
              <div className={`flex items-center gap-2 text-green-500`}>
                <BsCalendarCheck />
                <p className='text-xs font-medium'>{formatDateAsLocale(analysis.dataEfetivacao, true)}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TechnicalAnalysisVinculationCard;
