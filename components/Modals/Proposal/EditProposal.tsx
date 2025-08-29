import CheckboxInput from '@/components/Inputs/CheckboxInput';
import TextInput from '@/components/Inputs/TextInput';
import AddPricingItem from '@/components/Proposal/Blocks/AddPricingItem';
import EditFinalPrice from '@/components/Proposal/Blocks/EditFinalPrice';
import PaymentMethodCard from '@/components/Proposal/Blocks/PaymentMethodCard';
import PricingTable from '@/components/Proposal/Blocks/PricingTable';
import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import { handleDownload } from '@/lib/methods/download';

import SelectInput from '@/components/Inputs/SelectInput';
import type { TUserSession } from '@/lib/auth/session';
import { formatToMoney } from '@/lib/methods/formatting';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { createProposalUpdateRecord } from '@/utils/mutations/proposal-update-records';
import { editProposalPersonalized } from '@/utils/mutations/proposals';
import { getPricingTotal } from '@/utils/pricing/methods';
import { usePaymentMethods } from '@/utils/queries/payment-methods';
import { useProjectTypes } from '@/utils/queries/project-types';
import { TProposalUpdateRecord } from '@/utils/schemas/proposal-update-records.schema';
import { TPricingItem, TProposalDTO, TProposalDTOWithOpportunityAndClient, TProposalPaymentMethodItem } from '@/utils/schemas/proposal.schema';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { MdAdd } from 'react-icons/md';
import { VscChromeClose } from 'react-icons/vsc';

