'use client';
import type { TUserSession } from '@/lib/auth/session';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { AiFillEdit, AiFillStar, AiOutlineSafety } from 'react-icons/ai';
import { FaExternalLinkAlt, FaIndustry } from 'react-icons/fa';
import { ImPower } from 'react-icons/im';
import { MdContentCopy, MdOutlineMiscellaneousServices } from 'react-icons/md';
import { TbDownload } from 'react-icons/tb';

import { useProposalById } from '@/utils/queries/proposals';

import NewContractRequest from '../Modals/ContractRequest/NewContractRequest';
import EditProposal from '../Modals/Proposal/EditProposal';
import NewProjectRequest from '../ProjectRequest/NewProjectRequest';
import { Sidebar } from '../Sidebar';
import Avatar from '../utils/Avatar';
import ErrorComponent from '../utils/ErrorComponent';
import LoadingComponent from '../utils/LoadingComponent';
import ProposalViewPlansBlock from './Blocks/ProposalViewPlansBlock';
import ProposalViewPricingBlock from './Blocks/ProposalViewPricingBlock';
import WinBlock from './WinBlock';

import ProposalUpdateRecords from './ProposalUpdateRecords';

import { formatDateAsLocale, formatDecimalPlaces, formatNameAsInitials } from '@/lib/methods/formatting';

import { formatToMoney, getEstimatedGen } from '@/utils/methods';

import { renderCategoryIcon } from '@/lib/methods/rendering';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { setOpportunityActiveProposal, updateWinningProposal } from '@/utils/mutations/opportunities';
import { usePricingMethods } from '@/utils/queries/pricing-methods';
import type { TPricingMethodDTO } from '@/utils/schemas/pricing-method.schema';

import { copyToClipboard } from '@/lib/hooks';
import { handleDownload } from '@/lib/methods/download';
import { formatProposalPremissesLabel, formatProposalPremissesValue } from '@/utils/proposal';
import type { TProposalDTOWithOpportunityAndClient, TProposalPremisses } from '@/utils/schemas/proposal.schema';
import { getSalesProposalScenarios } from '@/utils/solar';
import { ChartArea } from 'lucide-react';
import toast from 'react-hot-toast';
import { BsCalendarPlus, BsFillFunnelFill } from 'react-icons/bs';
import { FaTrophy } from 'react-icons/fa6';
import EditProposalFile from '../Modals/Proposal/EditFile';
import UFVEnergyEconomyAnalysis from '../Modals/Proposal/UFVEconomicAnalysis';
import { Button } from '../ui/button';

