import { z } from 'zod';

export const GlobalSearchEntitySchema = z.enum(['clients', 'opportunities', 'proposals', 'projects', 'technicalAnalysis', 'homologations']);

export type TGlobalSearchEntity = z.infer<typeof GlobalSearchEntitySchema>;

export const GLOBAL_SEARCH_ENTITIES = GlobalSearchEntitySchema.options;

export const GlobalSearchInputSchema = z.object({
  q: z.string().trim().min(2, 'Digite ao menos 2 caracteres.').max(80, 'A busca deve possuir no máximo 80 caracteres.'),
  entities: z.array(GlobalSearchEntitySchema).optional(),
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

export type TGlobalSearchInput = z.infer<typeof GlobalSearchInputSchema>;

export type TGlobalSearchResultItem = {
  id: string;
  entity: TGlobalSearchEntity;
  label: string;
  description: string | null;
  href: string;
};

export type TGlobalSearchResults = Record<TGlobalSearchEntity, TGlobalSearchResultItem[]>;

export type TGlobalSearchResponse = {
  data: {
    results: TGlobalSearchResults;
  };
};

export function createEmptyGlobalSearchResults(): TGlobalSearchResults {
  return {
    clients: [],
    opportunities: [],
    proposals: [],
    projects: [],
    technicalAnalysis: [],
    homologations: [],
  };
}
