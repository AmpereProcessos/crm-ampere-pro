import { formatDateAsLocale, formatToMoney } from '@/lib/methods/formatting'
import { TServiceDTO } from '@/utils/schemas/service.schema'
import React from 'react'
import { AiOutlineSafety } from 'react-icons/ai'
import { BsCalendarPlus } from 'react-icons/bs'
import { MdAttachMoney, MdOutlineMiscellaneousServices } from 'react-icons/md'
import Avatar from '../utils/Avatar'

function getStatusTag({ active }: { active: boolean }) {
  if (!active) return <h1 className="rounded-full bg-gray-600 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">INATIVO</h1>

  return <h1 className="rounded-full bg-blue-600 px-2 py-1 text-[0.65rem] font-bold text-white lg:text-xs">ATIVO</h1>
}

type ServiceCardProps = {
  service: TServiceDTO
  handleClick: (id: string) => void
  userHasEditPermission: boolean
  userHasPricingViewPermission: boolean
}
function Service({ service, handleClick, userHasEditPermission, userHasPricingViewPermission }: ServiceCardProps) {
  return (
    <div key={service._id} className="flex w-full gap-2 rounded-md border border-gray-500 bg-[#fff] font-Inter shadow-sm lg:w-[450px]">
      <div className="flex grow flex-col p-4">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
              <MdOutlineMiscellaneousServices />
            </div>
            {userHasEditPermission ? (
              <p
                onClick={() => handleClick(service._id)}
                className="cursor-pointer text-sm font-black leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500"
              >
                {service.descricao}
              </p>
            ) : (
              <p className="text-sm font-black leading-none tracking-tight">{service.descricao}</p>
            )}
          </div>
          {getStatusTag({ active: service.ativo })}
        </div>
        <div className="mt-2 flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-green-500">
            {userHasPricingViewPermission ? (
              <>
                <MdAttachMoney size={12} />
                <p className="text-[0.65rem] font-bold lg:text-xs">{formatToMoney(service.preco || 0)}</p>
              </>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            <AiOutlineSafety size={12} />
            <p className="text-[0.65rem] font-bold lg:text-xs">{service.garantia} ANOS</p>
          </div>
        </div>
        <div className="mt-2 flex w-full items-center justify-end gap-2">
          <div className={`flex items-center gap-2`}>
            <div className="ites-center flex gap-1">
              <BsCalendarPlus />
              <p className={`text-[0.65rem] font-medium text-gray-500`}>{formatDateAsLocale(service.dataInsercao, true)}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Avatar fallback={'U'} height={20} width={20} url={service.autor?.avatar_url || undefined} />
            <p className="text-[0.65rem] font-medium text-gray-500">{service.autor?.nome}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Service
