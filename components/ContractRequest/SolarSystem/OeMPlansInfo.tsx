import { OeMIDs } from '@/utils/constants';
import { useSignaturePlanWithPricingMethod } from '@/utils/queries/signature-plans';
import { TContractRequest } from '@/utils/schemas//contract-request.schema';
import { TProposalDTOWithOpportunity } from '@/utils/schemas/proposal.schema';
import { TSignaturePlanDTOWithPricingMethod } from '@/utils/schemas/signature-plans.schema';
import React from 'react';
import SignaturePlanOptionCard from '../Utils/SignaturePlanOptionCard';

type OeMPlansInfoProps = {
  requestInfo: TContractRequest;
  setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
  goToPreviousStage: () => void;
  goToNextStage: () => void;
  modulesQty?: number;
  distance?: number;
  proposal: TProposalDTOWithOpportunity;
  activePlanId?: number;
};

function OeMPlansInfo({ requestInfo, setRequestInfo, goToPreviousStage, goToNextStage, proposal }: OeMPlansInfoProps) {
  // Nos casos em que houver um plano selecionado, captar nova escolha e atualizar informações da proposta.
  const { data: signaturePlans, isLoading, isError, isSuccess } = useSignaturePlanWithPricingMethod();
  function getOeMPlans(plans: TSignaturePlanDTOWithPricingMethod[] | undefined) {
    if (!plans) return [];
    return plans.filter((p) => OeMIDs.includes(p._id));
  }
  return (
    <div className='flex w-full grow flex-col bg-background pb-2'>
      <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>PLANO INTEGRADO DE OPERAÇÃO E MANUTENÇÃO</span>
      <p className='text-center text-sm italic text-primary/70'>Escolha, se houver, o plano de Operação & Manutenção incluso no projeto.</p>
      <div className='flex grow flex-wrap items-start justify-around gap-2 py-2'>
        {getOeMPlans(signaturePlans).map((plan) => (
          <SignaturePlanOptionCard
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
              goToNextStage();
            }}
          />
        ))}
        {/* <div
          onClick={() => {
            setRequestInfo((prev) => ({
              ...prev,
              possuiOeM: 'SIM',
              planoOeM: 'MANUTENÇÃO SIMPLES',
              valorContrato: (prev.valorContrato || 0) + (getPricing(proposal.planos)?.manutencaoSimples || 0),
            }))
            goToNextStage()
          }}
          className={`flex h-fit min-h-[450px] ${
            activePlanId == 1 || requestInfo.planoOeM == 'MANUTENÇÃO SIMPLES' ? 'bg-green-200' : ''
          }  w-[350px] cursor-pointer flex-col gap-2 rounded border border-primary/30 p-3 shadow-lg duration-300 ease-in-out hover:scale-[1.02] hover:bg-blue-50`}
        >
          <h1 className="text-center text-lg font-medium text-primary/80">MANUTENÇÃO SIMPLES</h1>
          <div className="flex grow flex-col gap-4">
            <h1 className="text-center text-xs font-medium text-[#fead61]">ITENS DO PLANO</h1>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">MANUTENÇÃO ELÉTRICA INVERSORES + QUADROS ELÉTRICOS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end text-green-500">
                <BsPatchCheckFill />
              </div>
            </div>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">REAPERTO CONEXÕES ELÉTRICAS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end text-green-500">
                <BsPatchCheckFill />
              </div>
            </div>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">ANÁLISE E CONFERÊNCIA DE GRANDEZAS ELÉTRICAS DOS EQUIPAMENTOS ELÉTRICOS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end text-green-500">
                <BsPatchCheckFill />
              </div>
            </div>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">LIMPEZA NOS MÓDULOS FOTOVOLTAICOS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end text-green-500">
                <BsPatchCheckFill />
              </div>
            </div>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">DISTRIBUIÇÃO DE CRÉDITOS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end text-red-500">
                <AiFillCloseCircle />
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-1">
            <h1 className="text-xs font-thin text-primary/80">VALOR DO SERVIÇO</h1>
            <div className="flex items-center justify-center gap-1 rounded-sm border border-green-500 p-1">
              <MdAttachMoney style={{ color: 'rgb(34,197,94)', fontSize: '20px' }} />
              <p className="text-lg font-medium text-primary/60">
                R${' '}
                {getPricing(proposal.planos)?.manutencaoSimples.toLocaleString('pt-br', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
        <div
          onClick={() => {
            setRequestInfo((prev) => ({
              ...prev,
              possuiOeM: 'SIM',
              planoOeM: 'PLANO SOL',
              valorContrato: (prev.valorContrato || 0) + (getPricing(proposal.planos)?.planoSol || 0),
            }))
            goToNextStage()
          }}
          className={`flex h-fit min-h-[450px] ${
            activePlanId == 2 || requestInfo.planoOeM == 'PLANO SOL' ? 'bg-green-200' : ''
          }  w-[350px] cursor-pointer flex-col gap-2 rounded border border-primary/30 p-3 shadow-lg duration-300 ease-in-out hover:scale-[1.02] hover:bg-blue-50`}
        >
          <h1 className="text-center text-lg font-medium text-primary/80">PLANO SOL</h1>
          <div className="flex grow flex-col gap-4">
            <h1 className="text-center text-xs font-medium text-[#fead61]">ITENS DO PLANO</h1>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">MANUTENÇÃO ELÉTRICA INVERSORES + QUADROS ELÉTRICOS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end text-green-500">
                <BsPatchCheckFill />
              </div>
            </div>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">REAPERTO CONEXÕES ELÉTRICAS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end text-green-500">
                <BsPatchCheckFill />
              </div>
            </div>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">ANÁLISE E CONFERÊNCIA DE GRANDEZAS ELÉTRICAS DOS EQUIPAMENTOS ELÉTRICOS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end text-green-500">
                <BsPatchCheckFill />
              </div>
            </div>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">LIMPEZA NOS MÓDULOS FOTOVOLTAICOS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end text-green-500">
                <BsPatchCheckFill />
              </div>
            </div>
            <div className="flex w-full items-center justify-center">
              <h1 className="text-center text-xs font-medium text-blue-700">MANUTENÇÃO ADICIONAL DURANTE O PLANO POR 50% DO VALOR DO CONTRATO</h1>
            </div>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">DISTRIBUIÇÃO DE CRÉDITOS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end gap-2 text-green-500">
                2x <BsPatchCheckFill />
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-1">
            <h1 className="text-xs font-thin text-primary/80">VALOR DO SERVIÇO</h1>
            <div className="flex items-center justify-center gap-1 rounded-sm border border-green-500 p-1">
              <MdAttachMoney style={{ color: 'rgb(34,197,94)', fontSize: '20px' }} />
              <p className="text-lg font-medium text-primary/60">
                R${' '}
                {getPricing(proposal.planos)?.planoSol.toLocaleString('pt-br', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
        <div
          onClick={() => {
            setRequestInfo((prev) => ({
              ...prev,
              possuiOeM: 'SIM',
              planoOeM: 'PLANO SOL +',
              valorContrato: (prev.valorContrato || 0) + (getPricing(proposal.planos)?.planoSolPlus || 0),
            }))
            goToNextStage()
          }}
          className={`flex h-fit min-h-[450px] ${
            activePlanId == 3 || requestInfo.planoOeM == 'PLANO SOL +' ? 'bg-green-200' : ''
          }  w-[350px] cursor-pointer flex-col gap-2 rounded border border-primary/30 p-3 shadow-lg duration-300 ease-in-out hover:scale-[1.02] hover:bg-blue-50`}
        >
          <h1 className="text-center text-lg font-medium text-primary/80">PLANO SOL+</h1>
          <div className="flex grow flex-col gap-4">
            <h1 className="text-center text-xs font-medium text-[#fead61]">ITENS DO PLANO</h1>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">MANUTENÇÃO ELÉTRICA INVERSORES + QUADROS ELÉTRICOS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end text-green-500">
                <BsPatchCheckFill />
              </div>
            </div>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">REAPERTO CONEXÕES ELÉTRICAS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end text-green-500">
                <BsPatchCheckFill />
              </div>
            </div>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">ANÁLISE E CONFERÊNCIA DE GRANDEZAS ELÉTRICAS DOS EQUIPAMENTOS ELÉTRICOS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end text-green-500">
                <BsPatchCheckFill />
              </div>
            </div>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">LIMPEZA NOS MÓDULOS FOTOVOLTAICOS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end text-green-500">
                <BsPatchCheckFill />
              </div>
            </div>
            <div className="flex w-full items-center justify-center">
              <h1 className="text-center text-xs font-medium text-blue-700">MANUTENÇÃO ADICIONAL DURANTE O PLANO POR 70% DO VALOR DO CONTRATO</h1>
            </div>
            <div className="flex w-full items-center">
              <div className="flex w-[80%] items-center justify-center">
                <h1 className="text-center text-xs font-medium text-primary/70">DISTRIBUIÇÃO DE CRÉDITOS</h1>
              </div>
              <div className="flex w-[20%] items-center justify-end text-green-500">ILIMITADO</div>
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-1">
            <h1 className="text-xs font-thin text-primary/80">VALOR DO SERVIÇO</h1>
            <div className="flex items-center justify-center gap-1 rounded-sm border border-green-500 p-1">
              <MdAttachMoney style={{ color: 'rgb(34,197,94)', fontSize: '20px' }} />
              <p className="text-lg font-medium text-primary/60">
                R${' '}
                {getPricing(proposal.planos)?.planoSolPlus.toLocaleString('pt-br', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div> */}
      </div>
      <div className='mt-2 flex w-full flex-wrap justify-between  gap-2'>
        <button
          onClick={() => {
            goToPreviousStage();
          }}
          className='rounded p-2 font-bold text-primary/70 duration-300 hover:scale-105'
        >
          Voltar
        </button>
        <button
          onClick={() => {
            setRequestInfo((prev) => ({ ...prev, possuiOeM: 'NÃO', planoOeM: 'NÃO SE APLICA' }));
            goToNextStage();
          }}
          className='rounded p-2 font-bold hover:bg-black hover:text-primary-foreground'
        >
          Prosseguir sem plano
        </button>
      </div>
    </div>
  );
}

export default OeMPlansInfo;
