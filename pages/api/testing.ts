import { formatDateAsLocale } from "@/lib/methods/formatting";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { novu } from "@/services/novu";
import { apiHandler } from "@/utils/api";
import { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { TUser } from "@/utils/schemas/user.schema";
import { AnyBulkWriteOperation } from "mongodb";
import { NextApiHandler } from "next";

const interval = {
	start: "2024-01-01T00:00:00.000Z",
	end: "2024-12-31T23:59:59.999Z",
};

type GetResponse = any;
const getManualTesting: NextApiHandler<GetResponse> = async (req, res) => {
	const db = await connectToDatabase();

	const usersCollection = db.collection<TUser>("users");
	const updateResponse = await usersCollection.updateMany(
		{},
		{
			$set: {
				comissionamento: [],
			},
		},
	);

	return res.status(200).json(updateResponse);
};

export default apiHandler({ GET: getManualTesting });
