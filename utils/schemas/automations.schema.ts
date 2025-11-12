import z from "zod";
import { TimeDurationEnumSchema } from "./enums.schema";
import { AuthorSchema } from "./user.schema";

export const AutomationTriggerSchema = z.discriminatedUnion("tipo", [
	z.object({
		tipo: z.literal("OPORTUNIDADE-MUDANÇA-ESTÁGIO-FUNIL"),
		funilId: z.string({ required_error: "ID do funil não informado.", invalid_type_error: "Tipo não válido para o ID do funil." }),
		estagioFunilInicialId: z.string({
			required_error: "ID do estágio inicial do funil não informado.",
			invalid_type_error: "Tipo não válido para o ID do estágio inicial do funil.",
		}),
		estagioFunilFinalId: z.string({
			required_error: "ID do estágio final do funil não informado.",
			invalid_type_error: "Tipo não válido para o ID do estágio final do funil.",
		}),
	}),
	z.object({
		tipo: z.literal("OPORTUNIDADE-PERDA"),
	}),
	z.object({
		tipo: z.literal("OPORTUNIDADE-PERÍODO-DESDE-INTERAÇÃO"),
		tempoMedida: TimeDurationEnumSchema,
		tempoValor: z.number({ required_error: "Valor do tempo não informado.", invalid_type_error: "Tipo não válido para o valor do tempo." }),
	}),
	z.object({
		tipo: z.literal("OPORTUNIDADE-PERÍODO-DESDE-PERDA"),
		tempoMedida: TimeDurationEnumSchema,
		tempoValor: z.number({ required_error: "Valor do tempo não informado.", invalid_type_error: "Tipo não válido para o valor do tempo." }),
	}),
]);

export const AutomationExecutionSchema = z.discriminatedUnion("tipo", [
	z.object({
		tipo: z.literal("RECORRENTE"), // For cron jobs
		expressao: z.string({ required_error: "Expressão da automação não informada.", invalid_type_error: "Tipo não válido para a expressão da automação." }),
	}),
	z.object({
		tipo: z.literal("AGENDADA"), // For scheduled executions
		tempoDelayMedida: TimeDurationEnumSchema,
		tempoDelayValor: z.number({
			required_error: "Valor do tempo de delay não informado.",
			invalid_type_error: "Tipo não válido para o valor do tempo de delay.",
		}),
	}),
]);

export const AutomationActionSchema = z.discriminatedUnion("tipo", [
	z.object({
		tipo: z.literal("ENVIO-CLIENTE-EMAIL"),
		templateId: z.string({ required_error: "ID do template de e-mail não informado.", invalid_type_error: "Tipo não válido para o ID do template de e-mail." }),
	}),
	z.object({
		tipo: z.literal("ENVIO-CLIENTE-WHATSAPP"),
		templateId: z.string({
			required_error: "ID do template de WhatsApp não informado.",
			invalid_type_error: "Tipo não válido para o ID do template de WhatsApp.",
		}),
	}),
]);
export const AutomationConfigurationSchema = z.object({
	ativo: z.boolean({ required_error: "Status da automação não informado.", invalid_type_error: "Tipo não válido para o status da automação." }),
	titulo: z.string({ required_error: "Título da automação não informado.", invalid_type_error: "Tipo não válido para o título da automação." }),
	descricao: z.string({ required_error: "Descrição da automação não informada.", invalid_type_error: "Tipo não válido para a descrição da automação." }),
	gatilho: AutomationTriggerSchema,
	execucao: AutomationExecutionSchema,
	acao: AutomationActionSchema,
	execucoesContagemTotal: z.number({
		required_error: "Total de execuções da automação não informado.",
		invalid_type_error: "Tipo não válido para o total de execuções da automação.",
	}),
	execucoesContagemTotalSucessos: z.number({
		required_error: "Total de execuções da automação não informado.",
		invalid_type_error: "Tipo não válido para o total de execuções da automação.",
	}),
	execucoesContagemTotalFalhas: z.number({
		required_error: "Total de execuções da automação não informado.",
		invalid_type_error: "Tipo não válido para o total de execuções da automação.",
	}),
	conversoesContagemTotalInteracaoMensagem: z.number({
		required_error: "Total de conversões de interação mensagem da automação não informado.",
		invalid_type_error: "Tipo não válido para o total de conversões de interação mensagem da automação.",
	}),
	dataInsercao: z
		.string({
			required_error: "Data de inserção da automação não informada.",
			invalid_type_error: "Tipo não válido para a data de inserção da automação.",
		})
		.datetime({ message: "Tipo não válido para data de inserção." }),
	dataUltimaExecucao: z
		.string({
			required_error: "Data de última execução da automação não informada.",
			invalid_type_error: "Tipo não válido para a data de última execução da automação.",
		})
		.datetime({ message: "Tipo não válido para data de última execução." })
		.optional()
		.nullable(),
	autor: AuthorSchema,
});
export type TAutomationConfiguration = z.infer<typeof AutomationConfigurationSchema>;

export const AutomationExecutionLogSchema = z.object({
	automacao: z.object({
		id: z.string({ required_error: "ID da automação não informado.", invalid_type_error: "Tipo não válido para o ID da automação." }),
		titulo: z.string({ required_error: "Título da automação não informado.", invalid_type_error: "Tipo não válido para o título da automação." }),
	}),
	oportunidade: z.object({
		id: z.string({ required_error: "ID da oportunidade não informado.", invalid_type_error: "Tipo não válido para o ID da oportunidade." }),
		nome: z.string({ required_error: "Nome da oportunidade não informado.", invalid_type_error: "Tipo não válido para o nome da oportunidade." }),
		identificador: z.string({
			required_error: "Identificador da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para o identificador da oportunidade.",
		}),
	}),
	gatilho: z.string({
		required_error: "Gatilho da execução da automação não informado.",
		invalid_type_error: "Tipo não válido para o gatilho da execução da automação.",
	}), // refers to the trigger type
	acao: z.string({
		required_error: "Ação da execução da automação não informada.",
		invalid_type_error: "Tipo não válido para a ação da execução da automação.",
	}), // refers to the action type
	resultado: z.enum(["PENDENTE", "SUCESSO", "FALHA"], {
		required_error: "Resultado da execução da automação não informado.",
		invalid_type_error: "Tipo não válido para o resultado da execução da automação.",
	}),
	dataExecucao: z
		.string({
			required_error: "Data de execução da automação não informada.",
			invalid_type_error: "Tipo não válido para a data de execução da automação.",
		})
		.datetime({ message: "Tipo não válido para data de execução." })
		.optional()
		.nullable(),
	// Tracks conversions related to messages (Whatsapp or Email) sent by the automation
	conversaoInteracaoMensagem: z
		.boolean({
			required_error: "Conversão de interação mensagem da automação não informada.",
			invalid_type_error: "Tipo não válido para a conversão de interação mensagem da automação.",
		})
		.optional()
		.nullable(),
	dataInsercao: z
		.string({
			required_error: "Data de inserção do log da execução da automação não informada.",
			invalid_type_error: "Tipo não válido para a data de inserção do log da execução da automação.",
		})
		.datetime({ message: "Tipo não válido para data de inserção do log da execução da automação." }),
});
export type TAutomationExecutionLog = z.infer<typeof AutomationExecutionLogSchema>;
