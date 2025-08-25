import React, { useState } from 'react';
import toast from 'react-hot-toast';

import ProductItem from './ProductItem';

import NumberInput from '../Inputs/NumberInput';
import SelectInput from '../Inputs/SelectInput';
import TextInput from '../Inputs/TextInput';

import { TInverter, TKit, TModule, TProductItem } from '@/utils/schemas/kits.schema';

import { CommonProductsByProjectType } from '@/utils/constants';
import { useEquipments } from '@/utils/queries/utils';
import { ProductItemCategories } from '@/utils/select-options';
import SelectInputVirtualized from '../Inputs/SelectInputVirtualized';

type ProductCompositionProps = {
  infoHolder: TKit;
  setInfoHolder: React.Dispatch<React.SetStateAction<TKit>>;
};
function ProductComposition({ infoHolder, setInfoHolder }: ProductCompositionProps) {
  const { data: equipments, isLoading, isError, isSuccess } = useEquipments({ category: null });
  const [inverterHolder, setInverterHolder] = useState<TInverter>({
    id: '',
    fabricante: '',
    modelo: '',
    qtde: 1,
    garantia: 10,
    potencia: 0,
  });
  const [moduleHolder, setModuleHolder] = useState<TModule>({
    id: '',
    fabricante: '',
    modelo: '',
    qtde: 1,
    potencia: 0,
    garantia: 10,
  });
  const [personalizedProductHolder, setPersonalizedProductHolder] = useState<TProductItem>({
    id: null,
    categoria: 'OUTROS',
    fabricante: '',
    modelo: '',
    qtde: 1,
    potencia: 0,
    garantia: 0,
  });

  function addInverterToKit() {
    if (!inverterHolder.id && !inverterHolder.fabricante && !inverterHolder.modelo) {
      return toast.error('Inversor inválido. Por favor, tente novamente.');
    }
    if (inverterHolder.qtde <= 0) {
      return toast.error('Por favor, preencha um quantidade de inversores válida.');
    }
    var productsArr = [...infoHolder.produtos];
    const productInfo: TProductItem = {
      id: null,
      categoria: 'INVERSOR',
      fabricante: inverterHolder.fabricante,
      modelo: inverterHolder.modelo,
      qtde: inverterHolder.qtde,
      potencia: inverterHolder.potencia,
      garantia: inverterHolder.garantia,
    };
    productsArr.push(productInfo);
    const orderProducts = productsArr.sort((a, b) => a.categoria.localeCompare(b.categoria));
    setInfoHolder((prev) => ({ ...prev, produtos: orderProducts }));
    setInverterHolder({
      id: '',
      fabricante: '',
      modelo: '',
      qtde: 1,
      garantia: 10,
      potencia: 0,
    });
  }
  function addModuleToKit() {
    if (!moduleHolder.id && !moduleHolder.fabricante && !moduleHolder.modelo) {
      return toast.error('Módulo inválido. Por favor, tente novamente.');
    }
    if (moduleHolder.qtde <= 0) {
      return toast.error('Por favor, preencha um quantidade de módulos válida.');
    }
    var productsArr = [...infoHolder.produtos];
    const productInfo: TProductItem = {
      id: null,
      categoria: 'MÓDULO',
      fabricante: moduleHolder.fabricante,
      modelo: moduleHolder.modelo,
      qtde: moduleHolder.qtde,
      potencia: moduleHolder.potencia,
      garantia: moduleHolder.garantia,
    };
    productsArr.push(productInfo);
    const orderProducts = productsArr.sort((a, b) => a.categoria.localeCompare(b.categoria));
    setInfoHolder((prev) => ({ ...prev, produtos: orderProducts }));
    setModuleHolder({
      id: '',
      fabricante: '',
      modelo: '',
      qtde: 1,
      potencia: 0,
      garantia: 10,
    });
  }
  function addPersonalizedProductToKit() {
    if (personalizedProductHolder.fabricante.trim().length < 3) return toast.error('Fabricante do produto não específicado.');
    if (personalizedProductHolder.modelo.trim().length < 3) return toast.error('Modelo do produto não específicado.');
    if (personalizedProductHolder.qtde <= 0) return toast.error('Quantidade do produto inválida.');

    var productsArr = [...infoHolder.produtos];
    const productInfo: TProductItem = {
      id: null,
      categoria: personalizedProductHolder.categoria,
      fabricante: personalizedProductHolder.fabricante,
      modelo: personalizedProductHolder.modelo,
      qtde: personalizedProductHolder.qtde,
      potencia: personalizedProductHolder.potencia,
      garantia: personalizedProductHolder.garantia,
    };
    productsArr.push(productInfo);
    const orderProducts = productsArr.sort((a, b) => a.categoria.localeCompare(b.categoria));
    setInfoHolder((prev) => ({ ...prev, produtos: orderProducts }));
    setPersonalizedProductHolder({
      id: null,
      categoria: 'OUTROS',
      fabricante: '',
      modelo: '',
      qtde: 1,
      potencia: 0,
      garantia: 0,
    });
    return;
  }
  function removeProductFromKit(index: number) {
    const currentProductList = [...infoHolder.produtos];
    currentProductList.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, produtos: currentProductList }));
  }
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-primary-foreground'>COMPOSIÇÃO DE PRODUTOS</h1>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex w-full flex-col gap-1'>
          <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
            <div className='w-full lg:w-2/4'>
              <SelectInputVirtualized
                label='INVERSOR'
                value={equipments?.find((e) => e.categoria == 'INVERSOR' && e._id == inverterHolder.id) || null}
                handleChange={(value) =>
                  setInverterHolder((prev) => ({
                    ...prev,
                    id: value._id,
                    fabricante: value.fabricante,
                    modelo: value.modelo,
                    potencia: value.potencia || 0,
                  }))
                }
                onReset={() =>
                  setInverterHolder({
                    id: '',
                    fabricante: '',
                    modelo: '',
                    qtde: 1,
                    garantia: 10,
                    potencia: 0,
                  })
                }
                resetOptionLabel='NÃO DEFINIDO'
                options={
                  equipments
                    ?.filter((e) => e.categoria == 'INVERSOR')
                    .map((inverter) => {
                      return {
                        id: inverter._id,
                        label: `${inverter.fabricante} - ${inverter.modelo}`,
                        value: inverter,
                      };
                    }) || []
                }
                width='100%'
              />
            </div>
            <div className='w-full lg:w-1/4'>
              <NumberInput
                label='QTDE'
                value={inverterHolder.qtde}
                handleChange={(value) =>
                  setInverterHolder((prev) => ({
                    ...prev,
                    qtde: Number(value),
                  }))
                }
                placeholder='QTDE'
                width='100%'
              />
            </div>
            <div className='w-full lg:w-1/4'>
              <NumberInput
                label='GARANTIA'
                value={inverterHolder.garantia || null}
                handleChange={(value) =>
                  setInverterHolder((prev) => ({
                    ...prev,
                    garantia: Number(value),
                  }))
                }
                placeholder='GARANTIA'
                width='100%'
              />
            </div>
          </div>
          <div className='flex items-center justify-end'>
            <button
              className='rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70'
              onClick={() => addInverterToKit()}
            >
              ADICIONAR INVERSOR
            </button>
          </div>
        </div>
        <div className='flex w-full flex-col gap-1'>
          <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
            <div className='w-full lg:w-2/4'>
              <SelectInputVirtualized
                label='MÓDULO'
                value={equipments?.find((e) => e.categoria == 'MÓDULO' && e._id == moduleHolder.id) || null}
                handleChange={(value) =>
                  setModuleHolder((prev) => ({
                    ...prev,
                    id: value._id,
                    fabricante: value.fabricante,
                    modelo: value.modelo,
                    potencia: value.potencia || 0,
                  }))
                }
                onReset={() =>
                  setModuleHolder({
                    id: '',
                    fabricante: '',
                    modelo: '',
                    qtde: 1,
                    potencia: 0,
                    garantia: 10,
                  })
                }
                resetOptionLabel='NÃO DEFINIDO'
                options={
                  equipments
                    ?.filter((e) => e.categoria == 'MÓDULO')
                    .map((module) => {
                      return {
                        id: module._id,
                        label: `${module.fabricante} - ${module.modelo}`,
                        value: module,
                      };
                    }) || []
                }
                width='100%'
              />
            </div>
            <div className='w-full lg:w-1/4'>
              <NumberInput
                label='QTDE'
                value={moduleHolder.qtde}
                handleChange={(value) =>
                  setModuleHolder((prev) => ({
                    ...prev,
                    qtde: Number(value),
                  }))
                }
                placeholder='QTDE'
                width='100%'
              />
            </div>
            <div className='w-full lg:w-1/4'>
              <NumberInput
                label='GARANTIA'
                value={moduleHolder.garantia || null}
                handleChange={(value) =>
                  setModuleHolder((prev) => ({
                    ...prev,
                    garantia: Number(value),
                  }))
                }
                placeholder='GARANTIA'
                width='100%'
              />
            </div>
          </div>
          <div className='flex items-center justify-end'>
            <button
              className='rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70'
              onClick={() => addModuleToKit()}
            >
              ADICIONAR MÓDULO
            </button>
          </div>
        </div>
        <div className='flex w-full flex-col gap-1'>
          <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
            <div className='w-full lg:w-[30%]'>
              <SelectInput
                label='CATEGORIA'
                resetOptionLabel='NÃO DEFINIDO'
                options={ProductItemCategories}
                value={personalizedProductHolder.categoria}
                handleChange={(value) =>
                  setPersonalizedProductHolder((prev) => ({
                    ...prev,
                    categoria: value,
                  }))
                }
                onReset={() => {
                  setPersonalizedProductHolder((prev) => ({
                    ...prev,
                    categoria: 'OUTROS',
                  }));
                }}
                width='100%'
              />
            </div>
            <div className='w-full lg:w-[40%]'>
              <TextInput
                label='FABRICANTE'
                placeholder='FABRICANTE'
                value={personalizedProductHolder.fabricante}
                handleChange={(value) =>
                  setPersonalizedProductHolder((prev) => ({
                    ...prev,
                    fabricante: value,
                  }))
                }
                width='100%'
              />
            </div>
            <div className='w-full lg:w-[40%]'>
              <TextInput
                label='MODELO'
                placeholder='MODELO'
                value={personalizedProductHolder.modelo}
                handleChange={(value) =>
                  setPersonalizedProductHolder((prev) => ({
                    ...prev,
                    modelo: value,
                  }))
                }
                width='100%'
              />
            </div>
            <div className='w-full lg:w-[10%]'>
              <NumberInput
                label='POTÊNCIA'
                value={personalizedProductHolder.potencia || null}
                handleChange={(value) =>
                  setPersonalizedProductHolder((prev) => ({
                    ...prev,
                    potencia: Number(value),
                  }))
                }
                placeholder='POTÊNCIA'
                width='100%'
              />
            </div>
            <div className='w-full lg:w-[10%]'>
              <NumberInput
                label='QTDE'
                value={personalizedProductHolder.qtde}
                handleChange={(value) =>
                  setPersonalizedProductHolder((prev) => ({
                    ...prev,
                    qtde: Number(value),
                  }))
                }
                placeholder='QTDE'
                width='100%'
              />
            </div>
            <div className='w-full lg:w-[10%]'>
              <NumberInput
                label='GARANTIA'
                value={personalizedProductHolder.garantia}
                handleChange={(value) =>
                  setPersonalizedProductHolder((prev) => ({
                    ...prev,
                    garantia: Number(value),
                  }))
                }
                placeholder='GARANTIA'
                width='100%'
              />
            </div>
          </div>

          <div className='flex items-center justify-end'>
            <button
              className='rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70'
              onClick={() => addPersonalizedProductToKit()}
            >
              ADICIONAR PRODUTO PERSONALIZADO
            </button>
          </div>
        </div>
        <div className='flex w-full flex-col gap-1'>
          <h1 className='text-start font-Inter text-xs font-medium leading-none tracking-tight'>PRODUTOS COMUNS</h1>
          <div className='flex w-full flex-wrap items-start justify-start gap-2'>
            {CommonProductsByProjectType.map((type, index) => (
              <button
                onClick={() => setInfoHolder((prev) => ({ ...prev, produtos: [...prev.produtos, ...type.produtos] }))}
                key={index}
                className={`rounded-lg px-2 py-1 text-xs font-medium bg-[${type.cores.texto}] text-[${type.cores.fundo}]  w-fit`}
              >
                {type.nome}
              </button>
            ))}
          </div>
        </div>
        <div className='mt-2 flex min-h-[150px] w-full flex-col rounded-md border border-primary/50 p-3 shadow-md'>
          <h1 className='mb-2 text-start font-Inter font-bold leading-none tracking-tight'>PRODUTOS ADICIONADOS</h1>
          <div className='flex w-full flex-wrap items-center justify-around gap-2'>
            {infoHolder.produtos.length > 0 ? (
              infoHolder.produtos.map((product, index) => <ProductItem product={product} index={index} removeProductFromKit={removeProductFromKit} />)
            ) : (
              <div className='text-center font-light text-primary/70'>Nenhum produto adicionado</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductComposition;
