import type { NextApiHandler } from "next";

const handler: NextApiHandler = (_request, response) => {
	response.status(501).json({ message: "Not implemented" });
};

export default handler;
