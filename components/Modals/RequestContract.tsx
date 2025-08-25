import type { TUserSession } from '@/lib/auth/session';
import { useState } from 'react';

import { VscChromeClose } from 'react-icons/vsc';

import { TClientDTO } from '@/utils/schemas/client.schema';
import { TProject } from '@/utils/schemas/project.schema';
import { TProposalDTOWithOpportunity } from '@/utils/schemas/proposal.schema';

import Avatar from '../utils/Avatar';

import ClientInformation from '../ContractRequest/Stages/ClientInformation';
import ConsumerUnit from '../ContractRequest/Stages/ConsumerUnit';
import Equipments from '../ContractRequest/Stages/EquipmentsAndServices';
import Structure from '../ContractRequest/Stages/Structure';

type ContractRequestProps = {
  session: TUserSession;
  closeModal: () => void;
  proposalInfo: TProposalDTOWithOpportunity;
  client: TClientDTO;
};
function ContractRequest({ session, closeModal, proposalInfo, client }: ContractRequestProps) {
  const opportunityId = proposalInfo.oportunidade.id;
  const [stage, setStage] = useState<number>(1);
  const [requestInfo, setRequestInfo] = useState<TProject>({
    nome: '',
    idParceiro: session.user.idParceiro || '',
    identificador: proposalInfo.oportunidadeDados.identificador,
    responsaveis: [],
    oportunidade: {
      id: proposalInfo.oportunidade.id,
      nome: proposalInfo.oportunidade.nome,
    },
    proposta: {
      id: proposalInfo._id,
      nome: proposalInfo.nome,
    },
    cliente: {
      id: proposalInfo.oportunidadeDados.idCliente,
      nome: '',
    },
    contatos: {
      telefonePrimario: client.telefonePrimario,
      telefoneSecundario: client.telefoneSecundario,
      email: client.email || '',
    },
    localizacao: {
      cep: proposalInfo.oportunidadeDados.localizacao.cep,
      uf: proposalInfo.oportunidadeDados.localizacao.uf,
      cidade: proposalInfo.oportunidadeDados.localizacao.cidade,
      bairro: proposalInfo.oportunidadeDados.localizacao.bairro || '',
      endereco: proposalInfo.oportunidadeDados.localizacao.endereco || '',
      numeroOuIdentificador: proposalInfo.oportunidadeDados.localizacao.numeroOuIdentificador || '',
    },
    segmento: 'RESIDENCIAL',
    contrato: {
      status: 'SOLICITADO',
      dataSolicitacao: new Date().toISOString(),
      dataLiberacao: null,
      dataAssinatura: null,
      formaAssinatura: 'FÍSICA',
    },
    unidadeConsumidora: {
      concessionaria: '',
      numero: '',
      grupo: 'URBANO',
      tipoLigacao: 'EXISTENTE',
      tipoTitular: 'PESSOA FÍSICA',
      nomeTitular: '',
    },
    estruturaInstalacao: {
      alteracao: false,
      tipo: 'Fibrocimento',
      material: 'MADEIRA',
      observacoes: '',
    },
    padraoEnergia: {
      alteracao: false,
      tipo: 'CONTRA À REDE',
      tipoEntrada: 'AÉREO',
      tipoSaida: 'AÉREO',
      amperagem: '',
      ligacao: 'BIFÁSICO',
      novaAmperagem: null,
      novaLigacao: null,
      codigoMedidor: '',
      modeloCaixaMedidor: null,
      observacoes: '',
    },
    liberacoes: {
      comercial: null,
      suprimentos: null,
      projetos: null,
      execucao: null,
      financeiro: null,
    },
    parecerAcesso: {
      status: null,
      dataLiberacaoDocumentacao: null,
      dataAssinaturaDocumentacao: null,
      formaAssinaturaDocumentacao: null,
      dataSolicitacao: null,
      dataAprovacao: null,
      dataReprova: null,
    },
    execucao: {
      status: null,
      inicio: null,
      fim: null,
      observacoes: '',
    },
    vistoriaTecnica: {
      status: null,
      dataPedido: null,
      dataAprovacao: null,
      dataReprova: null,
    },
    equipamentos: proposalInfo.produtos,
    servicos: proposalInfo.servicos,
    potenciaPico: proposalInfo.potenciaPico || 0,

    nps: null,
  });

  return (
    <div id='ContractRequest' className='fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]'>
      <div className='fixed left-[50%] top-[50%] z-100 h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px] lg:w-[70%]'>
        <div className='flex h-full flex-col'>
          <div className='flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row'>
            <h3 className='text-sm font-bold text-primary  lg:text-xl '>SOLICITAÇÃO DE CONTRATO</h3>
            <button
              onClick={closeModal}
              type='button'
              className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>

          <div className='flex h-full flex-col gap-y-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
            <div className='my-2 flex w-full flex-row flex-wrap items-start justify-center gap-3'>
              {proposalInfo.oportunidadeDados.responsaveis.map((resp) => (
                <div className='flex items-center gap-1'>
                  <Avatar width={20} height={20} url={resp.avatar_url || undefined} fallback={resp.nome} />
                  <p className='text-sm font-medium leading-none tracking-tight text-primary/70'>{resp.nome}</p>{' '}
                  <p className='ml-1 rounded-md border border-cyan-400 p-1 text-xxs font-bold text-cyan-400'>{resp.papel}</p>
                </div>
              ))}
            </div>
            {stage == 1 ? (
              <ClientInformation client={client} requestInfo={requestInfo} setRequestInfo={setRequestInfo} goToNextState={() => setStage(2)} />
            ) : null}
            {stage == 2 ? <ConsumerUnit requestInfo={requestInfo} setRequestInfo={setRequestInfo} goToNextState={() => setStage(3)} /> : null}
            {stage == 3 ? <Equipments requestInfo={requestInfo} setRequestInfo={setRequestInfo} goToNextState={() => setStage(4)} /> : null}
            {stage == 4 ? <Structure requestInfo={requestInfo} setRequestInfo={setRequestInfo} goToNextState={() => setStage(5)} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContractRequest;
