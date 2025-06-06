import type { GeneralStatsFiltersSchema } from "@/utils/schemas/stats.schema";
import { z } from "zod";

export const QueryDatesSchema = z.object({
	after: z
		.string({
			required_error: "Parâmetros de período não fornecidos ou inválidos.",
			invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
		})
		.datetime({ message: "Tipo inválido para parâmetro de período." }),
	before: z
		.string({
			required_error: "Parâmetros de período não fornecidos ou inválidos.",
			invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
		})
		.datetime({ message: "Tipo inválido para parâmetro de período." }),
});

export type GetSalesSDRQuery = z.infer<typeof QueryDatesSchema>;
export type PostSalesSDRBody = z.infer<typeof GeneralStatsFiltersSchema>;
