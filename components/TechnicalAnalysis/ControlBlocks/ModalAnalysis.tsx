import { useState } from 'react';
// import { useQueryClient } from 'react-query'

// import { useKey } from '../../../utils/hooks'
// import { useTechnicalAnalysisById } from '../../../utils/methods/query/techAnalysis'
import { FaSave, FaUser } from 'react-icons/fa';

import { VscChromeClose } from 'react-icons/vsc';
import SelectWithImages from '../../Inputs/SelectWithImages';
import ErrorPage from '../../utils/ErrorComponent';
import LoadingPage from '../../utils/LoadingComponent';

import { formatNameAsInitials } from '@/lib/methods/formatting';
import { TTechnicalAnalysis } from '@/utils/schemas/technical-analysis.schema';
import { EngineeringAnalysts, TechnicalAnalysisSolicitationTypes, TechnicalAnalysisStatus } from '@/utils/select-options';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import Link from 'next/link';
import { BsCalendarCheckFill, BsCode } from 'react-icons/bs';
import SelectInput from '../../Inputs/SelectInput';
import AdditionalServicesBlock from './AdditionalServicesBlock';
import DescriptiveBlock from './DescriptiveBlock';
import DetailsBlock from './DetailsBlock';
import EnergyPABlock from './EnergyPABlock';
import EquipmentBlock from './EquipmentBlock';
import ExecutionBlock from './ExecutionBlock';
import LocationBlock from './LocationBlock';
import SupplyBlock from './SupplyBlock';
import TransformerBlock from './TransformerBlock';

