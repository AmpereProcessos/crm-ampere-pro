import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { formatPhoneAsWhatsappId } from "@/lib/methods/formatting";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import type { TAutomationConfiguration, TAutomationExecutionLog } from "@/utils/schemas/automations.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";

export const GET = async (req: NextRequest) => {
	const searchParams = req.nextUrl.searchParams;

	const automationExecutionLogId = searchParams.get("automationExecutionLogId");
	const opportunityId = searchParams.get("opportunityId");

	if (!automationExecutionLogId || !opportunityId || typeof automationExecutionLogId !== "string" || typeof opportunityId !== "string") {
		return NextResponse.json({ message: "Parâmetros de URL inválidos." }, { status: 400 });
	}
	const db = await connectToDatabase();
	const opportunitiesCollection = db.collection<TOpportunity>("opportunities");
	const automationsCollection = db.collection<TAutomationConfiguration>("automations");
	const automationExecutionLogsCollection = db.collection<TAutomationExecutionLog>("automation-execution-logs");

	const opportunity = await opportunitiesCollection.findOne({ _id: new ObjectId(opportunityId) });
	if (!opportunity) {
		return NextResponse.json({ message: "Oportunidade não encontrada." }, { status: 404 });
	}

	// Declaring conversion in the automation execution log
	const automationExecutionLog = await automationExecutionLogsCollection.findOne({ _id: new ObjectId(automationExecutionLogId) });
	if (!automationExecutionLog) {
		return NextResponse.json({ message: "Log de execução da automação não encontrado." }, { status: 404 });
	}
	await automationsCollection.updateOne({ _id: new ObjectId(automationExecutionLog.automacao.id) }, { $inc: { conversoesContagemTotalInteracaoMensagem: 1 } });
	await automationExecutionLogsCollection.updateOne({ _id: new ObjectId(automationExecutionLogId) }, { $set: { conversaoInteracaoMensagem: true } });

	const opportunitySeller = opportunity.responsaveis.find((responsible) => responsible.papel === "VENDEDOR");
	const opportunitySDR = opportunity.responsaveis.find((responsible) => responsible.papel === "SDR");

	const message = `Olá! 👋
Gostaria de retornar meu atendimento ${opportunity.identificador} !`;

	if (opportunitySeller && opportunitySeller.telefone) {
		return NextResponse.redirect(
			`https://api.whatsapp.com/send?phone=${formatPhoneAsWhatsappId(opportunitySeller.telefone)}&text=${encodeURIComponent(message.trim())}`,
		);
	}
	if (opportunitySDR && opportunitySDR.telefone) {
		return NextResponse.redirect(
			`https://api.whatsapp.com/send?phone=${formatPhoneAsWhatsappId(opportunitySDR.telefone)}&text=${encodeURIComponent(message.trim())}`,
		);
	}
	// If none of the responsible phones are available, redirect to the default phone
	const DEFAULT_REDIRECT_PHONE = "(34) 3700-7001";
	return NextResponse.redirect(
		`https://api.whatsapp.com/send?phone=${formatPhoneAsWhatsappId(DEFAULT_REDIRECT_PHONE)}&text=${encodeURIComponent(message.trim())}`,
	);
};
