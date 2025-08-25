import TextInput from '@/components/Inputs/TextInput';
import { formatLongString } from '@/utils/methods';
import { TTechnicalAnalysis } from '@/utils/schemas/technical-analysis.schema';
import React from 'react';
import { toast } from 'react-hot-toast';
import { BsCheckCircleFill } from 'react-icons/bs';
type InstallationInfoProps = {
  requestInfo: TTechnicalAnalysis;
  setRequestInfo: React.Dispatch<React.SetStateAction<TTechnicalAnalysis>>;
  requireFiles?: boolean;
  goToNextStage: () => void;
  goToPreviousStage: () => void;
  files:
    | {
        [key: string]: {
          title: string;
          file: File | null | string;
        };
      }
    | undefined;
  setFiles: React.Dispatch<
    React.SetStateAction<
      | {
          [key: string]: {
            title: string;
            file: File | null | string;
          };
        }
      | undefined
    >
  >;
};
function InstallationInfo({
  requestInfo,
  setRequestInfo,
  requireFiles = true,
  files,
  setFiles,
  goToNextStage,
  goToPreviousStage,
}: InstallationInfoProps) {
  function validateFields() {
    if (requestInfo.distancias.cabeamentoCC.trim().length < 2) {
      toast.error('Por favor, preencha a distância dos módulos até os inversores.');
      return false;
    }
    if (requestInfo.distancias.cabeamentoCA.trim().length < 2) {
      toast.error('Por favor, preencha a distância dos inversores até os padrão.');
      return false;
    }
    if (requestInfo.distancias.conexaoInternet.trim().length < 2) {
      toast.error('Por favor, preencha a distância dos inversores até o roteador mais próximo.');
      return false;
    }
    if (requireFiles) {
      if (!files?.fotoFachada) {
        toast.error('Anexe uma foto da faixada da instalação.');
        return false;
      }
      if (!files?.fotoQuadroDistribuicao) {
        toast.error('Anexe uma foto do quadro de distribuição.');
      }
    }

    if (requestInfo.detalhes.topologia == 'INVERSOR' && !files?.fotoLocalInversor) {
      toast.error('Anexe uma foto do local para instalação do inversor.');
    }
    if (requestInfo.localizacao.uf == 'GO') {
      if (!requestInfo.locais.aterramento || requestInfo.locais.aterramento.trim().length < 4) {
        toast.error('Preencha informações sobre o local de aterramento.');
        return false;
      }
      if (requireFiles && !files?.fotoAterramento) {
        toast.error('Anexe uma foto do local de aterramento.');
        return false;
      }
    }
    return true;
  }
  return (
    <div className='flex w-full grow flex-col bg-background px-2'>
      <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>DADOS DA INSTALAÇÃO</span>

      <div className='flex w-full grow flex-col gap-2'>
        <>
          <div className='flex w-full flex-col gap-2 lg:flex-row'>
            <div className='w-full lg:w-1/3'>
              <TextInput
                label='LOCAL DE ATERRAMENTO'
                placeholder='Preencha o local de aterramento...'
                value={requestInfo.locais.aterramento || ''}
                handleChange={(value) => {
                  setRequestInfo((prev) => ({ ...prev, locais: { ...prev.locais, aterramento: value } }));
                }}
                width={'100%'}
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <TextInput
                label='LOCAL DE INSTALAÇÃO DO(S) INVERSOR(ES)'
                placeholder='Preencha o local de instalação do(s) inversor(es)...'
                value={requestInfo.locais.inversor || ''}
                handleChange={(value) => {
                  setRequestInfo((prev) => ({ ...prev, locais: { ...prev.locais, inversor: value } }));
                }}
                width={'100%'}
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <TextInput
                label='LOCAL DE INSTALAÇÃO DOS MÓDULOS'
                placeholder='Preencha o local de instalação dos módulos...'
                value={requestInfo.locais.modulos || ''}
                handleChange={(value) => {
                  setRequestInfo((prev) => ({ ...prev, locais: { ...prev.locais, modulos: value } }));
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
                value={requestInfo.distancias.cabeamentoCA || ''}
                handleChange={(value) => {
                  setRequestInfo((prev) => ({ ...prev, distancias: { ...prev.distancias, cabeamentoCA: value } }));
                }}
                width={'100%'}
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <TextInput
                label='DISTANCIA DOS MÓDULOS AO INVERSOR'
                placeholder='Preencha a distância para cabeamento CC..'
                value={requestInfo.distancias.cabeamentoCC || ''}
                handleChange={(value) => {
                  setRequestInfo((prev) => ({ ...prev, distancias: { ...prev.distancias, cabeamentoCC: value } }));
                }}
                width={'100%'}
              />
            </div>
            <div className='w-full lg:w-1/3'>
              <TextInput
                label='DISTÂNCIA DO INVERSOR ATÉ O ROTEADOR'
                placeholder='Preencha a distância do comunicador ao roteador...'
                value={requestInfo.distancias.conexaoInternet || ''}
                handleChange={(value) => {
                  setRequestInfo((prev) => ({ ...prev, distancias: { ...prev.distancias, conexaoInternet: value } }));
                }}
                width={'100%'}
              />
            </div>
          </div>
          <div className='flex w-full flex-col'>
            <h1 className='w-full rounded-tl-sm rounded-tr-sm bg-primary/50 p-1 text-center font-bold text-primary-foreground'>
              COMENTÁRIOS COMPLEMENTARES
            </h1>
            <textarea
              placeholder='Preencha comentários relevantes para execução da análise.'
              value={requestInfo.comentarios || ''}
              onChange={(e) => {
                setRequestInfo((prev) => ({
                  ...prev,
                  comentarios: e.target.value,
                }));
              }}
              className='min-h-[80px] w-full resize-none rounded-bl-sm rounded-br-sm bg-primary/10 p-3 text-center text-xs font-medium text-primary/60 outline-hidden'
            />
          </div>
          {requireFiles ? (
            <>
              <div className='grid w-full grid-cols-1 grid-rows-2 gap-2 lg:grid-cols-2 lg:grid-rows-1'>
                <div className='flex w-full flex-col items-center justify-center self-center'>
                  <div className='flex items-center gap-2'>
                    <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='laudo'>
                      FOTO DA FACHADA
                    </label>
                    {files?.fotoFachada ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
                  </div>
                  <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                    <div className='absolute'>
                      {files?.fotoFachada ? (
                        <div className='flex flex-col items-center'>
                          <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                          <span className='block text-center font-normal text-primary/40'>
                            {typeof files.fotoFachada.file != 'string' ? files.fotoFachada.file?.name : formatLongString(files.fotoFachada.file, 35)}
                          </span>
                        </div>
                      ) : (
                        <div className='flex flex-col items-center'>
                          <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                          <span className='block font-normal text-primary/40'>Adicione o arquivo aqui...</span>
                        </div>
                      )}
                    </div>
                    <input
                      onChange={(e) =>
                        setFiles({
                          ...files,
                          fotoFachada: {
                            title: 'FOTO DA FACHADA',
                            file: e.target.files ? e.target.files[0] : null,
                          },
                        })
                      }
                      className='h-full w-full opacity-0'
                      type='file'
                      accept='.png, .jpeg, .pdf'
                    />
                  </div>
                </div>
                <div className='flex w-full flex-col items-center justify-center self-center'>
                  <div className='flex items-center gap-2'>
                    <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='laudo'>
                      FOTO DO QUADRO DE DISTRIBUIÇÃO
                    </label>
                    {files?.fotoQuadroDistribuicao ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
                  </div>
                  <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                    <div className='absolute'>
                      {files?.fotoQuadroDistribuicao ? (
                        <div className='flex flex-col items-center'>
                          <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                          <span className='block text-center font-normal text-primary/40'>
                            {typeof files.fotoQuadroDistribuicao.file != 'string'
                              ? files.fotoQuadroDistribuicao.file?.name
                              : formatLongString(files.fotoQuadroDistribuicao.file, 35)}
                          </span>
                        </div>
                      ) : (
                        <div className='flex flex-col items-center'>
                          <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                          <span className='block font-normal text-primary/40'>Adicione o arquivo aqui...</span>
                        </div>
                      )}
                    </div>
                    <input
                      onChange={(e) =>
                        setFiles({
                          ...files,
                          fotoQuadroDistribuicao: {
                            title: 'FOTO DO QUADRO DE DISTRIBUIÇÃO',
                            file: e.target.files ? e.target.files[0] : null,
                          },
                        })
                      }
                      className='h-full w-full opacity-0'
                      type='file'
                      accept='.png, .jpeg, .pdf'
                    />
                  </div>
                </div>
              </div>
              <div className='flex w-full items-center justify-center gap-2'>
                {requestInfo.detalhes.topologia == 'INVERSOR' ? (
                  <div className='flex w-full grow flex-col items-center justify-center self-center'>
                    <div className='flex items-center gap-2'>
                      <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='laudo'>
                        FOTO DO LOCAL DO INVERSOR
                      </label>
                      {files?.fotoLocalInversor ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
                    </div>
                    <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                      <div className='absolute'>
                        {files?.fotoLocalInversor ? (
                          <div className='flex flex-col items-center'>
                            <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                            <span className='block text-center font-normal text-primary/40'>
                              {typeof files.fotoLocalInversor.file != 'string'
                                ? files.fotoLocalInversor.file?.name
                                : formatLongString(files.fotoLocalInversor.file, 35)}
                            </span>
                          </div>
                        ) : (
                          <div className='flex flex-col items-center'>
                            <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                            <span className='block font-normal text-primary/40'>Adicione o arquivo aqui...</span>
                          </div>
                        )}
                      </div>
                      <input
                        onChange={(e) =>
                          setFiles({
                            ...files,
                            fotoLocalInversor: {
                              title: 'FOTO DO LOCAL DO INVERSOR',
                              file: e.target.files ? e.target.files[0] : null,
                            },
                          })
                        }
                        className='h-full w-full opacity-0'
                        type='file'
                        accept='.png, .jpeg, .pdf'
                      />
                    </div>
                  </div>
                ) : null}
                {requestInfo.localizacao.uf == 'GO' ? (
                  <div className='flex w-full grow flex-col items-center justify-center self-center'>
                    <div className='flex items-center gap-2'>
                      <label className='ml-2 text-center text-sm font-bold text-[#15599a]' htmlFor='laudo'>
                        FOTO DO ATERRAMENTO
                      </label>
                      {files?.fotoAterramento ? <BsCheckCircleFill style={{ color: 'rgb(34,197,94)' }} /> : null}
                    </div>
                    <div className='relative mt-2 flex h-fit items-center justify-center rounded-lg border-2 border-dotted border-blue-700 bg-primary/10 p-2'>
                      <div className='absolute'>
                        {files?.fotoAterramento ? (
                          <div className='flex flex-col items-center'>
                            <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                            <span className='block text-center font-normal text-primary/40'>
                              {typeof files.fotoAterramento.file != 'string'
                                ? files.fotoAterramento.file?.name
                                : formatLongString(files.fotoAterramento.file, 35)}
                            </span>
                          </div>
                        ) : (
                          <div className='flex flex-col items-center'>
                            <i className='fa fa-folder-open fa-4x text-blue-700'></i>
                            <span className='block font-normal text-primary/40'>Adicione o arquivo aqui...</span>
                          </div>
                        )}
                      </div>
                      <input
                        onChange={(e) =>
                          setFiles({
                            ...files,
                            fotoAterramento: {
                              title: 'FOTO DO ATERRAMENTO',
                              file: e.target.files ? e.target.files[0] : null,
                            },
                          })
                        }
                        className='h-full w-full opacity-0'
                        type='file'
                        accept='.png, .jpeg, .pdf'
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </>
      </div>
      <div className='mt-2 flex w-full items-end justify-between bg-background'>
        <button onClick={() => goToPreviousStage()} className='rounded p-2 font-bold text-primary/70 duration-300 ease-in-out hover:scale-105'>
          Voltar
        </button>
        <button
          onClick={() => {
            if (validateFields()) {
              goToNextStage();
            }
          }}
          className=' rounded-sm p-2 font-bold hover:bg-black hover:text-primary-foreground'
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default InstallationInfo;
