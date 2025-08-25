import { useSession } from '@/app/providers/SessionProvider';
import GeneralControlModal from '@/components/Modals/Project/GeneralControlModal';
import { Sidebar } from '@/components/Sidebar';
import LoadingPage from '@/components/utils/LoadingPage';
import { useComercialProjects } from '@/utils/queries/project';
import { useState } from 'react';
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from 'react-icons/io';
import { MdDashboard } from 'react-icons/md';

function ComercialSectorMainPage() {
  const { session, status } = useSession({ required: true });
  const [filterMenuIsOpen, setFilterMenuIsOpen] = useState<boolean>(false);

  const [editModal, setEditModal] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
  const { data: projects } = useComercialProjects();

  console.log(projects);
  if (status !== 'authenticated') return <LoadingPage />;
  return (
    <div className='flex h-full flex-col md:flex-row'>
      <Sidebar session={session} />
      <div className='flex w-full max-w-full grow flex-col overflow-x-hidden bg-background p-6'>
        <div className='flex flex-col items-center border-b border-black pb-2'>
          <div className='flex w-full flex-col items-center justify-between gap-2 lg:flex-row'>
            <div className='flex items-center gap-1'>
              {filterMenuIsOpen ? (
                <div className='cursor-pointer text-primary/60 hover:text-blue-400'>
                  <IoMdArrowDropupCircle style={{ fontSize: '25px' }} onClick={() => setFilterMenuIsOpen(false)} />
                </div>
              ) : (
                <div className='cursor-pointer text-primary/60 hover:text-blue-400'>
                  <IoMdArrowDropdownCircle style={{ fontSize: '25px' }} onClick={() => setFilterMenuIsOpen(true)} />
                </div>
              )}
              <div className='flex flex-col gap-1'>
                <h1 className='text-xl font-black leading-none tracking-tight md:text-2xl'>CONTROLE DE PROJETOS NO ESTÁGIO COMERCIAL</h1>
              </div>
            </div>
          </div>
          {/* {filterMenuIsOpen ? <FilterMenu filters={filters} setFilters={setFilters} /> : null} */}
        </div>
        <div className='flex flex-wrap justify-between gap-2 py-2'>
          {projects?.map((project) => (
            <div
              key={project._id}
              className='flex min-h-[250px] w-full flex-col gap-2 rounded-md border border-primary/50 bg-background p-4 font-Inter shadow-md lg:w-[600px]'
            >
              <div className='flex w-full items-center justify-between gap-2'>
                <div className='flex items-center gap-1'>
                  <div className='flex h-[25px] min-h-[25px] w-[25px] min-w-[25px] items-center justify-center rounded-full border border-black p-1'>
                    <MdDashboard size={12} />
                  </div>
                  <h1
                    onClick={() => setEditModal({ id: project._id, isOpen: true })}
                    className='cursor-pointer text-sm font-black leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500'
                  >
                    {project.nome}
                  </h1>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {editModal.id && editModal.isOpen ? (
        <GeneralControlModal projectId={editModal.id} session={session} closeModal={() => setEditModal({ id: null, isOpen: false })} />
      ) : null}
    </div>
  );
}

export default ComercialSectorMainPage;
