import { CronExpressionParser } from "cron-parser";
import dayjs, { type ManipulateType } from "dayjs";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { sendTemplateWhatsappMessage, WHATSAPP_TEMPLATES } from "@/lib/automations/whatsapp";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TAutomationConfiguration, TAutomationExecutionLog } from "@/utils/schemas/automations.schema";
import type { TTimeDurationEnum } from "@/utils/schemas/enums.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";

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
	const recurrentAutomations = await automationsCollection.find({ "execucao.tipo": "RECORRENTE" }).toArray();

	const automationsPromises = recurrentAutomations.map(async (automation) => {
		if (automation.gatilho.tipo === "OPORTUNIDADE-PERÍODO-DESDE-PERDA") {
			const configuredCronExpression = automation.execucao.tipo === "RECORRENTE" ? automation.execucao.expressao : null;
			if (!configuredCronExpression) return;

			const previousExecutionDate = dayjs(automation.dataUltimaExecucao ?? new Date());
			const interval = CronExpressionParser.parse(configuredCronExpression, { currentDate: previousExecutionDate.toDate() });
			const expectedNewExecutionDate = dayjs(interval.next().toDate());

			const expectedNewExecutionDatePlusMargin = expectedNewExecutionDate.add(10, "minute").toDate().getTime();
			const expectedNewExecutionDateMinusMargin = expectedNewExecutionDate.subtract(10, "minute").toDate().getTime();

			const executeInThisRun = currentDate.getTime() >= expectedNewExecutionDateMinusMargin && currentDate.getTime() <= expectedNewExecutionDatePlusMargin;
			if (!executeInThisRun) return;

			const triggerTimeMeasure = automation.gatilho.tempoMedida;
			const triggerTimeValue = automation.gatilho.tempoValor;

			const lostDateParameterLte = dayjs().subtract(triggerTimeValue, TIME_UNIT_TO_DAYJS_UNIT[triggerTimeMeasure]).toISOString();

			const executionParam = dayjs().subtract(MINIMUM_TIME_IN_DAYS_BETWEEN_EXECUTIONS_FOR_ENTITIES, "day").toISOString();

			const opportunitiesLost = await opportunitiesCollection
				.find({
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
					// Execute Whatsapp template sending
					const whatsappTemplate = WHATSAPP_TEMPLATES[automation.acao.templateId as keyof typeof WHATSAPP_TEMPLATES];
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
							telefone: opportunity.cliente.telefonePrimario,
						},
					});

					const { data, message, whatsappMessageId } = await sendTemplateWhatsappMessage({
						payload: whatsappTemplatePayload,
					});
					console.log("[INFO] [WHATSAPP_TEMPLATE_SEND] Message sent successfully:", {
						data,
						message,
						whatsappMessageId,
					});
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
					return { success: true, message: "Template enviado com sucesso !" };
				}
				if (automation.acao.tipo === "ENVIO-CLIENTE-EMAIL") {
					// Execute Email template sending
				}
				return null;
			});

			await Promise.all(opportunitiesPromises);
		}
	});
	await Promise.all(automationsPromises);

	return NextResponse.json({ message: "Automations executed successfully" }, { status: 200 });
}
