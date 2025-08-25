import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import { Button } from '@/components/ui/button';
import Avatar from '@/components/utils/Avatar';
import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import type { TUserSession } from '@/lib/auth/session';
import { getMonthPeriodsStrings } from '@/lib/methods/dates';
import { getErrorMessage } from '@/lib/methods/errors';
import { formatDateAsLocale, formatDecimalPlaces, formatNameAsInitials, formatToMoney } from '@/lib/methods/formatting';
import { cn } from '@/lib/utils';
import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { createSaleGoal, editSaleGoal } from '@/utils/mutations/sale-goals';
import { usePromoterSaleGoals } from '@/utils/queries/sale-goals';
import { TSaleGoal, TSaleGoalDTO } from '@/utils/schemas/sale-goal.schema';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import { Goal, Pencil } from 'lucide-react';
import { useState } from 'react';
import { BsCalendarPlus, BsFileEarmarkText, BsPatchCheck } from 'react-icons/bs';
import { FaBolt, FaPercentage } from 'react-icons/fa';
import { GrSend } from 'react-icons/gr';
import { VscDiffAdded } from 'react-icons/vsc';

type GoalsMenuProps = {
  promoter: {
    id: string;
    nome: string;
    avatar_url?: string | null;
  };
  session: TUserSession;
};
function GoalsMenu({ promoter, session }: GoalsMenuProps) {
  const [newSaleGoalMenuIsOpen, setNewSaleGoalMenuIsOpen] = useState<boolean>(false);
  const { data: saleGoals, isLoading, isSuccess, isError, error } = usePromoterSaleGoals(promoter.id);
  return (
    <div className='flex w-full flex-col gap-2'>
      <h1 className='w-full rounded-sm bg-black p-1 text-center text-xs font-medium text-primary-foreground'>METAS</h1>
      <div className='flex w-full items-center justify-end'>
        <button
          onClick={() => setNewSaleGoalMenuIsOpen((prev) => !prev)}
          className={cn('flex items-center gap-1 rounded-lg px-2 py-1 text-primary duration-300 ease-in-out', {
            'bg-primary/30  hover:bg-red-300': newSaleGoalMenuIsOpen,
            'bg-green-300  hover:bg-green-400': !newSaleGoalMenuIsOpen,
          })}
        >
          <Goal />
          <h1 className='text-xs font-medium tracking-tight'>
            {!newSaleGoalMenuIsOpen ? 'ABRIR MENU DE NOVA META DE VENDAS' : 'FECHAR MENU DE NOVA META DE VENDAS'}
          </h1>
        </button>
      </div>
      <AnimatePresence>
        {newSaleGoalMenuIsOpen ? <NewSaleGoalMenu promoter={promoter} session={session} closeMenu={() => setNewSaleGoalMenuIsOpen(false)} /> : null}
      </AnimatePresence>

      <div className='flex w-full flex-col gap-2'>
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
        {isSuccess ? (
          saleGoals.length > 0 ? (
            saleGoals.map((goal) => <SaleGoalCard key={goal._id} goal={goal} />)
          ) : (
            <p className='w-full text-center text-xs font-medium tracking-tight text-primary/70'>
              Nenhuma meta encontrada para o promotor de vendas.
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}

export default GoalsMenu;

type NewSaleGoalMenuProps = {
  promoter: {
    id: string;
    nome: string;
    avatar_url?: string | null;
  };
  session: TUserSession;
  closeMenu: () => void;
};
function NewSaleGoalMenu({ promoter, session, closeMenu }: NewSaleGoalMenuProps) {
  const queryClient = useQueryClient();
  const initialPeriodString = dayjs().format('MM/YYYY');
  const initialPeriodMonthDays = dayjs().daysInMonth();
  const currentYear = dayjs().get('year');
  const periodOptions = getMonthPeriodsStrings({ initialYear: currentYear - 1, endYear: currentYear + 1 });

  const [infoHolder, setInfoHolder] = useState<TSaleGoal>({
    periodo: initialPeriodString,
    idParceiro: '',
    periodoDias: initialPeriodMonthDays,
    periodoInicio: dayjs().startOf('month').subtract(3, 'hour').toISOString(),
    periodoFim: dayjs().endOf('month').subtract(3, 'hour').toISOString(),
    usuario: {
      id: promoter.id,
      nome: promoter.nome,
      avatar_url: promoter.avatar_url,
    },
    metas: {},

    autor: {
      id: session.user.id,
      nome: session.user.id,
      avatar_url: session.user.avatar_url,
    },
    dataInsercao: new Date().toISOString(),
  });
  const { mutate, isPending } = useMutationWithFeedback({
    mutationKey: ['create-sale-goal'],
    mutationFn: createSaleGoal,
    queryClient: queryClient,
    affectedQueryKey: ['user-sale-goals', promoter.id],
  });
  return (
    <motion.div
      variants={GeneralVisibleHiddenExitMotionVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
      className='flex w-full flex-col gap-2 overflow-hidden rounded-sm border border-green-600'
    >
      <h1 className='w-full bg-green-600 p-1 text-center text-xs font-bold text-primary-foreground'>NOVA META</h1>
      <div className='flex w-full flex-col gap-2 p-3'>
        <div className='flex w-full items-center justify-center'>
          <div className='w-full lg:w-[50%]'>
            <SelectInput
              label='PERÍODO'
              labelClassName='font-semibold leading-none tracking-tight text-xs'
              inputClassName='min-h-[35px] h-[35px] text-xs'
              value={infoHolder.periodo}
              options={periodOptions.map((p, index) => ({ id: index + 1, label: p, value: p }))}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, periodo: value }))}
              onReset={() => setInfoHolder((prev) => ({ ...prev, periodo: initialPeriodString }))}
              resetOptionLabel='PERÍODO ATUAL'
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full items-center gap-2'>
          <div className='w-full lg:w-[50%]'>
            <NumberInput
              label='POTÊNCIA PICO (kW)'
              labelClassName='font-semibold leading-none tracking-tight text-xs'
              inputClassName='h-[35px] text-xs'
              placeholder='Preencha aqui a meta para potência pico...'
              value={infoHolder.metas.potenciaVendida || null}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, metas: { ...prev.metas, potenciaVendida: value } }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[50%]'>
            <NumberInput
              label='VALOR VENDIDO'
              labelClassName='font-semibold leading-none tracking-tight text-xs'
              inputClassName='h-[35px] text-xs'
              placeholder='Preencha aqui a meta para valor vendido...'
              value={infoHolder.metas.valorVendido || null}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, metas: { ...prev.metas, valorVendido: value } }))}
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full items-center gap-2'>
          <div className='w-full lg:w-[50%]'>
            <NumberInput
              label='Nº DE PROJETOS VENDIDOS'
              labelClassName='font-semibold leading-none tracking-tight text-xs'
              inputClassName='h-[35px] text-xs'
              placeholder='Preencha aqui a meta para o nº de projetos vendidos...'
              value={infoHolder.metas.projetosVendidos || null}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, metas: { ...prev.metas, projetosVendidos: value } }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[50%]'>
            <NumberInput
              label='CONVERSÃO'
              labelClassName='font-semibold leading-none tracking-tight text-xs'
              inputClassName='h-[35px] text-xs'
              placeholder='Preencha aqui a meta para % de conversão...'
              value={infoHolder.metas.conversao || null}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, metas: { ...prev.metas, conversao: value } }))}
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full items-center gap-2'>
          <div className='w-full lg:w-[50%]'>
            <NumberInput
              label='PROJETOS CRIADOS'
              labelClassName='font-semibold leading-none tracking-tight text-xs'
              inputClassName='h-[35px] text-xs'
              placeholder='Preencha aqui a meta para o nº de projetos criados...'
              value={infoHolder.metas.projetosCriados || null}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, metas: { ...prev.metas, projetosCriados: value } }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[50%]'>
            <NumberInput
              label='PROJETOS ENVIADOS'
              labelClassName='font-semibold leading-none tracking-tight text-xs'
              inputClassName='h-[35px] text-xs'
              placeholder='Preencha aqui a meta para o nº de projetos enviados...'
              value={infoHolder.metas.projetosEnviados || null}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, metas: { ...prev.metas, projetosEnviados: value } }))}
              width='100%'
            />
          </div>
        </div>
      </div>
      <div className='flex w-full items-center justify-end p-3'>
        <Button
          disabled={isPending}
          onClick={() =>
            // @ts-ignore
            mutate(infoHolder)
          }
          size={'xs'}
        >
          CRIAR META
        </Button>
      </div>
    </motion.div>
  );
}

