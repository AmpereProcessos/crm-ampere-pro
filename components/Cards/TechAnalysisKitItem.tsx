import React from 'react'
import { AiOutlineSafety, AiOutlineShoppingCart } from 'react-icons/ai'
import { FaCalendarPlus, FaIndustry, FaSolarPanel, FaTruck } from 'react-icons/fa'
import { ImPower, ImPriceTag } from 'react-icons/im'
import { MdAttachMoney, MdDelete, MdOutlineMiscellaneousServices } from 'react-icons/md'
import { TbTopologyFull, TbTopologyFullHierarchy } from 'react-icons/tb'

import { TKit, TKitDTO, TProductItem } from '@/utils/schemas/kits.schema'
import { formatToMoney } from '@/utils/methods'
import { BsCart } from 'react-icons/bs'

import dayjs from 'dayjs'
import { ProductItemCategories } from '@/utils/select-options'
import { renderIcon } from '@/lib/methods/rendering'

function renderCategoryIcon(category: TProductItem['categoria']) {
  const CategoryInfo = ProductItemCategories.find((productCategory) => productCategory.value == category)
  if (!CategoryInfo) return <BsCart />
  return renderIcon(CategoryInfo.icon)
}

type KitCardProps = {
  kit: TKitDTO
  selectedId: string | null
  userHasPricingViewPermission: boolean
  handleClick: (info: TKitDTO) => void
}
function TechnicalAnalysisKit({ kit, selectedId, userHasPricingViewPermission, handleClick }: KitCardProps) {
  return (
    <div className="flex min-h-[250px] w-full gap-2 rounded-md border border-gray-300 bg-[#fff] font-Inter shadow-sm">
      <div className="flex w-full grow flex-col p-3">
        <div className="flex w-full items-center justify-between gap-2">
          <h1 className="font-Inter font-bold leading-none tracking-tight">{kit.nome}</h1>
          {selectedId == kit._id ? (
            <button className="rounded-full bg-green-500 px-2 py-1 text-xs font-bold text-white">SELECIONADO</button>
          ) : (
            <button onClick={() => handleClick(kit)} className="rounded-full bg-cyan-500 px-2 py-1 text-xs font-bold text-white">
              SELECIONAR KIT
            </button>
          )}
        </div>

        <div className="flex w-full grow flex-col">
          <div className="mt-2 flex w-full items-center gap-2">
            {userHasPricingViewPermission ? (
              <div className="flex items-center gap-1 text-green-500">
                <MdAttachMoney />
                <p className="text-[0.6rem] font-bold lg:text-xs">{formatToMoney(kit.preco)}</p>
              </div>
            ) : null}
            <div className="flex items-center gap-1 text-red-500">
              <ImPower color="rgb(239,68,68)" />
              <p className="text-[0.6rem] font-bold lg:text-xs">{kit.potenciaPico} kW</p>
            </div>
            <div className="flex items-center gap-1">
              <TbTopologyFull />
              <p className="text-[0.6rem] font-light lg:text-xs">{kit.topologia}</p>
            </div>
          </div>
          <h1 className="my-2 mb-0 text-[0.65rem] font-bold leading-none tracking-tight text-gray-500 lg:text-xs">PRODUTOS</h1>
          <div className="flex w-full flex-col flex-wrap gap-2 lg:flex-row">
            {kit.produtos.map((product, index) => (
              <div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-200 p-2 lg:w-[400px]">
                <div className="flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center">
                  <div className="flex items-center gap-1">
                    <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full border border-black p-1 text-[15px]">
                      {renderCategoryIcon(product.categoria)}
                    </div>
                    <p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">
                      <strong className="text-[#FF9B50]">{product.qtde}</strong> x {product.modelo}
                    </p>
                  </div>
                  <div className="flex w-full grow items-center justify-end gap-2 pl-2 lg:w-fit">
                    <div className="flex items-center gap-1">
                      <FaIndustry size={12} />
                      <p className="text-[0.6rem] font-light text-gray-500">{product.fabricante}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <ImPower size={12} />
                      <p className="text-[0.6rem] font-light text-gray-500">{product.potencia} W</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <AiOutlineSafety size={12} />
                      <p className="text-[0.6rem] font-light text-gray-500">{product.garantia} ANOS</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <h1 className="my-2 mb-0 text-xs font-bold leading-none tracking-tight text-gray-500 lg:text-xs">SERVIÇOS</h1>
          <div className="flex w-full flex-col flex-wrap gap-2 lg:flex-row">
            {kit.servicos.map((service, index) => (
              <div key={index} className="mt-1 flex flex-col rounded-md border border-gray-200 p-2">
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex  items-center gap-1">
                    <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full border border-black p-1">
                      <MdOutlineMiscellaneousServices />
                    </div>
                    <p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">{service.descricao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnicalAnalysisKit
