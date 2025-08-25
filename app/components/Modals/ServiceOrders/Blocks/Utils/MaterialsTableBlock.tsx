import { TServiceOrder } from '@/utils/schemas/service-order.schema';
import React from 'react';
import { TServiceOrderGeneralMaterial } from '../MaterialsInformationBlock';
import MaterialsTableBlockItem from './MaterialsTableBlockItem';

type MaterialsTableBlockProps = {
  infoHolder: TServiceOrder;
  setInfoHolder: React.Dispatch<React.SetStateAction<TServiceOrder>>;
  allMaterials: TServiceOrderGeneralMaterial[];
};
function MaterialsTableBlock({ infoHolder, setInfoHolder, allMaterials }: MaterialsTableBlockProps) {
  function updateItem({ item }: { item: TServiceOrderGeneralMaterial }) {
    if (item.tipo == 'DISPONÍVEIS') {
      const index = item.index;
      const newMaterials = [...infoHolder.materiais.disponiveis];
      newMaterials[index] = item;
      setInfoHolder((prev) => ({ ...prev, materiais: { ...prev.materiais, disponiveis: newMaterials } }));
    } else {
      const index = item.index;
      const newMaterials = [...infoHolder.materiais.retiraveis];
      newMaterials[index] = item;
      setInfoHolder((prev) => ({ ...prev, materiais: { ...prev.materiais, retiraveis: newMaterials } }));
    }
  }
  function removeItem(index: number, type: TServiceOrderGeneralMaterial['tipo']) {
    if (type == 'DISPONÍVEIS') {
      const newMaterials = [...infoHolder.materiais.disponiveis];
      newMaterials.splice(index, 1);
      setInfoHolder((prev) => ({ ...prev, materiais: { ...prev.materiais, disponiveis: newMaterials } }));
    } else {
      const newMaterials = [...infoHolder.materiais.retiraveis];
      newMaterials.splice(index, 1);
      setInfoHolder((prev) => ({ ...prev, materiais: { ...prev.materiais, retiraveis: newMaterials } }));
    }
  }
  return (
    <div className='flex w-full flex-col rounded-sm border border-primary/80'>
      <div className='hidden w-full items-center gap-2 rounded-sm rounded-bl-none rounded-br-none bg-primary/80 p-1 lg:flex'>
        <h1 className='w-[40%] text-center text-sm font-bold text-primary-foreground'>ITEM</h1>
        <h1 className='w-[20%] text-center text-sm font-bold text-primary-foreground'>UNIDADE</h1>
        <h1 className='w-[20%] text-center text-sm font-bold text-primary-foreground'>QTDE</h1>
        <h1 className='w-[20%] text-center text-sm font-bold text-primary-foreground'>TIPO</h1>
      </div>
      <div className='flex w-full flex-col gap-2 p-1'>
        {allMaterials.map((material, index) => (
          <MaterialsTableBlockItem
            key={index}
            material={material}
            handleUpdate={(item) => updateItem({ item })}
            handleRemove={() => removeItem(material.index, material.tipo)}
          />
        ))}
      </div>
    </div>
  );
}

export default MaterialsTableBlock;
