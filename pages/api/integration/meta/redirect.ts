import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { formatPhoneAsWhatsappId } from "@/lib/methods/formatting";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import type { TAutomationConfiguration, TAutomationExecutionLog } from "@/utils/schemas/automations.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";

async function handleRedirect(req: NextApiRequest, res: NextApiResponse) {
	console.log("[INFO] [META_REDIRECT] [HANDLE_REDIRECT] Request received");
	console.log("[INFO] [META_REDIRECT] [HANDLE_REDIRECT] Query:", req.query);
	console.log("[INFO] [META_REDIRECT] [HANDLE_REQUEST] Body:", req.body);
	const searchParams = req.query;

	const automationExecutionLogId = searchParams.automationExecutionLogId;
	const opportunityId = searchParams.opportunityId;

	if (!automationExecutionLogId || !opportunityId || typeof automationExecutionLogId !== "string" || typeof opportunityId !== "string") {
		return res.status(400).json({ message: "Parâmetros de URL inválidos." });
	}
	const db = await connectToDatabase();
	const opportunitiesCollection = db.collection<TOpportunity>("opportunities");
	const automationsCollection = db.collection<TAutomationConfiguration>("automations");
	const automationExecutionLogsCollection = db.collection<TAutomationExecutionLog>("automations-execution-logs");

	const opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) });
	if (!opportunity) {
		return res.status(404).json({ message: "Oportunidade não encontrada." });
	}

	// Declaring conversion in the automation execution log
	const automationExecutionLog = await automationExecutionLogsCollection.findOne({ _id: new ObjectId(automationExecutionLogId) });
	if (!automationExecutionLog) {
		return res.status(404).json({ message: "Log de execução da automação não encontrado." });
	}
	await automationsCollection.updateOne({ _id: new ObjectId(automationExecutionLog.automacao.id) }, { $inc: { conversoesContagemTotalInteracaoMensagem: 1 } });
	await automationExecutionLogsCollection.updateOne({ _id: new ObjectId(automationExecutionLogId) }, { $set: { conversaoInteracaoMensagem: true } });

	const opportunitySeller = opportunity.responsaveis.find((responsible) => responsible.papel === "VENDEDOR");
	const opportunitySDR = opportunity.responsaveis.find((responsible) => responsible.papel === "SDR");

	const message = `Olá! 👋
Gostaria de retornar meu atendimento ${opportunity.identificador} !`;

	if (opportunitySeller && opportunitySeller.telefone) {
		return res.redirect(
			`https://api.whatsapp.com/send?phone=${formatPhoneAsWhatsappId(opportunitySeller.telefone)}&text=${encodeURIComponent(message.trim())}`,
		);
	}
	if (opportunitySDR && opportunitySDR.telefone) {
		return res.redirect(`https://api.whatsapp.com/send?phone=${formatPhoneAsWhatsappId(opportunitySDR.telefone)}&text=${encodeURIComponent(message.trim())}`);
	}
	// If none of the responsible phones are available, redirect to the default phone
	const DEFAULT_REDIRECT_PHONE = "(34) 3700-7001";
	return res.redirect(`https://api.whatsapp.com/send?phone=${formatPhoneAsWhatsappId(DEFAULT_REDIRECT_PHONE)}&text=${encodeURIComponent(message.trim())}`);
}

export default apiHandler({ GET: handleRedirect });
