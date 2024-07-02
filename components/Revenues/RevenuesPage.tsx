import React, { useState } from 'react'
import { Sidebar } from '../Sidebar'
import { Session } from 'next-auth'
import { IoIosStats, IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from 'react-icons/io'
import RevenuesFilterMenu from './FilterMenu'
import { usePartnersSimplified } from '@/utils/queries/partners'
import { useRevenuesByPersonalizedFilters } from '@/utils/queries/revenues'
import RevenuePaginationMenu from './PaginationMenu'
import LoadingComponent from '../utils/LoadingComponent'
import ErrorComponent from '../utils/ErrorComponent'
import RevenueCard from '../Cards/RevenueCard'
import NewRevenue from '../Modals/Revenues/NewRevenue'
import EditRevenue from '../Modals/Revenues/EditRevenue'
import { AiOutlineTeam } from 'react-icons/ai'
import RevenueStats from './Stats'

type RevenuesPageProps = {
  session: Session
}
function RevenuesPage({ session }: RevenuesPageProps) {
  const userPartnersScope = session.user.permissoes.parceiros.escopo
  const [filterMenuIsOpen, setFilterMenuIsOpen] = useState<boolean>(false)
  const [statsBlockIsOpen, setStatsBlockIsOpen] = useState<boolean>(false)

  const [newRevenueModalIsOpen, setNewRevenueModalIsOpen] = useState<boolean>(false)
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
            <div className="flex items-center gap-2">
              {true ? (
                <button
                  onClick={() => setStatsBlockIsOpen((prev) => !prev)}
                  className="flex items-center gap-1 font-bold tracking-tight text-gray-500 duration-300 ease-in-out hover:text-cyan-500"
                >
                  <p className="text-sm">ESTATÍSTICAS</p>
                  <IoIosStats />
                </button>
              ) : null}
              <button
                onClick={() => setNewRevenueModalIsOpen(true)}
                className="h-9 whitespace-nowrap rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
              >
                CRIAR RECEITA
              </button>
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
          {statsBlockIsOpen ? <RevenueStats session={session} partnerOptions={partnersOptions || []} closeMenu={() => setStatsBlockIsOpen(false)} /> : null}
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
          {isSuccess && revenues ? (
            revenues.length > 0 ? (
              revenues.map((revenue) => (
                <div key={revenue._id} className="w-full lg:w-[500px]">
                  <RevenueCard revenue={revenue} handleClick={(id) => setEditModal({ id: id, isOpen: true })} />
                </div>
              ))
            ) : (
              <p className="w-full text-center italic text-gray-500">Nenhuma receita encontrada...</p>
            )
          ) : null}
        </div>
      </div>
      {newRevenueModalIsOpen ? <NewRevenue session={session} closeModal={() => setNewRevenueModalIsOpen(false)} /> : null}
      {editModal.id && editModal.isOpen ? (
        <EditRevenue session={session} revenueId={editModal.id} closeModal={() => setEditModal({ id: null, isOpen: false })} />
      ) : null}
    </div>
  )
}

export default RevenuesPage
