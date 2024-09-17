import GeneralInformationBlock from '@/components/Products/GeneralInformationBlock'
import ValuesInformationBlock from '@/components/Products/ValuesInformationBlock'
import ErrorComponent from '@/components/utils/ErrorComponent'
import LoadingComponent from '@/components/utils/LoadingComponent'
import { useMutationWithFeedback } from '@/utils/mutations/general-hook'
import { createProduct, editProduct } from '@/utils/mutations/products'
import { useComercialProductById } from '@/utils/queries/products'
import { TProduct, TProductDTO } from '@/utils/schemas/products.schema'
import { useQueryClient } from '@tanstack/react-query'
import { Session } from 'next-auth'
import React, { useEffect, useState } from 'react'
import { VscChromeClose } from 'react-icons/vsc'

type EditProductProps = {
  productId: string
  session: Session
  closeModal: () => void
}
function EditProduct({ productId, session, closeModal }: EditProductProps) {
  const queryClient = useQueryClient()
  const { data: product, isLoading, isError, isSuccess } = useComercialProductById({ id: productId })
  const [infoHolder, setInfoHolder] = useState<TProductDTO>({
    _id: 'id-holder',
    idParceiro: session.user.idParceiro || '',
    idMetodologiaPrecificacao: '661400485ce24a96d0c62c30',
    idsMetodologiasPagamento: ['661ec619e03128a48f94b4db'],
    ativo: true,
    categoria: 'MÓDULO',
    fabricante: '',
    modelo: '',
    potencia: null,
    garantia: 0,
    preco: null,
    autor: {
      id: session.user.id,
      nome: session.user.nome,
      avatar_url: session.user.avatar_url,
    },
    dataInsercao: new Date().toISOString(),
  })

  const { mutate: handleEditProduct, isPending } = useMutationWithFeedback({
    mutationKey: ['edit-product', productId],
    mutationFn: editProduct,
    queryClient: queryClient,
    affectedQueryKey: ['product-by-id', productId],
    callbackFn: async () => await queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  useEffect(() => {
    if (product) setInfoHolder(product)
  }, [product])
  return (
    <div id="edit-product" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
      <div className="fixed left-[50%] top-[50%] z-[100] h-[60%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[60%]">
        <div className="flex h-full flex-col">
          <div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
            <h3 className="text-xl font-bold text-[#353432] dark:text-white ">EDITAR PRODUTO</h3>
            <button
              onClick={() => closeModal()}
              type="button"
              className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent msg="Oops, houve um erro ao buscar produto." /> : null}
          {isSuccess ? (
            <>
              <div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
                <div className="my-5 flex flex-col">
                  <p className="w-full text-center text-gray-500">Atualize aqui o seu produto pra ser utilizado na composição de suas propostas comerciais.</p>
                </div>
                <GeneralInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProduct>>} />
                <ValuesInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TProduct>>} />
              </div>
              <div className="mt-1 flex w-full items-end justify-end">
                <button
                  disabled={isPending}
                  //@ts-ignore
                  onClick={() => handleEditProduct({ id: productId, changes: infoHolder })}
                  className="h-9 whitespace-nowrap rounded bg-blue-800 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-blue-800 enabled:hover:text-white"
                >
                  ATUALIZAR PRODUTO
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default EditProduct
