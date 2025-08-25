import { ProposalTemplates } from '@/utils/integrations/general';
import { TProjectType } from '@/utils/schemas/project-types.schema';
import React from 'react';

type ProposalTemplatesInformationBlockProps = {
  infoHolder: TProjectType;
  setInfoHolder: React.Dispatch<React.SetStateAction<TProjectType>>;
};
function ProposalTemplatesInformationBlock({ infoHolder, setInfoHolder }: ProposalTemplatesInformationBlockProps) {
  function addTemplate(template: (typeof ProposalTemplates)[number]) {
    const models = [...infoHolder.modelosProposta];
    models.push({ titulo: template.value, idAnvil: template.idAnvil });
    setInfoHolder((prev) => ({ ...prev, modelosProposta: models }));
  }
  function removeTemplate(index: number) {
    const models = [...infoHolder.modelosProposta];
    models.splice(index, 1);
    setInfoHolder((prev) => ({ ...prev, modelosProposta: models }));
  }
  return (
    <div className='flex w-full flex-col gap-y-2'>
      <h1 className='w-full bg-primary/70  p-1 text-center font-medium text-primary-foreground'>MODELOS DE PROPOSTA</h1>
      <p className='my-2 w-full text-center text-primary/70'>
        Escolha, dentro do nosso de banco de templates, um opção que poderá ser utilizada para esse tipo de projeto.
      </p>
      <h1 className='my-2 w-full text-start text-xs font-black text-[#FF9B50]'>MODELOS DISPONÍVEIS</h1>
      <div className='my-2 flex flex-wrap items-center gap-2'>
        {ProposalTemplates.filter((t) => !infoHolder.modelosProposta.map((m) => m.idAnvil).includes(t.idAnvil)).map((template, index) => (
          <button
            key={index}
            onClick={() => addTemplate(template)}
            className='w-fit  cursor-pointer rounded-sm border border-primary/70 p-1 text-xs font-medium text-primary/70 duration-300 ease-in-out hover:bg-primary/70 hover:text-primary-foreground'
          >
            {template.label}
          </button>
        ))}
      </div>
      <h1 className='my-2 w-full text-start text-xs font-black text-cyan-500'>MODELOS SELECIONADOS</h1>
      <div className='my-2 flex flex-wrap items-center gap-2'>
        {infoHolder.modelosProposta.map((field, index) => (
          <div
            onClick={() => removeTemplate(index)}
            className='w-fit  cursor-pointer rounded-sm border border-cyan-500 p-1 text-xs font-medium text-cyan-500 duration-300 ease-in-out hover:border-primary/70 hover:bg-transparent hover:text-primary/70'
          >
            {field.titulo}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProposalTemplatesInformationBlock;
