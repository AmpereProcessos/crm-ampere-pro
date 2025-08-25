import CheckboxInput from '@/components/Inputs/CheckboxInput';
import SelectInput from '@/components/Inputs/SelectInput';
import { TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema';
import React from 'react';

type ConclusionBlockProps = {
  infoHolder: TTechnicalAnalysisDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysisDTO>>;
  changes: object;
  setChanges: React.Dispatch<React.SetStateAction<object>>;
};
function ConclusionBlock({ infoHolder, setInfoHolder, changes, setChanges }: ConclusionBlockProps) {
  return (
    <div className='mt-4 flex w-full flex-col'>
      <div className='flex w-full items-center justify-center gap-2 rounded-md bg-primary/80 p-2'>
        <h1 className='font-bold text-white'>CONCLUSÃO</h1>
      </div>
      <div className='mt-2 flex w-full flex-col gap-2'>
        <div className='flex w-full flex-col'>
          <h1 className='w-full rounded-tl-sm rounded-tr-sm bg-primary/50 p-1 text-center font-bold text-white'>OBSERVAÇÕES</h1>
          <textarea
            placeholder='SEM OBSERVAÇÕES PREENCHIDAS...'
            value={infoHolder.conclusao?.observacoes || ''}
            onChange={(e) => {
              setInfoHolder((prev) => ({
                ...prev,
                conclusao: prev.conclusao
                  ? { ...prev.conclusao, observacoes: e.target.value }
                  : { observacoes: e.target.value, espaco: false, inclinacao: false, sombreamento: false, padrao: null, estrutura: null },
              }));
              setChanges((prev) => ({ ...prev, 'conclusao.observacoes': e.target.value }));
            }}
            className='min-h-[80px] w-full resize-none rounded-bl-sm rounded-br-sm bg-primary/10 p-3 text-center text-xs font-medium text-primary/60 outline-hidden'
          />
        </div>
        <div className='flex w-full flex-col justify-around gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <CheckboxInput
              labelFalse='POSSUI ESPAÇO PARA INSTALAÇÃO'
              labelTrue='POSSUI ESPAÇO PARA INSTALAÇÃO'
              justify='justify-center'
              checked={infoHolder.conclusao.espaco}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, conclusao: { ...prev.conclusao, espaco: value } }));
                setChanges((prev) => ({ ...prev, 'conclusao.espaco': value }));
              }}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <CheckboxInput
              labelFalse='NECESSÁRIO ESTRUTURA DE INCLINAÇÃO'
              labelTrue='NECESSÁRIO ESTRUTURA DE INCLINAÇÃO'
              justify='justify-center'
              checked={infoHolder.conclusao.inclinacao}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, conclusao: { ...prev.conclusao, inclinacao: value } }));
                setChanges((prev) => ({ ...prev, 'conclusao.inclinacao': value }));
              }}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <CheckboxInput
              labelFalse='SOFRERÁ COM SOMBREAMENTO'
              labelTrue='SOFRERÁ COM SOMBREAMENTO'
              justify='justify-center'
              checked={infoHolder.conclusao.sombreamento}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, conclusao: { ...prev.conclusao, sombreamento: value } }));
                setChanges((prev) => ({ ...prev, 'conclusao.sombreamento': value }));
              }}
            />
          </div>
        </div>
        <div className='flex w-full flex-col justify-around gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <SelectInput
              label={'CONDIÇÃO DO PADRÃO DE ENERGIA'}
              options={[
                { id: 1, label: 'APTO', value: 'APTO' },
                { id: 2, label: 'REFORMAR', value: 'REFORMAR' },
                { id: 3, label: 'TROCAR', value: 'TROCAR' },
              ]}
              value={infoHolder.conclusao.padrao}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, conclusao: { ...prev.conclusao, padrao: value } }));
                setChanges((prev) => ({ ...prev, 'conclusao.padrao': value }));
              }}
              resetOptionLabel={'NÃO DEFINIDO'}
              onReset={() => {
                setInfoHolder((prev) => ({ ...prev, conclusao: { ...prev.conclusao, padrao: null } }));
                setChanges((prev) => ({ ...prev, 'conclusao.padrao': null }));
              }}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <SelectInput
              label={'CONDIÇÃO DA ESTRUTURA CIVIL'}
              options={[
                { id: 1, label: 'APTO', value: 'APTO' },
                { id: 2, label: 'CONDENADO', value: 'CONDENADO' },
                { id: 3, label: 'REFORÇAR', value: 'REFORÇAR' },
                { id: 4, label: 'AVALIAR NA EXECUÇÃO', value: 'AVALIAR NA EXECUÇÃO' },
              ]}
              value={infoHolder.conclusao.estrutura}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, conclusao: { ...prev.conclusao, estrutura: value } }));
                setChanges((prev) => ({ ...prev, 'conclusao.estrutura': value }));
              }}
              resetOptionLabel={'NÃO DEFINIDO'}
              onReset={() => {
                setInfoHolder((prev) => ({ ...prev, conclusao: { ...prev.conclusao, estrutura: null } }));
                setChanges((prev) => ({ ...prev, 'conclusao.estrutura': null }));
              }}
              width={'100%'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConclusionBlock;