type EditProposalProps = {
  closeModal: () => void;
  info: TProposalDTOWithOpportunityAndClient;
  userHasPricingEditPermission: boolean;
  userHasPricingViewPermission: boolean;
  session: TUserSession;
};
function EditProposal({ closeModal, info, userHasPricingViewPermission, userHasPricingEditPermission, session }: EditProposalProps) {
  const queryClient = useQueryClient();
  const alterationLimit = userHasPricingEditPermission ? undefined : 0.02;

  const { data: projectTypes } = useProjectTypes();
  const proposalTemplates = projectTypes?.find((t) => t._id == info.oportunidadeDados.tipo.id)?.modelosProposta;

  // Creating a flag for the need of updating the defined plan price, if
  // there is one. So, if there is only one plan to the proposal, it is the defined one.
  const updatePlanPrice = info.planos.length == 1;

  const [proposalName, setProposalName] = useState(info.nome);
  const [proposalTemplate, setProposalTemplate] = useState<string | null | undefined>(info.idModeloAnvil);
  const [regenerateFile, setRegenerateFile] = useState<boolean>(false);
  const [pricing, setPricing] = useState<TPricingItem[]>(info.precificacao);
  const [payment, setPayment] = useState<TProposalDTO['pagamento']>(info.pagamento);
  const [addNewPriceItemModalIsOpen, setAddNewPriceItemModalIsOpen] = useState<boolean>(false);
  const [editFinalPriceModalIsOpen, setEditFinalPriceModalIsOpen] = useState<boolean>(false);
  const pricingTotal = getPricingTotal({ pricing: pricing });

  async function handleProposalUpdate({
    newName,
    newPricing,
    previousName,
    previousPricing,
    payment,
  }: {
    newName: string;
    newPricing: TPricingItem[];
    previousName: string;
    previousPricing: TPricingItem[];
    payment: TProposalDTO['pagamento'];
  }) {
    try {
      // Creating update registry
      const previousTotal = getPricingTotal({ pricing: previousPricing });
      const newTotal = getPricingTotal({ pricing: newPricing });

      const previousProposal: Partial<TProposalDTO> = { nome: previousName, precificacao: previousPricing, valor: previousTotal };
      const newProposal: Partial<TProposalDTO> = { nome: newName, precificacao: newPricing, valor: newTotal };

      const record: TProposalUpdateRecord = {
        idParceiro: info.idParceiro,
        oportunidade: {
          id: info.oportunidade.id,
          nome: info.oportunidade.nome,
        },
        proposta: {
          id: info._id,
          nome: info.nome,
        },
        anterior: previousProposal,
        novo: newProposal,
        autor: {
          id: session.user.id,
          nome: session.user.nome,
          avatar_url: session.user.avatar_url,
        },
        dataInsercao: new Date().toISOString(),
      };
      await createProposalUpdateRecord({ info: record });

      const proposalPlans: TProposalDTO['planos'] = updatePlanPrice ? [{ ...info.planos[0], valor: newTotal }] : info.planos;

      const response = await editProposalPersonalized({
        id: info._id,
        proposal: {
          ...info,
          nome: newName,
          planos: proposalPlans,
          precificacao: newPricing,
          valor: newTotal,
          pagamento: payment,
          idModeloAnvil: proposalTemplate,
        },
        opportunity: info.oportunidadeDados,
        client: info.clienteDados,
        regenerateFile: regenerateFile,
        idAnvil: info.idModeloAnvil,
      });

      const fileName = info.nome;
      const fileUrl = response.data?.fileUrl;
      if (fileUrl) await handleDownload({ fileName, fileUrl });

      if (typeof response.message != 'string') return 'Proposta atualizado com sucesso !';
      return response.message as string;
    } catch (error) {
      throw error;
    }
  }
  const { mutate: handleUpdate, isPending } = useMutationWithFeedback({
    mutationKey: ['update-proposal', info._id],
    mutationFn: handleProposalUpdate,
    queryClient: queryClient,
    affectedQueryKey: ['proposal-update-records', info._id],
    callbackFn: async () => await queryClient.invalidateQueries({ queryKey: ['proposal-by-id', info._id] }),
  });
  return (
    <div id='edit-proposal' className='fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]'>
      <div className='fixed left-[50%] top-[50%] z-100 flex h-fit max-h-[90%] w-[90%] translate-x-[-50%] translate-y-[-50%] flex-col rounded-md bg-background p-[10px] lg:w-[90%]'>
        <div className='flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row'>
          <h3 className='text-xl font-bold text-primary  '>EDITAR PROPOSTA</h3>
          <button
            onClick={() => closeModal()}
            type='button'
            className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
          >
            <VscChromeClose style={{ color: 'red' }} />
          </button>
        </div>
        <div className='flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
          <TextInput
            label='NOME DA PROPOSTA'
            placeholder='Preencha o nome da proposta...'
            value={proposalName}
            handleChange={(value) => setProposalName(value)}
            width='100%'
          />
          <SelectInput
            label='TEMPLATE DA PROPOSTA'
            value={proposalTemplate || null}
            resetOptionLabel='TEMPLATE PADRÃO'
            options={proposalTemplates?.map((t, index) => ({ id: index + 1, label: t.titulo, value: t.idAnvil })) || []}
            handleChange={(value) => setProposalTemplate(value)}
            onReset={() => setProposalTemplate(undefined)}
            width='100%'
          />
          <div className='flex w-full flex-col gap-2 rounded-sm border border-cyan-500'>
            <h1 className='w-full rounded-sm bg-cyan-500 p-1 text-center text-xs font-bold text-primary-foreground'>PRECIFICAÇÃO</h1>
            <div className='flex w-full flex-col p-2'>
              <PricingTable
                opportunity={info.oportunidadeDados}
                proposal={info}
                pricing={pricing}
                setPricing={setPricing}
                userHasPricingEditPermission={userHasPricingEditPermission}
                userHasPricingViewPermission={userHasPricingViewPermission}
              />
              {userHasPricingEditPermission ? (
                <div className='flex w-full items-center justify-center'>
                  <button
                    onClick={() => setAddNewPriceItemModalIsOpen(true)}
                    className='flex items-center gap-2 rounded-sm bg-orange-600 px-4 py-2 text-primary-foreground duration-100 ease-in-out hover:bg-orange-700'
                  >
                    <MdAdd />
                    <h1 className='text-xs font-bold'>NOVO CUSTO</h1>
                  </button>
                </div>
              ) : null}
              <div className='flex w-full items-center justify-center gap-2 py-1'>
                <div className='flex gap-2 rounded-sm border border-primary/60 px-2 py-1 font-medium text-primary/60'>
                  <p>{formatToMoney(pricingTotal)}</p>

                  {userHasPricingEditPermission ? (
                    <button onClick={() => setEditFinalPriceModalIsOpen((prev) => !prev)} className='text-md text-primary/40 hover:text-[#fead61]'>
                      <AiFillEdit />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <ProposalPaymentMethods proposalValue={pricingTotal} payment={payment} setPayment={setPayment} />
          <div className='flex w-full items-center justify-end gap-2 p-2'>
            {info.idModeloAnvil ? (
              <div className='w-fit'>
                <CheckboxInput
                  labelFalse='GERAR NOVO DOCUMENTO'
                  labelTrue='GERAR NOVO DOCUMENTO'
                  checked={regenerateFile}
                  handleChange={(value) => setRegenerateFile(value)}
                />
              </div>
            ) : null}
            <button
              disabled={isPending}
              onClick={() =>
                // @ts-ignore
                handleUpdate({
                  previousName: info.nome,
                  previousPricing: info.precificacao,
                  newName: proposalName,
                  newPricing: pricing,
                  payment: payment,
                })
              }
              className='h-9 whitespace-nowrap rounded-sm bg-blue-700 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-blue-600 enabled:hover:text-primary-foreground'
            >
              ATUALIZAR PROPOSTA
            </button>
          </div>
        </div>
      </div>
      {addNewPriceItemModalIsOpen ? (
        <AddPricingItem pricing={pricing} setPricing={setPricing} proposal={info} closeModal={() => setAddNewPriceItemModalIsOpen(false)} />
      ) : null}
      {editFinalPriceModalIsOpen ? (
        <EditFinalPrice
          pricing={pricing}
          setPricing={setPricing}
          alterationLimit={alterationLimit}
          closeModal={() => setEditFinalPriceModalIsOpen(false)}
        />
      ) : null}
    </div>
  );
}

export default EditProposal;

type ProposalPaymentMethodsProps = {
  proposalValue: number;
  payment: TProposalDTO['pagamento'];
  setPayment: React.Dispatch<React.SetStateAction<TProposalDTO['pagamento']>>;
};
function ProposalPaymentMethods({ proposalValue, payment, setPayment }: ProposalPaymentMethodsProps) {
  const { data: paymentMethods, isLoading, isError, isSuccess } = usePaymentMethods();
  function handleAddMethod(method: TProposalPaymentMethodItem) {
    setPayment((prev) => ({ ...prev, metodos: [...prev.metodos, method] }));
  }
  function handleRemoveMethod(id: string) {
    setPayment((prev) => ({ ...prev, metodos: [...prev.metodos.filter((s) => s.id != id)] }));
  }
  return (
    <div className='flex w-full flex-col gap-2 rounded-sm border border-[#fead41]'>
      <h1 className='w-full rounded-sm bg-[#fead41] p-1 text-center text-xs font-bold text-primary-foreground'>FORMAS DE PAGAMENTO</h1>
      <p className='my-2 w-full text-center font-medium leading-none tracking-tight text-primary/70'>
        Selecione os métodos de pagamento aplicáveis a essa proposta.
      </p>
      <div className='flex w-full flex-col gap-2 p-2'>
        {isLoading ? <LoadingComponent /> : null}
        {isError ? <ErrorComponent msg='Erro ao buscar metodologias de pagamento' /> : null}
        {isSuccess ? (
          paymentMethods.length > 0 ? (
            paymentMethods.map((method, index) => (
              <PaymentMethodCard
                index={index}
                key={method._id}
                method={method}
                proposalValue={proposalValue}
                selectedMethods={payment.metodos}
                updateSelectedMethods={(methodsUpdated) => setPayment((prev) => ({ ...prev, metodos: methodsUpdated }))}
                selectMethod={(method) => handleAddMethod(method)}
                removeMethod={(id) => handleRemoveMethod(id)}
              />
            ))
          ) : (
            <p className='flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/70'>
              Nenhum método de pagamento disponível.
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}
