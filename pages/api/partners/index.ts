import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAdminAuthorizaton, validateAuthenticationWithSession, validateAuthorization } from "@/utils/api";
import { InsertPartnerSchema, TPartner, TPartnerEntity, TPartnerDTOWithUsers } from "@/utils/schemas/partner.schema";
import createHttpError from "http-errors";
import { Collection, ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type PostResponse = {
	data: string;
};
const createPartner: NextApiHandler<PostResponse> = async (req, res) => {
	// Validating authorization and payload
	const session = await validateAuthorization(req, res, "parceiros", "criar", true);
	const insertInfo = InsertPartnerSchema.parse(req.body);

	// Passed validations
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const partnersCollection: Collection<TPartner> = db.collection("partners");
	const insertResponse = await partnersCollection.insertOne(insertInfo);
	if (insertResponse.acknowledged) return res.status(201).json({ data: "Parceiro criado com sucesso !" });
	else throw new createHttpError.InternalServerError("Erro ao cadastrar parceiro.");
};

type GetResponse = {
	data: TPartner | TPartnerDTOWithUsers[];
};
const getClients: NextApiHandler<GetResponse> = async (req, res) => {
	// Validating authorization and payload
	const session = await validateAuthorization(req, res, "parceiros", "visualizar", true);
	const partnerId = session.user.idParceiro;
	const partnerScope = session.user.permissoes.parceiros.escopo;

	const { id } = req.query;

	// Passed validations
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const partnersCollection: Collection<TPartner> = db.collection("partners");

	if (id) {
		console.log(id);
		if (typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");
		if (!!partnerScope && !partnerScope.includes(id)) throw new createHttpError.Unauthorized("Nível de autorização insuficiente.");

		const partner = await partnersCollection.findOne({ _id: new ObjectId(id) });
		if (!partner) throw new createHttpError.NotFound("Nenhum parceiro encontrado com esse ID.");
		return res.status(200).json({ data: partner });
	}

	const partners = await partnersCollection
		.aggregate([
			{
				$addFields: {
					partnerIdString: {
						$toString: "$_id",
					},
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "partnerIdString",
					foreignField: "idParceiro",
					as: "usuarios",
				},
			},
		])
		.toArray();
	return res.status(200).json({ data: partners as TPartnerDTOWithUsers[] });
};

type PutResponse = {
	data: string;
	message: string;
};

const editPartners: NextApiHandler<PutResponse> = async (req, res) => {
	const session = await validateAuthorization(req, res, "parceiros", "editar", true);
	const partnerId = session.user.idParceiro;
	const partnerScope = session.user.permissoes.parceiros.escopo;

	const { id } = req.query;
	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido ou não fornecido.");

	if (!!partnerScope && !partnerScope.includes(id)) throw new createHttpError.Unauthorized("Nível de autorização insuficiente.");

	const changes = InsertPartnerSchema.partial().parse(req.body);

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const partnersCollection: Collection<TPartner> = db.collection("partners");

	const updateResponse = await partnersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { ...changes } });

	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, houve um erro na atualização do parceiro.");
	if (updateResponse.matchedCount == 0) throw new createHttpError.NotFound("Parceiro não encontrado.");

	return res.status(201).json({ data: "Parceiro atualizado com sucesso !", message: "Parceiro atualizado com sucesso !" });
};

export default apiHandler({ POST: createPartner, GET: getClients, PUT: editPartners });
