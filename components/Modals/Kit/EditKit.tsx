import React, { Dispatch, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Session } from 'next-auth'

import { VscChromeClose } from 'react-icons/vsc'

import { TInverter, TKit, TKitDTO, TModule, TProductItem, TServiceItem } from '@/utils/schemas/kits.schema'

import { usePricingMethods } from '@/utils/queries/pricing-methods'
import { useMutationWithFeedback } from '@/utils/mutations/general-hook'
import { updateKit } from '@/utils/mutations/kits'
import { getModulesPeakPotByProducts } from '@/lib/methods/extracting'

import { useKitById } from '@/utils/queries/kits'
import LoadingComponent from '@/components/utils/LoadingComponent'
import ErrorComponent from '@/components/utils/ErrorComponent'

import { TNewKit } from './NewKit'
import GeneralInformationBlock from '@/components/Kits/GeneralInformationBlock'
import ProductCompositionBlock from '@/components/Kits/ProductCompositionBlock'
import ServicesCompositionBlock from '@/components/Kits/ServicesCompositionBlock'

type ModalNewKitProps = {
  session: Session
  kitId: string
  closeModal: () => void
}
function ModalNewKit({ session, kitId, closeModal }: ModalNewKitProps) {
  const queryClient = useQueryClient()
  const { data: pricingMethods } = usePricingMethods()

  const { data: kit, isLoading, isSuccess, isError } = useKitById({ id: kitId })
  const [infoHolder, setInfoHolder] = useState<TKitDTO>({
    _id: kitId,
    nome: '',
    idParceiro: session.user.idParceiro || '',
    idMetodologiaPrecificacao: '',
    ativo: true,
    topologia: 'MICRO-INVERSOR',
    potenciaPico: 0,
    preco: 0,
    estruturasCompativeis: [],
    produtos: [],
    servicos: [],
    autor: {
      id: session.user.id,
      nome: session.user.nome,
      avatar_url: session.user.avatar_url,
    },
    dataInsercao: new Date().toISOString(),
  })
  const { mutate: handleEditKit } = useMutationWithFeedback({
    mutationKey: ['edit-kit'],
    mutationFn: updateKit,
    queryClient: queryClient,
    affectedQueryKey: ['kit-by-id', kitId],
    callbackFn: async () => await queryClient.invalidateQueries({ queryKey: ['kits'] }),
  })

  useEffect(() => {
    if (kit) setInfoHolder(kit)
  }, [kit])
  return (
    <div id="defaultModal" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
      <div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[70%]">
        <div className="flex h-full flex-col">
          <div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
            <h3 className="text-xl font-bold text-[#353432] dark:text-white ">EDITAR KIT</h3>
            <button
              onClick={() => closeModal()}
              type="button"
              className="flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200"
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          <div className="flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
            {isLoading ? <LoadingComponent /> : null}
            {isError ? <ErrorComponent msg="Erro ao buscar informações do kit." /> : null}
            {isSuccess ? (
              <>
                <GeneralInformationBlock
                  infoHolder={infoHolder}
                  setInfoHolder={setInfoHolder as Dispatch<React.SetStateAction<TKit>>}
                  pricingMethods={pricingMethods || []}
                />
                <ProductCompositionBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder as Dispatch<React.SetStateAction<TKit>>} />
                <ServicesCompositionBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder as Dispatch<React.SetStateAction<TKit>>} />
                <div className="flex w-full items-center justify-end p-2">
                  <button
                    onClick={() => {
                      const peakPower = getModulesPeakPotByProducts(infoHolder.produtos)
                      // @ts-ignore
                      handleEditKit({ id: kitId, info: { ...infoHolder, potenciaPico: peakPower } })
                    }}
                    className="h-9 whitespace-nowrap rounded bg-blue-800 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-blue-800 enabled:hover:text-white"
                  >
                    ATUALIZAR KIT
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalNewKit
