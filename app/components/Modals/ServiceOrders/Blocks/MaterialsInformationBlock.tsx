import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { TServiceOrder, TServiceOrderMaterialItem } from '@/utils/schemas/service-order.schema';
import { ProductItemCategories, Units } from '@/utils/select-options';
import React, { useState } from 'react';
import MaterialsTableBlock from './Utils/MaterialsTableBlock';
export type TServiceOrderGeneralMaterial = TServiceOrderMaterialItem & { index: number; tipo: 'DISPONÍVEIS' | 'RETIRÁVEIS' };
type MaterialsInformationBlockProps = {
  infoHolder: TServiceOrder;
  setInfoHolder: React.Dispatch<React.SetStateAction<TServiceOrder>>;
};
function MaterialsInformationBlock({ infoHolder, setInfoHolder }: MaterialsInformationBlockProps) {
  const [materialHolder, setMaterialHolder] = useState<TServiceOrderMaterialItem>({
    idMaterial: null,
    categoria: 'INSUMO',
    descricao: '',
    qtde: 0,
    unidade: 'UN',
  });
  function addAsAvailable(material: TServiceOrderMaterialItem) {
    var productsArr = [...infoHolder.materiais.disponiveis];
    productsArr.push(material);
    setInfoHolder((prev) => ({ ...prev, materiais: { ...prev.materiais, disponiveis: productsArr } }));
    setMaterialHolder({
      idMaterial: null,
      categoria: 'INSUMO',
      descricao: '',
      qtde: 0,
      unidade: 'UN',
    });
  }
  function addForExtraction(material: TServiceOrderMaterialItem) {
    var productsArr = [...infoHolder.materiais.retiraveis];
    productsArr.push(material);
    setInfoHolder((prev) => ({ ...prev, materiais: { ...prev.materiais, retiraveis: productsArr } }));
    setMaterialHolder({
      idMaterial: null,
      categoria: 'INSUMO',
      descricao: '',
      qtde: 0,
      unidade: 'UN',
    });
  }
  const allMaterials: TServiceOrderGeneralMaterial[] = [
    ...infoHolder.materiais.disponiveis.map((av, index) => ({ ...av, tipo: 'DISPONÍVEIS' as 'DISPONÍVEIS', index })),
    ...infoHolder.materiais.retiraveis.map((av, index) => ({ ...av, tipo: 'RETIRÁVEIS' as 'RETIRÁVEIS', index })),
  ];
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-white'>INFORMAÇÕES DE MATERIAIS</h1>
      <div className='flex w-full flex-col gap-2'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-[30%]'>
            <SelectInput
              label='CATEGORIA'
              resetOptionLabel='NÃO DEFINIDO'
              options={ProductItemCategories}
              value={materialHolder.categoria}
              handleChange={(value) =>
                setMaterialHolder((prev) => ({
                  ...prev,
                  categoria: value,
                }))
              }
              onReset={() => {
                setMaterialHolder((prev) => ({
                  ...prev,
                  categoria: 'OUTROS',
                }));
              }}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[30%]'>
            <TextInput
              label='DESCRIÇÃO'
              placeholder='DESCRIÇÃO'
              value={materialHolder.descricao}
              handleChange={(value) =>
                setMaterialHolder((prev) => ({
                  ...prev,
                  descricao: value,
                }))
              }
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[20%]'>
            <SelectInput
              label='UNIDADE'
              value={materialHolder.unidade}
              handleChange={(value) => setMaterialHolder((prev) => ({ ...prev, unidade: value }))}
              options={Units}
              onReset={() => setMaterialHolder((prev) => ({ ...prev, unidade: 'UN' }))}
              resetOptionLabel='NÃO DEFINIDO'
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[20%]'>
            <NumberInput
              label='QTDE'
              value={materialHolder.qtde}
              handleChange={(value) =>
                setMaterialHolder((prev) => ({
                  ...prev,
                  qtde: Number(value),
                }))
              }
              placeholder='QTDE'
              width='100%'
            />
          </div>
        </div>
        <div className='flex flex-col items-center justify-end gap-1 lg:flex-row lg:gap-4'>
          <button
            className='rounded bg-[#fead41] p-1 px-4 text-xs font-medium text-white duration-300 ease-in-out hover:bg-yellow-400'
            onClick={() => addAsAvailable(materialHolder)}
          >
            ADICIONAR COMO DISPONÍVEL
          </button>
          <button
            className='rounded bg-[#15599a] p-1 px-4 text-xs font-medium text-white duration-300 ease-in-out hover:bg-blue-800'
            onClick={() => addForExtraction(materialHolder)}
          >
            ADICIONAR PARA RETIRADA
          </button>
        </div>
        <MaterialsTableBlock allMaterials={allMaterials} infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
      </div>
    </div>
  );
}

export default MaterialsInformationBlock;
