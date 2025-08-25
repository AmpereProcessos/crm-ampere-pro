import { formatDateAsLocale } from '@/lib/methods/formatting';
import { BsFillCalendarCheckFill } from 'react-icons/bs';

type OpportunityWonFlagProps = {
  wonDate?: string | null;
};
function OpportunityWonFlag({ wonDate }: OpportunityWonFlagProps) {
  if (!wonDate) return null;
  return (
    <div className='flex min-w-[200px] flex-col items-center  rounded-md bg-green-400 p-2 shadow-md'>
      <h1 className='text-center font-Raleway text-xs font-bold text-primary'>OPORTUNIDADE GANHA</h1>
      <div className='flex items-center justify-center gap-2'>
        <BsFillCalendarCheckFill style={{ color: '#000', fontSize: '15px' }} />
        <p className='text-center text-xs font-bold text-primary'>{formatDateAsLocale(wonDate)}</p>
      </div>
    </div>
  );
}

export default OpportunityWonFlag;
