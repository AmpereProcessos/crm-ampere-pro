import { renderPaginationPageItemsIcons } from '@/lib/methods/rendering';

type GeneralQueryPaginationMenuProps = {
  activePage: number;
  selectPage: (x: number) => void;
  totalPages: number;
  itemsMatched?: number;
  itemsShowing?: number;
  queryLoading: boolean;
};
function GeneralQueryPaginationMenu({
  activePage,
  selectPage,
  totalPages,
  itemsMatched,
  itemsShowing,
  queryLoading,
}: GeneralQueryPaginationMenuProps) {
  return (
    <div className='my-2 flex w-full flex-col items-center gap-1 '>
      {totalPages > 1 ? (
        <>
          <p className='w-full text-center text-sm leading-none tracking-tight text-primary/50'>
            Um número grande de itens foi encontrado, separamos em páginas para facilitar a visualização. Clique na página desejada para visualizar os
            demais itens.
          </p>
          <div className='flex items-center justify-center gap-4'>
            <button
              disabled={queryLoading}
              onClick={() => {
                if (activePage - 1 > 0) return selectPage(activePage - 1);
                return;
              }}
              className='flex select-none items-center gap-2 rounded-full px-6 py-3 text-center align-middle font-sans text-xs font-bold uppercase text-primary/90 transition-all disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none hover:bg-primary/90/10 active:bg-primary/90/20'
              type='button'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke-width='2'
                stroke='currentColor'
                aria-hidden='true'
                className='h-4 w-4'
              >
                <path stroke-linecap='round' stroke-linejoin='round' d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18' />
              </svg>
              ANTERIOR
            </button>
            <div className='flex items-center gap-2'>
              {renderPaginationPageItemsIcons({ totalPages, activePage, selectPage, disabled: queryLoading })}
            </div>
            <button
              disabled={queryLoading}
              onClick={() => {
                if (activePage + 1 <= totalPages) selectPage(activePage + 1);
                else return;
              }}
              className='flex select-none items-center gap-2 rounded-full px-6 py-3 text-center align-middle font-sans text-xs font-bold uppercase text-primary/90 transition-all disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none hover:bg-primary/90/10 active:bg-primary/90/20'
              type='button'
            >
              PRÓXIMA
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke-width='2'
                stroke='currentColor'
                aria-hidden='true'
                className='h-4 w-4'
              >
                <path stroke-linecap='round' stroke-linejoin='round' d='M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3' />
              </svg>
            </button>
          </div>
        </>
      ) : null}

      <p className='w-full text-center text-sm leading-none tracking-tight text-primary/50'>
        {itemsMatched ? (itemsMatched > 0 ? `${itemsMatched} itens encontrados.` : `${itemsMatched} item encontrado.`) : 'Nenhum item encontrado.'}
      </p>
      <p className='w-full text-center text-sm leading-none tracking-tight text-primary/50'>
        {itemsShowing ? (itemsShowing > 0 ? `Mostrando ${itemsShowing} itens.` : `Mostrando ${itemsShowing} item.`) : null}
      </p>
    </div>
  );
}

export default GeneralQueryPaginationMenu;
