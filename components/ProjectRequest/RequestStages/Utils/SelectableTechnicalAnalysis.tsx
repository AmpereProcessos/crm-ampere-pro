import { BsCalendarCheck, BsCalendarPlus } from 'react-icons/bs';

import { TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema';

import Avatar from '@/components/utils/Avatar';
import { formatDateAsLocale, formatNameAsInitials, formatToMoney } from '@/lib/methods/formatting';

function getTagColor(status: string) {
  if (status == 'CONCLUIDO') {
    return 'bg-green-500';
  }
  if (status == 'EM ANÁLISE TÉCNICA') {
    return 'bg-yellow-500';
  }
  if (status == 'PENDÊNCIA COMERCIAL') {
    return 'bg-cyan-500';
  }
  if (status == 'VISITA IN LOCO') {
    return 'bg-indigo-500';
  }
  if (status == 'REJEITADA') {
    return 'bg-red-500';
  }

  return 'bg-blue-500';
}
function getStatusColor(status: string) {
  if (status == 'CONCLUIDO') {
    return (
      <h1 className='w-fit self-center rounded-sm border border-green-500 p-1 text-center text-[0.6rem] font-black text-green-500'>CONCLUIDO</h1>
    );
  }
  if (status == 'EM ANÁLISE TÉCNICA') {
    return (
      <h1 className='w-fit self-center rounded-sm border border-yellow-500 p-1 text-center text-[0.6rem] font-black text-yellow-500'>
        EM ANÁLISE TÉCNICA
      </h1>
    );
  }
  if (status == 'PENDÊNCIA COMERCIAL') {
    return (
      <h1 className='w-fit self-center rounded-sm border border-cyan-500 p-1 text-center text-[0.6rem] font-black text-cyan-500'>
        PENDÊNCIA COMERCIAL
      </h1>
    );
  }
  if (status == 'VISITA IN LOCO') {
    return (
      <h1 className='w-fit self-center rounded-sm border border-indigo-500 p-1 text-center text-[0.6rem] font-black text-indigo-500'>
        VISITA IN LOCO
      </h1>
    );
  }
  if (status == 'REJEITADA') {
    return <h1 className='w-fit self-center rounded-sm border border-red-500 p-1 text-center text-[0.6rem] font-black text-red-500'>REJEITADA</h1>;
  }
  return <h1 className='w-fit self-center rounded-sm border border-red-500 p-1 text-center text-[0.6rem] font-black text-red-500'>REJEITADA</h1>;
}

type SelectableTechnicalAnalysisProps = {
  analysis: TTechnicalAnalysisDTO;
  userHasPricingViewPermission: boolean;
  selectAnalysis: (id: string) => void;
};
function SelectableTechnicalAnalysis({ analysis, userHasPricingViewPermission, selectAnalysis }: SelectableTechnicalAnalysisProps) {
  return (
    <div className='relative flex w-full items-center rounded-md border border-primary/30'>
      <div className={`h-full w-[5px] rounded-bl-md rounded-tl-md ${getTagColor(analysis.status)}`}></div>
      <div className='flex grow flex-col p-3'>
        <div className='flex w-full grow flex-col gap-1'>
          <div className='flex w-full flex-col items-center justify-between gap-1 lg:flex-row lg:items-start'>
            <div className='flex grow flex-col items-center lg:items-start'>
              <h1 className='w-full text-center text-sm font-bold leading-none tracking-tight duration-300 lg:text-start'>
                {analysis.tipoSolicitacao || 'NÃO DEFINIDO'}
              </h1>
              <p className='mt-1 w-full text-center text-[0.6rem] font-medium text-primary/70 lg:text-start'>#{analysis._id}</p>
            </div>
            <div className='flex w-full min-w-fit items-center justify-center lg:w-fit'>{getStatusColor(analysis.status)}</div>
          </div>
        </div>
        <h1 className='my-2 mb-0 text-[0.65rem] font-bold leading-none tracking-tight text-primary/70 lg:text-xs'>CONCLUSÃO</h1>
        <h1 className='w-full rounded-md bg-primary/10 p-2 py-1 text-center text-xs font-medium text-primary/70'>
          {analysis.conclusao.observacoes || 'SEM OBSERVAÇÃO PARA A ANÁLISE'}
        </h1>
        <div className='mt-2 flex w-full flex-wrap items-center justify-around gap-2'>
          <div
            className={`flex w-full items-center justify-center gap-1 rounded-sm p-1 lg:w-fit ${analysis.conclusao.espaco ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}
          >
            <p className='text-center text-xs font-medium tracking-tight'>
              {analysis.conclusao.espaco ? 'POSSUI ESPAÇO PARA INSTALAÇÃO' : 'NÃO POSSUI ESPAÇO PARA INSTALAÇÃO'}
            </p>
          </div>
          <div
            className={`flex w-full items-center justify-center gap-1 rounded-sm p-1 lg:w-fit ${!analysis.conclusao.inclinacao ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}
          >
            <p className='text-center text-xs font-medium tracking-tight'>
              {!analysis.conclusao.inclinacao ? 'NÃO NECESSÁRIO ESTRUTURA DE INCLINAÇÃO' : 'NECESSÁRIO ESTRUTURA DE INCLINAÇÃO'}
            </p>
          </div>
          <div
            className={`flex w-full items-center justify-center gap-1 rounded-sm p-1 lg:w-fit ${!analysis.conclusao.sombreamento ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}
          >
            <p className='text-center text-xs font-medium tracking-tight'>
              {!analysis.conclusao.sombreamento ? 'NÃO SOFRERÁ COM SOMBREAMENTO' : 'SOFRERÁ COM SOMBREAMENTO'}
            </p>
          </div>
        </div>
        <h1 className='my-2 text-[0.65rem] font-bold leading-none tracking-tight text-primary/70 lg:text-xs'>CUSTOS ADICIONAIS</h1>
        <div className='mt-1 flex w-full flex-wrap items-center justify-around gap-2'>
          {analysis.custos.map((cost, index) => (
            <div key={index} className='flex items-center gap-2 rounded-sm border border-primary/50 p-2'>
              <h1 className='text-xs font-medium leading-none tracking-tight lg:text-sm'>{cost.descricao}</h1>
              {userHasPricingViewPermission ? (
                <h1 className='min-w-fit rounded-full bg-primary/80 px-2 py-1 text-[0.58rem] font-medium text-primary-foreground lg:text-xs'>
                  {formatToMoney(cost.total || 0)}
                </h1>
              ) : null}
            </div>
          ))}
        </div>
        <div className='mt-2 flex w-full flex-col items-center justify-end gap-2 lg:flex-row'>
          {analysis.dataEfetivacao ? (
            <div className={`flex items-center gap-1`}>
              <BsCalendarCheck color='rgb(34,197,94)' />
              <p className='text-[0.65rem] font-medium text-primary/70'>{formatDateAsLocale(analysis.dataEfetivacao, true)}</p>
            </div>
          ) : null}
          <div className={`flex items-center gap-1`}>
            <BsCalendarPlus />
            <p className='text-[0.65rem] font-medium text-primary/70'>{formatDateAsLocale(analysis.dataInsercao, true)}</p>
          </div>
          <div className='flex items-center gap-1'>
            <Avatar
              fallback={formatNameAsInitials(analysis.requerente.nome || 'R')}
              url={analysis.requerente.avatar_url || undefined}
              height={20}
              width={20}
            />
            <p className='text-[0.65rem] font-medium text-primary/70'>{analysis.requerente.nome}</p>
          </div>
        </div>
        <div className='mt-1 flex w-full items-center justify-end'>
          <button
            onClick={() => selectAnalysis(analysis._id)}
            className='rounded-full bg-blue-600 px-2 py-1 text-[0.65rem] font-bold text-primary-foreground duration-300 ease-in-out hover:bg-blue-700 lg:text-xs'
          >
            SELECIONAR
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectableTechnicalAnalysis;
