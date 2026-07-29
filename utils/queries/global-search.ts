import { useDebouncedValue } from '@/lib/hooks';
import type { TGlobalSearchEntity, TGlobalSearchResponse } from '@/utils/schemas/global-search.schema';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type UseGlobalSearchParams = {
  open: boolean;
  search: string;
  entities: TGlobalSearchEntity[];
};

export function useGlobalSearch({ open, search, entities }: UseGlobalSearchParams) {
  const debouncedSearch = useDebouncedValue(search.trim(), 275);
  const sortedEntities = [...entities].sort();
  const shouldSearch = open && debouncedSearch.length >= 2;

  return {
    debouncedSearch,
    shouldSearch,
    ...useQuery({
      queryKey: ['global-search', debouncedSearch, sortedEntities],
      queryFn: async ({ signal }) => {
        const searchParams = new URLSearchParams({ q: debouncedSearch, limit: '5' });
        if (sortedEntities.length > 0) searchParams.set('entities', sortedEntities.join(','));
        const { data } = await axios.get<TGlobalSearchResponse>(`/api/global-search?${searchParams.toString()}`, { signal });
        return data.data;
      },
      enabled: shouldSearch,
      staleTime: 30_000,
      placeholderData: (previousData) => previousData,
      retry: 1,
    }),
  };
}
