import { Optional } from '@/utils/models';
import { TFractionnementItem } from '@/utils/schemas/payment-methods';
import { PaymentMethods } from '@/utils/select-options';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { VscChromeClose } from 'react-icons/vsc';
import NumberInput from '../Inputs/NumberInput';
import SelectInput from '../Inputs/SelectInput';

type NewFractionnementProps = {
  addFractionnement: (info: TFractionnementItem) => void;
  removeFractionnement: (index: number) => void;
  missingPercentage: number;
  closeMenu: () => void;
};
function NewFractionnement({ addFractionnement, removeFractionnement, missingPercentage, closeMenu }: NewFractionnementProps) {
  const [fractionnementHolder, setFractionnementHolder] = useState<Optional<TFractionnementItem, 'taxaJuros' | 'taxaUnica'>>({
    porcentagem: missingPercentage,
    metodo: 'À VISTA (DINHEIRO)',
    maximoParcelas: 1,
    parcelas: 1,
    taxaUnica: undefined,
    taxaJuros: undefined,
    modalidade: undefined,
  });

  function validateAndAddFractionnement() {
    if (fractionnementHolder.porcentagem <= 0) return toast.error('Preencha uma porcentagem válida.');
    if (fractionnementHolder.porcentagem > missingPercentage) return toast.error('Porcentagem preenchida excede 100%.');
    if (fractionnementHolder.maximoParcelas <= 0) return toast.error('Preencha um valor válido para o máximo de parcelas.');
    if (fractionnementHolder.taxaUnica && fractionnementHolder.taxaUnica <= 0)
      return toast.error('Preencha um valor válido para a taxa única/taxa de uso.');
    if (fractionnementHolder.taxaJuros && fractionnementHolder.taxaJuros <= 0) return toast.error('Preencha um valor válido para a taxa de juros.');
    const modality = PaymentMethods.find((pm) => pm.value == fractionnementHolder.metodo)?.modality as 'SIMPLES' | 'COMPOSTOS' | null;
    addFractionnement({
      porcentagem: fractionnementHolder.porcentagem,
      metodo: fractionnementHolder.metodo,
      maximoParcelas: fractionnementHolder.maximoParcelas,
      parcelas: fractionnementHolder.maximoParcelas,
      taxaUnica: fractionnementHolder.taxaUnica || 0,
      taxaJuros: fractionnementHolder.taxaJuros || 0,
      modalidade: modality,
    });
  }
  const methodAppliesApportionments = !!PaymentMethods.find((pm) => pm.value == fractionnementHolder.metodo)?.apportionment;
  useEffect(() => {
    setFractionnementHolder((prev) => ({ ...prev, porcentagem: missingPercentage }));
  }, [missingPercentage]);
  return (
    <div className='flex w-[80%] flex-col self-center rounded-md border border-primary/50 p-2 font-Inter'>
      <div className='mb-4 flex w-full items-center justify-between'>
        <h1 className='font-Inter font-black'>NOVO ITEM DE FRACIONAMENTO</h1>
        <button
          onClick={() => closeMenu()}
          type='button'
          className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
        >
          <VscChromeClose style={{ color: 'red' }} />
        </button>
      </div>
      <div className='flex w-full flex-col gap-2 lg:flex-row'>
        <div className='w-full lg:w-1/2'>
          <NumberInput
            label='PORCENTAGEM DO TOTAL'
            value={fractionnementHolder.porcentagem}
            handleChange={(value) => setFractionnementHolder((prev) => ({ ...prev, porcentagem: value }))}
            placeholder='Preencha aqui que nova fração representa do total...'
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/2'>
          <SelectInput
            label='MÉTODO'
            options={PaymentMethods}
            value={fractionnementHolder.metodo}
            handleChange={(value) => setFractionnementHolder((prev) => ({ ...prev, metodo: value }))}
            resetOptionLabel='NÃO DEFINIDO'
            onReset={() => setFractionnementHolder((prev) => ({ ...prev, metodo: 'À VISTA (DINHEIRO)' }))}
            width='100%'
          />
        </div>
      </div>
      {methodAppliesApportionments ? (
        <>
          <div className='mt-2 flex w-full flex-col gap-2 lg:flex-row'>
            <div className='w-full lg:w-1/3'>
              <NumberInput
                label='MÁXIMO DE PARCELAS'
                value={fractionnementHolder.maximoParcelas || null}
                handleChange={(value) => setFractionnementHolder((prev) => ({ ...prev, maximoParcelas: value }))}
                placeholder='Preencha aqui o número máximo de parcelas...'
                width='100%'
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <NumberInput
                label='TAXA DE USO'
                value={fractionnementHolder.taxaUnica || null}
                handleChange={(value) => setFractionnementHolder((prev) => ({ ...prev, taxaUnica: value }))}
                placeholder='Preencha aqui a taxa de uso do método...'
                width='100%'
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <NumberInput
                label='TAXA DE JUROS (ao mês)'
                value={fractionnementHolder.taxaJuros || null}
                handleChange={(value) => setFractionnementHolder((prev) => ({ ...prev, taxaJuros: value }))}
                placeholder='Preencha aqui a taxa de juros mensal...'
                width='100%'
              />
            </div>
          </div>
        </>
      ) : null}
      <div className='my-2 flex items-center justify-end gap-2'>
        <button
          className='rounded bg-black p-1 px-4 text-xs font-medium text-white duration-300 ease-in-out disabled:bg-primary/40 disabled:text-primary enabled:hover:bg-primary/60'
          onClick={() => validateAndAddFractionnement()}
        >
          ADICIONAR FRACIONAMENTO
        </button>
      </div>
    </div>
  );
}

export default NewFractionnement;
