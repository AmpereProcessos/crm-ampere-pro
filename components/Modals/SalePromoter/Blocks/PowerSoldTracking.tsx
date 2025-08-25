import type { TSalePromoterResultsById } from '@/app/api/stats/comercial-results/sellers/route';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { FaBolt } from 'react-icons/fa';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

function mergePeriodsData(
  first: {
    mes: string;
    valor: number;
  }[],
  second: {
    mes: string;
    valor: number;
  }[]
) {
  return first.map((first) => {
    // Find matching month in the second period data
    const secondData = second.find((second) => second.mes === first.mes);

    return {
      mes: first.mes, // Month label
      valorPrimeiro: first.valor, // Value from the first period
      valorSegundo: secondData?.valor || 0, // Value from the second period (default to 0 if not found)
    };
  });
}
type PowerSoldTrackingProps = {
  data: TSalePromoterResultsById;
  firstPeriodAfter: string;
  firstPeriodBefore: string;
  secondPeriodAfter: string;
  secondPeriodBefore: string;
};
function PowerSoldTracking({ data, firstPeriodAfter, firstPeriodBefore, secondPeriodAfter, secondPeriodBefore }: PowerSoldTrackingProps) {
  console.log('POTENCIA VENDIDA');
  const chartData = mergePeriodsData(data.primeiro.potenciaVendida.mensal, data.segundo.potenciaVendida.mensal);
  const chartConfig = {
    mes: {
      label: 'Mês',
      color: '#000000',
    },
    valorPrimeiro: {
      label: 'Potência do Primeiro Período',
      color: '#15599a',
    },
    valorSegundo: {
      label: 'Potência do Segundo Período',
      color: '#fead41',
    },
  } satisfies ChartConfig;
  return (
    <div className='flex w-full flex-col p-3'>
      <div className='flex w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md '>
        <div className='flex items-center justify-between'>
          <h1 className='text-sm font-medium uppercase tracking-tight'>Potência Vendida</h1>
          <FaBolt />
        </div>
        <div className='flex w-full flex-col gap-2 p-3'>
          <div className='flex w-full flex-col overflow-hidden rounded-sm border border-black p-3'>
            {/* <div className="flex w-full items-center justify-between gap-2 bg-black p-1 px-4">
              <h1 className="text-[0.6rem] text-primary-foreground">PRIMEIRO PERÍODO</h1>
              <div className="flex items-center gap-1">
                <BsCalendar size={12} color="#fff" />
                <h1 className="text-[0.6rem] font-bold text-primary-foreground">
                  {formatDateAsLocale(firstPeriodAfter)} até {formatDateAsLocale(firstPeriodBefore)}
                </h1>
              </div>
            </div> */}
            <div className='h-[150px] w-full'>
              <ChartContainer config={chartConfig} className='h-full w-full'>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey='mes' tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='line' />} />
                  <Area dataKey='valorPrimeiro' type='natural' fill='#15599a' fillOpacity={0.4} stroke='#15599a' />
                  <Area dataKey='valorSegundo' type='natural' fill='#fead41' fillOpacity={0.4} stroke='#fead41' />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PowerSoldTracking;
