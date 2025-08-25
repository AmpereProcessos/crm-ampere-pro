import SelectInput from '@/components/Inputs/SelectInput';
import SelectWithImages from '@/components/Inputs/SelectWithImages';
import TextInput from '@/components/Inputs/TextInput';
import AdditionalCostsBlock from '@/components/TechnicalAnalysis/ControlBlocks/AdditionalCostsBlock';
import AdditionalServicesBlock from '@/components/TechnicalAnalysis/ControlBlocks/AdditionalServicesBlock';
import ConclusionBlock from '@/components/TechnicalAnalysis/ControlBlocks/ConclusionBlock';
import DescriptiveBlock from '@/components/TechnicalAnalysis/ControlBlocks/DescriptiveBlock';
import DetailsBlock from '@/components/TechnicalAnalysis/ControlBlocks/DetailsBlock';
import DrawBlock from '@/components/TechnicalAnalysis/ControlBlocks/DrawBlock';
import EnergyPABlock from '@/components/TechnicalAnalysis/ControlBlocks/EnergyPABlock';
import EquipmentBlock from '@/components/TechnicalAnalysis/ControlBlocks/EquipmentBlock';
import ExecutionBlock from '@/components/TechnicalAnalysis/ControlBlocks/ExecutionBlock';
import FilesBlock from '@/components/TechnicalAnalysis/ControlBlocks/FilesBlock';
import LocationBlock from '@/components/TechnicalAnalysis/ControlBlocks/LocationBlock';
import ModuleOrientationBlock from '@/components/TechnicalAnalysis/ControlBlocks/ModuleOrientationBlock';
import PendencyBlock from '@/components/TechnicalAnalysis/ControlBlocks/PendencyBlock';
import StructureBlock from '@/components/TechnicalAnalysis/ControlBlocks/StructureBlock';
import SupplyBlock from '@/components/TechnicalAnalysis/ControlBlocks/SupplyBlock';
import TransformerBlock from '@/components/TechnicalAnalysis/ControlBlocks/TransformerBlock';
import Avatar from '@/components/utils/Avatar';
import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import type { TUserSession } from '@/lib/auth/session';
import { getErrorMessage } from '@/lib/methods/errors';
import { formatDateAsLocale } from '@/lib/methods/formatting';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { editTechnicalAnalysis } from '@/utils/mutations/technical-analysis';
import { useTechnicalAnalysisById } from '@/utils/queries/technical-analysis';
import { useTechnicalAnalysts } from '@/utils/queries/users';
import { TTechnicalAnalysisDTO } from '@/utils/schemas/technical-analysis.schema';
import {
  TechnicalAnalysisComplexity,
  TechnicalAnalysisReportTypes,
  TechnicalAnalysisSolicitationTypes,
  TechnicalAnalysisStatus,
} from '@/utils/select-options';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BsCalendarCheckFill, BsCalendarFill, BsCode } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa';
import { VscChromeClose } from 'react-icons/vsc';

