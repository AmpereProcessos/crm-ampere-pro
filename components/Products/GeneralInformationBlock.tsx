import { usePartnersSimplified } from '@/utils/queries/partners';
import { usePricingMethods } from '@/utils/queries/pricing-methods';
import { TProduct } from '@/utils/schemas/products.schema';
import { ProductItemCategories } from '@/utils/select-options';
import React from 'react';
import CheckboxInput from '../Inputs/CheckboxInput';
import SelectInput from '../Inputs/SelectInput';
import SelectWithImages from '../Inputs/SelectWithImages';
import TextInput from '../Inputs/TextInput';

type GeneralInformationBlockProps = {
  infoHolder: TProduct;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProduct>>;
};
function GeneralInformationBlock({ infoHolder, setInfoHolder }: GeneralInformationBlockProps) {
  const { data: pricingMethods } = usePricingMethods();
  const { data: partners } = usePartnersSimplified();
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-white'>INFORMAÇÕES GERAIS</h1>
      <div className='flex w-full items-center justify-center gap-2 py-2'>
        <div className='w-fit'>
          <CheckboxInput
            checked={infoHolder.ativo}
            labelFalse='PRODUTO ATIVADO'
            labelTrue='PRODUTO ATIVADO'
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, ativo: value }))}
            justify='justify-center'
          />
        </div>
      </div>
      <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
        <div className='w-full lg:w-1/3'>
          <SelectInput
            label='CATEGORIA'
            value={infoHolder.categoria || null}
            handleChange={(value) =>
              setInfoHolder((prev) => ({
                ...prev,
                categoria: value,
              }))
            }
            onReset={() => setInfoHolder((prev) => ({ ...prev, categoria: 'OUTROS' }))}
            resetOptionLabel='NÃO DEFINIDO'
            options={ProductItemCategories}
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/3'>
          <TextInput
            label='NOME DO FABRICANTE'
            placeholder='Preencha aqui o nome do fabricante do produto.'
            value={infoHolder.fabricante}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, fabricante: value }))}
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/3'>
          <TextInput
            label='MODELO DO PRODUTO'
            placeholder='Preencha aqui o modelo do produto.'
            value={infoHolder.modelo}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, modelo: value }))}
            width='100%'
          />
        </div>
      </div>
      <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
        <div className='w-full lg:w-1/2'>
          <SelectInput
            label='METODOLOGIA DE PRECIFICAÇÃO'
            value={infoHolder.idMetodologiaPrecificacao ? infoHolder.idMetodologiaPrecificacao : null}
            handleChange={(value) =>
              setInfoHolder((prev) => ({
                ...prev,
                idMetodologiaPrecificacao: value,
              }))
            }
            onReset={() =>
              // @ts-ignore
              setInfoHolder((prev) => ({ ...prev, idMetodologiaPrecificacao: '661400485ce24a96d0c62c30' }))
            }
            resetOptionLabel='NÃO DEFINIDO'
            options={pricingMethods?.map((method) => ({ id: method._id, label: method.nome, value: method._id })) || null}
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/2'>
          <SelectWithImages
            label='VISIBILIDADE DE PARCEIRO'
            value={infoHolder.idParceiro || null}
            options={partners?.map((p) => ({ id: p._id, value: p._id, label: p.nome, url: p.logo_url || undefined })) || []}
            resetOptionLabel='TODOS'
            handleChange={(value) =>
              setInfoHolder((prev) => ({
                ...prev,
                idParceiro: value,
              }))
            }
            onReset={() =>
              setInfoHolder((prev) => ({
                ...prev,
                idParceiro: null,
              }))
            }
            width='100%'
          />
        </div>
      </div>
    </div>
  );
}

export default GeneralInformationBlock;
