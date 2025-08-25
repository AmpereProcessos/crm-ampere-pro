import CheckboxInput from '@/components/Inputs/CheckboxInput';
import { TServiceOrder, TServiceOrderWithProjectAndAnalysis } from '@/utils/schemas/service-order.schema';
import { getServiceOrderCategoryReport } from '@/utils/service-orders/service-order-report';
import Link from 'next/link';
import React from 'react';
import ReportSession from './Utils/ReportSession';

type ReportInformationBlockProps = {
  orderId?: string;
  infoHolder: TServiceOrderWithProjectAndAnalysis;
  setInfoHolder: React.Dispatch<React.SetStateAction<TServiceOrderWithProjectAndAnalysis>>;
};
function ReportInformationBlock({ orderId, infoHolder, setInfoHolder }: ReportInformationBlockProps) {
  function useReportModel(serviceOrder: TServiceOrderWithProjectAndAnalysis) {
    const reportModel = getServiceOrderCategoryReport({
      category: serviceOrder.categoria,
      conditionData: {
        uf: serviceOrder.localizacao.uf,
        cidade: serviceOrder.localizacao.cidade,
        topologia: serviceOrder.analiseTecnicaDados?.detalhes.topologia || '',
      },
    });
    const reportSessions: TServiceOrder['relatorio']['secoes'] =
      reportModel?.secoes.map((secao) => {
        const controls = secao.controles.map((c) => c);
        const files = secao.arquivos.map((f) => ({ titulo: f.titulo, anexo: undefined }));
        return { titulo: secao.titulo, controles: controls, arquivos: files };
      }) || [];

    setInfoHolder((prev) => ({ ...prev, relatorio: { ...prev.relatorio, secoes: reportSessions } }));
  }

  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full rounded-sm bg-primary/70 p-1 text-center font-bold text-white'>RELATÓRIO DE CONCLUSÃO</h1>
      <div className='flex w-full items-center justify-center py-2'>
        <div className='w-fit'>
          <CheckboxInput
            labelFalse='RELATÓRIO APLICÁVEL'
            labelTrue='RELATÓRIO APLICÁVEL'
            checked={infoHolder.relatorio.aplicavel}
            handleChange={(value) =>
              setInfoHolder((prev) => ({ ...prev, relatorio: { ...prev.relatorio, aplicavel: value, secoes: value ? prev.relatorio.secoes : [] } }))
            }
          />
        </div>
      </div>
      {infoHolder.relatorio.aplicavel && infoHolder.relatorio.secoes.length == 0 ? (
        <div className='flex w-full flex-col items-center justify-center gap-1'>
          <p className='w-full text-center text-sm tracking-tight text-primary/50'>
            Com base na categoria da ordem de serviço, você pode utilizar um modelo de relatório clicando abaixo:{' '}
          </p>
          <button
            onClick={() => useReportModel(infoHolder)}
            className='self-cente w-fit bg-blue-800 px-2 py-1 text-sm font-bold tracking-tight text-white'
          >
            UTILIZAR MODELO
          </button>
        </div>
      ) : null}
      {infoHolder.relatorio.aplicavel && orderId ? (
        <Link href={`/operacional/ordens-servico/relatorio/${orderId}`}>
          <button className='rounded bg-blue-800 px-2 py-1 text-sm font-bold text-white'>PÁGINA DE RELATÓRIO</button>
        </Link>
      ) : null}
      {infoHolder.relatorio.secoes.map((session, index) => (
        <ReportSession key={index} session={session} />
      ))}
    </div>
  );
}

export default ReportInformationBlock;
