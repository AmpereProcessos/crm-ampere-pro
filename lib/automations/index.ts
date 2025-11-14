import { ObjectId, WithId } from "mongodb";
import type ms from "ms";
import { sleep } from "workflow";
import type { TAutomationConfigurationDTO } from "@/app/api/automations/route";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TAutomationConfiguration, TAutomationExecutionLog } from "@/utils/schemas/automations.schema";
import type { TTimeDurationEnum } from "@/utils/schemas/enums.schema";
import type { TOpportunity, TOpportunityDTO } from "@/utils/schemas/opportunity.schema";
import type { TOpportunityHistory } from "@/utils/schemas/opportunity-history.schema";
import { EMAIL_TEMPLATES } from "../email";
import { sendTemplateWhatsappMessage, WHATSAPP_TEMPLATES } from "./whatsapp";

type RunOpportunityLossAutomationParams = {
	opportunity: TOpportunityDTO;
	automation: TAutomationConfigurationDTO;
};

export async function runOpportunityLossAutomation(
	opportunity: RunOpportunityLossAutomationParams["opportunity"],
	automation: RunOpportunityLossAutomationParams["automation"],
) {
	"use workflow";

	console.log("[INFO] [RUN_OPPORTUNITY_LOSS_AUTOMATION] Running opportunity loss automation:");
	const execution = automation.execucao;
	if (execution.tipo !== "AGENDADA") {
		throw new Error("Automacao não agendada");
	}

	const delayMeasure = execution.tempoDelayMedida;
	const delayValue = execution.tempoDelayValor;
	const delay = getDelayInMilliseconds(delayMeasure, delayValue);

	console.log("[INFO] [RUN_OPPORTUNITY_LOSS_AUTOMATION] Waiting for the configured delay:", delay);
	// Wait for the configured delay
	// await sleep(delay);
	await sleep("10s");

	// Create automation execution log
	const logId = await createAutomationLog(automation, opportunity);
	console.log("[INFO] [RUN_OPPORTUNITY_LOSS_AUTOMATION] Automation execution log created:", logId);
	// Execute the appropriate action
	if (automation.acao.tipo === "ENVIO-CLIENTE-WHATSAPP") {
		const { template } = await sendWhatsappTemplate(opportunity, automation, logId);
		console.log("[INFO] [RUN_OPPORTUNITY_LOSS_AUTOMATION] WhatsApp template sent:", template);
		// Update automation stats
		await updateAutomationExecutionCount(automation._id.toString());
		console.log("[INFO] [RUN_OPPORTUNITY_LOSS_AUTOMATION] Automation execution count updated:", automation._id.toString());
		// Update execution log
		await updateExecutionLog(logId);
		console.log("[INFO] [RUN_OPPORTUNITY_LOSS_AUTOMATION] Execution log updated:", logId);
		// Update opportunity
		await updateOpportunityAutomationExecution(opportunity._id.toString(), automation.gatilho.tipo);
		console.log("[INFO] [RUN_OPPORTUNITY_LOSS_AUTOMATION] Opportunity automation execution updated:", opportunity._id.toString(), automation.gatilho.tipo);
		// Create history entry
		await createOpportunityHistoryEntry(
			opportunity,
			automation,
			logId,
			`Template de Whatsapp (${template.title}) enviado via automação (${automation.titulo}).`,
			"MENSAGEM",
		);
		console.log("[INFO] [RUN_OPPORTUNITY_LOSS_AUTOMATION] Opportunity history entry created:", opportunity._id.toString(), automation.gatilho.tipo);
		return { success: true, message: "Template enviado com sucesso !" };
	}

	if (automation.acao.tipo === "ENVIO-CLIENTE-EMAIL") {
		const { template } = await sendEmailTemplate({ ...opportunity, _id: opportunity._id.toString() }, automation, logId);
		console.log("[INFO] [RUN_OPPORTUNITY_LOSS_AUTOMATION] Email template sent:", template);
		// Update automation stats
		await updateAutomationExecutionCount(automation._id.toString());
		console.log("[INFO] [RUN_OPPORTUNITY_LOSS_AUTOMATION] Automation execution count updated:", automation._id.toString());
		// Update execution log
		await updateExecutionLog(logId);
		console.log("[INFO] [RUN_OPPORTUNITY_LOSS_AUTOMATION] Execution log updated:", logId);
		// Update opportunity
		await updateOpportunityAutomationExecution(opportunity._id.toString(), automation.gatilho.tipo);
		console.log("[INFO] [RUN_OPPORTUNITY_LOSS_AUTOMATION] Opportunity automation execution updated:", opportunity._id.toString(), automation.gatilho.tipo);
		// Create history entry
		await createOpportunityHistoryEntry(
			opportunity,
			automation,
			logId,
			`Template de E-mail (${template.subject}) enviado via automação (${automation.titulo}).`,
			"EMAIL",
		);
		console.log("[INFO] [RUN_OPPORTUNITY_LOSS_AUTOMATION] Opportunity history entry created:", opportunity._id.toString(), automation.gatilho.tipo);
		return { success: true, message: "Template enviado com sucesso !" };
	}

	return { success: false, message: "Tipo de ação não suportado" };
}

