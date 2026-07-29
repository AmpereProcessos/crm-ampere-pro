'use client';

import { DashboardSingleSelect } from '@/components/Stats/MainDashboard/DashboardSelect';
import { useFunnels } from '@/utils/queries/funnels';
import { useCommercialPipeline } from '@/utils/queries/stats';
import { BarChart3, Filter, GitBranch, Loader2, Waves } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ViewMode = 'flow' | 'funnel' | 'bars';
type Stage = NonNullable<ReturnType<typeof useCommercialPipeline>['data']>['funnel'][number];

const STAGE_WIDTH = 180;

export default function CommercialPipelineBlock({
  after,
  before,
  responsibleIds,
}: {
  after: string;
  before: string;
  responsibleIds: string[] | null;
}) {
  const { data: funnels } = useFunnels();
  const [funnelId, setFunnelId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('flow');

  useEffect(() => {
    if (!funnels?.length) return;
    if (!funnelId || !funnels.some((funnel) => funnel._id === funnelId)) setFunnelId(funnels[0]?._id ?? null);
  }, [funnelId, funnels]);

  const pipeline = useCommercialPipeline({ funnelId, after, before, responsibleIds });
  const funnelOptions = useMemo(() => funnels?.map((funnel) => ({ value: funnel._id, label: funnel.nome })) ?? [], [funnels]);
  const hasData = pipeline.data?.funnel.some((stage) => stage.count > 0) ?? false;

  return (
    <section className='flex w-full flex-col gap-3 rounded-lg border border-primary/20 bg-card p-4 shadow-xs'>
      <header className='flex flex-wrap items-center gap-2 border-b border-primary/20 pb-2'>
        <GitBranch className='h-4 w-4 text-primary/55' />
        <h2 className='text-xs font-bold tracking-tight'>FUNIL DE VENDAS</h2>
        {pipeline.data ? (
          <span className='text-xs text-primary/55'>({pipeline.data.totalOpportunities.toLocaleString('pt-BR')} oportunidades)</span>
        ) : null}
        <div className='ml-auto w-56'>
          <DashboardSingleSelect value={funnelId} options={funnelOptions} placeholder='SELECIONE UM FUNIL' onChange={setFunnelId} />
        </div>
        <div className='flex items-center rounded-lg border border-primary/20 bg-primary/5 p-0.5' aria-label='Visualização do funil'>
          <ViewButton active={view === 'flow'} onClick={() => setView('flow')} icon={<Waves className='h-3.5 w-3.5' />} label='FLUXO' />
          <ViewButton active={view === 'funnel'} onClick={() => setView('funnel')} icon={<Filter className='h-3.5 w-3.5' />} label='FUNIL' />
          <ViewButton active={view === 'bars'} onClick={() => setView('bars')} icon={<BarChart3 className='h-3.5 w-3.5' />} label='BARRAS' />
        </div>
      </header>

      {pipeline.isLoading ? (
        <div className='flex h-72 items-center justify-center'>
          <Loader2 className='h-6 w-6 animate-spin text-primary/50' />
        </div>
      ) : null}
      {!pipeline.isLoading && !hasData ? (
        <div className='flex h-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-primary/20 bg-primary/3 text-center'>
          <GitBranch className='h-7 w-7 text-primary/30' />
          <p className='max-w-md text-sm text-primary/60'>Nenhuma passagem por etapas foi encontrada para o funil, período e escopo selecionados.</p>
        </div>
      ) : null}
      {hasData && pipeline.data ? (
        view === 'bars' ? (
          <PipelineBars stages={pipeline.data.funnel} />
        ) : (
          <PipelineChart stages={pipeline.data.funnel} variant={view} />
        )
      ) : null}
    </section>
  );
}

function ViewButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? 'flex h-7 items-center gap-1.5 rounded-md bg-card px-2 text-[0.65rem] font-semibold shadow-xs'
          : 'flex h-7 items-center gap-1.5 rounded-md px-2 text-[0.65rem] font-medium text-primary/55 transition-colors hover:text-foreground'
      }
    >
      {icon}
      {label}
    </button>
  );
}

