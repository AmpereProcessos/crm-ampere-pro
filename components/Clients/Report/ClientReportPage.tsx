"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  CircleUserRound,
  Database,
  FileWarning,
  Globe2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { TUserSession } from "@/lib/auth/session";
import { useClientReport } from "@/utils/queries/client-report";

const ClientRegionMap = dynamic(() => import("./client-region-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-[390px] w-full" />,
});

const PERIODS = [
  { label: "Últimos 30 dias", value: "30" },
  { label: "Últimos 90 dias", value: "90" },
  { label: "Últimos 12 meses", value: "365" },
  { label: "Todo o histórico", value: "all" },
];
const QUALITY_ICONS = {
  phone: Phone,
  email: Mail,
  registry: BadgeCheck,
  cep: MapPin,
  location: Globe2,
};
const CHART_CONFIG = { total: { label: "Novos clientes", color: "hsl(var(--chart-3))" } };

export default function ClientReportPage({ session }: { session: TUserSession }) {
  const [period, setPeriod] = useState("365");
  const [uf, setUf] = useState("all");
  const report = useClientReport({
    days: period === "all" ? null : Number(period),
    uf: uf === "all" ? null : uf,
  });
  const data = report.data;
  const states = data?.byUf ?? [];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar session={session} />
      <main className="flex min-w-0 grow flex-col gap-6 overflow-x-hidden bg-background p-4 lg:p-6">
        <header className="flex flex-col gap-4 border-b border-border pb-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-col gap-2">
            <Link
              href="/clientes"
              className="flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Banco de clientes
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Relatório de clientes</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Cobertura da base, qualidade cadastral e distribuição regional dentro do seu escopo
                de acesso.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="min-w-48" aria-label="Período do relatório">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={uf} onValueChange={setUf}>
              <SelectTrigger className="min-w-40" aria-label="Estado do relatório">
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state.uf} value={state.uf}>
                    {state.uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {report.isLoading ? <ReportSkeleton /> : null}
        {report.isError ? <ReportError retry={() => report.refetch()} /> : null}
        {data && data.kpis.total === 0 ? <EmptyReport /> : null}
        {data && data.kpis.total > 0 ? <ReportContent data={data} /> : null}
      </main>
    </div>
  );
}

