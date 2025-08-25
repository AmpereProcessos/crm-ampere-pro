import TextInput from '@/components/Inputs/TextInput';
import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import { useUserTechnicalAnalysis } from '@/utils/queries/technical-analysis';
import { TTechnicalAnalysis } from '@/utils/schemas/technical-analysis.schema';
import dayjs from 'dayjs';
import React from 'react';
import { BsCalendarFill, BsFillCalendarCheckFill } from 'react-icons/bs';
type AnalysisVinculationProps = {
  requestInfo: TTechnicalAnalysis;
  setRequestInfo: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
  goToNextStage: () => void;
  resetSolicitationType: () => void;
};
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
    return 'border-green-500 text-green-500';
  }
  if (status == 'EM ANÁLISE TÉCNICA') {
    return 'border-yellow-500 text-yellow-500';
  }
  if (status == 'PENDÊNCIA COMERCIAL') {
    return 'border-cyan-500 text-cyan-500';
  }
  if (status == 'VISITA IN LOCO') {
    return 'border-indigo-500 text-indigo-500';
  }
  if (status == 'REJEITADA') {
    return 'border-red-500 text-red-500';
  }

  return 'border-primary/50 text-primary/50';
}
function AnalysisVinculation({ requestInfo, setRequestInfo, resetSolicitationType, goToNextStage }: AnalysisVinculationProps) {
  const {
    data: technicalAnalysis,
    isSuccess,
    isLoading,
    isError,
    filters,
    setFilters,
  } = useUserTechnicalAnalysis({
    enabled: true,
    userId: null,
    status: 'TODOS',
  });
  function handleVinculation(analysis: TTechnicalAnalysis) {
    const copyAnalsysis = { ...analysis } as any;
    delete copyAnalsysis._id;
    delete copyAnalsysis.requerente;
    setRequestInfo((prev) => ({ ...prev, ...copyAnalsysis }));
    goToNextStage();
  }

  return (
    <div className='flex w-full grow flex-col bg-background px-2'>
      <span className='text-center text-lg font-bold uppercase text-[#15599a]'>VINCULO DE ANÁLISE PRÉVIA</span>
      <p className='mb-4 text-center text-primary/50'>
        Utilizaremos das informações de uma análise prévia para que você possa reutilizar informações já preenchidas e alterar somente o que desejar.
      </p>
      <div className='flex w-full grow flex-col gap-2'>
        <span className='rounded bg-black py-2 text-center text-lg font-bold uppercase text-white'>ANÁLISES TÉCNICAS PRÉVIAS</span>
        {isError ? <ErrorComponent msg='Erro ao buscar clientes similares...' /> : null}
        {isLoading ? <LoadingComponent /> : null}
        {isSuccess ? (
          <div className='flex w-full grow flex-col gap-2'>
            <TextInput
              label='NOME DO PROJETO'
              placeholder='Pesquise o projeto pelo nome do projeto...'
              value={filters.search}
              handleChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
              width='100%'
            />
            {technicalAnalysis.length > 0 ? (
              technicalAnalysis.map((analysis) => (
                <div key={analysis._id} className='flex w-full items-center rounded-md border border-primary/30'>
                  <div className={`h-full w-[5px] rounded-bl-md rounded-tl-md ${getTagColor(analysis.status)}`}></div>
                  <div className='flex grow flex-col p-3'>
                    <div className='flex w-full items-start justify-between'>
                      <div className='flex flex-col'>
                        <h1 className='w-full text-start text-sm font-bold leading-none tracking-tight'>{analysis.tipoSolicitacao}</h1>

                        <p className='mt-1 text-[0.6rem] font-bold text-primary/50'>
                          <strong className='text-[#fead41]'>{analysis.projeto.identificador}</strong> {analysis.projeto.nome}
                        </p>
                      </div>
                      <h1
                        className={`w-fit self-center rounded-sm border p-1 text-center text-[0.6rem] font-black ${getStatusColor(analysis.status)}`}
                      >
                        {analysis.status || 'NÃO DEFINIDO'}
                      </h1>
                    </div>

                    <div className='mt-1 flex w-full items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <p className='text-xs font-medium'>{analysis.requerente.nomeCRM || analysis.requerente.apelido}</p>
                        <div className={`flex items-center gap-2 text-primary/50`}>
                          <BsCalendarFill />
                          <p className='text-xs font-medium'>{dayjs(analysis.dataInsercao).format('DD/MM/YYYY HH:mm')}</p>
                        </div>

                        {analysis.dataEfetivacao ? (
                          <div className={`flex items-center gap-2 text-green-500`}>
                            <BsFillCalendarCheckFill />
                            <p className='text-xs font-medium'>{dayjs(analysis.dataEfetivacao).format('DD/MM/YYYY HH:mm')}</p>
                          </div>
                        ) : null}
                      </div>
                      <button
                        onClick={() => handleVinculation(analysis)}
                        className='rounded border border-cyan-500 p-1 text-xs font-medium text-cyan-500 duration-300 ease-in-out hover:bg-cyan-500 hover:text-white'
                      >
                        VINCULAR
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='flex items-center justify-center'>
                <p className='text-center text-primary/50'>Oops, não conseguimos encontrar nenhuma visita recente requirida por você.</p>
              </div>
            )}
          </div>
        ) : null}

        <div className='mt-2 flex w-full justify-between'>
          <button onClick={() => resetSolicitationType()} className='rounded p-2 font-bold text-primary/50 duration-300 ease-in-out hover:scale-105'>
            Voltar
          </button>
          {/* <button
            onClick={() => {
              if (validateFields()) {
                goToNextStage()
              }
            }}
            className="rounded p-2 font-bold hover:bg-black hover:text-white"
          >
            Prosseguir
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default AnalysisVinculation;
