import { z } from "zod";

// Query params para busca de clientes
export const GetClientsQueryParams = z.object({
	id: z.string().optional().nullable(),
	author: z.string().optional().nullable(),
});

// Query params para busca de clientes similares
export const GetSimilarClientsQueryParams = z.object({
	cpfCnpj: z.string().optional().nullable(),
	phoneNumber: z.string().optional().nullable(),
	email: z.string().optional().nullable(),
});

// Query params para busca por filtros personalizados
export const GetClientsByFiltersQueryParams = z.object({
	after: z.string({
		required_error: "Parâmetros de período não fornecidos ou inválidos.",
		invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
	}),
	before: z.string({
		required_error: "Parâmetros de período não fornecidos ou inválidos.",
		invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
	}),
	page: z.string({
		required_error: "Parâmetro de páginação não informado.",
		invalid_type_error: "Parâmetro de páginação deve ser uma string.",
	}),
});
