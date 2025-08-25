import type { TByFunnelResults } from '@/app/api/stats/comercial-results/sales-funnels/route';
import { useInProgressResults } from '@/utils/queries/stats/in-progress';
import { BsFunnelFill } from 'react-icons/bs';
import FunnelStageStatsCard from '../Utils/FunnelStageStatsCard';

type GetFunnelStageData = {
  funnelName: string;
  stageName: string;
  stats: TByFunnelResults | undefined;
};
// function getFunnelStageData({ funnelName, stageName, stats }: GetFunnelStageData): { projetos: number; valor: number } {
//   const baseReturn = { projetos: 0, valor: 0 }
//   if (!stats) return baseReturn
//   const funnelStats = stats[funnelName]
//   if (!funnelStats) return baseReturn
//   const stageStats = funnelStats[stageName]
//   const projects = stageStats.projetos ? Number(Number(stageStats.projetos).toFixed(2)) : 0
//   const value = stageStats.valor ? Number(Number(stageStats.valor).toFixed(2)) : 0
//   return {
//     projetos: projects,
//     valor: value,
//   }
// }
type InProgressResultsProps = {
  after: string;
  before: string;
  responsibles: string[] | null;
  partners: string[] | null;
  projectTypes: string[] | null;
};
function InProgressResults({ after, before, responsibles, partners, projectTypes }: InProgressResultsProps) {
  console.log('[in-progress] after', after);
  console.log('[in-progress] before', before);
  console.log('[in-progress] responsibles', responsibles);
  console.log('[in-progress] partners', partners);
  console.log('[in-progress] projectTypes', projectTypes);
  const { data: stats } = useInProgressResults({ after, before, responsibles, partners, projectTypes });
  return (
    <div className='flex w-full flex-col'>
      <h1 className='mt-4 rounded-md bg-[#15599a] text-center text-xl font-black text-white'>EM ANDAMENTO</h1>
      <div className='mt-2 flex w-full flex-col items-start gap-6'>
        {stats?.map((stat, index) => (
          <div key={stat.funnel} className='flex w-full flex-col '>
            <div className='mb-4 flex w-full items-center justify-center gap-2 rounded-xs bg-[#fead41] text-white'>
              <h1 className='text-lg font-medium uppercase tracking-tight'>{stat.funnel}</h1>
              <BsFunnelFill />
            </div>
            <div className='flex w-full flex-wrap items-start justify-around gap-4'>
              {stat.stages.map((stage, stageIndex) => (
                <FunnelStageStatsCard key={stage.stage} stage={stage} />
              ))}
            </div>
          </div>
        ))}
        {/* {funnels?.map((funnel, funnelIndex) => (
          <div key={funnelIndex} className="flex w-full flex-col ">
            <div className="mb-4 flex w-full items-center justify-center gap-2 rounded-xs bg-[#fead41] text-white">
              <h1 className="text-lg font-medium uppercase tracking-tight">{funnel.nome}</h1>
              <BsFunnelFill />
            </div>
            <div className="flex w-full flex-wrap items-start justify-around gap-4">
              {funnel.etapas.map((stage, stageIndex) => (
                <div
                  key={stageIndex}
                  className={`flex w-[350px] min-w-[350px] max-w-[350px] grow flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md`}
                >
                  <div className="flex w-full items-center justify-between">
                    <h1 className="text-sm font-medium uppercase tracking-tight">{stage.nome}</h1>
                    <BsFillBookmarkFill />
                  </div>
                  <h1 className="text-center text-2xl font-bold text-[#15599a]">
                    {getFunnelStageData({ funnelName: funnel.nome, stageName: stage.nome, stats: stats }).projetos}
                  </h1>
                  <h1 className="text-center text-2xl font-bold text-green-800">
                    {formatToMoney(getFunnelStageData({ funnelName: funnel.nome, stageName: stage.nome, stats: stats }).valor)}
                  </h1>
                </div>
              ))}
            </div>
          </div>
        ))} */}
      </div>
    </div>
  );
}

export default InProgressResults;
