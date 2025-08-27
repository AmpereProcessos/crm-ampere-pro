import { cn } from '@/lib/utils';
import { Raleway } from 'next/font/google';
import type { PropsWithChildren } from 'react';

const raleway = Raleway({
  variable: '--font-raleway',
  subsets: ['latin'],
});

function FullScreenWrapper({ children }: PropsWithChildren) {
  return (
    <div className={cn('flex min-h-screen w-screen max-w-full flex-col bg-background font-Inter antialiased xl:min-h-screen', raleway.variable)}>
      <div className='flex min-h-full grow'>
        <div className='flex w-full grow flex-col'>{children}</div>
      </div>
    </div>
  );
}

export default FullScreenWrapper;
