import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Session } from 'next-auth'

import { ImPower, ImPriceTag } from 'react-icons/im'

import TextInput from '../../Inputs/TextInput'

import ProposalWithKitUFVTemplate from '../Templates/ProposalWithKitUFVTemplate'
import ProposalWithKitTemplate from '../Templates/ProposalWithKitTemplate'
import Services from '../Blocks/Services'
import Products from '../Blocks/Products'

import { useMutationWithFeedback } from '@/utils/mutations/general-hook'
import { createProposal, createProposalPersonalized } from '@/utils/mutations/proposals'
import { TProposal } from '@/utils/schemas/proposal.schema'
import { TOpportunity, TOpportunityDTOWithClient, TOpportunityDTOWithClientAndPartnerAndFunnelReferences } from '@/utils/schemas/opportunity.schema'
import { formatToMoney } from '@/utils/methods'
import LoadingComponent from '@/components/utils/LoadingComponent'
import Link from 'next/link'
import ErrorComponent from '@/components/utils/ErrorComponent'
import PaymentMethods from '../Blocks/PaymentMethods'
import { usePartnerOwnInfo } from '@/utils/queries/partners'
import { TPartnerSimplified, TPartnerSimplifiedDTO } from '@/utils/schemas/partner.schema'
import ProposalWithPlanTemplate from '../Templates/ProposalWithPlanTemplate'
import Kits from '../Blocks/Kits'
import Plans from '../Blocks/Plans'
import ProposalWithProductsTemplate from '../Templates/ProposalWithProductsTemplate'
import ProposalWithServicesTemplate from '../Templates/ProposalWithServicesTemplate'
import { TProjectTypeDTO } from '@/utils/schemas/project-types.schema'
import SelectInput from '@/components/Inputs/SelectInput'
import { handleDownload } from '@/lib/methods/download'
import CheckboxInput from '@/components/Inputs/CheckboxInput'
import toast from 'react-hot-toast'
import AccessGrantingWarning from '../Utils/AccessGrantingWarning'
import TextareaInput from '@/components/Inputs/TextareaInput'

function renderProposalPreview({
  proposal,
  opportunity,
  partner,
}: {
  proposal: TProposal
  opportunity: TOpportunityDTOWithClient
  partner: TPartnerSimplifiedDTO
}) {
  const isSolarSystemSale = opportunity.tipo.titulo == 'SISTEMA FOTOVOLTAICO' && opportunity.categoriaVenda == 'KIT'
  const isGeneralKitSale = opportunity.categoriaVenda == 'KIT' && opportunity.tipo.titulo != 'SISTEMA FOTOVOLTAICO'
  if (proposal.idModeloAnvil)
    return (
      <div className="relative flex h-fit w-full flex-col items-center justify-center overflow-hidden bg-white lg:h-[297mm] lg:w-[210mm]">
        <p className="w-full text-center text-lg font-medium italic tracking-tight text-gray-500">
          Oops, o preview não está disponível para templates específicos.
        </p>
      </div>
    )
  if (opportunity.categoriaVenda == 'KIT' && isSolarSystemSale)
    return <ProposalWithKitUFVTemplate proposal={proposal} opportunity={opportunity} partner={partner} />

  if (opportunity.categoriaVenda == 'KIT' && isGeneralKitSale)
    return <ProposalWithKitTemplate proposal={proposal} opportunity={opportunity} partner={partner} />

  if (opportunity.categoriaVenda == 'PLANO') return <ProposalWithPlanTemplate proposal={proposal} opportunity={opportunity} partner={partner} />
  if (opportunity.categoriaVenda == 'PRODUTOS') return <ProposalWithProductsTemplate proposal={proposal} opportunity={opportunity} partner={partner} />
  if (opportunity.categoriaVenda == 'SERVIÇOS') return <ProposalWithServicesTemplate proposal={proposal} opportunity={opportunity} partner={partner} />
}

