import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { BsCircleHalf } from 'react-icons/bs';
import { FaPercentage } from 'react-icons/fa';
import { MdDelete, MdPayment } from 'react-icons/md';

import TextInput from '../Inputs/TextInput';
import NewFractionnement from '../PaymentMethods/NewFractionnement';

import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { createPaymentMethod, editPartner } from '@/utils/mutations/onboarding';
import { TFractionnementItem, TPaymentMethod } from '@/utils/schemas/payment-methods';
import { TAuthor } from '@/utils/schemas/user.schema';

type PaymentMethodProps = {
  partnerId: string;
  author: TAuthor;
  goToNextStage: () => void;
  goToPreviousStage: () => void;
};
function PaymentMethod({ partnerId, author, goToNextStage, goToPreviousStage }: PaymentMethodProps) {
  const queryClient = useQueryClient();
  const [infoHolder, setInfoHolder] = useState<TPaymentMethod>({
    nome: '',
    ativo: true,
    descricao: '',
    idParceiro: partnerId,
    fracionamento: [],
    autor: author,
    dataInsercao: new Date().toISOString(),
  });
  const [newFractionnementItemMenuIsOpen, setNewFractionnementItemMenuIsOpen] = useState<boolean>(true);

  const missingPercentage = 100 - infoHolder.fracionamento.reduce((acc, current) => acc + current.porcentagem, 0);

  function addFractionnement(info: TFractionnementItem) {
    const fractionnements = [...infoHolder.fracionamento];
    fractionnements.push(info);
    setInfoHolder((prev) => ({ ...prev, fracionamento: fractionnements }));
  }
  function removeFractionnement(index: number) {
    const fractionnements = [...infoHolder.fracionamento];
    fractionnements.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, fracionamento: fractionnements }));
  }

  async function handleCreatePaymentMethod() {
    try {
      if (infoHolder.nome.trim().length < 2) throw new Error('Preencha um nome de ao menos 2 letras para o método.');
      await createPaymentMethod({ info: infoHolder });
      await editPartner({ id: partnerId, info: { onboarding: { dataConclusao: new Date().toISOString() } } });
      goToNextStage();
      return 'Método criado com sucesso !';
    } catch (error) {
      throw error;
    }
  }
  const { mutate, isPending } = useMutationWithFeedback({
    mutationKey: ['create-pricing-method'],
    mutationFn: handleCreatePaymentMethod,
    affectedQueryKey: ['pricing-methods'],
    queryClient: queryClient,
  });
  return (
    <div className='flex grow flex-col gap-y-2'>
      <h1 className='mt-4 w-full px-2 text-center text-lg tracking-tight text-primary/50'>
        Cada parceiro tem métodos e necessidades diferentes para as suas metodologias de pagamento. Sendo assim, oferecemos uma maneira para que você
        personalize os métodos de pagamento a ser oferecidos nas propostas comerciais.
      </h1>
      <h1 className='mb-4 w-full px-2 text-center text-lg tracking-tight text-primary/50'>
        Nesse etapa, você pode criar sua primeira metodologia de pagamento, com seus respectivos fracionamentos.
      </h1>
      <h1 className='mb-4 w-full px-2 text-center text-lg tracking-tight text-primary/50'>
        Se desejar, você pode pular essa etapa e criar seus métodos de pagamento posteriormente.
      </h1>
      <h1 className='w-full bg-[#fead41] p-1 text-center font-bold text-white'>MÉTODOS DE PAGAMENTO</h1>
      <div className='flex w-full flex-col gap-2 px-2 lg:flex-row'>
        <div className='w-full lg:w-1/2'>
          <TextInput
            label='NOME DO MÉTODO'
            value={infoHolder.nome}
            placeholder='Preencha aqui o nome para identificação do método de pagamento...'
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, nome: value }))}
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/2'>
          <TextInput
            label='DESCRIÇÃO'
            value={infoHolder.descricao}
            placeholder='Preencha aqui a descrição que aparecerá na proposta...'
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, descricao: value }))}
            width='100%'
          />
        </div>
      </div>
      <h1 className='mt-2 w-full rounded-md bg-primary/70 p-1 text-center text-sm font-bold text-white'>FRACIONAMENTO</h1>
      {newFractionnementItemMenuIsOpen ? (
        <NewFractionnement
          addFractionnement={addFractionnement}
          removeFractionnement={removeFractionnement}
          missingPercentage={missingPercentage}
          closeMenu={() => setNewFractionnementItemMenuIsOpen(false)}
        />
      ) : (
        <div className='flex w-full items-center justify-end'>
          <button
            className='rounded bg-green-500 p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-green-600'
            onClick={() => setNewFractionnementItemMenuIsOpen(true)}
          >
            NOVO ITEM DE FRACIONAMENTO
          </button>
        </div>
      )}
      <h1 className='my-4 px-2 text-sm font-bold leading-none tracking-tight text-[#E25E3E]'>LISTA DE FRACIONAMENTOS</h1>
      {infoHolder.fracionamento.length > 0 ? (
        <div className='flex w-full flex-wrap items-center justify-around gap-2 px-2'>
          {infoHolder.fracionamento.map((fractionnement, index) => (
            <div key={index} className='flex w-full flex-col rounded-md border border-primary/50 p-3 shadow-md lg:w-[500px]'>
              <div className='flex w-full items-center justify-between gap-2'>
                <h1 className='text-sm font-black leading-none tracking-tight'>FRAÇÃO DE {fractionnement.porcentagem}%</h1>
                <button
                  onClick={() => removeFractionnement(index)}
                  type='button'
                  className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
                >
                  <MdDelete style={{ color: 'red' }} />
                </button>
              </div>

              <div className='mt-2 flex w-full items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <MdPayment color={'#76c893'} />
                  <p className='text-xs font-medium leading-none tracking-tight text-primary/50'>{fractionnement.metodo}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <BsCircleHalf color='#ed174c' />
                  <p className='text-xs font-medium leading-none tracking-tight text-primary/50'>
                    {fractionnement.maximoParcelas} {fractionnement.maximoParcelas > 1 ? 'PARCELAS' : 'PARCELA'}
                  </p>
                </div>
                {fractionnement.taxaJuros ? (
                  <div className='flex items-center gap-2'>
                    <FaPercentage />
                    <p className='text-xs font-medium leading-none tracking-tight text-primary/50'>{fractionnement.taxaJuros} DE JUROS</p>
                  </div>
                ) : null}
                {fractionnement.taxaUnica ? (
                  <div className='flex items-center gap-2'>
                    <FaPercentage />
                    <p className='text-xs font-medium leading-none tracking-tight text-primary/50'>{fractionnement.taxaUnica} DE USO</p>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className='w-full text-center text-sm italic text-primary/50'>Nenhum fracionamento adicionado.</p>
      )}
      <div className='flex w-full items-center justify-end gap-2 px-2'>
        <button
          className='rounded bg-primary/50 p-1 px-4 text-xs font-medium text-white duration-300 ease-in-out hover:bg-primary/60'
          // @ts-ignore
          onClick={async () => {
            await editPartner({ id: partnerId, info: { onboarding: { dataConclusao: new Date().toISOString() } } });
            goToNextStage();
          }}
        >
          PULAR
        </button>
        <button
          className='rounded bg-black p-1 px-4 text-xs font-medium text-white duration-300 ease-in-out disabled:bg-primary/40 disabled:text-primary enabled:hover:bg-primary/60'
          disabled={isPending}
          // @ts-ignore
          onClick={() => mutate()}
        >
          PROSSEGUIR
        </button>
      </div>
    </div>
  );
}

export default PaymentMethod;
