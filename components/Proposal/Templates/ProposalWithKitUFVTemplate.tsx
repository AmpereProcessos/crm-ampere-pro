import React from 'react'
import WhiteLogo from '../../utils/images/whiteLogo.png'
import ConfidenceBatch from '../../utils/images/seloConfianca.jpg'
import PeakPowerBatch from '../../utils/images/selo10megas.png'
import Image from 'next/image'
import { TProposal } from '@/utils/schemas/proposal.schema'
import { TOpportunityDTOWithClient } from '@/utils/schemas/opportunity.schema'
import { formatDecimalPlaces, formatLocation, formatProductStr } from '@/lib/methods/formatting'
import { formatToMoney, getEstimatedGen } from '@/utils/methods'
import { getFractionnementValue, getPaymentMethodFinalValue } from '@/utils/payment'
import { getScenariosInfo } from '@/utils/proposal'
import { TPartnerSimplifiedDTO } from '@/utils/schemas/partner.schema'
import { TbWorld } from 'react-icons/tb'
import { FaInstagram, FaPhone } from 'react-icons/fa'
import { FaLocationDot, FaRegIdCard, FaUser } from 'react-icons/fa6'
import { MdEmail, MdPayment } from 'react-icons/md'
import { BsCircleHalf } from 'react-icons/bs'

