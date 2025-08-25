import { useEffect, useState } from 'react';

import TextInput from '../../Inputs/TextInput';

import ErrorComponent from '@/components/utils/ErrorComponent';
import LoadingComponent from '@/components/utils/LoadingComponent';
import type { TUserSession } from '@/lib/auth/session';
import { editFunnel } from '@/utils/mutations/funnels';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { useFunnelById } from '@/utils/queries/funnels';
import { usePartnersSimplified } from '@/utils/queries/partners';
import { TFunnelDTO } from '@/utils/schemas/funnel.schema';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MdDelete } from 'react-icons/md';
import { VscChromeClose } from 'react-icons/vsc';
import SelectWithImages from '../../Inputs/SelectWithImages';

type EditFunnelProps = {
  session: TUserSession;
  funnelId: string;
  closeModal: () => void;
};
function EditFunnel({ session, funnelId, closeModal }: EditFunnelProps) {
  const queryClient = useQueryClient();
  const { data: partners } = usePartnersSimplified();

  const { data: funnel, isLoading, isError, isSuccess } = useFunnelById({ id: funnelId });

  const [infoHolder, setInfoHolder] = useState<TFunnelDTO>({
    _id: 'id-holder',
    nome: '',
    descricao: '',
    etapas: [],
    idParceiro: session.user.idParceiro || '',
    autor: {
      id: session.user.id,
      nome: session.user.nome,
      avatar_url: session.user.avatar_url,
    },
    dataInsercao: new Date().toISOString(),
  });
  const [stageHolder, setStageHolder] = useState('');

  function addStage() {
    if (stageHolder.trim().length < 3) return toast.error('Preencha um nome de ao menos 3 caracteres para a etapa.');
    const stageArrCopy = [...infoHolder.etapas];
    stageArrCopy.push({ id: infoHolder.etapas.length + 1, nome: stageHolder.trim().toUpperCase() });
    setInfoHolder((prev) => ({ ...prev, etapas: stageArrCopy }));
    setStageHolder('');
    return;
  }
  function removeStage(index: number) {
    const stageArrCopy = [...infoHolder.etapas];
    stageArrCopy.splice(index, 1);
    return setInfoHolder((prev) => ({ ...prev, etapas: stageArrCopy }));
  }
  const { mutate: handleEditFunnel, isPending } = useMutationWithFeedback({
    mutationKey: ['edit-funnel'],
    mutationFn: editFunnel,
    queryClient,
    affectedQueryKey: ['funnels'],
  });
  useEffect(() => {
    if (funnel) setInfoHolder(funnel);
  }, [funnel]);
  return (
    <div id='defaultModal' className='fixed bottom-0 left-0 right-0 top-0 z-100 bg-[rgba(0,0,0,.85)] font-Inter'>
      <div className='fixed left-[50%] top-[50%] z-100 h-[80%] w-[90%] translate-x-[-50%] translate-y-[-50%] rounded-md bg-background p-[10px] lg:w-[30%]'>
        <div className='flex h-full w-full flex-col'>
          <div className='flex flex-col items-center justify-between border-b border-primary/30 px-2 pb-2 text-lg lg:flex-row'>
            <h3 className='text-xl font-bold text-primary  '>NOVO USUÁRIO</h3>
            <button
              onClick={closeModal}
              type='button'
              className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
            >
              <VscChromeClose style={{ color: 'red' }} />
            </button>
          </div>
          <div className='flex h-full grow flex-col gap-y-2 overflow-y-auto overscroll-y-auto p-2 py-1 scrollbar-thin scrollbar-track-primary/10 scrollbar-thumb-primary/30'>
            {isLoading ? <LoadingComponent /> : null}
            {isError ? <ErrorComponent msg='Erro ao buscar informações do funil.' /> : null}
            {isSuccess ? (
              <>
                <div className='w-full'>
                  <TextInput
                    label='NOME DO FUNIL'
                    placeholder='Preencha o nome a ser dado ao funil...'
                    value={infoHolder.nome}
                    handleChange={(value) => setInfoHolder((prev) => ({ ...prev, nome: value }))}
                    width='100%'
                  />
                </div>
                <div className='w-full'>
                  <TextInput
                    label='DESCRIÇÃO DO FUNIL'
                    placeholder='Preencha o descrição a ser dado ao funil...'
                    value={infoHolder.descricao}
                    handleChange={(value) => setInfoHolder((prev) => ({ ...prev, descricao: value }))}
                    width='100%'
                  />
                </div>
                <div className='w-full'>
                  <SelectWithImages
                    label='VISIBILIDADE DE PARCEIRO'
                    value={infoHolder.idParceiro || null}
                    options={partners?.map((p) => ({ id: p._id, value: p._id, label: p.nome, url: p.logo_url || undefined })) || []}
                    resetOptionLabel='TODOS'
                    handleChange={(value) =>
                      setInfoHolder((prev) => ({
                        ...prev,
                        idParceiro: value,
                      }))
                    }
                    onReset={() =>
                      setInfoHolder((prev) => ({
                        ...prev,
                        idParceiro: null,
                      }))
                    }
                    width='100%'
                  />
                </div>
                <h1 className='w-full pt-4 text-center text-sm font-medium'>ETAPAS DO FUNIL</h1>
                <div className='w-full '>
                  <TextInput
                    label='NOME DA ETAPA'
                    placeholder='Preencha o nome a ser dado a etapa do funil...'
                    value={stageHolder}
                    handleChange={(value) => setStageHolder(value)}
                    width='100%'
                  />
                </div>
                <div className='flex w-full items-center justify-end'>
                  <button
                    onClick={addStage}
                    className='whitespace-nowrap rounded-sm bg-primary/90 px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-primary/80 enabled:hover:text-primary-foreground'
                  >
                    ADICIONAR ETAPA
                  </button>
                </div>
                <div className='flex w-full flex-col gap-2'>
                  {infoHolder.etapas.length > 0 ? (
                    infoHolder.etapas.map((stage, index) => (
                      <div key={stage.id} className='flex w-full items-center justify-between rounded-md border border-primary/30 p-2'>
                        <div className='flex grow items-center gap-1'>
                          <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
                            <h1 className='text-sm font-bold'>{index + 1}</h1>
                          </div>
                          <p className='text-sm font-medium leading-none tracking-tight'>{stage.nome}</p>
                        </div>
                        <button
                          onClick={() => removeStage(index)}
                          type='button'
                          className='flex items-center justify-center rounded-lg p-1 text-red-500 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
                        >
                          <MdDelete size={15} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className='w-full py-4 text-center text-sm italic text-primary/70'>Sem etapas adicionadas...</p>
                  )}
                </div>
                <div className='flex w-full items-center justify-end'>
                  <button
                    disabled={isPending}
                    // @ts-ignore
                    onClick={() => handleEditFunnel({ id: funnelId, changes: infoHolder })}
                    className='h-9 whitespace-nowrap rounded-sm bg-blue-800 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:bg-primary/50 disabled:text-primary-foreground enabled:hover:bg-blue-800 enabled:hover:text-primary-foreground'
                  >
                    ATUALIZAR FUNIL
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditFunnel;
