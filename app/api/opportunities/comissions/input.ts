import { z } from "zod";

export const GetComissionsQueryParams = z.object({
	after: z.string({ required_error: "A data de início é obrigatória", invalid_type_error: "A data de início deve ser uma string" }),
	before: z.string({ required_error: "A data de término é obrigatória", invalid_type_error: "A data de término deve ser uma string" }),
});

export const BulkUpdateComissionsInputSchema = z.array(
	z.object({
		projectId: z.string({ required_error: "O ID do projeto é obrigatório", invalid_type_error: "O ID do projeto deve ser uma string" }),
	}),
);
