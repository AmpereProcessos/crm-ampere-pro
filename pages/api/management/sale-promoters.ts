import { getSalePromoters } from "@/repositories/users/queries";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthentication, validateAuthenticationWithSession } from "@/utils/api";
import { IUsuario } from "@/utils/models";
import { TUser, TUserDTOWithSaleGoals } from "@/utils/schemas/user.schema";
import { Collection, Filter, WithId } from "mongodb";
import { NextApiHandler } from "next";
type GetResponse = {
	data: TUserDTOWithSaleGoals[];
};
const getSalePromotersMethod: NextApiHandler<GetResponse> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);
	const partnerId = session.user.idParceiro;
	const parterScope = session.user.permissoes.parceiros.escopo;
	const partnerQuery: Filter<TUser> = { idParceiro: parterScope ? { $in: parterScope } : { $ne: undefined } };

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const usersCollection: Collection<TUser> = db.collection("users");
	const salePromoters = await getSalePromoters({ collection: usersCollection, query: partnerQuery });
	return res.status(200).json({ data: salePromoters as WithId<TUserDTOWithSaleGoals>[] });
};

export default apiHandler({ GET: getSalePromotersMethod });