function PipelineChart({ stages, variant }: { stages: Stage[]; variant: Exclude<ViewMode, 'bars'> }) {
  const funnel = useMemo(() => {
    if (variant === 'flow') return stages;
    const finalIndex = stages.findIndex((stage) => stage.isFinal);
    return finalIndex >= 0 ? stages.slice(0, finalIndex + 1) : stages;
  }, [stages, variant]);
  const valueOf = (stage: Stage) => (variant === 'funnel' ? stage.cumulativeCount : stage.count);
  const geometry = useMemo(() => buildFlowGeometry(funnel.map(valueOf)), [funnel, variant]);
  const conversions = useMemo(() => {
    const firstValue = funnel[0] ? valueOf(funnel[0]) : 0;
    return funnel.map((stage, index) => {
      const value = valueOf(stage);
      const previousValue = index > 0 && funnel[index - 1] ? valueOf(funnel[index - 1] as Stage) : value;
      return {
        absolute: firstValue > 0 ? (value / firstValue) * 100 : 0,
        fromPrevious: index === 0 ? 100 : previousValue > 0 ? (value / previousValue) * 100 : 0,
      };
    });
  }, [funnel, variant]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hovered = hoveredIndex === null ? null : funnel[hoveredIndex];
  const previous = hoveredIndex !== null && hoveredIndex > 0 ? funnel[hoveredIndex - 1] : null;
  const loss = hovered && previous ? Math.max(valueOf(previous) - valueOf(hovered), 0) : 0;
  const hoveredConversion = hoveredIndex === null ? null : conversions[hoveredIndex];

  return (
    <div className='w-full overflow-x-auto rounded-lg border border-primary/15'>
      <div className='relative min-h-[310px]' style={{ width: geometry.width }}>
        <svg
          width={geometry.width}
          height={230}
          viewBox={`0 0 ${geometry.width} 230`}
          className='absolute inset-x-0 top-0'
          role='img'
          aria-label={
            variant === 'funnel' ? 'Funil cumulativo de conversão entre estágios comerciais' : 'Fluxo de conversão entre estágios comerciais'
          }
        >
          <defs>
            <linearGradient id={`commercial-pipeline-${variant}`} x1='0' y1='0' x2='1' y2='0'>
              <stop offset='0%' stopColor='hsl(var(--chart-1))' stopOpacity='0.42' />
              <stop offset='55%' stopColor='hsl(var(--chart-2))' stopOpacity='0.68' />
              <stop offset='100%' stopColor='hsl(var(--chart-4))' stopOpacity='0.94' />
            </linearGradient>
          </defs>
          {geometry.stagePoints.map((point, index) => (
            <line key={funnel[index]?.stageId} x1={point.x} x2={point.x} y1={0} y2={230} stroke='hsl(var(--border))' strokeOpacity='0.7' />
          ))}
          <path d={geometry.path} fill={`url(#commercial-pipeline-${variant})`} />
          {geometry.segmentPaths.map((path, index) => (
            <path
              key={`segment-${funnel[index]?.stageId}`}
              d={path}
              fill='hsl(var(--chart-3))'
              fillOpacity={hoveredIndex === index ? 0.28 : 0}
              className='transition-[transform,fill-opacity] duration-200 ease-out motion-reduce:transition-none'
              style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: hoveredIndex === index ? 'scaleY(1.1)' : 'scaleY(1)' }}
            />
          ))}
          {geometry.stagePoints.slice(1).map((point, index) => {
            const stageConversion = conversions[index + 1]?.fromPrevious ?? 0;
            const totalConversion = conversions[index + 1]?.absolute ?? 0;
            return (
              <g key={funnel[index + 1]?.stageId} transform={`translate(${point.x + STAGE_WIDTH / 2},112)`}>
                <rect x='-52' y='-19' width='104' height='38' rx='10' fill='hsl(var(--card))' fillOpacity='0.96' stroke='hsl(var(--border))' />
                <text
                  x='-44'
                  y='-5'
                  textAnchor='start'
                  dominantBaseline='middle'
                  fill='hsl(var(--muted-foreground))'
                  fontSize='7.5'
                  letterSpacing='0.04em'
                >
                  ANTERIOR
                </text>
                <text x='44' y='-5' textAnchor='end' dominantBaseline='middle' fill='hsl(var(--foreground))' fontSize='11' fontWeight='600'>
                  {formatPercent(stageConversion)}
                </text>
                <line x1='-44' x2='44' y1='2' y2='2' stroke='hsl(var(--border))' strokeOpacity='0.7' />
                <text
                  x='-44'
                  y='10'
                  textAnchor='start'
                  dominantBaseline='middle'
                  fill='hsl(var(--muted-foreground))'
                  fontSize='7.5'
                  letterSpacing='0.04em'
                >
                  TOTAL
                </text>
                <text x='44' y='10' textAnchor='end' dominantBaseline='middle' fill='hsl(var(--foreground))' fontSize='11' fontWeight='600'>
                  {formatPercent(totalConversion)}
                </text>
              </g>
            );
          })}
          {funnel.map((stage, index) => (
            <rect
              key={`hit-${stage.stageId}`}
              x={index * STAGE_WIDTH}
              y={0}
              width={STAGE_WIDTH}
              height={230}
              fill='transparent'
              className='cursor-pointer'
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              tabIndex={0}
              role='button'
              aria-label={`Inspecionar estágio ${stage.stageName}`}
            />
          ))}
        </svg>

        <div className='absolute inset-x-0 bottom-0 grid h-20' style={{ gridTemplateColumns: `repeat(${funnel.length}, ${STAGE_WIDTH}px)` }}>
          {funnel.map((stage, index) => (
            <button
              key={stage.stageId}
              type='button'
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              className='min-w-0 border-r border-primary/15 px-4 py-3 text-left last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'
            >
              <strong className='block text-sm font-semibold tabular-nums'>{valueOf(stage).toLocaleString('pt-BR')}</strong>
              <span className='mt-1 block truncate text-[0.7rem] font-medium text-primary/55'>{stage.stageName}</span>
            </button>
          ))}
        </div>

        {hovered && hoveredIndex !== null ? (
          <div
            className='pointer-events-none absolute top-4 z-10 w-64 rounded-xl bg-foreground p-3.5 text-background shadow-xl'
            style={{ left: Math.min(Math.max((geometry.stagePoints[hoveredIndex]?.x ?? 0) - 128, 12), geometry.width - 268) }}
          >
            <p className='truncate text-xs font-semibold'>{hovered.stageName}</p>
            <div className='mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-background/15 pt-3'>
              {variant === 'funnel' ? (
                <>
                  <Metric label='Alcançaram (acum.)' value={hovered.cumulativeCount.toLocaleString('pt-BR')} />
                  <Metric label='Passaram na etapa' value={hovered.count.toLocaleString('pt-BR')} />
                </>
              ) : (
                <>
                  <Metric label='Oportunidades' value={hovered.count.toLocaleString('pt-BR')} />
                  <Metric label='Perda na etapa' value={hoveredIndex === 0 ? '—' : `-${loss.toLocaleString('pt-BR')}`} danger={loss > 0} />
                </>
              )}
              <Metric label='Conversão total' value={formatPercent(hoveredConversion?.absolute ?? 0)} />
              <Metric label='Da etapa anterior' value={hoveredIndex === 0 ? '100%' : formatPercent(hoveredConversion?.fromPrevious ?? 0)} />
              {hovered.averageHours !== null ? <Metric label='Tempo médio' value={formatHours(hovered.averageHours)} /> : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PipelineBars({ stages }: { stages: Stage[] }) {
  const max = Math.max(...stages.map((stage) => stage.count), 1);
  return (
    <div className='w-full overflow-x-auto pb-1'>
      <div className='flex min-h-[230px] items-end gap-3' style={{ minWidth: 'max-content' }}>
        {stages.map((stage, index) => {
          const heightPercent = (stage.count / max) * 100;
          return (
            <div key={stage.stageId} className='flex w-[180px] shrink-0 flex-col items-center gap-2'>
              <div className='relative flex w-full flex-col items-center'>
                <div className='mb-1 flex flex-col items-center rounded-md border border-primary/15 bg-card px-2 py-1 shadow-xs'>
                  <strong className='text-sm leading-none'>{formatPercent(stage.absoluteConversion)}</strong>
                  <span className='text-xs leading-tight text-primary/55'>{stage.count.toLocaleString('pt-BR')}</span>
                </div>
                <div
                  className='flex w-full rounded-t-md transition-[height,opacity] duration-200 ease-out'
                  style={{
                    minHeight: 40,
                    height: Math.max((heightPercent / 100) * 150, 40),
                    maxHeight: 160,
                    opacity: 0.6 + (heightPercent / 100) * 0.4,
                    backgroundColor: `hsl(var(--chart-${index === stages.length - 1 ? '5' : '3'}))`,
                  }}
                />
              </div>
              <span className='w-full text-center text-[0.65rem] font-semibold uppercase leading-tight'>{stage.stageName}</span>
              {index > 0 ? <span className='text-[0.6rem] text-primary/50'>{formatPercent(stage.stageToStageConversion)} do anterior</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div>
      <span className='block text-[0.6rem] uppercase tracking-wide text-background/55'>{label}</span>
      <strong className={danger ? 'mt-0.5 block text-xs text-rose-300' : 'mt-0.5 block text-xs'}>{value}</strong>
    </div>
  );
}

function buildFlowGeometry(values: number[]) {
  const width = Math.max(values.length * STAGE_WIDTH, 720);
  const centerY = 112;
  const max = Math.max(...values, 1);
  const stagePoints = values.map((value, index) => ({ x: index * STAGE_WIDTH, halfHeight: Math.max((value / max) * 92, 10) }));
  const points = [...stagePoints, { x: width, halfHeight: stagePoints.at(-1)?.halfHeight ?? 10 }];
  const top = points
    .map((point, index) => curveCommand(point.x, centerY - point.halfHeight, index === 0 ? null : points[index - 1], centerY, true))
    .join(' ');
  const bottom = [...points]
    .reverse()
    .map((point, reverseIndex) => {
      const index = points.length - 1 - reverseIndex;
      if (reverseIndex === 0) return `L ${point.x} ${centerY + point.halfHeight}`;
      return curveCommand(point.x, centerY + point.halfHeight, points[index + 1], centerY, false);
    })
    .join(' ');
  const segmentPaths = points.slice(0, -1).map((point, index) => buildSegmentPath(point, points[index + 1] ?? point, centerY));
  return { width, stagePoints, segmentPaths, path: `${top} ${bottom} Z` };
}

function buildSegmentPath(start: { x: number; halfHeight: number }, end: { x: number; halfHeight: number }, centerY: number) {
  const middle = (start.x + end.x) / 2;
  return `M ${start.x} ${centerY - start.halfHeight} C ${middle} ${centerY - start.halfHeight}, ${middle} ${centerY - end.halfHeight}, ${end.x} ${centerY - end.halfHeight} L ${end.x} ${centerY + end.halfHeight} C ${middle} ${centerY + end.halfHeight}, ${middle} ${centerY + start.halfHeight}, ${start.x} ${centerY + start.halfHeight} Z`;
}

function curveCommand(x: number, y: number, previous: { x: number; halfHeight: number } | undefined | null, centerY: number, top: boolean) {
  if (!previous) return `M ${x} ${y}`;
  const previousY = centerY + (top ? -previous.halfHeight : previous.halfHeight);
  const middle = (previous.x + x) / 2;
  return `C ${middle} ${previousY}, ${middle} ${y}, ${x} ${y}`;
}

function formatPercent(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return `${(Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1)).replace('.', ',')}%`;
}

function formatHours(hours: number) {
  if (hours <= 0) return 'N/A';
  if (hours < 24) return `${hours.toFixed(1).replace('.', ',')}h`;
  return `${(hours / 24).toFixed(1).replace('.', ',')} dias`;
}
