import type { TUserSession } from '@/lib/auth/session';
import { usePartnersSimplified } from '@/utils/queries/partners';
import { useRevenuesByPersonalizedFilters } from '@/utils/queries/revenues';
import { useState } from 'react';
import RevenueCard from '../Cards/RevenueCard';
import RevenuePaginationMenu from './PaginationMenu';

type RevenuesBlockProps = {
  session: TUserSession;
};
function RevenuesBlock({ session }: RevenuesBlockProps) {
  const userPartnersScope = session.user.permissoes.parceiros.escopo;

  const [page, setPage] = useState<number>(1);
  const [partners, setPartners] = useState<string[] | null>(userPartnersScope || null);
  const { data: partnersOptions } = usePartnersSimplified();
  const { data, isLoading, isError, isSuccess, updateFilters } = useRevenuesByPersonalizedFilters({ page, partners });
  const revenues = data?.revenues;
  const revenuesMatched = data?.revenuesMatched;
  const totalPages = data?.totalPages;
  return (
    <div className='flex h-full w-full flex-col gap-2 rounded-sm border border-primary/30 bg-background p-3 shadow-md'>
      <div className='flex w-full items-center justify-between gap-2 border-b border-primary/30 pb-2'>
        <h1 className='w-full text-sm font-bold tracking-tight'>RECEITAS</h1>
      </div>
      <RevenuePaginationMenu
        activePage={page}
        selectPage={(x) => setPage(x)}
        totalPages={totalPages || 0}
        queryLoading={isLoading}
        revenuesMatched={revenuesMatched}
        revenuesShowing={revenues?.length}
      />
      <div className='flex w-full flex-col gap-2'>
        {revenues?.map((revenue, index) => (
          <div key={revenue._id} className='w-full'>
            <RevenueCard revenue={revenue} session={session} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RevenuesBlock;
