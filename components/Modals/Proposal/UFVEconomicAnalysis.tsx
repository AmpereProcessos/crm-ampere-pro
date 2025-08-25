import SelectInput from '@/components/Inputs/SelectInput';
import { Button } from '@/components/ui/button';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { formatDecimalPlaces } from '@/lib/methods/formatting';
import { useMediaQuery } from '@/lib/utils';
import { formatToMoney } from '@/utils/methods';
import type { TProposalDTOWithOpportunityAndClient } from '@/utils/schemas/proposal.schema';
import { getSalesProposalScenarios, type TSalesProposalScenarios } from '@/utils/solar';
import { BadgeDollarSign, Calendar, CalendarDays, CalendarRange, ChartArea, ChartBar, PiggyBank, Receipt, Zap } from 'lucide-react';
import { useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

type UFVEconomicAnalysisParams = {
  yearsQty: number;
  publicIluminationCost: number;
  yearlyConsumptionScaling: number;
};

type UFVEnergyEconomyAnalysisProps = {
  proposal: TProposalDTOWithOpportunityAndClient;
  closeModal: () => void;
};
function UFVEnergyEconomyAnalysis({ proposal, closeModal }: UFVEnergyEconomyAnalysisProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [params, setParams] = useState<UFVEconomicAnalysisParams>({
    yearsQty: 12,
    publicIluminationCost: 20,
    yearlyConsumptionScaling: 0,
  });

  function updateParams(params: Partial<UFVEconomicAnalysisParams>) {
    setParams((prev) => ({ ...prev, ...params }));
  }
  const analysis = getSalesProposalScenarios({
    salesProposal: proposal,
    salesProposalProducts: proposal.produtos,
    locationUf: proposal.oportunidadeDados.localizacao.uf,
    locationCity: proposal.oportunidadeDados.localizacao.cidade,
    yearsQty: params.yearsQty,
    publicIluminationCost: params.publicIluminationCost,
    yearlyConsumptionScaling: params.yearlyConsumptionScaling,
  });
  const MENU_TITLE = 'ANÁLISE ECONÔMICA';
  const MENU_DESCRIPTION = 'Análise econômica da proposta.';
  return isDesktop ? (
    <Dialog open onOpenChange={(v) => (!v ? closeModal() : null)}>
      <DialogContent className='flex flex-col h-fit min-h-[60vh] max-h-[70vh] min-w-[60%]'>
        <DialogHeader>
          <DialogTitle>{MENU_TITLE}</DialogTitle>
          <DialogDescription>{MENU_DESCRIPTION}</DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-auto'>
          <TechnicalAnalysisConditionDataBlock isDesktop={isDesktop} analysis={analysis} params={params} updateParams={updateParams} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>FECHAR</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open onOpenChange={(v) => (!v ? closeModal() : null)}>
      <DrawerContent className='h-fit max-h-[70vh] flex flex-col'>
        <DrawerHeader className='text-left'>
          <DrawerTitle>{MENU_TITLE}</DrawerTitle>
          <DrawerDescription>{MENU_DESCRIPTION}</DrawerDescription>
        </DrawerHeader>

        <div className='flex-1 overflow-auto'>
          <TechnicalAnalysisConditionDataBlock isDesktop={isDesktop} analysis={analysis} params={params} updateParams={updateParams} />
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant='outline'>FECHAR</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// Componente da Tabela Virtualizada
type VirtualizedTableProps = {
  isDesktop: boolean;
  data: TSalesProposalScenarios['progression'];
};

function VirtualizedTable({ isDesktop, data }: VirtualizedTableProps) {
  const columns = [
    { key: 'tag', label: 'Período' },
    { key: 'consumption_generation', label: 'Consumo/Geração' },
    { key: 'compensated_energy', label: 'Compensado (R$)' },
    { key: 'non_compensated_energy', label: 'Não Compensado (R$)' },
    { key: 'conventional_bill', label: 'Fatura Convencional' },
    { key: 'solar_bill', label: 'Fatura Solar' },
  ];

  const DetailsItem = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = data[index];
    if (!item) return null;

    return (
      <div style={style} className='flex flex-col'>
        <div className='w-full hidden lg:flex items-center gap-1 bg-primary/10 rounded-lg'>
          {/* Tag */}
          <div className='flex items-center justify-center px-2 py-2 text-xs font-medium w-1/6'>{item.Tag}</div>

          {/* Consumo e Geração */}
          <div className='flex flex-col justify-center items-center px-2 py-1 text-xs w-1/6'>
            <div className='text-orange-600 font-medium'>C: {item.Consumption.toFixed(0)} kWh</div>
            <div className='text-green-600 font-medium'>G: {item.Generation.toFixed(0)} kWh</div>
          </div>
          {/* Compensado */}
          <div className='flex items-center justify-center px-2 py-2 text-xs w-1/6'>{formatToMoney(item.CompensatedEnergyCost)}</div>

          {/* Não Compensado */}
          <div className='flex items-center justify-center px-2 py-2 text-xs w-1/6'>{formatToMoney(item.NonCompensatedEnergyCost)}</div>

          {/* Fatura Convencional */}
          <div className='flex items-center justify-center px-2 py-2 text-xs w-1/6'>{formatToMoney(item.ConventionalEnergyBill)}</div>

          {/* Fatura Solar */}
          <div className='flex items-center justify-center px-2 py-2 text-xs font-medium text-green-600 w-1/6'>
            {formatToMoney(item.EnergyBillValue)}
          </div>
        </div>
        <div className='w-full flex lg:hidden flex-col gap-2 bg-primary/10 rounded-lg p-2'>
          <div className='w-full flex items-center justify-between gap-2'>
            <div className='flex items-center gap-1'>
              <Calendar className='h-4 w-4' />
              <p className='text-xs font-medium'>PERÍODO {item.Tag}</p>
            </div>
          </div>
          <div className='flex items-center gap-2 w-full'>
            <div className='flex flex-col items-center bg-green-300 text-green-800 rounded-lg py-0.5 px-2 w-1/2'>
              <div className='w-full flex items-center justify-center gap-1'>
                <Zap className='h-4 w-4 min-w-4 min-h-4' />
                <p className='text-[0.45rem] font-medium'>GERAÇÃO</p>
              </div>
              <p className='text-xxs font-bold'> {formatDecimalPlaces(item.Generation)} kWh</p>
            </div>
            <div className='flex flex-col items-center bg-orange-300 text-orange-800 rounded-lg py-0.5 px-2 w-1/2'>
              <div className='w-full flex items-center justify-center gap-1'>
                <Zap className='h-4 w-4 min-w-4 min-h-4' />
                <p className='text-[0.45rem] font-medium'>CONSUMO</p>
              </div>
              <p className='text-xxs font-bold'> {formatDecimalPlaces(item.Consumption)} kWh</p>
            </div>
          </div>
          <div className='flex items-center gap-2 w-full'>
            <div className='flex flex-col items-center bg-primary/20 text-primary rounded-lg py-0.5 px-2 w-1/2'>
              <div className='w-full flex items-center justify-center gap-1'>
                <BadgeDollarSign className='h-4 w-4 min-w-4 min-h-4' />
                <p className='text-[0.45rem] font-medium'>COMPENSADO</p>
              </div>
              <p className='text-xxs font-bold'>{formatToMoney(item.CompensatedEnergyCost)}</p>
            </div>
            <div className='flex flex-col items-center bg-primary/20 text-primary rounded-lg py-0.5 px-2 w-1/2'>
              <div className='w-full flex items-center justify-center gap-1'>
                <BadgeDollarSign className='h-4 w-4 min-w-4 min-h-4' />
                <p className='text-[0.45rem] font-medium'>NÃO COMPENSADO</p>
              </div>
              <p className='text-xxs font-bold'>{formatToMoney(item.NonCompensatedEnergyCost)}</p>
            </div>
          </div>
          <div className='flex items-center gap-2 w-full'>
            <div className='flex flex-col items-center bg-green-400 text-green-900 rounded-lg py-0.5 px-2 w-1/2'>
              <div className='w-full flex items-center justify-center gap-1'>
                <Receipt className='h-4 w-4 min-w-4 min-h-4' />
                <p className='text-[0.45rem] font-medium'>FATURA SOLAR</p>
              </div>
              <p className='text-xxs font-bold'>{formatToMoney(item.EnergyBillValue)}</p>
            </div>
            <div className='flex flex-col items-center bg-red-400 text-red-900 rounded-lg py-0.5 px-2 w-1/2'>
              <div className='w-full flex items-center justify-center gap-1'>
                <Receipt className='h-4 w-4 min-w-4 min-h-4' />
                <p className='text-[0.45rem] font-medium'>FATURA CONVENCIONAL</p>
              </div>
              <p className='text-xxs font-bold'>{formatToMoney(item.ConventionalEnergyBill)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DetailsHeader = () => (
    <div className='hidden lg:flex w-full items-center gap-1 bg-primary/50 text-primary-foreground rounded-lg p-2'>
      {columns.map((column) => (
        <div key={column.key} className='flex items-center justify-center text-center w-1/6 text-xs font-medium'>
          {column.label}
        </div>
      ))}
    </div>
  );

  return (
    <div className='flex flex-col gap-2 w-full'>
      <DetailsHeader />
      <List
        height={400}
        itemCount={data.length}
        itemSize={isDesktop ? 45 : 180}
        width={'100%'}
        className='gap-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'
      >
        {DetailsItem}
      </List>
    </div>
  );
}

export default UFVEnergyEconomyAnalysis;

const chartConfig = {
  payback: {
    label: 'Payback',
    color: 'var(--chart-1)',
  },
  paybackPositive: {
    label: 'Payback Positivo',
    color: '#22c55e', // green
  },
  paybackNegative: {
    label: 'Payback Negativo',
    color: '#ef4444', // red
  },
  energyBill: {
    label: 'Conta com Solar',
    color: '#3b82f6', // blue
  },
  conventionalBill: {
    label: 'Conta Convencional',
    color: '#f59e0b', // amber
  },
  accumulatedBalance: {
    label: 'Saldo Acumulado',
    color: '#8b5cf6', // purple
  },
} satisfies ChartConfig;
type TechnicalAnalysisConditionDataBlockProps = {
  isDesktop: boolean;
  analysis: TSalesProposalScenarios;
  params: UFVEconomicAnalysisParams;
  updateParams: (params: Partial<UFVEconomicAnalysisParams>) => void;
};
function TechnicalAnalysisConditionDataBlock({ isDesktop, analysis, params, updateParams }: TechnicalAnalysisConditionDataBlockProps) {
  // Preparar dados para o gráfico
  const fullChartData = analysis.progression.map((item) => ({
    tag: item.Tag,
    payback: item.Payback,
    paybackPositive: item.Payback >= 0 ? item.Payback : null,
    paybackNegative: item.Payback < 0 ? item.Payback : null,
    savedValue: item.SavedValue,
    energyBill: item.EnergyBillValue,
    conventionalBill: item.ConventionalEnergyBill,
    accumulatedBalance: item.CumulatedBalance,
  }));

  // Reduzir dados para máximo de 50 pontos mantendo representação espaçada
  const maxDataPoints = 50;
  let chartData = fullChartData;

  if (fullChartData.length > maxDataPoints) {
    const step = Math.floor(fullChartData.length / (maxDataPoints - 1));
    const sampledData = [];

    // Sempre incluir o primeiro ponto
    sampledData.push(fullChartData[0]);

    // Incluir pontos espaçados
    for (let i = step; i < fullChartData.length - 1; i += step) {
      sampledData.push(fullChartData[i]);
    }

    // Sempre incluir o último ponto
    if (fullChartData.length > 1) {
      sampledData.push(fullChartData[fullChartData.length - 1]);
    }

    chartData = sampledData;
  }

  // Encontrar quando o payback fica positivo pela primeira vez
  const paybackBreakEven = analysis.progression.find((item) => item.Payback >= 0);
  const paybackMonths = paybackBreakEven ? analysis.progression.indexOf(paybackBreakEven) : -1;

  return (
    <div className='w-full h-full flex flex-col gap-6 py-4 px-4 lg:px-0'>
      <div className='w-full flex items-center flex-col lg:flex-row gap-2'>
        <div className='w-full lg:w-1/3'>
          <SelectInput
            label='TEMPO DE AVALIAÇÃO'
            labelClassName='text-[0.6rem]'
            holderClassName='text-xs p-2 min-h-[34px]'
            value={params.yearsQty}
            options={[
              {
                id: 1,
                label: '5 ANOS',
                value: 5,
              },
              {
                id: 2,
                label: '10 ANOS',
                value: 10,
              },
              {
                id: 3,
                label: '12 ANOS',
                value: 12,
              },
              {
                id: 4,
                label: '20 ANOS',
                value: 20,
              },
              {
                id: 5,
                label: '25 ANOS',
                value: 25,
              },
            ]}
            resetOptionLabel='SELECIONE'
            handleChange={(value) => updateParams({ yearsQty: Number(value) })}
            onReset={() => updateParams({ yearsQty: 12 })}
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/3'>
          <SelectInput
            label='CUSTO DE ILUMINAÇÃO PÚBLICA'
            labelClassName='text-[0.6rem]'
            holderClassName='text-xs p-2 min-h-[34px]'
            value={params.publicIluminationCost}
            options={[
              {
                id: 1,
                label: 'R$0',
                value: 0,
              },
              {
                id: 2,
                label: 'R$10',
                value: 10,
              },
              {
                id: 3,
                label: 'R$20',
                value: 20,
              },
              {
                id: 4,
                label: 'R$30',
                value: 30,
              },
              {
                id: 5,
                label: 'R$40',
                value: 40,
              },
            ]}
            resetOptionLabel='SELECIONE'
            handleChange={(value) => updateParams({ publicIluminationCost: Number(value) })}
            onReset={() => updateParams({ publicIluminationCost: 20 })}
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/3'>
          <SelectInput
            label='AUMENTO ANUAL DE CONSUMO'
            labelClassName='text-[0.6rem]'
            holderClassName='text-xs p-2 min-h-[34px]'
            value={params.yearlyConsumptionScaling}
            options={[
              {
                id: 1,
                label: '0%',
                value: 0,
              },
              {
                id: 2,
                label: '5%',
                value: 0.05,
              },
              {
                id: 3,
                label: '10%',
                value: 0.1,
              },
              {
                id: 4,
                label: '15%',
                value: 0.15,
              },
              {
                id: 5,
                label: '20%',
                value: 0.2,
              },
            ]}
            resetOptionLabel='SELECIONE'
            handleChange={(value) => updateParams({ yearlyConsumptionScaling: Number(value) })}
            onReset={() => updateParams({ yearlyConsumptionScaling: 0 })}
            width='100%'
          />
        </div>
      </div>
      {/* Informações gerais */}
      <div className='w-full flex flex-col gap-2'>
        <div className='flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md'>
          <div className='flex items-center justify-between'>
            <h1 className='text-sm font-medium uppercase tracking-tight'>ECONOMIA MENSAL MÉDIA</h1>
            <PiggyBank className='h-4 w-4' />
          </div>
          <h3 className='text-xl font-bold text-[#15599a]'>{formatToMoney(analysis.monthlySavedValue)}</h3>
          <p className='text-xs text-primary/80'>Considerando o período, esse é o valor médio a ser pago nas contas de energia.</p>
        </div>
        <div className='flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md'>
          <div className='flex items-center justify-between'>
            <h1 className='text-sm font-medium uppercase tracking-tight'>ECONOMIA TOTAL NO PERÍODO</h1>
            <PiggyBank className='h-4 w-4' />
          </div>
          <h3 className='text-xl font-bold text-[#15599a]'>{formatToMoney(analysis.twentyFiveYearsSavedValue)}</h3>
          <p className='text-xs text-primary/80'>Considerando o período, esse é o valor total a ser pago nas contas de energia.</p>
        </div>
        <div className='flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md'>
          <div className='flex items-center justify-between'>
            <h1 className='text-sm font-medium uppercase tracking-tight'>TEMPO DE RETORNO</h1>
            <CalendarRange className='h-4 w-4' />
          </div>
          <h3 className='text-xl font-bold text-[#15599a]'>
            {paybackMonths > 0 ? `${Math.floor(paybackMonths / 12)} ANOS E ${paybackMonths % 12} MESES` : '...'}
          </h3>
          <p className='text-xs text-primary/80'>Esse é o tempo necessário para o retorno do investimento.</p>
        </div>
      </div>

      {/* Gráfico de Payback */}
      <div className='flex  w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md'>
        <div className='flex items-center justify-between'>
          <h1 className='text-sm font-medium uppercase tracking-tight'>ANÁLISE DE PAYBACK</h1>
          <ChartBar className='h-4 w-4' />
        </div>
        <p className='text-xs text-primary/80'>
          Gráfico demonstrativo do payback do investimento. Em verde, o payback positivo e em vermelho, o payback negativo.
        </p>
        <div className='w-full flex flex-col gap-2 p-3'>
          <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey='tag' tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const formatted = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(Math.abs(value));
                  return value < 0 ? `-${formatted}` : formatted;
                }}
              />
              <ChartTooltip content={<ChartTooltipContent className='w-fit min-w-[200px]' labelFormatter={(value) => `Período: ${value}`} />} />
              {/* <defs>
								<linearGradient id="paybackPositiveGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
									<stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="paybackNegativeGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#ef4444" stopOpacity={0.1} />
									<stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
								</linearGradient>
							</defs> */}
              <Bar dataKey='paybackPositive' stroke='#22c55e' strokeWidth={2} fill='url(#paybackPositiveGradient)' />
              <Bar dataKey='paybackNegative' stroke='#ef4444' strokeWidth={2} fill='url(#paybackNegativeGradient)' />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Gráfico de Comparação de Contas */}
      <div className='flex  w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md'>
        <div className='flex items-center justify-between'>
          <h1 className='text-sm font-medium uppercase tracking-tight'>COMPARAÇÃO DE CONTAS DE ENERGIA</h1>
          <ChartArea className='h-4 w-4' />
        </div>
        <p className='text-xs text-primary/80'>
          Gráfico demonstrativo da comparação de contas de energia. Em azul, a conta com solar e em laranja, a conta convencional.
        </p>
        <div className='w-full flex flex-col gap-2 p-3'>
          <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey='tag' tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const formatted = new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(Math.abs(value));
                  return value < 0 ? `-${formatted}` : formatted;
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className='w-fit min-w-[200px]'
                    labelFormatter={(value) => `Período: ${value}`}
                    // formatter={(value, name) => {
                    // 	if (value === null || value === undefined) return null;
                    // 	return [
                    // 		new Intl.NumberFormat("pt-BR", {
                    // 			style: "currency",
                    // 			currency: "BRL",
                    // 		}).format(value as number),
                    // 		name === "energyBill" ? "Conta com Solar" : name === "conventionalBill" ? "Conta Convencional" : name,
                    // 	];
                    // }}
                  />
                }
              />
              <Line dataKey='energyBill' stroke='#3b82f6' strokeWidth={2} dot={false} connectNulls={false} />
              <Line dataKey='conventionalBill' stroke='#f59e0b' strokeWidth={2} dot={false} connectNulls={false} />
            </LineChart>
          </ChartContainer>
        </div>
      </div>

      {/* Tabela Virtualizada */}
      <div className='flex w-full flex-col rounded-xl border border-primary/30 bg-background p-6 shadow-md gap-3'>
        <div className='flex items-center justify-between'>
          <h1 className='text-sm font-medium uppercase tracking-tight'>DETALHAMENTO MENSAL</h1>
          <CalendarDays className='h-4 w-4' />
        </div>
        <div className='w-full'>
          <VirtualizedTable isDesktop={isDesktop} data={analysis.progression} />
        </div>
      </div>
    </div>
  );
}
