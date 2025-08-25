import { getActiveProcessAutomationReference } from '@/utils/process-settings';
import { TProcessSettingNode } from '@/utils/process-settings/store';
import Activity from '../CustomizationBlocks/Activity';
import Notification from '../CustomizationBlocks/Notification';

function CustomizationBlock(node: TProcessSettingNode) {
  const { id, data } = node;
  const activeAutomationReference = getActiveProcessAutomationReference(data.entidade.identificacao);
  return (
    <div className='flex w-full flex-col gap-2'>
      <h1 className='w-full rounded-sm p-1 text-center text-xs font-bold text-blue-500'>CUSTOMIZAÇÃO</h1>
      <div className='flex w-full flex-col gap-2 p-2'>
        {activeAutomationReference.customizable ? (
          <>
            {node.data.entidade.identificacao == 'Activity' ? <Activity {...node} /> : null}
            {node.data.entidade.identificacao == 'Notification' ? <Notification {...node} /> : null}
          </>
        ) : (
          <h1 className='w-full max-w-full break-words rounded-sm border border-primary/50 bg-gray-50 p-1 text-center text-[0.65rem] tracking-tight text-primary/50'>
            ESSA ENTIDADE DE RETORNO NÃO É CUSTOMIZÁVEL E SUAS INFORMAÇÕES SÃO OBTIDAS POR PADRÃO.
          </h1>
        )}
      </div>
    </div>
  );
}

export default CustomizationBlock;
