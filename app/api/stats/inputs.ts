import { z } from "zod";

// Query params para estatísticas
export const GetStatsQueryParams = z.object({
	after: z.string(),
	before: z.string(),
});
