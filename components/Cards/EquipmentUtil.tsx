import { formatDateAsLocale, formatNameAsInitials } from '@/lib/methods/formatting';
import { renderCategoryIcon } from '@/lib/methods/rendering';
import { TEquipment } from '@/utils/schemas/utils';
import { AiOutlineSafety } from 'react-icons/ai';
import { BsCalendarPlusFill } from 'react-icons/bs';
import { FaIndustry } from 'react-icons/fa';
import { ImPower } from 'react-icons/im';
import Avatar from '../utils/Avatar';

type EquipmentUtilProps = {
  equipment: TEquipment;
};
function EquipmentUtil({ equipment }: EquipmentUtilProps) {
  return (
    <div className='flex w-full flex-col rounded-md border border-primary/30 p-3'>
      <div className='flex w-full flex-col items-start justify-between gap-2 lg:flex-row lg:items-center'>
        <div className='flex items-center gap-1'>
          <div className='flex h-[25px] w-[25px] items-center justify-center rounded-full border border-black p-1 text-[15px]'>
            {renderCategoryIcon(equipment.categoria)}
          </div>
          <p className='text-xs font-medium leading-none tracking-tight lg:text-sm'>
            <strong className='text-[#f25041]'>{equipment.fabricante}</strong> {equipment.modelo}
          </p>
        </div>
        <div className='flex grow items-center justify-end gap-2'>
          <h1 className='rounded-md bg-black px-2 py-1 text-[0.65rem] font-bold text-white'>{equipment.categoria}</h1>
        </div>
      </div>
      <div className='mt-2 flex w-full flex-col-reverse items-center justify-start gap-2 lg:flex-row'>
        <div className='flex grow items-center justify-end gap-2 pl-2 lg:w-fit'>
          <div className='flex items-center gap-1'>
            <FaIndustry size={12} />
            <p className='text-[0.6rem] font-light text-primary/50 lg:text-xs'>{equipment.fabricante}</p>
          </div>
          <div className='flex items-center gap-1'>
            <ImPower size={12} />
            <p className='text-[0.6rem] font-light text-primary/50 lg:text-xs'>{equipment.potencia} W</p>
          </div>
          <div className='flex items-center gap-1'>
            <AiOutlineSafety size={12} />
            <p className='text-[0.6rem] font-light text-primary/50 lg:text-xs'>{equipment.garantia} ANOS</p>
          </div>
        </div>
      </div>
      <div className='mt-2 flex items-center justify-end gap-2'>
        <div className={`flex items-center gap-2 text-primary/50`}>
          <BsCalendarPlusFill />
          <p className='text-[0.6rem] font-medium'>{formatDateAsLocale(equipment.dataInsercao, true)}</p>
        </div>
        <div className='flex items-center gap-2'>
          <Avatar fallback={formatNameAsInitials(equipment.autor.nome)} url={equipment.autor.avatar_url || undefined} height={20} width={20} />
          <p className='text-[0.6rem] font-medium text-primary/50'>{equipment.autor.nome}</p>
        </div>
      </div>
    </div>
  );
}

export default EquipmentUtil;
