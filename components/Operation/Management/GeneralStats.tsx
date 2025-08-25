import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { getPeriodDateParamsByReferenceDate } from '@/lib/methods/dates';
import { formatDecimalPlaces } from '@/lib/methods/formatting';
import { useOperationGeneralStats } from '@/utils/queries/stats/operation/general';
import { Area, AreaChart, CartesianGrid, Label, Pie, PieChart, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart, XAxis, YAxis } from 'recharts';

const currentDate = new Date();
const { start, end } = getPeriodDateParamsByReferenceDate({ reference: currentDate, type: 'year', resetStart: true });
const Collors = ['#15599a', '#fead41', '#ff595e', '#8ac926', '#6a4c93', '#5adbff'];

function GeneralStats() {
  const { data: stats, isLoading, isError } = useOperationGeneralStats({ after: start.toISOString(), before: currentDate.toISOString() });
  const salesChartData = stats?.vendas || [];
  const salesChartConfig = { valor: { label: 'VALOR VENDIDO' } };

  const projectTypesChartData = [...(stats?.tiposProjeto || [])]
    .filter((d) => d.qtde > 20)
    .sort((a, b) => b.qtde - a.qtde)
    .map((p, index) => ({ ...p, fill: Collors[index] || '#000' }));
  const projectTypesChartConfig = { tipo: { label: 'TIPO DE PROJETO' } };
  const projectTypesTotal = stats?.tiposProjeto.reduce((acc, current) => acc + current.qtde, 0) || 0;

  const npsChartData = [{ tipo: 'NPS', valor: stats?.nps || 0 }];
  const npsChartConfig = { tipo: { label: 'NPS' } };
  return (
    <div className='flex w-full flex-col gap-2'>
      <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
        <div className='flex w-full flex-col border border-primary/50 bg-background p-3 lg:w-1/3'>
          <h1 className='w-full text-center font-bold tracking-tight'>PROGRESSÃO DE VALOR VENDIDO</h1>
          <p className='text-center text-xs font-medium leading-none text-primary/70'>Gráfico de progressão ao longo do ano do valor vendido.</p>
          <div className='flex w-full grow flex-col p-2'>
            <ChartContainer config={salesChartConfig} className='h-[275px] w-full'>
              <AreaChart
                accessibilityLayer
                data={salesChartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={3} />
                <XAxis dataKey='data' tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 12)} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='line' />} />
                <Area dataKey='valor' type='natural' fill='#15599a' fillOpacity={0.4} stroke='#15599a' />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
        <div className='flex w-full flex-col border border-primary/50 bg-background p-3 lg:w-1/3'>
          <h1 className='w-full text-center font-bold tracking-tight'>PROJETOS POR TIPO</h1>
          <p className='text-center text-xs font-medium leading-none text-primary/70'>Distribuição de projetos por tipo.</p>
          <div className='flex w-full grow flex-col p-2'>
            <ChartContainer config={projectTypesChartConfig} className='h-[275px] w-full'>
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={projectTypesChartData.filter((d) => d.qtde > 20)} dataKey='qtde' nameKey='tipo' innerRadius={60} strokeWidth={5}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                            <tspan x={viewBox.cx} y={viewBox.cy} className='fill-foreground text-3xl font-bold'>
                              {projectTypesTotal.toLocaleString()}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className='fill-muted-foreground'>
                              PROJETOS
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
                <ChartLegend content={<ChartLegendContent color='#000' />} className='-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center' />
              </PieChart>
            </ChartContainer>
          </div>
        </div>
        <div className='flex w-full flex-col border border-primary/50 bg-background p-3 lg:w-1/3'>
          <h1 className='w-full text-center font-bold tracking-tight'>NOTA NPS</h1>
          <p className='text-center text-xs font-medium leading-none text-primary/70'>Índice de Satisfação dos Clientes</p>
          <div className='flex w-full grow flex-col p-2'>
            <ChartContainer config={npsChartConfig} className='h-[275px] w-full'>
              <RadialBarChart data={npsChartData} startAngle={0} endAngle={(npsChartData[0].valor * 360) / 100} innerRadius={80} outerRadius={110}>
                <PolarGrid
                  gridType='circle'
                  radialLines={false}
                  stroke='none'
                  className='first:fill-muted last:fill-background'
                  polarRadius={[86, 74]}
                />
                <RadialBar dataKey='valor' background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                            <tspan x={viewBox.cx} y={viewBox.cy} className='fill-foreground text-4xl font-bold'>
                              {formatDecimalPlaces(npsChartData[0].valor)}%
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className='fill-muted-foreground'>
                              NPS
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneralStats;
