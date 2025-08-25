'use client';
import CheckboxWithDate from '@/components/Inputs/CheckboxWithDate';
import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import type { TUserSession } from '@/lib/auth/session';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { editServiceOrder } from '@/utils/mutations/service-orders';
import { useServiceOrderById } from '@/utils/queries/service-orders';
import { TServiceOrder, TServiceOrderWithProjectAndAnalysis, TServiceOrderWithProjectAndAnalysisDTO } from '@/utils/schemas/service-order.schema';
import * as Dialog from '@radix-ui/react-dialog';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { VscChromeClose } from 'react-icons/vsc';
import FavoredInformationBlock from './Blocks/FavoredInformationBlock';
import GeneralInformationBlock from './Blocks/GeneralInformationBlock';
import LocationInformationBlock from './Blocks/LocationInformationBlock';
import MaterialsInformationBlock from './Blocks/MaterialsInformationBlock';
import PeriodInformationBlock from './Blocks/PeriodInformationBlock';
import ProjectInformationBlock from './Blocks/ProjectInformationBlock';
import ReportInformationBlock from './Blocks/ReportInformationBlock';
import ResponsibleInformationBlock from './Blocks/ResponsibleInformationBlock';
import TechnicalAnalysisBlock from './Blocks/TechnicalAnalysisBlock';

type EditServiceOrderProps = {
  orderId: string;
  session: TUserSession;
  closeModal: () => void;
};

function EditServiceOrder({ orderId, session, closeModal }: EditServiceOrderProps) {
  const queryClient = useQueryClient();
  const { data: order, isLoading, isError, isSuccess } = useServiceOrderById({ id: orderId });
  const [infoHolder, setInfoHolder] = useState<TServiceOrderWithProjectAndAnalysisDTO>({
    _id: 'id-holder',
    idParceiro: '',
    categoria: 'OUTROS',
    descricao: '',
    urgencia: 'URGENTE',
    favorecido: {
      nome: '',
      contato: '',
    },
    projeto: {},
    responsaveis: [],
    observacoes: [],
    localizacao: {
      cep: '',
      uf: '',
      cidade: '',
      bairro: '',
      endereco: '',
      numeroOuIdentificador: '',
    },
    periodo: {},
    registros: [],
    materiais: {
      disponiveis: [],
      retiraveis: [],
    },
    anotacoes: '',
    relatorio: {
      aplicavel: false,
      secoes: [],
    },
    autor: {
      id: session.user.id,
      nome: session.user.nome,
      avatar_url: session.user.avatar_url,
    },

    dataInsercao: new Date().toISOString(),
  });

  const { mutate: handleEditServiceOrder, isPending } = useMutationWithFeedback({
    mutationKey: ['edit-service-order', orderId],
    mutationFn: editServiceOrder,
    queryClient: queryClient,
    affectedQueryKey: ['service-orders-by-personalized-filters'],
  });

  useEffect(() => {
    if (order) {
      setInfoHolder(order);
    }
  }, [order]);

  return (
    <Dialog.Root open onOpenChange={closeModal}>
      <Dialog.Overlay className='fixed inset-0 z-100 bg-[rgba(0,0,0,.85)] backdrop-blur-xs' />
      <Dialog.Content className='fixed left-[50%] top-[50%] z-100 h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px] lg:w-[70%]'>
        <div className='flex h-full flex-col'>
          <div className='flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row'>
            <h3 className='text-xl font-bold text-primary  '>EDITAR ORDEM DE SERVIÇO</h3>
            <Dialog.Close asChild>
              <button
                type='button'
                className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
              >
                <VscChromeClose style={{ color: 'red' }} />
              </button>
            </Dialog.Close>
          </div>
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent /> : null}
          {isSuccess ? (
            <>
              <div className='flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
                <div className='my-4 flex w-full items-center justify-center'>
                  <div className='w-fit'>
                    <CheckboxWithDate
                      labelFalse='ORDEM DE SERVIÇO CONCLUÍDA'
                      labelTrue='ORDEM DE SERVIÇO CONCLUÍDA'
                      date={infoHolder.dataEfetivacao || null}
                      handleChange={(value) => setInfoHolder((prev) => ({ ...prev, dataEfetivacao: value }))}
                    />
                  </div>
                </div>
                <GeneralInformationBlock
                  infoHolder={infoHolder}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TServiceOrder>>}
                />
                <FavoredInformationBlock
                  infoHolder={infoHolder}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TServiceOrder>>}
                />
                <ProjectInformationBlock
                  orderId={orderId}
                  infoHolder={infoHolder}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TServiceOrder>>}
                  session={session}
                />
                <TechnicalAnalysisBlock analysis={infoHolder.analiseTecnicaDados} />
                <ResponsibleInformationBlock
                  infoHolder={infoHolder}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TServiceOrder>>}
                />
                <LocationInformationBlock
                  infoHolder={infoHolder}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TServiceOrder>>}
                />
                <MaterialsInformationBlock
                  infoHolder={infoHolder}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TServiceOrder>>}
                />
                <PeriodInformationBlock
                  infoHolder={infoHolder}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TServiceOrder>>}
                  session={session}
                />
                <ReportInformationBlock
                  orderId={orderId}
                  infoHolder={infoHolder}
                  setInfoHolder={setInfoHolder as React.Dispatch<React.SetStateAction<TServiceOrderWithProjectAndAnalysis>>}
                />
              </div>
              <div className='flex w-full items-center justify-end p-2'>
                <button
                  disabled={isPending}
                  onClick={() => {
                    // @ts-ignore
                    handleEditServiceOrder({ id: orderId, changes: infoHolder });
                  }}
                  className='h-9 whitespace-nowrap rounded-sm bg-blue-700 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-blue-600 enabled:hover:text-primary-foreground'
                >
                  ATUALIZAR ORDEM DE SERVIÇO
                </button>
              </div>
            </>
          ) : null}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default EditServiceOrder;
