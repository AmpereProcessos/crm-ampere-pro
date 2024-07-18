import { renderPaginationPageItemsIcons } from '@/lib/methods/rendering'
import React from 'react'

type ReceiptsPaginationMenuProps = {
  activePage: number
  selectPage: (x: number) => void
  totalPages: number
  receiptsMatched?: number
  receiptsShowing?: number
  queryLoading: boolean
}
function ReceiptsPaginationMenu({ activePage, selectPage, totalPages, receiptsMatched, receiptsShowing, queryLoading }: ReceiptsPaginationMenuProps) {
  return (
    <div className="my-2 flex w-full flex-col items-center gap-1 ">
      {totalPages > 1 ? (
        <>
          <p className="w-full text-center text-sm leading-none tracking-tight text-gray-500">
            Um número grande de recebimentos foi encontrado, separamos em páginas para facilitar a visualização. Clique na página desejada para visualizar os
            demais recebimentos.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              disabled={queryLoading}
              onClick={() => {
                if (activePage - 1 > 0) return selectPage(activePage - 1)
                else return
              }}
              className="flex select-none items-center gap-2 rounded-full px-6 py-3 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none hover:bg-gray-900/10 active:bg-gray-900/20"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"></path>
              </svg>
              ANTERIOR
            </button>
            <div className="flex items-center gap-2">{renderPaginationPageItemsIcons({ totalPages, activePage, selectPage, disabled: queryLoading })}</div>
            <button
              disabled={queryLoading}
              onClick={() => {
                if (activePage + 1 <= totalPages) selectPage(activePage + 1)
                else return
              }}
              className="flex select-none items-center gap-2 rounded-full px-6 py-3 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none hover:bg-gray-900/10 active:bg-gray-900/20"
              type="button"
            >
              PRÓXIMA
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
              </svg>
            </button>
          </div>
        </>
      ) : null}

      <p className="w-full text-center text-sm leading-none tracking-tight text-gray-500">
        {receiptsMatched ? (receiptsMatched > 1 ? `${receiptsMatched} recebimentos encontrados.` : `${receiptsMatched} recebimento encontrado.`) : null}
      </p>
      <p className="w-full text-center text-sm leading-none tracking-tight text-gray-500">
        {receiptsShowing ? (receiptsShowing > 1 ? `Mostrando ${receiptsShowing} recebimentos.` : `Mostrando ${receiptsShowing} recebimento.`) : null}
      </p>
    </div>
  )
}

export default ReceiptsPaginationMenu
