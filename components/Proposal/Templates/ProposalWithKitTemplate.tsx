import { formatLocation } from '@/lib/methods/formatting'
import { renderCategoryIcon } from '@/lib/methods/rendering'
import { formatToMoney } from '@/utils/methods'
import { getFractionnementValue, getPaymentMethodFinalValue } from '@/utils/payment'
import { TOpportunityDTOWithClient } from '@/utils/schemas/opportunity.schema'
import { TPartnerSimplifiedDTO } from '@/utils/schemas/partner.schema'
import { TProposal } from '@/utils/schemas/proposal.schema'
import Image from 'next/image'
import React from 'react'
import { AiOutlineSafety } from 'react-icons/ai'
import { BsCircleHalf } from 'react-icons/bs'
import { FaIndustry, FaInstagram, FaPercentage, FaPhone } from 'react-icons/fa'
import { FaLocationDot } from 'react-icons/fa6'
import { ImPower } from 'react-icons/im'
import { MdEmail, MdOutlineMiscellaneousServices, MdPayment } from 'react-icons/md'
import { TbWorld } from 'react-icons/tb'

type ProposalWithKitTemplateProps = {
  proposal: TProposal
  opportunity: TOpportunityDTOWithClient
  partner: TPartnerSimplifiedDTO
}
function ProposalWithKitTemplate({ proposal, opportunity, partner }: ProposalWithKitTemplateProps) {
  return (
    <div className="relative flex h-fit w-full flex-col overflow-hidden bg-white lg:h-[297mm] lg:w-[210mm]">
      <div className="flex h-fit w-full items-center justify-between rounded-bl-md rounded-br-md bg-black p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-white">CLIENTE</p>
            <p className="text-xs font-medium text-white">{opportunity.nome}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-white">CPF/CNPJ</p>
            <p className="text-xs font-medium text-white">{opportunity.cliente.cpfCnpj}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-white">CIDADE</p>
            <p className="text-xs font-medium text-white">{opportunity.localizacao.cidade}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-white">ENDEREÇO</p>
            <p className="text-xs font-medium text-white">{formatLocation({ location: opportunity.localizacao })}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {partner.logo_url ? <Image src={partner.logo_url} width={60} height={60} alt="WHITE LOGO" quality={100} /> : null}
        </div>
      </div>
      <div className="flex w-full grow flex-col">
        <div className="px-2 py-2 text-center text-sm font-medium tracking-normal">{partner.descricao}</div>
        <h1 className="w-full py-2 text-center text-2xl font-black text-cyan-400">NOSSO ORÇAMENTO</h1>
        <h1 className="w-full py-2 text-start text-lg font-black">PRODUTOS DESSA PROPOSTA</h1>
        <div className="flex w-full flex-col gap-1">
          {proposal.produtos.map((product, index) => (
            <div key={index} className="flex w-full flex-col border border-gray-500 p-2">
              <div className="flex w-full flex-col items-start justify-between gap-2">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-black p-1 text-[15px]">
                      {renderCategoryIcon(product.categoria, 18)}
                    </div>
                    <p className="text-sm font-medium leading-none tracking-tight">
                      <strong className="text-[#15599a]">{product.qtde}</strong> x {product.modelo}
                    </p>
                  </div>
                  {/* <h1 className="text-sm font-bold">{formatToMoney(product.valor || 0)}</h1> */}
                </div>

                <div className="flex w-full items-center justify-end gap-2 pl-2">
                  <div className="flex items-center gap-1">
                    <FaIndustry size={12} />
                    <p className="text-[0.6rem] font-light text-gray-500 lg:text-xs">{product.fabricante}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <ImPower size={12} />
                    <p className="text-[0.6rem] font-light text-gray-500 lg:text-xs">{product.potencia} W</p>
                  </div>
                  {product.garantia ? (
                    <div className="flex items-center gap-1">
                      <AiOutlineSafety size={12} />
                      <p className="text-[0.6rem] font-light text-gray-500 lg:text-xs">
                        {product.garantia > 1 ? `${product.garantia} ANOS` : `${product.garantia} ANO`}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
        <h1 className="w-full py-2 text-start text-lg font-black">SERVIÇOS DESSA PROPOSTA</h1>
        <div className="flex w-full flex-col gap-1">
          {proposal.servicos.map((service, index) => (
            <div key={index} className="flex w-full flex-col border border-gray-500 p-2">
              <div className="flex w-full flex-col items-start justify-between gap-2">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-black p-1 text-[15px]">
                      <MdOutlineMiscellaneousServices size={18} />
                    </div>
                    <p className="text-sm font-medium leading-none tracking-tight">{service.descricao}</p>
                  </div>
                  {/* <h1 className="text-sm font-bold">{formatToMoney(service.valor || 0)}</h1> */}
                </div>
                {service.observacoes.trim().length > 0 ? (
                  <p className="w-full text-start text-[0.65rem] text-gray-500">{service.observacoes || '...'}</p>
                ) : null}

                <div className="flex w-full items-center justify-end gap-2 pl-2">
                  {service.garantia ? (
                    <div className="flex items-center gap-1">
                      <AiOutlineSafety size={12} />
                      <p className="text-[0.6rem] font-light text-gray-500 lg:text-xs">
                        {service.garantia > 1 ? `${service.garantia} ANOS` : `${service.garantia} ANO`}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
        <h1 className="w-full py-2 text-start text-lg font-black">FORMAS DE PAGAMENTO DESSA PROPOSTA</h1>
        <div className="flex w-full flex-col gap-1">
          {proposal.pagamento.metodos.map((method, index) => (
            <div key={index} className="flex w-full flex-col border border-gray-500 p-2">
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-black p-1">
                    <MdPayment size={18} />
                  </div>
                  <p className="text-sm font-medium leading-none tracking-tight">{method.descricao}</p>
                </div>
                <div className="flex grow items-center justify-end gap-2">
                  {method.fracionamento.map((fractionnement, itemIndex) => (
                    <div key={itemIndex} className={`flex w-fit min-w-fit items-center gap-1 rounded-md border border-gray-200 p-2 shadow-sm`}>
                      <BsCircleHalf color="#ed174c" />
                      <h1 className="text-[0.55rem] font-medium leading-none tracking-tight">
                        {fractionnement.maximoParcelas} x{' '}
                        <strong>
                          {formatToMoney(getFractionnementValue({ fractionnement, proposalValue: proposal.valor }) / fractionnement.maximoParcelas)}
                        </strong>
                      </h1>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <span className="my-4 px-2 text-center text-[0.47rem] font-medium">
          OBS.: EFETIVAÇÃO DE VÍNCULO COMERCIAL PODE ESTAR SUJEITA A UMA VISITA TÉCNICA IN LOCO E CONFECÇÃO DE UM CONTRATO DE PRESTAÇÃO DE SERVIÇO ENTRE AS
          PARTES.
        </span>
        <div className="flex w-full items-center justify-between gap-1 rounded-bl-md rounded-br-md bg-black p-3">
          <h1 className="text-[0.7rem] font-bold text-white">INVESTIMENTO ESPERADO</h1>
          <div className="flex items-end gap-1">
            <h1 className="text-sm font-black text-white">{formatToMoney(proposal.valor)}</h1>
            <h1 className="text-[0.7rem] font-bold text-white">À VISTA</h1>
          </div>
        </div>
        <div className="mt-2 flex min-h-[100px] w-full items-end justify-between">
          <div className="flex w-1/3 flex-col">
            <div className="mb-1 h-[2px] w-full bg-black"></div>
            <p className="w-full text-center text-[0.7rem] font-bold text-black">{opportunity.cliente.nome.toUpperCase()}</p>
            <p className="w-full text-center text-[0.7rem] font-bold text-black">{opportunity.cliente.cpfCnpj}</p>
          </div>

          <div className="flex w-1/3 flex-col">
            <div className="mb-1 h-[2px] w-full bg-black"></div>
            <p className="w-full text-center text-[0.7rem] font-bold text-black">{partner.nome.toUpperCase()}</p>
            <p className="w-full text-center text-[0.7rem] font-bold text-black">{partner.cpfCnpj}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex w-full flex-col gap-4 bg-black p-4">
        <div className="flex w-full items-center justify-center gap-2">
          <div className="flex items-center gap-1 text-white">
            <FaLocationDot size={20} />
            <p className="text-xs tracking-tight">
              {partner.localizacao.cidade}/{partner.localizacao.uf}, {formatLocation({ location: partner.localizacao })}
            </p>
          </div>
          <div className="flex items-center gap-1 text-white">
            <MdEmail size={20} />
            <p className="text-xs tracking-tight">{partner.contatos.email}</p>
          </div>
        </div>
        <div className="flex w-full items-center justify-around gap-6">
          {partner.midias.website ? (
            <div className="flex items-center gap-1 text-white">
              <TbWorld size={20} />
              <p className="text-xs tracking-tight">{partner.midias.website}</p>
            </div>
          ) : null}

          {partner.midias.instagram ? (
            <div className="flex items-center gap-1 text-white">
              <FaInstagram size={20} />
              <p className="text-xs tracking-tight">{partner.midias.instagram}</p>
            </div>
          ) : null}

          <div className="flex items-center gap-1 text-white">
            <FaPhone size={20} />
            <p className="text-xs tracking-tight">{partner.contatos.telefonePrimario}</p>
          </div>
        </div>
        {partner.slogan ? <h1 className="w-full text-center font-black text-white">{partner.slogan}</h1> : null}
      </div>
    </div>
  )
}

export default ProposalWithKitTemplate