type SaleGoalCardProps = {
  goal: TSaleGoalDTO;
};
function SaleGoalCard({ goal }: SaleGoalCardProps) {
  const queryClient = useQueryClient();
  const currentYear = dayjs().get('year');
  const periodOptions = getMonthPeriodsStrings({ initialYear: currentYear - 1, endYear: currentYear + 1 });

  const [goalHolder, setGoalHolder] = useState(goal);
  const [editGoalMenuIsOpen, setEditGoalMenuIsOpen] = useState<boolean>(false);

  const { mutate, isPending } = useMutationWithFeedback({
    mutationKey: ['edit-sale-goal', goal.usuario.id],
    mutationFn: editSaleGoal,
    queryClient: queryClient,
    affectedQueryKey: ['user-sale-goals', goal.usuario.id],
    callbackFn: () => setEditGoalMenuIsOpen(false),
  });
  return (
    <div className='flex w-full flex-col gap-1 rounded-sm border border-black bg-background p-2 shadow-md dark:bg-[#121212]'>
      <div className='flex w-full items-center justify-between'>
        <div className='flex items-center gap-1'>
          <h1 className='text-sm font-bold leading-none tracking-tight'>
            META REFERENTE A <strong className='text-cyan-500'>{goal.periodo}</strong>
          </h1>
        </div>
      </div>
      <h1 className='w-full py-0.5 text-start text-[0.6rem] font-medium italic text-primary/70'>METAS DEFINIDAS</h1>
      <div className='flex w-full flex-col justify-between gap-2 lg:flex-row'>
        <div className='flex w-full items-center justify-center gap-1 lg:w-1/2 lg:justify-start'>
          <VscDiffAdded width={10} height={10} />
          <h1 className='py-0.5 text-center text-xxs font-medium italic text-primary/80 lg:text-[0.6rem]'>PROJETOS CRIADOS</h1>
          <h1 className='text-primary py-0.5 text-center text-[0.6rem] font-bold'>{goal.metas.projetosCriados || 'N/A'}</h1>
        </div>
        <div className='flex w-full flex-row items-center justify-center gap-1 lg:w-1/2 lg:flex-row-reverse lg:justify-start'>
          <BsPatchCheck width={10} height={10} />
          <h1 className='py-0.5 text-center text-xxs font-medium italic text-primary/80 lg:text-[0.6rem]'>PROJETOS VENDIDOS</h1>
          <h1 className='text-primary py-0.5 text-center text-[0.6rem] font-bold'>{goal.metas.projetosVendidos || 'N/A'}</h1>
        </div>
      </div>
      <div className='flex w-full flex-col justify-between gap-2 lg:flex-row'>
        <div className='flex w-full items-center justify-center gap-1 lg:w-1/2 lg:justify-start'>
          <FaBolt width={10} height={10} />
          <h1 className='py-0.5 text-center text-xxs font-medium italic text-primary/80 lg:text-[0.6rem]'>POTÊNCIA VENDIDA</h1>
          <h1 className='text-primary py-0.5 text-center text-[0.6rem] font-bold'>
            {goal.metas.potenciaVendida ? `${formatDecimalPlaces(goal.metas.potenciaVendida)}kWp` : 'N/A'}
          </h1>
        </div>
        <div className='flex w-full flex-row items-center justify-center gap-1 lg:w-1/2 lg:flex-row-reverse lg:justify-start'>
          <BsFileEarmarkText width={10} height={10} />
          <h1 className='py-0.5 text-center text-xxs font-medium italic text-primary/80 lg:text-[0.6rem]'>VALOR VENDIDO</h1>
          <h1 className='text-primary py-0.5 text-center text-[0.6rem] font-bold'>
            {goal.metas.valorVendido ? `${formatToMoney(goal.metas.valorVendido)}` : 'N/A'}
          </h1>
        </div>
      </div>
      <div className='flex w-full flex-col justify-between gap-2 lg:flex-row'>
        <div className='flex w-full items-center justify-center gap-1 lg:w-1/2 lg:justify-start'>
          <GrSend width={10} height={10} />
          <h1 className='py-0.5 text-center text-xxs font-medium italic text-primary/80 lg:text-[0.6rem]'>PROJETOS ENVIADOS</h1>
          <h1 className='text-primary py-0.5 text-center text-[0.6rem] font-bold'>{goal.metas.projetosEnviados || 'N/A'}</h1>
        </div>
        <div className='flex w-full flex-row items-center justify-center gap-1 lg:w-1/2 lg:flex-row-reverse lg:justify-start'>
          <FaPercentage width={10} height={10} />
          <h1 className='py-0.5 text-center text-xxs font-medium italic text-primary/80 lg:text-[0.6rem]'>CONVERSÃO</h1>
          <h1 className='text-primary py-0.5 text-center text-[0.6rem] font-bold'>
            {goal.metas.conversao ? `${formatDecimalPlaces(goal.metas.conversao)}%` : 'N/A'}
          </h1>
        </div>
      </div>
      <div className='flex w-full items-center justify-end gap-2'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            <BsCalendarPlus />
            <p className='text-primary/80 text-[0.65rem] font-medium'>{formatDateAsLocale(goal.dataInsercao, true)}</p>
          </div>
          <div className='flex items-center gap-1'>
            <Avatar width={20} height={20} url={goal.autor.avatar_url || undefined} fallback={formatNameAsInitials(goal.autor.nome)} />

            <p className='text-primary/80 text-[0.65rem] font-medium'>{goal.autor.nome}</p>
          </div>
        </div>
        <button
          onClick={() => setEditGoalMenuIsOpen((prev) => !prev)}
          className='flex items-center gap-1 rounded-lg bg-black px-2 py-1 text-[0.6rem] text-primary-foreground'
        >
          <Pencil width={10} height={10} />
          <p>EDITAR</p>
        </button>
      </div>
      <AnimatePresence>
        {editGoalMenuIsOpen ? (
          <motion.div
            variants={GeneralVisibleHiddenExitMotionVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='flex flex-col gap-2 self-center overflow-hidden rounded-sm border border-blue-600'
          >
            <h1 className='w-full bg-blue-600 p-1 text-center text-xs font-bold text-primary-foreground'>NOVA META</h1>
            <div className='flex w-full flex-col gap-2 p-3'>
              <div className='flex w-full items-center justify-center'>
                <div className='w-full lg:w-[50%]'>
                  <SelectInput
                    label='PERÍODO'
                    labelClassName='font-semibold leading-none tracking-tight text-xs'
                    inputClassName='min-h-[35px] h-[35px] text-xs'
                    value={goalHolder.periodo}
                    options={periodOptions.map((p, index) => ({ id: index + 1, label: p, value: p }))}
                    handleChange={(value) => setGoalHolder((prev) => ({ ...prev, periodo: value }))}
                    onReset={() => setGoalHolder((prev) => ({ ...prev, periodo: goal.periodo }))}
                    resetOptionLabel='PERÍODO ATUAL'
                    width='100%'
                  />
                </div>
              </div>
              <div className='flex w-full items-center gap-2'>
                <div className='w-full lg:w-[50%]'>
                  <NumberInput
                    label='POTÊNCIA PICO (kW)'
                    labelClassName='font-semibold leading-none tracking-tight text-xs'
                    inputClassName='h-[35px] text-xs'
                    placeholder='Preencha aqui a meta para potência pico...'
                    value={goalHolder.metas.potenciaVendida || null}
                    handleChange={(value) => setGoalHolder((prev) => ({ ...prev, metas: { ...prev.metas, potenciaVendida: value } }))}
                    width='100%'
                  />
                </div>
                <div className='w-full lg:w-[50%]'>
                  <NumberInput
                    label='VALOR VENDIDO'
                    labelClassName='font-semibold leading-none tracking-tight text-xs'
                    inputClassName='h-[35px] text-xs'
                    placeholder='Preencha aqui a meta para valor vendido...'
                    value={goalHolder.metas.valorVendido || null}
                    handleChange={(value) => setGoalHolder((prev) => ({ ...prev, metas: { ...prev.metas, valorVendido: value } }))}
                    width='100%'
                  />
                </div>
              </div>
              <div className='flex w-full items-center gap-2'>
                <div className='w-full lg:w-[50%]'>
                  <NumberInput
                    label='Nº DE PROJETOS VENDIDOS'
                    labelClassName='font-semibold leading-none tracking-tight text-xs'
                    inputClassName='h-[35px] text-xs'
                    placeholder='Preencha aqui a meta para o nº de projetos vendidos...'
                    value={goalHolder.metas.projetosVendidos || null}
                    handleChange={(value) => setGoalHolder((prev) => ({ ...prev, metas: { ...prev.metas, projetosVendidos: value } }))}
                    width='100%'
                  />
                </div>
                <div className='w-full lg:w-[50%]'>
                  <NumberInput
                    label='CONVERSÃO'
                    labelClassName='font-semibold leading-none tracking-tight text-xs'
                    inputClassName='h-[35px] text-xs'
                    placeholder='Preencha aqui a meta para % de conversão...'
                    value={goalHolder.metas.conversao || null}
                    handleChange={(value) => setGoalHolder((prev) => ({ ...prev, metas: { ...prev.metas, conversao: value } }))}
                    width='100%'
                  />
                </div>
              </div>
              <div className='flex w-full items-center gap-2'>
                <div className='w-full lg:w-[50%]'>
                  <NumberInput
                    label='PROJETOS CRIADOS'
                    labelClassName='font-semibold leading-none tracking-tight text-xs'
                    inputClassName='h-[35px] text-xs'
                    placeholder='Preencha aqui a meta para o nº de projetos criados...'
                    value={goalHolder.metas.projetosCriados || null}
                    handleChange={(value) => setGoalHolder((prev) => ({ ...prev, metas: { ...prev.metas, projetosCriados: value } }))}
                    width='100%'
                  />
                </div>
                <div className='w-full lg:w-[50%]'>
                  <NumberInput
                    label='PROJETOS ENVIADOS'
                    labelClassName='font-semibold leading-none tracking-tight text-xs'
                    inputClassName='h-[35px] text-xs'
                    placeholder='Preencha aqui a meta para o nº de projetos enviados...'
                    value={goalHolder.metas.projetosEnviados || null}
                    handleChange={(value) => setGoalHolder((prev) => ({ ...prev, metas: { ...prev.metas, projetosEnviados: value } }))}
                    width='100%'
                  />
                </div>
              </div>
            </div>
            <div className='flex w-full items-center justify-end p-3'>
              <Button variant={'ghost'} onClick={() => setEditGoalMenuIsOpen(false)}>
                FECHAR
              </Button>
              <Button
                className='bg-blue-600 hover:bg-blue-500'
                disabled={isPending}
                onClick={() =>
                  // @ts-ignore
                  mutate({ id: goal._id, changes: goalHolder })
                }
                size={'xs'}
              >
                ATUALIZAR META
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
