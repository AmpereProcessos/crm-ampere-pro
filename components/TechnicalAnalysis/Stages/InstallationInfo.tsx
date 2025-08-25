import DocumentFileInput from '@/components/Inputs/DocumentFileInput';
import TextInput from '@/components/Inputs/TextInput';
import { TFileHolder } from '@/utils/schemas/file-reference.schema';
import { TTechnicalAnalysis } from '@/utils/schemas/technical-analysis.schema';
import React from 'react';
import { toast } from 'react-hot-toast';
type InstallationInfoProps = {
  infoHolder: TTechnicalAnalysis;
  setInfoHolder: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
  goToNextStage: () => void;
  goToPreviousStage: () => void;
  files: TFileHolder;
  setFiles: React.Dispatch<React.SetStateAction<TFileHolder>>;
};
function InstallationInfo({ infoHolder, setInfoHolder, files, setFiles, goToNextStage, goToPreviousStage }: InstallationInfoProps) {
  function validateAndProceed() {
    if (infoHolder.distancias.cabeamentoCC.trim().length < 2) return toast.error('Por favor, preencha a distância dos módulos até os inversores.');

    if (infoHolder.distancias.cabeamentoCA.trim().length < 2) return toast.error('Por favor, preencha a distância dos inversores até os padrão.');

    if (infoHolder.distancias.conexaoInternet.trim().length < 2)
      return toast.error('Por favor, preencha a distância dos inversores até o roteador mais próximo.');

    if (!files['FOTO DA FACHADA']) return toast.error('Anexe uma foto da faixada da instalação.');
    if (!files['FOTO DO QUADRO DE DISTRIBUIÇÃO']) return toast.error('Anexe uma foto do quadro de distribuição.');
    if (!files['FOTO DO LOCAL DE ATERRAMENTO']) return toast.error('Preencha informações sobre o local de aterramento.');
    if (infoHolder.detalhes.topologia == 'INVERSOR' && !files['FOTO DO LOCAL DE INSTALAÇÃO DO INVERSOR'])
      return toast.error('Anexe uma foto do local para instalação do inversor.');
    return goToNextStage();
  }
  return (
    <div className='flex w-full grow flex-col bg-background px-2'>
      <h1 className='w-full rounded-md  bg-primary/70 p-1 text-center font-medium text-white'>INFORMAÇÕES SOBRE A INSTALAÇÃO </h1>

      <div className='flex w-full grow flex-col gap-2'>
        <div className='flex w-full flex-col gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='LOCAL DE ATERRAMENTO'
              placeholder='Preencha o local de aterramento...'
              value={infoHolder.locais.aterramento || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, locais: { ...prev.locais, aterramento: value } }));
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
              }}
              width={'100%'}
            />
          </div>
        </div>
        <div className='flex w-full flex-col gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='DISTANCIA DO INVERSOR AO PADRÃO'
              placeholder='Preencha a distância para cabeamento CA...'
              value={infoHolder.distancias.cabeamentoCA || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, distancias: { ...prev.distancias, cabeamentoCA: value } }));
              }}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='DISTANCIA DOS MÓDULOS AO INVERSOR'
              placeholder='Preencha a distância para cabeamento CC..'
              value={infoHolder.distancias.cabeamentoCC || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, distancias: { ...prev.distancias, cabeamentoCC: value } }));
              }}
              width={'100%'}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <TextInput
              label='DISTÂNCIA DO INVERSOR ATÉ O ROTEADOR'
              placeholder='Preencha a distância do comunicador ao roteador...'
              value={infoHolder.distancias.conexaoInternet || ''}
              handleChange={(value) => {
                setInfoHolder((prev) => ({ ...prev, distancias: { ...prev.distancias, conexaoInternet: value } }));
              }}
              width={'100%'}
            />
          </div>
        </div>
        <div className='flex w-full flex-col'>
          <h1 className='w-full rounded-tl-sm rounded-tr-sm bg-primary/50 p-1 text-center font-bold text-white'>COMENTÁRIOS COMPLEMENTARES</h1>
          <textarea
            placeholder='Preencha comentários relevantes para execução da análise.'
            value={infoHolder.comentarios || ''}
            onChange={(e) => {
              setInfoHolder((prev) => ({
                ...prev,
                comentarios: e.target.value,
              }));
            }}
            className='min-h-[80px] w-full resize-none rounded-bl-sm rounded-br-sm bg-primary/10 p-3 text-center text-xs font-medium text-primary/60 outline-hidden'
          />
        </div>
        <h1 className='mt-2 w-full text-start font-sans  font-bold text-cyan-500'>ARQUIVOS</h1>
        <div className='flex w-full flex-col items-center justify-center gap-2 lg:flex-row'>
          <div className='w-full lg:w-1/3'>
            <DocumentFileInput
              label='FOTO DA FACHADA'
              value={files['FOTO DA FACHADA']}
              handleChange={(value) => setFiles((prev) => ({ ...prev, ['FOTO DA FACHADA']: value }))}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <DocumentFileInput
              label='FOTO DO QUADRO DE DISTRIBUIÇÃO'
              value={files['FOTO DO QUADRO DE DISTRIBUIÇÃO']}
              handleChange={(value) => setFiles((prev) => ({ ...prev, ['FOTO DO QUADRO DE DISTRIBUIÇÃO']: value }))}
            />
          </div>
          <div className='w-full lg:w-1/3'>
            <DocumentFileInput
              label='FOTO DO LOCAL DE INSTALAÇÃO DO NOVO DISJUNTOR'
              value={files['FOTO DO LOCAL DE INSTALAÇÃO DO NOVO DISJUNTOR']}
              handleChange={(value) => setFiles((prev) => ({ ...prev, ['FOTO DO LOCAL DE INSTALAÇÃO DO NOVO DISJUNTOR']: value }))}
            />
          </div>
        </div>
        <div className='flex w-full flex-col items-center justify-center gap-2 lg:flex-row'>
          {infoHolder.detalhes.topologia == 'INVERSOR' ? (
            <div className='w-full lg:w-1/2'>
              <DocumentFileInput
                label='FOTO DO LOCAL DE INSTALAÇÃO DO INVERSOR'
                value={files['FOTO DO LOCAL DE INSTALAÇÃO DO INVERSOR']}
                handleChange={(value) => setFiles((prev) => ({ ...prev, ['FOTO DO LOCAL DE INSTALAÇÃO DO INVERSOR']: value }))}
              />
            </div>
          ) : null}

          <div className='w-full lg:w-1/2'>
            <DocumentFileInput
              label='FOTO DO LOCAL DE ATERRAMENTO'
              value={files['FOTO DO LOCAL DE ATERRAMENTO']}
              handleChange={(value) => setFiles((prev) => ({ ...prev, ['FOTO DO LOCAL DE ATERRAMENTO']: value }))}
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

export default InstallationInfo;
