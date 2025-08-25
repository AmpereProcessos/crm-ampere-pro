import { formatToMoney } from '@/utils/methods';
import { useMutationWithFeedback } from '@/utils/mutations/general-hook';
import { deleteSaleGoal } from '@/utils/mutations/sale-goals';
import { TSaleGoalDTO } from '@/utils/schemas/sale-goal.schema';
import { useQueryClient } from '@tanstack/react-query';
import { AiFillEdit } from 'react-icons/ai';
import { BsFillCalendarFill } from 'react-icons/bs';
import { FaPercentage } from 'react-icons/fa';
import { GrSend } from 'react-icons/gr';
import { ImPower } from 'react-icons/im';
import { MdAttachMoney, MdCreate, MdDelete, MdSell } from 'react-icons/md';
type SaleGoalsCardProps = {
  saleGoal: TSaleGoalDTO;
  promoterId: string;
  handleClick: ({ info, id, period }: { info: TSaleGoalDTO['metas']; id: string; period: string }) => void;
};
function SaleGoals({ saleGoal, promoterId, handleClick }: SaleGoalsCardProps) {
  const queryClient = useQueryClient();
  const { mutate: handleDeleteSaleGoal } = useMutationWithFeedback({
    mutationKey: ['delete-sale-goals', saleGoal._id],
    mutationFn: deleteSaleGoal,
    queryClient: queryClient,
    affectedQueryKey: ['user-sale-goals', promoterId],
  });
  return (
    <div className='flex w-full flex-col items-center rounded-sm border border-primary/30 p-2'>
      <div className='flex w-full items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <BsFillCalendarFill />
          <p>{saleGoal.periodo}</p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            // @ts-ignore
            onClick={() => handleDeleteSaleGoal({ id: saleGoal._id })}
            className='text-red-300 duration-300 ease-in-out hover:text-red-500'
          >
            <MdDelete />
          </button>
          <button
            onClick={() => handleClick({ id: saleGoal._id || '', info: saleGoal.metas, period: saleGoal.periodo })}
            className='text-orange-300 duration-300 ease-in-out hover:text-[#fead41]'
          >
            <AiFillEdit />
          </button>
        </div>
      </div>

      <div className='mt-2 flex w-full items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            <ImPower />
            <p className='text-xs leading-none tracking-tight text-primary/50'>POTÊNCIA PICO</p>
          </div>

          <p className='text-xs font-bold'>{saleGoal.metas.potenciaVendida} kW</p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            <MdSell />
            <p className='text-xs leading-none tracking-tight text-primary/50'>PROJETOS VENDIDOS</p>
          </div>
          <p className='text-xs font-bold'>{saleGoal.metas.projetosVendidos}</p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            <MdAttachMoney />
            <p className='text-xs leading-none tracking-tight text-primary/50'>VALOR VENDIDO</p>
          </div>
          <p className='text-xs font-bold'>{saleGoal.metas.valorVendido ? formatToMoney(saleGoal.metas.valorVendido) : '-'}</p>
        </div>
      </div>
      <div className='mt-1 flex w-full items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            <FaPercentage />
            <p className='text-xs leading-none tracking-tight text-primary/50'>CONVERSÃO</p>
          </div>
          <p className='text-xs font-bold'>{saleGoal.metas.conversao}</p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            <MdCreate />
            <p className='text-xs leading-none tracking-tight text-primary/50'>PROJETOS CRIADOS</p>
          </div>
          <p className='text-xs font-bold'>{saleGoal.metas.projetosCriados}</p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1'>
            <GrSend />
            <p className='text-xs leading-none tracking-tight text-primary/50'>PROJETOS ENVIADOS</p>
          </div>
          <p className='text-xs font-bold'>{saleGoal.metas.projetosEnviados}</p>
        </div>
      </div>
    </div>
  );
}

export default SaleGoals;
