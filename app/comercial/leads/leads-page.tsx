'use client';
import { TGetLeadsOutputDefault, TGetManyLeadsInput } from '@/app/api/leads/route';
import CheckboxInput from '@/components/Inputs/CheckboxInput';
import DateInput from '@/components/Inputs/DateInput';
import MultipleSelectInputVirtualized from '@/components/Inputs/MultipleSelectInputVirtualized';
import MultipleSelectWithImages from '@/components/Inputs/MultipleSelectWithImages';
import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import EditLead from '@/components/Modals/Leads/EditLead';
import NewLead from '@/components/Modals/Leads/NewLead';
import NewManyLeads from '@/components/Modals/Leads/NewManyLeads';
import QualifyLead from '@/components/Modals/Leads/QualifyLead';
import { Sidebar } from '@/components/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ErrorComponent from '@/components/utils/ErrorComponent';
import GeneralQueryPaginationMenu from '@/components/utils/GeneralQueryPaginationMenu';
import LoadingComponent from '@/components/utils/LoadingComponent';
import { TUserSession } from '@/lib/auth/session';
import { getErrorMessage } from '@/lib/methods/errors';
import { formatDateAsLocale, formatDateForInputValue, formatDateOnInputChange, formatNameAsInitials } from '@/lib/methods/formatting';
import { cn } from '@/lib/utils';
import { SlideMotionVariants } from '@/utils/constants';
import { BrazilianStatesOptions, BrazillianCitiesOptions } from '@/utils/estados_cidades';
import { updateLead } from '@/utils/mutations/leads';
import { useLeads } from '@/utils/queries/leads';
import { useOpportunityCreators } from '@/utils/queries/users';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, MapPin, UserRound } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { BsCalendarPlus } from 'react-icons/bs';

type LeadsPageProps = {
  session: TUserSession;
};
export default function LeadsPage({ session }: LeadsPageProps) {
  const queryClient = useQueryClient();
  const [newLeadMenuIsOpen, setNewLeadMenuIsOpen] = useState(false);
  const [newManyLeadsMenuIsOpen, setNewManyLeadsMenuIsOpen] = useState(false);
  const [editLeadMenuId, setEditLeadMenuId] = useState<string | null>(null);
  const [qualifyLeadMenuId, setQualifyLeadMenuId] = useState<string | null>(null);
  const [filterMenuIsOpen, setFilterMenuIsOpen] = useState(false);
  const { data: leadsResult, isLoading, isError, isSuccess, queryKey, filters, updateFilters, error } = useLeads();

  const handleOnMutate = async () => await queryClient.cancelQueries({ queryKey: queryKey });
  const handleOnSettle = async () => await queryClient.invalidateQueries({ queryKey: queryKey });
  const leads = leadsResult?.leads;
  const leadsShowing = leads?.length ?? 0;
  const leadsMatched = leadsResult?.leadsMatched ?? 0;
  const totalPages = leadsResult?.totalPages ?? 0;
  return (
    <div className='flex h-full flex-col md:flex-row'>
      <Sidebar session={session} />
      <div className='flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6'>
        <div className='w-full flex flex-col gap-2 pb-2 border-b border-primary'>
          <div className='flex w-full items-center justify-between gap-2'>
            <h1 className='text-xl font-black leading-none tracking-tight md:text-2xl'>LEADS</h1>
            <div className='flex items-center gap-2'>
              <Button
                variant={filterMenuIsOpen ? 'default' : 'ghost'}
                size='fit'
                className='rounded-lg p-2'
                onClick={() => setFilterMenuIsOpen(!filterMenuIsOpen)}
              >
                <Filter className='w-4 h-4 min-w-4 min-h-4' />
              </Button>
              <Button onClick={() => setNewManyLeadsMenuIsOpen(true)} variant='ghost'>
                MÚLTIPLOS LEADS
              </Button>
              <Button onClick={() => setNewLeadMenuIsOpen(true)}>NOVO LEAD</Button>
            </div>
          </div>
          <AnimatePresence>{filterMenuIsOpen ? <LeadsPageFilters filters={filters} updateFilters={updateFilters} /> : null}</AnimatePresence>
        </div>

        <GeneralQueryPaginationMenu
          activePage={filters.page}
          totalPages={totalPages}
          selectPage={(x) => updateFilters({ page: x })}
          queryLoading={isLoading}
          itemsMatched={leadsMatched}
          itemsShowing={leadsShowing}
        />

        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
        {isSuccess && leads ? (
          leads.length > 0 ? (
            <div className='w-full flex flex-col gap-3'>
              {leads.map((lead) => (
                <LeadCard
                  key={lead._id}
                  lead={lead}
                  handleQualifyClick={() => setQualifyLeadMenuId(lead._id)}
                  handleEditClick={() => setEditLeadMenuId(lead._id)}
                  callbacks={{ onMutate: handleOnMutate, onSettled: handleOnSettle }}
                />
              ))}
            </div>
          ) : (
            <p className='w-full text-center italic text-primary/70'>Nenhum lead encontrado...</p>
          )
        ) : null}
      </div>
      {newLeadMenuIsOpen ? (
        <NewLead
          sessionUser={session}
          closeModal={() => setNewLeadMenuIsOpen(false)}
          callbacks={{
            onMutate: handleOnMutate,
            onSettled: handleOnSettle,
          }}
        />
      ) : null}
      {newManyLeadsMenuIsOpen ? (
        <NewManyLeads
          sessionUser={session}
          closeModal={() => setNewManyLeadsMenuIsOpen(false)}
          callbacks={{
            onMutate: handleOnMutate,
            onSettled: handleOnSettle,
          }}
        />
      ) : null}
      {editLeadMenuId ? (
        <EditLead
          leadId={editLeadMenuId}
          sessionUser={session}
          closeModal={() => setEditLeadMenuId(null)}
          callbacks={{
            onMutate: handleOnMutate,
            onSettled: handleOnSettle,
          }}
        />
      ) : null}
      {qualifyLeadMenuId ? (
        <QualifyLead
          leadId={qualifyLeadMenuId}
          closeModal={() => setQualifyLeadMenuId(null)}
          callbacks={{
            onMutate: handleOnMutate,
            onSettled: handleOnSettle,
          }}
        />
      ) : null}
    </div>
  );
}