function getDelayInMilliseconds(delayMeasure: TTimeDurationEnum, delayValue: number): ms.StringValue {
	if (delayMeasure === "HORAS") return `${delayValue} hours`;
	if (delayMeasure === "DIAS") return `${delayValue} days`;
	if (delayMeasure === "SEMANAS") return `${delayValue} weeks`;
	if (delayMeasure === "MESES") return `${delayValue / 12} years`;
	if (delayMeasure === "ANOS") return `${delayValue} years`;
	throw new Error("Invalid delay measure");
}

// Helper function to create execution log
async function createAutomationLog(automation: TAutomationConfigurationDTO, opportunity: TOpportunityDTO) {
	"use step";

	const db = await connectToDatabase();
	const automationExecutionLogsCollection = db.collection<TAutomationExecutionLog>("automations-execution-logs");

	const result = await automationExecutionLogsCollection.insertOne({
		automacao: {
			id: automation._id.toString(),
			titulo: automation.titulo,
		},
		oportunidade: {
			id: opportunity._id.toString(),
			nome: opportunity.nome,
			identificador: opportunity.identificador,
		},
		gatilho: automation.gatilho.tipo,
		acao: automation.acao.tipo,
		resultado: "PENDENTE",
		dataInsercao: new Date().toISOString(),
	});

	return result.insertedId.toString();
}

// Helper function to update automation execution count
async function updateAutomationExecutionCount(automationId: string) {
	"use step";

	const db = await connectToDatabase();
	const automationsCollection = db.collection<TAutomationConfiguration>("automations");

	await automationsCollection.updateOne(
		{ _id: new ObjectId(automationId) },
		{
			$set: { dataUltimaExecucao: new Date().toISOString() },
			$inc: { execucoesContagemTotal: 1, execucoesContagemTotalSucessos: 1 },
		},
	);
}

// Helper function to update execution log
async function updateExecutionLog(logId: string) {
	"use step";

	const db = await connectToDatabase();
	const automationExecutionLogsCollection = db.collection<TAutomationExecutionLog>("automations-execution-logs");

	await automationExecutionLogsCollection.updateOne(
		{ _id: new ObjectId(logId) },
		{
			$set: {
				resultado: "SUCESSO",
				dataExecucao: new Date().toISOString(),
			},
		},
	);
}

// Helper function to update opportunity automation execution
async function updateOpportunityAutomationExecution(opportunityId: string, triggerType: string) {
	"use step";

	const db = await connectToDatabase();
	const opportunitiesCollection = db.collection<TOpportunity>("opportunities");

	await opportunitiesCollection.updateOne(
		{ _id: new ObjectId(opportunityId) },
		{
			$set: { [`automacoesUltimasExecucoes.${triggerType}`]: new Date().toISOString() },
		},
	);
}

