import CheckboxInput from '@/components/Inputs/CheckboxInput';
import { getActiveProcessAutomationReference } from '@/utils/process-settings';
import { TProcessSettingNode, useProjectSettingStore } from '@/utils/process-settings/store';
import { nanoid } from 'nanoid';
import ReturnBlock from './ReturnBlock';
import TriggerBlock from './TriggerBlock';

function ReturnConfigurationBlock(node: TProcessSettingNode) {
  const { id, data } = node;
  const activeAutomationReference = getActiveProcessAutomationReference(data.referencia.entidade);
  const [updateNodeData, addNode] = useProjectSettingStore((state) => [state.updateNodeData, state.addNode]);
  return (
    <div className='flex w-full flex-col gap-2 rounded-sm border border-primary/50'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center text-xs font-bold text-primary-foreground'>CONFIGURAÇÃO DE RETORNO</h1>
      <div className='flex w-full flex-col gap-2 p-2'>
        {activeAutomationReference.returns ? (
          <>
            <div className='flex w-full items-center justify-center'>
              <div draggable={false} className='w-fit'>
                <CheckboxInput
                  labelFalse='CONFIGURAR PROCESSO DEPENDENTE'
                  labelTrue='CONFIGURAR PROCESSO DEPENDENTE'
                  checked={!!data.retorno.entidade}
                  handleChange={(value) => {
                    console.log(value);
                    if (!!value) updateNodeData(id, { ...data, retorno: { ...data.retorno, entidade: 'Activity' } });
                    else updateNodeData(id, { ...data, retorno: { ...data.retorno, entidade: null } });
                  }}
                />
              </div>
            </div>
            {!!data.retorno.entidade ? (
              <>
                <TriggerBlock {...node} />
                <ReturnBlock {...node} />
                <div className='mt-4 flex w-full items-center justify-end'>
                  <button
                    onClick={() => {
                      const newPosition = { x: node.position.x, y: node.position.y + 800 };
                      addNode({
                        parentNode: node,
                        newNode: {
                          id: nanoid(6),
                          data: {
                            id: nanoid(),
                            idProcessoPai: node.data.id,
                            referencia: {
                              entidade: data.retorno.entidade || 'Activity',
                            },
                            gatilho: {
                              tipo: getActiveProcessAutomationReference(data.retorno.entidade || undefined).triggerConditions[0]?.types[0] || null,
                              variavel: getActiveProcessAutomationReference(data.retorno.entidade || undefined).triggerConditions[0]?.value || '',
                            },
                            retorno: {
                              entidade: 'Activity',
                              customizacao: {},
                            },
                            canvas: {},
                          },
                          type: data.retorno.entidade?.toLowerCase(),
                          position: newPosition,
                        },
                      });
                    }}
                    className='h-9 whitespace-nowrap rounded-sm bg-green-700 px-2 py-1 text-xs font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-green-600 enabled:hover:text-primary-foreground'
                  >
                    ADICIONAR PROCESSO DEPENDENTE
                  </button>
                </div>
              </>
            ) : null}
          </>
        ) : (
          <h1 className='w-full max-w-full break-words rounded-sm border border-primary/50 bg-primary/10p-1 text-center text-[0.65rem] tracking-tight text-primary/70'>
            ESSA ENTIDADE NÃO PERMITE PROCESSOS DEPENDENTES.
          </h1>
        )}
      </div>
    </div>
  );
}

export default ReturnConfigurationBlock;
