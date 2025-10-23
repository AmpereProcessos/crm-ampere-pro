import { anthropic } from "@ai-sdk/anthropic";
import { createGateway } from "@ai-sdk/gateway";
import { generateObject } from "ai";
import { z } from "zod";
import { formatPhoneAsBase, formatToPhone } from "@/utils/methods";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";

const gateway = createGateway({
	apiKey: process.env.AI_GATEWAY_API_KEY, // the default environment variable for the API key
	baseURL: "https://ai-gateway.vercel.sh/v1/ai", // the default base URL
});

/**
 * Schema for AI-extracted client data
 */
const ClientExtractionSchema = z.object({
	nome: z.string().describe("Full name of the client - REQUIRED"),
	telefonePrimario: z.string().describe("Primary phone number in (DDD of two digits) XXXX-XXXX (or 9XXXX-XXXX) - REQUIRED"),
	email: z.string().nullable().describe("Email address if provided"),
	cpfCnpj: z.string().nullable().describe("CPF or CNPJ if provided"),
	uf: z.string().nullable().describe("State/UF (e.g., MG, SP, RJ). Extract from form or infer from city"),
	cidade: z.string().nullable().describe("City name if provided"),
	bairro: z.string().nullable().describe("Neighborhood/district if provided"),
	endereco: z.string().nullable().describe("Street address if provided"),
	numeroOuIdentificador: z.string().nullable().describe("House/building number or identifier"),
	complemento: z.string().nullable().describe("Address complement (apt, suite, etc)"),
	cep: z.string().nullable().describe("ZIP code/CEP"),
	profissao: z.string().nullable().describe("Profession/occupation if mentioned"),
	estadoCivil: z.string().nullable().describe("Marital status if mentioned"),
	dataNascimento: z.string().nullable().describe("Birth date if provided (ISO format)"),
});

/**
 * Schema for AI-extracted opportunity data
 */
const OpportunityExtractionSchema = z.object({
	segmento: z
		.enum(["RESIDENCIAL", "RURAL", "COMERCIAL", "INDUSTRIAL"])
		.describe("Customer segment. Infer from form: RESIDENCIAL if home/residential mentioned, COMERCIAL if business, etc."),
	valorFaturaEnergia: z.string().nullable().describe("Energy bill value/range from answers (e.g., 'R$ 100 - R$ 300' or 'R$ 500/mês')"),
	preferenciaMeioContato: z
		.enum(["EMAIL", "WHATSAPP", "TELEFONE"])
		.nullable()
		.describe("Preferred contact method - look for questions like 'como você prefere', 'qual forma de contato'"),
	expectativaFechamento: z.string().nullable().describe("Closing timeline/expectation - look for 'quando pretende', 'prazo', 'timeline'"),
	possuiCapital: z.boolean().nullable().describe("Whether customer has capital to invest - infer from investment questions"),
	interesseEnergiaSolar: z.boolean().nullable().describe("Interest in solar energy - infer from enthusiasm/engagement level"),
	aptoCreditoBancario: z.boolean().nullable().describe("Eligible for bank credit - infer from financial capacity mentions"),
	notasAdicionais: z.string().nullable().describe("Any additional notes or important observations from the form"),
});

/**
 * Complete output schema
 */
export const LeadParsingOutputSchema = z.object({
	client: ClientExtractionSchema,
	opportunity: OpportunityExtractionSchema,
	confidence: z
		.enum(["high", "medium", "low"])
		.describe("high: all required fields clear | medium: required fields present with minor issues | low: required fields unclear/missing"),
	warnings: z.array(z.string()).describe("Any warnings or data quality issues"),
	rawData: z.record(z.string(), z.any()).describe("Original form data for reference"),
});

export type TLeadParsingOutput = z.infer<typeof LeadParsingOutputSchema>;

/**
 * System prompt for lead parsing
 */
const SYSTEM_PROMPT = `You are an expert data extraction system for a Brazilian solar energy CRM called "Ampere Pro".

CONTEXT:
- You work with solar energy sales leads in Brazil
- Customer segments: RESIDENCIAL (residential), COMERCIAL (commercial), INDUSTRIAL (industrial), RURAL (rural)
- Phone numbers follow Brazilian format (11 digits)
- Locations are Brazilian cities and states (UF)
- Prices are in Brazilian Real (R$)
- Forms are typically in Portuguese

EXTRACTION GUIDELINES:
1. REQUIRED fields (must extract):
   - nome: Full customer name
   - telefonePrimario: Phone number in any format

2. OPTIONAL fields (extract if available):
   - Extract location data (UF, cidade, bairro, endereco, etc.)
   - Extract personal info (profissao, estadoCivil, dataNascimento)
   - Extract contact preferences and timeline expectations

3. OPPORTUNITY MAPPING:
   - segmento: Default to RESIDENCIAL if unclear
   - valorFaturaEnergia: Look for energy bill values/ranges
   - preferenciaMeioContato: Extract from "como você prefere" type questions
   - expectativaFechamento: Extract from "quando pretende" type questions
   - possuiCapital: Infer from investment/funding questions
   - interesseEnergiaSolar: Infer from interest indicators
   - aptoCreditoBancario: Infer from financial questions

4. DATA QUALITY:
   - Clean up whitespace and normalize formats
   - Use null for missing fields
   - Provide clear warnings for data quality issues
   - Set confidence level appropriately

5. CONFIDENCE LEVELS:
   - "high": Required fields present and clear, most optional fields available
   - "medium": Required fields present but some data issues or missing optional data
   - "low": Required fields missing/unclear or severe data quality issues`;

