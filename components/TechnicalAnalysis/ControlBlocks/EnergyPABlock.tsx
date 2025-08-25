import React, { useState } from 'react';

import CheckboxInput from '@/components/Inputs/CheckboxInput';
import SelectInput from '@/components/Inputs/SelectInput';
import TextInput from '@/components/Inputs/TextInput';
import { TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema';
import { AmperageOptions, EnergyMeterBoxModels, EnergyPAConnectionTypes, EnergyPATypes } from '@/utils/select-options';
import toast from 'react-hot-toast';
import { AiOutlineArrowDown, AiOutlineArrowUp } from 'react-icons/ai';
import { IoMdBarcode } from 'react-icons/io';
import { LuUtilityPole } from 'react-icons/lu';
import { MdDelete, MdOutlineSettingsInputComponent } from 'react-icons/md';
import { TbAlertTriangleFilled, TbBoxModel2, TbCategoryFilled } from 'react-icons/tb';

type EnergyPABlockProps = {
  infoHolder: TTechnicalAnalysisDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysisDTO>>;
  changes: object;
  setChanges: React.Dispatch<React.SetStateAction<object>>;
};
function EnergyPABlock({ infoHolder, setInfoHolder, changes, setChanges }: EnergyPABlockProps) {
  const [paInfoHolder, setPaInfoHolder] = useState<TTechnicalAnalysisDTO['padrao'][number]>({
    alteracao: false,
    tipo: 'CONTRA À REDE',
    tipoEntrada: 'AÉREO',
    tipoSaida: 'AÉREO',
    amperagem: '',
    ligacao: '',
    novaAmperagem: null,
    novaLigacao: null,
    codigoMedidor: '',
    modeloCaixaMedidor: null,
    codigoPosteDerivacao: null,
  });
  function addEnergyPA() {
    const energyPAList = infoHolder.padrao ? [...infoHolder.padrao] : [];
    energyPAList.push(paInfoHolder);
    setInfoHolder((prev) => ({ ...prev, padrao: energyPAList }));
    setChanges((prev) => ({ ...prev, padrao: energyPAList }));
    setPaInfoHolder({
      alteracao: false,
      tipo: 'CONTRA À REDE',
      tipoEntrada: 'AÉREO',
      tipoSaida: 'AÉREO',
      amperagem: '',
      ligacao: '',
      novaAmperagem: null,
      novaLigacao: null,
      codigoMedidor: '',
      modeloCaixaMedidor: null,
      codigoPosteDerivacao: null,
    });
    return toast.success('Padrão adicionado com sucesso.');
  }
  function removeEnergyPA(index: number) {
    const energyPAList = infoHolder.padrao ? [...infoHolder.padrao] : [];
    energyPAList.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, padrao: energyPAList }));
    setChanges((prev) => ({ ...prev, padrao: energyPAList }));
    return toast.success('Padrão removido com sucesso.');
  }
  return (
    <div className='mt-4 flex w-full flex-col'>
      <div className='flex w-full items-center justify-center gap-2 rounded-md bg-primary/80 p-2'>
        <h1 className='font-bold text-white'>PADRÕES</h1>
      </div>
      <div className='mt-2 flex w-full flex-col gap-2'>
        <div className='flex w-full flex-col justify-around gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/4'>
            <SelectInput
              label='LIGAÇÃO'
              options={[
                { id: 1, label: 'MONOFÁSICO', value: 'MONOFÁSICO' },
                { id: 2, label: 'BIFÁSICO', value: 'BIFÁSICO' },
                { id: 3, label: 'TRIFÁSICO', value: 'TRIFÁSICO' },
              ]}
              value={paInfoHolder.ligacao}
              handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, ligacao: value }))}
              onReset={() => setPaInfoHolder((prev) => ({ ...prev, ligacao: '' }))}
              resetOptionLabel='NÃO DEFINIDO'
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <SelectInput
              label='AMPERAGEM'
              options={AmperageOptions}
              value={paInfoHolder.amperagem}
              handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, amperagem: value }))}
              onReset={() => setPaInfoHolder((prev) => ({ ...prev, amperagem: '' }))}
              resetOptionLabel='NÃO DEFINIDO'
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <SelectInput
              label='TIPO'
              options={EnergyPATypes}
              value={paInfoHolder.tipo}
              handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, tipo: value }))}
              onReset={() => setPaInfoHolder((prev) => ({ ...prev, tipo: 'À FAVOR DA REDE' }))}
              resetOptionLabel='NÃO DEFINIDO'
              width={'100%'}
            />
          </div>
          {infoHolder.localizacao?.uf == 'GO' ? (
            <div className='w-full lg:w-1/4'>
              <TextInput
                label={'CÓDIGO DO POSTE DE DERIVAÇÃO'}
                placeholder={'Preencha o código do poste de derivação...'}
                value={paInfoHolder.codigoPosteDerivacao || ''}
                handleChange={(value) => {
                  setPaInfoHolder((prev) => ({ ...prev, codigoPosteDerivacao: value }));
                }}
                width={'100%'}
              />
            </div>
          ) : null}
        </div>
        <div className='flex w-full flex-col justify-around gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/4'>
            <SelectInput
              label='TIPO DO RAMAL DE ENTRADA'
              options={EnergyPAConnectionTypes}
              value={paInfoHolder.tipoEntrada}
              handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, tipoEntrada: value }))}
              onReset={() => setPaInfoHolder((prev) => ({ ...prev, tipoEntrada: 'AÉREO' }))}
              resetOptionLabel='NÃO DEFINIDO'
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <SelectInput
              label='TIPO DO RAMAL DE ENTRADA'
              options={EnergyPAConnectionTypes}
              value={paInfoHolder.tipoSaida}
              handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, tipoSaida: value }))}
              onReset={() => setPaInfoHolder((prev) => ({ ...prev, tipoSaida: 'AÉREO' }))}
              resetOptionLabel='NÃO DEFINIDO'
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <TextInput
              label={'CÓDIGO DO MEDIDOR'}
              placeholder={'Preencha o código do medidor de energia...'}
              value={paInfoHolder.codigoMedidor || ''}
              handleChange={(value) => {
                setPaInfoHolder((prev) => ({ ...prev, codigoMedidor: value }));
              }}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/4'>
            <SelectInput
              label='MODELO DA CAIXA DO INVERSOR'
              options={EnergyMeterBoxModels}
              value={paInfoHolder.modeloCaixaMedidor}
              handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, modeloCaixaMedidor: value }))}
              onReset={() => setPaInfoHolder((prev) => ({ ...prev, modeloCaixaMedidor: null }))}
              resetOptionLabel='NÃO DEFINIDO'
              width={'100%'}
            />
          </div>
        </div>
        <div className='flex w-full items-center justify-center self-center lg:w-1/3'>
          <CheckboxInput
            labelFalse='NECESSÁRIO AUMENTO/ALTERAÇÃO'
            labelTrue='NECESSÁRIO AUMENTO/ALTERAÇÃO'
            justify='justify-center'
            checked={paInfoHolder.alteracao}
            handleChange={(value) => {
              setPaInfoHolder((prev) => ({ ...prev, alteracao: value }));
            }}
          />
        </div>
        {paInfoHolder.alteracao ? (
          <div className='flex w-full flex-col justify-around gap-2 lg:flex-row'>
            <div className='w-full lg:w-1/3'>
              <SelectInput
                label='LIGAÇÃO'
                options={[
                  { id: 1, label: 'MONOFÁSICO', value: 'MONOFÁSICO' },
                  { id: 2, label: 'BIFÁSICO', value: 'BIFÁSICO' },
                  { id: 3, label: 'TRIFÁSICO', value: 'TRIFÁSICO' },
                ]}
                value={paInfoHolder.novaLigacao}
                handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, novaLigacao: value }))}
                onReset={() => setPaInfoHolder((prev) => ({ ...prev, novaLigacao: null }))}
                resetOptionLabel='NÃO DEFINIDO'
                width={'100%'}
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <SelectInput
                label='AMPERAGEM'
                options={AmperageOptions}
                value={paInfoHolder.novaAmperagem}
                handleChange={(value) => setPaInfoHolder((prev) => ({ ...prev, novaAmperagem: value }))}
                onReset={() => setPaInfoHolder((prev) => ({ ...prev, novaAmperagem: null }))}
                resetOptionLabel='NÃO DEFINIDO'
                width={'100%'}
              />
            </div>
          </div>
        ) : null}
        <div className='mt-2 flex w-full items-center justify-end'>
          <button
            onClick={addEnergyPA}
            className='rounded border border-green-500 p-1 font-bold text-green-500 duration-300 ease-in-out hover:bg-green-500 hover:text-white'
          >
            ADICIONAR ITEM
          </button>
        </div>
      </div>
      <div className='mt-2 flex w-full flex-col gap-2'>
        <h1 className='w-full rounded-tl-sm rounded-tr-sm bg-primary/50 p-1 text-center font-bold text-white'>LISTA DE PADRÕES</h1>
        {infoHolder.padrao.length > 0 ? (
          infoHolder.padrao.map((paInfo, index) => (
            <div key={index} className='flex w-full flex-col border border-primary/30 p-2 shadow-md'>
              <div className='flex w-full items-center justify-between'>
                <h1 className='font-medium leading-none tracking-tight text-primary/50'>
                  PADRÃO <strong className='text-[#fead41]'>{paInfo.ligacao} </strong> de{' '}
                  <strong className='text-[#fead41]'>{paInfo.amperagem}</strong>
                </h1>
                <button
                  onClick={() => removeEnergyPA(index)}
                  className='w-fit cursor-pointer text-[20px] text-red-500 opacity-40 duration-300 ease-in hover:scale-110 hover:text-red-500 hover:opacity-100'
                >
                  <MdDelete />
                </button>
              </div>

              <div className='mt-2 flex w-full flex-wrap items-center justify-around'>
                <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                  <TbCategoryFilled />
                  <p className='text-xs lg:text-sm'>
                    <strong className='text-cyan-500'>TIPO:</strong> {paInfo.tipo}
                  </p>
                </div>
                <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                  <AiOutlineArrowDown />
                  <p className='text-xs lg:text-sm'>
                    <strong className='text-cyan-500'>ENTRADA:</strong> {paInfo.tipoEntrada}
                  </p>
                </div>
                <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                  <AiOutlineArrowUp />
                  <p className='text-xs lg:text-sm'>
                    <strong className='text-cyan-500'>SAÍDA:</strong> {paInfo.tipoSaida}
                  </p>
                </div>
                <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                  <IoMdBarcode />
                  <p className='text-xs lg:text-sm'>
                    <strong className='text-cyan-500'>Nº DO MEDIDOR:</strong> {paInfo.codigoMedidor}
                  </p>
                </div>
                <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                  <TbBoxModel2 />
                  <p className='text-xs lg:text-sm'>
                    <strong className='text-cyan-500'>MODELO DA CAIXA:</strong>: {paInfo.modeloCaixaMedidor || 'NÃO DEFINIDO'}
                  </p>
                </div>
                {paInfo.codigoPosteDerivacao ? (
                  <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                    <IoMdBarcode />
                    <p className='text-xs lg:text-sm'>
                      <strong className='text-cyan-500'>Nº DO POSTE DE DERIVAÇÃO:</strong> {paInfo.codigoPosteDerivacao}
                    </p>
                  </div>
                ) : null}
              </div>
              {paInfo.alteracao ? (
                <div className='mt-2 flex w-full flex-col'>
                  <div className='flex w-full items-center justify-center gap-2 text-red-500'>
                    <TbAlertTriangleFilled size={18} />
                    <p className='text-xs font-bold lg:text-base'>ALTERAÇÃO</p>
                  </div>
                  <div className='mt-1 flex w-full flex-wrap items-center justify-around'>
                    <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                      <MdOutlineSettingsInputComponent />
                      <p className='text-xs lg:text-sm'>
                        <strong className='text-cyan-500'>NOVA AMPERAGEM:</strong> {paInfo.novaAmperagem}
                      </p>
                    </div>
                    <div className='flex w-1/2 items-center gap-2 lg:w-fit'>
                      <LuUtilityPole />
                      <p className='text-xs lg:text-sm'>
                        <strong className='text-cyan-500'>NOVA LIGAÇÃO:</strong> {paInfo.novaLigacao}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <p className='flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/50'>
            Nenhum padrão adicionado à lista...
          </p>
        )}
      </div>
    </div>
  );
}

export default EnergyPABlock;
