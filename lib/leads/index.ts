import { CreditCard, PiggyBank, Receipt, SparkleIcon } from "lucide-react";

export const DEFAULT_LEAD_QUALIFICATION_ATTRIBUTES = [
	{
		icon: SparkleIcon,
		identifier: "possui_interesse",
		name: "INTERESSADO",
		call: "Responda se o cliente está interessado em solar.",
		inputType: "select",
		inputPlaceholder: "Selecione se o cliente está interessado em solar.",
		inputOptions: [
			{ id: 1, label: "SIM", value: "SIM", weightMultipler: 1 },
			{ id: 2, label: "NÃO", value: "NÃO", weightMultipler: 0 },
		],
		weight: 5,
	},
	{
		icon: Receipt,
		identifier: "valor_conta_energia",
		name: "VALOR DA CONTA DE ENERGIA",
		call: "Escolha qual a faixa de valor da conta de energia do cliente.",
		inputType: "select",
		inputPlaceholder:
			"Selecione a faixa de valor da conta de energia do cliente.",
		inputOptions: [
			{
				id: 1,
				label: "R$ 0,00 à R$ 100,00",
				value: "R$ 0,00 à R$ 100,00",
				weightMultipler: 1,
			},
			{
				id: 2,
				label: "R$ 100,00 à R$ 300,00",
				value: "R$ 100,00 à R$ 200,00",
				weightMultipler: 1,
			},
			{
				id: 3,
				label: "R$ 300,00 à R$ 500,00",
				value: "R$ 300,00 à R$ 500,00",
				weightMultipler: 1,
			},
			{
				id: 4,
				label: "R$ 500,00 à R$ 1000,00",
				value: "R$ 500,00 à R$ 1000,00",
				weightMultipler: 1,
			},
			{
				id: 5,
				label: "+ R$ 1000,00",
				value: "+ R$ 1000,00",
				weightMultipler: 1,
			},
		],
		weight: 1,
	},
	{
		icon: PiggyBank,
		identifier: "possui_capital",
		name: "POSSUI CAPITAL PARA INVESTIR",
		call: "Escolha se o cliente possui capital para investir.",
		inputType: "select",
		inputPlaceholder: "Selecione se o cliente possui capital para investir.",
		inputOptions: [
			{ id: 1, label: "SIM", value: "SIM", weightMultipler: 1 },
			{ id: 2, label: "NÃO", value: "NÃO", weightMultipler: 0.5 },
		],
		weight: 3,
	},
	{
		icon: CreditCard,
		identifier: "credito_bancario",
		name: "APTO A RECORRER À CREDITO BANCÁRIO",
		call: "Responda se o cliente está apto a recorrer à crédito bancário.",
		inputType: "select",
		inputPlaceholder:
			"Selecione se o cliente está apto a recorrer à crédito bancário.",
		inputOptions: [
			{ id: 1, label: "SIM", value: "SIM", weightMultipler: 1 },
			{ id: 2, label: "NÃO", value: "NÃO", weightMultipler: 0.5 },
		],
		weight: 1,
	},
];

// Meta Graph API Types
export type TMetaLeadFieldData = {
	name: string;
	values: string[];
};

export type TMetaLeadData = {
	id: string;
	created_time: number;
	field_data: TMetaLeadFieldData[];
	ad_id?: string;
	adset_id?: string;
	campaign_id?: string;
	form_id: string;
	page_id: string;
	platform?: string;
	tracking_parameters?: Record<string, string>;
};

export type TMetaAdData = {
	id: string;
	name: string;
	adset_id: string;
	campaign_id: string;
	status?: string;
	creative?: {
		id: string;
		name?: string;
	};
};

export type TMetaAdsetData = {
	id: string;
	name: string;
	campaign_id: string;
	status?: string;
	targeting?: Record<string, unknown>;
};

export type TMetaCampaignData = {
	id: string;
	name: string;
	status?: string;
	objective?: string;
};

export type TMetaPageData = {
	id: string;
	name: string;
};

export type TMetaFormData = {
	id: string;
	name: string;
	status?: string;
	locale?: string;
};

export type TEnrichedMetaLead = {
	leadgen_id: string;
	created_time: number;
	answers: Record<string, string | undefined>;
	ad?: TMetaAdData;
	adset?: TMetaAdsetData;
	campaign?: TMetaCampaignData;
	page?: TMetaPageData;
	form?: TMetaFormData;
	tracking_parameters?: Record<string, string>;
	platform?: string;
};

// Meta Graph API Helpers
const META_GRAPH_API_VERSION = "v21.0";
const META_GRAPH_API_BASE_URL = `https://graph.facebook.com/${META_GRAPH_API_VERSION}`;

/**
 * Fetches lead data from Meta Graph API
 */
