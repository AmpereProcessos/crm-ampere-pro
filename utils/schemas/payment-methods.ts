import { z } from "zod";
import { AuthorSchema } from "./user.schema";

export const FractionnementItemSchema = z.object({
	porcentagem: z.number({
		required_error: "Porcentagem do item de fracionamento não informada.",
		invalid_type_error: "Tipo não válido para porcentagem do item de fracionamento.",
	}),
	metodo: z.string({
		required_error: "Método do item de fracionamento não informado.",
		invalid_type_error: "Tipo não válido para o método do item de fracionamento.",
	}),
	maximoParcelas: z.number({
		required_error: "Número máximo de parcelas do item de fracionamento não informado.",
		invalid_type_error: "Tipo não válido para o número máximo de parcelas do item de fracionamento.",
	}),
	parcelas: z
		.number({
			required_error: "Número de parcelas do item de fracionamento não informado.",
			invalid_type_error: "Tipo não válido para o número de parcelas do item de fracionamento.",
		})
		.optional()
		.nullable(),
	taxaUnica: z.number({
		required_error: "Taxa única do item de fracionamento não informada.",
		invalid_type_error: "Tipo não válido para a taxa única do item de fracionamento.",
	}),
	taxaJuros: z.number({
		required_error: "Taxa de juros do item de fracionamento não informada.",
		invalid_type_error: "Tipo não válido para a taxa de juros do item de fracionamento.",
	}),
	modalidade: z
		.union([z.literal("SIMPLES"), z.literal("COMPOSTOS")])
		.nullable()
		.optional(),
});
export type TFractionnementItem = z.infer<typeof FractionnementItemSchema>;
export const GeneralPaymentMethodSchema = z.object({
	nome: z.string(),
	ativo: z.boolean(),
	descricao: z.string(),
	idParceiro: z.string().optional().nullable(),
	fracionamento: z.array(FractionnementItemSchema),
	autor: AuthorSchema,
	dataInsercao: z.string().datetime(),
});

export const InsertPaymentMethodSchema = z.object({
	nome: z
		.string({
			required_error: "Nome da metodologia de pagamento não informado.",
			invalid_type_error: "Tipo não válido para o nome da metodologia de pagamento.",
		})
		.min(2, "Por favor, dê um título de ao menos 2 letras para o método de pagamento."),
	ativo: z.boolean({
		required_error: "Estado de ativação do método não informado.",
		invalid_type_error: "Tipo não válido para o estado de ativação do método.",
	}),
	idParceiro: z
		.string({ required_error: "Referência a parceiro não informada.", invalid_type_error: "Tipo não válido para referência a parceiro." })
		.optional()
		.nullable(),
	descricao: z.string({
		required_error: "Descrição da metodologia de pagamento não informada.",
		invalid_type_error: "Tipo não válido para a descrição da metodologia de pagamento.",
	}),
	fracionamento: z.array(FractionnementItemSchema).min(1, "Adicione ao menos um item de fracionamento."),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção do método não informada.", invalid_type_error: "Tipo não válido para data de inserção do método." })
		.datetime(),
});

const PaymentMethodEntitySchema = z.object({
	ativo: z.boolean(),
	descricao: z.string(),
	idParceiro: z.string().optional().nullable(),
	fracionamento: z.array(FractionnementItemSchema),
	autor: AuthorSchema,
	dataInsercao: z.string().datetime(),
});

export type TPaymentMethod = z.infer<typeof GeneralPaymentMethodSchema>;

export type TPaymentMethodEntity = z.infer<typeof PaymentMethodEntitySchema>;

export type TPaymentMethodDTO = TPaymentMethod & { _id: string };

export const PaymentMethodReferenceSchema = z.string({
	required_error: "Referência do método de pagamento não informada.",
	invalid_type_error: "Tipo não válido para referência do método de pagamento.",
});
