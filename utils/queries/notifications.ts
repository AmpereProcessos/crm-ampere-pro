import axios from "axios";
import { TNotificationDTO } from "../schemas/notification.schema";
import { useQuery } from "@tanstack/react-query";

async function fetchNotificationsByRecipientId({ recipientId }: { recipientId: string }) {
	try {
		const { data } = await axios.get(`/api/notifications?recipientId=${recipientId}`);
		return data.data as TNotificationDTO[];
	} catch (error) {
		throw error;
	}
}

export function useNotificationsByRecipient({ recipientId }: { recipientId: string }) {
	return useQuery({
		queryKey: ["notifications-by-recipient", recipientId],
		queryFn: async () => await fetchNotificationsByRecipientId({ recipientId }),
		gcTime: 1000 * 60 * 5, // 5 minutes
	});
}

async function fetchNotificationsByOpportunityId({ opportunityId }: { opportunityId: string }) {
	try {
		const { data } = await axios.get(`/api/notifications?opportunityId=${opportunityId}`);
		return data.data as TNotificationDTO;
	} catch (error) {
		throw error;
	}
}

export function useNotificationsByOpportunity({ opportunityId }: { opportunityId: string }) {
	return useQuery({
		queryKey: ["notifications-by-opportunity", opportunityId],
		queryFn: async () => await fetchNotificationsByOpportunityId({ opportunityId }),
	});
}