// Helper function to create opportunity history entry
async function createOpportunityHistoryEntry(
	opportunity: TOpportunityDTO,
	automation: TAutomationConfigurationDTO,
	logId: string,
	content: string,
	interactionType: "MENSAGEM" | "EMAIL",
) {
	"use step";

	const db = await connectToDatabase();
	const opportunitiesHistoryCollection = db.collection<TOpportunityHistory>("opportunities-history");

	await opportunitiesHistoryCollection.insertOne({
		oportunidade: {
			id: opportunity._id.toString(),
			nome: opportunity.nome,
			identificador: opportunity.identificador,
		},
		idParceiro: opportunity.idParceiro,
		categoria: "INTERAÇÃO",
		conteudo: content,
		autor: {
			id: "automation",
			nome: "AUTOMAÇÃO",
			avatar_url: null,
		},
		tipoInteracao: interactionType,
		dataInsercao: new Date().toISOString(),
		automacaoId: automation._id.toString(),
		automacaoExecucaoId: logId,
	});
}

// Helper function to send WhatsApp template
async function sendWhatsappTemplate(opportunity: TOpportunityDTO, automation: TAutomationConfigurationDTO, logId: string) {
	"use step";

	const clientPhone = opportunity.cliente.telefonePrimario;
	if (!clientPhone) {
		throw new Error("Client phone not available");
	}

	const whatsappTemplate = WHATSAPP_TEMPLATES[automation.acao.templateId as keyof typeof WHATSAPP_TEMPLATES];
	if (!whatsappTemplate) {
		throw new Error("WhatsApp template not found");
	}

	const whatsappTemplatePayload = whatsappTemplate.getWhatsappTemplatePayload({
		logAutomacaoId: logId,
		oportunidade: {
			id: opportunity._id.toString(),
			nome: opportunity.nome,
			identificador: opportunity.identificador,
			responsaveis: opportunity.responsaveis,
		},
		cliente: {
			id: opportunity.idCliente,
			nome: opportunity.cliente.nome,
			telefone: clientPhone,
		},
	});

	const { data, message, whatsappMessageId } = await sendTemplateWhatsappMessage({
		payload: whatsappTemplatePayload,
	});

	console.log("[INFO] [WHATSAPP_TEMPLATE_SEND] Message sent successfully:", JSON.stringify({ data, message, whatsappMessageId }, null, 2));

	return { template: whatsappTemplate.title, success: true };
}

// Helper function to send Email template
async function sendEmailTemplate(opportunity: TOpportunityDTO, automation: TAutomationConfigurationDTO, logId: string) {
	"use step";

	const clientEmail = opportunity.cliente.email;
	if (!clientEmail) {
		throw new Error("Client email not available");
	}

	const emailTemplate = EMAIL_TEMPLATES[automation.acao.templateId as keyof typeof EMAIL_TEMPLATES];
	if (!emailTemplate) {
		throw new Error("Email template not found");
	}

	const emailSendResponse = await emailTemplate.sendEmail({
		logAutomacaoId: logId,
		oportunidade: {
			id: opportunity._id.toString(),
			nome: opportunity.nome,
			identificador: opportunity.identificador,
			responsaveis: opportunity.responsaveis,
		},
		cliente: {
			id: opportunity.idCliente,
			nome: opportunity.cliente.nome,
			telefone: opportunity.cliente.telefonePrimario,
			email: clientEmail,
		},
	});

	console.log("[INFO] [EMAIL_TEMPLATE_SEND] Email sent successfully:", {
		data: emailSendResponse.data,
		error: emailSendResponse.error,
	});

	return { template: emailTemplate, success: true };
}
