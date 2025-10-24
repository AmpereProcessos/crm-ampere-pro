import { ObjectId } from "mongodb";
import z from "zod";
import { TUserEntity, TUserDTO } from "./user.schema";

const LocationSchema = z.object({
	cep: z.string().optional().nullable(),
	uf: z.string({
		required_error: "UF de localização não informada.",
		invalid_type_error: "Tipo não válido para a UF de localização.",
	}),
	cidade: z.string({
		required_error: "Cidade de localização não informada.",
		invalid_type_error: "Tipo não válido para a cidade de localização.",
	}),
	bairro: z.string().optional().nullable(),
	endereco: z.string().optional().nullable(),
	numeroOuIdentificador: z.string().optional().nullable(),
	complemento: z.string().optional().nullable(),
	// distancia: z.number().optional().nullable(),
});
const SignaturePlanSchema = z.object({
	id: z.string({ required_error: "ID do plano não informado.", invalid_type_error: "Tipo não válido para o ID do plano." }),
	nome: z.string({ required_error: "Nome do plano não informado.", invalid_type_error: "Tipo não válido para o nome do plano." }),
	dataVencimento: z
		.string({ required_error: "Data de vencimento do plano não informada.", invalid_type_error: "Tipo não válido para data de vencimento do plano." })
		.datetime()
		.optional()
		.nullable(),
	dataCobranca: z
		.string({
			required_error: "Data de cobrança não fornecida.",
			invalid_type_error: "Tipo não válido para data de cobrança do plano.",
		})
		.optional()
		.nullable(),
});
const PartnerMediaSchema = z.object(
	{
		instagram: z.string({ required_error: "Instagram não fornecido.", invalid_type_error: "Tipo não válido para Instagram." }),
		website: z.string({ required_error: "Link do website não fornecido.", invalid_type_error: "Tipo não válido para link do website." }),
		facebook: z.string({ required_error: "Facebook não fornecido.", invalid_type_error: "Tipo não válido para Facebook." }),
	},
	{ required_error: "Informações de mídias sociais não fornecidas.", invalid_type_error: "Tipo não válido para informações de mídias sociais." },
);
const GeneralPartnerSchema = z.object({
	nome: z.string(),
	ativo: z.boolean(),
	cpfCnpj: z.string(),
	logo_url: z.string().optional().nullable(),
	descricao: z.string(),
	contatos: z.object({
		telefonePrimario: z.string(),
		telefoneSecundario: z.string().optional().nullable(),
		email: z.string(),
	}),
	slogan: z.string({ required_error: "Slogan da empresa não fornecido.", invalid_type_error: "Tipo não válido para slogan da empresa." }),
	midias: PartnerMediaSchema,
	localizacao: LocationSchema,
	dataInsercao: z.string().datetime(),
});

export const InsertPartnerSchema = z.object({
	nome: z
		.string({ required_error: "Nome necessário para criação do parceiro.", invalid_type_error: "Tipo não válido para o nome do parceiro." })
		.min(2, "Preencha um nome de ao menos 2 letras para o parceiro."),
	ativo: z.boolean({
		required_error: "Status de ativação do parceiro não informada.",
		invalid_type_error: "Tipo não válido para o status de ativação do produto.",
	}),
	cpfCnpj: z
		.string({
			required_error: "CPF ou CNPJ necessário para criação do parceiro.",
			invalid_type_error: "Tipo não válido para o CPF ou CNPJ do parceiro.",
		})
		.min(14, "Preencha um CPF ou CNPJ válido."),
	logo_url: z.string().optional().nullable(),
	descricao: z.string({
		required_error: "Descrição de apresentação do parceiro não informada.",
		invalid_type_error: "Tipo não válido para a descrição de apresentação do parceiro.",
	}),
	contatos: z.object({
		telefonePrimario: z
			.string({
				required_error: "Telefone primário necessário para criação do parceiro.",
				invalid_type_error: "Tipo não válido para o telefone primário,",
			})
			.min(14, "Preencha um telefone válido."),
		telefoneSecundario: z.string().optional().nullable(),
		email: z.string({
			required_error: "Email necessário para criação do parceiro.",
			invalid_type_error: "Tipo não válido para o email do parceiro.",
		}),
	}),
	slogan: z.string({ required_error: "Slogan da empresa não fornecido.", invalid_type_error: "Tipo não válido para slogan da empresa." }),
	midias: PartnerMediaSchema,
	localizacao: LocationSchema,
	dataInsercao: z
		.string({ required_error: "Data de inserção não informada.", invalid_type_error: "Tipo não válido para data de inserção." })
		.datetime({ message: "Tipo inválido para a data de inserção." }),
});

export const UpdateOwnPartnerSchema = z.object({
	nome: z
		.string({ required_error: "Nome necessário para criação do parceiro.", invalid_type_error: "Tipo não válido para o nome do parceiro." })
		.min(2, "Preencha um nome de ao menos 2 letras para o parceiro."),
	cpfCnpj: z
		.string({
			required_error: "CPF ou CNPJ necessário para criação do parceiro.",
			invalid_type_error: "Tipo não válido para o CPF ou CNPJ do parceiro.",
		})
		.min(14, "Preencha um CPF ou CNPJ válido."),
	logo_url: z.string().optional().nullable(),
	descricao: z.string({
		required_error: "Descrição de apresentação do parceiro não informada.",
		invalid_type_error: "Tipo não válido para a descrição de apresentação do parceiro.",
	}),
	contatos: z.object({
		telefonePrimario: z
			.string({
				required_error: "Telefone primário necessário para criação do parceiro.",
				invalid_type_error: "Tipo não válido para o telefone primário,",
			})
			.min(14, "Preencha um telefone válido."),
		telefoneSecundario: z.string().optional().nullable(),
		email: z.string({
			required_error: "Email necessário para criação do parceiro.",
			invalid_type_error: "Tipo não válido para o email do parceiro.",
		}),
	}),
	slogan: z.string({ required_error: "Slogan da empresa não fornecido.", invalid_type_error: "Tipo não válido para slogan da empresa." }),
	midias: PartnerMediaSchema,
	localizacao: LocationSchema,
});
const PartnerEntitySchema = z.object({
	_id: z.instanceof(ObjectId),
	nome: z.string(),
	ativo: z.boolean(),
	cpfCnpj: z.string(),
	logo_url: z.string().optional().nullable(),
	descricao: z.string(),
	contatos: z.object({
		telefonePrimario: z.string(),
		telefoneSecundario: z.string().optional().nullable(),
		email: z.string(),
	}),
	slogan: z.string({ required_error: "Slogan da empresa não fornecido.", invalid_type_error: "Tipo não válido para slogan da empresa." }),
	midias: PartnerMediaSchema,
	localizacao: LocationSchema,
	dataInsercao: z.string(),
});

export type TPartner = z.infer<typeof GeneralPartnerSchema>;

export type TPartnerEntity = z.infer<typeof PartnerEntitySchema>;

export type TPartnerDTO = TPartner & { _id: string };

export type TPartnerDTOWithUsers = TPartnerDTO & { usuarios: TUserDTO[] };

export type TPartnerSimplified = Pick<TPartner, "nome" | "descricao" | "contatos" | "midias" | "slogan" | "cpfCnpj" | "logo_url" | "localizacao">;
export type TPartnerSimplifiedDTO = TPartnerSimplified & { _id: string };

export const PartnerSimplifiedProject = { nome: 1, descricao: 1, contatos: 1, midias: 1, slogan: 1, cpfCnpj: 1, logo_url: 1, localizacao: 1 };
