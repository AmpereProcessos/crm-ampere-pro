import SelectWithImages from '@/components/Inputs/SelectWithImages';
import TextInput from '@/components/Inputs/TextInput';
import ControlPricingUnit from '@/components/PricingMethods/ControlPricingUnit';
import type { TUserSession } from '@/lib/auth/session';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { createPricingMethod } from '@/utils/mutations/pricing-methods';
import { usePartnersSimplified } from '@/utils/queries/partners';
import { TPricingMethod } from '@/utils/schemas/pricing-method.schema';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { VscChromeClose } from 'react-icons/vsc';

type NewPricingMethodProps = {
  session: TUserSession;
  closeModal: () => void;
};
function NewPricingMethod({ session, closeModal }: NewPricingMethodProps) {
  const queryClient = useQueryClient();
  const { data: partners } = usePartnersSimplified();
  const [methodology, setMethodology] = useState<TPricingMethod>({
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
  const { mutate: handleCreatePricingMethod, isPending } = useMutationWithFeedback({
    mutationKey: ['create-pricing-method'],
    mutationFn: createPricingMethod,
    affectedQueryKey: ['pricing-methods'],
    queryClient: queryClient,
  });
  return (
    <div id='defaultModal' className='fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]'>
      <div className='fixed left-[50%] top-[50%] z-100 h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px] lg:w-[70%]'>
        <div className='flex h-full flex-col font-Inter'>
          <div className='flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row'>
            <h3 className='text-xl font-bold text-primary dark:text-white '>NOVA METODOLOGIA DE PRECIFICAÇÃO</h3>
            <button
              onClick={() => closeModal()}
              type='button'
              className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          <div className='flex h-full grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
            <div className='my-5 flex flex-col'>
              <p className='text-primary/50'>Construa metodologias de precificação a serem aplicadas ao seus kits.</p>
              <p className='text-primary/50'>
                Crie unidades de preço para composição da sua precificação. Utilize <strong className='text-[#E25E3E]'>variáveis</strong>, aplique{' '}
                <strong className='text-[#E25E3E]'>condições</strong> , e tenha flexibilidade na criação de fórmulas de{' '}
                <strong className='text-[#E25E3E]'>cálculo de custo.</strong>
              </p>
            </div>
            <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-1/2'>
                <TextInput
                  label='NOME DA METODOLOGIA DE PRECIFICAÇÃO'
                  value={methodology.nome}
                  placeholder='Preencha aqui o nome da metodologia de precificação...'
                  handleChange={(value) => setMethodology((prev) => ({ ...prev, nome: value }))}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-1/2'>
                <SelectWithImages
                  label='VISIBILIDADE DE PARCEIRO'
                  value={methodology.idParceiro || null}
                  options={partners?.map((p) => ({ id: p._id, value: p._id, label: p.nome, url: p.logo_url || undefined })) || []}
                  resetOptionLabel='TODOS'
                  handleChange={(value) =>
                    setMethodology((prev) => ({
                      ...prev,
                      idParceiro: value,
                    }))
                  }
                  onReset={() =>
                    setMethodology((prev) => ({
                      ...prev,
                      idParceiro: null,
                    }))
                  }
                  width='100%'
                />
              </div>
            </div>
            <ControlPricingUnit methodology={methodology} setMethodology={setMethodology} />
            <div className='flex w-full items-center justify-end'>
              <button
                className='rounded bg-black p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-primary/70'
                onClick={() =>
                  // @ts-ignore
                  handleCreatePricingMethod({ info: methodology })
                }
              >
                CRIAR METODOLOGIA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewPricingMethod;
