import { CronExpressionParser } from "cron-parser";
import dayjs, { type ManipulateType } from "dayjs";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { sendTemplateWhatsappMessage, WHATSAPP_TEMPLATES } from "@/lib/automations/whatsapp";
import { EMAIL_TEMPLATES } from "@/lib/email";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TAutomationConfiguration, TAutomationExecutionLog } from "@/utils/schemas/automations.schema";
import type { TTimeDurationEnum } from "@/utils/schemas/enums.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import type { TOpportunityHistory } from "@/utils/schemas/opportunity-history.schema";

const TIME_UNIT_TO_DAYJS_UNIT: Record<TTimeDurationEnum, ManipulateType> = {
	HORAS: "hours",
	DIAS: "days",
	SEMANAS: "weeks",
	MESES: "months",
	ANOS: "years",
};
const MINIMUM_TIME_IN_DAYS_BETWEEN_EXECUTIONS_FOR_ENTITIES = 1;
export async function GET() {
	const currentDate = new Date();
	const db = await connectToDatabase();
	const automationsCollection = db.collection<TAutomationConfiguration>("automations");
	const automationExecutionLogsCollection = db.collection<TAutomationExecutionLog>("automations-execution-logs");
	const opportunitiesCollection = db.collection<TOpportunity>("opportunities");
	const opportunitiesHistoryCollection = db.collection<TOpportunityHistory>("opportunities-history");
	const recurrentAutomations = await automationsCollection.find({ "execucao.tipo": "RECORRENTE" }).toArray();

	const automationsPromises = recurrentAutomations.map(async (automation) => {
		if (automation.gatilho.tipo === "OPORTUNIDADE-PERÍODO-DESDE-PERDA") {
			console.log("[INFO] [AUTOMATION_EXECUTION] Running automation:", {
				title: automation.titulo,
				triggerType: automation.gatilho.tipo,
				actionType: automation.acao.tipo,
			});
			const configuredCronExpression = automation.execucao.tipo === "RECORRENTE" ? automation.execucao.expressao : null;
			if (!configuredCronExpression) return;

			const previousExecutionDate = dayjs(automation.dataUltimaExecucao ?? new Date());
			const interval = CronExpressionParser.parse(configuredCronExpression, { currentDate: previousExecutionDate.toDate() });
			const expectedNewExecutionDate = dayjs(interval.next().toDate());

			const expectedNewExecutionDatePlusMargin = expectedNewExecutionDate.add(10, "minute").toDate().getTime();
			const expectedNewExecutionDateMinusMargin = expectedNewExecutionDate.subtract(10, "minute").toDate().getTime();

			const executeInThisRun = currentDate.getTime() >= expectedNewExecutionDateMinusMargin && currentDate.getTime() <= expectedNewExecutionDatePlusMargin;
			if (automation.dataUltimaExecucao && !executeInThisRun) {
				console.log("[INFO] [AUTOMATION_EXECUTION] Automation not executed in this run:", {
					expectedNewExecutionDatePlusMargin: new Date(expectedNewExecutionDatePlusMargin).toLocaleString("pt-BR"),
					expectedNewExecutionDateMinusMargin: new Date(expectedNewExecutionDateMinusMargin).toLocaleString("pt-BR"),
					currentDate: new Date(currentDate).toLocaleString("pt-BR"),
				});
				return;
			}

			const triggerTimeMeasure = automation.gatilho.tempoMedida;
			const triggerTimeValue = automation.gatilho.tempoValor;

			const lostDateParameterLte = dayjs().subtract(triggerTimeValue, TIME_UNIT_TO_DAYJS_UNIT[triggerTimeMeasure]).toISOString();

			const executionParam = dayjs().subtract(MINIMUM_TIME_IN_DAYS_BETWEEN_EXECUTIONS_FOR_ENTITIES, "day").toISOString();

			const opportunitiesLost = await opportunitiesCollection
				.find({
					automacoesHabilitadas: true,
					"perda.data": {
						$lte: lostDateParameterLte,
					},
					$or: [
						{
							[`automacoesUltimasExecucoes.${automation.gatilho.tipo}`]: { $lte: executionParam },
							[`automacoesUltimasExecucoes.${automation.gatilho.tipo}`]: null,
						},
					],
				})
				.toArray();

			const opportunitiesPromises = opportunitiesLost.map(async (opportunity) => {
				console.log("[INFO] [AUTOMATION_EXECUTION] Running automation for opportunity:", {
					opportunityId: opportunity._id.toString(),
					opportunityName: opportunity.nome,
					opportunityIdentifier: opportunity.identificador,
					actionType: automation.acao.tipo,
				});
				const insertedAutomationExecutionLog = await automationExecutionLogsCollection.insertOne({
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
				const insertedAutomationExecutionLogId = insertedAutomationExecutionLog.insertedId.toString();
				if (automation.acao.tipo === "ENVIO-CLIENTE-WHATSAPP") {
					const clientPhone = opportunity.cliente.telefonePrimario;
					if (!clientPhone) return;
					// Execute Whatsapp template sending
					const whatsappTemplate = WHATSAPP_TEMPLATES[automation.acao.templateId as keyof typeof WHATSAPP_TEMPLATES];
					if (!whatsappTemplate) return;
					const whatsappTemplatePayload = whatsappTemplate.getWhatsappTemplatePayload({
						logAutomacaoId: insertedAutomationExecutionLogId,
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
					console.log(
						"[INFO] [WHATSAPP_TEMPLATE_SEND] Message sent successfully:",
						JSON.stringify(
							{
								data,
								message,
								whatsappMessageId,
							},
							null,
							2,
						),
					);
					// Incrementing the automation execution count
					await automationsCollection.updateOne(
						{ _id: new ObjectId(automation._id) },
						{ $inc: { execucoesContagemTotal: 1, execucoesContagemTotalSucessos: 1 } },
					);

					// Updating the automation execution log
					await automationExecutionLogsCollection.updateOne(
						{
							_id: new ObjectId(insertedAutomationExecutionLogId),
						},
						{
							$set: {
								resultado: "SUCESSO",
								dataExecucao: new Date().toISOString(),
							},
						},
					);
					// Updating the opportunity automation execution log with the last execution date
					await opportunitiesCollection.updateOne(
						{
							_id: new ObjectId(opportunity._id),
						},
						{
							$set: { [`automacoesUltimasExecucoes.${automation.gatilho.tipo}`]: new Date().toISOString() },
						},
					);

					// Inserting a opportunity interaction record for the automation execution
					await opportunitiesHistoryCollection.insertOne({
						oportunidade: {
							id: opportunity._id.toString(),
							nome: opportunity.nome,
							identificador: opportunity.identificador,
						},
						idParceiro: opportunity.idParceiro,
						categoria: "INTERAÇÃO",
						conteudo: `Template de Whatsapp (${whatsappTemplate.title}) enviado via automação (${automation.titulo}).`,
						autor: {
							id: "automation",
							nome: "AUTOMAÇÃO",
							avatar_url: null,
						},
						tipoInteracao: "MENSAGEM",
						dataInsercao: new Date().toISOString(),
						automacaoId: automation._id.toString(),
						automacaoExecucaoId: insertedAutomationExecutionLogId,
					});
					return { success: true, message: "Template enviado com sucesso !" };
				}
				if (automation.acao.tipo === "ENVIO-CLIENTE-EMAIL") {
					const clientEmail = opportunity.cliente.email;
					if (!clientEmail) return;
					// Execute Email template sending
					const emailTemplate = EMAIL_TEMPLATES[automation.acao.templateId as keyof typeof EMAIL_TEMPLATES];
					const emailSendResponse = await emailTemplate.sendEmail({
						logAutomacaoId: insertedAutomationExecutionLogId,
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

					// Incrementing the automation execution count
					await automationsCollection.updateOne(
						{ _id: new ObjectId(automation._id) },
						{ $inc: { execucoesContagemTotal: 1, execucoesContagemTotalSucessos: 1 } },
					);
					// Updating the automation execution log
					await automationExecutionLogsCollection.updateOne(
						{
							_id: new ObjectId(insertedAutomationExecutionLogId),
						},
						{
							$set: {
								resultado: "SUCESSO",
								dataExecucao: new Date().toISOString(),
							},
						},
					);
					// Updating the opportunity automation execution log with the last execution date
					await opportunitiesCollection.updateOne(
						{
							_id: new ObjectId(opportunity._id),
						},
						{
							$set: { [`automacoesUltimasExecucoes.${automation.gatilho.tipo}`]: new Date().toISOString() },
						},
					);

					// Inserting a opportunity interaction record for the automation execution
					await opportunitiesHistoryCollection.insertOne({
						oportunidade: {
							id: opportunity._id.toString(),
							nome: opportunity.nome,
							identificador: opportunity.identificador,
						},
						idParceiro: opportunity.idParceiro,
						categoria: "INTERAÇÃO",
						conteudo: `Template de E-mail (${emailTemplate.subject}) enviado via automação (${automation.titulo}).`,
						autor: {
							id: "automation",
							nome: "AUTOMAÇÃO",
							avatar_url: null,
						},
						tipoInteracao: "EMAIL",
						dataInsercao: new Date().toISOString(),
						automacaoId: automation._id.toString(),
						automacaoExecucaoId: insertedAutomationExecutionLogId,
					});
					return { success: true, message: "Template enviado com sucesso !" };
				}

				return null;
			});

			await Promise.all(opportunitiesPromises);
		}
		if (automation.gatilho.tipo === "OPORTUNIDADE-PERÍODO-DESDE-INTERAÇÃO") {
			console.log("[INFO] [AUTOMATION_EXECUTION] Running automation:", {
				title: automation.titulo,
				triggerType: automation.gatilho.tipo,
				actionType: automation.acao.tipo,
			});
			const configuredCronExpression = automation.execucao.tipo === "RECORRENTE" ? automation.execucao.expressao : null;
			if (!configuredCronExpression) return;

			const previousExecutionDate = dayjs(automation.dataUltimaExecucao ?? new Date());
			const interval = CronExpressionParser.parse(configuredCronExpression, { currentDate: previousExecutionDate.toDate() });
			const expectedNewExecutionDate = dayjs(interval.next().toDate());

			const expectedNewExecutionDatePlusMargin = expectedNewExecutionDate.add(10, "minute").toDate().getTime();
			const expectedNewExecutionDateMinusMargin = expectedNewExecutionDate.subtract(10, "minute").toDate().getTime();

			const executeInThisRun = currentDate.getTime() >= expectedNewExecutionDateMinusMargin && currentDate.getTime() <= expectedNewExecutionDatePlusMargin;
			if (automation.dataUltimaExecucao && !executeInThisRun) {
				console.log("[INFO] [AUTOMATION_EXECUTION] Automation not executed in this run:", {
					expectedNewExecutionDatePlusMargin: new Date(expectedNewExecutionDatePlusMargin).toLocaleString("pt-BR"),
					expectedNewExecutionDateMinusMargin: new Date(expectedNewExecutionDateMinusMargin).toLocaleString("pt-BR"),
					currentDate: new Date(currentDate).toLocaleString("pt-BR"),
				});
				return;
			}

			const triggerTimeMeasure = automation.gatilho.tempoMedida;
			const triggerTimeValue = automation.gatilho.tempoValor;

			const interactionDateParameterLte = dayjs().subtract(triggerTimeValue, TIME_UNIT_TO_DAYJS_UNIT[triggerTimeMeasure]).toISOString();

			const executionParam = dayjs().subtract(MINIMUM_TIME_IN_DAYS_BETWEEN_EXECUTIONS_FOR_ENTITIES, "day").toISOString();

			const opportunitiesWithRecentInteraction = await opportunitiesCollection
				.find({
					automacoesHabilitadas: true,
					"ultimaInteracao.data": {
						$lte: interactionDateParameterLte,
					},
					$or: [
						{
							[`automacoesUltimasExecucoes.${automation.gatilho.tipo}`]: { $lte: executionParam },
							[`automacoesUltimasExecucoes.${automation.gatilho.tipo}`]: null,
						},
					],
				})
				.toArray();

			const opportunitiesPromises = opportunitiesWithRecentInteraction.map(async (opportunity) => {
				console.log("[INFO] [AUTOMATION_EXECUTION] Running automation for opportunity:", {
					opportunityId: opportunity._id.toString(),
					opportunityName: opportunity.nome,
					opportunityIdentifier: opportunity.identificador,
					actionType: automation.acao.tipo,
				});
				const insertedAutomationExecutionLog = await automationExecutionLogsCollection.insertOne({
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
				const insertedAutomationExecutionLogId = insertedAutomationExecutionLog.insertedId.toString();
				if (automation.acao.tipo === "ENVIO-CLIENTE-WHATSAPP") {
					const clientPhone = opportunity.cliente.telefonePrimario;
					if (!clientPhone) return;
					// Execute Whatsapp template sending
					const whatsappTemplate = WHATSAPP_TEMPLATES[automation.acao.templateId as keyof typeof WHATSAPP_TEMPLATES];
					if (!whatsappTemplate) return;
					const whatsappTemplatePayload = whatsappTemplate.getWhatsappTemplatePayload({
						logAutomacaoId: insertedAutomationExecutionLogId,
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
					console.log(
						"[INFO] [WHATSAPP_TEMPLATE_SEND] Message sent successfully:",
						JSON.stringify(
							{
								data,
								message,
								whatsappMessageId,
							},
							null,
							2,
						),
					);
					// Incrementing the automation execution count
					await automationsCollection.updateOne(
						{ _id: new ObjectId(automation._id) },
						{ $inc: { execucoesContagemTotal: 1, execucoesContagemTotalSucessos: 1 } },
					);
					// Updating the automation execution log
					await automationExecutionLogsCollection.updateOne(
						{
							_id: new ObjectId(insertedAutomationExecutionLogId),
						},
						{
							$set: {
								resultado: "SUCESSO",
								dataExecucao: new Date().toISOString(),
							},
						},
					);
					// Updating the opportunity automation execution log with the last execution date
					await opportunitiesCollection.updateOne(
						{
							_id: new ObjectId(opportunity._id),
						},
						{
							$set: { [`automacoesUltimasExecucoes.${automation.gatilho.tipo}`]: new Date().toISOString() },
						},
					);

					// Inserting a opportunity interaction record for the automation execution
					await opportunitiesHistoryCollection.insertOne({
						oportunidade: {
							id: opportunity._id.toString(),
							nome: opportunity.nome,
							identificador: opportunity.identificador,
						},
						idParceiro: opportunity.idParceiro,
						categoria: "INTERAÇÃO",
						conteudo: `Template de Whatsapp (${whatsappTemplate.title}) enviado via automação (${automation.titulo}).`,
						autor: {
							id: "automation",
							nome: "AUTOMAÇÃO",
							avatar_url: null,
						},
						tipoInteracao: "MENSAGEM",
						dataInsercao: new Date().toISOString(),
						automacaoId: automation._id.toString(),
						automacaoExecucaoId: insertedAutomationExecutionLogId,
					});
					return { success: true, message: "Template enviado com sucesso !" };
				}
				if (automation.acao.tipo === "ENVIO-CLIENTE-EMAIL") {
					const clientEmail = opportunity.cliente.email;
					if (!clientEmail) return;
					// Execute Email template sending
					const emailTemplate = EMAIL_TEMPLATES[automation.acao.templateId as keyof typeof EMAIL_TEMPLATES];
					const emailSendResponse = await emailTemplate.sendEmail({
						logAutomacaoId: insertedAutomationExecutionLogId,
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
					// Incrementing the automation execution count
					await automationsCollection.updateOne(
						{ _id: new ObjectId(automation._id) },
						{ $inc: { execucoesContagemTotal: 1, execucoesContagemTotalSucessos: 1 } },
					);
					// Updating the automation execution log
					await automationExecutionLogsCollection.updateOne(
						{
							_id: new ObjectId(insertedAutomationExecutionLogId),
						},
						{
							$set: {
								resultado: "SUCESSO",
								dataExecucao: new Date().toISOString(),
							},
						},
					);
					// Updating the opportunity automation execution log with the last execution date
					await opportunitiesCollection.updateOne(
						{
							_id: new ObjectId(opportunity._id),
						},
						{
							$set: { [`automacoesUltimasExecucoes.${automation.gatilho.tipo}`]: new Date().toISOString() },
						},
					);

					// Inserting a opportunity interaction record for the automation execution
					await opportunitiesHistoryCollection.insertOne({
						oportunidade: {
							id: opportunity._id.toString(),
							nome: opportunity.nome,
							identificador: opportunity.identificador,
						},
						idParceiro: opportunity.idParceiro,
						categoria: "INTERAÇÃO",
						conteudo: `Template de E-mail (${emailTemplate.subject}) enviado via automação (${automation.titulo}).`,
						autor: {
							id: "automation",
							nome: "AUTOMAÇÃO",
							avatar_url: null,
						},
						tipoInteracao: "EMAIL",
						dataInsercao: new Date().toISOString(),
						automacaoId: automation._id.toString(),
						automacaoExecucaoId: insertedAutomationExecutionLogId,
					});
					return { success: true, message: "Template enviado com sucesso !" };
				}
				await automationsCollection.updateOne(
					{ _id: new ObjectId(automation._id) },
					{ $inc: { execucoesContagemTotal: 1, execucoesContagemTotalSucessos: 1 } },
				);
				return null;
			});

			if (opportunitiesPromises.length > 0) return await Promise.all(opportunitiesPromises);
			else {
				console.log("[INFO] [AUTOMATION_EXECUTION] No opportunities found to run automation");
				return;
			}
		}
	});

	console.log("[INFO] [AUTOMATION_EXECUTION] Total of automations to execute:", automationsPromises.length);
	if (automationsPromises.length > 0) await Promise.all(automationsPromises);

	return NextResponse.json({ message: "Automations executed successfully" }, { status: 200 });
}
