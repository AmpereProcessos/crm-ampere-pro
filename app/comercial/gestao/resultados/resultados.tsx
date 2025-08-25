'use client';
import dayjs from 'dayjs';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Sidebar } from '@/components/Sidebar';

import { BsDownload } from 'react-icons/bs';

import DateInput from '@/components/Inputs/DateInput';
import MultipleSelectInput from '@/components/Inputs/MultipleSelectInput';
import EditPromoter from '@/components/Modals/EditPromoter';
import InProgressResults from '@/components/Stats/Results/InProgress';
import OverallResults from '@/components/Stats/Results/Overall';
import SalesTeamResults from '@/components/Stats/Results/SalesTeam';
import SDRTeamResults from '@/components/Stats/Results/SDRTeam';

import { getErrorMessage } from '@/lib/methods/errors';
import { getExcelFromJSON } from '@/lib/methods/excel-utils';
import { formatDateOnInputChange } from '@/lib/methods/formatting';

import RegionResults from '@/components/Stats/Results/Region';
import Sellers from '@/components/Stats/Results/Sellers';
import type { TUserSession } from '@/lib/auth/session';
import { formatDateForInputValue, getFirstDayOfMonth, getLastDayOfMonth } from '@/utils/methods';
import { useComercialResultsQueryOptions } from '@/utils/queries/stats';
import { fetchResultsExports } from '@/utils/queries/stats/exports';
import type { TUserDTOWithSaleGoals } from '@/utils/schemas/user.schema';

const currentDate = new Date();
const periodStr = dayjs(currentDate).format('MM/YYYY');
const firstDayOfMonth = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()).toISOString();
const lastDayOfMonth = getLastDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()).toISOString();

type TQueryFilters = {
  period: { after: string; before: string };
  responsibles: string[] | null;
  partners: string[] | null;
  projectTypes: string[] | null;
};

