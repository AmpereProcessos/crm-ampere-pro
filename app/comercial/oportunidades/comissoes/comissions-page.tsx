'use client';
import type { TBulkUpdateComissionsRouteInput, TGetComissionsRouteOutput } from '@/app/api/opportunities/comissions/route';
import { LoadingButton } from '@/components/Buttons/loading-button';
import MultipleSelectInput from '@/components/Inputs/MultipleSelectInput';
import { Sidebar } from '@/components/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import DateIntervalInput from '@/components/ui/DateIntervalInput';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import type { TUserSession } from '@/lib/auth/session';
import { formatDateAsLocale, formatDecimalPlaces, formatNameAsInitials, formatToMoney } from '@/lib/methods/formatting';
import { cn } from '@/lib/utils';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { bulkUpdateComissions } from '@/utils/mutations/opportunities';
import { useComissions } from '@/utils/queries/opportunities';
import { useStatsQueryOptions } from '@/utils/queries/stats';
import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { BadgeCheck, BadgeDollarSign, Calendar, Percent, Users, Wrench } from 'lucide-react';
import Link from 'next/link';
import { BsFunnel } from 'react-icons/bs';
import { FaDiamond, FaShieldHalved, FaSolarPanel } from 'react-icons/fa6';
import { MdDashboard, MdElectricMeter, MdOutlineRoofing } from 'react-icons/md';
import { VscDiffAdded } from 'react-icons/vsc';

const comissionableItemsIconsMap = {
  SISTEMA: FaSolarPanel,
  PADRÃO: MdElectricMeter,
  'ESTRUTURA PERSONALIZADA': MdOutlineRoofing,
  OEM: Wrench,
  SEGURO: FaShieldHalved,
};

