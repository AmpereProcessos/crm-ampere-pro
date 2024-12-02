import React, { useState } from 'react'
import { Session } from 'next-auth'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'

import { RxDashboard } from 'react-icons/rx'
import { TbDownload } from 'react-icons/tb'
import { FaExternalLinkAlt, FaIndustry, FaUser } from 'react-icons/fa'
import { AiFillEdit, AiFillStar, AiOutlineSafety } from 'react-icons/ai'
import { MdContentCopy, MdOutlineMiscellaneousServices } from 'react-icons/md'
import { ImPower } from 'react-icons/im'

import { useProposalById } from '@/utils/queries/proposals'

import Avatar from '../utils/Avatar'
import { Sidebar } from '../Sidebar'
import WinBlock from './WinBlock'
import LoadingComponent from '../utils/LoadingComponent'
import ErrorComponent from '../utils/ErrorComponent'
import ProposalViewPricingBlock from './Blocks/ProposalViewPricingBlock'
import ProposalViewPlansBlock from './Blocks/ProposalViewPlansBlock'
import NewProjectRequest from '../ProjectRequest/NewProjectRequest'
import NewContractRequest from '../Modals/ContractRequest/NewContractRequest'
import EditProposal from '../Modals/Proposal/EditProposal'

import ProposalUpdateRecords from './ProposalUpdateRecords'

import { formatDecimalPlaces, formatNameAsInitials } from '@/lib/methods/formatting'

import { formatToMoney, getEstimatedGen } from '@/utils/methods'

import { renderCategoryIcon } from '@/lib/methods/rendering'
import { usePricingMethods } from '@/utils/queries/pricing-methods'
import { TPricingMethodDTO } from '@/utils/schemas/pricing-method.schema'
import { useMutationWithFeedback } from '@/utils/mutations/general-hook'
import { setOpportunityActiveProposal, updateWinningProposal } from '@/utils/mutations/opportunities'

import { copyToClipboard } from '@/lib/hooks'
import { handleDownload } from '@/lib/methods/download'
import EditProposalFile from '../Modals/Proposal/EditFile'
import toast from 'react-hot-toast'
import { formatProposalPremissesLabel, formatProposalPremissesValue } from '@/utils/proposal'
import { TProposalPremisses } from '@/utils/schemas/proposal.schema'
import { FaTrophy } from 'react-icons/fa6'

