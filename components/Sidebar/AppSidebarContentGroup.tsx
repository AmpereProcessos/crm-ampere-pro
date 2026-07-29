'use client';

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { TAppSidebarGroup } from './AppSidebar';

export default function AppSidebarContentGroup({ group }: { group: TAppSidebarGroup }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const currentPathname = pathname ?? '/';

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
      <SidebarMenu>
        {group.items.map((item) => (
          <SidebarMenuItem key={item.title}>
						<SidebarMenuButton tooltip={item.title} isActive={new RegExp(item.activePattern).test(currentPathname)} asChild>
              <Link href={item.url} onClick={() => (isMobile ? setOpenMobile(false) : undefined)}>
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
