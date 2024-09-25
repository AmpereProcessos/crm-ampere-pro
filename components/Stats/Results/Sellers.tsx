import Avatar from '@/components/utils/Avatar'
import LoadingComponent from '@/components/utils/LoadingComponent'
import { useSalePromotersResults } from '@/utils/queries/stats/sellers'
import React from 'react'
import { BsFillGearFill } from 'react-icons/bs'
import { ImPower } from 'react-icons/im'

type SellersProps = {
  after: string
  before: string
}
function Sellers({ after, before }: SellersProps) {
  const { data, isSuccess } = useSalePromotersResults({ after, before })
  console.log(data)
  return (
    <div className="flex w-full flex-col">
      <h1 className="mt-4 rounded-md bg-black text-center text-xl font-black text-white">CONTROLE DE EQUIPE</h1>
      <div className="mt-2 flex grow flex-col flex-wrap justify-around gap-2 py-2 lg:flex-row">
        {isSuccess ? (
          data.map((responsible, index) => (
            <div
              key={index}
              className="relative flex min-h-[100px] w-full flex-col items-center gap-4 rounded-sm border border-gray-300 bg-[#fff] p-6 shadow-md lg:w-[650px]"
            >
              <div className="absolute right-5 top-4 flex cursor-pointer items-center justify-center rounded-full border border-black p-2 duration-300 ease-in-out hover:bg-black hover:text-white">
                <BsFillGearFill />
              </div>
              <div className="flex w-full items-center justify-center gap-2">
                <Avatar fallback="U" height={45} width={45} url={responsible.avatar_url || undefined} />
                <div className="flex flex-col gap-1">
                  <h1 className="font-bold leading-none tracking-tight">{responsible.nome}</h1>
                  {/* <p className="leading-none tracking-tight text-gray-500">{responsible.telefone}</p> */}
                </div>
              </div>
              <h1 className="font-bold leading-none tracking-tight">METAS</h1>
              {/* <div className="flex w-full flex-col gap-1">
                <div className="mt-2 flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <ImPower />
                      <p className="text-xs leading-none tracking-tight text-gray-500">POTÊNCIA PICO</p>
                    </div>
                    <p className="text-xs font-bold">{getSaleGoals(responsible)?.potenciaVendida || '-'}W</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <MdSell />
                      <p className="text-xs leading-none tracking-tight text-gray-500">PROJETOS VENDIDOS</p>
                    </div>
                    <p className="text-xs font-bold">{getSaleGoals(responsible)?.projetosVendidos || '-'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <MdAttachMoney />
                      <p className="text-xs leading-none tracking-tight text-gray-500">VALOR VENDIDO</p>
                    </div>
                    <p className="text-xs font-bold">{getSaleGoals(responsible)?.valorVendido || '-'}</p>
                  </div>
                </div>
                <div className="mt-1 flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <FaPercentage />
                      <p className="text-xs leading-none tracking-tight text-gray-500">CONVERSÃO</p>
                    </div>
                    <p className="text-xs font-bold">{getSaleGoals(responsible)?.conversao || '-'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <MdCreate />
                      <p className="text-xs leading-none tracking-tight text-gray-500">PROJETOS CRIADOS</p>
                    </div>
                    <p className="text-xs font-bold">{getSaleGoals(responsible)?.projetosCriados || '-'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <GrSend />
                      <p className="text-xs leading-none tracking-tight text-gray-500">PROJETOS ENVIADOS</p>
                    </div>
                    <p className="text-xs font-bold">{getSaleGoals(responsible)?.projetosEnviados || '-'}</p>
                  </div>
                </div>
              </div> */}
            </div>
          ))
        ) : (
          <LoadingComponent />
        )}
      </div>
    </div>
  )
}

export default Sellers
