import type { TClientReportData } from "@/app/api/clients/report/route";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type TClientReportFilters = {
  days: number | null;
  uf: string | null;
};

async function fetchClientReport(filters: TClientReportFilters) {
  const searchParams = new URLSearchParams();
  if (filters.days) searchParams.set("days", String(filters.days));
  if (filters.uf) searchParams.set("uf", filters.uf);
  const { data } = await axios.get<{ data: TClientReportData }>(
    `/api/clients/report?${searchParams.toString()}`,
  );
  return data.data;
}

export function useClientReport(filters: TClientReportFilters) {
  return useQuery({
    queryKey: ["client-report", filters],
    queryFn: () => fetchClientReport(filters),
    staleTime: 60_000,
  });
}
