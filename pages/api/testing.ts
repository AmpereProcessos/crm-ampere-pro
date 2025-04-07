import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { NextApiHandler } from "next";

const interval = {
	start: "2024-01-01T00:00:00.000Z",
	end: "2024-12-31T23:59:59.999Z",
};

type GetResponse = any;
const getManualTesting: NextApiHandler<GetResponse> = async (req, res) => {
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");

	const opportunitiesCollection = db.collection<TOpportunity>("opportunities");

	const specificSellerOpportunities = await opportunitiesCollection
		.find({
			"responsaveis.id": "65b54b8cc7f0cebdc92e7ffb",
			dataInsercao: {
				$gte: interval.start,
				$lte: interval.end,
			},
		})
		.toArray();

	const opportunitiesSent = specificSellerOpportunities.filter((opportunity) => {
		// If opportunity has less the 2 responsaveis, return false
		if (opportunity.responsaveis.length < 2) return false;

		const opportunitySDR = opportunity.responsaveis.find((responsavel) => responsavel.papel === "SDR");
		if (!opportunitySDR) return false;

		// If specific user is not the opportunitie s SDR, return false
		if (opportunitySDR.id !== "65b54b8cc7f0cebdc92e7ffb") return false;

		const opportunitiySeller = opportunity.responsaveis.find((responsavel) => responsavel.papel === "VENDEDOR");
		if (!opportunitiySeller) return false;

		return true;
	});

	console.log(opportunitiesSent.length);
	return res.status(200).json(opportunitiesSent);
};

export default apiHandler({ GET: getManualTesting });
