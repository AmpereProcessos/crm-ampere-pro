import React, { useState } from 'react'
import { useSession } from 'next-auth/react'

import { Sidebar } from '@/components/Sidebar'
import KitCard from '@/components/Cards/Kit'
import NewKit from '@/components/Modals/Kit/NewKit'
import EditKit from '@/components/Modals/Kit/EditKit'
import FilterMenu from '@/components/Kits/FilterMenu'
import LoadingComponent from '@/components/utils/LoadingComponent'
import ErrorComponent from '@/components/utils/ErrorComponent'
import LoadingPage from '@/components/utils/LoadingPage'
import NotAuthorizedPage from '@/components/utils/NotAuthorizedPage'

import { fetchKitsExportation, useKits } from '@/utils/queries/kits'
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from 'react-icons/io'
import KitBulkOperation from '@/components/Modals/Kit/BulkOperation'
import { TbFileDownload, TbFileExport } from 'react-icons/tb'
import { TBulkOperationKit, TKitDTO } from '@/utils/schemas/kits.schema'
import { usePricingMethods } from '@/utils/queries/pricing-methods'
import { formatDateAsLocale } from '@/lib/methods/formatting'
import { getExcelFromJSON } from '@/lib/methods/excel-utils'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/methods/errors'
type TEditModal = {
  isOpen: boolean
  id: string | null
}
function Kits() {
  const { data: session, status } = useSession({ required: true })
  const { data: kits, status: kitsStatus, isSuccess, isLoading, isError, filters, setFilters } = useKits()
  const { data: pricingMethods } = usePricingMethods()

  const [editModal, setEditModal] = useState<TEditModal>({ isOpen: false, id: null })
  const [newKitModalIsOpen, setNewKitModalIsOpen] = useState(false)
  const [bulkOperationModalIsOpen, setBulkOperationModalIsOpen] = useState<boolean>(false)
  const [filterMenuIsOpen, setFilterMenuIsOpen] = useState<boolean>(false)

  async function handleDataExport() {
    try {
      const kits = await fetchKitsExportation()
      getExcelFromJSON(kits, `KITS ${formatDateAsLocale(new Date().toISOString())}`)
      return toast.success('Exportação concluída com sucesso ')
    } catch (error) {
      const msg = getErrorMessage(error)
      return toast.error(msg)
    }
  }

  if (status == 'loading') return <LoadingPage />
  if (!session.user.permissoes.kits.visualizar) return <NotAuthorizedPage session={session} />

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
                <h1 className="text-xl font-black leading-none tracking-tight md:text-2xl">BANCO DE KITS</h1>
                <p className="text-sm leading-none tracking-tight text-gray-500">
                  {kits?.length ? (kits.length > 0 ? `${kits.length} kits cadastrados` : `${kits.length} kit cadastrado`) : '...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {session?.user.permissoes.kits.criar || session.user.permissoes.kits.editar ? (
                <button
                  onClick={() => setBulkOperationModalIsOpen(true)}
                  className="h-9 whitespace-nowrap rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
                >
                  OPERAÇÃO EM MASSA
                </button>
              ) : null}
              {session?.user.permissoes.kits.criar ? (
                <button
                  onClick={() => setNewKitModalIsOpen(true)}
                  className="h-9 whitespace-nowrap rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
                >
                  CRIAR KIT
                </button>
              ) : null}
            </div>
          </div>
          {filterMenuIsOpen ? <FilterMenu setFilters={setFilters} filters={filters} /> : null}
          <div className="mt-4 flex w-full flex-col items-center gap-2 lg:flex-row">
            {session.user.permissoes.kits.editar ? (
              <>
                <button
                  onClick={async () => {
                    handleDataExport()
                  }}
                  className="flex w-full items-center gap-2 rounded-md bg-gray-300 px-2 py-1 text-sm font-medium lg:w-fit"
                >
                  <p>Exportar dados como .XLSX</p>
                  <TbFileExport />
                </button>
                <button
                  onClick={async () => {
                    const fileUrl = '/operacao-em-massa-kits.xlsx'
                    // Create a temporary link element
                    const link = document.createElement('a')
                    link.href = fileUrl

                    // Set the download attribute to specify the filename

                    link.download = 'operacao-em-massa-kits.xlsx'

                    // Append the link to the document and trigger a click event
                    document.body.appendChild(link)
                    link.click()

                    // Remove the link from the document
                    document.body.removeChild(link)
                  }}
                  className="flex w-full items-center gap-2 rounded-md bg-blue-300 px-2 py-1 text-sm font-medium lg:w-fit"
                >
                  <p>Baixar planilha de referência</p>
                  <TbFileDownload />
                </button>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-2 py-2">
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent msg="Oops, houve um erro ao buscar kits..." /> : null}
          {isSuccess
            ? kits.map((kit, index) => (
                <KitCard
                  key={index}
                  kit={kit}
                  userHasEditPermission={session.user?.permissoes.kits.editar}
                  userHasPricingViewPermission={session.user.permissoes.precos.visualizar}
                  handleClick={(info) => {
                    if (!session.user?.permissoes.kits.editar) return
                    return setEditModal({ isOpen: true, id: info._id })
                  }}
                />
              ))
            : null}
          {kitsStatus == 'error' ? (
            <div className="flex w-full grow items-center justify-center">
              <p className="font-medium text-red-400">Parece que ocorreu um erro no carregamento dos kits. Por favor, tente novamente mais tarde.</p>
            </div>
          ) : null}
        </div>
      </div>
      {newKitModalIsOpen ? <NewKit isOpen={newKitModalIsOpen} session={session} closeModal={() => setNewKitModalIsOpen(false)} /> : null}
      {editModal.isOpen && editModal.id ? (
        <EditKit kitId={editModal.id} session={session} closeModal={() => setEditModal({ isOpen: false, id: null })} />
      ) : null}
      {bulkOperationModalIsOpen ? <KitBulkOperation session={session} closeModal={() => setBulkOperationModalIsOpen(false)} /> : null}
    </div>
  )
}
export default Kits
