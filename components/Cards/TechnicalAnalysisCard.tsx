import { FaDiamond, FaLocationDot } from 'react-icons/fa6';
import { MdTimer } from 'react-icons/md';

import { getHoursDiff } from '@/lib/methods/dates';
import { formatDateAsLocale, formatDecimalPlaces, formatNameAsInitials } from '@/lib/methods/formatting';
import { TTechnicalAnalysisDTOSimplified } from '@/utils/schemas/technical-analysis.schema';
import { BsCalendarCheck, BsCalendarPlus, BsCode } from 'react-icons/bs';
import { TbWorld } from 'react-icons/tb';
import Avatar from '../utils/Avatar';

const StatusColors = {
  CONCLUIDO: 'bg-green-500',
  'EM ANÁLISE TÉCNICA': 'bg-yellow-500',
  'PENDÊNCIA COMERCIAL': 'bg-cyan-500',
  'PENDÊNCIA OPERACIONAL': 'bg-indigo-500',
  REJEITADA: 'bg-red-300',
  PENDENTE: 'bg-primary/50',
};

function getBarColor(status: string) {
  const color = StatusColors[status as keyof typeof StatusColors];
  if (!color) return 'bg-primary/50';
  return color;
  // if (status == 'CONCLUIDO') return 'bg-green-500'
  // if (status == 'EM ANÁLISE TÉCNICA') return 'bg-yellow-500'
  // if (status == 'PENDÊNCIA COMERCIAL') return 'bg-cyan-500'
  // if (status == 'PENDÊNCIA OPERACIONAL') return 'bg-indigo-500'
  // if (status == 'REJEITADA') return 'bg-red-300'
  // return 'bg-primary/50'
}
function getStatusTag(status: string) {
  const color = StatusColors[status as keyof typeof StatusColors] || 'bg-primary/50';
  return <h1 className={`rounded-full ${color} px-2 py-1 text-center text-[0.65rem] font-bold text-primary-foreground lg:text-xs`}>{status}</h1>;
}

type TechnicalAnalysisCardProps = {
  analysis: TTechnicalAnalysisDTOSimplified;
  handleClick: (id: string) => void;
  userHasEditPermission: boolean;
};
function TechnicalAnalysisCard({ analysis, handleClick, userHasEditPermission }: TechnicalAnalysisCardProps) {
  return (
    <div key={analysis._id} className='flex min-h-[180px] w-full gap-2 rounded-md border border-primary/50 bg-background shadow-md lg:w-[500px]'>
      <div className={`h-full w-[7px] ${getBarColor(analysis.status)} rounded-bl-md rounded-tl-md`}></div>
      <div className='flex w-full grow flex-col p-4'>
        <div className='flex w-full grow flex-col'>
          <div className='flex w-full items-center justify-between gap-2'>
            {userHasEditPermission ? (
              <h1
                onClick={() => handleClick(analysis._id)}
                className='grow cursor-pointer text-center text-sm font-black leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500 lg:text-start'
              >
                {analysis.nome || 'NÃO DEFINIDO'}
              </h1>
            ) : (
              <h1 className='text-sm font-black leading-none tracking-tight'>{analysis.nome}</h1>
            )}

            {getStatusTag(analysis.status)}
          </div>
          <div className='flex w-full items-center gap-2'>
            <FaDiamond />
            <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>{analysis.tipoSolicitacao}</p>
          </div>
          <div className='mt-2 flex w-full items-center justify-between'>
            <div className='flex items-center gap-2'>
              <BsCode size={18} />
              <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>
                {analysis.oportunidade.nome || 'OPORTUNIDADE NÃO VINCULADA'}
              </p>
            </div>
            <div className='flex items-end gap-2'>
              <TbWorld size={18} />
              <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>
                {analysis.complexidade || 'COMPLEXIDADE NÃO DEFINIDA'}
              </p>
            </div>
          </div>
          <div className='mt-2 flex w-full items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Avatar
                url={analysis.requerente.avatar_url || undefined}
                fallback={formatNameAsInitials(analysis.requerente.nome || 'U')}
                width={20}
                height={20}
              />
              <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>
                REQUERIDO POR <strong className='text-cyan-500'>{analysis.requerente.nome?.toUpperCase() || 'NÃO DEFINIDO'}</strong>
              </p>
            </div>
            <div className='flex items-end gap-2'>
              <FaLocationDot size={18} />
              <p className='text-[0.65rem] font-medium leading-none tracking-tight text-primary/70 lg:text-xs'>
                {analysis.localizacao.cidade || ''} / {analysis.localizacao.uf || ''}
              </p>
            </div>
          </div>

          {/* <div className="mt-1 flex w-full items-center justify-start gap-2">
            <Avatar fallback={'R'} url={analysis.requerente?.avatar_url || undefined} height={20} width={20} />
            <p className="text-xs font-medium text-primary/70">{analysis.requerente.nome || analysis.requerente.apelido}</p>
          </div>
          <div className="mt-2 flex w-full items-center justify-center gap-2">
            {analysis.oportunidade.identificador ? (
              <p className="text-xs font-bold leading-none tracking-tight text-[#fead41]">({analysis.oportunidade.identificador})</p>
            ) : null}
            <p className="text-xs font-semibold leading-none tracking-tight text-primary/70">{analysis.oportunidade.nome || 'NÃO DEFINIDO'}</p>
          </div> */}
        </div>
        <div className='lg:0 mt-2 flex w-full flex-col-reverse items-center justify-between gap-1 lg:flex-row lg:gap-2'>
          <div className='flex items-center gap-2'>
            {analysis.dataEfetivacao ? (
              <>
                <div className='flex items-center gap-1'>
                  <BsCalendarCheck color='rgb(34,197,94)' />
                  <p className='text-[0.65rem] font-medium text-primary/70'>{formatDateAsLocale(analysis.dataEfetivacao, true)}</p>
                </div>
                <div className='flex items-center gap-1'>
                  <MdTimer color='rgb(37,99,235)' />
                  <p className='text-[0.55rem] text-primary/70'>
                    {formatDecimalPlaces(getHoursDiff({ start: analysis.dataInsercao, finish: analysis.dataEfetivacao }), 0, 2)}h
                  </p>
                </div>
              </>
            ) : null}
          </div>
          <div className='flex flex-col items-center gap-2 lg:flex-row'>
            <div className={`flex items-center gap-1`}>
              <BsCalendarPlus />
              <p className='text-[0.65rem] font-medium text-primary/70'>{formatDateAsLocale(analysis.dataInsercao, true)}</p>
            </div>
            <div className='flex items-center gap-1'>
              <Avatar fallback={'R'} url={analysis.analista?.avatar_url || undefined} height={20} width={20} />
              <p className='text-[0.65rem] font-medium text-primary/70'>{analysis.analista?.nome || 'ANALISTA INDEFINIDO'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TechnicalAnalysisCard;
