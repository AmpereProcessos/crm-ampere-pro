import type { TUserSession } from '@/lib/auth/session';
import { NOVU_APPLICATION_IDENTIFIER } from '@/services/novu/config';
import { Inbox } from '@novu/nextjs';
import { dark } from '@novu/react/themes';

import type { ReactAppearance } from '@novu/react/dist/esm/utils/types';
import { useTheme } from 'next-themes';

function NotificationBlock({ session }: { session: TUserSession }) {
  const { resolvedTheme } = useTheme();
  const appearance: ReactAppearance = {
    baseTheme: resolvedTheme === 'dark' ? dark : undefined,
    variables: {
      fontSize: '14px',
      borderRadius: '8px',
      colorPrimary: 'hsl(var(--primary))',
      colorPrimaryForeground: 'hsl(var(--primary-foreground))',
      colorBackground: 'hsl(var(--background))',
      colorForeground: 'hsl(var(--foreground))',
      colorSecondary: 'hsl(var(--secondary))',
      colorSecondaryForeground: 'hsl(var(--secondary-foreground))',
      colorNeutral: 'hsl(var(--border))',
      colorShadow: 'hsl(var(--shadow))',
      colorRing: 'hsl(var(--ring))',
    },
    elements: {
      inbox__popoverContent: 'w-80 h-112 max-h-[60vh]',
      bellIcon: 'text-primary',
    },
  };
  return (
    <Inbox
      appearance={appearance}
      applicationIdentifier={NOVU_APPLICATION_IDENTIFIER}
      localization={{
        'inbox.filters.dropdownOptions.archived': 'Arquivadas',
        'inbox.filters.dropdownOptions.default': 'Lidas e não lidas',
        'inbox.filters.dropdownOptions.unread': 'Não lidas',
        'inbox.filters.labels.archived': 'Arquivadas',
        'inbox.filters.labels.default': 'Lidas e não lidas',

        'inbox.filters.labels.unread': 'Não lidas',

        locale: 'pt-BR',
        'notification.actions.archive.tooltip': 'Arquivar',

        // Individual notification actions
        'notification.actions.read.tooltip': 'Marcar como lida',
        'notification.actions.unarchive.tooltip': 'Desarquivar',
        'notification.actions.unread.tooltip': 'Marcar como não lida',
        'notifications.actions.archiveAll': 'Arquivar todas',
        'notifications.actions.archiveRead': 'Arquivar lidas',
        'notifications.actions.readAll': 'Marcar todas como lidas',

        'notifications.emptyNotice': 'Não há notificações.',
        'notifications.newNotifications': ({ notificationCount }: { notificationCount: number }) =>
          `${notificationCount > 99 ? '99+' : notificationCount} new ${notificationCount === 1 ? 'notification' : 'notifications'}`,
        'preferences.emptyNotice': 'Não há preferências específicas para esta notificação.',
        'preferences.global': 'Preferências globais',

        // Preferences section
        'preferences.title': 'Preferências',
        'preferences.workflow.disabled.notice':
          'Contate o administrador para habilitar a gerenciamento de assinaturas para esta notificação crítica.',
        'preferences.workflow.disabled.tooltip': 'Contate o administrador para editar',
      }}
      subscriber={session.user.id}
    />
  );
}
export default NotificationBlock;