export async function fetchMetaLeadData(
	leadgenId: string,
	accessToken: string,
): Promise<TMetaLeadData> {
	const fields = [
		"created_time",
		"field_data",
		"ad_id",
		"adset_id",
		"campaign_id",
		"form_id",
		"page_id",
		"platform",
		"tracking_parameters",
	].join(",");

	const url = `${META_GRAPH_API_BASE_URL}/${leadgenId}?fields=${fields}&access_token=${accessToken}`;

	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Failed to fetch Meta lead data: ${JSON.stringify(error)}`);
	}

	return response.json();
}

/**
 * Fetches ad data from Meta Graph API
 */
export async function fetchMetaAdData(
	adId: string,
	accessToken: string,
): Promise<TMetaAdData> {
	const fields = [
		"name",
		"adset_id",
		"campaign_id",
		"status",
		"creative{id,name}",
	].join(",");

	const url = `${META_GRAPH_API_BASE_URL}/${adId}?fields=${fields}&access_token=${accessToken}`;

	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Failed to fetch Meta ad data: ${JSON.stringify(error)}`);
	}

	return response.json();
}

/**
 * Fetches adset data from Meta Graph API
 */
export async function fetchMetaAdsetData(
	adsetId: string,
	accessToken: string,
): Promise<TMetaAdsetData> {
	const fields = ["name", "campaign_id", "status", "targeting"].join(",");

	const url = `${META_GRAPH_API_BASE_URL}/${adsetId}?fields=${fields}&access_token=${accessToken}`;

	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Failed to fetch Meta adset data: ${JSON.stringify(error)}`,
		);
	}

	return response.json();
}

/**
 * Fetches campaign data from Meta Graph API
 */
export async function fetchMetaCampaignData(
	campaignId: string,
	accessToken: string,
): Promise<TMetaCampaignData> {
	const fields = ["name", "status", "objective"].join(",");

	const url = `${META_GRAPH_API_BASE_URL}/${campaignId}?fields=${fields}&access_token=${accessToken}`;

	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Failed to fetch Meta campaign data: ${JSON.stringify(error)}`,
		);
	}

	return response.json();
}

/**
 * Fetches page data from Meta Graph API
 */
export async function fetchMetaPageData(
	pageId: string,
	accessToken: string,
): Promise<TMetaPageData> {
	const fields = ["name"].join(",");

	const url = `${META_GRAPH_API_BASE_URL}/${pageId}?fields=${fields}&access_token=${accessToken}`;

	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Failed to fetch Meta page data: ${JSON.stringify(error)}`);
	}

	return response.json();
}

/**
 * Fetches form data from Meta Graph API
 */
export async function fetchMetaFormData(
	formId: string,
	accessToken: string,
): Promise<TMetaFormData> {
	const fields = ["name", "status", "locale"].join(",");

	const url = `${META_GRAPH_API_BASE_URL}/${formId}?fields=${fields}&access_token=${accessToken}`;

	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Failed to fetch Meta form data: ${JSON.stringify(error)}`);
	}

	return response.json();
}

/**
 * Enriches Meta lead data with ad, adset, campaign, page, and form information
 */
export async function enrichMetaLead(
	leadData: TMetaLeadData,
	accessToken: string,
): Promise<TEnrichedMetaLead> {
	const answers = leadData.field_data.reduce<
		Record<string, string | undefined>
	>((acc, field) => {
		acc[field.name] = field.values?.at(0);
		return acc;
	}, {});

	const enrichedLead: TEnrichedMetaLead = {
		leadgen_id: leadData.id,
		created_time: leadData.created_time,
		answers,
		tracking_parameters: leadData.tracking_parameters,
		platform: leadData.platform,
	};

	// Fetch ad, adset, and campaign data in parallel if available
	const promises: Promise<void>[] = [];

	if (leadData.ad_id) {
		promises.push(
			fetchMetaAdData(leadData.ad_id, accessToken)
				.then((adData) => {
					enrichedLead.ad = adData;
				})
				.catch((error) => {
					console.error(
						`[ERROR] Failed to fetch ad data for ${leadData.ad_id}:`,
						error,
					);
				}),
		);
	}

	if (leadData.adset_id) {
		promises.push(
			fetchMetaAdsetData(leadData.adset_id, accessToken)
				.then((adsetData) => {
					enrichedLead.adset = adsetData;
				})
				.catch((error) => {
					console.error(
						`[ERROR] Failed to fetch adset data for ${leadData.adset_id}:`,
						error,
					);
				}),
		);
	}

	if (leadData.campaign_id) {
		promises.push(
			fetchMetaCampaignData(leadData.campaign_id, accessToken)
				.then((campaignData) => {
					enrichedLead.campaign = campaignData;
				})
				.catch((error) => {
					console.error(
						`[ERROR] Failed to fetch campaign data for ${leadData.campaign_id}:`,
						error,
					);
				}),
		);
	}

	if (leadData.page_id) {
		promises.push(
			fetchMetaPageData(leadData.page_id, accessToken)
				.then((pageData) => {
					enrichedLead.page = pageData;
				})
				.catch((error) => {
					console.error(
						`[ERROR] Failed to fetch page data for ${leadData.page_id}:`,
						error,
					);
				}),
		);
	}

	if (leadData.form_id) {
		promises.push(
			fetchMetaFormData(leadData.form_id, accessToken)
				.then((formData) => {
					enrichedLead.form = formData;
				})
				.catch((error) => {
					console.error(
						`[ERROR] Failed to fetch form data for ${leadData.form_id}:`,
						error,
					);
				}),
		);
	}

	await Promise.all(promises);

	return enrichedLead;
}
