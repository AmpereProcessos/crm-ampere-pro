import { formatToSlug } from "@/lib/methods/formatting";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import type { TAcquisitionChannel, TUtil } from "@/utils/schemas/utils";
import { CustomersAcquisitionChannels } from "@/utils/select-options";
import type { Collection } from "mongodb";
import type { NextApiHandler } from "next";

const handleGeneralFixing: NextApiHandler<any> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);

	const newAcquisitionChannels: TAcquisitionChannel[] = CustomersAcquisitionChannels.map((c) => ({
		identificador: "ACQUISITION_CHANNEL",
		valor: c.value,
		slug: formatToSlug(c.value),
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url,
		},
		dataInsercao: new Date().toISOString(),
	}));

	const db = await connectToDatabase();
	const collection: Collection<TUtil> = db.collection("utils");

	const insertAcquisitionChannelsResponse = await collection.insertMany(newAcquisitionChannels);

	return res.status(200).json({
		message: "Canais de aquisição adicionados com sucesso !",
		data: insertAcquisitionChannelsResponse,
	});
};

export default apiHandler({
	GET: handleGeneralFixing,
});
