import FileReferenceCard from '@/components/FileReference/FileReferenceCard';
import ErrorComponent from '@/components/utils/ErrorComponent';
import type { TUserSession } from '@/lib/auth/session';
import { useFileReferences } from '@/utils/queries/file-references';
import PurchaseFileAttachmentMenu from './Utils/FileAttachmentMenu';

type FilesBlockProps = {
  purchaseId: string;
  projectId: string;
  clientId: string;
  opportunityId?: string;
  analysisId?: string;
  homologationId?: string;
  session: TUserSession;
};
function FilesBlock({ purchaseId, projectId, clientId, opportunityId, analysisId, homologationId, session }: FilesBlockProps) {
  const {
    data: fileReferences,
    isLoading,
    isError,
    isSuccess,
  } = useFileReferences({ projectId, clientId, opportunityId, analysisId, homologationId, purchaseId });
  return (
    <div className='flex w-full flex-col gap-2 rounded-sm border border-primary/80'>
      <h1 className='w-full rounded-sm bg-primary/80 p-1 text-center font-bold text-white'>ARQUIVOS</h1>
      <div className='flex w-full grow flex-wrap justify-around gap-2 p-2'>
        {isLoading ? (
          <div className='flex min-h-[80px] items-center justify-center'>
            <p className='w-full animate-pulse text-center font-medium tracking-tight text-primary/50'>Buscando arquivos...</p>
          </div>
        ) : null}
        {isError ? <ErrorComponent msg='Oops, houve um erro ao buscar arquivos.' /> : null}
        {isSuccess && fileReferences.length > 0 ? (
          fileReferences.map((file, index) => (
            <div key={index} className='w-full lg:w-[400px]'>
              <FileReferenceCard info={file} />
            </div>
          ))
        ) : (
          <p className='w-full text-center text-xs font-medium italic text-primary/50'>Nenhum arquivo adicionado.</p>
        )}
      </div>
      <PurchaseFileAttachmentMenu purchaseId={purchaseId} projectId={projectId} clientId={clientId} opportunityId={opportunityId} session={session} />
    </div>
  );
}

export default FilesBlock;