function getPricingMethodById({ methods, id }: { methods?: TPricingMethodDTO[]; id: string }) {
  if (!methods) return 'NÃO DEFINIDO';
  const method = methods.find((m) => m._id === id);
  if (!method) return 'NÃO DEFINIDO';
  return method.nome;
}
type ProposalPageProps = {
  proposalId: string;
  session: TUserSession;
};
function ProposalPage({ proposalId, session }: ProposalPageProps) {
  const queryClient = useQueryClient();
  const [editProposalModalIsOpen, setEditProposalModalIsOpen] = useState<boolean>(false);
  const [editProposalFileModalIsOpen, setEditProposalFileModalIsOpen] = useState<boolean>(false);
  const [newContractRequestIsOpen, setNewContractRequestIsOpen] = useState<boolean>(false);
  const [economicAnalysisIsOpen, setEconomicAnalysisIsOpen] = useState<boolean>(false);
  const [testRequestIsOpen, setTestRequestIsOpen] = useState<boolean>(false);
  const { data: proposal, isLoading: proposalLoading, isError: proposalError, isSuccess: proposalSuccess } = useProposalById({ id: proposalId });
  const { data: pricingMethods } = usePricingMethods();

  const userHasPricingViewPermission = session?.user.permissoes.precos.visualizar;
  const userHasPricingEditPermission = session?.user.permissoes.precos.editar;

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
  });
  const { mutate: handleUpdateWinningProposal, isPending: isUpdatingWinningProposal } = useMutationWithFeedback({
    mutationKey: ['update-winning-proposal', proposalId],
    mutationFn: updateWinningProposal,
    queryClient: queryClient,
    affectedQueryKey: ['proposal-by-id', proposalId],
  });
  if (proposalLoading)
    return (
      <div className='flex h-full flex-col md:flex-row'>
        <Sidebar session={session} />
        <div className='flex w-full max-w-full grow flex-col items-center justify-center overflow-x-hidden bg-background p-6'>
          <LoadingComponent />
        </div>
      </div>
    );
  if (proposalError)
    return (
      <div className='flex h-full flex-col md:flex-row'>
        <Sidebar session={session} />
        <div className='flex w-full max-w-full grow flex-col items-center justify-center overflow-x-hidden bg-background p-6'>
          <ErrorComponent msg='Erro ao carregar informações da proposta.' />
        </div>
      </div>
    );
  if (proposalSuccess) {
    return (
      <div className='flex h-full flex-col md:flex-row'>
        <Sidebar session={session} />
        <div className='flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6'>
          <div className='flex w-full flex-col items-center justify-between gap-4 border-b border-primary/30 pb-2'>
            <div className='flex w-full flex-col items-center justify-center gap-2 lg:flex-row lg:justify-between'>
              <div className='flex items-center gap-2'>
                <h1 className='text-center text-2xl font-bold leading-none tracking-tight text-primary/80 lg:text-start'>{proposal?.nome}</h1>
                <Link href={`/comercial/proposta/documento/${proposal._id}`}>
                  <div className='flex w-full items-center justify-center gap-2 self-center rounded-lg border border-cyan-500 p-1.5 text-xs font-medium text-cyan-500 duration-300 ease-in-out hover:border-cyan-600 hover:text-cyan-600'>
                    <FaExternalLinkAlt />
                  </div>
                </Link>
              </div>
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
                  if (proposal.oportunidadeDados.categoriaVenda === 'PLANO' && proposal.planos.length > 1)
                    return toast.error('Defina o plano a ser vendido para prosseguir com o ganho.');
                  setNewContractRequestIsOpen(true);
                }}
              />
            </div>
            <div className='flex w-full flex-col items-center justify-between gap-1 lg:flex-row'>
              <Link href={`/comercial/oportunidades/id/${proposal.oportunidade.id}`}>
                <div className='flex items-center gap-2 rounded-sm'>
                  <BsFillFunnelFill style={{ color: '#15599a', fontSize: '15px' }} />
                  <p className='text-[0.65rem] font-medium text-primary/70'>{proposal?.oportunidade.nome}</p>
                </div>
              </Link>
              <div className='flex items-center gap-2'>
                <div className={'flex items-center gap-2'}>
                  <p className='text-[0.65rem] font-medium text-primary/70'>CRIADA EM:</p>
                  <BsCalendarPlus />
                  <p className='text-[0.65rem] font-medium text-primary/70'>{formatDateAsLocale(proposal.dataInsercao, true)}</p>
                  <Avatar url={proposal.autor.avatar_url || undefined} fallback={formatNameAsInitials(proposal.autor.nome)} height={25} width={25} />
                  <p className='text-[0.65rem] font-medium text-primary/70'>{proposal?.autor?.nome}</p>
                </div>
              </div>
            </div>
          </div>
          <div className='flex w-full grow flex-col py-2'>
            <div className='my-2 flex w-full items-center justify-end gap-2'>
              {proposal.oportunidadeDados.tipo.titulo === 'SISTEMA FOTOVOLTAICO' ? (
                <Button variant='ghost' className='flex items-center gap-2' onClick={() => setEconomicAnalysisIsOpen(true)}>
                  <ChartArea />
                  ANÁLISE ECONÔMICA
                </Button>
              ) : null}

              {session.user.permissoes.propostas.editar ? (
                <button
                  type='button'
                  // @ts-ignore
                  onClick={() => setEditProposalModalIsOpen(true)}
                  className='flex w-fit items-center gap-2 rounded-sm bg-orange-400 p-2 text-xs font-black hover:bg-orange-500'
                >
                  <h1>EDITAR PROPOSTA</h1>
                  <AiFillEdit />
                </button>
              ) : null}
              {proposalId !== proposal.oportunidadeDados.idPropostaAtiva ? (
                <button
                  type='button'
                  // @ts-ignore
                  onClick={() => handleSetActiveProposal({ proposalId, opportunityId: proposal.oportunidade.id })}
                  className='flex w-fit items-center gap-2 rounded-sm bg-blue-700 p-2 text-xs font-black text-primary-foreground hover:bg-blue-800'
                >
                  <h1>USAR COMO PROPOSTA ATIVA</h1>
                  <AiFillStar />
                </button>
              ) : null}
              {proposal.oportunidadeDados.ganho.idProposta && proposalId !== proposal.oportunidadeDados.ganho.idProposta ? (
                <button
                  type='button'
                  // @ts-ignore
                  onClick={() =>
                    // @ts-ignore
                    handleUpdateWinningProposal({
                      proposalId,
                      opportunityId: proposal.oportunidade.id,
                      appProjectId: proposal.oportunidadeDados.ganho.idProjeto || undefined,
                    })
                  }
                  className='flex w-fit items-center gap-2 rounded-sm bg-green-700 p-2 text-xs font-black text-primary-foreground hover:bg-green-800'
                >
                  <h1>USAR COMO PROPOSTA GANHA</h1>
                  <FaTrophy />
                </button>
              ) : null}
            </div>
            <div className='flex min-h-[350px] w-full flex-col justify-around gap-3 lg:flex-row'>
              <div className='flex h-full w-full flex-col rounded-sm border border-primary/50 bg-background p-6 shadow-md lg:w-1/4'>
                <div className='mb-2 flex w-full flex-col items-center'>
                  <h1 className='w-full text-center font-Raleway text-lg font-bold text-[#15599a]'>INFORMAÇÕES GERAIS</h1>
                  <p className='text-center text-xs italic text-primary/70'>Essas são informações sobre a proposta.</p>
                </div>
                <div className='flex w-full grow flex-col justify-around gap-3'>
                  <div className='flex w-full flex-col items-center justify-between gap-1 lg:flex-row'>
                    <p className='text-xs font-medium leading-none tracking-tight text-primary/70'>NOME DA PROPOSTA</p>
                    <p className='text-base font-medium leading-none tracking-tight lg:text-xs'>{proposal.nome}</p>
                  </div>
                  <div className='flex w-full flex-col items-center justify-between gap-1 lg:flex-row'>
                    <p className='text-xs font-medium leading-none tracking-tight text-primary/70'>VALOR DA PROPOSTA</p>
                    <p className='text-base font-medium leading-none tracking-tight lg:text-xs'>{formatToMoney(proposal.valor)}</p>
                  </div>
                  <div className='flex w-full flex-col items-center justify-between gap-1 lg:flex-row'>
                    <p className='text-xs font-medium leading-none tracking-tight text-primary/70'>POTÊNCIA PICO</p>
                    <p className='text-base font-medium leading-none tracking-tight lg:text-xs'>
                      {formatDecimalPlaces(proposal.potenciaPico || 0)} kWp
                    </p>
                  </div>
                  <div className='flex w-full flex-col items-center justify-between gap-1 lg:flex-row'>
                    <p className='text-xs font-medium leading-none tracking-tight text-primary/70'>GERAÇÃO ESTIMADA</p>
                    <p className='text-base font-medium leading-none tracking-tight lg:text-xs'>
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
                  <div className='flex w-full flex-col items-center justify-between gap-1 lg:flex-row'>
                    <p className='text-xs font-medium leading-none tracking-tight text-primary/70'>METODOLOGIA</p>
                    <p className='text-end text-sm font-medium leading-none tracking-tight lg:text-xs'>
                      {getPricingMethodById({ methods: pricingMethods, id: proposal.idMetodologiaPrecificacao })}
                    </p>
                  </div>
                  <div className='flex w-full flex-col items-center justify-between gap-1 lg:flex-row'>
                    <p className='text-xs font-medium leading-none tracking-tight text-primary/70'>KIT</p>
                    <p className='text-end text-sm font-medium leading-none tracking-tight lg:text-xs'>
                      {proposal.kits.length > 0 ? proposal.kits.map((p) => p.nome).join(' + ') : 'SEM KITS'}
                    </p>
                  </div>
                  <div className='flex w-full flex-col items-center justify-between gap-1 lg:flex-row'>
                    <p className='text-xs font-medium leading-none tracking-tight text-primary/70'>PLANOS</p>
                    <p className='text-end text-sm font-medium leading-none tracking-tight lg:text-xs'>
                      {proposal.planos.length > 0 ? proposal.planos.map((p) => p.nome).join(' + ') : 'SEM PLANOS'}
                    </p>
                  </div>
                  {proposal.urlArquivo ? (
                    <div className='flex w-full flex-col items-center justify-between gap-1 lg:flex-row'>
                      <p className='text-xs font-medium leading-none tracking-tight text-primary/70'>ARQUIVO</p>
                      <div className='flex flex-col items-center justify-center gap-2 lg:flex-row lg:justify-end'>
                        <button
                          type='button'
                          onClick={() => handleDownload({ fileName: proposal.nome, fileUrl: proposal.urlArquivo || '' })}
                          className='flex w-fit items-center gap-2 self-center rounded-lg border border-blue-500 p-1.5 text-xs text-blue-500'
                        >
                          <TbDownload />
                          <p className='block font-medium tracking-tight lg:hidden'>BAIXAR ARQUIVO</p>
                        </button>
                        <button
                          type='button'
                          onClick={() => copyToClipboard(proposal.urlArquivo || '')}
                          className='flex w-fit items-center gap-2 self-center rounded-lg border border-black p-1.5 text-xs text-primary'
                        >
                          <MdContentCopy />
                          <p className='block font-medium tracking-tight lg:hidden'>COPIAR LINK</p>
                        </button>
                        {session?.user.permissoes.propostas.editar ? (
                          <button
                            type='button'
                            onClick={() => setEditProposalFileModalIsOpen(true)}
                            className='flex w-fit items-center gap-2 self-center rounded-lg border border-[#fead41] p-1.5 text-xs text-[#fead41]'
                          >
                            <AiFillEdit />
                            <p className='block font-medium tracking-tight lg:hidden'>EDITAR ARQUIVO</p>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className='flex h-full w-full flex-col rounded-sm border border-primary/50 bg-background p-6 shadow-md lg:w-1/4'>
                <div className='mb-2 flex w-full flex-col items-center'>
                  <h1 className='w-full text-center font-Raleway text-lg font-bold text-[#15599a]'>PREMISSAS</h1>
                  <p className='text-center text-xs italic text-primary/70'>Essas são as premissas de dimensionamento dessa proposta.</p>
                </div>
                <div className='flex w-full grow flex-col justify-around gap-3'>
                  {Object.entries(proposal.premissas)
                    .filter(([key, value]) => !!value)
                    .map(([key, value], index) => (
                      <div key={`${key}`} className='flex w-full flex-col items-center justify-between gap-1 lg:flex-row'>
                        <h1 className='text-xs font-medium uppercase leading-none tracking-tight text-primary/70'>
                          {formatProposalPremissesLabel(key as keyof TProposalPremisses)}
                        </h1>
                        <h1 className='text-end text-sm font-medium leading-none tracking-tight lg:text-xs'>
                          {formatProposalPremissesValue({ key: key as keyof TProposalPremisses, value })}
                        </h1>
                      </div>
                    ))}
                </div>
              </div>
              <div className='flex h-full w-full flex-col rounded-sm border border-primary/50 bg-background p-6 shadow-md lg:w-1/4'>
                <div className='mb-2 flex w-full flex-col items-center'>
                  <h1 className='w-full text-center font-Raleway text-lg font-bold text-[#15599a]'>PRODUTOS</h1>
                  <p className='text-center text-xs italic text-primary/70'>Esses são os produtos vinculados à essa proposta</p>
                  <div className='mt-2 flex w-full flex-col gap-2'>
                    {proposal.produtos.length > 0 ? (
                      proposal.produtos.map((product, index) => (
                        <div
                          key={`${product.modelo}-${product.fabricante}`}
                          className='mt-1 flex w-full flex-col rounded-md border border-primary/30 p-2'
                        >
                          <div className='flex w-full flex-col items-start justify-between gap-2'>
                            <div className='flex items-center gap-1'>
                              <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1 text-[15px]'>
                                {renderCategoryIcon(product.categoria)}
                              </div>
                              <p className='text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs'>
                                <strong className='text-[#FF9B50]'>{product.qtde}</strong> x {product.modelo}
                              </p>
                            </div>
                            <div className='flex w-full grow items-end justify-end gap-2 pl-2'>
                              <div className='flex items-center gap-1'>
                                <FaIndustry size={15} />
                                <p className='text-[0.6rem] font-light text-primary/70'>{product.fabricante}</p>
                              </div>
                              <div className='flex items-center gap-1'>
                                <ImPower size={15} />
                                <p className='text-[0.6rem] font-light text-primary/70'>{product.potencia} W</p>
                              </div>
                              <div className='flex items-center gap-1'>
                                <AiOutlineSafety size={15} />
                                <p className='text-[0.6rem] font-light text-primary/70'>{product.garantia} ANOS</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className='w-full text-center text-sm italic text-primary/70'>Nenhum produto vinculado à proposta...</p>
                    )}
                  </div>
                </div>
              </div>
              <div className='flex h-full w-full flex-col rounded-sm border border-primary/50 bg-background p-6 shadow-md lg:w-1/4'>
                <div className='mb-2 flex w-full flex-col items-center'>
                  <h1 className='w-full text-center font-Raleway text-lg font-bold text-[#15599a]'>SERVIÇOS</h1>
                  <p className='text-center text-xs italic text-primary/70'>Esses são os serviços vinculados à essa proposta</p>
                  <div className='mt-2 flex w-full flex-col gap-2'>
                    {proposal.servicos.length > 0 ? (
                      proposal.servicos.map((service, index) => (
                        <div key={`${service.descricao}`} className='mt-1 flex w-full flex-col rounded-md border border-primary/30 p-2'>
                          <div className='flex w-full items-center justify-between gap-2'>
                            <div className='flex  items-center gap-1'>
                              <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
                                <MdOutlineMiscellaneousServices />
                              </div>
                              <p className='text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs'>{service.descricao}</p>
                            </div>
                            <div className='flex  grow items-center justify-end gap-2 pl-2'>
                              <div className='flex items-center gap-1'>
                                <AiOutlineSafety size={15} />
                                <p className='text-[0.6rem] font-light text-primary/70'>{service.garantia} ANOS</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className='w-full text-center text-sm italic text-primary/70'>Nenhum serviço vinculado à proposta...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {proposal.descricao ? (
              <div className='my-4 flex w-full flex-col gap-1'>
                <h1 className='text-center text-xs font-medium leading-none tracking-tight text-primary/70'>DESCRIÇÃO/ANOTAÇÃO</h1>
                <p className='w-full text-center  text-sm italic leading-none text-primary/70'>{proposal.descricao}</p>
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
            <ProposalEconomicAnalysis proposal={proposal} />
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
              ativo: true,
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
        {economicAnalysisIsOpen ? <UFVEnergyEconomyAnalysis proposal={proposal} closeModal={() => setEconomicAnalysisIsOpen(false)} /> : null}
      </div>
    );
  }
  return <></>;
}

export default ProposalPage;

function ProposalEconomicAnalysis({ proposal }: { proposal: TProposalDTOWithOpportunityAndClient }) {
  const analysis = getSalesProposalScenarios({
    salesProposal: proposal,
    salesProposalProducts: proposal.produtos,
    locationUf: proposal.oportunidadeDados.localizacao.uf,
    locationCity: proposal.oportunidadeDados.localizacao.cidade,
  });

  console.log(analysis);

  return null;
}
