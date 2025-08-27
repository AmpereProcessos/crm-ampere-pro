import type { TComercialResultsQueryFiltersOptions } from '@/app/api/stats/comercial-results/query-options/route';
import { TGetGraphDataRouteInput, TGetGraphDataRouteOutput } from '@/app/api/stats/graph/route';
import type { TGetStatsQueryFiltersOptionsRouteOutput, TGetStatsRouteOutput } from '@/app/api/stats/route';
import type { TSalesStats } from '@/app/api/stats/sales/route';
import type { TActivityDTO } from '@/utils/schemas/activities.schema';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type TStats = {
  simplificado: {
    ANTERIOR: {
      projetosCriados: number;
      projetosGanhos: number;
      projetosPerdidos: number;
      totalVendido: number;
    };
    ATUAL: {
      projetosCriados: number;
      projetosGanhos: number;
      projetosPerdidos: number;
      totalVendido: number;
    };
  };
  propostasAssinadas: {
    responsaveis: {
      id: string;
      nome: string;
      papel: string;
      avatar_url?: string | null | undefined;
    }[];
    dataAssinatura: string | null | undefined;
    _id: string;
    nome: string;
    valor: number;
  }[];
  atividades: TActivityDTO[];
  assinaturasPendentes: {
    _id: string;
    nome: string;
    identificador: string;
    valorProposta: number;
    responsaveis: {
      id: string;
      nome: string;
      papel: string;
      avatar_url?: string | null | undefined;
    }[];
  }[];
};

type UseStatsParams = {
  after: string;
  before: string;
  responsibles: string[] | null;
  partners: string[] | null;
  projectTypes: string[] | null;
};
async function fetchStats({ after, before, responsibles, partners, projectTypes }: UseStatsParams) {
  const { data }: { data: TGetStatsRouteOutput } = await axios.post(`/api/stats?after=${after}&before=${before}`, {
    responsibles,
    partners,
    projectTypes,
  });
  return data.data;
}
export function useStats({ after, before, responsibles, partners, projectTypes }: UseStatsParams) {
  return useQuery({
    queryKey: ['stats', after, before, responsibles, partners, projectTypes],
    queryFn: async () => await fetchStats({ after, before, responsibles, partners, projectTypes }),
    refetchOnWindowFocus: false,
  });
}
async function fetchStatsQueryOptions() {
  const { data }: { data: TGetStatsQueryFiltersOptionsRouteOutput } = await axios.get('/api/stats');
  return data.data.options;
}
export function useStatsQueryOptions() {
  return useQuery({
    queryKey: ['general-stats-query-options'],
    queryFn: fetchStatsQueryOptions,
  });
}
async function fetchComercialResultsQueryOptions() {
  const { data } = await axios.get('/api/stats/comercial-results/query-options');
  return data.data as TComercialResultsQueryFiltersOptions;
}
export function useComercialResultsQueryOptions() {
  return useQuery({
    queryKey: ['comercial-results-query-options'],
    queryFn: fetchComercialResultsQueryOptions,
  });
}
async function fetchSalesStats(after: string, before: string, responsibles: string[] | null) {
  const { data } = await axios.get(`/api/stats/sales?after=${after}&before=${before}&responsibles=${responsibles}`);
  return data.data as TSalesStats;
}
export function useSaleStats(after: string, before: string, responsibles: string[] | null) {
  return useQuery({
    queryKey: ['sale-stats', after, before, responsibles],
    queryFn: async () => await fetchSalesStats(after, before, responsibles),
  });
}

type TFetchGraphDataParams = {
  after: string;
  before: string;
  filters: TGetGraphDataRouteInput;
};
async function fetchGraphData({ after, before, filters }: TFetchGraphDataParams) {
  const { data } = await axios.post<TGetGraphDataRouteOutput>(`/api/stats/graph?after=${after}&before=${before}`, filters);
  return data.data;
}

export function useGraphData({ after, before, filters }: TFetchGraphDataParams) {
  return useQuery({
    queryKey: ['graph-data', after, before, filters],
    queryFn: async () => await fetchGraphData({ after, before, filters }),
  });
}
