import { z } from "zod";

// Query params para busca de notifications
export const GetNotificationsQueryParams = z.object({
	id: z.string().optional().nullable(),
	recipientId: z.string().optional().nullable(),
	opportunityId: z.string().optional().nullable(),
});
