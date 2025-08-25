import { FaAlignJustify } from 'react-icons/fa';
type LossesByReasonProps = {
  stats: any;
};
function getListOrdenated(stats: any) {
  if (!stats) return [];
  const lossesByReasonObject = stats.perdasPorMotivo;
  const lossesByReasonAsArray = Object.entries(lossesByReasonObject).map(([key, value]) => {
    return {
      motivo: key,
      quantidade: value as number,
    };
  });
  const orderedLossesByReason = lossesByReasonAsArray.sort((a: any, b: any) => {
    return b.quantidade - a.quantidade;
  });
  return orderedLossesByReason;
}
function LossesByReason({ stats }: LossesByReasonProps) {
  return (
    <div className='mt-2 flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md'>
      <div className='flex items-center justify-between'>
        <h1 className='text-sm font-medium uppercase tracking-tight'>RAZÕES DE PERDA</h1>
        <FaAlignJustify />
      </div>
      <div className='mt-4 flex w-full flex-col flex-wrap items-start justify-between gap-2 md:flex-row'>
        {getListOrdenated(stats).map((reasonStat, index) => (
          <div key={index} className='flex min-h-[70px] w-full items-center justify-between gap-1 rounded-sm border border-[#F31559] md:w-[250px]'>
            <div className='flex h-full min-h-[70px] w-[30px] min-w-[30px] items-center justify-center bg-[#F31559] font-bold text-primary-foreground'>
              {index + 1}º
            </div>
            <div className='flex h-full min-h-[70px] grow flex-col items-center justify-between gap-1 p-2'>
              <h1 className='text-center text-xs font-medium leading-none tracking-tight'>{reasonStat.motivo.toUpperCase()}</h1>
              <h1 className='text-sm font-bold text-[#F31559]'>{reasonStat.quantidade}</h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LossesByReason;
