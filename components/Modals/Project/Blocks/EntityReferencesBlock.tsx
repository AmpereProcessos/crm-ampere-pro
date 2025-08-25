import { TProjectDTOWithReferences } from '@/utils/schemas/project.schema';
import Link from 'next/link';
import { BsCode, BsFillFunnelFill, BsFolderFill } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa';

type EntityReferencesBlockProps = {
  project: TProjectDTOWithReferences;
};
function EntityReferencesBlock({ project }: EntityReferencesBlockProps) {
  return (
    <div className='flex w-full flex-col flex-wrap items-center justify-center gap-2 p-2 lg:flex-row lg:gap-4'>
      <div className='flex w-full flex-col rounded-sm border border-cyan-800 lg:w-[450px]'>
        <div className='flex w-full items-center justify-center gap-2 bg-cyan-800 p-2 text-primary-foreground'>
          <FaUser />
          <h1 className='text-xs font-medium leading-none tracking-tight'>CLIENTE</h1>
        </div>
        <h1 className='w-full p-2 text-center text-sm font-medium leading-none tracking-tight'>{project.cliente.nome}</h1>
        <div className='flex w-full items-center justify-center gap-1'>
          <BsCode />
          <p className='text-xs font-medium tracking-tight text-primary/70'>#{project.cliente.id}</p>
        </div>
      </div>
      <div className='flex w-full flex-col rounded-sm border border-cyan-800 lg:w-[450px]'>
        <div className='flex w-full items-center justify-center gap-2 bg-cyan-800 p-2 text-primary-foreground'>
          <BsFillFunnelFill />
          <h1 className='text-xs font-medium leading-none tracking-tight'>OPORTUNIDADE</h1>
        </div>
        <Link href={`/comercial/oportunidades/id/${project.oportunidade.id}`}>
          <h1 className='w-full cursor-pointer p-2 text-center text-sm font-medium leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500'>
            {project.oportunidade.nome}
          </h1>
        </Link>
        <div className='flex w-full items-center justify-center gap-1'>
          <BsCode />
          <p className='text-xs font-medium tracking-tight text-primary/70'>#{project.oportunidade.id}</p>
        </div>
      </div>
      <div className='flex w-full flex-col rounded-sm border border-cyan-800 lg:w-[450px]'>
        <div className='flex w-full items-center justify-center gap-2 bg-cyan-800 p-2 text-primary-foreground'>
          <BsFolderFill />
          <h1 className='text-xs font-medium leading-none tracking-tight'>PROPOSTA</h1>
        </div>
        <Link href={`/comercial/proposta/${project.proposta.id}`}>
          <h1 className='w-full cursor-pointer p-2 text-center text-sm font-medium leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500'>
            {project.proposta.nome}
          </h1>
        </Link>

        <div className='flex w-full items-center justify-center gap-1'>
          <BsCode />
          <p className='text-xs font-medium tracking-tight text-primary/70'>#{project.proposta.id}</p>
        </div>
      </div>
    </div>
  );
}

export default EntityReferencesBlock;
