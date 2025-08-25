import { useState } from 'react';

import MultipleSelectInput from '../Inputs/MultipleSelectInput';
import TextInput from '../Inputs/TextInput';

import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants';
import StatesAndCities from '@/utils/json-files/cities.json';
import { useAcquisitionChannels } from '@/utils/queries/utils';
import { AnimatePresence, motion } from 'framer-motion';

import type { TUserSession } from '@/lib/auth/session';
import { formatToPhone } from '@/utils/methods';
import type { TPersonalizedClientsFilter } from '@/utils/schemas/client.schema';
import type { TPartnerSimplifiedDTO } from '@/utils/schemas/partner.schema';
import type { TUserDTO } from '@/utils/schemas/user.schema';
import MultipleSelectInputVirtualized from '../Inputs/MultipleSelectInputVirtualized';
const AllCities = StatesAndCities.flatMap((s) => s.cidades).map((c, index) => ({ id: index + 1, label: c, value: c }));

type FilterMenuProps = {
  updateFilters: (filters: TPersonalizedClientsFilter) => void;
  selectedAuthors: string[] | null;
  setAuthors: (authors: string[] | null) => void;
  selectedPartners: string[] | null;
  setPartners: (partners: string[] | null) => void;
  authorsOptions?: TUserDTO[];
  partnersOptions?: TPartnerSimplifiedDTO[];
  session: TUserSession;
  queryLoading: boolean;
  resetSelectedPage: () => void;
};
function FilterMenu({
  updateFilters,
  selectedAuthors,
  setAuthors,
  selectedPartners,
  setPartners,
  authorsOptions,
  partnersOptions,
  session,
  queryLoading,
  resetSelectedPage,
}: FilterMenuProps) {
  const userPartnerScope = session.user.permissoes.parceiros.escopo;
  const userClientsScope = session.user.permissoes.clientes.escopo;

  const authorSelectableOptions = authorsOptions
    ? userClientsScope
      ? authorsOptions.filter((a) => userClientsScope.includes(a._id))
      : authorsOptions
    : [];
  const partnersSelectableOptions = partnersOptions
    ? userPartnerScope
      ? partnersOptions.filter((a) => userPartnerScope.includes(a._id))
      : partnersOptions
    : [];

  const { data: acquisitionChannels } = useAcquisitionChannels();
  const [filtersHolder, setFiltersHolder] = useState<TPersonalizedClientsFilter>({
    name: '',
    phone: '',
    city: [],
    acquisitionChannel: [],
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
            label='PESQUISA'
            value={filtersHolder.name}
            handleChange={(value) => {
              setFiltersHolder((prev) => ({ ...prev, name: value }));
            }}
            placeholder='Filtre pelo nome do cliente...'
            labelClassName='text-xs font-medium tracking-tight text-primary'
          />
          <TextInput
            label='TELEFONE'
            value={filtersHolder.phone}
            handleChange={(value) => {
              setFiltersHolder((prev) => ({ ...prev, phone: formatToPhone(value) }));
            }}
            placeholder='Filtre pelo telefone do cliente...'
            labelClassName='text-xs font-medium tracking-tight text-primary'
          />
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
          <div className='w-full lg:w-[200px]'>
            <MultipleSelectInput
              label='CANAL DE AQUISIÇÃO'
              selected={filtersHolder.acquisitionChannel}
              options={
                acquisitionChannels?.map((acquisitionChannel) => ({
                  id: acquisitionChannel._id,
                  label: acquisitionChannel.valor,
                  value: acquisitionChannel.valor,
                })) || null
              }
              resetOptionLabel='NÃO DEFINIDO'
              handleChange={(value) => {
                setFiltersHolder((prev) => ({
                  ...prev,
                  acquisitionChannel: value as string[],
                }));
              }}
              onReset={() => {
                setFiltersHolder((prev) => ({
                  ...prev,
                  acquisitionChannel: [],
                }));
              }}
              width='100%'
              labelClassName='text-xs font-medium tracking-tight text-primary'
            />
          </div>
          <div className='w-full md:w-[250px]'>
            <MultipleSelectInput
              label='AUTORES'
              options={authorSelectableOptions?.map((promoter) => ({ id: promoter._id || '', label: promoter.nome, value: promoter._id })) || null}
              selected={selectedAuthors}
              handleChange={(value) => setAuthors(value as string[])}
              resetOptionLabel='TODOS'
              onReset={() => setAuthors(null)}
              labelClassName='text-xs font-medium tracking-tight text-primary'
              width='100%'
            />
          </div>
          <div className='w-full md:w-[250px]'>
            <MultipleSelectInput
              label='PARCEIROS'
              options={partnersSelectableOptions?.map((promoter) => ({ id: promoter._id || '', label: promoter.nome, value: promoter._id })) || null}
              selected={selectedPartners}
              handleChange={(value) => setPartners(value as string[])}
              resetOptionLabel='TODOS'
              onReset={() => setPartners(null)}
              labelClassName='text-xs font-medium tracking-tight text-primary'
              width='100%'
            />
          </div>
        </div>
        <div className='flex w-full flex-col flex-wrap items-center justify-end gap-2 lg:flex-row'>
          <button
            type='button'
            disabled={queryLoading}
            onClick={() => {
              resetSelectedPage();
              updateFilters(filtersHolder);
            }}
            className='h-9 whitespace-nowrap rounded-sm bg-blue-600 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-blue-700 enabled:hover:text-primary-foreground'
          >
            PESQUISAR
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default FilterMenu;
