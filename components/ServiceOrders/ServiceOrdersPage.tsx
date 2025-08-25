'use client';
import type { TUserSession } from '@/lib/auth/session';
import { useServiceOrdersByFilters } from '@/utils/queries/service-orders';
import { useState } from 'react';
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from 'react-icons/io';

import ServiceOrder from '@/app/components/Cards/ServiceOrder';
import EditServiceOrder from '@/app/components/Modals/ServiceOrders/EditServiceOrder';
import NewServiceOrder from '@/app/components/Modals/ServiceOrders/NewServiceOrder';
import { Sidebar } from '@/app/components/Sidebar';
import ErrorComponent from '../utils/ErrorComponent';
import GeneralQueryPaginationMenu from '../utils/GeneralQueryPaginationMenu';
import LoadingComponent from '../utils/LoadingComponent';
import ServiceOrdersFilterMenu from './FilterMenu';

type ServiceOrdersPageProps = {
  session: TUserSession;
};
function ServiceOrdersPage({ session }: ServiceOrdersPageProps) {
  const userPartnersScope = session.user.permissoes.parceiros.escopo;
  const [filterMenuIsOpen, setFilterMenuIsOpen] = useState<boolean>(false);

  const [newServiceOrderModalIsOpen, setNewServiceOrderModalIsOpen] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });

  const [page, setPage] = useState<number>(1);
  const [partners, setPartners] = useState<string[] | null>(userPartnersScope || null);

  const { data, isLoading, isError, isSuccess, updateFilters } = useServiceOrdersByFilters({ page, partners });

  const serviceOrders = data?.serviceOrders;
  const serviceOrdersMatched = data?.serviceOrdersMatched;
  const totalPages = data?.totalPages;
  return (
    <div className='flex h-full flex-col md:flex-row'>
      <Sidebar session={session} />
      <div className='flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6'>
        <div className='flex w-full flex-col gap-2 border-b border-black pb-2'>
          <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
            <div className='flex items-center gap-1'>
              {filterMenuIsOpen ? (
                <div className='cursor-pointer text-primary/60 hover:text-blue-400'>
                  <IoMdArrowDropupCircle style={{ fontSize: '25px' }} onClick={() => setFilterMenuIsOpen(false)} />
                </div>
              ) : (
                <div className='cursor-pointer text-primary/60 hover:text-blue-400'>
                  <IoMdArrowDropdownCircle style={{ fontSize: '25px' }} onClick={() => setFilterMenuIsOpen(true)} />
                </div>
              )}
              <div className='flex flex-col gap-1'>
                <h1 className='text-xl font-black leading-none tracking-tight md:text-2xl'>CONTROLE DE ORDENS DE SERVIÇO</h1>
              </div>
            </div>
            <button
              onClick={() => setNewServiceOrderModalIsOpen(true)}
              className='h-9 whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground'
            >
              CRIAR ORDEM DE SERVIÇO
            </button>
          </div>
          {filterMenuIsOpen ? (
            <ServiceOrdersFilterMenu queryLoading={isLoading} resetSelectedPage={() => setPage(1)} updateFilters={updateFilters} />
          ) : null}
        </div>
        <GeneralQueryPaginationMenu
          activePage={page}
          selectPage={(x) => setPage(x)}
          totalPages={totalPages || 0}
          queryLoading={isLoading}
          itemsMatched={serviceOrdersMatched}
          itemsShowing={serviceOrders?.length}
        />
        <div className='flex flex-col justify-between gap-2 py-2'>
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent msg={'Erro ao buscar ordens de serviço.'} /> : null}
          {isSuccess && serviceOrders
            ? serviceOrders.map((serviceOrder) => (
                <ServiceOrder key={serviceOrder._id} serviceOrder={serviceOrder} handleClick={(id) => setEditModal({ id, isOpen: true })} />
              ))
            : null}
        </div>
      </div>
      {newServiceOrderModalIsOpen ? <NewServiceOrder session={session} closeModal={() => setNewServiceOrderModalIsOpen(false)} /> : null}
      {editModal.isOpen && editModal.id ? (
        <EditServiceOrder session={session} orderId={editModal.id} closeModal={() => setEditModal({ id: null, isOpen: false })} />
      ) : null}
    </div>
  );
}

export default ServiceOrdersPage;