type LeadsPageFiltersProps = {
  filters: TGetManyLeadsInput;
  updateFilters: (filters: Partial<TGetManyLeadsInput>) => void;
};
function LeadsPageFilters({ filters, updateFilters }: LeadsPageFiltersProps) {
  const { data: opportunityCreators } = useOpportunityCreators();
  const periodFieldOptions: { id: number; label: string; value: TGetManyLeadsInput['periodField'] }[] = [
    { id: 1, label: 'DATA DE INSERÇÃO', value: 'dataInsercao' },
    { id: 2, label: 'DATA DO ÚLTIMO CONTATO', value: 'dataUltimoContato' },
    { id: 3, label: 'DATA DO PRÓXIMO CONTATO', value: 'dataProximoContato' },
    { id: 4, label: 'DATA DA CONVERSÃO', value: 'conversao.data' },
    { id: 5, label: 'DATA DA GANHO', value: 'ganho.data' },
    { id: 6, label: 'DATA DA PERDA', value: 'perda.data' },
  ];
  return (
    <motion.div
      variants={SlideMotionVariants}
      initial='initial'
      animate='animate'
      exit='exit'
      className={'bg-card border-primary/20 flex w-full flex-col gap-2 rounded-xl border px-3 py-4 shadow-xs'}
    >
      <h1 className='text-[0.65rem] font-medium tracking-tight uppercase'>FILTROS</h1>
      <div className='flex w-full flex-col items-center justify-start gap-2 md:flex-row flex-wrap'>
        <div className='w-full md:w-[300px]'>
          <TextInput
            label='PESQUISA'
            placeholder='Pesquise por um lead...'
            value={filters.search ?? ''}
            handleChange={(value) => updateFilters({ search: value })}
            width='100%'
          />
        </div>
        <div className='w-full md:w-[300px]'>
          <MultipleSelectInputVirtualized
            label='UF'
            options={BrazilianStatesOptions}
            selected={filters.ufs ?? []}
            handleChange={(value) => updateFilters({ ufs: value as TGetManyLeadsInput['ufs'] })}
            resetOptionLabel='TODAS'
            onReset={() => updateFilters({ ufs: [] })}
            width='100%'
          />
        </div>
        <div className='w-full md:w-[300px]'>
          <MultipleSelectInputVirtualized
            label='UF'
            options={BrazillianCitiesOptions}
            selected={filters.cities ?? []}
            handleChange={(value) => updateFilters({ cities: value as TGetManyLeadsInput['cities'] })}
            resetOptionLabel='TODAS'
            onReset={() => updateFilters({ cities: [] })}
            width='100%'
          />
        </div>

        <div className='w-full md:w-[300px]'>
          <SelectInput
            label='PERÍODO - CAMPO DE FILTRO'
            value={filters.periodField ?? ''}
            resetOptionLabel='NÃO DEFINIDO'
            onReset={() => updateFilters({ periodField: null })}
            handleChange={(value) => updateFilters({ periodField: value as TGetManyLeadsInput['periodField'] })}
            options={periodFieldOptions}
            width='100%'
          />
        </div>
        <div className='w-full md:w-[300px]'>
          <DateInput
            label='PERÍODO - DEPOIS DE'
            value={formatDateForInputValue(filters.periodAfter)}
            handleChange={(value) => updateFilters({ periodAfter: formatDateOnInputChange(value) })}
            width='100%'
          />
        </div>
        <div className='w-full md:w-[300px]'>
          <DateInput
            label='PERÍODO - ANTES DE'
            value={formatDateForInputValue(filters.periodBefore)}
            handleChange={(value) => updateFilters({ periodBefore: formatDateOnInputChange(value) })}
            width='100%'
          />
        </div>
        <div className='w-full md:w-[300px]'>
          <MultipleSelectWithImages
            label='QUALIFICADORES'
            selected={filters.qualifiersIds ?? []}
            handleChange={(value) => updateFilters({ qualifiersIds: value as TGetManyLeadsInput['qualifiersIds'] })}
            options={
              opportunityCreators?.map((creator) => ({
                id: creator._id,
                label: creator.nome,
                value: creator._id,
                url: creator.avatar_url || undefined,
              })) || []
            }
            resetOptionLabel='TODOS'
            onReset={() => updateFilters({ qualifiersIds: [] })}
            width='100%'
          />
        </div>
      </div>
      <div className='flex w-full flex-col items-center justify-start gap-2 md:flex-row flex-wrap'>
        <div className='w-fit'>
          <CheckboxInput
            labelFalse='SOMENTE CONTATOS PENDENTES'
            labelTrue='SOMENTE CONTATOS PENDENTES'
            checked={!!filters.pendingContact}
            handleChange={(value) => updateFilters({ pendingContact: value })}
          />
        </div>
        <div className='w-fit'>
          <CheckboxInput
            labelFalse='SOMENTE QUALIFICAÇÕES PENDENTES'
            labelTrue='SOMENTE QUALIFICAÇÕES PENDENTES'
            checked={!!filters.pendingQualification}
            handleChange={(value) => updateFilters({ pendingQualification: value })}
          />
        </div>
      </div>
    </motion.div>
  );
}

