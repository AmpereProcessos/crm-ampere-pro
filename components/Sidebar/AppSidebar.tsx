import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import type { TUserSession } from '@/lib/auth/session';
import type { ReactNode } from 'react';
import { BiStats } from 'react-icons/bi';
import { BsBookmarksFill, BsCart, BsFillClipboardDataFill, BsFillFunnelFill } from 'react-icons/bs';
import { FaPercent, FaTag, FaUser } from 'react-icons/fa';
import { MdDashboard, MdOutlineMiscellaneousServices } from 'react-icons/md';
import AppSidebarContentGroup from './AppSidebarContentGroup';
import AppSidebarFooter from './AppSidebarFooter';
import AppSidebarHeader from './AppSidebarHeader';

export type TAppSidebarGroup = {
  group: string;
  items: TAppSidebarItem[];
};

export type TAppSidebarItem = {
  title: string;
  url: string;
  icon: ReactNode;
  activePattern: string;
};

const SIDEBAR_CONFIG: TAppSidebarGroup[] = [
  {
    group: 'Principal',
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: <BiStats className='size-4 shrink-0' aria-hidden='true' />,
        activePattern: '^/$',
      },
      {
        title: 'Oportunidades',
        url: '/comercial/oportunidades',
        icon: <BsFillFunnelFill className='size-4 shrink-0' aria-hidden='true' />,
        activePattern: '^/comercial/oportunidades(?:/id/[^/]+|/proposta/[^/]+)?$',
      },
      {
        title: 'Comissões',
        url: '/comercial/oportunidades/comissoes',
        icon: <FaPercent className='size-4 shrink-0' aria-hidden='true' />,
        activePattern: '^/comercial/oportunidades/comissoes$',
      },
      {
        title: 'Clientes',
        url: '/clientes',
        icon: <FaUser className='size-4 shrink-0' aria-hidden='true' />,
        activePattern: '^/clientes(?:/relatorio)?$',
      },
    ],
  },
  {
    group: 'Composições',
    items: [
      {
        title: 'Kits',
        url: '/kits',
        icon: <FaTag className='size-4 shrink-0' aria-hidden='true' />,
        activePattern: '^/kits$',
      },
      {
        title: 'Planos de assinatura',
        url: '/planos',
        icon: <BsBookmarksFill className='size-4 shrink-0' aria-hidden='true' />,
        activePattern: '^/planos$',
      },
      {
        title: 'Produtos',
        url: '/produtos',
        icon: <BsCart className='size-4 shrink-0' aria-hidden='true' />,
        activePattern: '^/produtos$',
      },
      {
        title: 'Serviços',
        url: '/servicos',
        icon: <MdOutlineMiscellaneousServices className='size-4 shrink-0' aria-hidden='true' />,
        activePattern: '^/servicos$',
      },
    ],
  },
  {
    group: 'Operacional',
    items: [
      {
        title: 'Análises técnicas',
        url: '/operacional/analises-tecnicas',
        icon: <BsFillClipboardDataFill className='size-4 shrink-0' aria-hidden='true' />,
        activePattern: '^/operacional/analises-tecnicas$',
      },
      {
        title: 'Projetos',
        url: '/operacional/projetos',
        icon: <MdDashboard className='size-4 shrink-0' aria-hidden='true' />,
        activePattern: '^/operacional/projetos$',
      },
    ],
  },
];

export function AppSidebar({ session, ...props }: React.ComponentProps<typeof Sidebar> & { session: TUserSession }) {
  return (
    <Sidebar variant='inset' collapsible='icon' {...props}>
      <SidebarHeader>
        <AppSidebarHeader partner={session.user.parceiro} />
      </SidebarHeader>
      <SidebarContent>
        {SIDEBAR_CONFIG.map((group) => (
          <AppSidebarContentGroup key={group.group} group={group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarFooter
          user={{
            id: session.user.id,
            nome: session.user.nome,
            email: session.user.email,
            avatarUrl: session.user.avatar_url,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
