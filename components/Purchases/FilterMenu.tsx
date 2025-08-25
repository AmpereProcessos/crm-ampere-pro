import type { TUserSession } from '@/lib/auth/session';
import { formatDateOnInputChange } from '@/lib/methods/formatting';
import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants';
import StatesAndCities from '@/utils/json-files/cities.json';
import { formatDateForInputValue } from '@/utils/methods';
import { TPartnerSimplifiedDTO } from '@/utils/schemas/partner.schema';
import { TPersonalizedPurchaseFilters } from '@/utils/schemas/purchase.schema';
import { PurchaseDeliveryStatus, PurchaseStatus } from '@/utils/select-options';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import CheckboxInput from '../Inputs/CheckboxInput';
import DateInput from '../Inputs/DateInput';
import MultipleSelectInput from '../Inputs/MultipleSelectInput';
import MultipleSelectInputVirtualized from '../Inputs/MultipleSelectInputVirtualized';
import SelectInput from '../Inputs/SelectInput';
import TextInput from '../Inputs/TextInput';

const AllCities = StatesAndCities.flatMap((s) => s.cidades).map((c, index) => ({ id: index + 1, label: c, value: c }));
const AllStates = StatesAndCities.map((e) => e.sigla).map((c, index) => ({ id: index + 1, label: c, value: c }));
type PurchasesFilterMenuProps = {
  updateFilters: (filters: TPersonalizedPurchaseFilters) => void;
  selectedPartners: string[] | null;
  setSelectedPartners: (partners: string[] | null) => void;
  partnersOptions?: TPartnerSimplifiedDTO[];
  session: TUserSession;
  queryLoading: boolean;
  resetSelectedPage: () => void;
};
function PurchasesFilterMenu({
  updateFilters,
  selectedPartners,
  setSelectedPartners,
  partnersOptions,
  session,
  queryLoading,
  resetSelectedPage,
}: PurchasesFilterMenuProps) {
  const userPartnerScope = session.user.permissoes.parceiros.escopo;
  const partnersSelectableOptions = partnersOptions
    ? userPartnerScope
      ? partnersOptions.filter((a) => userPartnerScope.includes(a._id))
      : partnersOptions
    : [];
  const [filtersHolder, setFiltersHolder] = useState<TPersonalizedPurchaseFilters>({
    title: '',
    status: [],
    state: [],
    city: [],
    pendingOrder: false,
    pendingInvoicing: false,
    pendingDelivery: false,
    deliveryStatus: [],
    period: { after: null, before: null, field: null },
    pendingConclusion: false,
  });
  return (
    <AnimatePresence>
      <motion.div
        key={'editor'}
        variants={GeneralVisibleHiddenExitMotionVariants}
        initial='hidden'
        animate='visible'
        exit='exit'
        className='mt-2 flex w-full flex-col gap-2 rounded-md border border-primary/30 bg-background p-2'
      >
        <h1 className='text-sm font-bold tracking-tight'>FILTROS</h1>
        <div className='flex w-full flex-col flex-wrap items-center justify-start gap-2 lg:flex-row'>
          <TextInput
            label='TÍTULO DO REGISTRO'
            placeholder='Filtre pelo título da compra...'
            value={filtersHolder.title}
            handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, title: value }))}
            labelClassName='text-xs font-medium tracking-tight text-primary'
          />
          <MultipleSelectInput
            label={'STATUS'}
            resetOptionLabel={'NÃO DEFINIDO'}
            selected={filtersHolder.status}
            options={PurchaseStatus}
            handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, status: value as string[] }))}
            onReset={() => setFiltersHolder((prev) => ({ ...prev, status: [] }))}
            labelClassName='text-xs font-medium tracking-tight text-primary'
          />
          <div className='w-full lg:w-[200px]'>
            <MultipleSelectInputVirtualized
              label='ESTADO'
              selected={filtersHolder.state}
              options={AllStates}
              resetOptionLabel='NÃO DEFINIDO'
              handleChange={(value) => {
                setFiltersHolder((prev) => ({
                  ...prev,
                  state: value as string[],
                }));
              }}
              onReset={() => {
                setFiltersHolder((prev) => ({
                  ...prev,
                  state: [],
                }));
              }}
              width='100%'
              labelClassName='text-xs font-medium tracking-tight text-primary'
            />
          </div>
          <div className='w-full lg:w-[200px]'>
            <MultipleSelectInputVirtualized
              label='CIDADE'
              selected={filtersHolder.city}
              options={AllCities}
              resetOptionLabel='NÃO DEFINIDO'
              handleChange={(value) => {
                setFiltersHolder((prev) => ({
                  ...prev,
                  city: value as string[],
                }));
              }}
              onReset={() => {
                setFiltersHolder((prev) => ({
                  ...prev,
                  city: [],
                }));
              }}
              width='100%'
              labelClassName='text-xs font-medium tracking-tight text-primary'
            />
          </div>
          <MultipleSelectInput
            label={'STATUS DA ENTREGA'}
            resetOptionLabel={'NÃO DEFINIDO'}
            selected={filtersHolder.deliveryStatus}
            options={PurchaseDeliveryStatus}
            handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, deliveryStatus: value as string[] }))}
            onReset={() => setFiltersHolder((prev) => ({ ...prev, deliveryStatus: [] }))}
            labelClassName='text-xs font-medium tracking-tight text-primary'
          />
          <div className='flex w-full flex-col gap-2 lg:w-fit lg:flex-row'>
            <div className='flex items-center justify-center gap-x-2'>
              <div className='w-full lg:w-[250px]'>
                <DateInput
                  width={'100%'}
                  label={'DEPOIS DE'}
                  value={filtersHolder.period.after ? formatDateForInputValue(filtersHolder.period.after) : undefined}
                  handleChange={(value) =>
                    setFiltersHolder((prev) => ({ ...prev, period: { ...prev.period, after: formatDateOnInputChange(value) } }))
                  }
                  labelClassName='text-xs font-medium tracking-tight text-primary'
                />
              </div>
              <div className='w-full lg:w-[250px]'>
                <DateInput
                  width={'100%'}
                  label={'ANTES DE'}
                  value={filtersHolder.period.before ? formatDateForInputValue(filtersHolder.period.before) : undefined}
                  handleChange={(value) =>
                    setFiltersHolder((prev) => ({ ...prev, period: { ...prev.period, before: formatDateOnInputChange(value) } }))
                  }
                  labelClassName='text-xs font-medium tracking-tight text-primary'
                />
              </div>
            </div>
            <div className='w-full lg:w-[250px]'>
              <SelectInput
                width={'100%'}
                label={'CAMPO DE FILTRO'}
                value={filtersHolder.period.field}
                options={[
                  { id: 1, label: 'DATA DE LIBERAÇÃO', value: 'liberacao.data' },
                  { id: 2, label: 'DATA DO PEDIDO', value: 'pedido.data' },
                  { id: 3, label: 'DATA DE FATURAMENTO', value: 'faturamento.data' },
                  { id: 4, label: 'PREVISÃO DE ENTREGA', value: 'entrega.previsao' },
                  { id: 5, label: 'EFETIVAÇÃO DE ENTREGA', value: 'entrega.efetivacao' },
                ]}
                resetOptionLabel={'SEM FILTRO'}
                handleChange={(value) =>
                  setFiltersHolder((prev) => ({
                    ...prev,
                    period: {
                      ...prev.period,
                      field: value,
                    },
                  }))
                }
                onReset={() =>
                  setFiltersHolder((prev) => ({
                    ...prev,
                    period: {
                      ...prev.period,
                      field: null,
                    },
                  }))
                }
                labelClassName='text-xs font-medium tracking-tight text-primary'
              />
            </div>
          </div>
          <div className='w-full md:w-[250px]'>
            <MultipleSelectInput
              label='PARCEIROS'
              options={partnersSelectableOptions?.map((promoter) => ({ id: promoter._id || '', label: promoter.nome, value: promoter._id })) || null}
              selected={selectedPartners}
              handleChange={(value) => setSelectedPartners(value as string[])}
              resetOptionLabel='TODOS'
              onReset={() => setSelectedPartners(null)}
              labelClassName='text-xs font-medium tracking-tight text-primary'
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full flex-col flex-wrap items-center justify-between gap-2 lg:flex-row'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='w-fit'>
              <CheckboxInput
                labelFalse='SOMENTE NÃO CONCLUÍDOS'
                labelTrue='SOMENTE NÃO CONCLUÍDOS'
                checked={filtersHolder.pendingConclusion}
                handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, pendingConclusion: value }))}
              />
            </div>
            <div className='w-fit'>
              <CheckboxInput
                labelFalse='SOMENTE PEDIDOS PENDENTES'
                labelTrue='SOMENTE PEDIDOS PENDENTES'
                checked={filtersHolder.pendingOrder}
                handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, pendingOrder: value }))}
              />
            </div>
            <div className='w-fit'>
              <CheckboxInput
                labelFalse='SOMENTE FATURAMENTOS PENDENTES'
                labelTrue='SOMENTE FATURAMENTOS PENDENTES'
                checked={filtersHolder.pendingInvoicing}
                handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, pendingInvoicing: value }))}
              />
            </div>
            <div className='w-fit'>
              <CheckboxInput
                labelFalse='SOMENTE ENTREGAS PENDENTES'
                labelTrue='SOMENTE ENTREGAS PENDENTES'
                checked={filtersHolder.pendingDelivery}
                handleChange={(value) => setFiltersHolder((prev) => ({ ...prev, pendingDelivery: value }))}
              />
            </div>
          </div>
          <button
            disabled={queryLoading}
            onClick={() => {
              resetSelectedPage();
              updateFilters(filtersHolder);
            }}
            className='h-9 whitespace-nowrap rounded-sm bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:bg-primary/50 disabled:text-white enabled:hover:bg-blue-700 enabled:hover:text-white'
          >
            PESQUISAR
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PurchasesFilterMenu;
