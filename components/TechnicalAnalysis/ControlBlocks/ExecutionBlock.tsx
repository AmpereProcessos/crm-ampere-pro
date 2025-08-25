import CheckboxInput from '@/components/Inputs/CheckboxInput';
import TextInput from '@/components/Inputs/TextInput';
import { TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema';
import React from 'react';

type ExecutionBlockProps = {
  infoHolder: TTechnicalAnalysisDTO;
  setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysisDTO>>;
  changes: object;
  setChanges: React.Dispatch<React.SetStateAction<object>>;
};
function ExecutionBlock({ infoHolder, setInfoHolder, changes, setChanges }: ExecutionBlockProps) {
  return (
    <div className='mt-4 flex w-full flex-col'>
      <div className='flex w-full items-center justify-center gap-2 rounded-md bg-primary/80 p-2'>
        <h1 className='font-bold text-primary-foreground'>INFORMAÇÕES DE EXECUÇÃO</h1>
      </div>
      <div className='mt-2 flex w-full flex-col gap-2'>
        <div className='flex w-full flex-col'>
          <h1 className='w-full rounded-tl-sm rounded-tr-sm bg-primary/50 p-1 text-center font-bold text-primary-foreground'>OBSERVAÇÕES</h1>
          <textarea
            placeholder='SEM OBSERVAÇÕES PREENCHIDAS...'
            value={infoHolder.execucao?.observacoes || ''}
            onChange={(e) => {
              setInfoHolder((prev) => ({
                ...prev,
                execucao: prev.execucao
                  ? { ...prev.execucao, observacoes: e.target.value }
                  : { observacoes: e.target.value, itens: [], espacoQGBT: false },
              }));
              setChanges((prev) => ({ ...prev, 'execucao.observacoes': e.target.value }));
            }}
            className='min-h-[80px] w-full resize-none rounded-bl-sm rounded-br-sm bg-primary/10 p-3 text-center text-xs font-medium text-primary/60 outline-hidden'
          />
        </div>
        <div className='flex w-full items-center justify-center self-center lg:w-1/3'>
          <CheckboxInput
            labelFalse='POSSUI ESPAÇO NO QGBT'
            labelTrue='POSSUI ESPAÇO NO QGBT'
            justify='justify-center'
            checked={infoHolder.execucao.espacoQGBT}
            handleChange={(value) => {
              setInfoHolder((prev) => ({ ...prev, execucao: { ...prev.execucao, espacoQGBT: value } }));
              setChanges((prev) => ({ ...prev, 'execucao.espacoQGBT': value }));
            }}
          />
        </div>
        <div className='flex w-full flex-col gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='LOCAL DE ATERRAMENTO'
              placeholder='Preencha o local de aterramento...'
              value={infoHolder.locais.aterramento || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, locais: { ...prev.locais, aterramento: value } }));
                setChanges((prev) => ({ ...prev, 'locais.aterramento': value }));
              }}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='LOCAL DE INSTALAÇÃO DO(S) INVERSOR(ES)'
              placeholder='Preencha o local de instalação do(s) inversor(es)...'
              value={infoHolder.locais.inversor || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, locais: { ...prev.locais, inversor: value } }));
                setChanges((prev) => ({ ...prev, 'locais.inversor': value }));
              }}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='LOCAL DE INSTALAÇÃO DOS MÓDULOS'
              placeholder='Preencha o local de instalação dos módulos...'
              value={infoHolder.locais.modulos || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, locais: { ...prev.locais, modulos: value } }));
                setChanges((prev) => ({ ...prev, 'locais.modulos': value }));
              }}
              width={'100%'}
            />
          </div>
        </div>
        <div className='flex w-full flex-col gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='DISTANCIA DO CABEAMENTO CA'
              placeholder='Preencha a distância para cabeamento CA...'
              value={infoHolder.distancias.cabeamentoCA || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, distancias: { ...prev.distancias, cabeamentoCA: value } }));
                setChanges((prev) => ({ ...prev, 'distancias.cabeamentoCA': value }));
              }}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='DISTANCIA DO CABEAMENTO CC'
              placeholder='Preencha a distância para cabeamento CC..'
              value={infoHolder.distancias.cabeamentoCC || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, distancias: { ...prev.distancias, cabeamentoCC: value } }));
                setChanges((prev) => ({ ...prev, 'distancias.cabeamentoCC': value }));
              }}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='DISTÂNCIA ATÉ O ROTEADOR'
              placeholder='Preencha a distância do comunicador ao roteador...'
              value={infoHolder.distancias.conexaoInternet || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, distancias: { ...prev.distancias, conexaoInternet: value } }));
                setChanges((prev) => ({ ...prev, 'distancias.conexaoInternet': value }));
              }}
              width={'100%'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExecutionBlock;
