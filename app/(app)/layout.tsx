import AppHeader, { AppHeaderSkeleton } from '@/components/Layouts/AppHeader';
import { AppSidebar } from '@/components/Sidebar/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getCurrentSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { type ReactNode, Suspense } from 'react';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();
  if (!session.user || !session.session) redirect('/auth/signin');

  return (
    <SidebarProvider className='font-Raleway'>
      <AppSidebar session={session} />
      <SidebarInset className='min-w-0 gap-6 overflow-x-hidden overflow-y-auto p-4 md:p-6'>
        <Suspense fallback={<AppHeaderSkeleton />}>
          <AppHeader session={session} />
        </Suspense>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