const monthStart = dayjs().startOf('month');
const monthEnd = dayjs().endOf('month');
type ComissionsPageProps = {
  session: TUserSession;
};
function ComissionsPage({ session }: ComissionsPageProps) {
  const queryClient = useQueryClient();
  const userResultsScope = session.user.permissoes.resultados.escopo;
  // Checking if user results scope is broader then his own id
  const userResultsScopeIsBroad = !userResultsScope?.every((u) => u === session.user.id);
  const { data: queryOptions } = useStatsQueryOptions();
  const {
    data: comissions,
    isLoading,
    isError,
    isSuccess,
    queryParams,
    updateQueryParams,
  } = useComissions({
    initialQueryParams: {
      after: monthStart.toISOString(),
      before: monthEnd.toISOString(),
      userIds: userResultsScope || undefined,
    },
  });

  function handleBulkUpdateComission(comissions: TGetComissionsRouteOutput['data']) {
    const bulkUpdates: TBulkUpdateComissionsRouteInput = comissions.map((c) => {
      return {
        projectId: c.appId,
      };
    });
    return handleBulkUpdateComissionMutation({
      comissions: bulkUpdates,
    });
  }
  function getStats(info: TGetComissionsRouteOutput['data']) {
    const groupedStats = info.reduce(
      (
        acc: {
          totalComissionableProjects: number;
          totalComissionValue: number;
          totalComissionsValidated: number;
          totalComissionsNotValidated: number;
        },
        c
      ) => {
        acc.totalComissionableProjects++;
        acc.totalComissionValue += c.comissao.comissionados?.reduce((acc, c) => acc + c.comissaoValor, 0) || 0;
        acc.totalComissionsValidated += c.comissao.comissionados?.filter((c) => c.dataValidacao).length || 0;
        acc.totalComissionsNotValidated += c.comissao.comissionados?.filter((c) => !c.dataValidacao).length || 0;
        return acc;
      },
      {
        totalComissionableProjects: 0,
        totalComissionValue: 0,
        totalComissionsValidated: 0,
        totalComissionsNotValidated: 0,
      }
    );
    return groupedStats;
  }
  const { mutate: handleBulkUpdateComissionMutation, isPending: isBulkUpdateComissionPending } = useMutationWithFeedback({
    mutationKey: ['bulk-update-comissions'],
    mutationFn: bulkUpdateComissions,
    queryClient,
    affectedQueryKey: ['comissions', queryParams],
  });
  const stats = getStats(comissions || []);
  const responsiblesSelectableOptions = queryOptions?.responsibles
    ? userResultsScope
      ? queryOptions.responsibles.filter((a) => userResultsScope.includes(a._id))
      : queryOptions.responsibles
    : [];
  const areExistingOpportunitiesMissingValidation = comissions?.some((c) => c.comissao.comissionados.some((c) => !c.dataValidacao));
  return (
    <div className='flex h-full flex-col md:flex-row'>
      <Sidebar session={session} />
      <div className='flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6'>
        <div className='flex w-full flex-col gap-2 border-b border-black pb-2'>
          <div className='flex w-full flex-col items-center justify-between gap-4 lg:flex-row'>
            <div className='flex flex-col items-center gap-1 lg:flex-row'>
              <div className='flex flex-col items-center gap-1'>
                <h1 className='text-xl font-black leading-none tracking-tight md:text-2xl'>COMISSÕES</h1>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {userResultsScopeIsBroad ? (
                <div className='w-full lg:w-[300px]'>
                  <MultipleSelectInput
                    labelClassName='text-sm font-medium uppercase tracking-tight'
                    resetOptionLabel='TODOS OS USUÁRIOS'
                    selected={queryParams.userIds || []}
                    options={
                      responsiblesSelectableOptions?.map((resp) => ({ id: resp._id || '', label: resp.nome || '', value: resp._id || '' })) || []
                    }
                    handleChange={(value) => updateQueryParams({ userIds: value as string[] })}
                    onReset={() => updateQueryParams({ userIds: userResultsScope || undefined })}
                    label='USUÁRIOS'
                    width='100%'
                  />
                </div>
              ) : null}

              <DateIntervalInput
                label='Período'
                labelClassName='text-xs font-medium leading-none tracking-tight'
                className='border-none p-0 px-2 h-fit py-0.5 shadow-none'
                value={{
                  after: queryParams.after ? new Date(queryParams.after) : undefined,
                  before: queryParams.before ? new Date(queryParams.before) : undefined,
                }}
                handleChange={(v) => {
                  updateQueryParams({
                    after: v.after ? v.after.toISOString() : undefined,
                    before: v.before ? v.before.toISOString() : undefined,
                  });
                }}
              />
            </div>
          </div>
        </div>
        <div className='flex flex-col justify-between gap-4 py-2'>
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent msg='Erro ao buscar comissões.' /> : null}
          {isSuccess ? (
            <>
              <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
                <div className='flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background px-6 py-3 shadow-md lg:w-1/2'>
                  <div className='flex items-center justify-between'>
                    <h1 className='text-sm font-medium uppercase tracking-tight'>Projetos Comissionáveis</h1>
                    <VscDiffAdded />
                  </div>
                  <div className='mt-2 flex w-full flex-col'>
                    <div className='text-xl font-bold text-[#15599a]'>{stats.totalComissionableProjects}</div>
                  </div>
                </div>
                <div className='flex min-h-[110px] w-full flex-col rounded-xl border border-primary/30 bg-background px-6 py-3 shadow-md lg:w-1/2'>
                  <div className='flex items-center justify-between'>
                    <h1 className='text-sm font-medium uppercase tracking-tight'>Comissão total</h1>
                    <BadgeDollarSign />
                  </div>
                  <div className='mt-2 flex w-full flex-col'>
                    <div className='text-xl font-bold text-[#15599a]'>{formatToMoney(stats.totalComissionValue)}</div>
                  </div>
                </div>
              </div>
              <div className='w-full flex items-center justify-center gap-2 flex-wrap'>
                <div
                  className={cn(
                    'flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-xxs font-bold italic text-primary/80 bg-green-100 text-green-700'
                  )}
                >
                  <BadgeCheck className={cn('w-4 h-4 min-w-4 min-h-4')} />
                  <p className={cn('font-medium text-sm')}>{stats.totalComissionsValidated} validadas</p>
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-xxs font-bold italic text-primary/80 bg-orange-100 text-orange-700'
                  )}
                >
                  <BadgeCheck className={cn('w-4 h-4 min-w-4 min-h-4')} />
                  <p className={cn('font-medium text-sm')}>{stats.totalComissionsNotValidated} não validadas</p>
                </div>
              </div>
              <div className='w-full flex items-center justify-end'>
                {areExistingOpportunitiesMissingValidation ? (
                  <LoadingButton loading={isBulkUpdateComissionPending} onClick={() => handleBulkUpdateComission(comissions)}>
                    VALIDAR COMISSÕES PENDENTES
                  </LoadingButton>
                ) : null}
              </div>
              {comissions.length > 0 ? (
                comissions.map((opportunity) => (
                  <ComissionCard
                    key={opportunity._id}
                    opportunity={opportunity}
                    queryClient={queryClient}
                    affectedQueryKey={['own-comissions', queryParams]}
                    view={userResultsScopeIsBroad ? 'broad' : 'own'}
                    sessionUserId={session.user.id}
                  />
                ))
              ) : (
                <p className='w-full text-center italic text-primary/50'>Nenhuma comissão para o período selecionado encontrada...</p>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ComissionsPage;

type ComissionCardProps = {
  sessionUserId: string;
  opportunity: TGetComissionsRouteOutput['data'][number];
  queryClient: QueryClient;
  view: 'own' | 'broad';
  affectedQueryKey: any[];
};
function ComissionCard({ opportunity, queryClient, affectedQueryKey, view, sessionUserId }: ComissionCardProps) {
  const totalComissionPercentage = opportunity.comissao.comissionados.reduce((acc, comissionado) => acc + comissionado.comissaoPorcentagem, 0) / 100;
  const totalComissionValue = opportunity.comissao.valorComissionavel * totalComissionPercentage;
  function getDateParams(opportunity: TGetComissionsRouteOutput['data'][number]) {
    if (['SISTEMA FOTOVOLTAICO', 'AUMENTO DE SISTEMA FOTOVOLTAICO'].includes(opportunity.appTipo)) {
      return opportunity.appDataRecebimentoParcial;
    }
    return opportunity.appDataAssinatura;
  }
  function handleValidateComission(opportunity: TGetComissionsRouteOutput['data'][number]) {
    const bulkUpdates: TBulkUpdateComissionsRouteInput = [{ projectId: opportunity.appId }];
    return handleBulkUpdateComissionMutation({
      comissions: bulkUpdates,
    });
  }
  const { mutate: handleBulkUpdateComissionMutation, isPending: isBulkUpdateComissionPending } = useMutationWithFeedback({
    mutationKey: ['bulk-update-comissions'],
    mutationFn: bulkUpdateComissions,
    queryClient,
    affectedQueryKey,
  });
  const comissionValueMap = {
    SISTEMA: opportunity.valorProjeto,
    PADRÃO: opportunity.valorPadrao,
    'ESTRUTURA PERSONALIZADA': opportunity.valorEstruturaPersonalizada,
    OEM: opportunity.valorOem,
    SEGURO: opportunity.valorSeguro,
  };
  function getComissionByItemList(opportunity: TGetComissionsRouteOutput['data'][number]) {
    const comissionableItems = opportunity.comissao.itensComissionaveis || ['SISTEMA', 'PADRÃO', 'ESTRUTURA PERSONALIZADA', 'OEM', 'SEGURO'];

    const comissionableItemsList = comissionableItems.map((item) => {
      const value = comissionValueMap[item as keyof typeof comissionValueMap] || 0;
      return {
        item,
        icon: comissionableItemsIconsMap[item as keyof typeof comissionableItemsIconsMap],
        valor: value,
        comissionados: opportunity.comissao.comissionados.map((comissionado) => ({
          nome: comissionado.nome,
          avatar_url: comissionado.avatar_url,
          porcentagem: comissionado.comissaoPorcentagem,
          comissao: (comissionado.comissaoPorcentagem * value) / 100,
        })),
        comissaoTotal: value * totalComissionPercentage,
      };
    });
    return comissionableItemsList;
  }
  const comissionByItemList = getComissionByItemList(opportunity);
  const sessionUserComission = opportunity.comissao.comissionados.find((c) => c.id === sessionUserId);
  return (
    <div className='flex w-full flex-col gap-1 rounded-sm border border-primary bg-background p-2 shadow-md'>
      <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
        <div className='flex items-center gap-2 flex-wrap'>
          <div className='flex items-center gap-1 text-center text-xs font-bold italic text-primary/80'>
            <MdDashboard size={12} />
            <p className='text-xs'>{opportunity.appIdentificador}</p>
          </div>
          <p className='text-sm font-bold leading-none tracking-tight'>{opportunity.appNome}</p>
          <Link href={`/comercial/oportunidades/id/${opportunity._id}`} target='_blank' rel='noreferrer'>
            <div className='flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-xxs font-bold italic text-primary/80'>
              <BsFunnel size={12} />
              <p>{opportunity.identificador}</p>
            </div>
          </Link>
          <div className='flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-xxs font-bold italic text-primary/80'>
            <FaDiamond size={12} />
            <p>{opportunity.appTipo}</p>
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className='flex items-center gap-1  text-center text-[0.57rem] font-bold italic text-primary/80'>
                <Calendar className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />
                <p>{formatDateAsLocale(getDateParams(opportunity))}</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className='min-w-80 w-fit'>
              <div className='space-y-1'>
                <div className='w-full flex items-center justify-between gap-2'>
                  <p className='text-sm font-semibold text-primary/80'>DATA DE ASSINATURA:</p>
                  <p className='text-sm font-semibold text-primary/80'>{formatDateAsLocale(opportunity.appDataAssinatura) || 'N/A'}</p>
                </div>
                <div className='w-full flex items-center justify-between gap-2'>
                  <p className='text-sm font-semibold text-primary/80'>DATA DE PAGAMENTO PARCIAL: </p>
                  <p className='text-sm font-semibold text-primary/80'>{formatDateAsLocale(opportunity.appDataRecebimentoParcial) || 'N/A'}</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        {view === 'own' ? (
          <div className='flex items-center gap-2'>
            <p className='text-sm font-semibold text-primary/80'>SUA COMISSÃO</p>
            <div className='flex items-center gap-1 px-2 py-1'>
              <Percent className='h-4 w-4 min-h-4 min-w-4' />
              <p className='text-sm font-semibold text-primary/80'>{formatDecimalPlaces(sessionUserComission?.comissaoPorcentagem || 0)}%</p>
            </div>
            <div className='flex items-center gap-1 px-2 py-1'>
              <BadgeDollarSign className='h-4 w-4 min-h-4 min-w-4' />
              <p className='text-sm font-semibold text-primary/80'>{formatToMoney(sessionUserComission?.comissaoValor || 0)}</p>
            </div>
          </div>
        ) : null}
      </div>
      <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
        <div className='flex w-full flex-wrap items-center justify-center gap-2 lg:grow lg:justify-start'>
          {view === 'own' ? (
            <>
              <div className='flex items-center gap-1'>
                <Users className={cn('w-3 h-3 min-w-3 min-h-3')} />
                <div className='flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-xxs font-bold italic text-primary/80'>
                  <p>FUNÇÃO: </p>
                  <p className='text-[#15599a] font-black text-[0.57rem]'>{sessionUserComission?.papel}</p>
                </div>
              </div>
              <div
                className={cn('flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-xxs font-bold italic text-primary/80', {
                  'bg-orange-100 text-orange-700': !sessionUserComission?.comissaoEfetivada,
                  'bg-green-100 text-green-700': sessionUserComission?.comissaoEfetivada,
                })}
              >
                <BadgeCheck className={cn('w-3 h-3 min-w-3 min-h-3')} />
                <p className={cn('font-medium text-[0.57rem]')}>
                  {sessionUserComission?.comissaoEfetivada ? 'COMISSÕES DEFINIDAS' : 'COMISSÕES NÃO DEFINIDAS'}
                </p>
              </div>
              <div
                className={cn('flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-xxs font-bold italic text-primary/80', {
                  'bg-orange-100 text-orange-700': !sessionUserComission?.comissaoPagamentoRealizado,
                  'bg-green-100 text-green-700': sessionUserComission?.comissaoPagamentoRealizado,
                })}
              >
                <BadgeDollarSign className={cn('w-3 h-3 min-w-3 min-h-3')} />
                <p className={cn('font-medium text-[0.57rem]')}>
                  {sessionUserComission?.comissaoPagamentoRealizado ? 'PAGAMENTO REALIZADO' : 'PAGAMENTO NÃO REALIZADO'}
                </p>
              </div>
              <div
                className={cn('flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-xxs font-bold italic text-primary/80', {
                  'bg-orange-100 text-orange-700': !sessionUserComission?.dataValidacao,
                  'bg-green-100 text-green-700': sessionUserComission?.dataValidacao,
                })}
              >
                <BadgeCheck className={cn('w-3 h-3 min-w-3 min-h-3')} />
                <p className={cn('font-medium text-[0.57rem]')}>
                  {sessionUserComission?.dataValidacao
                    ? `VALIDO COMO ${sessionUserComission?.papel} EM ${formatDateAsLocale(sessionUserComission?.dataValidacao)}`
                    : 'NÃO VALIDADO'}
                </p>
              </div>
            </>
          ) : (
            <>
              <Users className={cn('w-3 h-3 min-w-3 min-h-3')} />
              <p className='text-xxs font-bold italic text-primary/80'>COMISSIONADOS</p>
              {opportunity.comissao.comissionados.map((comissionado, index) => (
                <div
                  key={`${comissionado.nome}-${index}`}
                  className='flex items-center gap-1 rounded-lg bg-secondary px-2 py-0.5 text-center text-xxs font-bold italic text-primary/80'
                >
                  <Avatar className='h-5 w-5 min-h-5 min-w-5'>
                    <AvatarImage src={comissionado.avatar_url || undefined} alt={comissionado.nome} />
                    <AvatarFallback>{formatNameAsInitials(comissionado.nome || 'NA')}</AvatarFallback>
                  </Avatar>
                  <p className='text-[#15599a] font-black text-[0.57rem]'>{comissionado.nome}</p>
                  <p className='text-green-700 font-black text-[0.57rem]'>{formatDecimalPlaces(comissionado.comissaoPorcentagem)}%</p>
                  <BadgeCheck
                    className={cn('w-3 h-3 min-w-3 min-h-3', {
                      'text-orange-700': !comissionado.dataValidacao,
                      'text-green-700': comissionado.dataValidacao,
                    })}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <div className='w-full flex items-center justify-between gap-2 flex-col lg:flex-row'>
        <div className='flex justify-center lg:justify-start items-center gap-2 flex-wrap'>
          {comissionByItemList.map((item) => (
            <HoverCard key={item.item}>
              <HoverCardTrigger asChild>
                <Button variant={'ghost'} className='flex items-center gap-1 px-2 py-1' size={'fit'}>
                  <item.icon className='h-4 w-4 min-h-4 min-w-4' />
                  <p className='text-sm font-semibold text-primary/80'>{formatToMoney(item.comissaoTotal)}</p>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className='min-w-80 w-fit'>
                <div className='space-y-1'>
                  <div className='w-full flex items-center justify-between gap-2'>
                    <p className='text-sm font-semibold text-primary/80'>VALOR COMISSIONÁVEL DO ITEM</p>
                    <p className='text-sm font-semibold text-primary/80'>{formatToMoney(item.valor)}</p>
                  </div>
                  {item.comissionados.map((comissionado, index) => (
                    <div key={`${comissionado.nome}-${index}`} className='w-full flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-1'>
                        <Avatar className='h-5 w-5 min-h-5 min-w-3'>
                          <AvatarImage src={comissionado.avatar_url || undefined} alt={comissionado.nome} />
                          <AvatarFallback>{formatNameAsInitials(comissionado.nome || 'NA')}</AvatarFallback>
                        </Avatar>
                        <p className='text-sm font-semibold text-primary/80'>{comissionado.nome}</p>
                      </div>

                      <p className='text-sm font-semibold text-primary/80'>{formatToMoney(comissionado.comissao)}</p>
                    </div>
                  ))}
                </div>
                <div className='w-full h-px rounded-sm bg-primary my-2' />
                <div className='w-full flex items-center justify-between gap-2'>
                  <p className='text-sm font-semibold text-primary/80'>COMISSÃO TOTAL</p>
                  <p className='text-sm font-semibold text-primary/80'>{formatToMoney(item.comissaoTotal)}</p>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant={'ghost'} className='flex items-center gap-1 px-2 py-1' size={'fit'}>
              <BadgeDollarSign className='h-4 w-4 min-h-4 min-w-4' />
              <p className='text-sm font-semibold text-primary/80'>{formatToMoney(totalComissionValue)}</p>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className='min-w-80 w-fit'>
            <div className='space-y-1'>
              <div className='w-full flex items-center justify-between gap-2'>
                <p className='text-sm font-semibold text-primary/80'>VALOR COMISSIONÁVEL TOTAL</p>
                <p className='text-sm font-semibold text-primary/80'>{formatToMoney(opportunity.comissao.valorComissionavel)}</p>
              </div>
              {opportunity.comissao.comissionados.map((comissionado, index) => (
                <div key={`${comissionado.nome}-${index}`} className='w-full flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-1'>
                    <Avatar className='h-5 w-5 min-h-5 min-w-3'>
                      <AvatarImage src={comissionado.avatar_url || undefined} alt={comissionado.nome} />
                      <AvatarFallback>{formatNameAsInitials(comissionado.nome || 'NA')}</AvatarFallback>
                    </Avatar>
                    <p className='text-sm font-semibold text-primary/80'>{comissionado.nome}</p>
                  </div>
                  <p className='text-sm font-semibold text-primary/80'>
                    {formatToMoney((comissionado.comissaoPorcentagem / 100) * opportunity.comissao.valorComissionavel)}
                  </p>
                </div>
              ))}
            </div>
            <div className='w-full h-px rounded-sm bg-primary my-2' />
            <div className='w-full flex items-center justify-between gap-2'>
              <p className='text-sm font-semibold text-primary/80'>COMISSÃO TOTAL</p>
              <p className='text-sm font-semibold text-primary/80'>{formatToMoney(totalComissionValue)}</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      {view === 'own' ? (
        sessionUserComission && !sessionUserComission?.dataValidacao ? (
          <LoadingButton
            size={'fit'}
            className='px-2 py-1 text-xs font-bold'
            variant={'ghost'}
            loading={isBulkUpdateComissionPending}
            onClick={() => handleValidateComission(opportunity)}
          >
            VALIDAR COMISSÃO
          </LoadingButton>
        ) : null
      ) : null}
    </div>
  );
}
