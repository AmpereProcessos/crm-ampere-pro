import CheckboxInput from '@/components/Inputs/CheckboxInput';
import NumberInput from '@/components/Inputs/NumberInput';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import {
  formatComissionFormulaIndividualItemLabel,
  getComissionScenarioConditionApplicableDefinitions,
  getComissionScenarioConditionOptionsByDefinition,
  MathematicalOperators,
  MethodConditionTypes,
  SaleDefinitions,
} from '@/utils/comissions/helpers';
import type { TUserComissionItem } from '@/utils/schemas/user.schema';
import { useState } from 'react';
import { VscSymbolOperator } from 'react-icons/vsc';

import MultipleSelectInputVirtualized from '@/components/Inputs/MultipleSelectInputVirtualized';
import SelectInput from '@/components/Inputs/SelectInput';
import SelectInputVirtualized from '@/components/Inputs/SelectInputVirtualized';
import { Button } from '@/components/ui/button';
import { cn, useMediaQuery } from '@/lib/utils';
import { usePartnersSimplified } from '@/utils/queries/partners';
import { Plus, SquareSigma } from 'lucide-react';
import { FaShapes } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';
import { TbNumber123 } from 'react-icons/tb';

type ComissionResultModalProps = {
  initialResult?: TUserComissionItem['resultados'][number];
  handleCommitConditionResult: (result: TUserComissionItem['resultados'][number]) => void;
  closeModal: () => void;
};
function ComissionResultModal({ initialResult, handleCommitConditionResult, closeModal }: ComissionResultModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [resultHolder, setResultHolder] = useState<TUserComissionItem['resultados'][number]>(
    initialResult || {
      condicao: {
        aplicavel: false,
      },
      formulaArr: [],
    }
  );

  function updateHolder(partialResult: Partial<TUserComissionItem['resultados'][number]>) {
    setResultHolder((prev) => ({
      ...prev,
      ...partialResult,
    }));
  }

  const TITLE = 'NOVO RESULTADO';
  const DESCRIPTION = 'Preencha aqui informações para adicionar o resultado ao item de custo.';
  const BUTTON_TEXT = 'ADICIONAR CÁLCULO';
  return isDesktop ? (
    <Dialog open={true} onOpenChange={(v) => (!v ? closeModal() : null)}>
      <DialogContent className='min-w-[80%] w-[80%] h-[85vh] dark:bg-background'>
        <DialogHeader>
          <DialogTitle>{TITLE}</DialogTitle>
          <DialogDescription>{DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <div className='flex-1 overflow-auto'>
          <CalculationBlock resultHolder={resultHolder} updateHolder={updateHolder} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>FECHAR</Button>
          </DialogClose>
          <Button onClick={() => handleCommitConditionResult(resultHolder)}>{BUTTON_TEXT}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={true} onOpenChange={(v) => (!v ? closeModal() : null)}>
      <DrawerContent className='h-[85vh] flex flex-col'>
        <DrawerHeader className='text-left'>
          <DrawerTitle>{TITLE}</DrawerTitle>
          <DrawerDescription>{DESCRIPTION}</DrawerDescription>
        </DrawerHeader>
        <div className='flex-1 overflow-auto'>
          <CalculationBlock resultHolder={resultHolder} updateHolder={updateHolder} />
        </div>
        <DrawerFooter className='pt-2'>
          <Button onClick={() => handleCommitConditionResult(resultHolder)}>{BUTTON_TEXT}</Button>
          <DrawerClose asChild>
            <Button variant='outline'>FECHAR</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
export default ComissionResultModal;

type CalculationBlockProps = {
  resultHolder: TUserComissionItem['resultados'][number];
  updateHolder: (result: Partial<TUserComissionItem['resultados'][number]>) => void;
};
function CalculationBlock({ resultHolder, updateHolder }: CalculationBlockProps) {
  const { data: partners } = usePartnersSimplified();
  function addToFormula(value: string) {
    updateHolder({
      formulaArr: [...resultHolder.formulaArr, value],
    });
  }
  function removeFromFormula(index: number) {
    updateHolder({
      formulaArr: resultHolder.formulaArr.filter((_, i) => i !== index),
    });
  }
  const partnersMetadata = partners?.map((p) => ({ id: p._id, label: p.nome, value: p._id }));
  return (
    <div className='flex w-full flex-col gap-2'>
      <h1 className='w-full text-center text-xs font-black tracking-tight'>CONSTRUÇÃO DE CÁLCULO</h1>
      <div className='h-px w-full rounded-lg bg-primary' />
      <FormulaManagementBlock formula={resultHolder.formulaArr} addToFormula={addToFormula} removeFromFormula={removeFromFormula} />

      {/** CONFIGURATIONS */}
      <div className='flex w-full flex-col gap-2'>
        <div className='flex items-center gap-1'>
          <MdSettings width={15} height={15} />
          <h1 className='py-0.5 text-center text-xs font-medium italic text-primary/80'>CONFIGURAÇÕES</h1>
        </div>
        <p className='w-full text-start text-sm font-light tracking-tighter text-primary/80'>
          Define aqui alguns parâmetros para o cenário de comissão.
        </p>
        <div className='flex w-full items-center justify-center'>
          <div className='w-fit'>
            <CheckboxInput
              labelFalse='RESULTADO APLICÁVEL SOB CONDIÇÃO'
              labelTrue='RESULTADO APLICÁVEL SOB CONDIÇÃO'
              labelClassName='text-[0.6rem]'
              checked={resultHolder.condicao.aplicavel}
              handleChange={(value) =>
                updateHolder({
                  condicao: {
                    aplicavel: value,
                    tipo: value ? MethodConditionTypes[0]?.value : undefined,
                    variavel: undefined,
                    maiorQue: undefined,
                    menorQue: undefined,
                    entre: undefined,
                    igual: undefined,
                    inclui: undefined,
                  },
                })
              }
            />
          </div>
        </div>

        {resultHolder.condicao.aplicavel && resultHolder.condicao.tipo ? (
          <div className='flex w-full flex-col items-center gap-2'>
            <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-1/2'>
                <SelectInput
                  label='TIPO DE CONDIÇÃO'
                  labelClassName='text-[0.6rem]'
                  holderClassName='text-xs p-2 min-h-[34px]'
                  options={MethodConditionTypes}
                  value={resultHolder.condicao.tipo}
                  handleChange={(value) =>
                    updateHolder({
                      condicao: {
                        ...resultHolder.condicao,
                        tipo: value,
                        variavel: undefined,
                        maiorQue: undefined,
                        menorQue: undefined,
                        entre: undefined,
                        igual: undefined,
                        inclui: undefined,
                      },
                    })
                  }
                  resetOptionLabel='NÃO'
                  onReset={() =>
                    updateHolder({
                      condicao: {
                        ...resultHolder.condicao,
                        tipo: undefined,
                        variavel: undefined,
                        maiorQue: undefined,
                        menorQue: undefined,
                        entre: undefined,
                        igual: undefined,
                        inclui: undefined,
                      },
                    })
                  }
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-1/2'>
                <SelectInput
                  label='VARIÁVEL'
                  labelClassName='text-[0.6rem]'
                  holderClassName='text-xs p-2 min-h-[34px]'
                  options={getComissionScenarioConditionApplicableDefinitions({
                    conditionType: resultHolder.condicao.tipo,
                    definitions: SaleDefinitions,
                  }).map((p) => ({ id: p.identifier, label: p.label, value: p.identifier }))}
                  value={resultHolder.condicao.variavel}
                  handleChange={(value) =>
                    updateHolder({
                      condicao: {
                        ...resultHolder.condicao,
                        variavel: value,
                      },
                    })
                  }
                  resetOptionLabel='NÃO'
                  onReset={() => updateHolder({ condicao: { ...resultHolder.condicao, variavel: undefined } })}
                  width='100%'
                />
              </div>
            </div>
            {resultHolder.condicao.tipo === 'IGUAL_TEXTO' && resultHolder.condicao.variavel ? (
              <SelectInputVirtualized
                label='IGUAL A:'
                labelClassName='text-[0.6rem]'
                holderClassName='text-xs p-2 min-h-[34px]'
                value={resultHolder.condicao.igual}
                // options={options[resultHolder.condicao.variavel as keyof typeof options]?.map((op, index) => ({ id: index + 1, label: op, value: op })) || []}
                options={getComissionScenarioConditionOptionsByDefinition({
                  conditionVariable: resultHolder.condicao.variavel,
                  definitions: SaleDefinitions,
                  metadata: { partners: partnersMetadata || [] },
                })}
                handleChange={(value) => updateHolder({ condicao: { ...resultHolder.condicao, igual: value } })}
                resetOptionLabel='NÃO DEFINIDO'
                onReset={() => updateHolder({ condicao: { ...resultHolder.condicao, igual: undefined } })}
                width='100%'
              />
            ) : null}
            {resultHolder.condicao.tipo === 'IGUAL_NÚMERICO' && resultHolder.condicao.variavel ? (
              <NumberInput
                label='IGUAL A:'
                labelClassName='text-[0.6rem]'
                holderClassName='text-xs p-2 min-h-[34px]'
                placeholder='Preencha o valor para comparação.'
                value={resultHolder.condicao.igual != null && resultHolder.condicao.igual !== undefined ? Number(resultHolder.condicao.igual) : null}
                handleChange={(value) => updateHolder({ condicao: { ...resultHolder.condicao, igual: value.toString() } })}
                width='100%'
              />
            ) : null}
            {resultHolder.condicao.tipo === 'MAIOR_QUE_NÚMERICO' && resultHolder.condicao.variavel ? (
              <NumberInput
                label='MAIOR QUE:'
                labelClassName='text-[0.6rem]'
                holderClassName='text-xs p-2 min-h-[34px]'
                placeholder='Preencha o valor para comparação.'
                value={
                  resultHolder.condicao.maiorQue !== null && resultHolder.condicao.maiorQue !== undefined
                    ? Number(resultHolder.condicao.maiorQue)
                    : null
                }
                handleChange={(value) => updateHolder({ condicao: { ...resultHolder.condicao, maiorQue: value } })}
                width='100%'
              />
            ) : null}
            {resultHolder.condicao.tipo === 'MENOR_QUE_NÚMERICO' && resultHolder.condicao.variavel ? (
              <NumberInput
                label='MENOR QUE:'
                labelClassName='text-[0.6rem]'
                holderClassName='text-xs p-2 min-h-[34px]'
                placeholder='Preencha o valor para comparação.'
                value={
                  resultHolder.condicao.menorQue !== null && resultHolder.condicao.menorQue !== undefined
                    ? Number(resultHolder.condicao.menorQue)
                    : null
                }
                handleChange={(value) => updateHolder({ condicao: { ...resultHolder.condicao, menorQue: value } })}
                width='100%'
              />
            ) : null}
            {resultHolder.condicao.tipo === 'INTERVALO_NÚMERICO' && resultHolder.condicao.variavel ? (
              <div className='flex w-full flex-col gap-2 lg:flex-row'>
                <div className='w-full lg:w-1/2'>
                  <NumberInput
                    label='MAIOR QUE:'
                    labelClassName='text-[0.6rem]'
                    holderClassName='text-xs p-2 min-h-[34px]'
                    placeholder='Preencha o valor mínimo do intervalo.'
                    value={
                      resultHolder.condicao.entre !== null && resultHolder.condicao.entre !== undefined ? Number(resultHolder.condicao.entre) : null
                    }
                    handleChange={(value) =>
                      updateHolder({
                        condicao: {
                          ...resultHolder.condicao,
                          entre: { ...resultHolder.condicao.entre, minimo: value, maximo: resultHolder.condicao.entre?.maximo || 0 },
                        },
                      })
                    }
                    width='100%'
                  />
                </div>
                <div className='w-full lg:w-1/2'>
                  <NumberInput
                    label='MENOR QUE:'
                    labelClassName='text-[0.6rem]'
                    holderClassName='text-xs p-2 min-h-[34px]'
                    placeholder='Preencha o valor máximo do intervalo.'
                    value={
                      resultHolder.condicao.entre !== null && resultHolder.condicao.entre !== undefined ? Number(resultHolder.condicao.entre) : null
                    }
                    handleChange={(value) =>
                      updateHolder({
                        condicao: {
                          ...resultHolder.condicao,
                          entre: { ...resultHolder.condicao.entre, minimo: resultHolder.condicao.entre?.minimo || 0, maximo: value },
                        },
                      })
                    }
                    width='100%'
                  />
                </div>
              </div>
            ) : null}
            {resultHolder.condicao.tipo === 'INCLUI_LISTA' && resultHolder.condicao.variavel ? (
              <MultipleSelectInputVirtualized
                label='INCLUSO EM:'
                labelClassName='text-[0.6rem]'
                holderClassName='text-xs p-2 min-h-[34px]'
                selected={resultHolder.condicao.inclui || null}
                options={getComissionScenarioConditionOptionsByDefinition({
                  conditionVariable: resultHolder.condicao.variavel,
                  definitions: SaleDefinitions,
                  metadata: { partners: partnersMetadata || [] },
                })}
                handleChange={(value) => updateHolder({ condicao: { ...resultHolder.condicao, inclui: value as string[] } })}
                onReset={() => updateHolder({ condicao: { ...resultHolder.condicao, inclui: null } })}
                resetOptionLabel='NÃO DEFINIDO'
                width='100%'
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

type FormulaManagementBlockProps = {
  formula: TUserComissionItem['resultados'][number]['formulaArr'];
  addToFormula: (value: string) => void;
  removeFromFormula: (index: number) => void;
};
function FormulaManagementBlock({ formula, addToFormula, removeFromFormula }: FormulaManagementBlockProps) {
  const NumericalSaleDefinitions = SaleDefinitions.filter((sd) => sd.type === 'NÚMERICO');
  const [formulaNumberHolder, setFormulaNumberHolder] = useState<number>(0);

  return (
    <>
      {/**VARIABLES */}
      <div className='flex w-full flex-col gap-2'>
        <div className='flex items-center gap-1'>
          <TbNumber123 width={15} height={15} />
          <h1 className='py-0.5 text-center text-xs font-medium italic text-primary/80'>NÚMEROS</h1>
        </div>
        <p className='w-full text-start text-sm font-light tracking-tighter text-primary/80'>
          Preencha aqui um número e clique no botão de adicionar para adicionar à fórmula.
        </p>
        <div className='flex w-full items-center gap-2'>
          <div className='grow'>
            <NumberInput
              label='NÚMERO'
              showLabel={false}
              placeholder='Preencha aqui um número para a fórmula...'
              labelClassName='text-[0.6rem]'
              holderClassName='text-xs p-2 min-h-[34px]'
              value={formulaNumberHolder}
              handleChange={(value) => setFormulaNumberHolder(value)}
              width='100%'
            />
          </div>
          <button
            type='button'
            onClick={() => addToFormula(formulaNumberHolder.toString())}
            className='flex items-center justify-center rounded-full bg-primary p-1 text-primary-foreground'
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
      {/**SALE PROPOSAL PREMISSES */}
      <div className='flex w-full flex-col gap-2'>
        <div className='flex items-center gap-1'>
          <FaShapes width={15} height={15} />
          <h1 className='py-0.5 text-center text-xs font-medium italic text-primary/80'>PREMISSAS NÚMERICAS DA VENDA</h1>
        </div>
        <p className='w-full text-start text-sm font-light tracking-tighter text-primary/80'>
          Clique em uma das premissas númericas da venda para adiciona-la à fórmula.
        </p>
        <div className='my-2 flex flex-wrap items-center gap-2'>
          {NumericalSaleDefinitions.map((va, index) => (
            <button
              type='button'
              key={`${index}-${va.identifier}`}
              onClick={() => addToFormula(`[${va.identifier}]`)}
              className='grow rounded-sm border border-primary/80 px-4 py-1 text-[0.65rem] font-medium text-primary/80 duration-300 ease-in-out hover:bg-primary/80 hover:text-primary-foreground'
            >
              {va.label}
            </button>
          ))}
        </div>
      </div>

      {/** MATHEMATICAL OPERATORS */}
      <div className='flex w-full flex-col gap-2'>
        <div className='flex items-center gap-1'>
          <VscSymbolOperator width={15} height={15} />
          <h1 className='py-0.5 text-center text-xs font-medium italic text-primary/80'>OPERADORES MATEMÁTICOS</h1>
        </div>
        <p className='w-full text-start text-sm font-light tracking-tighter text-primary/80'>
          Clique em um dos operadores matemáticos para adiciona-lo à fórmula.
        </p>
        <div className='my-2 flex flex-wrap items-center gap-2'>
          {MathematicalOperators.map((va, index) => (
            <button
              type='button'
              key={`${index}-${va.value}`}
              onClick={() => addToFormula(va.value)}
              className='text-medium grow rounded-sm border border-primary/80 px-4 py-1 text-[0.65rem] font-medium text-primary/80 duration-300 ease-in-out hover:bg-primary/80 hover:text-primary-foreground'
            >
              {va.value}
            </button>
          ))}
        </div>
      </div>
      {/** FÓRMULA */}
      <div className='flex w-full flex-col gap-2'>
        <div className='flex items-center gap-1 self-center'>
          <SquareSigma width={15} height={15} />
          <h1 className='py-0.5 text-center text-xs font-medium italic text-primary/80'>FÓRMULA</h1>
        </div>
        <div className='my-2 flex w-full flex-col items-center gap-2 lg:flex-row'>
          <p className='w-[50px] p-1 text-center text-xl font-black'>=</p>
          <div className='flex min-h-[52px] w-full items-center justify-center gap-1 rounded-md border border-blue-800 p-3'>
            {formula.map((y, index) => (
              <button
                type='button'
                key={`${index}-${y}`}
                onClick={() => removeFromFormula(index)}
                className={cn('cursor-pointer rounded-lg p-1 text-[0.65rem] font-medium duration-300 hover:bg-primary/20 dark:hover:bg-primary/50', {
                  'bg-primary/80 px-4 text-primary-foreground dark:bg-primary/20': y.includes('[') && y.includes(']'),
                })}
              >
                {formatComissionFormulaIndividualItemLabel({ item: y, definitions: SaleDefinitions })}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
