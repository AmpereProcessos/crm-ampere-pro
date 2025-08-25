import { TServiceItem } from '@/utils/schemas/kits.schema';
import { AiOutlineSafety } from 'react-icons/ai';
import { MdOutlineMiscellaneousServices } from 'react-icons/md';

type ServiceCardProps = {
  service: TServiceItem;
};
function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className='mt-1 flex flex-col gap-1 rounded-md border border-primary/30 p-2'>
      <div className='flex w-full items-center justify-between gap-2'>
        <div className='flex items-center gap-1'>
          <div className='flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black p-1'>
            <MdOutlineMiscellaneousServices />
          </div>
          <p className='text-[0.6rem] font-medium leading-none tracking-tight lg:text-xs'>{service.descricao}</p>
        </div>
      </div>
      <div className='flex w-full items-center justify-end gap-1'>
        <AiOutlineSafety size={15} />
        <p className='text-[0.6rem] font-light text-primary/70'>{service.garantia > 1 ? `${service.garantia} ANOS` : `${service.garantia} ANO`} </p>
      </div>
    </div>
  );
}

export default ServiceCard;