type ProposalProps = {
  infoHolder: TProposal
  setInfoHolder: React.Dispatch<React.SetStateAction<TProposal>>
  projectTypes: TProjectTypeDTO[]
  opportunity: TOpportunityDTOWithClientAndPartnerAndFunnelReferences
  moveToNextStage: () => void
  moveToPreviousStage: () => void
  session: Session
  partner: TPartnerSimplifiedDTO
}
function Proposal({ opportunity, projectTypes, infoHolder, setInfoHolder, moveToNextStage, moveToPreviousStage, session, partner }: ProposalProps) {
  const ProposalTemplateOptions = projectTypes.find((t) => t._id == opportunity.tipo.id)?.modelosProposta || null
  const queryClient = useQueryClient()

  const [saveAsActive, setSaveAsActive] = useState<boolean>(true)

  async function handleCreation({
    proposal,
    opportunityWithClient,
    saveAsActive,
    idAnvil,
  }: {
    proposal: TProposal
    opportunityWithClient: TOpportunityDTOWithClient
    saveAsActive: boolean
    idAnvil?: string | null
  }) {
    try {
      if (proposal.nome.trim().length < 3) return toast.error('Preencha um nome de ao menos 3 caractéres para a proposta.')
      const response = await createProposalPersonalized({ proposal, opportunityWithClient, saveAsActive, idAnvil })
      const fileName = proposal.nome
      const fileUrl = response.data?.fileUrl
      if (fileUrl) await handleDownload({ fileName, fileUrl })

      if (typeof response.message != 'string') return 'Proposta criada com sucesso !'
      return response.message as string
    } catch (error) {
      throw error
    }
  }
  const {
    data,
    mutate: handleCreateProposal,
    isPending,
    isSuccess,
    isError,
  } = useMutationWithFeedback({
    mutationKey: ['create-proposal'],
    mutationFn: handleCreation,
    queryClient: queryClient,
    affectedQueryKey: ['opportunity-proposals', opportunity._id],
  })

  return (
    <div className="flex w-full flex-col gap-2">
      <AccessGrantingWarning proposal={infoHolder} opportunity={opportunity} type="alert" projectTypeId={opportunity.tipo.id} />
      {isPending ? (
        <div className="flex min-h-[350px] w-full items-center justify-center">
          <LoadingComponent />
        </div>
      ) : null}
      {isSuccess ? (
        <div className="flex min-h-[350px] w-full flex-col items-center justify-center gap-1">
          <p className="text-center font-bold text-[#15599a]">A proposta foi gerada com sucesso e vinculada ao projeto em questão.</p>
          <p className="text-center text-gray-500">Você pode voltar a acessá-la no futuro através da área de controle desse projeto</p>
          <p className="text-center text-gray-500">Se desejar voltar a área de controle:</p>
          <Link href={`/comercial/oportunidades/id/${opportunity._id}`}>
            <p className="text-sm italic text-blue-300 underline hover:text-blue-500">Clique aqui</p>
          </Link>
          {/* <p className="text-center text-gray-500">
            Para acessar a página da proposta,{' '}
            <Link href={`/comercial/proposta/documento/${data}`}>
              <strong className="text-[#fead41]">clique aqui.</strong>{' '}
            </Link>
          </p> */}
        </div>
      ) : null}
      {isError ? (
        <div className="flex min-h-[350px] w-[400px] items-center justify-center">
          <ErrorComponent msg="Oops, houve um erro na geração da proposta. Verifique sua internet e tente novamente." />
        </div>
      ) : null}
      {!isPending && !isSuccess ? (
        <>
          <div className="mt-4 flex w-full items-center justify-between">
            <button onClick={() => moveToPreviousStage()} className="rounded pl-4 font-bold text-gray-500 duration-300 hover:scale-105">
              Voltar
            </button>
            <button
              onClick={() =>
                // @ts-ignore
                handleCreateProposal({
                  proposal: infoHolder,
                  opportunityWithClient: opportunity,
                  saveAsActive: saveAsActive,
                  idAnvil: infoHolder.idModeloAnvil,
                })
              }
              className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow disabled:bg-gray-500 disabled:text-white enabled:hover:bg-gray-800 enabled:hover:text-white"
            >
              CRIAR PROPOSTA
            </button>
          </div>
          <div className="flex w-full flex-col gap-4 xl:flex-row">
            <div className="hidden flex-col rounded-md border border-gray-200 p-2 md:flex">
              <h1 className="w-full rounded-tl-md rounded-tr-md bg-cyan-500 p-2 text-center font-bold leading-none tracking-tight text-white">
                PREVIEW DA PROPOSTA
              </h1>
              {renderProposalPreview({ proposal: infoHolder, opportunity: opportunity, partner: partner })}
            </div>
            <div className="flex grow flex-col">
              <div className="flex w-full flex-col gap-2">
                <h1 className="w-full rounded bg-[#fead41] p-2 text-center font-bold leading-none tracking-tighter">DADOS GERAIS DA PROPOSTA</h1>
                <div className="flex w-full items-center gap-2 p-3">
                  <div className="flex w-1/2 items-center justify-center gap-2 rounded border border-gray-300 p-1">
                    <ImPower style={{ color: 'rgb(239,68,68)', fontSize: '20px' }} />
                    <p className="text-xs font-light text-gray-600">{infoHolder.potenciaPico} kWp</p>
                  </div>
                  <div className="flex w-1/2 items-center justify-center gap-2 rounded border border-gray-300 p-1">
                    <ImPriceTag style={{ color: 'rgb(34,197,94)', fontSize: '20px' }} />
                    <p className="text-xs font-light text-gray-600">{formatToMoney(infoHolder.valor)}</p>
                  </div>
                </div>
                <TextInput
                  label="NOME DA PROPOSTA"
                  placeholder="Preencha aqui um nome a ser dado a proposta..."
                  value={infoHolder.nome}
                  handleChange={(value) => setInfoHolder((prev) => ({ ...prev, nome: value }))}
                  width="100%"
                />
                <TextareaInput
                  label="DESCRIÇÃO/ANOTAÇÃO"
                  placeholder="Preencha aqui alguma descrição ou anotação sobre a proposta..."
                  value={infoHolder.descricao || ''}
                  handleChange={(value) => setInfoHolder((prev) => ({ ...prev, descricao: value }))}
                />
                {ProposalTemplateOptions ? (
                  <SelectInput
                    label="TEMPLATE DA PROPOSTA"
                    value={infoHolder.idModeloAnvil || null}
                    selectedItemLabel="TEMPLATE PADRÃO"
                    options={ProposalTemplateOptions.map((t, index) => ({ id: index + 1, label: t.titulo, value: t.idAnvil }))}
                    handleChange={(value) => setInfoHolder((prev) => ({ ...prev, idModeloAnvil: value }))}
                    onReset={() => setInfoHolder((prev) => ({ ...prev, idModeloAnvil: undefined }))}
                    width="100%"
                  />
                ) : null}
                <div className="flex w-full items-center justify-center">
                  <div className="w-fit">
                    <CheckboxInput
                      labelFalse="SALVAR COMO PROPOSTA ATIVA"
                      labelTrue="SALVAR COMO PROPOSTA ATIVA"
                      checked={saveAsActive}
                      handleChange={(value) => setSaveAsActive(value)}
                    />
                  </div>
                </div>
                <Kits infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
                <Plans infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
                <Services infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
                <Products infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
                <PaymentMethods infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default Proposal
