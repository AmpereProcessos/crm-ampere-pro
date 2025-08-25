import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import TextInput from '../Inputs/TextInput';
import NewPricingUnit from '../PricingMethods/NewPricingUnit';

import { TPricingMethod } from '@/utils/schemas/pricing-method.schema';
import { TAuthor } from '@/utils/schemas/user.schema';

import { formatCondition, formatFormulaItem } from '@/utils/pricing/helpers';

import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { createPricingMethod } from '@/utils/mutations/onboarding';

type PricingMethodProps = {
  partnerId: string;
  author: TAuthor;
  goToNextStage: () => void;
  goToPreviousStage: () => void;
};
function PricingMethod({ partnerId, author, goToNextStage, goToPreviousStage }: PricingMethodProps) {
  const queryClient = useQueryClient();
  const [methodology, setMethodology] = useState<TPricingMethod>({
    nome: '',
    idParceiro: partnerId,
    itens: [],
    autor: author,
    dataInsercao: new Date().toISOString(),
  });
  const [newPriceUnitMenuIsOpen, setNewPriceUnitMenuIsOpen] = useState<boolean>(true);
  const { mutate: handleCreatePricingMethod, isPending } = useMutationWithFeedback({
    mutationKey: ['create-pricing-method'],
    mutationFn: createPricingMethod,
    affectedQueryKey: ['pricing-methods'],
    queryClient: queryClient,
  });
  return (
    <div className='flex grow flex-col gap-y-2'>
      <h1 className='mt-4 w-full text-center text-lg tracking-tight text-primary/50'>
        Nós possibilitamos que você defina suas metodologias de precificação. Essas podem ser vinculadas aos kits que você eventualmente criar, de
        modo que as proposta geradas utilizando-os sejam precificadas com a metodologia que você definiu.
      </h1>
      <h1 className='mb-4 w-full text-center text-lg tracking-tight text-primary/50'>
        Se desejar, você pode pular essa etapa e definir suas metodologias posteriormente.
      </h1>
      <h1 className='w-full bg-[#fead41] p-1 text-center font-bold text-white'>METODOLOGIA DE PRECIFICAÇÃO</h1>
      <div className='my-5 flex flex-col px-2'>
        <p className='text-primary/50'>Construa metodologias de precificação a serem aplicadas ao seus kits.</p>
        <p className='text-primary/50'>
          Crie unidades de preço para composição da sua precificação. Utilize <strong className='text-[#E25E3E]'>variáveis</strong>, aplique{' '}
          <strong className='text-[#E25E3E]'>condições</strong> , e tenha flexibilidade na criação de fórmulas de{' '}
          <strong className='text-[#E25E3E]'>cálculo de custo.</strong>
        </p>
      </div>
      <div className='w-full px-2'>
        <TextInput
          label='NOME DA METODOLOGIA DE PRECIFICAÇÃO'
          value={methodology.nome}
          placeholder='Preencha aqui o nome da metodologia de precificação...'
          handleChange={(value) => setMethodology((prev) => ({ ...prev, nome: value }))}
          width='100%'
        />
      </div>

      <h1 className='mt-2 w-full bg-primary/70 p-1 text-center text-sm font-bold text-white '>UNIDADES DE PREÇO</h1>
      {newPriceUnitMenuIsOpen ? (
        <NewPricingUnit methodology={methodology} setMethodology={setMethodology} closeMenu={() => setNewPriceUnitMenuIsOpen(false)} />
      ) : (
        <div className='flex w-full items-center justify-end px-2'>
          <button
            className='rounded bg-green-500 p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-green-600'
            onClick={() => setNewPriceUnitMenuIsOpen(true)}
          >
            NOVA UNIDADE DE PREÇO
          </button>
        </div>
      )}
      <h1 className='my-4 px-2 text-sm font-bold leading-none tracking-tight text-[#E25E3E]'>LISTA DE UNIDADES DE PREÇO</h1>
      {methodology.itens.length > 0 ? (
        methodology.itens.map((item, index) => (
          <div key={index} className='flex w-full flex-col rounded-md border border-primary/50 p-3 shadow-md'>
            <h1 className='mb-2 text-sm font-black leading-none tracking-tight'>{item.nome}</h1>
            <div className='flex flex-col'>
              {item.resultados.map((result, index2) => (
                <div key={index2} className='mb-1 flex w-full items-center gap-2 rounded-md border border-[#A0E9FF] p-1'>
                  <div className='flex flex-col'>
                    <h1 className='text-start text-sm font-bold leading-none tracking-tight text-cyan-500'>
                      {!result.condicao.aplicavel
                        ? 'FÓRMULA GERAL:'
                        : `SE ${formatCondition(result.condicao.variavel || '')} FOR IGUAL A ${result.condicao.igual}:`}
                    </h1>
                    <div className='flex items-center gap-2 font-Inter'>
                      <div className='flex items-center gap-1'>
                        <p className='text-xs text-primary/50'>MARGEM: </p>
                        <p className='text-xs font-bold text-[#FFBB5C]'>{result.margemLucro}%</p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <p className='text-xs text-primary/50'>IMPOSTO: </p>
                        <p className='text-xs font-bold text-[#FFBB5C]'>{result.taxaImposto}%</p>
                      </div>
                    </div>
                  </div>

                  <div className='flex  grow flex-wrap items-center justify-center gap-1 p-1'>
                    {result.formulaArr.map((y) => (
                      <p className={`text-[0.7rem] ${y.includes('[') ? 'rounded-sm bg-blue-500 p-1 text-white' : ''}`}>{formatFormulaItem(y)}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <h1 className='w-full text-center text-xs font-medium italic'>Sem unidades de preço cadastradas...</h1>
      )}
      <div className='flex w-full items-center justify-end gap-2 px-2'>
        <button
          className='rounded bg-primary/50 p-1 px-4 text-xs font-medium text-white duration-300 ease-in-out hover:bg-primary/60'
          // @ts-ignore
          onClick={() => goToNextStage()}
        >
          PULAR
        </button>
        <button
          className='rounded bg-black p-1 px-4 text-xs font-medium text-white duration-300 ease-in-out disabled:bg-primary/40 disabled:text-primary enabled:hover:bg-primary/60'
          disabled={isPending}
          // @ts-ignore
          onClick={() => handleCreatePricingMethod({ info: methodology })}
        >
          PROSSEGUIR
        </button>
      </div>
    </div>
  );
}

export default PricingMethod;
