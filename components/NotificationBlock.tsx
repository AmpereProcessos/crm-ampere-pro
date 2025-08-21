import { Inbox } from '@novu/nextjs';
import type { ReactAppearance } from '@novu/react/dist/esm/utils/types';
import type { TUserSession } from '@/lib/auth/session';
import { NOVU_APPLICATION_IDENTIFIER } from '@/services/novu/config';

function NotificationBlock({ session }: { session: TUserSession }) {
  const appearance: ReactAppearance = {
    elements: {
      inbox__popoverContent: 'w-80 h-[28rem]',
    },
    variables: {
      borderRadius: '8px',
      colorPrimary: '#15599a',
      colorPrimaryForeground: '#ffffff',
      fontSize: '14px',
    },
  };
  return (
    <div
      className="flex w-full items-center justify-center p-1"
      style={{ position: 'relative' }}
    >
      <div className="relative">
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
            'notifications.newNotifications': ({
              notificationCount,
            }: {
              notificationCount: number;
            }) =>
              `${notificationCount > 99 ? '99+' : notificationCount} new ${notificationCount === 1 ? 'notification' : 'notifications'}`,
            'preferences.emptyNotice':
              'Não há preferências específicas para esta notificação.',
            'preferences.global': 'Preferências globais',

            // Preferences section
            'preferences.title': 'Preferências',
            'preferences.workflow.disabled.notice':
              'Contate o administrador para habilitar a gerenciamento de assinaturas para esta notificação crítica.',
            'preferences.workflow.disabled.tooltip':
              'Contate o administrador para editar',
          }}
          subscriber={session.user.id}
        />
      </div>
    </div>
  );
}
export default NotificationBlock;
