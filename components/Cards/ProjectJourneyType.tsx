import { TProjectJourneyTypeDTO } from '@/utils/schemas/project-journey-types';
import { FaRoute } from 'react-icons/fa';

type ProjectJourneyTypeProps = {
  journeyType: TProjectJourneyTypeDTO;
  handleClick: () => void;
};
function ProjectJourneyType({ journeyType, handleClick }: ProjectJourneyTypeProps) {
  return (
    <div className='flex w-full flex-col rounded-md border border-primary/30 p-2'>
      <div className='flex grow items-center gap-1'>
        <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1'>
          <FaRoute />
        </div>

        <p
          onClick={() => handleClick()}
          className='cursor-pointer text-sm font-medium leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500'
        >
          {journeyType.nome}
        </p>
      </div>
      <div className='flex w-full flex-col gap-2'>
        <h1 className='w-full mt-2 text-start text-xs font-medium'>ETAPAS</h1>
        <div className='flex w-full flex-wrap items-center justify-start gap-2'>
          {journeyType.etapas.map((stage, index) => (
            <div key={index} className='rounded-lg border border-primary/30 bg-primary/20 px-2 py-1 text-[0.57rem] font-medium'>
              {stage.titulo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProjectJourneyType;
