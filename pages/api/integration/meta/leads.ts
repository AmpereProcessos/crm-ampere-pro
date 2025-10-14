import { enrichMetaLead, fetchMetaLeadData } from "@/lib/leads";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import type { NextApiHandler } from "next";
import z from "zod";

type VerifyMetaHandlerResponse = string | { error: string };

const verifyMetaHandler: NextApiHandler<VerifyMetaHandlerResponse> = async (
	req,
	res,
) => {
	console.log("[INFO] [META_WEBHOOK] [VERIFY] Query received:", req.query);
	const mode = req.query["hub.mode"];
	const token = req.query["hub.verify_token"];
	const challenge = req.query["hub.challenge"];

	if (mode && token) {
		// Check if a token and mode were sent
		// Check the mode and token sent are correct
		if (
			mode === "subscribe" &&
			token === process.env.META_WEBHOOK_VERIFY_TOKEN
		) {
			// Respond with 200 OK and challenge token from the request
			console.log(
				"[INFO] [META_WEBHOOK] [VERIFY] Webhook verified successfully",
			);
			return res.status(200).send(challenge as string);
		}

		// Responds with '403 Forbidden' if verify tokens do not match
		console.log("[ERROR] [META_WEBHOOK] [VERIFY] Webhook verification failed");
		return res.status(403).json({ error: "Verification failed" });
	}

	return res.status(400).json({ error: "Missing parameters" });
};

type TGetMetaLeadsHandlerResponse = {
	message: string;
	enrichedLead?: unknown;
};

const getMetaLeadsHandler: NextApiHandler<
	TGetMetaLeadsHandlerResponse
> = async (req, res) => {
	const payload = req.body;

	console.log(
		"[INFO] [META_WEBHOOK] [POST] Webhook payload received:",
		JSON.stringify(payload, null, 2),
	);

	const db = await connectToDatabase();
	const metaLeadsRawCollection = db.collection("meta_leads_raw");
	const metaLeadsEnrichedCollection = db.collection("meta_leads_enriched");

	// Store raw webhook payload
	await metaLeadsRawCollection.insertOne({
		...payload,
		receivedAt: new Date().toISOString(),
	});

	// Extract leadgen_id from the webhook payload
	const leadgenId = payload.entry?.at(0)?.changes?.at(0)?.value?.leadgen_id;

	if (!leadgenId) {
		console.log("[WARN] [META_WEBHOOK] [POST] No leadgen_id found in payload");
		return res.status(200).json({
			message: "Webhook received but no leadgen_id found",
		});
	}

	console.log("[INFO] [META_WEBHOOK] [POST] Processing lead:", leadgenId);

	// Get access token from environment
	const accessToken = process.env.META_SYSTEM_USER_TOKEN;

	if (!accessToken) {
		console.error(
			"[ERROR] [META_WEBHOOK] [POST] META_SYSTEM_USER_TOKEN not configured",
		);
		return res.status(500).json({
			message: "Server configuration error: Missing access token",
		});
	}

	try {
		// Fetch lead data from Meta Graph API
		console.log(
			"[INFO] [META_WEBHOOK] [POST] Fetching lead data from Meta Graph API",
		);
		const leadData = await fetchMetaLeadData(leadgenId, accessToken);

		console.log(
			"[INFO] [META_WEBHOOK] [POST] Lead data fetched:",
			JSON.stringify(leadData, null, 2),
		);

		// Enrich lead with ad, adset, campaign, page, and form data
		console.log("[INFO] [META_WEBHOOK] [POST] Enriching lead data");
		const enrichedLead = await enrichMetaLead(leadData, accessToken);

		console.log(
			"[INFO] [META_WEBHOOK] [POST] Enriched lead:",
			JSON.stringify(enrichedLead, null, 2),
		);

		// Store enriched lead
		await metaLeadsEnrichedCollection.insertOne({
			...enrichedLead,
			processedAt: new Date().toISOString(),
		});

		console.log("[INFO] [META_WEBHOOK] [POST] Lead processed successfully");

		return res.status(200).json({
			message: "Meta lead processed successfully",
			enrichedLead,
		});
	} catch (error) {
		console.error(
			"[ERROR] [META_WEBHOOK] [POST] Failed to process lead:",
			error,
		);

		// Store error for debugging
		await metaLeadsRawCollection.updateOne(
			{ "entry.0.changes.0.value.leadgen_id": leadgenId },
			{
				$set: {
					processingError:
						error instanceof Error ? error.message : String(error),
					erroredAt: new Date().toISOString(),
				},
			},
		);

		// Still return 200 to Meta to acknowledge receipt
		return res.status(200).json({
			message: "Webhook received but processing failed",
		});
	}
};

export default apiHandler({
	GET: verifyMetaHandler,
	POST: getMetaLeadsHandler,
});