/**
 * Parse lead data using Vercel AI SDK with Claude
 */
export async function parseLeadWithAI(rawAnswers: Record<string, any>): Promise<TLeadParsingOutput> {
	const answersText = Object.entries(rawAnswers)
		.filter(([_, value]) => value !== null && value !== undefined)
		.map(([key, value]) => `${key}: ${value}`)
		.join("\n");

	console.log("[AI_PARSER] Parsing lead with AI SDK:", {
		fieldsCount: Object.keys(rawAnswers).length,
	});

	try {
		const result = await generateObject({
			model: gateway("openai/gpt-4.1"),
			system: SYSTEM_PROMPT,
			prompt: `Please extract and structure this solar energy lead form data:\n\n${answersText}`,
			schema: LeadParsingOutputSchema,
		});

		console.log("[AI_PARSER] Successfully parsed lead:", {
			confidence: result.object.confidence,
			warnings: result.object.warnings,
		});

		return result.object;
	} catch (error) {
		console.error("[AI_PARSER] Error parsing lead:", error);
		throw new Error(`Failed to parse lead with AI: ${error instanceof Error ? error.message : String(error)}`);
	}
}

/**
 * Normalize Brazilian phone number to standard format
 */
export function normalizePhoneNumber(phone: string): string {
	const digits = phone.replace(/\D/g, "");

	if (digits.length === 11 || digits.length === 10) {
		return digits;
	}

	if (digits.length === 12 && digits.startsWith("55")) {
		return digits.slice(2);
	}

	return digits;
}

/**
 * Transform AI-parsed data into Client entity
 */
export function transformToClient(
	parsed: TLeadParsingOutput,
	metadata: {
		idParceiro: string;
		autor: {
			id: string;
			nome: string;
			avatar_url?: string;
		};
		canalAquisicao?: string;
	},
): Partial<TClient> {
	return {
		nome: parsed.client.nome,
		telefonePrimario: formatToPhone(parsed.client.telefonePrimario),
		telefonePrimarioBase: formatPhoneAsBase(parsed.client.telefonePrimario),
		email: parsed.client.email || undefined,
		cpfCnpj: parsed.client.cpfCnpj || undefined,
		uf: parsed.client.uf || "",
		cidade: parsed.client.cidade || "",
		bairro: parsed.client.bairro || undefined,
		endereco: parsed.client.endereco || undefined,
		numeroOuIdentificador: parsed.client.numeroOuIdentificador || undefined,
		complemento: parsed.client.complemento || undefined,
		cep: parsed.client.cep || undefined,
		profissao: parsed.client.profissao || undefined,
		estadoCivil: parsed.client.estadoCivil || undefined,
		dataNascimento: parsed.client.dataNascimento || undefined,
		canalAquisicao: metadata.canalAquisicao || "META_LEADS",
		idParceiro: metadata.idParceiro,
		autor: metadata.autor,
		idMarketing: "META_LEADS",
		dataInsercao: new Date().toISOString(),
		indicador: {},
	};
}

/**
 * Build opportunity description from parsed data
 */
export function buildOpportunityDescription(parsed: TLeadParsingOutput): string {
	const parts: string[] = [];

	if (parsed.opportunity.valorFaturaEnergia) {
		parts.push(`💰 Valor da fatura de energia: ${parsed.opportunity.valorFaturaEnergia}`);
	}

	if (parsed.opportunity.preferenciaMeioContato) {
		parts.push(`📞 Preferência de contato: ${parsed.opportunity.preferenciaMeioContato}`);
	}

	if (parsed.opportunity.expectativaFechamento) {
		parts.push(`📅 Expectativa de fechamento: ${parsed.opportunity.expectativaFechamento}`);
	}

	if (parsed.opportunity.possuiCapital !== null) {
		parts.push(`💵 Possui capital: ${parsed.opportunity.possuiCapital ? "Sim" : "Não"}`);
	}

	if (parsed.opportunity.aptoCreditoBancario !== null) {
		parts.push(`🏦 Apto a crédito bancário: ${parsed.opportunity.aptoCreditoBancario ? "Sim" : "Não"}`);
	}

	if (parsed.opportunity.notasAdicionais) {
		parts.push(`📝 Notas: ${parsed.opportunity.notasAdicionais}`);
	}

	if (parsed.warnings.length > 0) {
		parts.push(`\n⚠️ Avisos: ${parsed.warnings.join(", ")}`);
	}

	return parts.join("\n");
}
