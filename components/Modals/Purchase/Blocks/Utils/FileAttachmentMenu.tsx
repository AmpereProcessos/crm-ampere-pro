import CheckboxInput from '@/components/Inputs/CheckboxInput';
import MultipleFileInput from '@/components/Inputs/MultipleFileInput';
import TextInput from '@/components/Inputs/TextInput';
import type { TUserSession } from '@/lib/auth/session';
import { uploadFile } from '@/lib/methods/firebase';
import { GeneralVisibleHiddenExitMotionVariants } from '@/utils/constants';
import { createManyFileReferences } from '@/utils/mutations/file-references';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { TFileReference } from '@/utils/schemas/file-reference.schema';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { MdAttachFile } from 'react-icons/md';
import { VscChromeClose } from 'react-icons/vsc';

type TAttachmentHolder = {
  title: string;
  files: FileList | null;
  idProject: string;
  idPurchase: string;
  idClient?: string;
  idOpportunity?: string;
  idAnalysis?: string | null;
  homologationId?: string | null;
};

type PurchaseFileAttachmentMenuProps = {
  purchaseId: string;
  projectId: string;
  clientId: string;
  opportunityId?: string;
  analysisId?: string;
  homologationId?: string;
  session: TUserSession;
};
function PurchaseFileAttachmentMenu({
  purchaseId,
  projectId,
  clientId,
  opportunityId,
  analysisId,
  homologationId,
  session,
}: PurchaseFileAttachmentMenuProps) {
  const queryClient = useQueryClient();
  const [newFileMenuIsOpen, setNewFileMenuIsOpen] = useState<boolean>(false);
  const [attachmentHolder, setAttachmentHolder] = useState<TAttachmentHolder>({
    title: '',
    files: null,
    idPurchase: purchaseId,
    idProject: projectId,
    idClient: clientId,
    idOpportunity: opportunityId,
    idAnalysis: analysisId,
    homologationId: homologationId,
  });
  async function handleFileReferenceCreation() {
    try {
      // Validating file attachment and fields
      if (!attachmentHolder.files || attachmentHolder.files.length == 0) return toast.error('Anexe o(s) arquivo(s) desejado(s).');
      if (attachmentHolder.title.trim().length < 2) return toast.error('Preencha um titulo de ao menos 2 letras.');
      const formattedFileName = attachmentHolder.title.toLowerCase().replaceAll(' ', '_');
      const vinculationId =
        attachmentHolder.idPurchase || attachmentHolder.idProject || attachmentHolder.idOpportunity || attachmentHolder.idClient || 'naodefinido';

      var fileReferences: TFileReference[] = [];
      if (attachmentHolder.files.length > 1) {
        const promises = Array.from(attachmentHolder.files).map(async (file, index) => {
          const fileName = `${formattedFileName} (${index + 1})`;
          const { url, format, size } = await uploadFile({ file, fileName, vinculationId });
          fileReferences.push({
            titulo: `${attachmentHolder.title} (${index + 1})`,
            idProjeto: attachmentHolder.idProject,
            idCompra: attachmentHolder.idPurchase,
            idOportunidade: attachmentHolder.idOpportunity,
            idCliente: attachmentHolder.idClient,
            idAnaliseTecnica: attachmentHolder.idAnalysis,
            idHomologacao: attachmentHolder.homologationId,
            idParceiro: session.user.idParceiro,
            url: url,
            formato: format,
            tamanho: size,
            autor: { id: session.user.id, nome: session.user.nome, avatar_url: session.user.avatar_url },
            dataInsercao: new Date().toISOString(),
          });
        });
        await Promise.all(promises);
      } else {
        const file = attachmentHolder.files.item(0);
        if (!file) return;
        const { url, format, size } = await uploadFile({ file, fileName: formattedFileName, vinculationId });
        fileReferences.push({
          titulo: attachmentHolder.title,
          idProjeto: attachmentHolder.idProject,
          idCompra: attachmentHolder.idPurchase,
          idOportunidade: attachmentHolder.idOpportunity,
          idCliente: attachmentHolder.idClient,
          idAnaliseTecnica: attachmentHolder.idAnalysis,
          idHomologacao: attachmentHolder.homologationId,
          idParceiro: session.user.idParceiro,
          url: url,
          formato: format,
          tamanho: size,
          autor: { id: session.user.id, nome: session.user.nome, avatar_url: session.user.avatar_url },
          dataInsercao: new Date().toISOString(),
        });
      }

      await createManyFileReferences({ info: fileReferences });

      return 'Arquivos anexados com sucesso !';
    } catch (error) {
      throw error;
    }
  }

  const { mutate: handleAttach, isPending } = useMutationWithFeedback({
    mutationKey: ['project-file-attachment'],
    mutationFn: handleFileReferenceCreation,
    queryClient: queryClient,
    affectedQueryKey: ['file-references-by-query'],
    callbackFn: () =>
      setAttachmentHolder({
        title: '',
        files: null,
        idPurchase: purchaseId,
        idProject: projectId,
        idClient: clientId,
        idOpportunity: opportunityId,
        idAnalysis: analysisId,
        homologationId: homologationId,
      }),
  });
  return (
    <AnimatePresence>
      <div className='my-4 flex w-full flex-col gap-2'>
        <div className='flex w-full items-center justify-end p-2'>
          {newFileMenuIsOpen ? (
            <button
              onClick={() => setNewFileMenuIsOpen(false)}
              className='flex items-center gap-1 rounded-lg border border-red-500 bg-red-50 px-2 py-1 text-xs text-red-500 duration-300 ease-in-out hover:border-red-700 hover:text-red-700'
            >
              <VscChromeClose />
              <p className='font-medium'>FECHAR MENU</p>
            </button>
          ) : (
            <button
              onClick={() => setNewFileMenuIsOpen(true)}
              className='flex items-center gap-1 rounded-lg border border-cyan-500 bg-cyan-50 px-2 py-1 text-xs text-cyan-500 duration-300 ease-in-out hover:border-cyan-700 hover:text-cyan-700'
            >
              <MdAttachFile />
              <p className='font-medium'>ANEXAR NOVO ARQUIVO</p>
            </button>
          )}
        </div>
        {newFileMenuIsOpen ? (
          <motion.div
            key={'menu-open'}
            variants={GeneralVisibleHiddenExitMotionVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='mt-2 flex w-[90%] flex-col gap-2 self-center rounded-sm border border-primary/50 p-6 lg:flex-row'
          >
            <div className='w-full lg:w-1/2'>
              <MultipleFileInput
                label='ARQUIVO(S)'
                multiple={true}
                value={attachmentHolder.files}
                mode='large-area'
                handleChange={(value) => setAttachmentHolder((prev) => ({ ...prev, files: value }))}
              />
            </div>
            <div className='flex w-full flex-col gap-2 lg:w-1/2'>
              <TextInput
                label='TÍTULO DO ARQUIVO'
                placeholder='Preencha o título a ser dado ao arquivo...'
                value={attachmentHolder.title}
                handleChange={(value) => setAttachmentHolder((prev) => ({ ...prev, title: value }))}
                width='100%'
              />
              <div className='mt-4 flex w-full flex-col flex-wrap items-center justify-center gap-4 lg:flex-row'>
                <div className='w-fit'>
                  <CheckboxInput
                    labelFalse='VINCULAR À COMPRA'
                    labelTrue='VINCULAR À COMPRA'
                    checked={!!attachmentHolder.idPurchase}
                    justify='justify-center'
                    editable={false}
                    handleChange={(value) => setAttachmentHolder((prev) => ({ ...prev, idPurchase: purchaseId }))}
                  />
                </div>
                <div className='w-fit'>
                  <CheckboxInput
                    labelFalse='VINCULAR AO PROJETO'
                    labelTrue='VINCULAR AO PROJETO'
                    checked={!!attachmentHolder.idProject}
                    justify='justify-center'
                    editable={false}
                    handleChange={(value) => setAttachmentHolder((prev) => ({ ...prev, idProject: projectId }))}
                  />
                </div>
                <div className='w-fit'>
                  <CheckboxInput
                    labelFalse='VINCULAR AO CLIENTE'
                    labelTrue='VINCULAR AO CLIENTE'
                    checked={!!attachmentHolder.idClient}
                    justify='justify-center'
                    handleChange={(value) => setAttachmentHolder((prev) => ({ ...prev, idClient: !!prev.idClient ? undefined : clientId }))}
                  />
                </div>
                <div className='w-fit'>
                  <CheckboxInput
                    labelFalse='VINCULAR À OPORTUNIDADE'
                    labelTrue='VINCULAR À OPORTUNIDADE'
                    checked={!!attachmentHolder.idOpportunity}
                    justify='justify-center'
                    handleChange={(value) =>
                      setAttachmentHolder((prev) => ({ ...prev, idOpportunity: !!prev.idOpportunity ? undefined : opportunityId }))
                    }
                  />
                </div>
              </div>
              <div className='flex w-full items-center justify-end'>
                <button
                  disabled={isPending}
                  onClick={() => {
                    handleAttach();
                  }}
                  className='h-9 whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground'
                >
                  ANEXAR
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </AnimatePresence>
  );
}

export default PurchaseFileAttachmentMenu;
