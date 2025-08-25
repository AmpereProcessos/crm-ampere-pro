import type { TUserSession } from '@/lib/auth/session';
import { uploadFile } from '@/lib/methods/firebase';
import { storage } from '@/services/firebase/storage-config';
import { fileTypes } from '@/utils/constants';
import { createFileReference } from '@/utils/mutations/file-references';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { TFileReference } from '@/utils/schemas/file-reference.schema';
import { useQueryClient } from '@tanstack/react-query';
import { getMetadata, ref } from 'firebase/storage';
import { useState } from 'react';
import DocumentFileInput from '../Inputs/DocumentFileInput';
import TextInput from '../Inputs/TextInput';

type AttachFileMenuProps = {
  analysisId: string;
  session: TUserSession;
};
function AttachFileMenu({ analysisId, session }: AttachFileMenuProps) {
  const queryClient = useQueryClient();
  const [personalizedFile, setPersonalizedFile] = useState<{ titulo: string; arquivo: File | string | null }>({
    titulo: '',
    arquivo: null,
  });
  async function attachFile(info: { titulo: string; arquivo: File | string | null }) {
    try {
      if (info.titulo.trim().length < 3) throw new Error('Preencha um título de ao menos 3 caractéres.');
      if (!info.arquivo) throw new Error('Vincule o arquivo a ser anexado.');
      const file = info.arquivo;
      if (!file) return;
      if (typeof file == 'string') {
        const fileRef = ref(storage, file);
        const metaData = await getMetadata(fileRef);
        const format = metaData.contentType && fileTypes[metaData.contentType] ? fileTypes[metaData.contentType].title : 'INDEFINIDO';
        const link: TFileReference = {
          idParceiro: session.user.idParceiro || '',
          idAnaliseTecnica: analysisId,
          titulo: info.titulo.toUpperCase(),
          formato: format,
          url: file,
          tamanho: metaData.size,
          autor: {
            id: session.user.id,
            nome: session.user.nome,
            avatar_url: session.user.avatar_url,
          },
          dataInsercao: new Date().toISOString(),
        };
        await createFileReference({ info: link });
      }
      if (typeof file != 'string') {
        const formattedFileName = info.titulo.toLowerCase().replaceAll(' ', '_');
        const vinculationId = analysisId;
        // Uploading file to Firebase and getting url and format
        const { url, format, size } = await uploadFile({ file: file, fileName: formattedFileName, vinculationId: vinculationId });
        const link: TFileReference = {
          idParceiro: session.user.idParceiro || '',
          idAnaliseTecnica: analysisId,
          titulo: info.titulo.toUpperCase(),
          formato: format,
          url: url,
          tamanho: size,
          autor: {
            id: session.user.id,
            nome: session.user.nome,
            avatar_url: session.user.avatar_url,
          },
          dataInsercao: new Date().toISOString(),
        };
        await createFileReference({ info: link });
      }
      return 'Arquivo anexado com sucesso !';
    } catch (error) {
      throw error;
    }
  }
  const { mutate: handleAttachFile, isPending } = useMutationWithFeedback({
    mutationKey: ['attach-homologation-file'],
    mutationFn: attachFile,
    queryClient: queryClient,
    affectedQueryKey: ['file-references-by-analysis', analysisId],
  });
  return (
    <div className='flex w-full flex-col items-center justify-center gap-2'>
      <div className='w-full lg:w-1/2'>
        <DocumentFileInput
          label='ARQUIVO'
          value={personalizedFile.arquivo}
          handleChange={(value) => setPersonalizedFile((prev) => ({ ...prev, arquivo: value }))}
        />
      </div>
      <div className='w-full lg:w-1/2'>
        <TextInput
          label='TITULO DO ARQUIVO'
          placeholder='Digite o nome a ser dado ao arquivo...'
          value={personalizedFile.titulo}
          handleChange={(value) => setPersonalizedFile((prev) => ({ ...prev, titulo: value }))}
          width='100%'
        />
      </div>
      <button
        disabled={isPending}
        // @ts-ignore
        onClick={() => handleAttachFile(personalizedFile)}
        className='rounded bg-black p-1 px-4 text-sm font-medium text-primary-foreground duration-300 ease-in-out hover:bg-primary/70'
      >
        ADICIONAR ARQUIVO
      </button>
    </div>
  );
}

export default AttachFileMenu;