type ModalAnalysisProps = {
  analysisId: string;
  modalIsOpen: boolean;
  closeModal: () => void;
  analysis: TTechnicalAnalysis;
};
function ModalAnalysis({ analysisId, modalIsOpen, closeModal, analysis }: ModalAnalysisProps) {
  //   useKey('Escape', () => closeModal())
  const queryClient = useQueryClient();
  //   const { data: analysis, isSuccess, isLoading, isError } = useTechnicalAnalysisById({ enabled: !!analysisId, id: analysisId })
  const isLoading = false;
  const isSuccess = true;
  const isError = false;
  const [infoHolder, setInfoHolder] = useState<TTechnicalAnalysis>(analysis);
  const [changes, setChanges] = useState({});

  function mutate() {}
  function reopenAnalysis() {}
  function concludeVisita() {}
  return (
    <>
      <div id='defaultModal' className='fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]'>
        <div className='fixed left-[50%] top-[50%] z-100 h-[93%] w-[93%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px]'>
          <div className='flex h-full flex-col'>
            <div className='flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row'>
              <div className='flex flex-col'>
                <h1 className='pl-6 font-bold text-[#15599a]'>{analysis ? analysis.nome : 'CARREGANDO...'}</h1>
                <p className='text-xs italic text-primary/50'>#{analysis?._id}</p>
              </div>
              <div className='flex items-center gap-x-2'>
                {/* {msg.text && <p className={`hidden lg:block text-sm italic ${msg.color}`}>{msg.text}</p>} */}
                <button
                  //   disabled={isLoading}
                  onClick={mutate}
                  className='flex cursor-pointer items-center gap-x-2 rounded-sm bg-[#15599a] p-2 text-sm font-bold text-white transition duration-300 ease-in-out disabled:bg-primary/30 disabled:text-white hover:scale-105 hover:bg-blue-500'
                >
                  <p className='mr-2 text-sm'>Salvar alterações</p>
                  <FaSave />
                </button>
                <button
                  onClick={() => closeModal()}
                  type='button'
                  className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
                >
                  <VscChromeClose style={{ color: 'red' }} />
                </button>
              </div>
              {/* <p className={`block lg:hidden text-sm italic ${msg.color}`}>{msg.text}</p> */}
            </div>
            {isLoading ? <LoadingPage /> : null}
            {isError ? <ErrorPage msg={'Erro ao carregar informações da análise. Tente novamente.'} /> : null}
            {isSuccess && analysis ? (
              <div className='flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
                <div className='flex w-full items-center justify-center gap-2'>
                  <SelectWithImages
                    label={'ANALISTA RESPONSÁVEL'}
                    labelClassName='font-bold text-primary/80 text-xs'
                    value={analysis.analista?.id}
                    options={EngineeringAnalysts.map((analyst) => ({
                      id: analyst.id,
                      label: analyst.apelido,
                      value: analyst,
                      url: analyst.avatar_url,
                      fallback: formatNameAsInitials(analyst.nome),
                    }))}
                    handleChange={(value) => {
                      setInfoHolder((prev) => ({ ...prev, analista: value }));
                      setChanges((prev) => ({ ...prev, analista: value }));
                    }}
                    resetOptionLabel='NÃO DEFINIDO'
                    onReset={() => {
                      setInfoHolder((prev) => ({ ...prev, analista: null }));
                      setChanges((prev) => ({ ...prev, analista: null }));
                    }}
                  />
                  <SelectInput
                    label='TIPO DE SOLICITAÇÃO'
                    options={TechnicalAnalysisSolicitationTypes}
                    value={infoHolder.tipoSolicitacao}
                    handleChange={(value) => {
                      setInfoHolder((prev) => ({ ...prev, tipoSolicitacao: value }));
                      setChanges((prev) => ({ ...prev, tipoSolicitacao: value }));
                    }}
                    onReset={() => {
                      setInfoHolder((prev) => ({ ...prev, tipoSolicitacao: 'SIMPLES' }));
                      setChanges((prev) => ({ ...prev, tipoSolicitacao: 'SIMPLES' }));
                    }}
                    resetOptionLabel='NÃO DEFINIDO'
                  />
                  <SelectInput
                    label='COMPLEXIDADE DO LAUDO'
                    options={[
                      { id: 1, label: 'SIMPLES', value: 'SIMPLES' },
                      { id: 2, label: 'INTERMEDIÁRIO', value: 'INTERMEDIÁRIO' },
                      { id: 3, label: 'COMPLEXO', value: 'COMPLEXO' },
                    ]}
                    value={infoHolder.complexidade}
                    handleChange={(value) => {
                      setInfoHolder((prev) => ({ ...prev, complexidade: value }));
                      setChanges((prev) => ({ ...prev, complexidade: value }));
                    }}
                    onReset={() => {
                      setInfoHolder((prev) => ({ ...prev, complexidade: 'SIMPLES' }));
                      setChanges((prev) => ({ ...prev, complexidade: 'SIMPLES' }));
                    }}
                    resetOptionLabel='NÃO DEFINIDO'
                  />
                </div>
                {analysis.dataEfetivacao ? (
                  <div className='flex w-full flex-col items-center gap-2'>
                    <div className={`flex items-center gap-2 text-green-500`}>
                      <BsCalendarCheckFill />
                      <p className='text-xs font-medium'>{dayjs(analysis.dataEfetivacao).format('DD/MM/YYYY HH:mm')}</p>
                    </div>
                    <button
                      onClick={reopenAnalysis}
                      className='rounded border border-primary/50 p-1 font-bold text-primary/50 duration-300 ease-in-out hover:bg-primary/50 hover:text-white'
                    >
                      REABRIR ANÁLISE
                    </button>
                  </div>
                ) : (
                  <div className='flex w-full flex-col items-center gap-2'>
                    <SelectInput
                      label={'STATUS DA ANÁLISE'}
                      resetOptionLabel={'NÃO DEFINIDO'}
                      options={TechnicalAnalysisStatus.filter((s) => s.value != 'CONCLUIDO')}
                      value={infoHolder.status}
                      handleChange={(value) => {
                        setInfoHolder((prev) => ({ ...prev, status: value }));
                        setChanges((prev) => ({ ...prev, status: value }));
                      }}
                      onReset={() => {
                        setInfoHolder((prev) => ({ ...prev, status: 'PENDENTE' }));
                        setChanges((prev) => ({ ...prev, status: 'PENDENTE' }));
                      }}
                    />
                    <button
                      onClick={concludeVisita}
                      className='rounded border border-green-500 p-1 font-bold text-green-500 duration-300 ease-in-out hover:bg-green-500 hover:text-white'
                    >
                      FINALIZAR ANÁLISE
                    </button>
                  </div>
                )}
                <span className='mb-2 w-full rounded-tl-md rounded-tr-md bg-[#15599a] py-2 text-center font-bold text-white'>
                  INFORMAÇÕES DO CLIENTE
                </span>
                {analysis.projeto ? (
                  <div className='flex w-full flex-col items-center justify-center gap-2 md:flex-row md:gap-4'>
                    <div className='flex items-center gap-2'>
                      <BsCode size={'20px'} color='rgb(31,41,55)' />
                      {analysis.projeto.id ? (
                        <Link href={`https://crm.ampereenergias.com.br/projeto/id/${analysis.projeto.id}`}>
                          <a className='font-raleway cursor-pointer text-sm font-medium duration-300 ease-in-out hover:text-cyan-300'>
                            #{analysis.projeto.identificador || 'N/A'}
                          </a>
                        </Link>
                      ) : (
                        <p className='font-raleway cursor-pointer text-sm font-medium duration-300 ease-in-out hover:text-blue-300'>
                          #{analysis.projeto.identificador || 'N/A'}
                        </p>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <FaUser size={'20px'} color='rgb(31,41,55)' />
                      <p className='font-raleway text-sm font-medium'>{analysis.projeto.nome || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <p className='w-full py-2 text-center text-sm italic text-primary/50'>Sem informações do projeto...</p>
                )}
                <LocationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                <EquipmentBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                <DetailsBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                <EnergyPABlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                <TransformerBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                <ExecutionBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                <SupplyBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                <DescriptiveBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                <AdditionalServicesBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalAnalysis;