function getPricingMethodById({ methods, id }: { methods?: TPricingMethodDTO[]; id: string }) {
  if (!methods) return 'NÃO DEFINIDO'
  const method = methods.find((m) => m._id == id)
  if (!method) return 'NÃO DEFINIDO'
  return method.nome
}
type ProposalPageProps = {
  proposalId: string
  session: Session
}
function ProposalPage({ proposalId, session }: ProposalPageProps) {
  const queryClient = useQueryClient()
  const [editProposalModalIsOpen, setEditProposalModalIsOpen] = useState<boolean>(false)
  const [editProposalFileModalIsOpen, setEditProposalFileModalIsOpen] = useState<boolean>(false)
  const [newContractRequestIsOpen, setNewContractRequestIsOpen] = useState<boolean>(false)
  const [testRequestIsOpen, setTestRequestIsOpen] = useState<boolean>(false)
  const { data: proposal, isLoading: proposalLoading, isError: proposalError, isSuccess: proposalSuccess } = useProposalById({ id: proposalId })
  const { data: pricingMethods } = usePricingMethods()

  const userHasPricingViewPermission = session?.user.permissoes.precos.visualizar
  const userHasPricingEditPermission = session?.user.permissoes.precos.editar

  const {
    mutate: handleSetActiveProposal,
    isPending,
    isError,
    isSuccess,
  } = useMutationWithFeedback({
    mutationKey: ['set-active-proposal', proposalId],
    mutationFn: setOpportunityActiveProposal,
    queryClient: queryClient,
    affectedQueryKey: ['proposal-by-id', proposalId],
  })
  const { mutate: handleUpdateWinningProposal, isPending: isUpdatingWinningProposal } = useMutationWithFeedback({
    mutationKey: ['update-winning-proposal', proposalId],
    mutationFn: updateWinningProposal,
    queryClient: queryClient,
    affectedQueryKey: ['proposal-by-id', proposalId],
  })
  if (proposalLoading)
    return (
      <div className="flex h-full flex-col md:flex-row">
        <Sidebar session={session} />
        <div className="flex w-full max-w-full grow flex-col items-center justify-center overflow-x-hidden bg-[#f8f9fa] p-6">
          <LoadingComponent />
        </div>
      </div>
    )
  if (proposalError)
    return (
      <div className="flex h-full flex-col md:flex-row">
        <Sidebar session={session} />
        <div className="flex w-full max-w-full grow flex-col items-center justify-center overflow-x-hidden bg-[#f8f9fa] p-6">
          <ErrorComponent msg="Erro ao carregar informações da proposta." />
        </div>
      </div>
    )
  if (proposalSuccess) {
    return (
      <div className="flex h-full flex-col md:flex-row">
        <Sidebar session={session} />
        <div className="flex w-full max-w-full grow flex-col overflow-x-hidden bg-[#f8f9fa] p-6">
          <div className="flex w-full flex-col items-center justify-between border-b border-gray-200 pb-2 lg:flex-row">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-center text-2xl font-bold leading-none tracking-tight text-gray-800 lg:text-start">{proposal?.nome}</h1>
                <Link href={`/comercial/proposta/documento/${proposal._id}`}>
                  <div className="flex w-full items-center justify-center gap-2 self-center rounded-lg border border-cyan-500 p-1.5 text-xs font-medium text-cyan-500 duration-300 ease-in-out hover:border-cyan-600 hover:text-cyan-600">
                    <FaExternalLinkAlt />
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/comercial/oportunidades/id/${proposal.oportunidade.id}`}>
                  <div className="flex items-center gap-2">
                    <RxDashboard style={{ color: '#15599a', fontSize: '15px' }} />
                    <p className="text-xs">{proposal?.oportunidade.nome}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <FaUser style={{ color: '#15599a', fontSize: '15px' }} />
                  <p className="text-xs">Criada por: </p>
                  <Avatar url={proposal.autor.avatar_url || undefined} fallback={formatNameAsInitials(proposal.autor.nome)} height={25} width={25} />
                  <p className="text-xs">{proposal?.autor?.nome}</p>
                </div>
              </div>
            </div>
            {session.user.permissoes.projetos.visualizar ? (
              <button
                // @ts-ignore
                onClick={() => setTestRequestIsOpen(true)}
                className="rounded border border-cyan-600 px-4 py-2 text-sm font-bold text-cyan-600 duration-300 ease-in-out hover:bg-cyan-600 hover:text-white"
              >
                TESTAR GANHO
              </button>
            ) : null}

            <WinBlock
              opportunityId={proposal.oportunidade.id}
              proposalId={proposalId}
              isWon={!!proposal.oportunidadeDados.ganho.data}
              wonDate={proposal.oportunidadeDados.ganho.data}
              contractRequestDate={proposal.oportunidadeDados.ganho.dataSolicitacao}
              wonProposalId={proposal.oportunidadeDados.ganho.idProposta}
              proposalValue={proposal.valor}
              idMarketing={proposal.oportunidadeDados.idMarketing}
              opportunityEmail={proposal.clienteDados?.email}
              handleWin={() => {
                if (proposal.oportunidadeDados.categoriaVenda == 'PLANO' && proposal.planos.length > 1)
                  return toast.error('Defina o plano a ser vendido para prosseguir com o ganho.')
                setNewContractRequestIsOpen(true)
              }}
            />
          </div>
          <div className="flex w-full grow flex-col py-2">
            <div className="my-2 flex w-full items-center justify-end gap-2">
              {session.user.permissoes.propostas.editar ? (
                <button
                  // @ts-ignore
                  onClick={() => setEditProposalModalIsOpen(true)}
                  className="flex w-fit items-center gap-2 rounded bg-orange-400 p-2 text-xs font-black hover:bg-orange-500"
                >
                  <h1>EDITAR PROPOSTA</h1>
                  <AiFillEdit />
                </button>
              ) : null}
              {proposalId != proposal.oportunidadeDados.idPropostaAtiva ? (
                <button
                  // @ts-ignore
                  onClick={() => handleSetActiveProposal({ proposalId, opportunityId: proposal.oportunidade.id })}
                  className="flex w-fit items-center gap-2 rounded bg-blue-700 p-2 text-xs font-black text-white hover:bg-blue-800"
                >
                  <h1>USAR COMO PROPOSTA ATIVA</h1>
                  <AiFillStar />
                </button>
              ) : null}
              {proposal.oportunidadeDados.ganho.idProposta && proposalId != proposal.oportunidadeDados.ganho.idProposta ? (
                <button
                  // @ts-ignore
                  onClick={() =>
                    // @ts-ignore
                    handleUpdateWinningProposal({
                      proposalId,
                      opportunityId: proposal.oportunidade.id,
                      appProjectId: proposal.oportunidadeDados.ganho.idProjeto,
                    })
                  }
                  className="flex w-fit items-center gap-2 rounded bg-green-700 p-2 text-xs font-black text-white hover:bg-green-800"
                >
                  <h1>USAR COMO PROPOSTA GANHA</h1>
                  <FaTrophy />
                </button>
              ) : null}
            </div>
            <div className="flex min-h-[350px] w-full flex-col justify-around gap-3 lg:flex-row">
              <div className="flex h-full w-full flex-col rounded border border-gray-500 bg-[#fff] p-6 shadow-md lg:w-1/4">
                <div className="mb-2 flex w-full flex-col items-center">
                  <h1 className="w-full text-center font-Raleway text-lg font-bold text-[#15599a]">INFORMAÇÕES GERAIS</h1>
                  <p className="text-center text-xs italic text-gray-500">Essas são informações sobre a proposta.</p>
                </div>
                <div className="flex w-full grow flex-col justify-around gap-3">
                  <div className="flex w-full flex-col items-center justify-between gap-1 lg:flex-row">
                    <p className="text-xs font-medium leading-none tracking-tight text-gray-500">NOME DA PROPOSTA</p>
                    <p className="text-base font-medium leading-none tracking-tight lg:text-xs">{proposal.nome}</p>
                  </div>
                  <div className="flex w-full flex-col items-center justify-between gap-1 lg:flex-row">
                    <p className="text-xs font-medium leading-none tracking-tight text-gray-500">VALOR DA PROPOSTA</p>
                    <p className="text-base font-medium leading-none tracking-tight lg:text-xs">{formatToMoney(proposal.valor)}</p>
                  </div>
                  <div className="flex w-full flex-col items-center justify-between gap-1 lg:flex-row">
                    <p className="text-xs font-medium leading-none tracking-tight text-gray-500">POTÊNCIA PICO</p>
                    <p className="text-base font-medium leading-none tracking-tight lg:text-xs">{formatDecimalPlaces(proposal.potenciaPico || 0)} kWp</p>
                  </div>
                  <div className="flex w-full flex-col items-center justify-between gap-1 lg:flex-row">
                    <p className="text-xs font-medium leading-none tracking-tight text-gray-500">GERAÇÃO ESTIMADA</p>
                    <p className="text-base font-medium leading-none tracking-tight lg:text-xs">
                      {formatDecimalPlaces(
                        getEstimatedGen(
                          proposal.potenciaPico || 0,
                          proposal.oportunidadeDados?.localizacao.cidade,
                          proposal.oportunidadeDados?.localizacao.uf,
                          proposal.premissas.orientacao || 'NORTE'
                        )
                      )}
                      kWh
                    </p>
                  </div>
                  <div className="flex w-full flex-col items-center justify-between gap-1 lg:flex-row">
                    <p className="text-xs font-medium leading-none tracking-tight text-gray-500">METODOLOGIA</p>
                    <p className="text-end text-sm font-medium leading-none tracking-tight lg:text-xs">
                      {getPricingMethodById({ methods: pricingMethods, id: proposal.idMetodologiaPrecificacao })}
                    </p>
                  </div>
                  <div className="flex w-full flex-col items-center justify-between gap-1 lg:flex-row">
                    <p className="text-xs font-medium leading-none tracking-tight text-gray-500">KIT</p>
                    <p className="text-end text-sm font-medium leading-none tracking-tight lg:text-xs">
                      {proposal.kits.length > 0 ? proposal.kits.map((p) => p.nome).join(' + ') : 'SEM KITS'}
                    </p>
                  </div>
                  <div className="flex w-full flex-col items-center justify-between gap-1 lg:flex-row">
                    <p className="text-xs font-medium leading-none tracking-tight text-gray-500">PLANOS</p>
                    <p className="text-end text-sm font-medium leading-none tracking-tight lg:text-xs">
                      {proposal.planos.length > 0 ? proposal.planos.map((p) => p.nome).join(' + ') : 'SEM PLANOS'}
                    </p>
                  </div>
                  {proposal.urlArquivo ? (
                    <div className="flex w-full flex-col items-center justify-between gap-1 lg:flex-row">
                      <p className="text-xs font-medium leading-none tracking-tight text-gray-500">ARQUIVO</p>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload({ fileName: proposal.nome, fileUrl: proposal.urlArquivo || '' })}
                          className="flex w-fit items-center gap-2 self-center rounded-lg border border-blue-500 p-1.5 text-xs text-blue-500"
                        >
                          <TbDownload />
                        </button>
                        <button
                          onClick={() => copyToClipboard(proposal.urlArquivo || '')}
                          className="flex w-fit items-center gap-2 self-center rounded-lg border border-black p-1.5 text-xs text-black"
                        >
                          <MdContentCopy />
                        </button>
                        {session?.user.permissoes.propostas.editar ? (
                          <button
                            onClick={() => setEditProposalFileModalIsOpen(true)}
                            className="flex w-fit items-center gap-2 self-center rounded-lg border border-[#fead41] p-1.5 text-xs text-[#fead41]"
                          >
                            <AiFillEdit />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {/* {proposal.urlArquivo ? (
                    <>
                      <button
                        onClick={() => handleDownload({ fileName: proposal.nome, fileUrl: proposal.urlArquivo || '' })}
                        className="flex w-fit items-center gap-2 self-center rounded-lg border border-dashed border-[#15599a] p-2 text-[#15599a]"
                      >
                        <p>DOWNLOAD DO PDF</p>
                        <TbDownload />
                      </button>
                      <button
                        onClick={() => copyToClipboard(proposal.urlArquivo || '')}
                        className="flex w-fit items-center gap-2 self-center rounded-lg border border-dashed border-[#fead61] p-2 font-medium text-[#fead61]"
                      >
                        <p>COPIAR LINK DO ARQUIVO</p>
                        <MdContentCopy />
                      </button>

                      {session?.user.permissoes.propostas.editar ? (
                        <button
                          onClick={() => setEditProposalFileModalIsOpen(true)}
                          className="flex w-fit items-center gap-2 self-center rounded-lg border border-dashed border-black p-2 font-medium text-black"
                        >
                          <p>EDITAR ARQUIVO</p>
                          <AiFillEdit />
                        </button>
                      ) : null}
                    </>
                  ) : null} */}
                </div>
              </div>
              <div className="flex h-full w-full flex-col rounded border border-gray-500 bg-[#fff] p-6 shadow-md lg:w-1/4">
                <div className="mb-2 flex w-full flex-col items-center">
                  <h1 className="w-full text-center font-Raleway text-lg font-bold text-[#15599a]">PREMISSAS</h1>
                  <p className="text-center text-xs italic text-gray-500">Essas são as premissas de dimensionamento dessa proposta.</p>
                </div>
                <div className="flex w-full grow flex-col justify-around">
                  {Object.entries(proposal.premissas)
                    .filter(([key, value]) => !!value)
                    .map(([key, value], index) => (
                      <div className="flex w-full flex-col items-center justify-between gap-1 lg:flex-row">
                        <h1 className="text-xs font-medium uppercase leading-none tracking-tight text-gray-500">
                          {formatProposalPremissesLabel(key as keyof TProposalPremisses)}
                        </h1>
                        <h1 className="text-end text-sm font-medium leading-none tracking-tight lg:text-xs">
                          {formatProposalPremissesValue({ key: key as keyof TProposalPremisses, value })}
                        </h1>
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex h-full w-full flex-col rounded border border-gray-500 bg-[#fff] p-6 shadow-md lg:w-1/4">
                <div className="mb-2 flex w-full flex-col items-center">
                  <h1 className="w-full text-center font-Raleway text-lg font-bold text-[#15599a]">PRODUTOS</h1>
                  <p className="text-center text-xs italic text-gray-500">Esses são os produtos vinculados à essa proposta</p>
                  <div className="mt-2 flex w-full flex-col gap-2">
                    {proposal.produtos.length > 0 ? (
                      proposal.produtos.map((product, index) => (
                        <div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-200 p-2">
                          <div className="flex w-full flex-col items-start justify-between gap-2">
                            <div className="flex items-center gap-1">
                              <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1 text-[15px]">
                                {renderCategoryIcon(product.categoria)}
                              </div>
                              <p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">
                                <strong className="text-[#FF9B50]">{product.qtde}</strong> x {product.modelo}
                              </p>
                            </div>
                            <div className="flex w-full grow items-end justify-end gap-2 pl-2">
                              <div className="flex items-center gap-1">
                                <FaIndustry size={15} />
                                <p className="text-[0.6rem] font-light text-gray-500">{product.fabricante}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <ImPower size={15} />
                                <p className="text-[0.6rem] font-light text-gray-500">{product.potencia} W</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <AiOutlineSafety size={15} />
                                <p className="text-[0.6rem] font-light text-gray-500">{product.garantia} ANOS</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="w-full text-center text-sm italic text-gray-500">Nenhum produto vinculado à proposta...</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex h-full w-full flex-col rounded border border-gray-500 bg-[#fff] p-6 shadow-md lg:w-1/4">
                <div className="mb-2 flex w-full flex-col items-center">
                  <h1 className="w-full text-center font-Raleway text-lg font-bold text-[#15599a]">SERVIÇOS</h1>
                  <p className="text-center text-xs italic text-gray-500">Esses são os serviços vinculados à essa proposta</p>
                  <div className="mt-2 flex w-full flex-col gap-2">
                    {proposal.servicos.length > 0 ? (
                      proposal.servicos.map((service, index) => (
                        <div key={index} className="mt-1 flex w-full flex-col rounded-md border border-gray-200 p-2">
                          <div className="flex w-full items-center justify-between gap-2">
                            <div className="flex  items-center gap-1">
                              <div className="flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1">
                                <MdOutlineMiscellaneousServices />
                              </div>
                              <p className="text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs">{service.descricao}</p>
                            </div>
                            <div className="flex  grow items-center justify-end gap-2 pl-2">
                              <div className="flex items-center gap-1">
                                <AiOutlineSafety size={15} />
                                <p className="text-[0.6rem] font-light text-gray-500">{service.garantia} ANOS</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="w-full text-center text-sm italic text-gray-500">Nenhum serviço vinculado à proposta...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {proposal.descricao ? (
              <div className="my-4 flex w-full flex-col gap-1">
                <h1 className="text-center text-xs font-medium leading-none tracking-tight text-gray-500">DESCRIÇÃO/ANOTAÇÃO</h1>
                <p className="w-full text-center  text-sm italic leading-none text-gray-500">{proposal.descricao}</p>
              </div>
            ) : null}
            {proposal.planos.length > 1 ? (
              <ProposalViewPlansBlock
                plans={proposal.planos}
                opportunity={{ ...proposal.oportunidadeDados }}
                proposal={proposal}
                userHasPricingEditPermission={userHasPricingEditPermission}
                userHasPricingViewPermission={userHasPricingViewPermission}
              />
            ) : null}
            {proposal.precificacao.length > 0 ? (
              <ProposalViewPricingBlock userHasPricingViewPermission={userHasPricingViewPermission} pricing={proposal.precificacao} />
            ) : null}
            <ProposalUpdateRecords proposalId={proposalId} />
          </div>
        </div>
        {testRequestIsOpen ? (
          <NewProjectRequest
            session={session}
            opportunity={{ ...proposal.oportunidadeDados, cliente: proposal.clienteDados }}
            proposal={proposal}
            closeModal={() => setTestRequestIsOpen(false)}
          />
        ) : null}
        {editProposalModalIsOpen ? (
          <EditProposal
            session={session}
            info={proposal}
            userHasPricingViewPermission={userHasPricingViewPermission}
            userHasPricingEditPermission={userHasPricingEditPermission}
            closeModal={() => setEditProposalModalIsOpen(false)}
          />
        ) : null}
        {newContractRequestIsOpen ? (
          <NewContractRequest
            responsible={{
              _id: session.user.id,
              nome: session.user.email,
              email: session.user.email,
              avatar_url: session.user.avatar_url,
              telefone: session.user.telefone,
            }}
            client={proposal.clienteDados}
            proposeInfo={proposal}
            closeModal={() => setNewContractRequestIsOpen(false)}
            session={session}
          />
        ) : null}
        {editProposalFileModalIsOpen ? (
          <EditProposalFile
            proposalId={proposalId}
            opportunityId={proposal.oportunidade.id}
            proposalName={proposal.nome}
            closeModal={() => setEditProposalFileModalIsOpen(false)}
          />
        ) : null}
      </div>
    )
  }
  return <></>
}

export default ProposalPage
