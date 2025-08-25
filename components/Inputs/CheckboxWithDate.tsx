import { formatDateAsLocale } from '@/lib/methods/formatting';
import { cn } from '@/lib/utils';
import * as Popover from '@radix-ui/react-popover';
import { ptBR } from 'date-fns/locale';
import { BsCalendarCheck, BsCheck } from 'react-icons/bs';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';

type CheckboxWithDateProps = {
  date: Date | string | null;
  labelTrue: string;
  labelFalse: string;
  showDate?: boolean;
  handleChange: (value: string | null | undefined) => void;
  editable?: boolean;
};

function CheckboxWithDate({ date, labelTrue, labelFalse, showDate = true, handleChange, editable = true }: CheckboxWithDateProps) {
  return (
    <Popover.Root>
      <Popover.Trigger disabled={!editable} asChild>
        <Button
          variant={'outline-solid'}
          className={cn('flex flex-col gap-1 shadow-none', !date && 'text-muted-foreground', 'border-0 hover:bg-transparent')}
        >
          <div className='flex items-center gap-2'>
            <div className={'flex h-[16px] w-[16px] items-center justify-center rounded-full border border-black'}>
              {date ? <BsCheck style={{ color: 'black' }} /> : null}
            </div>
            <p className={'text-xs font-medium leading-none'}>{date ? labelTrue : labelFalse}</p>
          </div>

          {date && showDate ? (
            <div className='flex min-h-[10px] items-center gap-1'>
              <BsCalendarCheck size={10} />
              <p className={'text-[0.6rem] font-medium leading-none'}>{formatDateAsLocale(date)}</p>
            </div>
          ) : null}
        </Button>
      </Popover.Trigger>
      <Popover.Content className='z-120 w-auto rounded-md bg-background p-0 shadow-md' align='center'>
        <Calendar
          mode='single'
          selected={date ? new Date(date) : undefined}
          defaultMonth={date ? new Date(date) : undefined}
          onSelect={(value) => handleChange(value?.toISOString() || null)}
          initialFocus={true}
          locale={ptBR}
        />
      </Popover.Content>
    </Popover.Root>
  );
}

export default CheckboxWithDate;