type ComercialResultsProps = {
  session: TUserSession;
};
function ManagementComercialResults({ session }: ComercialResultsProps) {
  console.log('TRIGGER');
  const [queryFilters, setQueryFilters] = useState<TQueryFilters>({
    period: { after: firstDayOfMonth, before: lastDayOfMonth },
    responsibles: null,
    partners: null,
    projectTypes: null,
  });

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    promoter: TUserDTOWithSaleGoals | null;
  }>({
    isOpen: false,
    promoter: null,
  });
  const { data: queryOptions, isSuccess: queryOptionsSuccess } = useComercialResultsQueryOptions();
  async function handleDataExport() {
    const loadingToastId = toast.loading('Carregando...');
    try {
      const results = await fetchResultsExports({
        after: queryFilters.period.after,
        before: queryFilters.period.before,
        responsibles: queryFilters.responsibles,
        partners: queryFilters.partners,
        projectTypes: queryFilters.projectTypes,
      });
      getExcelFromJSON(results, 'RESULTADOS_COMERCIAIS');
      toast.dismiss(loadingToastId);
      return toast.success('Exportação feita com sucesso !');
    } catch (error) {
      console.log(error);
      toast.dismiss(loadingToastId);
      const msg = getErrorMessage(error);
      return toast.error(msg);
    }
  }

  return (
    <div className='flex h-full flex-col md:flex-row'>
      <Sidebar session={session} />
      <div className='flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6'>
        <h1 className='text-center font-Raleway text-xl font-black text-primary lg:text-start lg:text-2xl'>ACOMPANHAMENTO DE RESULTADOS</h1>
        <div className='flex items-center gap-2 flex-col lg:flex-row w-full justify-end'>
          <div className='flex flex-col items-center gap-y-2 gap-4 lg:flex-row w-full lg:w-fit'>
            <h1 className='text-end text-sm font-medium uppercase tracking-tight'>PERÍODO</h1>
            <div className='flex w-full flex-col items-center gap-2 md:flex-row lg:w-fit'>
              <div className='w-full md:w-[150px]'>
                <DateInput
                  showLabel={false}
                  label='PERÍODO'
                  labelClassName='text-[0.6rem]'
                  holderClassName='text-xs p-2 min-h-[34px]'
                  value={formatDateForInputValue(queryFilters.period.after)}
                  handleChange={(value) =>
                    setQueryFilters((prev) => ({
                      ...prev,
                      period: {
                        ...prev.period,
                        after: (formatDateOnInputChange(value) || firstDayOfMonth) as string,
                      },
                    }))
                  }
                  width='100%'
                />
              </div>
              <div className='w-full md:w-[150px]'>
                <DateInput
                  showLabel={false}
                  label='PERÍODO'
                  labelClassName='text-[0.6rem]'
                  holderClassName='text-xs p-2 min-h-[34px]'
                  value={formatDateForInputValue(queryFilters.period.before)}
                  handleChange={(value) =>
                    setQueryFilters((prev) => ({
                      ...prev,
                      period: {
                        ...prev.period,
                        before: (formatDateOnInputChange(value) || lastDayOfMonth) as string,
                      },
                    }))
                  }
                  width='100%'
                />
              </div>
            </div>
          </div>
          <div className='w-full md:w-[250px]'>
            <MultipleSelectInput
              label='USUÁRIOS'
              labelClassName='text-[0.6rem]'
              holderClassName='text-xs p-2 min-h-[34px]'
              showLabel={false}
              options={
                queryOptions?.salePromoters?.map((promoter) => ({
                  id: promoter._id || '',
                  label: promoter.nome,
                  value: promoter._id,
                })) || null
              }
              selected={queryFilters.responsibles}
              handleChange={(value) =>
                setQueryFilters((prev) => ({
                  ...prev,
                  responsibles: value as string[],
                }))
              }
              resetOptionLabel='TODOS'
              onReset={() => setQueryFilters((prev) => ({ ...prev, responsibles: null }))}
              width='100%'
            />
          </div>
          <div className='w-full md:w-[250px]'>
            <MultipleSelectInput
              label='PARCEIROS'
              labelClassName='text-[0.6rem]'
              holderClassName='text-xs p-2 min-h-[34px]'
              showLabel={false}
              options={
                queryOptions?.partners?.map((partner) => ({
                  id: partner._id || '',
                  label: partner.nome,
                  value: partner._id,
                })) || null
              }
              selected={queryFilters.partners}
              handleChange={(value) =>
                setQueryFilters((prev) => ({
                  ...prev,
                  partners: value as string[],
                }))
              }
              resetOptionLabel='TODOS'
              onReset={() => setQueryFilters((prev) => ({ ...prev, partners: null }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[300px]'>
            <MultipleSelectInput
              resetOptionLabel='TODOS OS PROJETOS'
              selected={queryFilters.projectTypes}
              options={
                queryOptions?.projectTypes?.map((resp) => ({
                  id: resp._id || '',
                  label: resp.nome || '',
                  value: resp._id || '',
                })) || null
              }
              handleChange={(value) =>
                setQueryFilters((prev) => ({
                  ...prev,
                  projectTypes: value as string[],
                }))
              }
              onReset={() => setQueryFilters((prev) => ({ ...prev, projectTypes: null }))}
              showLabel={false}
              label='TIPOS DE PROJETO'
              labelClassName='text-[0.6rem]'
              holderClassName='text-xs p-2 min-h-[34px]'
              width='100%'
            />
          </div>
          <button
            type='button'
            onClick={() => handleDataExport()}
            className='flex w-full lg:w-fit min-h-[34px] items-center justify-center gap-2 rounded-md border bg-[#2c6e49] p-2 px-3 text-sm font-medium text-white shadow-md duration-300 ease-in-out hover:scale-[1.02]'
          >
            <BsDownload className='w-3.5 h-3.5' />
          </button>
        </div>
        <OverallResults
          after={queryFilters.period.after}
          before={queryFilters.period.before}
          responsibles={queryFilters.responsibles}
          partners={queryFilters.partners}
          projectTypes={queryFilters.projectTypes}
        />
        <InProgressResults
          after={queryFilters.period.after}
          before={queryFilters.period.before}
          responsibles={queryFilters.responsibles}
          partners={queryFilters.partners}
          projectTypes={queryFilters.projectTypes}
        />
        <SalesTeamResults
          after={queryFilters.period.after}
          before={queryFilters.period.before}
          responsibles={queryFilters.responsibles}
          promoters={queryOptions?.salePromoters}
          partners={queryFilters.partners}
          projectTypes={queryFilters.projectTypes}
        />
        <SDRTeamResults
          after={queryFilters.period.after}
          before={queryFilters.period.before}
          responsibles={queryFilters.responsibles}
          promoters={queryOptions?.salePromoters}
          partners={queryFilters.partners}
          projectTypes={queryFilters.projectTypes}
        />
        <Sellers session={session} after={queryFilters.period.after} before={queryFilters.period.before} />

        <RegionResults
          after={queryFilters.period.after}
          before={queryFilters.period.before}
          responsibles={queryFilters.responsibles}
          partners={queryFilters.partners}
          projectTypes={queryFilters.projectTypes}
        />
      </div>
      {editModal.isOpen && editModal.promoter ? (
        <EditPromoter session={session} promoter={editModal.promoter} closeModal={() => setEditModal({ isOpen: false, promoter: null })} />
      ) : null}
    </div>
  );
}

export default ManagementComercialResults;
