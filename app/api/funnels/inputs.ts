import { z } from "zod";

export const GetFunnelQuerySchema = z.object({
	id: z.string().optional(),
});

export type GetFunnelQuery = z.infer<typeof GetFunnelQuerySchema>;
