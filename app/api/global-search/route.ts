import { apiHandler } from '@/lib/api';
import { getValidCurrentSessionUncached } from '@/lib/auth/session';
import { globalSearch } from '@/repositories/global-search/queries';
import { GlobalSearchInputSchema, type TGlobalSearchResponse } from '@/utils/schemas/global-search.schema';
import { type NextRequest, NextResponse } from 'next/server';

async function getGlobalSearch(request: NextRequest) {
  const session = await getValidCurrentSessionUncached();
  const searchParams = request.nextUrl.searchParams;
  const entities = searchParams.get('entities')?.split(',').filter(Boolean);
  const input = GlobalSearchInputSchema.parse({
    q: searchParams.get('q'),
    entities,
    limit: searchParams.get('limit') ?? undefined,
  });
  const results = await globalSearch(session, input);
  return NextResponse.json<TGlobalSearchResponse>({ data: { results } });
}

export const GET = apiHandler({ GET: getGlobalSearch });
