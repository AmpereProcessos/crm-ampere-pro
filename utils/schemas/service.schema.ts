import { z } from "zod";
import { PricingMethodologyReferenceSchema, TPricingMethodDTO } from "./pricing-method.schema";
import { AuthorSchema } from "./user.schema";
import { PaymentMethodReferenceSchema } from "./payment-methods";

export const GeneralServiceSchema = z.object({
	idParceiro: z
		.string({ required_error: "ID de referência do parceiro não informado.", invalid_type_error: "ID de referência do parceiro não informado." })
		.optional()
		.nullable(),
	idMetodologiaPrecificacao: PricingMethodologyReferenceSchema,
	idsMetodologiasPagamento: z.array(PaymentMethodReferenceSchema),
	ativo: z.boolean({
		required_error: "Status de ativação do serviço não informado.",
		invalid_type_error: "Tipo não válido para o status de ativação do produto.",
	}),
	descricao: z.string({ required_error: "Descrição do serviço não informada.", invalid_type_error: "Tipo não válido para a descrição do serviço." }),
	observacoes: z.string({ required_error: "Observações do serviço não informadas.", invalid_type_error: "Tipo não válido para observações " }),
	garantia: z.number({ required_error: "Garantia do serviço não fornecida.", invalid_type_error: "Tipo não válido para garantia do serviço." }),
	preco: z.number({ required_error: "Preço do serviço não informado.", invalid_type_error: "Tipo não válido para o preço do serviço." }).optional().nullable(),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não fornecida.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime({ message: "Formato inválido para a data de inserção." }),
});

export const InsertServiceSchema = z.object({
	idParceiro: z
		.string({ required_error: "ID de referência do parceiro não informado.", invalid_type_error: "ID de referência do parceiro não informado." })
		.optional()
		.nullable(),
	idMetodologiaPrecificacao: PricingMethodologyReferenceSchema,
	idsMetodologiasPagamento: z.array(PaymentMethodReferenceSchema),
	ativo: z.boolean({
		required_error: "Status de ativação do serviço não informado.",
		invalid_type_error: "Tipo não válido para o status de ativação do produto.",
	}),
	descricao: z.string({ required_error: "Descrição do serviço não informada.", invalid_type_error: "Tipo não válido para a descrição do serviço." }),
	observacoes: z.string({ required_error: "Observações do serviço não informadas.", invalid_type_error: "Tipo não válido para observações " }),
	garantia: z.number({ required_error: "Garantia do serviço não fornecida.", invalid_type_error: "Tipo não válido para garantia do serviço." }),
	preco: z.number({ required_error: "Preço do serviço não informado.", invalid_type_error: "Tipo não válido para o preço do serviço." }).optional().nullable(),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não fornecida.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime({ message: "Formato inválido para a data de inserção." }),
});

export const ServiceEntitySchema = z.object({
	idParceiro: z
		.string({ required_error: "ID de referência do parceiro não informado.", invalid_type_error: "ID de referência do parceiro não informado." })
		.optional()
		.nullable(),
	idMetodologiaPrecificacao: PricingMethodologyReferenceSchema,
	idsMetodologiasPagamento: z.array(PaymentMethodReferenceSchema),
	ativo: z.boolean({
		required_error: "Status de ativação do serviço não informado.",
		invalid_type_error: "Tipo não válido para o status de ativação do produto.",
	}),
	descricao: z.string({ required_error: "Descrição do serviço não informada.", invalid_type_error: "Tipo não válido para a descrição do serviço." }),
	observacoes: z.string({ required_error: "Observações do serviço não informadas.", invalid_type_error: "Tipo não válido para observações " }),
	garantia: z.number({ required_error: "Garantia do serviço não fornecida.", invalid_type_error: "Tipo não válido para garantia do serviço." }),
	preco: z.number({ required_error: "Preço do serviço não informado.", invalid_type_error: "Tipo não válido para o preço do serviço." }).optional().nullable(),
	autor: AuthorSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não fornecida.", invalid_type_error: "Tipo não válido para a data de inserção." })
		.datetime({ message: "Formato inválido para a data de inserção." }),
});
export type TService = z.infer<typeof GeneralServiceSchema>;
export type TServiceWithPricingMethod = TService & { metodologia: TPricingMethodDTO };

export type TServiceDTO = TService & { _id: string };

export type TServiceDTOWithPricingMethod = TServiceDTO & { metodologia: TPricingMethodDTO };
