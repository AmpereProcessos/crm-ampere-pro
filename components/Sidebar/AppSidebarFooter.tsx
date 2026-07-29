'use client';

import NotificationBlock from '@/components/NotificationBlock';
import { ThemeToggle } from '@/components/utils/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { formatNameAsInitials } from '@/lib/methods/formatting';
import { ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { IoMdSettings } from 'react-icons/io';
import { MdLogout } from 'react-icons/md';

type AppSidebarFooterProps = {
  user: {
    id: string;
    nome: string;
    email: string;
    avatarUrl?: string | null;
  };
};

export default function AppSidebarFooter({ user }: AppSidebarFooterProps) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem className='flex min-h-10 items-center justify-center gap-1 group-data-[collapsible=icon]:flex-col'>
        <NotificationBlock subscriberId={user.id} />
        <ThemeToggle />
      </SidebarMenuItem>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center'
            >
              <Avatar className='size-8 shrink-0 rounded-lg'>
                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.nome} className='object-cover' />
                <AvatarFallback className='rounded-lg text-xs'>{formatNameAsInitials(user.nome)}</AvatarFallback>
              </Avatar>
              <div className='grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
                <span className='truncate font-medium'>{user.nome}</span>
                <span className='truncate text-xs text-muted-foreground'>{user.email}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4 group-data-[collapsible=icon]:hidden' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='font-normal'>
              <div className='flex min-w-0 items-center gap-2'>
                <Avatar className='size-8 rounded-lg'>
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.nome} className='object-cover' />
                  <AvatarFallback className='rounded-lg text-xs'>{formatNameAsInitials(user.nome)}</AvatarFallback>
                </Avatar>
                <div className='grid min-w-0 flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{user.nome}</span>
                  <span className='truncate text-xs text-muted-foreground'>{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href='/configuracoes'>
                  <IoMdSettings className='size-4 shrink-0' aria-hidden='true' />
                  Configurações
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href='/api/auth/logout' prefetch={false}>
                <MdLogout className='size-4 shrink-0' aria-hidden='true' />
                Sair
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
