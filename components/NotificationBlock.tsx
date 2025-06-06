import type { TUserSession } from "@/lib/auth/session";
import { NOVU_APPLICATION_IDENTIFIER } from "@/services/novu/config";
import { Inbox } from "@novu/nextjs";
function NotificationBlock({ sidebarExtended, session }: { sidebarExtended: boolean; session: TUserSession }) {
	return (
		<div className="flex items-center justify-center w-full p-1" style={{ position: "relative" }}>
			<div className="relative">
				<Inbox
					applicationIdentifier={NOVU_APPLICATION_IDENTIFIER}
					subscriber={session.user.id}
					localization={{
						"inbox.filters.dropdownOptions.unread": "Não lidas",
						"inbox.filters.dropdownOptions.default": "Lidas e não lidas",
						"inbox.filters.dropdownOptions.archived": "Arquivadas",

						"inbox.filters.labels.unread": "Não lidas",
						"inbox.filters.labels.default": "Lidas e não lidas",
						"inbox.filters.labels.archived": "Arquivadas",

						"notifications.emptyNotice": "Não há notificações.",
						"notifications.actions.readAll": "Marcar todas como lidas",
						"notifications.actions.archiveAll": "Arquivar todas",
						"notifications.actions.archiveRead": "Arquivar lidas",
						"notifications.newNotifications": ({ notificationCount }: { notificationCount: number }) =>
							`${notificationCount > 99 ? "99+" : notificationCount} new ${notificationCount === 1 ? "notification" : "notifications"}`,

						// Individual notification actions
						"notification.actions.read.tooltip": "Marcar como lida",
						"notification.actions.unread.tooltip": "Marcar como não lida",
						"notification.actions.archive.tooltip": "Arquivar",
						"notification.actions.unarchive.tooltip": "Desarquivar",

						// Preferences section
						"preferences.title": "Preferências",
						"preferences.emptyNotice": "Não há preferências específicas para esta notificação.",
						"preferences.global": "Preferências globais",
						"preferences.workflow.disabled.notice": "Contate o administrador para habilitar a gerenciamento de assinaturas para esta notificação crítica.",
						"preferences.workflow.disabled.tooltip": "Contate o administrador para editar",

						locale: "pt-BR",
					}}
					appearance={{
						variables: {
							colorPrimary: "#264653",
							colorPrimaryForeground: "#ffffff",
							fontSize: "14px",
							borderRadius: "8px",
						},
					}}
				/>
			</div>
		</div>
	);
}
export default NotificationBlock;