type ControlTechnicalAnalysisProps = {
  analysisId: string;
  session: TUserSession;
  closeModal: () => void;
};
export default function ControlTechnicalAnalysis({ analysisId, session, closeModal }: ControlTechnicalAnalysisProps) {
  const queryClient = useQueryClient();
  const { data: analysis, isLoading, isError, isSuccess, error } = useTechnicalAnalysisById({ id: analysisId });
  const { data: analysts } = useTechnicalAnalysts();
  const [infoHolder, setInfoHolder] = useState<TTechnicalAnalysisDTO>({
    _id: 'id-holder',
    idParceiro: session.user.idParceiro || '',
    nome: '',
    status: 'PENDENTE', // create a list of options
    complexidade: 'SIMPLES',
    arquivosAuxiliares: '', // link de fotos do drone, por exemplo
    pendencias: [],
    anotacoes: '', // anotações gerais para auxilio ao analista
    tipoSolicitacao: '',
    analista: null,
    requerente: {
      id: session?.user.id,
      nome: session?.user.nome,
      apelido: '',
      avatar_url: session?.user.avatar_url,
      contato: '', // telefone
    },
    oportunidade: {
      id: '',
      nome: '',
      identificador: '',
    },
    localizacao: {
      cep: '',
      uf: '',
      cidade: '',
      bairro: '',
      endereco: '',
      numeroOuIdentificador: '',
    },
    equipamentosAnteriores: [],
    equipamentos: [],
    padrao: [],
    transformador: {
      acopladoPadrao: false,
      codigo: '',
      potencia: 0,
    },
    execucao: {
      observacoes: '',
      memorial: null,
      espacoQGBT: false,
    },
    descritivo: [],
    servicosAdicionais: {
      alambrado: null,
      britagem: null,
      casaDeMaquinas: null,
      barracao: null,
      roteador: null,
      limpezaLocal: null,
      redeReligacao: null,
      terraplanagem: null,
      realimentar: false,
    },
    detalhes: {
      concessionaria: '',
      topologia: 'MICRO-INVERSOR',
      materialEstrutura: null,
      tipoEstrutura: null,
      tipoTelha: null,
      fixacaoInversores: null,
      imagensDrone: false,
      imagensFachada: false,
      imagensSatelite: false,
      medicoes: false,
      orientacao: '',
      telhasReservas: null,
    },
    distancias: {
      conexaoInternet: '',
      cabeamentoCA: '', // inversor ao padrão
      cabeamentoCC: '', // modulos ao inversor
    },
    locais: {
      aterramento: '',
      inversor: '', // instalação do inversor, varannda, garagem, etc
      modulos: '', // instalação dos módulos, telhado, solo em x, solo em y, etc
    },
    custos: [],
    alocacaoModulos: {
      leste: null,
      nordeste: null,
      noroeste: null,
      norte: null,
      oeste: null,
      sudeste: null,
      sudoeste: null,
      sul: null,
    },
    desenho: {
      observacoes: '',
      tipo: '', //
      url: '',
    },
    suprimentos: {
      observacoes: '',
      itens: [],
    },
    conclusao: {
      // UTILIZADO PELOS VENDEDORES
      observacoes: '',
      espaco: false,
      inclinacao: false,
      sombreamento: false,
      padrao: null,
      estrutura: null,
    },
    dataInsercao: new Date().toISOString(),
  });
  const [changes, setChanges] = useState<{ [key: string]: any }>({});
  const { mutate: handleEditTechnicalAnalysis, isPending } = useMutationWithFeedback({
    mutationKey: ['edit-technical-analysis', analysisId],
    mutationFn: editTechnicalAnalysis,
    queryClient: queryClient,
    affectedQueryKey: ['technical-analysis-by-id', analysisId],
    callbackFn: async () => await queryClient.invalidateQueries({ queryKey: ['technical-analysis'] }),
  });

  useEffect(() => {
    if (analysis) setInfoHolder(analysis);
  }, [analysis]);

  console.log('TESTE');
  return (
    <div id='control-technical-analysis' className='fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]'>
      <div className='relative left-[50%] top-[50%] z-100 h-[80%] max-h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-md bg-background p-[10px] lg:w-[90%]'>
        <div className='flex h-full w-full flex-col'>
          <div className='flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row'>
            <div className='flex flex-col items-start'>
              <h3 className='text-xl font-bold text-primary  '>{infoHolder.nome || 'CONTROLAR ANÁLISE TÉCNICA'}</h3>
              <p className='text-[0.6rem] italic tracking-tight text-primary/70'>#{analysisId}</p>
            </div>

            <button
              onClick={() => closeModal()}
              type='button'
              className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          <div className='flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
            {isLoading ? <LoadingComponent /> : null}
            {isError ? <ErrorComponent msg={getErrorMessage(error)} /> : null}
            {isSuccess ? (
              <>
                <div className='flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-2 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
                  <div className='mt-2 flex items-center justify-center gap-4'>
                    <div className='flex items-center gap-2'>
                      <Avatar fallback={'U'} height={25} width={25} url={infoHolder?.requerente?.avatar_url || undefined} />
                      <p className='text-xs font-medium text-primary/70'>{infoHolder?.requerente?.nome || 'Autor não identificado'}</p>
                    </div>
                    <div className='flex items-center gap-2 text-primary/70'>
                      <BsCalendarFill />
                      <p className='text-xs font-medium'>{formatDateAsLocale(infoHolder.dataInsercao, true)}</p>
                    </div>
                  </div>
                  <div className='flex w-full flex-col justify-center gap-2 lg:flex-row'>
                    <div className='w-full lg:w-[1/2]'>
                      <TextInput
                        label='NOME DA ANÁLISE TÉCNICA'
                        placeholder='Preencha o nome da análise técnica...'
                        value={infoHolder.nome}
                        handleChange={(value) => {
                          setInfoHolder((prev) => ({ ...prev, nome: value }));
                          setChanges((prev) => ({ ...prev, nome: value }));
                        }}
                        width='100%'
                      />
                    </div>
                    <div className='w-full lg:w-[1/2]'>
                      {/**[TODO] CREATE ROUTE FOR USERS WITH ANALYSIS EDIT PERMISSIONS */}
                      <SelectWithImages
                        label={'ANALISTA RESPONSÁVEL'}
                        value={infoHolder.analista?.id}
                        options={analysts?.map((a) => ({ id: a._id, label: a.nome, value: a, url: a.avatar_url || undefined })) || []}
                        handleChange={(value) => {
                          setInfoHolder((prev) => ({
                            ...prev,
                            analista: { id: value._id, nome: value.nome, apelido: value.nome, avatar_url: value.avatar_url },
                          }));
                          setChanges((prev) => ({
                            ...prev,
                            analista: { id: value._id, nome: value.nome, apelido: value.nome, avatar_url: value.avatar_url },
                          }));
                        }}
                        resetOptionLabel='NÃO DEFINIDO'
                        onReset={() => {
                          setInfoHolder((prev) => ({ ...prev, analista: null }));
                          setChanges((prev) => ({ ...prev, analista: null }));
                        }}
                        width='100%'
                      />
                    </div>
                  </div>
                  <div className='flex w-full flex-col justify-center gap-2 lg:flex-row'>
                    <div className='w-full lg:w-1/2'>
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
                        width='100%'
                      />
                    </div>
                    <div className='w-full lg:w-1/2'>
                      <SelectInput
                        label='COMPLEXIDADE DO LAUDO'
                        options={TechnicalAnalysisComplexity}
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
                        width='100%'
                      />
                    </div>
                  </div>
                  {infoHolder.dataEfetivacao ? (
                    <div className='flex w-full flex-col items-center gap-2'>
                      <div className={`flex items-center gap-2 text-green-500`}>
                        <BsCalendarCheckFill />
                        <p className='text-xs font-medium'>{formatDateAsLocale(infoHolder.dataEfetivacao, true)}</p>
                      </div>
                      <button
                        onClick={() =>
                          // @ts-ignore
                          handleEditTechnicalAnalysis({ id: analysisId, changes: { status: 'PENDENTE', dataEfetivacao: null } })
                        }
                        className='rounded border border-primary/50 p-1 font-bold text-primary/70 duration-300 ease-in-out hover:bg-primary/50 hover:text-primary-foreground'
                      >
                        REABRIR ANÁLISE
                      </button>
                    </div>
                  ) : (
                    <div className='flex w-full flex-col items-center gap-2'>
                      {infoHolder.status != 'CONCLUIDO' ? (
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
                      ) : null}

                      <button
                        onClick={() => {
                          //@ts-ignore
                          handleEditTechnicalAnalysis({ id: analysisId, changes: { status: 'CONCLUIDO', dataEfetivacao: new Date().toISOString() } });
                        }}
                        className='rounded border border-green-500 p-1 font-bold text-green-500 duration-300 ease-in-out hover:bg-green-500 hover:text-primary-foreground'
                      >
                        FINALIZAR ANÁLISE
                      </button>
                    </div>
                  )}
                  <textarea
                    placeholder='SEM ANOTAÇÕES PREENCHIDAS...'
                    value={infoHolder.anotacoes || ''}
                    onChange={(e) => {
                      setInfoHolder((prev) => ({
                        ...prev,
                        anotacoes: e.target.value,
                      }));
                      setChanges((prev) => ({ ...prev, anotacoes: e.target.value }));
                    }}
                    className='min-h-[80px] w-full resize-none rounded-bl-sm rounded-br-sm bg-primary/10 p-3 text-center text-xs font-medium text-primary/60 outline-hidden'
                  />
                  <div className='flex w-full items-center justify-center gap-2 rounded-md bg-primary/80 p-2'>
                    <h1 className='font-bold text-primary-foreground'>PROJETO</h1>
                  </div>
                  {analysis.oportunidade ? (
                    <div className='flex w-full flex-col items-center justify-center gap-2 md:flex-row md:gap-4'>
                      <div className='flex items-center gap-2'>
                        <BsCode size={'20px'} color='rgb(31,41,55)' />
                        {analysis.oportunidade.id ? (
                          <Link href={`/comercial/oportunidades/id/${analysis.oportunidade.id}`}>
                            <p className='font-raleway cursor-pointer text-sm font-medium duration-300 ease-in-out hover:text-cyan-300'>
                              #{analysis.oportunidade.identificador || 'N/A'}
                            </p>
                          </Link>
                        ) : (
                          <p className='font-raleway cursor-pointer text-sm font-medium duration-300 ease-in-out hover:text-blue-300'>
                            #{analysis.oportunidade.identificador || 'N/A'}
                          </p>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        <FaUser size={'20px'} color='rgb(31,41,55)' />
                        <p className='font-raleway text-sm font-medium'>{analysis.oportunidade.nome || 'N/A'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className='w-full py-2 text-center text-sm italic text-primary/70'>Sem informações do projeto...</p>
                  )}
                  <div className='flex w-full flex-col'>
                    <h1 className='w-full rounded-tl-sm rounded-tr-sm bg-primary/50 p-1 text-center font-bold text-primary-foreground'>
                      COMENTÁRIOS DO REQUERENTE
                    </h1>
                    <textarea
                      placeholder='SEM COMENTÁRIOS PREENCHIDOS...'
                      value={infoHolder.comentarios || ''}
                      readOnly={true}
                      onChange={(e) => {
                        setInfoHolder((prev) => ({
                          ...prev,
                          comentarios: e.target.value,
                        }));
                        setChanges((prev) => ({ ...prev, ecomentarios: e.target.value }));
                      }}
                      className='min-h-[80px] w-full resize-none rounded-bl-sm rounded-br-sm bg-primary/10 p-3 text-center text-xs font-medium text-primary/60 outline-hidden'
                    />
                  </div>
                  <PendencyBlock
                    session={session}
                    technicalAnalysisId={analysisId}
                    opportunity={{ id: analysis.oportunidade.id, nome: analysis.oportunidade.nome }}
                    infoHolder={infoHolder}
                    setInfoHolder={setInfoHolder}
                    changes={changes}
                    setChanges={setChanges}
                  />
                  <LocationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                  <EquipmentBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                  <DetailsBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                  <FilesBlock analysisId={analysisId} auxiliarFilesLink={infoHolder.arquivosAuxiliares} session={session} />
                  <StructureBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                  <EnergyPABlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                  <TransformerBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                  <SupplyBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                  <ExecutionBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                  <ModuleOrientationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                  <DescriptiveBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                  <AdditionalServicesBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                  <AdditionalCostsBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />
                  <DrawBlock
                    infoHolder={infoHolder}
                    setInfoHolder={setInfoHolder}
                    changes={changes}
                    setChanges={setChanges}
                    updateAnalysis={(change) => {}}
                  />
                  <ConclusionBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} changes={changes} setChanges={setChanges} />{' '}
                  <div className='mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary/80 p-2'>
                    <h1 className='font-bold text-primary-foreground'>TIPOS DE LAUDO</h1>
                  </div>
                  <div className='flex w-full flex-wrap items-center justify-center gap-2 px-4'>
                    {TechnicalAnalysisReportTypes.map((type) => (
                      <Link key={type.id} href={`/operacional/analises-tecnicas/laudo/${analysisId}?type=${type.value}`}>
                        <p className='w-fit rounded-sm border border-black px-2 py-1 text-center font-bold shadow-md hover:bg-black hover:text-primary-foreground'>
                          {type.value}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className='mt-2 flex w-full items-center justify-end'>
                  <button
                    disabled={isPending}
                    // @ts-ignore
                    onClick={() => handleEditTechnicalAnalysis({ id: analysisId, changes: changes })}
                    className='h-9 whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground'
                  >
                    SALVAR ALTERAÇÕES
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
