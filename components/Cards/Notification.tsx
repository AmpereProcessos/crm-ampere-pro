import type { TNotificationDTO } from "@/utils/schemas/notification.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import React, { use } from "react";
import { BsCalendarCheck, BsCalendarPlus, BsCheck2, BsCheck2All, BsCheckAll, BsCode, BsFillCalendar3Fill } from "react-icons/bs";
import { FaRobot, FaUserAlt } from "react-icons/fa";
import Avatar from "../utils/Avatar";
import { formatDateAsLocale, formatNameAsInitials } from "@/lib/methods/formatting";
import { editNotification } from "@/utils/mutations/notifications";
import { useMutationWithFeedback } from "@/utils/mutations/general-hook";
import Link from "next/link";
import type { TUserSession } from "@/lib/auth/session";

function getHeaderMessage({ sender }: { sender: TNotificationDTO["remetente"] }) {
	if (!sender.id) return <h1 className="text-xs font-black leading-none tracking-tight">AUTOMAÇÃO</h1>;
	return (
		<h1 className="text-xs font-black leading-none tracking-tight">
			<strong className="text-cyan-500">{sender.nome}</strong> DIZ:{" "}
		</h1>
	);
}

function getSenderFlag(sender: TNotificationDTO["remetente"]) {
	if (!sender.id)
		return (
			<div className="flex h-[25px] min-h-[25px] w-[25px] min-w-[25px] items-center justify-center rounded-full border border-black p-1">
				<FaRobot />
			</div>
		);

	return <Avatar width={25} height={25} url={sender.avatar_url || undefined} fallback={formatNameAsInitials(sender.nome)} />;
}

type NotificationCardProps = {
	notification: TNotificationDTO;
	session: TUserSession;
};
function NotificationCard({ notification, session }: NotificationCardProps) {
	const queryClient = useQueryClient();
	const userReadingInformation = notification.recebimentos.find((r) => r.id === session.user.id);

	async function updateNotification({ notification, read, user }: { notification: TNotificationDTO; read: boolean; user: TUserSession["user"] }) {
		// when updating to notification as read
		if (!read) {
			// Adding user receipt confirmation to list
			const userReceipt: TNotificationDTO["recebimentos"][number] = {
				id: user.id,
				nome: user.nome,
				avatar_url: user.avatar_url,
				dataLeitura: new Date().toISOString(),
			};
			const receiptConfirmations = [...notification.recebimentos];
			receiptConfirmations.push(userReceipt);
			await editNotification({ id: notification._id, changes: { recebimentos: receiptConfirmations } });
			return "Notificação atualizada com sucesso !";
		}
		// removing user receipt confirmation from list
		const filteredConfirmations = [...notification.recebimentos].filter((r) => r.id !== session.user.id);
		await editNotification({ id: notification._id, changes: { recebimentos: filteredConfirmations } });
		return "Notificação atualizada com sucesso !";
	}
	const { mutate: handleUpdateNotification, isPending } = useMutationWithFeedback({
		mutationKey: ["update-notification", notification._id],
		mutationFn: updateNotification,
		queryClient: queryClient,
		affectedQueryKey: ["notifications-by-recipient", session.user.id],
	});
	return (
		<div className={`flex w-full flex-col gap-2 rounded border ${userReadingInformation ? "border-green-600" : "border-gray-500"} p-3`}>
			<div className="flex w-full items-center gap-1">
				{getSenderFlag(notification.remetente)}
				{getHeaderMessage({ sender: notification.remetente })}
			</div>
			{notification.oportunidade.id ? (
				<Link href={`/comercial/oportunidades/id/${notification.oportunidade.id}`}>
					<div className="flex items-center gap-1">
						<BsCode color="#fead41" size={15} />
						<p className="text-[0.65rem] font-medium uppercase tracking-tight text-gray-500 duration-300 ease-in-out hover:text-cyan-500">{notification.oportunidade.nome}</p>
					</div>
				</Link>
			) : null}
			<div className="flex w-full grow flex-col">
				<h1 className="rounded-md border border-gray-300 px-2 py-1 text-[0.65rem] font-medium tracking-tight">{notification.mensagem}</h1>
			</div>
			<div className="flex w-full items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<div className={"flex items-center gap-1"}>
						<BsCalendarPlus />
						<p className="text-[0.65rem] font-medium text-gray-500">{formatDateAsLocale(notification.dataInsercao, true)}</p>
					</div>
					{userReadingInformation ? (
						<div className={"flex items-center gap-1"}>
							<BsCalendarCheck color="rgb(34,197,94)" />
							<p className="text-[0.65rem] font-medium text-gray-500">{formatDateAsLocale(userReadingInformation.dataLeitura, true)}</p>
						</div>
					) : null}
				</div>
				{userReadingInformation ? (
					<button
						type="button"
						disabled={isPending}
						// @ts-ignore
						onClick={() => handleUpdateNotification({ notification: notification, read: false, user: session.user })}
						className="flex items-center justify-center text-green-500 duration-300 ease-in-out disabled:text-gray-500 enabled:hover:text-gray-500"
					>
						<BsCheck2All />
					</button>
				) : (
					<button
						type="button"
						disabled={isPending}
						// @ts-ignore
						onClick={() => handleUpdateNotification({ notification: notification, read: true, user: session.user })}
						className="flex items-center justify-center text-gray-500 duration-300 ease-in-out disabled:text-gray-500 enabled:hover:text-green-500"
					>
						<BsCheck2 />
					</button>
				)}
			</div>
			{/* <div className="flex w-full">
        <div className="flex w-[20%] items-start justify-center"></div>
        <div className="flex w-[80%] flex-col">
          <div className="flex w-full items-center gap-1 text-xs italic text-gray-800">
            <BsFillCalendar3Fill style={{ color: '#fead41' }} />
            <p className="align-middle">{dayjs(notification.dataInsercao).format('DD/MM/YYYY HH:mm')}</p>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-end pt-1">
        <button
          onClick={() => setAsRead()}
          disabled={!!isRead}
          className={`${isRead ? 'text-green-500' : 'text-gray-600 hover:text-blue-500'}  duration-300 hover:scale-110 `}
        >
          <BsCheckAll
            style={{
              fontSize: '20px',
            }}
          />
        </button>
      </div> */}
		</div>
	);
}

export default NotificationCard;
