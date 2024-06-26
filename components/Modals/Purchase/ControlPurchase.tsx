import { usePurchaseById } from '@/utils/queries/purchases'
import { TPurchaseDTO } from '@/utils/schemas/purchase.schema'
import React, { useEffect, useState } from 'react'
import { VscChromeClose } from 'react-icons/vsc'
import GeneralInformationBlock from './Blocks/GeneralInformationBlock'
import CompositionInformationBlock from './Blocks/CompositionInformationBlock'
import OrderInformationBlock from './Blocks/OrderInformationBlock'
import TransportationInformationBlock from './Blocks/TransportationInformationBlock'
import BillingInformationBlock from './Blocks/BillingInformationBlock'
import DeliveryInformationBlock from './Blocks/DeliveryInformationBlock'
import LoadingComponent from '@/components/utils/LoadingComponent'
import ErrorComponent from '@/components/utils/ErrorComponent'

type ControlPurchaseProps = {
  purchaseId: string
  closeModal: () => void
}
function ControlPurchase({ purchaseId, closeModal }: ControlPurchaseProps) {
  const { data: purchase, isLoading, isError, isSuccess } = usePurchaseById({ id: purchaseId })
  const [infoHolder, setInfoHolder] = useState<TPurchaseDTO>({
    _id: 'id-holder',
    titulo: '',
    status: null,
    idParceiro: '',
    projeto: {
      id: '',
      indexador: 0,
      nome: '',
      tipo: '',
      identificador: '',
    },
    anotacoes: '',
    composicao: [],
    total: 0,
    liberacao: {},
    pedido: {
      fornecedor: {
        nome: '',
        contato: '',
      },
    },
    transporte: {
      transportadora: {
        nome: '',
        contato: '',
      },
    },

    faturamento: {},
    entrega: {
      localizacao: {
        cep: '',
        uf: '',
        cidade: '',
        bairro: '',
        endereco: '',
        numeroOuIdentificador: '',
        complemento: '',
        // distancia: z.number().optional().nullable(),
      },
    },

    dataInsercao: new Date().toISOString(),
  })
  useEffect(() => {
    if (purchase) setInfoHolder(purchase)
  }, [purchase])
  return (
    <div id="control-purchase" className="fixed bottom-0 left-0 right-0 top-0 z-[100] bg-[rgba(0,0,0,.85)]">
      <div className="fixed left-[50%] top-[50%] z-[100] h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-[#fff] p-[10px] lg:w-[70%]">
        <div className="flex h-full flex-col">
          <div className="flex flex-col items-center justify-between border-b border-gray-200 px-2 pb-2 text-lg lg:flex-row">
            <h3 className="text-xl font-bold text-[#353432] dark:text-white ">CONTROLE DE COMPRA</h3>
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
            {isError ? <ErrorComponent msg="Erro ao buscar informações da compra kit." /> : null}
            {isSuccess ? (
              <>
                <GeneralInformationBlock
                  infoHolder={infoHolder as TPurchaseDTO}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TPurchaseDTO>>}
                />
                <CompositionInformationBlock
                  infoHolder={infoHolder as TPurchaseDTO}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TPurchaseDTO>>}
                />
                <OrderInformationBlock
                  infoHolder={infoHolder as TPurchaseDTO}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TPurchaseDTO>>}
                />
                <TransportationInformationBlock
                  infoHolder={infoHolder as TPurchaseDTO}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TPurchaseDTO>>}
                />
                <BillingInformationBlock
                  infoHolder={infoHolder as TPurchaseDTO}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TPurchaseDTO>>}
                />
                <DeliveryInformationBlock
                  infoHolder={infoHolder as TPurchaseDTO}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TPurchaseDTO>>}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ControlPurchase
