import { getPartnerOwnInformation, getPartnersSimplified } from "@/repositories/partner-simplified/query";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { TPartner, TPartnerSimplified } from "@/utils/schemas/partner.schema";
import createHttpError from "http-errors";
import { Collection, Filter, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type GetResponse = {
	data: TPartnerSimplified | TPartnerSimplified[];
};
const getPartnerSimplified: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TPartner> = parterScope ? { _id: { $in: [...parterScope.map((i) => new ObjectId(i))] } } : {};

	const { id } = req.query;
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const partnersCollection: Collection<TPartner> = db.collection("partners");

	if (id) {
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

		const partner = await getPartnerOwnInformation({ collection: partnersCollection, id: id });
		if (!partner) throw new createHttpError.NotFound("Parceiro não encontrado.");
		res.json({ data: partner });
	}
	const partners = await getPartnersSimplified({ collection: partnersCollection, query: partnerQuery });

	return res.status(200).json({ data: partners });
};

export default apiHandler({
	GET: getPartnerSimplified,
});
