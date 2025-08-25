import DocumentFileInput from '@/components/Inputs/DocumentFileInput';
import { IContractRequest } from '@/utils/models';
import { useFileReferencesByOpportunityId } from '@/utils/queries/file-references';
import { TContractRequest } from '@/utils/schemas/integrations/app-ampere/contract-request.schema';
import { TOpportunityDTO } from '@/utils/schemas/opportunity.schema';

import React from 'react';
import toast from 'react-hot-toast';

type DocumentationInfoProps = {
  projectInfo?: TOpportunityDTO;
  requestInfo: TContractRequest;
  setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
  documentsFile: { [key: string]: File | string | null };
  setDocumentsFile: React.Dispatch<React.SetStateAction<{ [key: string]: File | string | null }>>;
  goToPreviousStage: () => void;
  goToNextStage: () => void;
  handleRequestContract: () => void;
};
function DocumentationInfo({
  projectInfo,
  requestInfo,
  setRequestInfo,
  documentsFile,
  setDocumentsFile,
  goToNextStage,
  goToPreviousStage,
  handleRequestContract,
}: DocumentationInfoProps) {
  const { data: fileReferences } = useFileReferencesByOpportunityId({ opportunityId: projectInfo?._id || '' });
  const ligationType = requestInfo.tipoDaLigacao;
  const installationType = requestInfo.tipoDaInstalacao;
  const ownerType = requestInfo.tipoDoTitular;
  function validateDocuments(documents: { [key: string]: File | string | null }) {
    if (!documents['PROPOSTA COMERCIAL']) return toast.error('Por favor, anexe a proposta comercial atualizada.');
    if (!documents['CONTA DE ENERGIA']) return toast.error('Por favor, anexe a conta de energia da instalação.');
    if (!documents['LAUDO TÉCNICO']) return toast.error('Por favor, anexe o laudo técnico.');

    if (installationType == 'RURAL' && !documents['CAR']) return toast.error('Por favor, anexe o CAR.');
    if (installationType == 'RURAL' && !documents['MATRICULA']) return toast.error('Por favor, anexe a matrícula.');
    if (installationType == 'URBANO' && !documents['IPTU']) return toast.error('Por favor anexe o IPTU.');
    if (ownerType == 'PESSOA FISICA' && !documents['DOCUMENTO COM FOTO'])
      return toast.error('Por favor, anexe o documento com foto do titular da instalação.');
    if (ownerType == 'PESSOA JURIDICA' && !documents['CONTRATO SOCIAL'])
      return toast.error('Por favor, anexe o contrato social da empresa titular da instalação.');
    if (ownerType == 'PESSOA JURIDICA' && !documents['CARTÃO CNPJ'])
      return toast.error('Por favor, anexe o cartão CNPJ da empresa titular da instalação.');

    return handleRequestContract();
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
        {getHomologationDocumentation({ ligationType, installationType, ownerType }).map((document) => (
          <div className='w-full lg:w-[600px]'>
            <DocumentFileInput
              label={document}
              value={documentsFile[document]}
              handleChange={(value) => setDocumentsFile((prev) => ({ ...prev, [document]: value }))}
              fileReferences={fileReferences}
            />
          </div>
        ))}
      </div>
      <div className='mt-2 flex w-full flex-wrap justify-between  gap-2'>
        <button
          onClick={() => {
            goToPreviousStage();
          }}
          className='rounded p-2 font-bold text-primary/50 duration-300 hover:scale-105'
        >
          Voltar
        </button>

        <button
          onClick={() => {
            validateDocuments(documentsFile);
          }}
          className='rounded p-2 font-bold disabled:bg-primary/30 hover:bg-black hover:text-white'
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}

export default DocumentationInfo;

type GetHomologationDocumentationParams = {
  ligationType: IContractRequest['tipoDaLigacao'];
  installationType: IContractRequest['tipoDaInstalacao'];
  ownerType: IContractRequest['tipoDoTitular'];
};
function getHomologationDocumentation({ installationType, ligationType, ownerType }: GetHomologationDocumentationParams) {
  var documents: { [key: string]: boolean } = {
    'PROPOSTA COMERCIAL': true,
    'CONTA DE ENERGIA': true,
    'LAUDO TÉCNICO': true,
    CAR: installationType == 'RURAL',
    MATRICULA: installationType == 'RURAL',
    IPTU: installationType == 'URBANO',
    'DOCUMENTO COM FOTO': ownerType == 'PESSOA FISICA',
    'CONTRATO SOCIAL': ownerType == 'PESSOA JURIDICA',
    'CARTÃO CNPJ': ownerType == 'PESSOA JURIDICA',
  };
  return Object.keys(documents).filter((key) => !!documents[key]);
}
