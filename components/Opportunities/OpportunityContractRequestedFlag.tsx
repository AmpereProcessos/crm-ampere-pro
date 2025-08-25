import { formatDateAsLocale } from '@/lib/methods/formatting';
import { BsFillCalendarCheckFill } from 'react-icons/bs';

type OpportunityContractRequestedFlagProps = {
  requestDate?: string | null;
};
export default function OpportunityContractRequestedFlag({ requestDate }: OpportunityContractRequestedFlagProps) {
  if (!requestDate) return null;
  return (
    <div className='flex min-w-[200px] flex-col items-center  rounded-md bg-orange-400 p-2 shadow-md'>
      <h1 className='text-center font-Raleway text-xs font-bold text-primary'>CONTRATO SOLICITADO</h1>
      <div className='flex items-center justify-center gap-2'>
        <BsFillCalendarCheckFill style={{ color: '#000', fontSize: '15px' }} />
        <p className='text-center text-xs font-bold text-primary'>{formatDateAsLocale(requestDate)}</p>
      </div>
    </div>
  );
}
