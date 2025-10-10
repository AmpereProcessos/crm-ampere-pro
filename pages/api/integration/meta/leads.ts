import { apiHandler } from "@/utils/api";
import type { NextApiHandler } from "next";
import z from "zod";

type VerifyMetaHandlerResponse = string | { error: string };

const verifyMetaHandler: NextApiHandler<VerifyMetaHandlerResponse> = async (
	req,
	res,
) => {
	console.log("[INFO] [WHATSAPP_WEBHOOK] [VERIFY] Query received:", req.query);
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
			console.log("WEBHOOK_VERIFIED");
			return res.status(200).send(challenge as string);
		}

		// Responds with '403 Forbidden' if verify tokens do not match
		console.log("WEBHOOK_VERIFICATION_FAILED");
		return res.status(403).json({ error: "Verification failed" });
	}

	return res.status(400).json({ error: "Missing parameters" });
};

type TGetMetaLeadsHandlerResponse = {
	message: string;
};

const getMetaLeadsHandler: NextApiHandler<
	TGetMetaLeadsHandlerResponse
> = async (req, res) => {
	const payload = req.body;
	const query = req.query;
	const headers = req.headers;

	console.log("PAYLOAD", payload);
	console.log("QUERY", query);
	console.log("HEADERS", headers);

	return res
		.status(200)
		.json({ message: "Facebook leads fetched successfully" });
};

export default apiHandler({
	GET: verifyMetaHandler,
	POST: getMetaLeadsHandler,
});
