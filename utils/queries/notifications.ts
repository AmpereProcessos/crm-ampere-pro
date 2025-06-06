import axios from "axios";
import type { TNotificationDTO } from "../schemas/notification.schema";
import { useQuery } from "@tanstack/react-query";
import type { TGetNotificationsRouteOutput } from "@/app/api/notifications/route";

async function fetchNotificationsByRecipientId({ recipientId }: { recipientId: string }) {
	const { data }: { data: TGetNotificationsRouteOutput } = await axios.get(`/api/notifications?recipientId=${recipientId}`);
	return data.data.byRecipientId;
}

export function useNotificationsByRecipient({ recipientId }: { recipientId: string }) {
	return useQuery({
		queryKey: ["notifications-by-recipient", recipientId],
		queryFn: async () => await fetchNotificationsByRecipientId({ recipientId }),
		gcTime: 1000 * 60 * 5, // 5 minutes
	});
}

async function fetchNotificationsByOpportunityId({ opportunityId }: { opportunityId: string }) {
	const { data }: { data: TGetNotificationsRouteOutput } = await axios.get(`/api/notifications?opportunityId=${opportunityId}`);
	return data.data.byOpportunityId;
}

export function useNotificationsByOpportunity({ opportunityId }: { opportunityId: string }) {
	return useQuery({
		queryKey: ["notifications-by-opportunity", opportunityId],
		queryFn: async () => await fetchNotificationsByOpportunityId({ opportunityId }),
	});
}
