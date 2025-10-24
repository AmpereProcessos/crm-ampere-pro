import { TNotification } from "@/utils/schemas/notification.schema";
import { Collection, ObjectId } from "mongodb";

type GetNotificationByIdParams = {
	collection: Collection<TNotification>;
	id: string;
};
export async function getNotificationById({ collection, id }: GetNotificationByIdParams) {
	try {
		const notification = await collection.findOne({ _id: new ObjectId(id) });

		return notification;
	} catch (error) {
		throw error;
	}
}

type GetNotificationByRecipientIdParams = {
	collection: Collection<TNotification>;
	recipientId: string;
};
export async function getNotificationByRecipientId({ collection, recipientId }: GetNotificationByRecipientIdParams) {
	try {
		const notifications = await collection
			.find({ "destinatarios.id": recipientId }, { sort: { "recebimentos.dataLeitura": 1 } })
			.limit(30)
			.toArray();
		return notifications;
	} catch (error) {
		throw error;
	}
}
type GetNotificationByOpportunityIdParams = {
	collection: Collection<TNotification>;
	opportunityId: string;
};
export async function getNotificationByOpportunityId({ collection, opportunityId }: GetNotificationByOpportunityIdParams) {
	try {
		const notifications = await collection.find({ "oportunidade.id": opportunityId }).toArray();
		return notifications;
	} catch (error) {
		throw error;
	}
}
