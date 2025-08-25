import DocumentationInformationBlock from '@/components/ProjectType/DocumentationInformationBlock';
import GeneralInformationBlock from '@/components/ProjectType/GeneralInformationBlock';
import ProposalTemplatesInformationBlock from '@/components/ProjectType/ProposalTemplatesInformationBlock';
import SizingInformationBlock from '@/components/ProjectType/SizingInformationBlock';
import type { TUserSession } from '@/lib/auth/session';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { createProjectType } from '@/utils/mutations/project-types';
import { TProjectType } from '@/utils/schemas/project-types.schema';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { VscChromeClose } from 'react-icons/vsc';

type NewProjectTypeProps = {
  session: TUserSession;
  closeModal: () => void;
};
function NewProjectType({ session, closeModal }: NewProjectTypeProps) {
  const queryClient = useQueryClient();

  const [infoHolder, setInfoHolder] = useState<TProjectType>({
    idParceiro: session.user.idParceiro || '',
    nome: '',
    categoriaVenda: 'KIT',
    dimensionamento: [],
    modelosProposta: [],
    documentacao: [],
    autor: {
      id: session.user.id,
      nome: session.user.nome,
      avatar_url: session.user.avatar_url,
    },
    dataInsercao: new Date().toISOString(),
  });
  const { mutate: handleCreateProjectType, isPending } = useMutationWithFeedback({
    mutationKey: ['create-project-type'],
    mutationFn: createProjectType,
    queryClient: queryClient,
    affectedQueryKey: ['project-types'],
  });
  return (
    <div id='new-product' className='fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)]'>
      <div className='fixed left-[50%] top-[50%] z-100 h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px] lg:w-[60%]'>
        <div className='flex h-full flex-col'>
          <div className='flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row'>
            <h3 className='text-xl font-bold text-primary dark:text-white '>NOVO TIPO DE PROJETO</h3>
            <button
              onClick={() => closeModal()}
              type='button'
              className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          <div className='flex grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto px-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
            <div className='my-5 flex flex-col'>
              <p className='w-full text-center text-primary/50'>
                Crie aqui um tipo de projeto, defina a <strong className='text-[#E25E3E]'>categoria de venda aplicável</strong> e personalize os
                campos de dimensionamento de proposta comerciais.
              </p>
            </div>
            <GeneralInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
            <SizingInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
            <ProposalTemplatesInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
            <DocumentationInformationBlock infoHolder={infoHolder} setInfoHolder={setInfoHolder} />
          </div>
          <div className='flex w-full items-center justify-end p-2'>
            <button
              disabled={isPending}
              onClick={() => {
                // @ts-ignore
                handleCreateProjectType({ info: { nome: infoHolder.nome.toUpperCase(), ...infoHolder } });
              }}
              className='h-9 whitespace-nowrap rounded-sm bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:bg-primary/50 disabled:text-white enabled:hover:bg-green-600 enabled:hover:text-white'
            >
              CRIAR TIPO DE PROJETO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewProjectType;
