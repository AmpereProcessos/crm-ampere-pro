import { getActiveProcessAutomationReference, getProcessAutomationComparationMethods } from '@/utils/process-settings';
import { getProcessAutomationConditionOptions, TProcessAutomationConditionData } from '@/utils/process-settings/helpers';
import { TProcessSettingNode, useProjectSettingStore } from '@/utils/process-settings/store';

import MultipleSelectInput from '../../Inputs/MultipleSelectInput';
import NumberInput from '../../Inputs/NumberInput';
import SelectInput from '../../Inputs/SelectInput';

type TriggerBlockProps = TProcessSettingNode;
function TriggerBlock(node: TriggerBlockProps) {
  const { id, data } = node;
  const activationAutomationReference = getActiveProcessAutomationReference(data.ativacao.referencia.identificacao);
  const updateNodeData = useProjectSettingStore((state) => state.updateNodeData);

  return (
    <div className='flex w-full flex-col gap-2'>
      <h1 className='w-full rounded-sm p-1 text-center text-xs font-bold text-blue-500'>GATILHO</h1>
      <div className='flex w-full flex-col gap-2 p-2'>
        <h1 className='w-full text-xs font-light tracking-tight text-primary/70'>VARIÁVEL</h1>
        <div className='flex flex-wrap items-center gap-2'>
          {activationAutomationReference.triggerConditions.map((c, index) => (
            <button
              draggable={false}
              key={index}
              onClick={() => {
                updateNodeData(id, {
                  ...data,
                  ativacao: {
                    ...data.ativacao,
                    gatilho: { ...data.ativacao.gatilho, variavel: c.value, igual: null, entre: null, maiorQue: null, menorQue: null, inclui: null },
                  },
                });
              }}
              className={`grow ${
                c.value == data.ativacao.gatilho.variavel ? 'bg-blue-700  text-primary-foreground' : 'text-blue-700 '
              } rounded border border-blue-700  p-1 text-xs font-medium  duration-300 ease-in-out hover:bg-blue-700  hover:text-primary-foreground`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <h1 className='w-full text-xs font-light tracking-tight text-primary/70'>COMPARAÇÃO</h1>
        <div className='flex flex-wrap items-center gap-2'>
          {getProcessAutomationComparationMethods({ entity: activationAutomationReference, variable: data.ativacao.gatilho.variavel }).map(
            (method) => (
              <button
                draggable={false}
                key={method.id}
                onClick={() => {
                  updateNodeData(id, {
                    ...data,
                    ativacao: {
                      ...data.ativacao,
                      gatilho: {
                        ...data.ativacao.gatilho,
                        tipo: method.value,
                        igual: undefined,
                        maiorQue: undefined,
                        menorQue: undefined,
                        entre: undefined,
                        inclui: undefined,
                      },
                    },
                  });
                }}
                className={`grow ${
                  method.value == data.ativacao.gatilho.tipo ? 'bg-orange-700  text-primary-foreground' : 'text-orange-700 '
                } rounded border border-orange-700  p-1 text-xs font-medium  duration-300 ease-in-out hover:bg-orange-700  hover:text-primary-foreground`}
              >
                {method.label}
              </button>
            )
          )}
        </div>
        {data.ativacao.gatilho.tipo == 'IGUAL_TEXTO' ? (
          <SelectInput
            label='IGUAL A:'
            labelClassName='w-full text-start text-xs font-light tracking-tight text-primary/70'
            value={data.ativacao.gatilho.igual}
            // options={options[infoHolder.gatilho.variavel as keyof typeof options]?.map((op, index) => ({ id: index + 1, label: op, value: op })) || []}
            options={getProcessAutomationConditionOptions({
              variable: data.ativacao.gatilho.variavel as keyof TProcessAutomationConditionData,
            })}
            handleChange={(value) =>
              updateNodeData(id, { ...data, ativacao: { ...data.ativacao, gatilho: { ...data.ativacao.gatilho, igual: value } } })
            }
            resetOptionLabel='NÃO DEFINIDO'
            onReset={() => updateNodeData(id, { ...data, ativacao: { ...data.ativacao, gatilho: { ...data.ativacao.gatilho, igual: null } } })}
            width='100%'
          />
        ) : null}
        {data.ativacao.gatilho.tipo == 'IGUAL_NÚMERICO' ? (
          <NumberInput
            label='IGUAL A:'
            labelClassName='w-full text-start text-xs font-light tracking-tight text-primary/70'
            placeholder='Preencha o valor para comparação.'
            value={data.ativacao.gatilho.igual != null && data.ativacao.gatilho.igual != undefined ? Number(data.ativacao.gatilho.igual) : null}
            handleChange={(value) =>
              updateNodeData(id, { ...data, ativacao: { ...data.ativacao, gatilho: { ...data.ativacao.gatilho, igual: value.toString() } } })
            }
            width='100%'
          />
        ) : null}
        {data.ativacao.gatilho.tipo == 'MAIOR_QUE_NÚMERICO' ? (
          <NumberInput
            label='MAIOR QUE:'
            labelClassName='w-full text-start text-xs font-light tracking-tight text-primary/70'
            placeholder='Preencha o valor para comparação.'
            value={
              data.ativacao.gatilho.maiorQue != null && data.ativacao.gatilho.maiorQue != undefined ? Number(data.ativacao.gatilho.maiorQue) : null
            }
            handleChange={(value) =>
              updateNodeData(id, { ...data, ativacao: { ...data.ativacao, gatilho: { ...data.ativacao.gatilho, maiorQue: value } } })
            }
            width='100%'
          />
        ) : null}
        {data.ativacao.gatilho.tipo == 'MENOR_QUE_NÚMERICO' ? (
          <NumberInput
            label='MENOR QUE:'
            labelClassName='w-full text-start text-xs font-light tracking-tight text-primary/70'
            placeholder='Preencha o valor para comparação.'
            value={
              data.ativacao.gatilho.menorQue != null && data.ativacao.gatilho.menorQue != undefined ? Number(data.ativacao.gatilho.menorQue) : null
            }
            handleChange={(value) =>
              updateNodeData(id, { ...data, ativacao: { ...data.ativacao, gatilho: { ...data.ativacao.gatilho, menorQue: value } } })
            }
            width='100%'
          />
        ) : null}
        {data.ativacao.gatilho.tipo == 'INTERVALO_NÚMERICO' ? (
          <div className='flex w-full flex-col gap-2 lg:flex-row'>
            <div className='w-full lg:w-1/2'>
              <NumberInput
                label='MAIOR QUE:'
                labelClassName='w-full text-start text-xs font-light tracking-tight text-primary/70'
                placeholder='Preencha o valor mínimo do intervalo.'
                value={
                  data.ativacao.gatilho.entre?.minimo != null && data.ativacao.gatilho.entre?.minimo != undefined
                    ? Number(data.ativacao.gatilho.entre?.minimo)
                    : null
                }
                handleChange={(value) =>
                  updateNodeData(id, {
                    ...data,
                    ativacao: {
                      ...data.ativacao,
                      gatilho: {
                        ...data.ativacao.gatilho,
                        entre: data.ativacao.gatilho.entre ? { ...data.ativacao.gatilho.entre, minimo: value } : { minimo: value, maximo: 0 },
                      },
                    },
                  })
                }
                width='100%'
              />
            </div>
            <div className='w-full lg:w-1/2'>
              <NumberInput
                label='MENOR QUE:'
                labelClassName='w-full text-start text-xs font-light tracking-tight text-primary/70'
                placeholder='Preencha o valor máximo do intervalo.'
                value={
                  data.ativacao.gatilho.entre?.maximo != null && data.ativacao.gatilho.entre?.maximo != undefined
                    ? Number(data.ativacao.gatilho.entre?.maximo)
                    : null
                }
                handleChange={(value) =>
                  updateNodeData(id, {
                    ...data,
                    ativacao: {
                      ...data.ativacao,
                      gatilho: {
                        ...data.ativacao.gatilho,
                        entre: data.ativacao.gatilho.entre ? { ...data.ativacao.gatilho.entre, maximo: value } : { minimo: 0, maximo: value },
                      },
                    },
                  })
                }
                width='100%'
              />
            </div>
          </div>
        ) : null}
        {data.ativacao.gatilho.tipo == 'INCLUI_LISTA' ? (
          <MultipleSelectInput
            label='INCLUSO EM:'
            labelClassName='w-full text-start text-xs font-light tracking-tight text-primary/70'
            selected={data.ativacao.gatilho.inclui || null}
            options={getProcessAutomationConditionOptions({
              variable: data.ativacao.gatilho.variavel as keyof TProcessAutomationConditionData,
            })}
            handleChange={(value) =>
              updateNodeData(id, { ...data, ativacao: { ...data.ativacao, gatilho: { ...data.ativacao.gatilho, inclui: value as string[] } } })
            }
            onReset={() => updateNodeData(id, { ...data, ativacao: { ...data.ativacao, gatilho: { ...data.ativacao.gatilho, inclui: [] } } })}
            resetOptionLabel='NÃO DEFINIDO'
            width='100%'
          />
        ) : null}
      </div>
    </div>
  );
}

export default TriggerBlock;
