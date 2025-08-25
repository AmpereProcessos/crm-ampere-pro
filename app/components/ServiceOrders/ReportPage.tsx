'use client';
import Avatar from '@/components/utils/Avatar';
import ErrorComponent from '@/components/utils/ErrorComponent';
import { uploadFile } from '@/lib/methods/firebase';
import { formatLocation, formatNameAsInitials } from '@/lib/methods/formatting';
import { renderCategoryIcon } from '@/lib/methods/rendering';
import { createManyFileReferences } from '@/utils/mutations/file-references';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { editServiceOrderPersonalized } from '@/utils/mutations/service-orders';
import { TFileReference } from '@/utils/schemas/file-reference.schema';
import { TServiceOrderWithProjectAndAnalysisDTO } from '@/utils/schemas/service-order.schema';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { BsFillClipboardCheckFill } from 'react-icons/bs';
import { FaPhone, FaUser } from 'react-icons/fa';
import { FaDiamond, FaLocationDot } from 'react-icons/fa6';
import { MdMenu } from 'react-icons/md';
import { TbUrgent } from 'react-icons/tb';
import { VscDebugBreakpointLog } from 'react-icons/vsc';
import ReportPageSession from './ReportPageSession';

function renderExecutionObservations(observations: TServiceOrderWithProjectAndAnalysisDTO['observacoes']) {
  const groupedObservations = observations.reduce((acc: { [key: string]: string[] }, obs) => {
    if (!acc[obs.topico]) acc[obs.topico] = [];
    acc[obs.topico].push(obs.descricao);
    return acc;
  }, {});
  return Object.entries(groupedObservations).map(([topic, observations], topicIndex) => (
    <div key={topicIndex} className='flex w-full flex-col gap-1'>
      <div className='flex items-center gap-1'>
        <VscDebugBreakpointLog />
        <h2 className='text-[0.85rem] font-bold tracking-tight'>{topic}</h2>
      </div>
      <ul className='list-disc pl-4'>
        {observations.map((obs, obsIndex) => (
          <li className='text-[0.8rem] font-medium text-primary/80' key={obsIndex}>
            {obs}
          </li>
        ))}
      </ul>
    </div>
  ));
}

