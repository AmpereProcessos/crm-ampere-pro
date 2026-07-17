import ResponsiveDialogDrawerViewOnly from '@/components/utils/ResponsiveDialogDrawerViewOnly';
import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import { getErrorMessage } from '@/lib/methods/errors';
import { useTechnicalAnalysisById } from '@/utils/queries/technical-analysis';
import { ClipboardCheck, FolderKanban, Gauge, MapPin, UserRound } from 'lucide-react';
import Link from 'next/link';

export default function ViewTechnicalAnalysis({ analysisId, closeModal }: { analysisId: string; closeModal: () => void }) {
  const { data: analysis, isLoading, isError, error } = useTechnicalAnalysisById({ id: analysisId });
  const location = analysis ? [analysis.localizacao?.cidade, analysis.localizacao?.uf].filter(Boolean).join('/') : '';

  return (
    <ResponsiveDialogDrawerViewOnly
      menuTitle='Visualizar análise técnica'
      menuDescription='Resumo operacional disponível no seu escopo de acesso.'
      menuCancelButtonText='Fechar'
      closeMenu={closeModal}
      dialogContentClassName='max-w-2xl'
    >
      {isLoading ? <LoadingComponent /> : null}
      {isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
      {analysis ? (
        <div className='grid gap-3 sm:grid-cols-2'>
          <AnalysisDetail icon={ClipboardCheck} label='Análise' value={analysis.nome} className='sm:col-span-2' />
          <AnalysisDetail icon={Gauge} label='Status' value={analysis.status} />
          <AnalysisDetail
            icon={Gauge}
            label='Tipo / complexidade'
            value={[analysis.tipoSolicitacao, analysis.complexidade].filter(Boolean).join(' · ')}
          />
          <AnalysisDetail icon={UserRound} label='Requerente' value={analysis.requerente?.nome} />
          <AnalysisDetail icon={UserRound} label='Analista' value={analysis.analista?.nome} />
          <AnalysisDetail icon={MapPin} label='Localização' value={location} />
          <div className='rounded-xl border border-border/70 bg-muted/20 p-3'>
            <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground'>
              <FolderKanban className='size-3.5 text-primary' />
              Oportunidade
            </div>
            {analysis.oportunidade?.id ? (
              <Link
                href={`/comercial/oportunidades/id/${analysis.oportunidade.id}`}
                className='mt-1.5 block text-sm font-semibold text-primary hover:underline'
              >
                {analysis.oportunidade.nome || analysis.oportunidade.identificador || 'Abrir oportunidade'}
              </Link>
            ) : (
              <p className='mt-1.5 text-sm font-semibold text-foreground'>Não informada</p>
            )}
          </div>
        </div>
      ) : null}
    </ResponsiveDialogDrawerViewOnly>
  );
}

function AnalysisDetail({ icon: Icon, label, value, className }: { icon: typeof Gauge; label: string; value?: string | null; className?: string }) {
  return (
    <div className={`rounded-xl border border-border/70 bg-muted/20 p-3 ${className ?? ''}`}>
      <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground'>
        <Icon className='size-3.5 text-primary' />
        {label}
      </div>
      <p className='mt-1.5 break-words text-sm font-semibold text-foreground'>{value || 'Não informado'}</p>
    </div>
  );
}
