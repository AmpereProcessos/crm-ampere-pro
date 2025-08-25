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
  goToPreviousStage: () => void;
  handleRequestContract: () => void;
  proposeInfo: TProposalDTO;
  documentsFile: { [key: string]: File | string | null };
  setDocumentsFile: React.Dispatch<React.SetStateAction<{ [key: string]: File | string | null }>>;
  isSuccess?: boolean;
  isPending?: boolean;
};
function DocumentAttachment({
  projectInfo,
  requestInfo,
  setRequestInfo,
  goToPreviousStage,
  handleRequestContract,
  proposeInfo,
  documentsFile,
  setDocumentsFile,
  isSuccess,
  isPending,
}: DocumentAttachmentProps) {
  const { data: fileReferences } = useFileReferencesByOpportunityId({ opportunityId: projectInfo?._id || '' });
  function validateDocuments(documents: { [key: string]: File | string | null }) {
    if (!documents['PROPOSTA COMERCIAL']) return toast.error('Por favor, anexe a proposta comercial.');
    if (!documents['CONTA DE ENERGIA']) return toast.error('Por favor, anexe a conta de energia.');
    if (!documents['DOCUMENTO COM FOTO']) return toast.error('Por favor, anexe um documento com foto do titular.');

    return handleRequestContract();
  }

  const documentation = {
    'PROPOSTA COMERCIAL': true,
    'CONTA DE ENERGIA': true,
    'DOCUMENTO COM FOTO': true,
  };
  return (
    <div className='flex w-full grow flex-col bg-background pb-2'>
      <span className='py-2 text-center text-lg font-bold uppercase text-[#15599a]'>DOCUMENTAÇÃO</span>
      <h1 className='my-2 w-full text-center font-medium tracking-tight'>Anexe aqui os documentos necessários para solicitação de contrato.</h1>
      <h1 className='my-2 w-full text-center font-medium tracking-tight'>
        Se existirem arquivos vinculados ao projeto, você pode utilizá-los clicando em <strong className='text-blue-800'>MOSTRAR OPÇÕES</strong> e
        escolhendo o arquivo desejado.
      </h1>
      <div className='flex w-full grow flex-wrap items-start justify-center gap-2'>
        {Object.keys(documentation).map((document) => (
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
          className='rounded p-2 font-bold text-primary/70 duration-300 hover:scale-105'
        >
          Voltar
        </button>

        <button
          onClick={() => {
            validateDocuments(documentsFile);
          }}
          disabled={isPending || isSuccess}
          className='rounded p-2 font-bold hover:bg-black hover:text-primary-foreground'
        >
          {isPending ? 'Criando solicitação...' : null}
          {isSuccess ? 'Criação concluida!' : null}
          {!isPending && !isSuccess ? 'Criar solicitação' : null}
        </button>
      </div>
    </div>
  );
}

export default DocumentAttachment;
