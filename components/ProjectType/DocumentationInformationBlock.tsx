import { formatCondition } from '@/utils/project-documentation/helpers';
import { TProjectType } from '@/utils/schemas/project-types.schema';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { BsLockFill } from 'react-icons/bs';
import { FaEquals } from 'react-icons/fa6';
import { MdDelete, MdOutlineAttachFile } from 'react-icons/md';
import { TbBoxMultiple } from 'react-icons/tb';
import NewDocumentMenu from './NewDocumentMenu';

type DocumentationInformationBlockProps = {
  infoHolder: TProjectType;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProjectType>>;
};
function DocumentationInformationBlock({ infoHolder, setInfoHolder }: DocumentationInformationBlockProps) {
  const [newDocumentMenuIsOpen, setNewDocumentMenuIsOpen] = useState<boolean>(false);

  function addDocument(document: TProjectType['documentacao'][number]) {
    const documents = [...infoHolder.documentacao];
    documents.push(document);
    setInfoHolder((prev) => ({ ...prev, documentacao: documents }));
    return toast.success('Documento adicionado a lista !');
  }
  function removeDocument(index: number) {
    const documents = [...infoHolder.documentacao];
    documents.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, documentacao: documents }));
  }
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-white'>DOCUMENTAÇÃO</h1>
      {newDocumentMenuIsOpen ? (
        <NewDocumentMenu addDocument={(document) => addDocument(document)} closeMenu={() => setNewDocumentMenuIsOpen(false)} />
      ) : (
        <div className='flex w-full items-center justify-end'>
          <button
            className='rounded bg-green-500 p-1 px-4 text-sm font-medium text-white duration-300 ease-in-out hover:bg-green-600'
            onClick={() => setNewDocumentMenuIsOpen(true)}
          >
            NOVO DOCUMENTO
          </button>
        </div>
      )}
      <h1 className='font-Inter font-black'>DOCUMENTAÇÕES PARA SOLICITAÇÃO DE PROJETO</h1>
      <div className='flex w-full flex-col gap-1'>
        {infoHolder.documentacao.length > 0 ? (
          infoHolder.documentacao.map((document, index) => (
            <div key={index} className='flex w-full flex-col rounded-md border border-primary/30 p-2'>
              <div className='flex w-full flex-row items-center justify-between gap-2'>
                <div className='flex grow items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
                      <MdOutlineAttachFile size={13} />
                    </div>
                    <p className='text-sm font-medium leading-none tracking-tight'>{document.titulo}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeDocument(index)}
                  type='button'
                  className='flex items-center justify-center self-end rounded-lg p-1 text-red-500 duration-300 ease-linear hover:scale-105 hover:bg-red-200 lg:self-center'
                >
                  <MdDelete style={{ color: 'red' }} />
                </button>
              </div>
              <div className='my-1 flex w-full flex-wrap items-center justify-start gap-2'>
                {document.obrigatorio ? (
                  <div className='flex items-center gap-1 rounded-full border-red-600 bg-red-50 px-2 py-1 text-red-600'>
                    <BsLockFill size={12} />
                    <p className='text-[0.65rem]'>OBRIGATÓRIO</p>
                  </div>
                ) : null}
                {document.condicao.aplicavel ? (
                  <div className='flex items-center gap-1 rounded-full border-orange-600 bg-orange-50 px-2 py-1 text-orange-600'>
                    <FaEquals size={12} />
                    <p className='text-[0.65rem]'>CONDICIONAL</p>
                  </div>
                ) : null}
                {document.multiplo ? (
                  <div className='flex items-center gap-1 rounded-full border-blue-600 bg-blue-50 px-2 py-1 text-blue-600'>
                    <TbBoxMultiple size={12} />
                    <p className='text-[0.65rem]'>MÚLTIPLO</p>
                  </div>
                ) : null}
              </div>
              <div className='my-2 text-start text-xs tracking-tight text-primary/50'>{document.descricao || 'NENHUMA DESCRIÇÃO DEFINIDA.'}</div>
              {document.condicao.aplicavel ? (
                <div className='flex w-full flex-wrap items-center justify-start gap-2'>
                  <h1 className='text-xs font-medium'>CONDIÇÃO DE OBRIGATORIEDADE</h1>
                  <h1 className='rounded-full border-cyan-500 bg-cyan-50 px-2 py-1 text-[0.55rem] font-medium tracking-tight text-cyan-500'>
                    OBRIGATÓRIO QUANDO <strong className='text-[#fead41]'>{formatCondition(document.condicao.variavel || '')}</strong> FOR IGUAL A{' '}
                    <strong className='text-[#fead41]'>{document.condicao.igual || ''}</strong>
                  </h1>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <p className='flex w-full grow items-center justify-center py-2 text-center font-medium italic tracking-tight text-primary/50'>
            Sem documentação definida para solicitação de projeto.
          </p>
        )}
      </div>
    </div>
  );
}

export default DocumentationInformationBlock;
