import { getActiveProcessAutomationReference } from '@/utils/process-settings';
import { TProcessSettingNode } from '@/utils/process-settings/store';
import TriggerBlock from './TriggerBlock';

function ActivationBlock(node: TProcessSettingNode) {
  const { id, data } = node;
  const processAutomationEntityReference = getActiveProcessAutomationReference(data.entidade.identificacao);
  const activationAutomationReference = getActiveProcessAutomationReference(data.ativacao.referencia.identificacao);
  return (
    <div className='flex w-full flex-col gap-2 rounded-sm border border-primary/50'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center text-xs font-bold text-primary-foreground'>CONFIGURAÇÃO DE ATIVAÇÃO</h1>
      <div className='flex w-full flex-col gap-2 p-2'>
        <p className='w-full text-center text-[0.65rem] text-primary/70'>
          Configure aqui os parâmetros que ativarão a entidade dessa etapa do processo. Os gatilhos disponíveis utilizam características da entidade
          do processo pai.
        </p>
        <TriggerBlock {...node} />
      </div>
    </div>
  );
}

export default ActivationBlock;
