import PurchaseCard from '@/components/Cards/PurchaseCard'
import ControlPurchase from '@/components/Modals/Purchase/ControlPurchase'
import { Sidebar } from '@/components/Sidebar'
import ErrorComponent from '@/components/utils/ErrorComponent'
import LoadingComponent from '@/components/utils/LoadingComponent'
import LoadingPage from '@/components/utils/LoadingPage'
import { usePurchases } from '@/utils/queries/purchases'
import { useSession } from 'next-auth/react'
import React, { useState } from 'react'
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from 'react-icons/io'

function PurchasesMainPage() {
  const { data: session, status } = useSession({ required: true })
  const { data: purchases, isLoading, isError, isSuccess } = usePurchases()
  const [filterMenuIsOpen, setFilterMenuIsOpen] = useState<boolean>(false)

  const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false })
  if (status != 'authenticated') return <LoadingPage />
  return (
    <div className="flex h-full flex-col md:flex-row">
      <Sidebar session={session} />
      <div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
        <div className="flex flex-col items-center border-b border-[#000] pb-2">
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
          {/* {filterMenuIsOpen ? <FilterMenu filters={filters} setFilters={setFilters} /> : null} */}
        </div>
        <div className="flex flex-wrap justify-between gap-2 py-2">
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent msg="Erro ao buscar registros de compra." /> : null}
          {isSuccess ? (
            purchases.length > 0 ? (
              purchases.map((purchase) => (
                <div key={purchase._id} className="w-full lg:w-[600px]">
                  <PurchaseCard purchase={purchase} handleClick={(id) => setEditModal({ id: id, isOpen: true })} />
                </div>
              ))
            ) : (
              <p className="flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-gray-500">
                Nenhum registro de compra encontrado.
              </p>
            )
          ) : null}
        </div>
      </div>
      {editModal.id && editModal.isOpen ? (
        <ControlPurchase purchaseId={editModal.id} session={session} closeModal={() => setEditModal({ id: null, isOpen: false })} />
      ) : null}
    </div>
  )
}

export default PurchasesMainPage
