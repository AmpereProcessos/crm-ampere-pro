import { usePurchasesByPersonalizedFilters } from '@/utils/queries/purchases'
import { Session } from 'next-auth'
import React, { useState } from 'react'
import { Sidebar } from '../Sidebar'
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from 'react-icons/io'
import LoadingComponent from '../utils/LoadingComponent'
import ErrorComponent from '../utils/ErrorComponent'
import PurchaseCard from '../Cards/PurchaseCard'
import PurchasesFilterMenu from './FilterMenu'
import { usePartnersSimplified } from '@/utils/queries/partners'
import PurchasePaginationMenu from './PaginationMenu'
import ControlPurchase from '../Modals/Purchase/ControlPurchase'

type PurchasesPageProps = {
  session: Session
}
function PurchasesPage({ session }: PurchasesPageProps) {
  const userPartnersScope = session.user.permissoes.parceiros.escopo
  const [filterMenuIsOpen, setFilterMenuIsOpen] = useState<boolean>(false)

  const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false })
  const [page, setPage] = useState<number>(1)
  const [partners, setPartners] = useState<string[] | null>(userPartnersScope || null)

  const { data, isLoading, isError, isSuccess, updateFilters } = usePurchasesByPersonalizedFilters({ page, partners })
  const { data: partnersOptions } = usePartnersSimplified()
  const purchases = data?.purchases
  const purchasesMatched = data?.purchasesMatched
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
            <PurchasesFilterMenu
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
        <PurchasePaginationMenu
          activePage={page}
          selectPage={(x) => setPage(x)}
          totalPages={totalPages || 0}
          queryLoading={isLoading}
          purchasesMatched={purchasesMatched}
          purchasesShowing={purchases?.length}
        />
        <div className="flex flex-wrap justify-between gap-2 py-2">
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent msg={'Erro ao buscar registros de compra.'} /> : null}
          {isSuccess && purchases
            ? purchases.map((purchase) => (
                <div key={purchase._id} className="w-full">
                  <PurchaseCard purchase={purchase} handleClick={(id) => setEditModal({ id: id, isOpen: true })} />
                </div>
              ))
            : null}
        </div>
      </div>
      {editModal.id && editModal.isOpen ? (
        <ControlPurchase purchaseId={editModal.id} session={session} closeModal={() => setEditModal({ id: null, isOpen: false })} />
      ) : null}
    </div>
  )
}

export default PurchasesPage
