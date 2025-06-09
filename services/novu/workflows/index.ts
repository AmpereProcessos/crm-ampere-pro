import { workflow } from "@novu/framework";
import { z } from "zod";

export const NOVU_WORKFLOW_IDS = {
	NOTIFY_NEW_OPPORTUNITY_TO_RESPONSIBLES: "notify-new-opportunity-to-responsibles",
	NOTIFY_NEW_INTERACTION_TO_RESPONSIBLES: "notify-new-interaction-to-responsibles",
};
export const notfiyNewOpportunityToResponsibles = workflow(
	NOVU_WORKFLOW_IDS.NOTIFY_NEW_OPPORTUNITY_TO_RESPONSIBLES,
	async ({ step, payload }) => {
		await step.inApp("inbox", async () => {
			console.log("[NOVU WORKFLOW] Notifying new opportunity to responsible...");
			console.log("[NOVU WORKFLOW] Primary Action URL: ", `${process.env.NEXT_PUBLIC_APP_URL}/comercial/oportunidades/id/${payload.oportunidade.id}`);
			return {
				subject: "Nova oportunidade de negócio !",
				body: `Você foi atribuído a uma nova oportunidade de negócio: ${payload.oportunidade.identificador} - ${payload.oportunidade.nome}.`,
				avatar: payload.autor.avatar_url,
				redirect: {
					url: `${process.env.NEXT_PUBLIC_APP_URL}/comercial/oportunidades/id/${payload.oportunidade.id}`,
					target: "_blank",
				},
				primaryAction: {
					label: "CONFIRA JÁ",
					redirect: {
						url: `${process.env.NEXT_PUBLIC_APP_URL}/comercial/oportunidades/id/${payload.oportunidade.id}`,
						target: "_self",
					},
				},

				data: {
					customData: "customValue",
					text: `Você foi atribuído a uma nova oportunidade de negócio: ${payload.oportunidade.identificador} - ${payload.oportunidade.nome}.`,
				},
			};
		});
	},
	{
		payloadSchema: z.object({
			autor: z.object({
				nome: z.string({
					required_error: "O nome do autor é obrigatório",
				}),
				avatar_url: z.string({
					required_error: "A URL do avatar do autor é obrigatória",
				}),
			}),
			oportunidade: z.object({
				id: z.string({
					required_error: "O ID da oportunidade é obrigatório",
				}),
				identificador: z.string({
					required_error: "O identificador da oportunidade é obrigatório",
				}),
				nome: z.string({
					required_error: "O nome da oportunidade é obrigatório",
				}),
			}),
		}),
	},
);

export const notifyNewInteractionToResponsibles = workflow(
	NOVU_WORKFLOW_IDS.NOTIFY_NEW_INTERACTION_TO_RESPONSIBLES,
	async ({ step, payload }) => {
		await step.inApp("inbox", async () => {
			console.log("[NOVU WORKFLOW] Notifying new interaction to responsible...");
			console.log("[NOVU WORKFLOW] Primary Action URL: ", `${process.env.NEXT_PUBLIC_APP_URL}/comercial/oportunidades/id/${payload.oportunidade.id}`);
			return {
				subject: `Novidades na Oportunidade ${payload.oportunidade.identificador} - ${payload.oportunidade.nome} !`,
				body: `Uma nova interação foi adicionada a oportunidade ${payload.oportunidade.identificador} - ${payload.oportunidade.nome}.`,
				avatar: payload.autor.avatar_url,
				redirect: {
					url: `${process.env.NEXT_PUBLIC_APP_URL}/comercial/oportunidades/id/${payload.oportunidade.id}`,
					target: "_blank",
				},
				primaryAction: {
					label: "CONFIRA JÁ",
					redirect: {
						url: `${process.env.NEXT_PUBLIC_APP_URL}/comercial/oportunidades/id/${payload.oportunidade.id}`,
						target: "_self",
					},
				},

				data: {
					customData: "customValue",
					text: `Você foi atribuído a uma nova oportunidade de negócio: ${payload.oportunidade.identificador} - ${payload.oportunidade.nome}.`,
				},
			};
		});
	},
	{
		payloadSchema: z.object({
			autor: z.object({
				nome: z.string({
					required_error: "O nome do autor é obrigatório",
				}),
				avatar_url: z.string({
					required_error: "A URL do avatar do autor é obrigatória",
				}),
			}),
			oportunidade: z.object({
				id: z.string({
					required_error: "O ID da oportunidade é obrigatório",
				}),
				identificador: z.string({
					required_error: "O identificador da oportunidade é obrigatório",
				}),
				nome: z.string({
					required_error: "O nome da oportunidade é obrigatório",
				}),
			}),
		}),
	},
);
