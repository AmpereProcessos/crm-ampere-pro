import axios from "axios";
import type { TNotification, TNotificationDTO } from "../schemas/notification.schema";
import type { TCreateNotificationRouteInput, TCreateNotificationRouteOutput, TUpdateNotificationRouteInput, TUpdateNotificationRouteOutput } from "@/app/api/notifications/route";

// type NotifyOnResponsibleChangeParams = {
//   previousResponsible: {
//     id: string
//     nome: string
//   }
//   newResponsible: {
//     id: string
//     nome: string
//     email: string
//   }
//   referenceProject: {
//     id: string
//     nome: string
//     identificador: string
//   }
// }
// export async function notifyOnResponsibleChange({ previousResponsible, newResponsible, referenceProject }: NotifyOnResponsibleChangeParams) {
//   const notificationObject = {
//     remetente: 'SISTEMA',
//     destinatario: newResponsible,
//     projetoReferencia: referenceProject,
//     mensagem: `O projeto em questão acaba de ser transferido a voce por ${previousResponsible.nome}.`,
//     dataInsercao: new Date().toISOString(),
//   }
//   try {
//     await axios.post('/api/notifications', notificationObject)
//     return 'Notificação criada com sucesso !'
//   } catch (error) {
//     throw error
//   }
// }

export async function createNotification({ info }: { info: TCreateNotificationRouteInput }) {
	const { data }: { data: TCreateNotificationRouteOutput } = await axios.post("/api/notifications", info);
	return data.message;
}

export async function editNotification({ id, changes }: { id: string; changes: TUpdateNotificationRouteInput }) {
	const { data }: { data: TUpdateNotificationRouteOutput } = await axios.put(`/api/notifications?id=${id}`, changes);
	return data.message;
}
