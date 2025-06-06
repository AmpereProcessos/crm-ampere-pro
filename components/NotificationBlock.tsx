import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { MdNotifications, MdNotificationsActive } from "react-icons/md";
import Notifications from "./Modals/Notifications";
import { useNotificationsByRecipient } from "@/utils/queries/notifications";
import type { TNotificationDTO } from "@/utils/schemas/notification.schema";
import type { TUserSession } from "@/lib/auth/session";

function NotificationBlock({ sidebarExtended, session }: { sidebarExtended: boolean; session: TUserSession }) {
	const { data: notifications } = useNotificationsByRecipient({ recipientId: session.user.id });
	const [notificationModalIsOpen, setNotificationModalIsOpen] = useState<boolean>(false);
	function countUnreadNotifications(notifications?: TNotificationDTO[]) {
		if (!notifications) return 0;
		// Filtering notifications by the unexistence of the userId in the recebimentos list of ids
		const unreadArr = notifications.filter((n) => !n.recebimentos.map((r) => r.id).includes(session.user.id));
		return unreadArr.length;
	}
	useEffect(() => {
		if (notificationModalIsOpen) setNotificationModalIsOpen((prev) => !prev);
	}, [sidebarExtended]);
	return (
		<>
			<button
				type="button"
				onClick={() => {
					setNotificationModalIsOpen((prev) => !prev);
				}}
				className={"relative mb-0 flex cursor-pointer items-center justify-center rounded p-2 duration-300  ease-in  hover:bg-blue-100 md:mb-2"}
			>
				{countUnreadNotifications(notifications) > 0 ? (
					<>
						<MdNotificationsActive style={{ fontSize: "20px", color: "rgb(239,68,68)" }} />
						<div className="absolute top-1 ml-6 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-red-500  text-center text-xs font-bold text-white">
							<p className="h-full w-full">{countUnreadNotifications(notifications)}</p>
						</div>
					</>
				) : (
					<MdNotifications style={{ fontSize: "20px", color: "#264653" }} />
				)}
			</button>
			{notificationModalIsOpen ? (
				<Notifications notifications={notifications} session={session} sidebarExtended={sidebarExtended} closeModal={() => setNotificationModalIsOpen(false)} />
			) : null}
		</>
	);
}

export default NotificationBlock;