function ReportContent({
  data,
}: {
  data: NonNullable<ReturnType<typeof useClientReport>["data"]>;
}) {
  return (
    <>
      <section
        aria-label="Indicadores principais"
        className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 xl:grid-cols-5"
      >
        <Kpi
          label="Clientes analisados"
          value={formatNumber(data.kpis.total)}
          detail="no período e escopo selecionados"
          icon={Users}
        />
        <Kpi
          label="Qualidade média"
          value={formatPercentage(data.kpis.qualityScore)}
          detail="considerando 6 campos essenciais"
          icon={Database}
        />
        <Kpi
          label="Cadastros completos"
          value={formatNumber(data.kpis.complete)}
          detail={`${formatPercentage((data.kpis.complete / data.kpis.total) * 100)} da base`}
          icon={BadgeCheck}
        />
        <Kpi
          label="Precisam de atenção"
          value={formatNumber(data.kpis.incomplete)}
          detail="com ao menos um campo ausente"
          icon={FileWarning}
        />
        <Kpi
          label="Possíveis duplicidades"
          value={formatNumber(data.kpis.duplicateGroups)}
          detail={`${formatNumber(data.kpis.duplicateAffected)} registros envolvidos`}
          icon={CircleUserRound}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <SectionHeading
            title="Qualidade dos dados"
            description="Percentual de clientes com cada campo essencial preenchido."
          />
          <div className="divide-y divide-border rounded-lg border border-border">
            {data.quality.map((metric) => {
              const Icon = QUALITY_ICONS[metric.key];
              return (
                <div
                  key={metric.key}
                  className="grid gap-3 p-4 sm:grid-cols-[180px_minmax(0,1fr)_100px] sm:items-center"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {metric.label}
                  </div>
                  <Progress
                    value={metric.percentage}
                    aria-label={`${metric.label}: ${formatPercentage(metric.percentage)}`}
                  />
                  <div className="text-left sm:text-right">
                    <p className="font-bold tabular-nums">{formatPercentage(metric.percentage)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(metric.count)} clientes
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <SectionHeading
            title="Evolução da base"
            description="Novos clientes cadastrados por mês."
          />
          <div className="h-[330px] rounded-lg border border-border p-4">
            <ChartContainer config={CHART_CONFIG} className="h-full w-full">
              <AreaChart data={data.timeline} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clientsReportGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatPeriod}
                  minTickGap={24}
                />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent labelFormatter={(value) => formatPeriod(String(value))} />
                  }
                />
                <Area
                  dataKey="total"
                  type="monotone"
                  stroke="var(--color-total)"
                  strokeWidth={2}
                  fill="url(#clientsReportGradient)"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading
          title="Distribuição regional"
          description="O mapa usa o centro geográfico de cada UF e não expõe endereços individuais."
        />
        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-border xl:grid-cols-[minmax(0,1.5fr)_380px]">
          <ClientRegionMap regions={data.byUf} />
          <div className="max-h-[390px] overflow-y-auto border-t border-border xl:border-l xl:border-t-0">
            <table className="w-full text-sm">
              <caption className="sr-only">Quantidade de clientes por estado</caption>
              <thead className="sticky top-0 bg-background">
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    UF
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Clientes
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Participação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.byUf.map((state) => (
                  <tr key={state.uf} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-bold">{state.uf}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatNumber(state.total)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                      {formatPercentage((state.total / data.kpis.total) * 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Ranking
          title="Principais cidades"
          icon={Building2}
          items={data.byCity.map((row) => ({ label: `${row.city} · ${row.uf}`, total: row.total }))}
        />
        <Ranking
          title="Canais de aquisição"
          icon={Globe2}
          items={data.byChannel.map((row) => ({ label: row.channel, total: row.total }))}
        />
      </section>

      <IncompleteClientsTable clients={data.incompleteClients} />
    </>
  );
}

function IncompleteClientsTable({
  clients,
}: {
  clients: NonNullable<ReturnType<typeof useClientReport>["data"]>["incompleteClients"];
}) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        title="Cadastros prioritários para correção"
        description="Os 20 registros com menor completude, ordenados para facilitar o saneamento da base."
      />
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-semibold">
                Cliente
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Localização
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Campos ausentes
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Completude
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-semibold">{client.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {[client.city, client.uf].filter(Boolean).join(" · ") || "Não informada"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex max-w-md flex-wrap gap-1.5">
                    {client.missing.map((field) => (
                      <span
                        key={field}
                        className="rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Progress value={client.completeness} className="w-24" />
                    <span className="text-xs font-bold tabular-nums">
                      {formatPercentage(client.completeness)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Kpi({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <div className="flex min-h-32 flex-col justify-between gap-4 bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-2xl font-black tabular-nums">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-base font-black tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Ranking({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof Globe2;
  items: Array<{ label: string; total: number }>;
}) {
  const max = Math.max(1, ...items.map((item) => item.total));
  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-bold">{title}</h2>
      </div>
      <div className="divide-y divide-border">
        {items.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Sem dados disponíveis.</p>
        ) : null}
        {items.map((item) => (
          <div
            key={item.label}
            className="grid grid-cols-[minmax(0,1fr)_80px] items-center gap-4 px-4 py-3"
          >
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium">{item.label}</p>
                <span className="text-xs text-muted-foreground">
                  {Math.round((item.total / max) * 100)}%
                </span>
              </div>
              <Progress value={(item.total / max) * 100} />
            </div>
            <p className="text-right font-bold tabular-nums">{formatNumber(item.total)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-label="Carregando relatório">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
      <Skeleton className="h-[430px]" />
    </div>
  );
}

function ReportError({ retry }: { retry: () => void }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <div>
        <h2 className="font-bold">Não foi possível carregar o relatório</h2>
        <p className="text-sm text-muted-foreground">Tente novamente. Nenhum dado foi alterado.</p>
      </div>
      <Button type="button" variant="outline" onClick={retry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  );
}

function EmptyReport() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 text-center">
      <Database className="h-8 w-8 text-muted-foreground" />
      <div>
        <h2 className="font-bold">Nenhum cliente neste recorte</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Altere o período ou o estado para ampliar a análise.
        </p>
      </div>
    </div>
  );
}

const formatNumber = (value: number) => value.toLocaleString("pt-BR");
const formatPercentage = (value: number) =>
  `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
const formatPeriod = (value: string) => {
  const [year, month] = value.split("-");
  return month && year ? `${month}/${year.slice(-2)}` : value;
};
