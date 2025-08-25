import TextInput from '@/components/Inputs/TextInput';
import ControlPricingUnit from '@/components/PricingMethods/ControlPricingUnit';
import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import type { TUserSession } from '@/lib/auth/session';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { editPricingMethod } from '@/utils/mutations/pricing-methods';
import { usePricingMethodById } from '@/utils/queries/pricing-methods';
import { TPricingMethod, TPricingMethodDTO } from '@/utils/schemas/pricing-method.schema';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { VscChromeClose } from 'react-icons/vsc';

type EditPricingMethodProps = {
  pricingMethodId: string;
  session: TUserSession;
  closeModal: () => void;
};
function EditPricingMethod({ pricingMethodId, session, closeModal }: EditPricingMethodProps) {
  const queryClient = useQueryClient();
  const { data: pricingMethod, isLoading, isSuccess, isError } = usePricingMethodById({ id: pricingMethodId });
  const [methodology, setMethodology] = useState<TPricingMethodDTO>({
    _id: 'id-holder',
    nome: '',
    idParceiro: session.user.idParceiro || '',
    itens: [],
    autor: {
      id: session.user.id,
      nome: session.user.nome,
      avatar_url: session.user.avatar_url,
    },
    dataInsercao: new Date().toISOString(),
  });
  const { mutate: handleEditPricingMethod, isPending } = useMutationWithFeedback({
    mutationKey: ['edit-pricing-method', pricingMethodId],
    mutationFn: editPricingMethod,
    affectedQueryKey: ['pricing-methods'],
    queryClient: queryClient,
  });
  useEffect(() => {
    if (pricingMethod) setMethodology(pricingMethod);
  }, [pricingMethod]);
  console.log(methodology);
  return (
    <div id='defaultModal' className='fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]'>
      <div className='fixed left-[50%] top-[50%] z-100 h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px] lg:w-[70%]'>
        <div className='flex h-full flex-col font-Inter'>
          <div className='flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row'>
            <h3 className='text-xl font-bold text-primary dark:text-white '>EDITAR METODOLOGIA DE PRECIFICAÇÃO</h3>
            <button
              onClick={() => closeModal()}
              type='button'
              className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent msg='Erro ao buscar metodologia de precificação.' /> : null}
          {isSuccess ? (
            <div className='flex h-full grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
              <div className='my-5 flex flex-col'>
                <p className='text-primary/50'>Construa metodologias de precificação a serem aplicadas ao seus kits.</p>
                <p className='text-primary/50'>
                  Crie unidades de preço para composição da sua precificação. Utilize <strong className='text-[#E25E3E]'>variáveis</strong>, aplique{' '}
                  <strong className='text-[#E25E3E]'>condições</strong> , e tenha flexibilidade na criação de fórmulas de{' '}
                  <strong className='text-[#E25E3E]'>cálculo de custo.</strong>
                </p>
              </div>
              <TextInput
                label='NOME DA METODOLOGIA DE PRECIFICAÇÃO'
                value={methodology.nome}
                placeholder='Preencha aqui o nome da metodologia de precificação...'
                handleChange={(value) => setMethodology((prev) => ({ ...prev, nome: value }))}
                width='100%'
              />
              <ControlPricingUnit
                methodology={methodology as TPricingMethod}
                setMethodology={setMethodology as React.Dispatch<React.SetStateAction<TPricingMethod>>}
              />
              <div className='flex w-full items-center justify-end'>
                <button
                  disabled={isPending}
                  className='h-9 whitespace-nowrap rounded-sm bg-blue-800 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:bg-primary/50 disabled:text-white enabled:hover:bg-blue-800 enabled:hover:text-white'
                  onClick={() =>
                    // @ts-ignore
                    handleEditPricingMethod({ id: pricingMethodId, changes: methodology })
                  }
                >
                  ATUALIZAR METODOLOGIA
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default EditPricingMethod;
