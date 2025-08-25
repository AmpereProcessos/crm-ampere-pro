import NumberInput from '@/components/Inputs/NumberInput';
import SelectInput from '@/components/Inputs/SelectInput';
import SelectInputVirtualized from '@/components/Inputs/SelectInputVirtualized';
import TextareaInput from '@/components/Inputs/TextareaInput';
import TextInput from '@/components/Inputs/TextInput';
import { Button } from '@/components/ui/button';
import { renderCategoryIcon } from '@/lib/methods/rendering';
import { cn } from '@/lib/utils';
import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants';
import { useEquipments } from '@/utils/queries/utils';
import type { TContractRequest } from '@/utils/schemas/integrations/app-ampere/contract-request.schema';
import { ProductItemCategories } from '@/utils/select-options';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Plus, Settings } from 'lucide-react';
import { useState, type Dispatch, type SetStateAction } from 'react';
import toast from 'react-hot-toast';
import { AiOutlineSafety } from 'react-icons/ai';
import { BsCart } from 'react-icons/bs';
import { FaBolt, FaIndustry } from 'react-icons/fa';
import { MdDelete, MdEdit, MdOutlineMiscellaneousServices } from 'react-icons/md';
type ProductsAndServicesProps = {
  editable: boolean;
  requestInfo: TContractRequest;
  setRequestInfo: Dispatch<SetStateAction<TContractRequest>>;
  showActions: boolean;
  goToPreviousStage: () => void;
  goToNextStage: () => void;
};
function ProductsAndServices({ editable, requestInfo, setRequestInfo, showActions, goToPreviousStage, goToNextStage }: ProductsAndServicesProps) {
  const [newScopeItemMenuState, setNewScopeItemMenuState] = useState<'product' | 'service' | null>(null);

  function addProduct(product: TContractRequest['produtos'][number]) {
    setRequestInfo((prev) => ({
      ...prev,
      produtos: [...prev.produtos, product],
    }));
  }
  function updateProduct({ index, item }: { index: number; item: TContractRequest['produtos'][number] }) {
    setRequestInfo((prev) => ({ ...prev, produtos: prev.produtos.map((product, i) => (i === index ? item : product)) }));
  }
  function removeProduct(index: number) {
    setRequestInfo((prev) => ({ ...prev, produtos: prev.produtos.filter((_, i) => i !== index) }));
  }

  function addService(service: TContractRequest['servicos'][number]) {
    setRequestInfo((prev) => ({
      ...prev,
      servicos: [...prev.servicos, service],
    }));
  }
  function updateService({ index, item }: { index: number; item: TContractRequest['servicos'][number] }) {
    setRequestInfo((prev) => ({ ...prev, servicos: prev.servicos.map((service, i) => (i === index ? item : service)) }));
  }
  function removeService(index: number) {
    setRequestInfo((prev) => ({ ...prev, servicos: prev.servicos.filter((_, i) => i !== index) }));
  }
  function handleValidateAndProcceed() {
    if (requestInfo.produtos.length <= 0 && requestInfo.servicos.length <= 0) {
      toast.error('Adicione pelo menos um produto ou serviço.');
      return;
    }

    if (requestInfo.tipoDeServico === 'OPERAÇÃO E MANUTENÇÃO') {
      if (!requestInfo.qtdeModulosOem || requestInfo.qtdeModulosOem.trim().length === 0)
        return toast.error('Preencha a quantidade de módulos p/ manutenção.');
      if (!requestInfo.qtdeInversorOem || requestInfo.qtdeInversorOem.trim().length === 0)
        return toast.error('Preencha a quantidade de inversores p/ manutenção.');
      if (!requestInfo.potModulosOem || requestInfo.potModulosOem.trim().length === 0)
        return toast.error('Preencha a potência dos módulos p/ manutenção.');
      if (!requestInfo.potInversorOem || requestInfo.potInversorOem.trim().length === 0)
        return toast.error('Preencha a potência dos inversores p/ manutenção.');
    }
    setRequestInfo((prev) => ({
      ...prev,
      marcaInversor:
        requestInfo.produtos.length > 0
          ? requestInfo.produtos
              .filter((p) => p.categoria === 'INVERSOR')
              .map((inv) => `${inv.fabricante}-${inv.modelo}`)
              .join('/')
          : '',
      qtdeInversor: requestInfo.produtos
        ? requestInfo.produtos
            .filter((p) => p.categoria === 'INVERSOR')
            .map((inv) => inv.qtde)
            .join('/')
        : '',
      potInversor: requestInfo.produtos
        ? requestInfo.produtos
            .filter((p) => p.categoria === 'INVERSOR')
            .map((inv) => inv.potencia)
            .join('/')
        : '',
      marcaModulos: requestInfo.produtos
        ? requestInfo.produtos
            .filter((p) => p.categoria === 'MÓDULO')
            .map((mod) => `(${mod.fabricante}) ${mod.modelo}`)
            .join('/')
        : '',
      qtdeModulos: requestInfo.produtos
        ? requestInfo.produtos
            .filter((p) => p.categoria === 'MÓDULO')
            .map((mod) => mod.qtde)
            .join('/')
        : '',
      potModulos: requestInfo.produtos
        ? requestInfo.produtos
            .filter((p) => p.categoria === 'MÓDULO')
            .map((mod) => mod.potencia)
            .join('/')
        : '',
    }));
    return goToNextStage();
  }
  return (
    <div className='flex w-full flex-col bg-background pb-2 gap-6 grow'>
      <div className='w-full flex items-center justify-center gap-2'>
        <Settings size={15} />
        <span className='text-sm tracking-tight font-bold'>ESCOPO - PRODUTOS E SERVIÇOS</span>
      </div>
      <div className='flex w-full flex-col grow gap-4'>
        <SelectInput
          label='TOPOLOGIA'
          options={[
            { id: 1, label: 'MICRO-INVERSOR', value: 'MICRO-INVERSOR' },
            { id: 2, label: 'INVERSOR', value: 'INVERSOR' },
          ]}
          value={requestInfo.topologia}
          handleChange={(value) => {
            setRequestInfo((prev) => ({ ...prev, topologia: value }));
          }}
          onReset={() => {
            setRequestInfo((prev) => ({ ...prev, topologia: null }));
          }}
          resetOptionLabel='NÃO DEFINIDO'
          width='100%'
        />
        {editable ? (
          <div className='w-full flex items-center justify-end gap-2 flex-wrap'>
            <div className='flex w-full items-center justify-end gap-2'>
              <button
                type='button'
                onClick={() => setNewScopeItemMenuState((prev) => (prev === 'service' ? null : 'service'))}
                className={cn('flex items-center gap-1 rounded-lg px-2 py-1 text-primary duration-300 ease-in-out', {
                  'bg-primary/30  hover:bg-red-300': newScopeItemMenuState === 'service',
                  'bg-green-300  hover:bg-green-400': newScopeItemMenuState !== 'service',
                })}
              >
                <MdOutlineMiscellaneousServices />
                <h1 className='text-xs font-medium tracking-tight'>
                  {newScopeItemMenuState !== 'service' ? 'ABRIR MENU DE NOVO SERVIÇO' : 'FECHAR MENU DE NOVO SERVIÇO'}
                </h1>
              </button>
              <button
                type='button'
                onClick={() => setNewScopeItemMenuState((prev) => (prev === 'product' ? null : 'product'))}
                className={cn('flex items-center gap-1 rounded-lg px-2 py-1 text-primary duration-300 ease-in-out', {
                  'bg-primary/30  hover:bg-red-300': newScopeItemMenuState === 'product',
                  'bg-green-300  hover:bg-green-400': newScopeItemMenuState !== 'product',
                })}
              >
                <BsCart />
                <h1 className='text-xs font-medium tracking-tight'>
                  {newScopeItemMenuState !== 'product' ? 'ABRIR MENU DE NOVO PRODUTO' : 'FECHAR MENU DE NOVO PRODUTO'}
                </h1>
              </button>
            </div>
          </div>
        ) : null}

        <AnimatePresence>
          {newScopeItemMenuState === 'product' ? <NewProductMenu addProduct={addProduct} /> : null}
          {newScopeItemMenuState === 'service' ? <NewServiceMenu addSaleService={addService} /> : null}
        </AnimatePresence>
        {requestInfo.tipoDeServico === 'OPERAÇÃO E MANUTENÇÃO' ? <OemItemsMenu requestInfo={requestInfo} setRequestInfo={setRequestInfo} /> : null}
        <div className='w-full flex flex-col gap-2'>
          <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
            <ChevronRight size={15} />
            <h1 className='text-xs tracking-tight font-medium text-start w-fit'>PRODUTOS</h1>
          </div>
          {requestInfo.produtos.length > 0 ? (
            requestInfo.produtos.map((product, index) => (
              <ProductItem
                editable={editable}
                key={`${index}-${product.modelo}`}
                product={product}
                handleUpdate={(info) => updateProduct({ index: index, item: info })}
                handleRemove={() => removeProduct(index)}
              />
            ))
          ) : (
            <div className='w-full text-center text-sm font-medium tracking-tight text-primary/80'>Nenhum produto adicionado</div>
          )}
        </div>
        <div className='w-full flex flex-col gap-2'>
          <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
            <ChevronRight size={15} />
            <h1 className='text-xs tracking-tight font-medium text-start w-fit'>SERVIÇOS</h1>
          </div>
          {requestInfo.servicos.length > 0 ? (
            requestInfo.servicos.map((service, index) => (
              <ServiceItem
                editable={editable}
                key={`${index}-${service.descricao}`}
                service={service}
                handleUpdate={(info) => updateService({ index: index, item: info })}
                handleRemove={() => removeService(index)}
              />
            ))
          ) : (
            <div className='w-full text-center text-sm font-medium tracking-tight text-primary/80'>Nenhum serviço adicionado</div>
          )}
        </div>
      </div>
      {showActions ? (
        <div className='mt-2 flex w-full flex-wrap justify-between  gap-2'>
          <button
            type='button'
            onClick={() => {
              goToPreviousStage();
            }}
            className='rounded p-2 font-bold text-primary/70 duration-300 hover:scale-105'
          >
            Voltar
          </button>
          <button
            type='button'
            onClick={() => {
              handleValidateAndProcceed();
            }}
            className='rounded p-2 font-bold hover:bg-black hover:text-primary-foreground'
          >
            Prosseguir
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ProductsAndServices;

type NewProductMenuProps = {
  addProduct: (info: TContractRequest['produtos'][number]) => void;
};
function NewProductMenu({ addProduct }: NewProductMenuProps) {
  const { data: equipments, isLoading, isError, isSuccess } = useEquipments({ category: null });

  const inverters = equipments?.filter((e) => e.categoria === 'INVERSOR') || [];
  const modules = equipments?.filter((e) => e.categoria === 'MÓDULO') || [];

  const inverterOptions = inverters.map((inverter) => ({
    id: inverter._id,
    label: `${inverter.fabricante} - ${inverter.modelo}`,
    value: inverter.modelo,
  }));

  const modulesOptions = modules.map((product) => ({
    id: product._id,
    label: `${product.fabricante} - ${product.modelo}`,
    value: product.modelo,
  }));

  const [inverterHolder, setInverterHolder] = useState<TContractRequest['produtos'][number]>({
    categoria: 'INVERSOR',
    fabricante: '',
    modelo: '',
    qtde: 1,
    garantia: 10,
    potencia: 0,
  });
  const [moduleHolder, setModuleHolder] = useState<TContractRequest['produtos'][number]>({
    categoria: 'MÓDULO',
    fabricante: '',
    modelo: '',
    qtde: 1,
    garantia: 10,
    potencia: 0,
  });
  const [personalizedProductHolder, setPersonalizedProductHolder] = useState<TContractRequest['produtos'][number]>({
    categoria: 'OUTROS',
    fabricante: '',
    modelo: '',
    qtde: 1,
    garantia: 10,
    potencia: 0,
  });
  function handleAddProduct(product: TContractRequest['produtos'][number]) {
    if (product.fabricante.trim().length <= 1) return toast.error('Preencha um fabricante válido.');
    if (product.modelo.trim().length <= 1) return toast.error('Preencha um modelo válido.');
    if (product.qtde <= 0) return toast.error('Preencha uma quantidade válida.');
    addProduct(product);
  }
  return (
    <motion.div
      key={'menu-open'}
      variants={GeneralVisibleHiddenExitMotionVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
      className='flex w-full flex-col gap-2 rounded-sm border border-green-600 bg-background shadow-md'
    >
      <h1 className='rounded-tl rounded-tr bg-green-600 p-1 text-center text-xs text-primary-foreground'>NOVO PRODUTO</h1>
      <div className='flex w-full flex-col gap-2 p-3'>
        <div className='flex w-full flex-col gap-2'>
          <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
            <div className='w-full lg:w-2/4'>
              <SelectInputVirtualized
                label='INVERSOR'
                value={inverterHolder.id}
                handleChange={(value) => {
                  const inverter = inverters?.find((i) => i._id === value);
                  if (!inverter) return;
                  setInverterHolder((prev) => ({
                    ...prev,
                    fabricante: inverter.fabricante,
                    modelo: inverter.modelo,
                    potencia: inverter.potencia || 0,
                    garantia: inverter.garantia || 0,
                  }));
                }}
                onReset={() =>
                  setInverterHolder({
                    categoria: 'INVERSOR',
                    fabricante: '',
                    modelo: '',
                    qtde: 1,
                    garantia: 10,
                    potencia: 0,
                  })
                }
                resetOptionLabel='NÃO DEFINIDO'
                options={inverterOptions}
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
            <Button onClick={() => handleAddProduct(inverterHolder)} size={'sm'} type='button'>
              ADICIONAR INVERSOR
            </Button>
          </div>
        </div>
        <div className='flex w-full flex-col gap-2'>
          <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
            <div className='w-full lg:w-2/4'>
              <SelectInputVirtualized
                label='MÓDULO'
                value={moduleHolder.id}
                handleChange={(value) => {
                  const pvModule = modules.find((m) => m._id === value);
                  if (!pvModule) return;
                  setModuleHolder((prev) => ({
                    ...prev,
                    fabricante: pvModule.fabricante,
                    modelo: pvModule.modelo,
                    potencia: pvModule.potencia || 0,
                    garantia: pvModule.garantia || 0,
                  }));
                }}
                onReset={() =>
                  setModuleHolder({
                    categoria: 'MÓDULO',

                    fabricante: '',
                    modelo: '',
                    qtde: 1,
                    garantia: 10,
                    potencia: 0,
                  })
                }
                resetOptionLabel='NÃO DEFINIDO'
                options={modulesOptions}
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
            <Button onClick={() => handleAddProduct(moduleHolder)} size={'sm'} type='button'>
              ADICIONAR MÓDULO
            </Button>
          </div>
        </div>
        <div className='flex w-full flex-col gap-2'>
          <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
            <div className='w-full lg:w-[20%]'>
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
            <div className='w-full lg:w-[20%]'>
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
            <div className='w-full lg:w-[30%]'>
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
            <Button onClick={() => handleAddProduct(personalizedProductHolder)} size={'sm'} type='button'>
              ADICIONAR PRODUTO PERSONALIZADO
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
function ProductItem({
  product,
  editable,
  handleUpdate,
  handleRemove,
}: {
  product: TContractRequest['produtos'][number];
  editable: boolean;
  handleUpdate: (info: TContractRequest['produtos'][number]) => void;
  handleRemove: () => void;
}) {
  const [itemHolder, setItemHolder] = useState<TContractRequest['produtos'][number]>(product);
  const [editMenuIsOpen, setEditMenuIsOpen] = useState<boolean>(false);
  return (
    <>
      <AnimatePresence>
        <div className='flex w-full flex-col gap-1 rounded-sm border border-primary bg-background p-2'>
          <div className='flex w-full items-center gap-2'>
            <div className='flex items-center gap-1'>
              <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
                {renderCategoryIcon(product.categoria, 15)}
              </div>
              <p className='text-sm font-bold leading-none tracking-tight'>
                <strong className='text-[#FF9B50]'>{product.qtde}</strong> x {product.modelo}
              </p>
            </div>
            <div className='flex grow items-center gap-2'>
              <div className='flex items-center gap-1'>
                <FaIndustry size={12} />
                <p className='text-[0.6rem] font-light text-primary/70 lg:text-xs'>{product.fabricante}</p>
              </div>
              {product.potencia ? (
                <div className='flex items-center gap-1'>
                  <FaBolt size={12} />
                  <p className='text-[0.6rem] font-light text-primary/70 lg:text-xs'>{product.potencia} W</p>
                </div>
              ) : null}
              <div className='flex items-center gap-1'>
                <AiOutlineSafety size={12} />
                <p className='text-[0.6rem] font-light text-primary/70 lg:text-xs'>
                  {product.garantia} {product.garantia && product.garantia > 0 ? 'ANOS' : 'ANO'}
                </p>
              </div>
            </div>
          </div>
          {editable ? (
            <div className='flex w-full items-center justify-end gap-2'>
              <button
                type='button'
                onClick={() => setEditMenuIsOpen((prev) => !prev)}
                className='flex items-center gap-1 rounded-lg bg-orange-600 px-2 py-1 text-[0.6rem] text-primary-foreground hover:bg-orange-500'
              >
                <MdEdit width={10} height={10} />
                <p>EDITAR</p>
              </button>
              <button
                type='button'
                onClick={() => handleRemove()}
                className='flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1 text-[0.6rem] text-primary-foreground hover:bg-red-500'
              >
                <MdDelete width={10} height={10} />
                <p>REMOVER</p>
              </button>
            </div>
          ) : null}
        </div>
        {editMenuIsOpen ? (
          <motion.div
            variants={GeneralVisibleHiddenExitMotionVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='flex w-full flex-col gap-1 p-3'
          >
            <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-[20%]'>
                <SelectInput
                  label='CATEGORIA'
                  labelClassName='text-[0.6rem]'
                  holderClassName='text-xs p-2 min-h-[34px]'
                  resetOptionLabel='NÃO DEFINIDO'
                  options={ProductItemCategories.map((item) => ({
                    id: item.id,
                    label: item.label,
                    value: item.value,
                  }))}
                  value={itemHolder.categoria}
                  handleChange={(value) =>
                    setItemHolder((prev) => ({
                      ...prev,
                      categoria: value,
                    }))
                  }
                  onReset={() => {
                    setItemHolder((prev) => ({
                      ...prev,
                      categoria: 'OUTROS',
                    }));
                  }}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-[20%]'>
                <TextInput
                  label='FABRICANTE'
                  labelClassName='text-[0.6rem]'
                  holderClassName='text-xs p-2 min-h-[34px]'
                  placeholder='FABRICANTE'
                  value={itemHolder.fabricante}
                  handleChange={(value) =>
                    setItemHolder((prev) => ({
                      ...prev,
                      fabricante: value,
                    }))
                  }
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-[30%]'>
                <TextInput
                  label='MODELO'
                  labelClassName='text-[0.6rem]'
                  holderClassName='text-xs p-2 min-h-[34px]'
                  placeholder='MODELO'
                  value={itemHolder.modelo}
                  handleChange={(value) =>
                    setItemHolder((prev) => ({
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
                  labelClassName='text-[0.6rem]'
                  holderClassName='text-xs p-2 min-h-[34px]'
                  value={itemHolder.potencia || null}
                  handleChange={(value) =>
                    setItemHolder((prev) => ({
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
                  labelClassName='text-[0.6rem]'
                  holderClassName='text-xs p-2 min-h-[34px]'
                  value={itemHolder.qtde}
                  handleChange={(value) =>
                    setItemHolder((prev) => ({
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
                  labelClassName='text-[0.6rem]'
                  holderClassName='text-xs p-2 min-h-[34px]'
                  value={itemHolder.garantia}
                  handleChange={(value) =>
                    setItemHolder((prev) => ({
                      ...prev,
                      garantia: Number(value),
                    }))
                  }
                  placeholder='GARANTIA'
                  width='100%'
                />
              </div>
            </div>
            <div className='flex items-center justify-end gap-2'>
              <button
                type='button'
                onClick={() => {
                  setEditMenuIsOpen(false);
                }}
                className='rounded bg-red-800 p-1 px-4 text-[0.6rem] font-medium text-primary-foreground duration-300 ease-in-out hover:bg-red-700'
              >
                FECHAR
              </button>
              <button
                type='button'
                onClick={() => {
                  handleUpdate(itemHolder);
                  setEditMenuIsOpen(false);
                }}
                className='rounded bg-blue-800 p-1 px-4 text-[0.6rem] font-medium text-primary-foreground duration-300 ease-in-out hover:bg-blue-700'
              >
                ATUALIZAR ITEM
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

type NewServiceMenuProps = {
  addSaleService: (info: TContractRequest['servicos'][number]) => void;
};
function NewServiceMenu({ addSaleService }: NewServiceMenuProps) {
  const [serviceHolder, setServiceHolder] = useState<TContractRequest['servicos'][number]>({
    descricao: '',
    observacoes: '',
    garantia: 0,
  });
  function handleAddService(service: TContractRequest['servicos'][number]) {
    if (service.descricao.trim().length <= 1) return toast.error('Preencha uma descrição válida.');
    addSaleService(service);
    setServiceHolder({
      descricao: '',
      observacoes: '',
      garantia: 0,
    });
  }
  return (
    <motion.div
      key={'menu-open'}
      variants={GeneralVisibleHiddenExitMotionVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
      className='flex w-full flex-col gap-2 rounded-sm border border-green-600 bg-background shadow-md'
    >
      <h1 className='rounded-tl rounded-tr bg-green-600 p-1 text-center text-xs text-primary-foreground'>NOVO SERVIÇO</h1>
      <div className='flex w-full flex-col gap-2 p-3'>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-3/4'>
            <TextInput
              label='DESCRIÇÃO'
              placeholder='Preencha a descrição do serviço...'
              value={serviceHolder.descricao}
              handleChange={(value) => setServiceHolder((prev) => ({ ...prev, descricao: value }))}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <NumberInput
              label='GARANTIA'
              placeholder='Preencha a garantia do serviço...'
              value={serviceHolder.garantia || null}
              handleChange={(value) => setServiceHolder((prev) => ({ ...prev, garantia: value }))}
              width='100%'
            />
          </div>
        </div>
        <TextareaInput
          label='OBSERVAÇÕES DO SERVIÇO'
          value={serviceHolder.observacoes || ''}
          handleChange={(value) => setServiceHolder((prev) => ({ ...prev, observacoes: value }))}
          placeholder='Preencha aqui uma descrição acerca do serviço...'
        />
        <div className='flex items-center justify-end'>
          <Button onClick={() => handleAddService(serviceHolder)} size={'sm'} type='button'>
            ADICIONAR SERVIÇO
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
function ServiceItem({
  service,
  editable,
  handleUpdate,
  handleRemove,
}: {
  service: TContractRequest['servicos'][number];
  editable: boolean;
  handleUpdate: (info: TContractRequest['servicos'][number]) => void;
  handleRemove: () => void;
}) {
  const [itemHolder, setItemHolder] = useState<TContractRequest['servicos'][number]>(service);
  const [editMenuIsOpen, setEditMenuIsOpen] = useState<boolean>(false);
  return (
    <>
      <AnimatePresence>
        <div className='flex w-full flex-col gap-1 rounded-sm border border-primary bg-background p-2'>
          <div className='flex w-full items-center justify-between gap-2'>
            <div className='flex items-center gap-1'>
              <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
                <MdOutlineMiscellaneousServices />
              </div>
              <p className='text-sm font-bold leading-none tracking-tight'>{service.descricao}</p>
            </div>
            <div className='flex grow items-center gap-2'>
              <div className='flex items-center gap-1'>
                <AiOutlineSafety size={12} />
                <p className='text-[0.6rem] font-light text-primary/70 lg:text-xs'>
                  {service.garantia} {service.garantia && service.garantia > 0 ? 'ANOS' : 'ANO'}
                </p>
              </div>
            </div>
          </div>
          <div className='flex w-full items-center justify-center'>
            <div className='flex w-full items-center justify-center rounded-sm bg-primary/10 p-2'>
              <h1 className='whitespace-pre-line text-[0.6rem] font-medium'>{service.observacoes || 'OBSERVAÇÕES NÃO DEFINIDAS'}</h1>
            </div>
          </div>
          {editable ? (
            <div className='flex w-full items-center justify-end gap-2'>
              <button
                type='button'
                onClick={() => setEditMenuIsOpen((prev) => !prev)}
                className='flex items-center gap-1 rounded-lg bg-orange-600 px-2 py-1 text-[0.6rem] text-primary-foreground hover:bg-orange-500'
              >
                <MdEdit width={10} height={10} />
                <p>EDITAR</p>
              </button>
              <button
                type='button'
                onClick={() => handleRemove()}
                className='flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1 text-[0.6rem] text-primary-foreground hover:bg-red-500'
              >
                <MdDelete width={10} height={10} />
                <p>REMOVER</p>
              </button>
            </div>
          ) : null}
        </div>
        {editMenuIsOpen ? (
          <motion.div
            variants={GeneralVisibleHiddenExitMotionVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='flex w-full flex-col gap-1 p-3'
          >
            <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
              <div className='w-full lg:w-3/4'>
                <TextInput
                  label='DESCRIÇÃO'
                  labelClassName='text-[0.6rem]'
                  placeholder='Preencha a descrição do serviço...'
                  holderClassName='text-xs p-2 min-h-[34px]'
                  value={itemHolder.descricao}
                  handleChange={(value) => setItemHolder((prev) => ({ ...prev, descricao: value }))}
                  width='100%'
                />
              </div>
              <div className='w-full lg:w-1/4'>
                <NumberInput
                  label='GARANTIA'
                  labelClassName='text-[0.6rem]'
                  placeholder='Preencha a garantia do serviço...'
                  holderClassName='text-xs p-2 min-h-[34px]'
                  value={itemHolder.garantia || null}
                  handleChange={(value) => setItemHolder((prev) => ({ ...prev, garantia: value }))}
                  width='100%'
                />
              </div>
            </div>
            <TextareaInput
              label='OBSERVAÇÕES DO SERVIÇO'
              holderClassName='p-2 min-h-[50px] lg:min-h-[45px]'
              value={itemHolder.observacoes || ''}
              handleChange={(value) => setItemHolder((prev) => ({ ...prev, observacoes: value }))}
              placeholder='Preencha aqui uma descrição acerca do serviço...'
            />
            <div className='flex items-center justify-end gap-2'>
              <button
                type='button'
                onClick={() => {
                  setEditMenuIsOpen(false);
                }}
                className='rounded bg-red-800 p-1 px-4 text-[0.6rem] font-medium text-primary-foreground duration-300 ease-in-out hover:bg-red-700'
              >
                FECHAR
              </button>
              <button
                type='button'
                onClick={() => {
                  handleUpdate(itemHolder);
                  setEditMenuIsOpen(false);
                }}
                className='rounded bg-blue-800 p-1 px-4 text-[0.6rem] font-medium text-primary-foreground duration-300 ease-in-out hover:bg-blue-700'
              >
                ATUALIZAR ITEM
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

type TOemItemHolder = {
  tipo: 'MÓDULO' | 'INVERSOR';
  descricao: string;
  qtde: number;
  potencia: number;
};

type OemItemsMenuProps = {
  requestInfo: TContractRequest;
  setRequestInfo: Dispatch<SetStateAction<TContractRequest>>;
};
function OemItemsMenu({ requestInfo, setRequestInfo }: OemItemsMenuProps) {
  const [itemsHolder, setItemsHolder] = useState<TOemItemHolder[]>([
    {
      tipo: 'MÓDULO',
      descricao: '',
      qtde: 0,
      potencia: 0,
    },
    {
      tipo: 'INVERSOR',
      descricao: '',
      qtde: 0,
      potencia: 0,
    },
  ]);

  function getItemsRequestMetadata(items: TOemItemHolder[]) {
    const newItemsRequestMetadata = items.reduce(
      (acc, item) => {
        if (item.tipo === 'INVERSOR') {
          acc.invertersDescription.push(item.descricao);
          acc.invertersQty.push(item.qtde.toString());
          acc.invertersPower.push(item.potencia.toString());
        }
        if (item.tipo === 'MÓDULO') {
          acc.modulesDescription.push(item.descricao);
          acc.modulesQty.push(item.qtde.toString());
          acc.modulesPower.push(item.potencia.toString());
        }
        return acc;
      },
      {
        modulesQty: [] as string[],
        modulesPower: [] as string[],
        modulesDescription: [] as string[],
        invertersQty: [] as string[],
        invertersPower: [] as string[],
        invertersDescription: [] as string[],
      }
    );
    return {
      modulesQty: newItemsRequestMetadata.modulesQty.join('/'),
      modulesPower: newItemsRequestMetadata.modulesPower.join('/'),
      modulesDescription: newItemsRequestMetadata.modulesDescription.join('/'),
      invertersQty: newItemsRequestMetadata.invertersQty.join('/'),
      invertersPower: newItemsRequestMetadata.invertersPower.join('/'),
      invertersDescription: newItemsRequestMetadata.invertersDescription.join('/'),
    };
  }
  function handleAddItem(item: TOemItemHolder) {
    const newItems = [...itemsHolder, item];

    const newItemsRequestMetadata = getItemsRequestMetadata(newItems);
    setItemsHolder(newItems);
    setRequestInfo((prev) => ({
      ...prev,
      marcaModulosOem: newItemsRequestMetadata.modulesDescription,
      qtdeModulosOem: newItemsRequestMetadata.modulesQty,
      potModulosOem: newItemsRequestMetadata.modulesPower,
      marcaInversorOem: newItemsRequestMetadata.invertersDescription,
      qtdeInversorOem: newItemsRequestMetadata.invertersQty,
      potInversorOem: newItemsRequestMetadata.invertersPower,
    }));
  }
  function handleRemoveItem(index: number) {
    const newItems = itemsHolder.filter((_, i) => i !== index);

    const newItemsRequestMetadata = getItemsRequestMetadata(newItems);

    setItemsHolder(newItems);
    setRequestInfo((prev) => ({
      ...prev,
      marcaModulosOem: newItemsRequestMetadata.modulesDescription,
      qtdeModulosOem: newItemsRequestMetadata.modulesQty,
      potModulosOem: newItemsRequestMetadata.modulesPower,
      marcaInversorOem: newItemsRequestMetadata.invertersDescription,
      qtdeInversorOem: newItemsRequestMetadata.invertersQty,
      potInversorOem: newItemsRequestMetadata.invertersPower,
    }));
  }

  function handleUpdateItem({ index, changes }: { index: number; changes: Partial<TOemItemHolder> }) {
    const newItems = itemsHolder.map((item, i) => (i === index ? { ...item, ...changes } : item));

    const newItemsRequestMetadata = getItemsRequestMetadata(newItems);

    setItemsHolder(newItems);
    setRequestInfo((prev) => ({
      ...prev,
      marcaModulosOem: newItemsRequestMetadata.modulesDescription,
      qtdeModulosOem: newItemsRequestMetadata.modulesQty,
      potModulosOem: newItemsRequestMetadata.modulesPower,
      marcaInversorOem: newItemsRequestMetadata.invertersDescription,
      qtdeInversorOem: newItemsRequestMetadata.invertersQty,
      potInversorOem: newItemsRequestMetadata.invertersPower,
    }));
  }

  return (
    <div className='w-full flex flex-col gap-2'>
      <div className='flex items-center gap-2 bg-primary/20 px-2 py-1 rounded-sm w-fit'>
        <ChevronRight size={15} />
        <h1 className='text-xs tracking-tight font-medium text-start w-fit'>ITENS DA MANUTENÇÃO</h1>
      </div>
      <div className='w-full flex items-center justify-end gap-2 flex-wrap'>
        <div className='flex w-full items-center justify-end gap-2'>
          <button
            type='button'
            onClick={() => handleAddItem({ tipo: 'MÓDULO', descricao: '', qtde: 0, potencia: 0 })}
            className={cn('flex items-center gap-1 rounded-lg px-2 py-1 text-primary duration-300 ease-in-out bg-primary/30 hover:bg-green-400')}
          >
            <Plus className='w-4 h-4' />
            <h1 className='text-xs font-medium tracking-tight'>ADICIONAR MÓDULO</h1>
          </button>
          <button
            type='button'
            onClick={() => handleAddItem({ tipo: 'INVERSOR', descricao: '', qtde: 0, potencia: 0 })}
            className={cn('flex items-center gap-1 rounded-lg px-2 py-1 text-primary duration-300 ease-in-out bg-primary/30 hover:bg-green-400')}
          >
            <Plus className='w-4 h-4' />
            <h1 className='text-xs font-medium tracking-tight'>ADICIONAR INVERSOR</h1>
          </button>
        </div>
      </div>
      {itemsHolder.map((item, index) => (
        <OemItem
          key={`${item.tipo}-${index}`}
          item={item}
          handleUpdate={(changes) => handleUpdateItem({ index, changes })}
          handleRemove={() => handleRemoveItem(index)}
        />
      ))}
    </div>
  );
}

function OemItem({
  item,
  handleUpdate,
  handleRemove,
}: {
  item: TOemItemHolder;
  handleUpdate: (changes: Partial<TOemItemHolder>) => void;
  handleRemove: () => void;
}) {
  return (
    <div className='flex w-full flex-col gap-1 rounded-sm border border-primary bg-background p-2'>
      <div className='w-full flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
            {renderCategoryIcon(item.tipo, 15)}
          </div>
          <p className='text-sm font-bold leading-none tracking-tight'>{item.tipo}</p>
        </div>
        <button
          type='button'
          onClick={() => handleRemove()}
          className='flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1 text-[0.6rem] text-primary-foreground hover:bg-red-500'
        >
          <MdDelete width={10} height={10} />
          <p>REMOVER</p>
        </button>
      </div>
      <div className='flex w-full items-center gap-2'>
        <div className='flex grow items-center gap-2 flex-col lg:flex-row'>
          <div className='w-full lg:w-[50%]'>
            <TextInput
              label='DESCRIÇÃO'
              labelClassName='text-[0.6rem]'
              placeholder='Preencha a descrição do item...'
              holderClassName='text-xs p-2 min-h-[34px]'
              value={item.descricao}
              handleChange={(value) => handleUpdate({ ...item, descricao: value })}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[25%]'>
            <NumberInput
              label='QUANTIDADE'
              labelClassName='text-[0.6rem]'
              placeholder='Preencha a quantidade do item...'
              holderClassName='text-xs p-2 min-h-[34px]'
              value={item.qtde}
              handleChange={(value) => handleUpdate({ ...item, qtde: value })}
              width='100%'
            />
          </div>
          <div className='w-full lg:w-[25%]'>
            <NumberInput
              label='POTÊNCIA'
              labelClassName='text-[0.6rem]'
              placeholder='Preencha a potência do item...'
              holderClassName='text-xs p-2 min-h-[34px]'
              value={item.potencia}
              handleChange={(value) => handleUpdate({ ...item, potencia: value })}
              width='100%'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