type LeadCardProps = {
  lead: TGetLeadsOutputDefault['leads'][number];
  handleQualifyClick: () => void;
  handleEditClick: () => void;
  callbacks: {
    onMutate: () => void;
    onSettled: () => void;
  };
};
function LeadCard({ lead, handleQualifyClick, handleEditClick, callbacks }: LeadCardProps) {
  function QualificationTag({ qualification }: { qualification: TGetLeadsOutputDefault['leads'][number]['qualificacao'] }) {
    if (!qualification.data)
      return <h3 className={cn('px-2 py-0.5 rounded-lg text-[0.6rem] font-medium bg-red-200 text-red-700')}>QUALIFICAÇÃO PENDENTE</h3>;
    return (
      <>
        <h3 className={cn('text-[0.6rem] text-primary')}>QUALIFICADO EM: {formatDateAsLocale(qualification.data, true)}</h3>
        <h3
          className={cn('px-2 py-0.5 rounded-lg bg-primary/20 text-[0.6rem] font-medium', {
            'bg-green-200 text-green-700': qualification.score >= 7,
            'bg-yellow-200 text-yellow-700': qualification.score >= 4 && qualification.score < 7,
            'bg-red-200 text-red-700': qualification.score < 4,
          })}
        >
          NOTA {qualification.score}
        </h3>
      </>
    );
  }
  function ContactTag({
    lastContact,
    nextContact,
  }: {
    lastContact: TGetLeadsOutputDefault['leads'][number]['dataUltimoContato'];
    nextContact: TGetLeadsOutputDefault['leads'][number]['dataProximoContato'];
  }) {
    if (!lastContact) return <h3 className={cn('px-2 py-0.5 rounded-lg text-[0.6rem] font-medium bg-red-200 text-red-700')}>CONTATO PENDENTE</h3>;

    const isOverDue = nextContact ? dayjs().isAfter(nextContact) : false;

    return (
      <h3
        className={cn('px-2 py-0.5 rounded-lg text-[0.6rem] font-medium bg-primary/20 text-primary', {
          'bg-red-200 text-red-700': isOverDue,
        })}
      >
        ÚLTIMO CONTATO EM: {formatDateAsLocale(lastContact, true)}
      </h3>
    );
  }
  const { mutate: handleUpdateLeadMutation, isPending } = useMutation({
    mutationKey: ['update-lead', lead._id],
    mutationFn: async () => await updateLead({ id: lead._id, lead: { dataUltimoContato: new Date().toISOString() } }),
    onMutate: () => {
      if (callbacks?.onMutate) callbacks.onMutate();
    },
    onSuccess: (data) => {
      return toast.success(data.message);
    },
    onSettled: () => {
      if (callbacks?.onSettled) callbacks.onSettled();
    },
    onError: (error) => {
      const msg = getErrorMessage(error);
      return toast.error(msg);
    },
  });
  return (
    <div className={cn('bg-card border-primary/20 flex w-full flex-col gap-3 rounded-xl border shadow-xs p-3')}>
      <div className='w-full flex items-center justify-between flex-col lg:flex-row gap-2'>
        <h1 className='text-sm font-bold  text-truncate'>{lead.telefone}</h1>
        <div className='flex items-center justify-center lg:justify-end gap-y-1 gap-x-2 flex-wrap'>
          <QualificationTag qualification={lead.qualificacao} />
          <ContactTag lastContact={lead.dataUltimoContato} nextContact={lead.dataProximoContato} />
        </div>
      </div>
      <div className='w-full flex items-center grow flex-wrap'>
        {lead.nome ? (
          <div className='flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-lg'>
            <UserRound className='w-3 h-3 min-w-3 min-h-3' />
            <p className='text-[0.6rem] font-medium'>{lead.nome}</p>
          </div>
        ) : null}
        {lead.cidade || lead.uf ? (
          <div className='flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-lg'>
            <MapPin className='w-3 h-3 min-w-3 min-h-3' />
            <p className='text-[0.6rem] font-medium'>
              {lead.cidade && `${lead.cidade}`}
              {lead.uf && ` (${lead.uf})`}
            </p>
          </div>
        ) : null}
      </div>
      <div className='w-full flex items-center justify-between flex-col lg:flex-row'>
        <div className='flex items-center gap-2 flex-wrap'>
          <div className='flex items-center gap-1'>
            <BsCalendarPlus className='w-3 h-3 min-w-3 min-h-3' />
            <p className='text-xs font-medium'>{formatDateAsLocale(lead.dataInsercao, true)}</p>
          </div>
          {lead.qualificacao.responsavel ? (
            <div className='flex items-center gap-1'>
              <p className='text-xs font-medium'>QUALIFICADO POR:</p>
              <Avatar className='w-5 h-5 min-w-5 min-h-5'>
                <AvatarImage src={lead.qualificacao.responsavel.avatar_url || undefined} />
                <AvatarFallback>{formatNameAsInitials(lead.qualificacao.responsavel.nome)}</AvatarFallback>
              </Avatar>
              <p className='text-xs font-medium'>{lead.qualificacao.responsavel.nome}</p>
            </div>
          ) : null}
        </div>
        <div className='flex items-center gap-2 flex-wrap'>
          <Button variant='ghost' size='fit' className='text-xs px-2 py-1' onClick={() => handleUpdateLeadMutation()} disabled={isPending}>
            NOTIFICAR CONTATO
          </Button>
          {!lead.qualificacao.data ? (
            <Button variant='ghost' size='fit' className='text-xs px-2 py-1' onClick={handleQualifyClick}>
              QUALIFICAR
            </Button>
          ) : null}
          <Button variant='ghost' size='fit' className='text-xs px-2 py-1' onClick={handleEditClick}>
            EDITAR
          </Button>
        </div>
      </div>
    </div>
  );
}
