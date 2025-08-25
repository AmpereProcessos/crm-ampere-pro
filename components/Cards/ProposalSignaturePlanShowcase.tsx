import { formatToMoney } from '@/utils/methods';
import { TProposal } from '@/utils/schemas/proposal.schema';
import { AiFillEdit } from 'react-icons/ai';
import { BsCheckCircleFill } from 'react-icons/bs';

type TEditPriceModal = {
  isOpen: boolean;
  priceItemIndex: null | number;
};

type ProposalSignaturePlanShowcaseProps = {
  plan: TProposal['planos'][number];
  planIndex: number;
  userHasPricingEditPermission: boolean;
  editPlanPrice: (index: number) => void;
};
function ProposalSignaturePlanShowcase({ plan, planIndex, userHasPricingEditPermission, editPlanPrice }: ProposalSignaturePlanShowcaseProps) {
  return (
    <div className='flex w-full flex-col rounded-lg border border-primary/50 bg-background p-6 shadow-lg'>
      <div className='flex w-full items-center justify-between gap-2'>
        <h1 className='font-black'>{plan.nome}</h1>
        {userHasPricingEditPermission ? (
          <button onClick={() => editPlanPrice(planIndex)} className='text-md text-primary/40 hover:text-[#fead61]'>
            <AiFillEdit />
          </button>
        ) : null}
      </div>
      <p className='w-full text-start text-sm text-primary/70'>{plan?.descricao || '...'}</p>
      <div className='my-4 flex w-full items-end justify-center gap-1'>
        <h1 className='text-4xl font-black'>{formatToMoney(plan.valor || 0)}</h1>
        <h1 className='text-xs font-light text-primary/70'>/ {plan?.intervalo.tipo}</h1>
      </div>

      <div className='my-4 flex w-full grow flex-col gap-1'>
        <h1 className='text-xs tracking-tight text-primary/70'>DESCRITIVO</h1>
        <div className='flex w-[85%] flex-col gap-2 self-center'>
          {plan.descritivo.map((d) => (
            <div className='flex w-full items-center gap-1 self-center'>
              <div className='w-fit'>
                <BsCheckCircleFill color='rgb(21,128,61)' size={15} />
              </div>
              <p className='grow text-xs font-medium tracking-tight'>{d.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProposalSignaturePlanShowcase;
