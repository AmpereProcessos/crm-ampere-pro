import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOpportunityHistoryStore } from '@/utils/stores/opportunity-history-store';
import { AiFillInteraction } from 'react-icons/ai';
import { TbNotes } from 'react-icons/tb';

function TypeSelector() {
  const selectedType = useOpportunityHistoryStore((s) => s.opportunityHistory.categoria);
  const setSelectedType = useOpportunityHistoryStore((s) => s.setCategory);
  return (
    <div className='w-full flex items-center justify-center gap-2 flex-wrap'>
      <Button
        variant='outline'
        className={cn('px-2 py-1 flex items-center gap-2', selectedType === 'ANOTAÇÃO' && 'bg-blue-500 text-primary-foreground')}
        onClick={() => setSelectedType('ANOTAÇÃO')}
      >
        <TbNotes className='h-4 w-4 min-w-4 min-h-4' />
        ANOTAÇÃO
      </Button>
      <Button
        variant='outline'
        className={cn('px-2 py-1 flex items-center gap-2', selectedType === 'INTERAÇÃO' && 'bg-blue-500 text-primary-foreground')}
        onClick={() => setSelectedType('INTERAÇÃO')}
      >
        <AiFillInteraction className='h-4 w-4 min-w-4 min-h-4' />
        INTERAÇÃO
      </Button>
    </div>
  );
}

export default TypeSelector;
