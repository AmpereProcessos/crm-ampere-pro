import { Raleway } from 'next/font/google';
import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

const raleway = Raleway({
  variable: '--font-raleway',
  subsets: ['cyrillic', 'cyrillic-ext'],
});

function FullScreenWrapper({ children }: PropsWithChildren) {
  return (
    <div
      className={cn(
        'flex min-h-[100vh] w-screen max-w-full flex-col bg-[#fff] font-Inter antialiased xl:min-h-[100vh]',
        raleway.variable
      )}
    >
      <div className="flex min-h-[100%] grow">
        <div className="flex w-full grow flex-col">{children}</div>
      </div>
    </div>
  );
}

export default FullScreenWrapper;
