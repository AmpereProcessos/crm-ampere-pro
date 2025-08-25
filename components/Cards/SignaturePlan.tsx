import { formatDateAsLocale } from '@/lib/methods/formatting';
import { formatToMoney } from '@/utils/methods';
import { TSignaturePlanDTO } from '@/utils/schemas/signature-plans.schema';
import { BsBookmarksFill, BsCalendarPlus, BsCheckCircleFill } from 'react-icons/bs';
import { MdAttachMoney, MdOutlineTimer, MdRepeat } from 'react-icons/md';
import Avatar from '../utils/Avatar';

function getBarColor({ active }: { active: boolean }) {
  if (!active) return 'bg-primary/50';
  return 'bg-blue-500';
}
function getStatusTag({ active }: { active: boolean }) {
  if (!active) return <h1 className='rounded-full bg-primary/60 px-2 py-1 text-[0.65rem] font-bold text-primary-foreground lg:text-xs'>INATIVO</h1>;

  return <h1 className='rounded-full bg-blue-600 px-2 py-1 text-[0.65rem] font-bold text-primary-foreground lg:text-xs'>ATIVO</h1>;
}
type SignaturePlanCardProps = {
  plan: TSignaturePlanDTO;
  handleOpenModal: (id: string) => void;
  userHasEditPermission: boolean;
  userHasPricingViewPermission: boolean;
};
function SignaturePlanCard({ plan, handleOpenModal, userHasEditPermission, userHasPricingViewPermission }: SignaturePlanCardProps) {
  return (
    <div key={plan._id} className='flex min-h-[250px] w-full gap-2 rounded-md border border-primary/50 bg-background shadow-md lg:w-[450px]'>
      {/* <div className={`h-full w-[7px] ${getBarColor({ active: plan.ativo })} rounded-bl-md rounded-tl-md`}></div> */}
      <div className='flex w-full grow flex-col p-3'>
        <div className='flex w-full grow flex-col'>
          <div className='flex w-full items-center justify-between gap-2'>
            <div className='flex items-center gap-1'>
              <div className='flex h-[25px] min-h-[25px] w-[25px] min-w-[25px] items-center justify-center rounded-full border border-black p-1'>
                <BsBookmarksFill />
              </div>
              {userHasEditPermission ? (
                <h1
                  onClick={() => handleOpenModal(plan._id)}
                  className='cursor-pointer text-sm font-black leading-none tracking-tight duration-300 ease-in-out hover:text-cyan-500'
                >
                  {plan.nome || 'NÃO DEFINIDO'}
                </h1>
              ) : (
                <h1 className='text-sm font-black leading-none tracking-tight'>{plan.nome || 'NÃO DEFINIDO'}</h1>
              )}
            </div>

            {getStatusTag({ active: plan.ativo })}
          </div>
          <div className='mt-2 flex w-full items-center gap-2'>
            {userHasPricingViewPermission ? (
              <div className='flex items-center gap-1 text-green-500'>
                <MdAttachMoney />
                <p className='text-[0.65rem] font-bold lg:text-xs'>{formatToMoney(plan.preco)}</p>
              </div>
            ) : null}
            <div className='flex items-center gap-1'>
              <MdRepeat />
              <p className='text-[0.65rem] font-bold lg:text-xs'>{plan.intervalo.tipo}</p>
            </div>
            <div className='flex items-center gap-1'>
              <MdOutlineTimer />
              <p className='text-[0.65rem] font-bold lg:text-xs'>{plan.intervalo.espacamento}</p>
            </div>
          </div>
          <div className='flex w-full grow flex-col'>
            <h1 className='my-2 mb-0 text-[0.65rem] font-bold leading-none tracking-tight text-primary/70 lg:text-xs'>DESCRITIVO</h1>
            {plan.descritivo.map((d) => (
              <div className='flex w-full items-center gap-1 self-center'>
                <div className='w-fit'>
                  <BsCheckCircleFill color='rgb(21,128,61)' size={15} />
                </div>
                <p className='grow text-xs font-medium tracking-tight'>{d.descricao}</p>
              </div>
            ))}
          </div>
          <div className='mt-2 flex w-full items-center justify-end gap-2'>
            <div className={`flex items-center gap-2`}>
              <div className='ites-center flex gap-1'>
                <BsCalendarPlus />
                <p className={`text-[0.65rem] font-medium text-primary/70`}>{formatDateAsLocale(plan.dataInsercao)}</p>
              </div>
            </div>
            <div className='flex items-center justify-center gap-1'>
              <Avatar fallback={'U'} height={20} width={20} url={plan.autor?.avatar_url || undefined} />
              <p className='text-[0.65rem] font-medium text-primary/70'>{plan.autor?.nome}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignaturePlanCard;
