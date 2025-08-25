import { getActiveProcessAutomationReference, ProcessAutomationEntitiesSpecs } from '@/utils/process-settings';
import { TProcessSettingNode, useProjectSettingStore } from '@/utils/process-settings/store';
import CustomizationBlock from './CustomizationBlock';

type ReturnBlockProps = TProcessSettingNode;
function ReturnBlock(node: ReturnBlockProps) {
  const { id, data } = node;
  const [updateNodeData, addNode] = useProjectSettingStore((state) => [state.updateNodeData, state.addNode]);
  const activeAutomationReference = getActiveProcessAutomationReference(data.referencia.entidade);
  if (!activeAutomationReference.returns) return null;
  return (
    <div className='flex w-full flex-col gap-2'>
      <h1 className='w-full rounded-sm p-1 text-center text-xs font-bold text-blue-500'>ENTIDADE DE RETORNO</h1>
      <div className='flex w-full flex-col gap-2 p-2'>
        <div className='flex flex-wrap items-center gap-2'>
          {ProcessAutomationEntitiesSpecs.filter((p) => !!p.returnable).map((p, index) => (
            <button
              key={index}
              onClick={() => {
                updateNodeData(id, { ...data, retorno: { entidade: p.entity, customizacao: {} } });
              }}
              className={`grow ${
                p.entity == data.retorno.entidade ? 'bg-green-700  text-primary-foreground' : 'text-green-700 '
              } rounded border border-green-700  p-1 text-xs font-medium  duration-300 ease-in-out hover:bg-green-700  hover:text-primary-foreground`}
            >
              {p.entityLabel}
            </button>
          ))}
        </div>
        <CustomizationBlock {...node} />
      </div>
    </div>
  );
}

export default ReturnBlock;
