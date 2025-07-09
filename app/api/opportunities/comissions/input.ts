import { z } from "zod";

export const GetComissionsQueryParams = z.object({
	userIds: z
		.string({ invalid_type_error: "O parâmetro de usuários deve ser uma string" })
		.optional()
		.nullable()
		.transform((val) => val?.split(",")),
	after: z.string({ required_error: "A data de início é obrigatória", invalid_type_error: "A data de início deve ser uma string" }).datetime({
		message: "A data de início deve ser uma data válida",
	}),
	before: z.string({ required_error: "A data de término é obrigatória", invalid_type_error: "A data de término deve ser uma string" }).datetime({
		message: "A data de término deve ser uma data válida",
	}),
});

export const BulkUpdateComissionsInputSchema = z.array(
	z.object({
		projectId: z.string({ required_error: "O ID do projeto é obrigatório", invalid_type_error: "O ID do projeto deve ser uma string" }),
	}),
);
