import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

import ContractInfo from './Generical/ContractInfo';
import DeliveryInfo from './Generical/DeliveryInfo';
import Documents from './Generical/Documents';
import HomologationInfo from './Generical/HomologationInfo';
import OtherServices from './Generical/OtherServices';
import PaymentInfo from './Generical/PaymentInfo';
import ProductsAndServices from './Generical/ProductsAndServices';
import SignaturePlans from './Generical/SignaturePlans';

import type { TContractRequest } from '@/utils/schemas//contract-request.schema';
import type { TProposalDTOWithOpportunity } from '@/utils/schemas/proposal.schema';
import { type UploadResult, getDownloadURL, getMetadata, ref, uploadBytes } from 'firebase/storage';
import toast from 'react-hot-toast';

import { storage } from '@/services/firebase/storage-config';
import { fileTypes } from '@/utils/constants';
import { createContractRequest } from '@/utils/mutations/contract-request';
import Review from './Generical/Review';

type GenericFormProps = {
  requestInfo: TContractRequest;
  setRequestInfo: Dispatch<SetStateAction<TContractRequest>>;
  proposal: TProposalDTOWithOpportunity;
};
function GenericForm({ requestInfo, setRequestInfo, proposal }: GenericFormProps) {
  const [stage, setStage] = useState(1);
  const [documentsFile, setDocumentsFile] = useState<{ [key: string]: File | string | null }>({});

  async function handleUploadFiles(files: { [key: string]: File | string | null }) {
    const links: { title: string; link: string; format: string }[] = [];
    try {
      const uploadPromises = Object.entries(files).map(async ([key, value]) => {
        const file = value;
        if (!file) return;
        if (typeof file === 'string') {
          const fileRef = ref(storage, file);
          const metaData = await getMetadata(fileRef);
          const link = {
            title: key,
            link: file,
            format: fileTypes[metaData.contentType || '']?.title || 'NÃO DEFINIDO',
          };
          links.push(link);
        }
        if (typeof file !== 'string') {
          const storageStr = `formSolicitacao/${requestInfo.nomeDoContrato}/${key} - ${new Date().toISOString()}`;
          const fileRef = ref(storage, storageStr);
          const firebaseUploadResponse = await uploadBytes(fileRef, file);
          const uploadResult = firebaseUploadResponse as UploadResult;
          const fileUrl = await getDownloadURL(ref(storage, firebaseUploadResponse.metadata.fullPath));
          const link = {
            title: key,
            link: fileUrl,
            format: fileTypes[uploadResult.metadata.contentType || '']?.title || 'NÃO DEFINIDO',
          };
          links.push(link);
        }
      });
      await Promise.all(uploadPromises);
      return links;
    } catch (error) {
      console.log('Error running uploadFiles', error);
      throw error;
    }
  }
  async function handleRequestContract({
    request,
    files,
    proposal,
  }: {
    request: TContractRequest;
    files: { [key: string]: File | string | null };
    proposal: TProposalDTOWithOpportunity;
  }) {
    try {
      // Getting documents links
      const fileUploadLoadingToast = toast.loading('Vinculando arquivos...');
      const links = await handleUploadFiles(files);
      toast.dismiss(fileUploadLoadingToast);
      // Creating contract request
      const requestCreationLoadingToast = toast.loading('Criando formulário...');
      const previsaoValorDoKit = proposal?.precificacao?.find((p) => p.descricao.includes('KIT'))
        ? proposal?.precificacao?.find((p) => p.descricao.includes('KIT'))?.valorFinal
        : null;
      const idProjetoCRM = proposal.oportunidadeDados?._id || '';
      const idPropostaCRM = proposal._id || '';
      const contractRequest = { ...request, previsaoValorDoKit, idProjetoCRM, idPropostaCRM, links };
      const insertedId = await createContractRequest({ info: contractRequest, returnId: true });
      toast.dismiss(requestCreationLoadingToast);
      return 'Contrato solicitado com sucesso !';
    } catch (error) {
      toast.dismiss();
      throw error;
    }
  }
  return (
    <>
      {stage === 1 ? (
        <ContractInfo requestInfo={requestInfo} setRequestInfo={setRequestInfo} showActions={true} goToNextStage={() => setStage(2)} />
      ) : null}
      {stage === 2 ? (
        <ProductsAndServices
          editable={['6620196df708ce12429f4379', '66633bafd006577d39c57086', '672e23ce3c78559552162c31', '6627b8c19440d7db1e618594'].includes(
            proposal.oportunidadeDados.tipo.id
          )}
          requestInfo={requestInfo}
          setRequestInfo={setRequestInfo}
          showActions={true}
          goToNextStage={() => setStage(3)}
          goToPreviousStage={() => setStage(1)}
        />
      ) : null}
      {stage === 3 ? (
        <SignaturePlans
          proposal={proposal}
          requestInfo={requestInfo}
          setRequestInfo={setRequestInfo}
          showActions={true}
          goToNextStage={() => setStage(4)}
          goToPreviousStage={() => setStage(2)}
        />
      ) : null}
      {stage === 4 ? (
        <DeliveryInfo
          requestInfo={requestInfo}
          setRequestInfo={setRequestInfo}
          showActions={true}
          goToNextStage={() => setStage(5)}
          goToPreviousStage={() => setStage(3)}
        />
      ) : null}
      {stage === 5 ? (
        <PaymentInfo
          requestInfo={requestInfo}
          setRequestInfo={setRequestInfo}
          showActions={true}
          goToNextStage={() => setStage(6)}
          goToPreviousStage={() => setStage(4)}
        />
      ) : null}
      {stage === 6 ? (
        <HomologationInfo
          requestInfo={requestInfo}
          setRequestInfo={setRequestInfo}
          showActions={true}
          goToNextStage={() => setStage(7)}
          goToPreviousStage={() => setStage(5)}
        />
      ) : null}
      {stage === 7 ? (
        <OtherServices
          requestInfo={requestInfo}
          setRequestInfo={setRequestInfo}
          showActions={true}
          goToNextStage={() => setStage(8)}
          goToPreviousStage={() => setStage(6)}
        />
      ) : null}
      {stage === 8 ? (
        <Documents
          opportunityId={proposal.oportunidade.id}
          documentsFile={documentsFile}
          setDocumentsFile={setDocumentsFile}
          requestInfo={requestInfo}
          setRequestInfo={setRequestInfo}
          showActions={true}
          goToNextStage={() => setStage(9)}
          goToPreviousStage={() => setStage(7)}
        />
      ) : null}
      {stage === 9 ? (
        <Review
          proposal={proposal}
          documentsFile={documentsFile}
          setDocumentsFile={setDocumentsFile}
          requestInfo={requestInfo}
          setRequestInfo={setRequestInfo}
          handleRequestContract={() => handleRequestContract({ request: requestInfo, files: documentsFile, proposal })}
        />
      ) : null}
    </>
  );
}

export default GenericForm;
