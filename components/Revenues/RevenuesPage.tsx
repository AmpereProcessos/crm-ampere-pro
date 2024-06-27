import React, { useState } from 'react'
import { Sidebar } from '../Sidebar'
import { Session } from 'next-auth'
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from 'react-icons/io'
import RevenuesFilterMenu from './FilterMenu'
import { usePartnersSimplified } from '@/utils/queries/partners'
import { useRevenuesByPersonalizedFilters } from '@/utils/queries/revenues'
import RevenuePaginationMenu from './PaginationMenu'
import LoadingComponent from '../utils/LoadingComponent'
import ErrorComponent from '../utils/ErrorComponent'

type RevenuesPageProps = {
  session: Session
}
function RevenuesPage({ session }: RevenuesPageProps) {
  const userPartnersScope = session.user.permissoes.parceiros.escopo
  const [filterMenuIsOpen, setFilterMenuIsOpen] = useState<boolean>(false)

  const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false })
  const [page, setPage] = useState<number>(1)
  const [partners, setPartners] = useState<string[] | null>(userPartnersScope || null)
  const { data: partnersOptions } = usePartnersSimplified()
  const { data, isLoading, isError, isSuccess, updateFilters } = useRevenuesByPersonalizedFilters({ page, partners })
  const revenues = data?.revenues
  const revenuesMatched = data?.revenuesMatched
  const totalPages = data?.totalPages
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
        <div className="flex w-full flex-col gap-2 border-b border-black pb-2">
          <div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
            <div className="flex items-center gap-1">
              {filterMenuIsOpen ? (
                <div className="cursor-pointer text-gray-600 hover:text-blue-400">
                  <IoMdArrowDropupCircle style={{ fontSize: '25px' }} onClick={() => setFilterMenuIsOpen(false)} />
                </div>
              ) : (
                <div className="cursor-pointer text-gray-600 hover:text-blue-400">
                  <IoMdArrowDropdownCircle style={{ fontSize: '25px' }} onClick={() => setFilterMenuIsOpen(true)} />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">CONTROLE DE COMPRAS</h1>
              </div>
            </div>
          </div>
          {filterMenuIsOpen ? (
            <RevenuesFilterMenu
              session={session}
              updateFilters={updateFilters}
              selectedPartners={partners}
              setSelectedPartners={setPartners}
              partnersOptions={partnersOptions}
              queryLoading={isLoading}
              resetSelectedPage={() => setPage(1)}
            />
          ) : null}
        </div>
        <RevenuePaginationMenu
          activePage={page}
          selectPage={(x) => setPage(x)}
          totalPages={totalPages || 0}
          queryLoading={isLoading}
          revenuesMatched={revenuesMatched}
          revenuesShowing={revenues?.length}
        />
        <div className="flex flex-wrap justify-between gap-2 py-2">
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent msg={'Erro ao buscar receitas.'} /> : null}
        </div>
      </div>
    </div>
  )
}

export default RevenuesPage
