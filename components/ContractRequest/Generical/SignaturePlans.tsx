import CheckboxInput from '@/components/Inputs/CheckboxInput';
import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import { Button } from '@/components/ui/button';
import { OeMIDs } from '@/utils/constants';
import { useSignaturePlanWithPricingMethod } from '@/utils/queries/signature-plans';
import type { TContractRequest } from '@/utils/schemas//contract-request.schema';
import type { TProposalDTOWithOpportunity } from '@/utils/schemas/proposal.schema';
import type { TSignaturePlanDTOWithPricingMethod } from '@/utils/schemas/signature-plans.schema';
import { ChevronRight, Tag } from 'lucide-react';
import { type Dispatch, type SetStateAction } from 'react';
import SignaturePlanOptionCard from '../Utils/SignaturePlanOptionCard';

type SignaturePlansProps = {
  proposal: TProposalDTOWithOpportunity;
  requestInfo: TContractRequest;
  setRequestInfo: Dispatch<SetStateAction<TContractRequest>>;
  showActions: boolean;
  goToPreviousStage: () => void;
  goToNextStage: () => void;
};
function SignaturePlans({ proposal, requestInfo, setRequestInfo, showActions, goToPreviousStage, goToNextStage }: SignaturePlansProps) {
  return (
    <div className='flex w-full flex-col bg-background pb-2 gap-6 grow'>
      <div className='w-full flex items-center justify-center gap-2'>
        <Tag size={15} />
        <span className='text-sm tracking-tight font-bold'>PLANOS DE ASSINATURA</span>
      </div>
      <div className='w-full flex flex-col grow gap-4'>
        {/** O&M INFORMATION */}
        <div className='w-full flex flex-col gap-4'>
          <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
            <ChevronRight size={15} />
            <h1 className='text-xs tracking-tight font-medium text-start w-fit'>OPERAÇÃO E MANUTENÇÃO</h1>
          </div>
          <OeMData proposal={proposal} requestInfo={requestInfo} setRequestInfo={setRequestInfo} />
        </div>
        {/** INSURANCE INFORMATION */}
        <div className='w-full flex flex-col gap-4'>
          <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
            <ChevronRight size={15} />
            <h1 className='text-xs tracking-tight font-medium text-start w-fit'>SEGURO SOLAR</h1>
          </div>
          <InsuranceData requestInfo={requestInfo} setRequestInfo={setRequestInfo} />
        </div>
      </div>
      {showActions ? (
        <div className='mt-2 flex w-full flex-wrap justify-between  gap-2'>
          <Button
            type='button'
            onClick={() => {
              goToPreviousStage();
            }}
            variant='outline'
          >
            Voltar
          </Button>
          <Button
            type='button'
            onClick={() => {
              goToNextStage();
            }}
          >
            Prosseguir
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default SignaturePlans;

type OeMDataProps = {
  proposal: TProposalDTOWithOpportunity;
  requestInfo: TContractRequest;
  setRequestInfo: Dispatch<SetStateAction<TContractRequest>>;
};
function OeMData({ proposal, requestInfo, setRequestInfo }: OeMDataProps) {
  const { data: signaturePlans, isLoading, isError, isSuccess } = useSignaturePlanWithPricingMethod();
  function getOeMPlans(plans: TSignaturePlanDTOWithPricingMethod[] | undefined) {
    if (!plans) return [];
    return plans.filter((p) => OeMIDs.includes(p._id));
  }

  return (
    <div className='flex grow flex-wrap items-start justify-around gap-2 py-2'>
      {getOeMPlans(signaturePlans).map((plan) => (
        <SignaturePlanOptionCard
          key={plan._id}
          activePlanName={requestInfo.planoOeM}
          plan={plan}
          opportunity={proposal.oportunidadeDados}
          proposal={proposal}
          handleSelect={(plan) => {
            setRequestInfo((prev) => ({
              ...prev,
              possuiOeM: 'SIM',
              planoOeM: plan.nome as TContractRequest['planoOeM'],
              valorOeMOuSeguro: plan.valorTotal,
            }));
          }}
        />
      ))}
    </div>
  );
}

type InsuranceDataProps = {
  requestInfo: TContractRequest;
  setRequestInfo: Dispatch<SetStateAction<TContractRequest>>;
};
function InsuranceData({ requestInfo, setRequestInfo }: InsuranceDataProps) {
  return (
    <>
      <div className='flex w-full items-center justify-center'>
        <div className='w-fit'>
          <CheckboxInput
            labelFalse='APLICAR SEGURO'
            labelTrue='APLICAR SEGURO'
            checked={requestInfo.clienteSegurado === 'SIM'}
            handleChange={(value) => setRequestInfo((prev) => ({ ...prev, clienteSegurado: value ? 'SIM' : 'NÃO' }))}
          />
        </div>
      </div>
      {requestInfo.clienteSegurado === 'SIM' ? (
        <div className='w-full flex items-center gap-2 flex-col lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <NumberInput
              label='VALOR DO SEGURO'
              value={requestInfo.valorSeguro}
              placeholder='Preencha o valor do seguro...'
              handleChange={(value) => setRequestInfo((prev) => ({ ...prev, valorSeguro: value }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <SelectInput
              label='TEMPO SEGURADO'
              value={requestInfo.tempoSegurado}
              options={[
                { id: 1, value: '1 ANO', label: '1 ANO' },
                { id: 2, value: 'NÃO SE APLICA', label: 'NÃO SE APLICA' },
              ]}
              handleChange={(value) => setRequestInfo((prev) => ({ ...prev, tempoSegurado: value }))}
              resetOptionLabel='NÃO DEFINIDO'
              onReset={() => setRequestInfo((prev) => ({ ...prev, tempoSegurado: 'NÃO SE APLICA' }))}
              width='100%'
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
