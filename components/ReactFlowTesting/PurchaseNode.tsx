import { getActiveProcessAutomationReference } from '@/utils/process-settings';
import { TIndividualProcess } from '@/utils/schemas/process-flow.schema';
import { BsCartFill } from 'react-icons/bs';
import { Handle, NodeProps, Position } from 'reactflow';
import ActivationBlock from './ProcessSettingBlocks/ActivationBlock';
import CustomizationBlock from './ProcessSettingBlocks/CustomizationBlock';
import ReturnDependentProcessBlock from './ProcessSettingBlocks/ReturnDependentProcessBlock';

function PurchaseNode(node: NodeProps<TIndividualProcess>) {
  const { id, data } = node;
  const entityReference = getActiveProcessAutomationReference(data.entidade.identificacao);
  return (
    <>
      <Handle type='target' position={Position.Top} id='purchase-target' />
      <div className='flex min-w-[700px] max-w-[700px] flex-col gap-2 rounded-sm border border-primary/50 bg-background p-6 '>
        <div className='flex items-center gap-1'>
          <div className='flex h-[35px] w-[35px] items-center justify-center rounded-full border border-black p-1'>
            <BsCartFill />
          </div>
          <h1 className='text-xl font-black leading-none tracking-tight'>COMPRA</h1>
        </div>
        <p className='w-full text-center text-xs tracking-tight'>{entityReference.description}</p>
        <CustomizationBlock position={{ x: node.xPos, y: node.yPos }} {...node} />
        <ActivationBlock position={{ x: node.xPos, y: node.yPos }} {...node} />
        <ReturnDependentProcessBlock position={{ x: node.xPos, y: node.yPos }} {...node} />
      </div>
      <Handle type='source' position={Position.Bottom} id='purchase-source' />
    </>
  );
}

export default PurchaseNode;
