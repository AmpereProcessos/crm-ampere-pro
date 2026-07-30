import type { IClient, IKit, IRepresentative, IResponsible, ISession } from "@/utils/models";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";

export function useKitQueryPipelines(
  type: "TODOS OS KITS" | "KITS POR PREMISSA",
  payload: Record<string, any>,
  partnerQuery: any,
) {
  const currentDate = new Date().toISOString();
  const match: Record<string, unknown> = {
    ativo: true,
    $or: [{ dataValidade: null }, { dataValidade: { $gt: currentDate } }],
    ...partnerQuery,
  };

  if (type === "TODOS OS KITS" || type === "KITS POR PREMISSA") {
    match.estruturasCompativeis = payload.structure ? payload.structure : [];
  }
  if (type === "KITS POR PREMISSA") {
    match.$and = [{ potenciaPico: { $gte: payload.min } }, { potenciaPico: { $lte: payload.max } }];
  }

  return [
    { $match: match },
    { $addFields: { methodologyObjectId: { $toObjectId: "$idMetodologiaPrecificacao" } } },
    {
      $lookup: {
        from: "pricing-methods",
        localField: "methodologyObjectId",
        foreignField: "_id",
        as: "metodologia",
      },
    },
    { $sort: { dataInsercao: -1 } },
  ];
}

export function checkQueryEnableStatus(session: ISession | null, queryId: unknown) {
  return !!session?.user && typeof queryId === "string";
}

function showQueryError(error: unknown) {
  if (error instanceof AxiosError) {
    toast.error(error.response?.data.error.message);
    return;
  }
  if (error instanceof Error) toast.error(error.message);
}

export function useRepresentatives(): UseQueryResult<IRepresentative[], Error> {
  return useQuery({
    queryKey: ["representatives"],
    queryFn: async (): Promise<IRepresentative[]> => {
      try {
        const { data } = await axios.get("/api/representatives");
        return data.data;
      } catch (error) {
        showQueryError(error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });
}

export function useClient(clientId: string, enabled: boolean): UseQueryResult<IClient, Error> {
  return useQuery<IClient, Error>({
    queryKey: ["client", clientId],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`/api/clients?id=${clientId}`);
        return data.data;
      } catch (error) {
        showQueryError(error);
        throw error;
      }
    },
    enabled: enabled && !!clientId,
  });
}

export function useResponsibles(): UseQueryResult<IResponsible[], Error> {
  return useQuery({
    queryKey: ["responsibles"],
    queryFn: async (): Promise<IResponsible[]> => {
      try {
        const { data } = await axios.get("/api/responsibles");
        return data.data;
      } catch (error) {
        showQueryError(error);
        return [];
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useResponsibleInfo(responsibleId: string | undefined): IResponsible | null {
  const { data: responsible } = useQuery({
    queryKey: ["responsible", responsibleId],
    queryFn: async (): Promise<IResponsible | null> => {
      try {
        const { data } = await axios.get(`/api/responsibles?id=${responsibleId}`);
        return data.data;
      } catch (error) {
        showQueryError(error);
        return null;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
    enabled: !!responsibleId,
  });

  return responsible ?? null;
}

export function useKits(onlyActive?: boolean): UseQueryResult<IKit[], Error> {
  return useQuery({
    queryKey: ["kits"],
    queryFn: async (): Promise<IKit[]> => {
      try {
        const url = onlyActive ? "/api/kits?active=true" : "/api/kits";
        const { data } = await axios.get(url);
        return data.data;
      } catch (error) {
        showQueryError(error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });
}

export function useClients(
  representative: string | null | undefined,
  enabled: boolean,
): UseQueryResult<IClient[], Error> {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async (): Promise<IClient[]> => {
      try {
        const { data } = await axios.get(`/api/clients?representative=${representative}`);
        return data.data;
      } catch (error) {
        showQueryError(error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    enabled,
  });
}
