import { storage } from '@/services/firebase/storage-config';
import { fileTypes } from '@/utils/constants';
import { createContractRequest } from '@/utils/mutations/contract-request';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { TContractRequest } from '@/utils/schemas//contract-request.schema';
import { TProposalDTOWithOpportunity } from '@/utils/schemas/proposal.schema';
import { useQueryClient } from '@tanstack/react-query';
import { getDownloadURL, getMetadata, ref, uploadBytes, UploadResult } from 'firebase/storage';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import ContractInfo from './Monitoring/ContractInfo';
import DocumentAttachment from './Monitoring/DocumentAttachment';
import Equipment from './Monitoring/EquipmentInfo';
import PaymentInfo from './Monitoring/PaymentInfo';

type MonitoringFormProps = {
  requestInfo: TContractRequest;
  setRequestInfo: React.Dispatch<React.SetStateAction<TContractRequest>>;
  proposeInfo: TProposalDTOWithOpportunity;
  closeForm: () => void;
};
function MonitoringForm({ requestInfo, setRequestInfo, proposeInfo, closeForm }: MonitoringFormProps) {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState<number>(1);
  const [documentsFileHolder, setDocumentsFileHolder] = useState<{ [key: string]: File | string | null }>({});

  async function handleUploadFiles(files: { [key: string]: File | string | null }) {
    var links: { title: string; link: string; format: string }[] = [];
    try {
      const uploadPromises = Object.entries(files).map(async ([key, value]) => {
        const file = value;
        if (!file) return;
        if (typeof file == 'string') {
          const fileRef = ref(storage, file);
          const metaData = await getMetadata(fileRef);
          const link = {
            title: key,
            link: file,
            format: fileTypes[metaData.contentType || '']?.title || 'NÃO DEFINIDO',
          };
          links.push(link);
        }
        if (typeof file != 'string') {
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
      throw error;
    }
  }
  async function handleRequestContract() {
    try {
      // Getting documents links
      const fileUploadLoadingToast = toast.loading('Vinculando arquivos...');
      const links = await handleUploadFiles(documentsFileHolder);
      toast.dismiss(fileUploadLoadingToast);
      // Creating contract request
      const requestCreationLoadingToast = toast.loading('Criando formulário...');

      const idProjetoCRM = proposeInfo.oportunidadeDados?._id || '';
      const idPropostaCRM = proposeInfo._id || '';
      const contractRequest = { ...requestInfo, idProjetoCRM, idPropostaCRM, links };
      const insertedId = await createContractRequest({ info: contractRequest, returnId: true });
      toast.dismiss(requestCreationLoadingToast);
      return 'Solicitação finalizada com sucesso !';
    } catch (error) {
      toast.dismiss();
      throw error;
    }
  }
  const { mutate, isPending, isSuccess } = useMutationWithFeedback({
    queryClient: queryClient,
    mutationKey: ['create-insurance-contract-request'],
    mutationFn: handleRequestContract,
    affectedQueryKey: ['propose', proposeInfo?._id],
    callbackFn: () => closeForm(),
  });
  return (
    <>
      {stage == 1 ? (
        <ContractInfo requestInfo={requestInfo} setRequestInfo={setRequestInfo} goToNextStage={() => setStage((prev) => prev + 1)} />
      ) : null}
      {stage == 2 ? (
        <Equipment
          requestInfo={requestInfo}
          setRequestInfo={setRequestInfo}
          goToNextStage={() => setStage((prev) => prev + 1)}
          goToPreviousStage={() => setStage((prev) => prev - 1)}
        />
      ) : null}
      {stage == 3 ? (
        <PaymentInfo
          requestInfo={requestInfo}
          setRequestInfo={setRequestInfo}
          goToNextStage={() => setStage((prev) => prev + 1)}
          goToPreviousStage={() => setStage((prev) => prev - 1)}
        />
      ) : null}
      {stage == 4 ? (
        <DocumentAttachment
          projectInfo={proposeInfo.oportunidadeDados}
          requestInfo={requestInfo}
          proposeInfo={proposeInfo}
          setRequestInfo={setRequestInfo}
          goToPreviousStage={() => setStage((prev) => prev - 1)}
          handleRequestContract={() => mutate()}
          documentsFile={documentsFileHolder}
          setDocumentsFile={setDocumentsFileHolder}
          isPending={isPending}
          isSuccess={isSuccess}
        />
      ) : null}
    </>
  );
}

export default MonitoringForm;
