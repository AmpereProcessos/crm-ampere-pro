import axios from "axios";
import createHttpError from "http-errors";
import z from "zod";
import { formatPhoneAsWhatsappId } from "@/lib/methods/formatting";
import { GeneralOpportunitySchema } from "@/utils/schemas/opportunity.schema";

const GRAPH_API_BASE_URL = "https://graph.facebook.com/v22.0";
const WHATSAPP_AUTH_TOKEN = process.env.WHATSAPP_SYSTEM_USER_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

function getMetaGraphAPIUrl(whatsappPhoneNumberId: string) {
	return {
		GRAPH_MESSAGES_API_URL: `${GRAPH_API_BASE_URL}/${whatsappPhoneNumberId}/messages`,
		GRAPH_MEDIA_API_URL: `${GRAPH_API_BASE_URL}/${whatsappPhoneNumberId}/media`,
	};
}

export const WhatsappTemplatesPayloadSchema = z.object({
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
	}),
});
export type TWhatsappTemplatesPayload = z.infer<typeof WhatsappTemplatesPayloadSchema>;

export const WHATSAPP_TEMPLATES = {
	opportunity_reactivation_variant_one: {
		title: "REATIVAÇÃO DE OPORTUNIDADE (V1)",
		getWhatsappTemplatePayload: (rawPayload: TWhatsappTemplatesPayload) => {
			const payload = WhatsappTemplatesPayloadSchema.parse(rawPayload);

			return {
				messaging_product: "whatsapp",
				to: formatPhoneAsWhatsappId(payload.cliente.telefone),
				type: "template",
				template: {
					name: "opportunity_reactivation_variant_one",
					language: {
						code: "pt_BR",
					},
					components: [
						{
							type: "header",
							parameters: [
								{
									type: "image",
									image: {
										link: "https://firebasestorage.googleapis.com/v0/b/sistemaampere.appspot.com/o/(1)Marketing%2Fopportunity-reactivation-variant-one.jpeg?alt=media&token=78348c0b-0ee2-455a-8a54-82351e8dc0bc",
									},
								},
							],
						},
						{
							type: "body",
							parameters: [
								{
									type: "text",
									parameter_name: "nome_cliente",
									text: payload.cliente.nome,
								},
							],
						},
						{
							type: "button",
							sub_type: "url",
							index: "0", // Index for the first button (0-based)
							parameters: [
								{
									type: "text",
									text: `${process.env.NEXT_PUBLIC_APP_URL}/api/integration/meta/redirect?opportunityId=${payload.oportunidade.id}&automationExecutionLogId=${payload.logAutomacaoId}`,
								},
							],
						},
					],
				},
			};
		},
	},
};

type SendTemplateWhatsappMessageParams = {
	payload: any;
};
type SendTemplateWhatsappMessageResponse = {
	data: any;
	message: string;
	whatsappMessageId: string;
};
export async function sendTemplateWhatsappMessage({ payload }: SendTemplateWhatsappMessageParams): Promise<SendTemplateWhatsappMessageResponse> {
	try {
		if (!WHATSAPP_AUTH_TOKEN) {
			throw new createHttpError.InternalServerError("WhatsApp auth token não configurado.");
		}

		const { GRAPH_MESSAGES_API_URL } = getMetaGraphAPIUrl(WHATSAPP_PHONE_NUMBER_ID as string);
		console.log("[INFO] [WHATSAPP_TEMPLATE_SEND] Sending template:", JSON.stringify(payload, null, 2));
		const response = await axios.post(GRAPH_MESSAGES_API_URL, payload, {
			headers: {
				Authorization: `Bearer ${WHATSAPP_AUTH_TOKEN}`,
				"Content-Type": "application/json",
			},
		});

		const whatsappMessageId = response.data.messages?.[0]?.id;
		if (!whatsappMessageId) {
			throw new createHttpError.InternalServerError("WhatsApp message ID não retornado.");
		}

		return {
			data: response.data,
			message: "Template enviado com sucesso !",
			whatsappMessageId,
		};
	} catch (error) {
		console.error("[ERROR] [WHATSAPP_TEMPLATE_SEND_ERROR]", error);
		if (axios.isAxiosError(error)) {
			console.error("[ERROR] [WHATSAPP_TEMPLATE_SEND_ERROR_RESPONSE]", error.response?.data);
		}
		throw new createHttpError.InternalServerError("Oops, algo deu errado ao enviar o template.");
	}
}
