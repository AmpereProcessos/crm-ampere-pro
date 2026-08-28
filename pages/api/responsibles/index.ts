import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthentication } from "@/utils/api";
import { IResponsible } from "@/utils/models";
import createHttpError from "http-errors";
import { ObjectId } from "mongodb";
import { NextApiHandler } from "next";

type GetResponse = {
	data: IResponsible[] | IResponsible;
};

const getResponsibles: NextApiHandler<GetResponse> = async (req, res) => {
	await validateAuthentication(req, res);
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const collection = db.collection("users");
	const { id } = req.query;
	if (id && typeof id === "string") {
		const dbResponse = await collection
			.aggregate([
				{
					$match: {
						_id: new ObjectId(id),
						"permissoes.projetos.serResponsavel": true,
					},
				},
				{
					$project: {
						_id: 1,
						nome: 1,
						avatar_url: 1,
						telefone: 1,
						email: 1,
					},
				},
			])
			.toArray() as Array<{ _id: ObjectId; nome: string; avatar_url?: string; telefone?: string; email?: string }>;
		if (!dbResponse[0]) throw new createHttpError.NotFound("Nenhum responsável encontrado com esse ID.");
		const responsible = {
			id: dbResponse[0]._id.toString(),
			nome: dbResponse[0].nome,
			avatar_url: dbResponse[0].avatar_url,
			telefone: dbResponse[0].telefone,
			email: dbResponse[0].email,
		};

		res.status(200).json({ data: responsible });
	} else {
		const dbResponse = await collection
			.aggregate([
				{
					$match: {
						"permissoes.projetos.serResponsavel": true,
					},
				},
				{
					$project: { _id: 1, nome: 1, avatar_url: 1, telefone: 1, email: 1 },
				},
			])
			.toArray() as Array<{ _id: ObjectId; nome: string; avatar_url?: string; telefone?: string; email?: string }>;
		const responsibles = dbResponse.map((resp) => {
			return {
				id: resp._id.toString(),
				nome: resp.nome,
				avatar_url: resp.avatar_url,
				telefone: resp.telefone,
				email: resp.email,
			};
		});
		res.status(200).json({ data: responsibles });
	}
};

export default apiHandler({
	GET: getResponsibles,
});
