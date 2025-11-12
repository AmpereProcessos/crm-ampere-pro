import z from "zod";
import { resend } from "@/services/resend";
import { GeneralOpportunitySchema } from "@/utils/schemas/opportunity.schema";
import ReactivateOpportunityVariantOne from "./templates/ReactivateOpportunityVariantOne";

export const EmailTemplatesPayloadSchema = z.object({
	logAutomacaoId: z.string({
		required_error: "ID do log de execução da automação não informado.",
		invalid_type_error: "Tipo não válido para o ID do log de execução da automação.",
	}),
	oportunidade: GeneralOpportunitySchema.pick({
		nome: true,
		identificador: true,
		responsaveis: true,
	}).extend({
		id: z.string({
			required_error: "ID da oportunidade não informado.",
			invalid_type_error: "Tipo não válido para o ID da oportunidade.",
		}),
	}),
	cliente: z.object({
		id: z.string({
			required_error: "ID do cliente não informado.",
			invalid_type_error: "Tipo não válido para o ID do cliente.",
		}),
		nome: z.string({
			required_error: "Nome do cliente não informado.",
			invalid_type_error: "Tipo não válido para o nome do cliente.",
		}),
		telefone: z.string({
			required_error: "Telefone do cliente não informado.",
			invalid_type_error: "Tipo não válido para o telefone do cliente.",
		}),
		email: z.string({
			required_error: "Email do cliente não informado.",
			invalid_type_error: "Tipo não válido para o email do cliente.",
		}),
	}),
});
export type TEmailTemplatesPayload = z.infer<typeof EmailTemplatesPayloadSchema>;

export const EMAIL_TEMPLATES = {
	opportunity_reactivation_variant_one: {
		template: ReactivateOpportunityVariantOne,
		subject: "REATIVAÇÃO DE OPORTUNIDADE (V1)",
		sendEmail: async (rawPayload: TEmailTemplatesPayload) => {
			const payload = EmailTemplatesPayloadSchema.parse(rawPayload);

			const seller = payload.oportunidade.responsaveis.find((responsible) => responsible.papel === "VENDEDOR");
			const sdr = payload.oportunidade.responsaveis.find((responsible) => responsible.papel === "SDR");

			const consultantName = seller?.nome || sdr?.nome || "Gihad";
			const { data, error } = await resend.emails.send({
				from: "Ampère Energias <vendas@ampereenergias.com.br>",
				to: [payload.cliente.email],
				subject: "CONDIÇÕES ESPECIAIS PARA SEU SISTEMA SOLAR !",
				react: ReactivateOpportunityVariantOne({
					clientName: payload.cliente.nome,
					consultantName,

					ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/automations/redirect?opportunityId=${payload.oportunidade.id}&automationExecutionLogId=${payload.logAutomacaoId}`,
				}),
			});

			return {
				data,
				error,
			};
		},
	},
};
