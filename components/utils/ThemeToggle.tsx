'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

type ThemeToggleProps = {
  className?: string;
};
export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Button variant='ghost' onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} size={'fit'} className='p-2'>
        {theme === 'light' ? <SunIcon className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' /> : <MoonIcon className='w-3.5 h-3.5 min-w-3.5 min-h-3.5' />}
      </Button>
    </div>
  );
};
