import type { TUserSession } from '@/lib/auth/session';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { TDocumentationConditionData } from '@/utils/project-documentation/helpers';
import { TOpportunityDTOWithClient } from '@/utils/schemas/opportunity.schema';
import { TProject } from '@/utils/schemas/project.schema';
import { TProposalDTO } from '@/utils/schemas/proposal.schema';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { VscChromeClose } from 'react-icons/vsc';
import ClientBlock from './RequestStages/ClientBlock';
import DocumentationInformationBlock from './RequestStages/DocumentationInformationBlock';
import GeneralInformationBlock from './RequestStages/GeneralInformationBlock';
import HomologationBlock from './RequestStages/HomologationBlock';
import PaymentInformationBlock from './RequestStages/PaymentInformationBlock';
import ReviewInformationBlock from './RequestStages/ReviewInformationBlock';
import SaleCompositionBlock from './RequestStages/SaleCompositionBlock';
import TechnicalAnalysisBlock from './RequestStages/TechnicalAnalysisBlock';

type TFilesHolder = {
  [key: string]: {
    type: 'FILE-REFERENCE' | 'FILE-LIST';
    value: FileList | string;
  } | null;
};

export type TDocumentationHolder = {
  conditionData: TDocumentationConditionData;
  filesHolder: TFilesHolder;
};
type Stages = 'general' | 'client' | 'homologation' | 'technical-analysis' | 'products-and-services' | 'payment' | 'documentation' | 'review';
type NewProjectRequestProps = {
  opportunity: TOpportunityDTOWithClient;
  proposal: TProposalDTO;
  closeModal: () => void;
  session: TUserSession;
};
function NewProjectRequest({ opportunity, proposal, session, closeModal }: NewProjectRequestProps) {
  const queryClient = useQueryClient();
  const sale: TProject['venda'] =
    opportunity.categoriaVenda == 'KIT'
      ? { tipo: 'ÚNICA' }
      : { tipo: 'RECORRENTE', intervalo: proposal.planos[0].intervalo.tipo, espacamento: proposal.planos[0].intervalo.espacamento };

  const [stage, setStage] = useState<Stages>('general');
  const [infoHolder, setInfoHolder] = useState<TProject>({
    indexador: 0,
    nome: '',
    idParceiro: opportunity.idParceiro,
    identificador: opportunity.identificador,
    tipo: {
      id: opportunity.tipo.id,
      titulo: opportunity.tipo.titulo,
    },
    venda: sale,
    responsaveis: opportunity.responsaveis,
    oportunidade: {
      id: opportunity._id,
      nome: opportunity.nome,
    },
    proposta: {
      id: proposal._id,
      nome: proposal.nome,
    },
    cliente: {
      id: opportunity.idCliente,
      nome: opportunity.cliente.nome,
    },
    observacoes: [],
    contatos: {
      email: opportunity.cliente.email || '',
      nomePrimario: opportunity.nome,
      telefonePrimario: opportunity.cliente.telefonePrimario,
      nomeSecundario: '',
      telefoneSecundario: '',
      observacoes: '',
    },
    acessos: [],
    localizacao: {
      cep: opportunity.localizacao.cep || '',
      uf: opportunity.localizacao.uf,
      cidade: opportunity.localizacao.cidade,
      bairro: opportunity.localizacao.bairro || '',
      endereco: opportunity.localizacao.endereco || '',
      numeroOuIdentificador: opportunity.localizacao.numeroOuIdentificador || '',
      distancia: proposal.premissas.distancia,
      complemento: opportunity.localizacao.complemento,
      latitude: opportunity.localizacao.latitude,
      longitude: opportunity.localizacao.longitude,
    },
    segmento: opportunity.segmento || 'RESIDENCIAL',
    contrato: {
      status: 'SOLICITADO',
      dataSolicitacao: new Date().toISOString(),
      dataLiberacao: null,
      dataAssinatura: null,
      formaAssinatura: 'FÍSICA',
    },
    pagamento: {
      pagador: {
        nome: '',
        telefone: '',
        email: '',
        cpfCnpj: '',
      },
      metodo: proposal.pagamento.metodos[0],
      credito: {},
      observacoes: '',
    },
    faturamento: {
      observacoes: '',
      dataEfetivacao: null,
    },
    liberacoes: {},
    finalizacoes: {},
    produtos: proposal.produtos,
    servicos: proposal.servicos,
    valor: proposal.valor || 0,
    potenciaPico: proposal.potenciaPico || 0,
    aprovacao: {},
    autor: {
      id: session.user.id,
      nome: session.user.nome,
      avatar_url: session.user.avatar_url,
    },
    dataInsercao: new Date().toISOString(),
  });
  const [documentationHolder, setDocumentationHolder] = useState<TDocumentationHolder>({
    conditionData: {
      uf: infoHolder.localizacao.uf,
      cidade: infoHolder.localizacao.cidade,
      grupoInstalacao: opportunity.instalacao.grupo || null,
      tipoLigacao: opportunity.instalacao.tipoLigacao || null,
      tipoTitular: opportunity.instalacao.tipoTitular || null,
    },
    filesHolder: {},
  });
  async function createProject(info: TProject) {
    try {
      const { data } = await axios.post('/api/projects', info);

      return data.message;
    } catch (error) {
      throw error;
    }
  }
  const {
    mutate: handleCreateProject,
    isPending,
    isError,
    isSuccess,
  } = useMutationWithFeedback({
    mutationKey: ['create-new-project'],
    mutationFn: createProject,
    queryClient: queryClient,
    affectedQueryKey: [''],
  });
  console.log(documentationHolder);
  return (
    <div id='new-project-request' className='fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]'>
      <div className='fixed left-[50%] top-[50%] z-100 h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px] lg:w-[70%]'>
        <div className='flex h-full flex-col'>
          <div className='flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row'>
            <h3 className='text-xl font-bold text-primary dark:text-white '>SOLICITAÇÃO DE NOVO PROJETO</h3>
            <button
              onClick={closeModal}
              type='button'
              className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          <div className='flex h-full flex-col gap-y-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
            {stage == 'general' ? (
              <GeneralInformationBlock
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder}
                session={session}
                moveToNextStage={() => setStage('client')}
              />
            ) : null}
            {stage == 'client' ? (
              <ClientBlock
                clientId={opportunity.idCliente}
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder}
                session={session}
                moveToNextStage={() => setStage('homologation')}
                moveToPreviousStage={() => setStage('general')}
              />
            ) : null}

            {stage == 'homologation' ? (
              <HomologationBlock
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder}
                documentationHolder={documentationHolder}
                setDocumentationHolder={setDocumentationHolder}
                session={session}
                moveToNextStage={() => setStage('technical-analysis')}
                moveToPreviousStage={() => setStage('client')}
              />
            ) : null}
            {stage == 'technical-analysis' ? (
              <TechnicalAnalysisBlock
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder}
                session={session}
                moveToNextStage={() => setStage('products-and-services')}
                moveToPreviousStage={() => setStage('homologation')}
              />
            ) : null}
            {stage == 'products-and-services' ? (
              <SaleCompositionBlock
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder}
                session={session}
                moveToNextStage={() => setStage('payment')}
                moveToPreviousStage={() => setStage('technical-analysis')}
              />
            ) : null}
            {stage == 'payment' ? (
              <PaymentInformationBlock
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder}
                session={session}
                moveToNextStage={() => setStage('documentation')}
                moveToPreviousStage={() => setStage('products-and-services')}
                client={opportunity.cliente}
              />
            ) : null}
            {stage == 'documentation' ? (
              <DocumentationInformationBlock
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder}
                documentationHolder={documentationHolder}
                setDocumentationHolder={setDocumentationHolder}
                moveToNextStage={() => setStage('review')}
                moveToPreviousStage={() => setStage('payment')}
              />
            ) : null}
            {stage == 'review' ? (
              <ReviewInformationBlock
                client={opportunity.cliente}
                session={session}
                infoHolder={infoHolder}
                setInfoHolder={setInfoHolder}
                requestPending={isPending}
                // @ts-ignore
                requestNewProject={() => handleCreateProject(infoHolder)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewProjectRequest;
