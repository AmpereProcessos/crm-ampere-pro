import React from 'react'
import { AiOutlineSafety } from 'react-icons/ai'
import { FaIndustry, FaSolarPanel, FaTag } from 'react-icons/fa'
import { ImPower } from 'react-icons/im'
import { MdAttachMoney, MdOutlineMiscellaneousServices } from 'react-icons/md'
import { TbTopologyFull } from 'react-icons/tb'

import { TKit, TKitDTO, TProductItem } from '@/utils/schemas/kits.schema'
import { formatToMoney } from '@/utils/methods'
import { BsCalendarEvent, BsCalendarPlus, BsCart } from 'react-icons/bs'
import { formatDateAsLocale } from '@/lib/methods/formatting'
import Avatar from '../utils/Avatar'
import dayjs from 'dayjs'
import { ProductItemCategories } from '@/utils/select-options'
import { renderIcon } from '@/lib/methods/rendering'

function renderCategoryIcon(category: TProductItem['categoria']) {
  const CategoryInfo = ProductItemCategories.find((productCategory) => productCategory.value == category)
  if (!CategoryInfo) return <BsCart />
  return renderIcon(CategoryInfo.icon)
}
function getStatusTag({ active, expiryDate }: { active: boolean; expiryDate?: string | null }) {
  if (!active) return <h1 className="rounded-full bg-gray-600 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">INATIVO</h1>
  if (expiryDate && dayjs(expiryDate).isBefore(new Date()))
    return <h1 className="rounded-full bg-orange-600 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">VENCIDO</h1>
  return <h1 className="rounded-full bg-blue-600 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">ATIVO</h1>
}
type KitCardProps = {
  kit: TKitDTO
  handleClick: (info: TKitDTO) => void
  userHasEditPermission: boolean
  userHasPricingViewPermission: boolean
}
function Kit({ kit, handleClick, userHasEditPermission, userHasPricingViewPermission }: KitCardProps) {
  return (
    <div className="flex min-h-[250px] w-full gap-2 rounded-md border border-gray-500 bg-[#fff] font-Inter shadow-sm lg:w-[600px]">
      {/* <div className={`h-full w-[6px]  ${getBarColor({ active: kit.ativo, expiryDate: kit.dataValidade })} rounded-bl-md rounded-tl-md`}></div> */}
      <div className="flex grow flex-col p-4">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <div className="flex h-[25px] min-h-[25px] w-[25px] min-w-[25px] items-center justify-center rounded-full border border-black p-1">
              <FaTag size={12} />
            </div>
            {userHasEditPermission ? (
              <h1
                onClick={() => handleClick(kit)}
                className="cursor-pointer text-sm font-black leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500"
              >
                {kit.nome}
              </h1>
            ) : (
              <h1 className="text-sm font-black leading-none tracking-tight">{kit.nome}</h1>
            )}
          </div>
          {getStatusTag({ active: kit.ativo, expiryDate: kit.dataValidade })}
        </div>

        <div className="flex w-full grow flex-col">
          <div className="mt-2 flex w-full items-center gap-2">
            {userHasPricingViewPermission ? (
              <div className="flex items-center gap-1 text-green-500">
                <MdAttachMoney />
                <p className="text-[0.65rem] font-bold lg:text-xs">{formatToMoney(kit.preco)}</p>
              </div>
            ) : null}

            <div className="flex items-center gap-1 text-red-500">
              <ImPower color="rgb(239,68,68)" />
              <p className="text-[0.65rem] font-bold lg:text-xs">{kit.potenciaPico} kW</p>
            </div>
            <div className="flex items-center gap-1">
              <TbTopologyFull />
              <p className="text-[0.65rem] font-light lg:text-xs">{kit.topologia}</p>
            </div>
          </div>
          <h1 className="my-2 mb-0 text-[0.65rem] font-bold leading-none tracking-tight text-gray-500 lg:text-xs">PRODUTOS</h1>
          {kit.produtos.map((product, index) => (
            <div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-200 p-2">
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
            // <ProductItem product={module} index={index} removeProductFromKit={(index) => console.log()} showRemoveButton={false} />
          ))}
          <h1 className="my-2 mb-0 text-[0.65rem] font-bold leading-none tracking-tight text-gray-500 lg:text-xs">SERVIÇOS</h1>
          <div className="flex w-full flex-wrap items-center gap-2">
            {kit.servicos.map((service, index) => (
              <div key={index} className="mt-1 flex flex-col gap-1 rounded-md border border-gray-200 p-2">
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full border border-black p-1">
                      <MdOutlineMiscellaneousServices />
                    </div>
                    <p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">{service.descricao}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-end gap-1">
                  <AiOutlineSafety size={12} />
                  <p className="text-[0.6rem] font-light text-gray-500">{service.garantia > 1 ? `${service.garantia} ANOS` : `${service.garantia} ANO`} </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {kit.dataValidade ? (
              <div className={`flex items-center gap-2 text-gray-500`}>
                <BsCalendarEvent />
                <p className="text-[0.65rem] font-medium text-gray-500">
                  Valido até: <strong className="text-orange-500">{formatDateAsLocale(kit.dataValidade)}</strong>{' '}
                </p>
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1`}>
              <BsCalendarPlus />
              <p className="text-[0.65rem] font-medium text-gray-500">{formatDateAsLocale(kit.dataInsercao, true)}</p>
            </div>
            <div className="flex items-center gap-1">
              <Avatar fallback={'R'} url={kit.autor.avatar_url || undefined} height={20} width={20} />
              <p className="text-[0.65rem] font-medium text-gray-500">{kit.autor.nome}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Kit
