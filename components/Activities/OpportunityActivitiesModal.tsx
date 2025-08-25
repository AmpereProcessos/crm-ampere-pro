import { useActivitiesByOpportunityId } from '@/utils/queries/activities';
import { VscChromeClose } from 'react-icons/vsc';
import OpportunityActivitySimplified from '../Cards/OpportunityActivitySimplified';
import ErrorComponent from '../utils/ErrorComponent';
import LoadingComponent from '../utils/LoadingComponent';

type OpportunityActivitiesModalProps = {
  opportunityId: string;
  closeModal: () => void;
};
function OpportunityActivitiesModal({ opportunityId, closeModal }: OpportunityActivitiesModalProps) {
  const {
    data: activities,
    isLoading,
    isError,
    isSuccess,
  } = useActivitiesByOpportunityId({ opportunityId: opportunityId, openOnly: true, dueOnly: true });
  return (
    <div
      id='dropdown'
      className='absolute -right-10 z-10 flex w-64 list-none flex-col divide-y divide-primary/10 rounded-sm bg-background text-base shadow-sm'
    >
      <div className='flex w-full flex-col p-1'>
        <div className='flex w-full justify-between border-b border-primary/30 pb-1'>
          <h1 className='text-xs font-medium text-primary/70'>ATIVIDADES</h1>
          <button
            onClick={() => {
              closeModal();
            }}
            type='button'
            className='flex items-center justify-center rounded-lg p-1 duration-300 ease-linear hover:scale-105 hover:bg-red-200'
          >
            <VscChromeClose style={{ color: 'red', fontSize: '12px' }} />
          </button>
        </div>
        <div className='flex w-full flex-col gap-1 py-2'>
          {isLoading ? <LoadingComponent /> : null}
          {isError ? <ErrorComponent msg='Erro ao buscar atividades da oportunidade.' /> : null}
          {isSuccess ? activities.map((activity) => <OpportunityActivitySimplified activity={activity} opportunityId={opportunityId} />) : null}
        </div>
      </div>
    </div>
  );
}

export default OpportunityActivitiesModal;