export type TServiceOrderReportSessionControls = {
  [key: string]: {
    titulo: string;
    efetivado: boolean;
  }[];
};
export type TServiceOrderReportSessionFiles = {
  [key: string]: {
    titulo: string;
    arquivo: FileList | null;
  }[];
};
type ReportPageProps = {
  user: Session['user'];
  order: TServiceOrderWithProjectAndAnalysisDTO;
};
function ReportPage({ user, order }: ReportPageProps) {
  const queryClient = useQueryClient();
  if (!order.relatorio.aplicavel) return <ErrorComponent msg='Relatório não aplicável à ordem de serviço.' />;
  const sessionWithoutConclusionIndex = order.relatorio.secoes.findIndex((t) => !t.dataConclusao);
  const allSessionsConcluded = sessionWithoutConclusionIndex == -1;
  if (allSessionsConcluded) return <ErrorComponent msg='Relatório já finalizado.' />;
  if (order.relatorio.secoes.length == 0) return <ErrorComponent msg='Nenhuma seção encontrada no relatório.' />;

  const reportSessions = order.relatorio.secoes;
  const reportSessionsControls = order.relatorio.secoes.reduce((acc: TServiceOrderReportSessionControls, s) => {
    acc[s.titulo] = s.controles.map((f) => ({ titulo: f.titulo, efetivado: false }));
    return acc;
  }, {});
  const reportSessionsFiles = order.relatorio.secoes.reduce((acc: TServiceOrderReportSessionFiles, s) => {
    acc[s.titulo] = s.arquivos.map((f) => ({ titulo: f.titulo, arquivo: null }));
    return acc;
  }, {});

  const [controls, setControls] = useState(reportSessionsControls);
  const [files, setFiles] = useState(reportSessionsFiles);

  const [session, setSession] = useState<string>(reportSessions[sessionWithoutConclusionIndex].titulo);

  const lastSession = reportSessions.at(-1);
  const isLastSession = session == lastSession?.titulo;

  async function concludedReportSession({
    currentSession,
    controls,
    files,
  }: {
    currentSession: string;
    controls: TServiceOrderReportSessionControls;
    files: TServiceOrderReportSessionFiles;
  }) {
    try {
      const currentSessionIndex = reportSessions.findIndex((s) => s.titulo == currentSession);
      const isLastSession = currentSessionIndex == reportSessions.length - 1;
      const currentSessionControls = controls[currentSession];
      const currentSessionFiles = files[currentSession];
      console.log(currentSessionControls, currentSessionFiles);
      // Validating that within current session all control s are checked and all files attached
      if (!currentSessionControls.every((c) => !!c.efetivado)) throw new Error('Faça a confirmação de todos os itens de controle.');
      if (!currentSessionFiles.every((f) => !!f.arquivo)) throw new Error('Faça o anexo de todos os arquivos.');

      // First, handling the uploads of the attached files and generating the equivalent file references
      var fileReferences: TFileReference[] = [];

      const allFilesToUpload = currentSessionFiles
        .map((sessionFile) => {
          const sessionFileTitle = sessionFile.titulo;
          return Array.from(sessionFile.arquivo || []).map((file, index) => ({ title: sessionFileTitle, file: file, innerIndex: index }));
        })
        .flat();

      const uploadPromises = allFilesToUpload.map(async (fileInfo, index) => {
        const formattedSessionFileName = fileInfo.title.toLowerCase().replaceAll(' ', '_');
        const fileName = `${formattedSessionFileName} (${fileInfo.innerIndex + 1})`;
        const { url, format, size } = await uploadFile({ file: fileInfo.file, fileName, vinculationId: order._id });
        const fileReferenceTitle = fileInfo.innerIndex > 0 ? `${fileInfo.title} (${fileInfo.innerIndex + 1})` : fileInfo.title;
        fileReferences.push({
          titulo: fileReferenceTitle,
          idOrdemServico: order._id,
          idProjeto: order.projeto.id,
          idParceiro: order.idParceiro,
          url: url,
          formato: format,
          tamanho: size,
          autor: { id: user.id, nome: user.nome, avatar_url: user.avatar_url },
          dataInsercao: new Date().toISOString(),
        });
      });

      await Promise.all(uploadPromises);
      await createManyFileReferences({ info: fileReferences });

      await editServiceOrderPersonalized({
        id: order._id,
        changes: { [`relatorio.secoes.${currentSessionIndex}.dataConclusao`]: new Date().toISOString() },
      });
      return 'Etapa do relatório finalizada com sucesso !';
    } catch (error) {
      throw error;
    }
  }
  const { mutate: handleMoveToNextSession, isPending: sessionMovePending } = useMutationWithFeedback({
    mutationKey: ['update-service-order-report-session', order._id, session],
    mutationFn: () => concludedReportSession({ currentSession: session, controls, files }),
    queryClient: queryClient,
    affectedQueryKey: [],
    callbackFn: () => {
      const currentSessionIndex = reportSessions.findIndex((s) => s.titulo == session);
      const nextSession = reportSessions.at(currentSessionIndex + 1);
      setSession(nextSession?.titulo || '');
    },
  });
  const {
    mutate: handleFinishReport,
    isPending: finishReportPending,
    isSuccess: finishReportSuccess,
  } = useMutationWithFeedback({
    mutationKey: ['update-service-order-report-session', order._id, session],
    mutationFn: () => concludedReportSession({ currentSession: session, controls, files }),
    queryClient: queryClient,
    affectedQueryKey: [],
  });
  if (finishReportSuccess)
    return (
      <div className='flex w-full grow flex-col items-center justify-center gap-2 text-green-500'>
        <BsFillClipboardCheckFill color='rgb(34,197,94)' size={35} />
        <p className='text-lg font-medium tracking-tight text-primary/50'>RELATÓRIO FINALIZADO COM SUCESSO !</p>
      </div>
    );
  return (
    <div className='flex h-full w-full flex-col gap-6'>
      <h1 className='w-full bg-black px-8 py-4 text-center text-base font-black tracking-tight text-white lg:text-xl'>
        RELATÓRIO DE CONCLUSÃO DE ORDEM DE SERVIÇO
      </h1>
      <div className='flex w-full flex-col gap-3 px-6 py-2'>
        <div className='flex w-full flex-col gap-3 lg:flex-row'>
          <div className='flex w-full flex-col gap-3 p-3 lg:w-1/2'>
            <h1 className='text-start font-black leading-none tracking-tight'>INFORMAÇÕES GERAIS</h1>
            <div className='flex w-full flex-col items-start gap-1'>
              <h1 className='w-full text-start text-[0.85rem] tracking-tight text-primary/50'>SERVIÇO</h1>
              <div className='flex w-full items-center justify-start gap-1'>
                <MdMenu />
                <h1 className='text-[0.85rem] font-semibold tracking-tight'>{order.descricao}</h1>
              </div>
              <div className='flex w-full flex-col items-start justify-start gap-2 lg:flex-row lg:items-center lg:gap-6'>
                <div className='flex w-fit items-center gap-1'>
                  <FaDiamond />
                  <h1 className='text-[0.85rem] font-semibold tracking-tight'>{order.categoria}</h1>
                </div>
                <div className='flex w-fit items-center gap-1'>
                  <TbUrgent />
                  <h1 className='text-[0.85rem] font-semibold tracking-tight'>{order.urgencia || 'URGÊNCIA NÃO DEFINIDA'}</h1>
                </div>
              </div>
            </div>
            <div className='flex w-full flex-col items-center justify-start gap-1'>
              <h1 className='w-full text-start text-[0.85rem] tracking-tight text-primary/50'>RESPONSÁVEIS</h1>
              <div className='flex w-full flex-wrap items-center justify-start gap-1'>
                {order.responsaveis.map((responsible, index) => (
                  <div key={index} className='flex items-center gap-2 rounded-sm border border-primary/50 bg-[#f8f8f8] px-2 py-1 shadow-md'>
                    <Avatar fallback={formatNameAsInitials(responsible.nome)} url={responsible.avatar_url || undefined} height={20} width={20} />
                    <p className='text-[0.85rem] font-semibold leading-none tracking-tight'>{responsible.nome}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className='flex w-full flex-col items-center justify-start gap-1'>
              <h1 className='w-full text-start text-[0.85rem] tracking-tight text-primary/50'>FAVORECIDO</h1>
              <div className='flex w-full flex-col items-start justify-start gap-2 lg:flex-row lg:items-center lg:gap-6'>
                <div className='flex w-fit items-center gap-1'>
                  <FaUser />
                  <h1 className='text-[0.85rem] font-semibold tracking-tight'>{order.favorecido.nome}</h1>
                </div>
                <div className='flex w-fit items-center gap-1'>
                  <FaPhone />
                  <h1 className='text-[0.85rem] font-semibold tracking-tight'>{order.favorecido.contato}</h1>
                </div>
                <div className='flex w-fit items-center gap-1'>
                  <FaLocationDot />
                  <h1 className='text-[0.85rem] font-semibold tracking-tight'>
                    {formatLocation({ location: order.localizacao, includeCity: true, includeUf: true })}
                  </h1>
                </div>
              </div>
            </div>
          </div>
          <div className='flex w-full flex-col gap-3 p-3 lg:w-1/2'>
            <h1 className='text-start font-black leading-none tracking-tight'>DETALHES SOBRE A EXECUÇÃO</h1>
            <div className='flex w-full flex-col items-center justify-center gap-1'>
              <h1 className='w-full text-[0.85rem] font-medium tracking-tight text-primary/50 lg:text-start'>
                ESSAS SÃO AS OBSERVAÇÕES DEFINIDAS PARA EXECUÇÃO DESSA ORDEM DE SERVIÇO:
              </h1>
              {renderExecutionObservations(order.observacoes)}
            </div>
          </div>
        </div>
        <div className='flex w-full flex-col gap-3 p-3'>
          <h1 className='text-start font-black leading-none tracking-tight'>MATERIAIS</h1>
          <div className='flex w-full flex-col gap-3 lg:flex-row'>
            <div className='flex w-full flex-col gap-1 rounded-sm border border-primary/80 lg:w-1/2'>
              <h1 className='w-full bg-primary/80 px-2 py-1 text-center text-sm font-bold text-white'>MATERIAIS DISPONÍVEIS IN LOCO</h1>
              <div className='flex w-full flex-col gap-1 p-2'>
                {order.materiais.disponiveis.length > 0 ? (
                  order.materiais.disponiveis.map((material, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <div className='flex h-[15] w-[15] items-center justify-center rounded-full border border-black p-1 text-[15px]'>
                        {renderCategoryIcon(material.categoria)}
                      </div>
                      <p className='text-[0.7rem] font-medium leading-none tracking-tight lg:text-xs'>
                        <strong className='text-[#FF9B50]'>{material.qtde}</strong> x {material.descricao} ({material.unidade})
                      </p>
                    </div>
                  ))
                ) : (
                  <p className='w-full text-center text-[0.7rem] font-medium leading-none tracking-tight lg:text-xs'>
                    Nenhum material disponível in loco.
                  </p>
                )}
              </div>
            </div>
            <div className='flex w-full flex-col gap-1 rounded-sm border border-primary/80 lg:w-1/2'>
              <h1 className='w-full bg-primary/80 px-2 py-1 text-center text-sm font-bold text-white'>MATERIAIS PARA RETIRADA</h1>
              <div className='flex w-full flex-col gap-1 p-2'>
                {order.materiais.retiraveis.length > 0 ? (
                  order.materiais.retiraveis.map((material, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <div className='flex h-[15] w-[15] items-center justify-center rounded-full border border-black p-1 text-[15px]'>
                        {renderCategoryIcon(material.categoria)}
                      </div>
                      <p className='text-[0.7rem] font-medium leading-none tracking-tight lg:text-xs'>
                        <strong className='text-[#FF9B50]'>{material.qtde}</strong> x {material.descricao} ({material.unidade})
                      </p>
                    </div>
                  ))
                ) : (
                  <p className='w-full text-center text-[0.7rem] font-medium leading-none tracking-tight lg:text-xs'>Nenhum material para retirada</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='flex w-full grow flex-col'>
        <ReportPageSession session={session} controls={controls} setControls={setControls} files={files} setFiles={setFiles} />
      </div>
      <div className='flex w-full items-center justify-center p-2'>
        {isLastSession ? (
          <button
            disabled={finishReportPending || finishReportSuccess}
            onClick={() => {
              handleFinishReport();
            }}
            className='h-9 w-full whitespace-nowrap rounded-sm bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:bg-primary/50 disabled:text-white enabled:hover:bg-green-600 enabled:hover:text-white lg:w-[350px]'
          >
            FINALIZAR RELATÓRIO
          </button>
        ) : (
          <button
            disabled={sessionMovePending}
            onClick={() => {
              handleMoveToNextSession();
            }}
            className='h-9 w-full whitespace-nowrap rounded-sm bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:bg-primary/50 disabled:text-white enabled:hover:bg-blue-600 enabled:hover:text-white lg:w-[350px]'
          >
            PRÓXIMA ETAPA
          </button>
        )}
      </div>
    </div>
  );
}

export default ReportPage;
