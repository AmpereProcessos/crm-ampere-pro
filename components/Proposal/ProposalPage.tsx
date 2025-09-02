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
import { CalendarRange, ChartArea, Diamond, LayoutGrid, PiggyBank, ShoppingCart, Variable } from 'lucide-react';
import toast from 'react-hot-toast';
import { BsCalendarPlus, BsFillFunnelFill } from 'react-icons/bs';
import { FaTrophy } from 'react-icons/fa6';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import EditProposalFile from '../Modals/Proposal/EditFile';
import UFVEnergyEconomyAnalysis from '../Modals/Proposal/UFVEconomicAnalysis';
import { Button } from '../ui/button';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';

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
          <div className='flex w-full grow flex-col py-2 gap-3'>
            <div className='flex w-full items-center justify-end gap-2'>
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
            <div className='bg-card border-primary/20 flex w-full flex-col gap-3 rounded-xl border px-3 py-4 shadow-xs'>
              <div className='flex w-full items-center gap-1'>
                <LayoutGrid className='h-4 w-4' />
                <h1 className='text-xs font-medium tracking-tight uppercase'>RESUMO DA PROPOSTA</h1>
              </div>
              <div className='flex w-full flex-col justify-around gap-3 lg:flex-row items-stretch'>
                <div className={'bg-card border-primary/20 flex w-full flex-col gap-4 rounded-xl border px-3 py-4 shadow-xs lg:w-1/4'}>
                  <div className='flex items-center justify-between border-b border-primary/20 pb-2'>
                    <h1 className='text-xs font-medium tracking-tight uppercase'>INFORMAÇÕES GERAIS</h1>
                    <div className='flex items-center gap-2'>
                      <Diamond className='h-4 w-4' />
                    </div>
                  </div>
                  <div className='flex w-full flex-col justify-around gap-3'>
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
                <div className={'bg-card border-primary/20 flex w-full flex-col gap-4 rounded-xl border px-3 py-4 shadow-xs lg:w-1/4'}>
                  <div className='flex items-center justify-between border-b border-primary/20 pb-2'>
                    <h1 className='text-xs font-medium tracking-tight uppercase'>PREMISSAS</h1>
                    <div className='flex items-center gap-2'>
                      <Variable className='h-4 w-4' />
                    </div>
                  </div>
                  <div className='flex w-full flex-col justify-around gap-3'>
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
                <div className={'bg-card border-primary/20 flex w-full flex-col gap-4 rounded-xl border px-3 py-4 shadow-xs lg:w-1/4'}>
                  <div className='flex items-center justify-between border-b border-primary/20 pb-2'>
                    <h1 className='text-xs font-medium tracking-tight uppercase'>PRODUTOS</h1>
                    <div className='flex items-center gap-2'>
                      <ShoppingCart className='h-4 w-4' />
                    </div>
                  </div>
                  <div className='flex w-full flex-col justify-around gap-3'>
                    {proposal.produtos.length > 0 ? (
                      proposal.produtos.map((product, index) => (
                        <div key={`${product.modelo}-${product.fabricante}`} className='flex w-full flex-col rounded-md border border-primary/30 p-2'>
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
                <div className={'bg-card border-primary/20 flex w-full flex-col gap-4 rounded-xl border px-3 py-4 shadow-xs lg:w-1/4'}>
                  <div className='flex items-center justify-between border-b border-primary/20 pb-2'>
                    <h1 className='text-xs font-medium tracking-tight uppercase'>SERVIÇOS</h1>
                    <div className='flex items-center gap-2'>
                      <MdOutlineMiscellaneousServices className='h-4 w-4' />
                    </div>
                  </div>
                  <div className='flex w-full flex-col justify-around gap-3'>
                    {proposal.servicos.length > 0 ? (
                      proposal.servicos.map((service, index) => (
                        <div key={`${service.descricao}`} className='flex w-full flex-col rounded-md border border-primary/30 p-2'>
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
              {proposal.descricao ? (
                <div className='my-4 flex w-full flex-col gap-1'>
                  <h1 className='text-center text-xs font-medium leading-none tracking-tight text-primary/70'>DESCRIÇÃO/ANOTAÇÃO</h1>
                  <p className='w-full text-center  text-sm italic leading-none text-primary/70'>{proposal.descricao}</p>
                </div>
              ) : null}
              <ProposalEconomicAnalysis proposal={proposal} />
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
            </div>
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
      </div>
    );
  }
  return <></>;
}

export default ProposalPage;

function ProposalEconomicAnalysis({ proposal }: { proposal: TProposalDTOWithOpportunityAndClient }) {
  if (proposal.oportunidadeDados.tipo.titulo !== 'SISTEMA FOTOVOLTAICO') return null;
  const [economicAnalysisIsOpen, setEconomicAnalysisIsOpen] = useState(false);
  const analysis = getSalesProposalScenarios({
    salesProposal: proposal,
    salesProposalProducts: proposal.produtos,
    locationUf: proposal.oportunidadeDados.localizacao.uf,
    locationCity: proposal.oportunidadeDados.localizacao.cidade,
  });

  // Encontrar quando o payback fica positivo pela primeira vez
  const paybackBreakEven = analysis.progression.find((item) => item.Payback >= 0);
  const paybackMonths = paybackBreakEven ? analysis.progression.indexOf(paybackBreakEven) : -1;

  const fullChartData = analysis.progression.map((item) => ({
    tag: item.Tag,
    payback: item.Payback,
    paybackPositive: item.Payback >= 0 ? item.Payback : null,
    paybackNegative: item.Payback < 0 ? item.Payback : null,
    savedValue: item.SavedValue,
    energyBill: item.EnergyBillValue,
    conventionalBill: item.ConventionalEnergyBill,
    accumulatedBalance: item.CumulatedBalance,
  }));

  // Reduzir dados para máximo de 50 pontos mantendo representação espaçada
  const maxDataPoints = 50;
  let chartData = fullChartData;

  if (fullChartData.length > maxDataPoints) {
    const step = Math.floor(fullChartData.length / (maxDataPoints - 1));
    const sampledData = [];

    // Sempre incluir o primeiro ponto
    sampledData.push(fullChartData[0]);

    // Incluir pontos espaçados
    for (let i = step; i < fullChartData.length - 1; i += step) {
      sampledData.push(fullChartData[i]);
    }

    // Sempre incluir o último ponto
    if (fullChartData.length > 1) {
      sampledData.push(fullChartData[fullChartData.length - 1]);
    }

    chartData = sampledData;
  }
  const chartConfig = {
    payback: {
      label: 'Payback',
      color: 'var(--chart-1)',
    },
    paybackPositive: {
      label: 'Payback Positivo',
      color: '#22c55e', // green
    },
    paybackNegative: {
      label: 'Payback Negativo',
      color: '#ef4444', // red
    },
    energyBill: {
      label: 'Conta com Solar',
      color: '#3b82f6', // blue
    },
    conventionalBill: {
      label: 'Conta Convencional',
      color: '#f59e0b', // amber
    },
    accumulatedBalance: {
      label: 'Saldo Acumulado',
      color: '#8b5cf6', // purple
    },
  } satisfies ChartConfig;
  return (
    <div className='w-full flex flex-col gap-2'>
      <div className='w-full flex items-center justify-end'>
        <Button variant='ghost' size={'fit'} className='flex items-center gap-2 px-2 py-1' onClick={() => setEconomicAnalysisIsOpen(true)}>
          <ChartArea className='w-4 h-4 min-w-4 min-h-4' />
          VER ANÁLISE ECONÔMICA
        </Button>
      </div>
      <div className='flex w-full flex-col items-center justify-around gap-2 lg:flex-row'>
        <div className={'bg-card border-primary/20 flex w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs'}>
          <div className='flex items-center justify-between'>
            <h1 className='text-xs font-medium tracking-tight uppercase'>ECONOMIA MENSAL MÉDIA</h1>
            <div className='flex items-center gap-2'>
              <PiggyBank className='h-4 w-4' />
            </div>
          </div>
          <div className='flex w-full flex-col'>
            <div className='text-2xl font-bold text-[#15599a] dark:text-[#fead61]'>{formatToMoney(analysis.monthlySavedValue)}</div>
          </div>
        </div>
        <div className={'bg-card border-primary/20 flex w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs'}>
          <div className='flex items-center justify-between'>
            <h1 className='text-xs font-medium tracking-tight uppercase'>ECONOMIA TOTAL NO PERÍODO</h1>
            <div className='flex items-center gap-2'>
              <PiggyBank className='h-4 w-4' />
            </div>
          </div>
          <div className='flex w-full flex-col'>
            <div className='text-2xl font-bold text-[#15599a] dark:text-[#fead61]'>{formatToMoney(analysis.twentyFiveYearsSavedValue)}</div>
          </div>
        </div>
        <div className={'bg-card border-primary/20 flex w-full flex-col gap-1 rounded-xl border px-3 py-4 shadow-xs'}>
          <div className='flex items-center justify-between'>
            <h1 className='text-xs font-medium tracking-tight uppercase'>TEMPO DE RETORNO</h1>
            <div className='flex items-center gap-2'>
              <CalendarRange className='h-4 w-4' />
            </div>
          </div>
          <div className='flex w-full flex-col'>
            <div className='text-2xl font-bold text-[#15599a] dark:text-[#fead61]'>
              {paybackMonths > 0 ? `${Math.floor(paybackMonths / 12)} ANOS E ${paybackMonths % 12} MESES` : '...'}
            </div>
          </div>
        </div>
      </div>
      <div className='w-full flex flex-col gap-2 p-3'>
        <p className='text-xs text-primary/80'>
          Gráfico demonstrativo do payback do investimento. Em verde, o payback positivo e em vermelho, o payback negativo.
        </p>
        <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey='tag' tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const formatted = new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                }).format(Math.abs(value));
                return value < 0 ? `-${formatted}` : formatted;
              }}
            />
            <ChartTooltip content={<ChartTooltipContent className='w-fit min-w-[200px]' labelFormatter={(value) => `Período: ${value}`} />} />
            {/* <defs>
								<linearGradient id="paybackPositiveGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
									<stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
								</linearGradient>
								<linearGradient id="paybackNegativeGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor="#ef4444" stopOpacity={0.1} />
									<stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
								</linearGradient>
							</defs> */}
            <Bar dataKey='paybackPositive' stroke='#22c55e' strokeWidth={2} fill='url(#paybackPositiveGradient)' />
            <Bar dataKey='paybackNegative' stroke='#ef4444' strokeWidth={2} fill='url(#paybackNegativeGradient)' />
          </BarChart>
        </ChartContainer>
      </div>
      {economicAnalysisIsOpen ? <UFVEnergyEconomyAnalysis proposal={proposal} closeModal={() => setEconomicAnalysisIsOpen(false)} /> : null}
    </div>
  );
}
