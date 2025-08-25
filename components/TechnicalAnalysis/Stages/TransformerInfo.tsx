import CheckboxInput from '@/components/Inputs/CheckboxInput';
import DocumentFileInput from '@/components/Inputs/DocumentFileInput';
import NumberInput from '@/components/Inputs/NumberInput';
import TextInput from '@/components/Inputs/TextInput';
import { TFileHolder } from '@/utils/schemas/file-reference.schema';
import { TTechnicalAnalysis } from '@/utils/schemas/technical-analysis.schema';
import React from 'react';
import { toast } from 'react-hot-toast';
type TransformerInfoProps = {
  infoHolder: TTechnicalAnalysis;
  setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
  goToNextStage: () => void;
  goToPreviousStage: () => void;
  files: TFileHolder;
  setFiles: React.Dispatch<React.SetStateAction<TFileHolder>>;
};
function TransformerInfo({ infoHolder, setInfoHolder, files, setFiles, goToNextStage, goToPreviousStage }: TransformerInfoProps) {
  function validateAndProceed() {
    if (!infoHolder.transformador.potencia || infoHolder.transformador.potencia <= 0) return toast.error('Preencha a potência do transformador.');

    if (!files['FOTO DO TRANSFORMADOR']) return toast.error('Anexe uma foto do transformador do cliente.');

    if (!files['FOTO DA LOCALIZAÇÃO DO TRANSFORMADOR']) return toast.error('Anexe uma foto da localização do transformador.');

    if (!files['FOTO DO NÚMERO DO TRANSFORMADOR']) return toast.error('Anexe uma foto do número do transformador.');

    return goToNextStage();
  }
  return (
    <div className='flex w-full grow flex-col bg-background px-2'>
      <h1 className='w-full rounded-md  bg-primary/70 p-1 text-center font-medium text-white'>INFORMAÇÕES DO TRANSFORMADOR DE ENERGIA</h1>
      <div className='flex w-full grow flex-col gap-2'>
        <div className='my-3 w-full self-center lg:w-1/3'>
          <CheckboxInput
            labelFalse='TRANSFORMADOR E PADRÃO ACOPLADOS'
            labelTrue='TRANSFORMADOR E PADRÃO ACOPLADOS'
            checked={infoHolder.transformador.acopladoPadrao}
            handleChange={(value) => setInfoHolder((prev) => ({ ...prev, transformador: { ...prev.transformador, acopladoPadrao: value } }))}
          />
        </div>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/2'>
            <NumberInput
              width='100%'
              label='POTÊNCIA DO TRANSFORMADOR'
              placeholder='Preencha aqui a potência do transformador...'
              value={infoHolder.transformador.potencia}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, transformador: { ...prev.transformador, potencia: value } }))}
            />
          </div>
          <div className='w-full lg:w-1/2'>
            <TextInput
              width='100%'
              label='Nº DO TRANSFORMADOR'
              placeholder='Preencha o número transformador...'
              value={infoHolder.transformador.codigo}
              handleChange={(value) => setInfoHolder((prev) => ({ ...prev, transformador: { ...prev.transformador, codigo: value } }))}
            />
          </div>
        </div>
        <h1 className='mt-2 w-full text-start font-sans  font-bold text-cyan-500'>ARQUIVOS</h1>
        <div className='flex w-full flex-col items-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <DocumentFileInput
              label='FOTO DO TRANSFORMADOR'
              value={files['FOTO DO TRANSFORMADOR']}
              handleChange={(value) => setFiles((prev) => ({ ...prev, ['FOTO DO TRANSFORMADOR']: value }))}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <DocumentFileInput
              label='FOTO DA LOCALIZAÇÃO DO TRANSFORMADOR'
              value={files['FOTO DA LOCALIZAÇÃO DO TRANSFORMADOR']}
              handleChange={(value) => setFiles((prev) => ({ ...prev, ['FOTO DA LOCALIZAÇÃO DO TRANSFORMADOR']: value }))}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <DocumentFileInput
              label='FOTO DO NÚMERO DO TRANSFORMADOR'
              value={files['FOTO DO NÚMERO DO TRANSFORMADOR']}
              handleChange={(value) => setFiles((prev) => ({ ...prev, ['FOTO DO NÚMERO DO TRANSFORMADOR']: value }))}
            />
          </div>
        </div>
      </div>

      <div className='mt-2 flex w-full items-end justify-between bg-background'>
        <button onClick={() => goToPreviousStage()} className='rounded p-2 font-bold text-primary/50 duration-300 ease-in-out hover:scale-105'>
          Voltar
        </button>
        <button
          onClick={() => {
            validateAndProceed();
          }}
          className=' rounded-sm p-2 font-bold hover:bg-black hover:text-white'
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default TransformerInfo;
