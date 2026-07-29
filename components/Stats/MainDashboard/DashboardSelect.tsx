'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export type DashboardSelectOption = {
  value: string;
  label: string;
};

type DashboardSingleSelectProps = {
  value: string | null;
  options: DashboardSelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
};

export function DashboardSingleSelect({ value, options, placeholder, onChange, className }: DashboardSingleSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('h-8 w-full justify-between px-3 text-xs font-normal shadow-none', className)}
        >
          <span className='truncate'>{selected?.label ?? placeholder}</span>
          <ChevronDown className='ml-2 h-3.5 w-3.5 shrink-0 text-primary/50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-[var(--radix-popover-trigger-width)] min-w-56 p-0'>
        <Command>
          <CommandInput placeholder='Buscar funil...' className='h-9 text-xs' />
          <CommandList>
            <CommandEmpty>Nenhum funil encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className='text-xs'
                >
                  <Check className={cn('mr-2 h-3.5 w-3.5', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  <span className='truncate'>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type DashboardMultiSelectProps = {
  value: string[] | null;
  options: DashboardSelectOption[];
  resetLabel: string;
  onChange: (value: string[]) => void;
  onReset: () => void;
  className?: string;
};

export function DashboardMultiSelect({ value, options, resetLabel, onChange, onReset, className }: DashboardMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOptions = value ? options.filter((option) => value.includes(option.value)) : [];
  const summary =
    value === null
      ? resetLabel
      : selectedOptions.length === 0
        ? 'NENHUM RESPONSÁVEL'
        : selectedOptions.length === 1
          ? selectedOptions[0]?.label
          : `${selectedOptions.length} RESPONSÁVEIS`;

  function toggle(valueToToggle: string) {
    const current = value ?? [];
    onChange(current.includes(valueToToggle) ? current.filter((id) => id !== valueToToggle) : [...current, valueToToggle]);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('h-8 w-full justify-between px-3 text-xs font-normal shadow-none', className)}
        >
          <span className='truncate'>{summary}</span>
          <ChevronDown className='ml-2 h-3.5 w-3.5 shrink-0 text-primary/50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-[var(--radix-popover-trigger-width)] min-w-64 p-0'>
        <Command>
          <CommandInput placeholder='Buscar responsável...' className='h-9 text-xs' />
          <CommandList>
            <CommandEmpty>Nenhum responsável encontrado.</CommandEmpty>
            <CommandGroup>
              <CommandItem value={resetLabel} onSelect={onReset} className='text-xs font-medium'>
                <Check className={cn('mr-2 h-3.5 w-3.5', value === null ? 'opacity-100' : 'opacity-0')} />
                {resetLabel}
              </CommandItem>
              {options.map((option) => (
                <CommandItem key={option.value} value={`${option.label} ${option.value}`} onSelect={() => toggle(option.value)} className='text-xs'>
                  <Check className={cn('mr-2 h-3.5 w-3.5', value?.includes(option.value) ? 'opacity-100' : 'opacity-0')} />
                  <span className='truncate'>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