type ProposalWithKitUFVTemplateProps = {
  proposalDocumentRef: any
  proposal: TProposal
  opportunity: TOpportunityDTOWithClient
  partner: TPartnerSimplifiedDTO
}
function ProposalWithKitUFVTemplate({ proposalDocumentRef, proposal, opportunity, partner }: ProposalWithKitUFVTemplateProps) {
  return (
    <div ref={proposalDocumentRef} className="relative flex h-fit w-full flex-col overflow-hidden bg-white lg:h-[297mm] lg:w-[210mm]">
      <div className="hidden w-full flex-col rounded-bl-md rounded-br-md bg-black p-4 lg:flex">
        <div className="flex w-full items-center justify-between">
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

            <div className="flex items-end gap-1">
              <p className="text-4xl font-bold text-white">{proposal.potenciaPico || 0}</p>
              <p className="mb-1 text-sm font-bold text-white">kWp</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2 rounded-bl-md rounded-br-md bg-black p-4 lg:hidden">
        <div className="flex w-full items-center justify-between">
          {partner.logo_url ? <Image src={partner.logo_url} width={70} height={70} alt="WHITE LOGO" quality={100} /> : null}
          <div className="flex items-end gap-1">
            <p className="text-3xl font-bold text-white">{proposal.potenciaPico || 0}</p>
            <p className="mb-1 text-sm font-bold text-white">kWp</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 self-center">
          <FaUser color="white" />
          <p className="text-xs font-medium text-white">{opportunity.nome}</p>
        </div>
        <div className="flex items-center justify-center gap-2 self-center">
          <FaRegIdCard color="white" />
          <p className="text-xs font-medium text-white">{opportunity.cliente.cpfCnpj}</p>
        </div>
        <div className="flex items-center justify-center gap-2 self-center">
          <FaLocationDot color="white" />
          <p className="text-[0.65rem] font-medium text-white">{formatLocation({ location: opportunity.localizacao, includeCity: true, includeUf: true })}</p>
        </div>
      </div>
      <div className="px-2 py-2 text-center text-[0.6rem] font-medium lg:text-xs">{partner.descricao}</div>
      <div className="flex w-full flex-col">
        <div className="flex w-full items-center gap-1 rounded-bl-md rounded-br-md bg-black p-3">
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-white">CONSUMO MÉDIO (kWh/mês)</h1>
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-white">GASTO MENSAL ATUAL</h1>
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-white">GASTO ANUAL ATUAL</h1>
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-white">GASTO EM 25 ANOS</h1>
        </div>
        <div className="flex w-full items-center gap-1 p-1">
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-black">{getScenariosInfo({ proposal, opportunity }).averageEnergyConsumption} kWh</h1>
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-red-500">
            {formatToMoney(getScenariosInfo({ proposal, opportunity }).monthlyEnergyExpense)}
          </h1>
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-red-500">
            {formatToMoney(getScenariosInfo({ proposal, opportunity }).annualEnergyExpense)}
          </h1>
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-red-500">
            {formatToMoney(getScenariosInfo({ proposal, opportunity }).twentyFiveYearsEnergyExpense)}
          </h1>
        </div>
      </div>
      <div className="mt-2 flex w-full flex-col">
        <div className="flex w-full items-center gap-1 rounded-bl-md rounded-br-md bg-black p-3">
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-white">GERAÇÃO ESTIMADA (kWh/mês)</h1>
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-white">ECONOMIA ESTIMADA MENSAL</h1>
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-white">ECONOMIA ESTIMADA ANUAL</h1>
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-white">ECONOMIA ESTIMADA 25 ANOS</h1>
        </div>
        <div className="flex w-full items-center gap-1 p-1">
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-black">
            {formatDecimalPlaces(getScenariosInfo({ proposal, opportunity }).estimatedGeneration)}
            kWh
          </h1>
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-green-500">
            {formatToMoney(getScenariosInfo({ proposal, opportunity }).monthlySavedValue)}
          </h1>
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-green-500">
            {formatToMoney(getScenariosInfo({ proposal, opportunity }).annualSavedValue)}
          </h1>
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-green-500">
            {formatToMoney(getScenariosInfo({ proposal, opportunity }).twentyFiveYearsSavedValue)}
          </h1>
        </div>
      </div>
      <div className="mt-2 flex w-full flex-col gap-1">
        <div className="flex w-full items-center gap-1 rounded-bl-md rounded-br-md bg-black p-3">
          <h1 className="w-3/4 text-center text-[0.7rem] font-bold text-white">PRODUTOS</h1>
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-white">GARANTIAS</h1>
        </div>
        {proposal.produtos.map((product) => (
          <div className="flex w-full items-center gap-1">
            <h1 className="w-3/4 text-center text-[0.7rem] font-bold text-black">{formatProductStr(product)}</h1>
            <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-black">{product.garantia} ANOS</h1>
          </div>
        ))}
      </div>
      <div className="mt-2 flex w-full flex-col gap-1">
        <div className="flex w-full items-center gap-1 rounded-bl-md rounded-br-md bg-cyan-500 p-3">
          <h1 className="w-3/4 text-center text-[0.7rem] font-bold text-white">SERVIÇOS</h1>
          <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-white">GARANTIAS</h1>
        </div>
        {proposal.servicos.map((service) => (
          <div className="flex w-full items-center gap-1">
            <h1 className="w-3/4 text-center text-[0.7rem] font-bold text-black">{service.descricao}</h1>
            <h1 className="w-1/4 text-center text-[0.7rem] font-bold text-black">
              {service.garantia > 1 ? `${service.garantia} ANOS` : `${service.garantia} ANO`}
            </h1>
          </div>
        ))}
      </div>
      <div className="mt-2 flex w-full flex-col gap-1">
        <div className="flex w-full items-center gap-1 rounded-bl-md rounded-br-md bg-black p-3">
          <h1 className="w-full text-center text-[0.7rem] font-bold text-white">FORMAS DE PAGAMENTO</h1>
        </div>
        <div className="flex w-full flex-col gap-1">
          {proposal.pagamento.metodos.map((method, index) => (
            <div key={index} className="flex w-full flex-col border border-gray-500 p-2">
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-black p-1">
                    <MdPayment size={18} />
                  </div>
                  <p className="text-[0.7rem] font-bold leading-none tracking-tight">{method.descricao}</p>
                </div>
                <div className="flex grow items-center justify-end gap-2">
                  {method.fracionamento.map((fractionnement, itemIndex) => (
                    <div key={itemIndex} className={`flex w-fit min-w-fit items-center gap-1 rounded-md border border-gray-200 p-2 shadow-sm`}>
                      <BsCircleHalf color="#ed174c" />
                      <h1 className="text-[0.55rem] font-medium leading-none tracking-tight">
                        {fractionnement.parcelas || fractionnement.maximoParcelas} x{' '}
                        <strong>
                          {formatToMoney(
                            getFractionnementValue({ fractionnement, proposalValue: proposal.valor }) /
                              (fractionnement.parcelas || fractionnement.maximoParcelas)
                          )}
                        </strong>
                      </h1>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="mt-2 px-2 text-center text-[0.47rem] font-medium">
        OBS.: EFETIVAÇÃO DE VÍNCULO COMERCIAL PODE ESTAR SUJEITA A UMA VISITA TÉCNICA IN LOCO E CONFECÇÃO DE UM CONTRATO DE PRESTAÇÃO DE SERVIÇO ENTRE AS
        PARTES.
      </span>
      <span className="px-2 text-center text-[0.47rem] font-medium">
        A GERAÇÃO PREVISTA DE ENERGIA MENSAL PODE VARIAR DE ACORDO COM CONDIÇÕES CLIMÁTICAS E TÉCNICAS DO LOCAL DE INSTALAÇÃO DO PROJETO; OS VALORES AQUI
        PROPOSTOS SÃO APENAS UMA PREVISÃO DE GERAÇÃO DE ACORDO COM FATORES GENÉRICOS DA REGIÃO CONSIDERADA
      </span>
      <span className="mb-2 px-2 text-center text-[0.47rem] font-medium">
        ESTA PROPOSTA É VÁLIDA POR 5 DIAS OU ATÉ DURAR OS ESTOQUES, CONTADOS A PARTIR DA EMISSÃO DA PROPOSTA, SEM AVISO PRÉVIO.
      </span>
      <div className="flex w-full items-center justify-between gap-1 rounded-bl-md rounded-br-md bg-cyan-500 p-3">
        <h1 className="text-[0.7rem] font-bold text-black">INVESTIMENTO</h1>
        <h1 className="whitespace-nowrap text-sm font-black text-black">{formatToMoney(proposal.valor)} À VISTA</h1>
      </div>
      <div className="mt-2 flex min-h-[100px] w-full items-end justify-between">
        <div className="flex w-[40%] flex-col lg:w-1/3">
          <div className="mb-1 h-[2px] w-full bg-black"></div>
          <p className="w-full text-center text-[0.7rem] font-bold text-black">{opportunity.cliente.nome.toUpperCase()}</p>
          <p className="w-full text-center text-[0.7rem] font-bold text-black">{opportunity.cliente.cpfCnpj || 'N/A'}</p>
        </div>
        <div className="flex w-[40%] flex-col lg:w-1/3">
          <div className="mb-1 h-[2px] w-full bg-black"></div>
          <p className="w-full text-center text-[0.7rem] font-bold text-black">{partner.nome.toUpperCase()}</p>
          <p className="w-full text-center text-[0.7rem] font-bold text-black">{partner.cpfCnpj || 'N/A'}</p>
        </div>
      </div>
      <div className="mt-4 flex w-full flex-col gap-4 bg-black p-4">
        <div className="flex w-full flex-wrap items-center justify-center gap-2">
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
        <div className="flex w-full flex-wrap items-center justify-around gap-6 gap-y-2">
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
        {partner.slogan ? <h1 className="w-full whitespace-nowrap text-center font-black text-white">{partner.slogan}</h1> : null}
      </div>
    </div>
  )
}

export default ProposalWithKitUFVTemplate
