import { apiHandler } from "@/utils/api";
import type { NextApiHandler } from "next";
import z from "zod";

const getFacebookLeadsHandler: NextApiHandler<any> = async (req, res) => {
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
	GET: getFacebookLeadsHandler,
	POST: getFacebookLeadsHandler,
});
