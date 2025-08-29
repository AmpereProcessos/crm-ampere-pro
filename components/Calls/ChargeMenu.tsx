import { Charge } from '@/utils/models';
import { TPPSCall } from '@/utils/schemas/pps-calls.schema';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { GiBatteryPack } from 'react-icons/gi';
import { MdDelete } from 'react-icons/md';
import NumberInput from '../Inputs/NumberInput';
import TextInput from '../Inputs/TextInput';
type ChargeMenuProps = {
  addCharge: (charge: Charge) => void;
  removeCharge: (index: number) => void;
  charges: TPPSCall['premissas']['cargas'];
};
function ChargeMenu({ addCharge, removeCharge, charges }: ChargeMenuProps) {
  const [chargeHolder, setChargeHolder] = useState({
    descricao: '',
    qtde: 0,
    horasFuncionamento: 0,
    potencia: 0,
  });
  function handleChargeAdd() {
    if (chargeHolder.descricao.trim().length < 3) {
      toast.error('Preencha uma descrição válida para a carga.');
      return;
    }
    if (chargeHolder.qtde <= 0) {
      toast.error('Preencha uma quantidade válida para a carga.');
      return;
    }
    if (chargeHolder.horasFuncionamento <= 0) {
      toast.error('Prencha uma período de funcionamento válido.');
      return;
    }
    if (chargeHolder.potencia <= 0) {
      toast.error('Preencha uma potência de carga válida.');
      return;
    }
    addCharge(chargeHolder);
  }
  return (
    <div className='mt-1 flex w-full flex-col items-center gap-2'>
      <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
        <div className='w-full lg:w-1/4'>
          <TextInput
            label='DESCRIÇÃO'
            value={chargeHolder.descricao}
            handleChange={(value) => setChargeHolder((prev) => ({ ...prev, descricao: value }))}
            placeholder='Descrição/nome da carga...'
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/4'>
          <NumberInput
            label='QTDE'
            value={chargeHolder.qtde}
            handleChange={(value) => setChargeHolder((prev) => ({ ...prev, qtde: value }))}
            placeholder='Quantidade de itens da carga...'
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/4'>
          <NumberInput
            label='POTÊNCIA (W)'
            value={chargeHolder.potencia}
            handleChange={(value) => setChargeHolder((prev) => ({ ...prev, potencia: value }))}
            placeholder='Potência da carga..'
            width='100%'
          />
        </div>
        <div className='w-full lg:w-1/4'>
          <NumberInput
            label='FUNCIONAMENTO (h)'
            value={chargeHolder.horasFuncionamento}
            handleChange={(value) => setChargeHolder((prev) => ({ ...prev, horasFuncionamento: value }))}
            placeholder='Horas de funcionamento...'
            width='100%'
          />
        </div>
      </div>
      <div className='flex items-center justify-center'>
        <button
          onClick={handleChargeAdd}
          className='w-fit rounded-sm border border-green-500 p-1 font-bold text-green-500 duration-300 ease-in-out hover:bg-green-500 hover:text-primary-foreground'
        >
          ADICIONAR CARGA
        </button>
      </div>
      {charges && charges.length > 0 ? (
        charges.map((charge, index) => (
          <div key={index} className='flex w-full items-center justify-between gap-2 rounded-md border border-cyan-500 p-2 lg:w-[50%]'>
            <div className='flex items-center gap-2'>
              <GiBatteryPack color='rgb(6,182,212)' size={'20px'} />
              <p className='text-sm text-primary/70'>
                <strong className='text-cyan-500'>{charge.qtde}</strong> x <strong className='text-cyan-500'>{charge.descricao}</strong> de{' '}
                <strong className='text-cyan-500'>{charge.potencia}W</strong> por{' '}
                <strong className='text-cyan-500'>{charge.horasFuncionamento} horas</strong>
              </p>
            </div>

            <button onClick={() => removeCharge(index)} className='text-red-300 duration-300 ease-in-out hover:scale-105 hover:text-red-500'>
              <MdDelete />
            </button>
          </div>
        ))
      ) : (
        <p className='py-1 text-sm italic text-primary/70'>Sem cargas adicionadas...</p>
      )}
    </div>
  );
}

export default ChargeMenu;
