import DocumentFileInput from '@/components/Inputs/DocumentFileInput';
import { useFileReferencesByOpportunityId } from '@/utils/queries/file-references';
import { TContractRequest } from '@/utils/schemas/integrations/app-ampere/contract-request.schema';
import { TOpportunityDTO } from '@/utils/schemas/opportunity.schema';

import { TProposalDTO } from '@/utils/schemas/proposal.schema';

import React from 'react';
import toast from 'react-hot-toast';

type DocumentAttachmentProps = {
  projectInfo?: TOpportunityDTO;
  requestInfo: TContractRequest;
  setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
  sameProjectHolder: boolean;
  goToPreviousStage: () => void;
  goToNextStage: () => void;
  proposeInfo: TProposalDTO;
  documentsFile: { [key: string]: File | string | null };
  setDocumentsFile: React.Dispatch<React.SetStateAction<{ [key: string]: File | string | null }>>;
};
function DocumentAttachment({
  projectInfo,
  requestInfo,
  setRequestInfo,
  sameProjectHolder,
  goToPreviousStage,
  goToNextStage,
  proposeInfo,
  documentsFile,
  setDocumentsFile,
}: DocumentAttachmentProps) {
  const { data: fileReferences } = useFileReferencesByOpportunityId({ opportunityId: projectInfo?._id || '' });

  const ligationType = requestInfo.tipoDaLigacao;
  const installationType = requestInfo.tipoDaInstalacao;
  const ownerType = requestInfo.tipoDoTitular;
  const distributions = requestInfo.distribuicoes;
  const resourceOrigin = requestInfo.origemRecurso;
  function validateDocuments(documents: { [key: string]: File | string | null }) {
    if (!documents['PROPOSTA COMERCIAL']) return toast.error('Por favor, anexe a proposta comercial atualizada.');
    if (!documents['COMPROVANTE DE ENDEREÇO (DA CORRESPONDÊNCIA)'])
      return toast.error('Por favor, anexe o comprovante de endereço da correspondência.');
    if (!documents['LAUDO TÉCNICO']) return toast.error('Por favor, anexe o laudo técnico.');
    if (ligationType == 'EXISTENTE' && !documents['CONTA DE ENERGIA']) return toast.error('Por favor, anexe a conta de energia da instalação.');
    if (installationType == 'RURAL' && !documents['CAR']) return toast.error('Por favor, anexe o CAR.');
    if (installationType == 'RURAL' && !documents['MATRICULA']) return toast.error('Por favor, anexe a matrícula.');
    if (installationType == 'URBANO' && !documents['IPTU']) return toast.error('Por favor anexe o IPTU.');
    if (!sameProjectHolder && !documents['DOCUMENTO COM FOTO (TITULAR DA INSTALAÇÃO)'])
      return toast.error('Por favor, anexe o documento com foto do atual titular da instalação.');
    if (ownerType == 'PESSOA FISICA' && !documents['DOCUMENTO COM FOTO']) return toast.error('Por favor, anexe o documento com foto.');
    if (resourceOrigin == 'FINANCIAMENTO' && !documents['DOCUMENTO COM FOTO (TITULAR DO FINANCIAMENTO)'])
      return toast.error('Por favor, anexe o documento com foto do titular do financiamento.');
    if (ownerType == 'PESSOA JURIDICA') {
      if (!documents['CONTRATO SOCIAL']) return toast.error('Por favor, anexe o contrato social.');
      if (!documents['CARTÃO CNPJ']) return toast.error('Por favor, anexe o cartão CNPJ.');
      if (!documents['COMPROVANTE DE ENDEREÇO (REPRESENTANTE LEGAL)'])
        return toast.error('Por favor, anexe o comprovante de endereço do representante legal.');
      if (!documents['DOCUMENTO COM FOTOS DOS SÓCIOS']) return toast.error('Por favor, anexe o documentos com foto de todos os sócios.');
    }
    return goToNextStage();
  }
  return (
    <div className='flex w-full grow flex-col bg-background pb-2'>
      <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>DOCUMENTAÇÃO</span>
      <h1 className='my-2 w-full text-center font-medium tracking-tight'>Anexe aqui os documentos necessários para solicitação de contrato.</h1>
      <h1 className='my-2 w-full text-center font-medium tracking-tight'>
        Se existirem arquivos vinculados ao projeto, você pode utilizá-los clicando em <strong className='text-blue-800'>MOSTRAR OPÇÕES</strong> e
        escolhendo o arquivo desejado.
      </h1>
      <div className='flex w-full grow flex-wrap items-start justify-center gap-2'>
        {getSolarSystemDocumentation({ ligationType, installationType, ownerType, resourceOrigin, sameProjectHolder, distributions }).map(
          (document) => (
            <div className='w-full lg:w-[600px]'>
              <DocumentFileInput
                label={document}
                value={documentsFile[document]}
                handleChange={(value) => setDocumentsFile((prev) => ({ ...prev, [document]: value }))}
                fileReferences={fileReferences}
              />
            </div>
          )
        )}
      </div>
      <div className='mt-2 flex w-full flex-wrap justify-between  gap-2'>
        <button
          onClick={() => {
            goToPreviousStage();
          }}
          className='rounded p-2 font-bold text-primary/70 duration-300 hover:scale-105'
        >
          Voltar
        </button>

        <button
          onClick={() => {
            validateDocuments(documentsFile);
          }}
          className='rounded p-2 font-bold disabled:bg-primary/30 hover:bg-black hover:text-primary-foreground'
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default DocumentAttachment;

type GetSolarSystemDocumentationProps = {
  ligationType: TContractRequest['tipoDaLigacao'];
  installationType: TContractRequest['tipoDaInstalacao'];
  ownerType: TContractRequest['tipoDoTitular'];
  resourceOrigin: TContractRequest['origemRecurso'];
  sameProjectHolder: boolean;
  distributions: TContractRequest['distribuicoes'];
};
function getSolarSystemDocumentation({
  ligationType,
  installationType,
  ownerType,
  resourceOrigin,
  sameProjectHolder,
  distributions,
}: GetSolarSystemDocumentationProps) {
  var documents: { [key: string]: boolean } = {
    'PROPOSTA COMERCIAL': true,
    'COMPROVANTE DE ENDEREÇO (DA CORRESPONDÊNCIA)': true,
    'LAUDO TÉCNICO': true,
    'CONTA DE ENERGIA': ligationType == 'EXISTENTE',
    CAR: installationType == 'RURAL',
    MATRICULA: installationType == 'RURAL',
    IPTU: installationType == 'URBANO',
    'DOCUMENTO COM FOTO': ownerType == 'PESSOA FISICA',
    'DOCUMENTO COM FOTO (TITULAR DO FINANCIAMENTO)': resourceOrigin == 'FINANCIAMENTO',
    'DOCUMENTO COM FOTO (TITULAR DA INSTALAÇÃO)': !sameProjectHolder,
    'CONTRATO SOCIAL': ownerType == 'PESSOA JURIDICA',
    'CARTÃO CNPJ': ownerType == 'PESSOA JURIDICA',
    'COMPROVANTE DE ENDEREÇO (REPRESENTANTE LEGAL)': ownerType == 'PESSOA JURIDICA',
    'DOCUMENTO COM FOTOS DOS SÓCIOS': ownerType == 'PESSOA JURIDICA',
  };
  distributions.forEach((dist, index) => (documents[`RECEBEDORA Nº ${dist.numInstalacao}`] = true));
  return Object.keys(documents).filter((key) => !!documents[key]);
}
