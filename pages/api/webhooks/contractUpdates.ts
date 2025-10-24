import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import createHttpError from "http-errors";
import { Db, ObjectId } from "mongodb";
import { NextApiHandler } from "next";
import { z } from "zod";
type PostResponse = {
	data: string;
};

const updateObjectSchema = z.object({
	permission: z.literal(process.env.INTERNAL_PERMISSION_SECRET, {
		required_error: "Chave de permissão não informada ou inválida.",
		invalid_type_error: "Tipo informado para chave de permissão inválido.",
	}),
	operation: z.union([z.literal("SET_AS_SIGNED"), z.literal("SET_AS_UNSIGNED")], {
		invalid_type_error: "Tipo de operação inválido.",
		required_error: "Tipo de operação não informado ou inválido.",
	}),
	proposalId: z
		.string({ required_error: "ID da proposta não informado ou inválido.", invalid_type_error: "Tipo do ID da proposta inválido." })
		.optional(),
	projectId: z
		.string({ required_error: "ID do projeto não informado ou inválido.", invalid_type_error: "Tipo do ID do projeto inválido." })
		.optional(),
	signingDate: z
		.string({
			required_error: "Data de assinatura não informada ou inválido.",
			invalid_type_error: "Tipo de data de assinatura inválido.",
		})
		.optional(),
	lossDate: z.string({ required_error: "Data de perda não informada ou inválido.", invalid_type_error: "Tipo de data de perda inválido." }).optional(),
});

const handleContractUpdates: NextApiHandler<PostResponse> = async (req, res) => {
	const { id } = req.query;
	if (typeof id != "string") throw new createHttpError.BadRequest("ID do projeto fornecido é inválido.");
	const { operation, proposalId, projectId, signingDate, lossDate } = updateObjectSchema.parse(req.body);
	const db: Db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const projectsCollection = db.collection("projects");
	const clientsCollection = db.collection("clients");
	const proposalsCollection = db.collection("proposals");
	if (operation == "SET_AS_SIGNED") {
		const update = {
			contrato: {
				id: projectId,
				idProposta: proposalId,
				dataAssinatura: signingDate,
			},
		};
		const project = await projectsCollection.findOne({ _id: new ObjectId(id) });
		if (!project) throw new createHttpError.NotFound("Projeto não encontrado.");
		if (project.idOportunidade) {
			const client = await clientsCollection.findOne({ _id: new ObjectId(project?.clienteId) });
			const proposal = await proposalsCollection.findOne({ _id: new ObjectId(proposalId) });
		}

		const dbResponse = await projectsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { ...update } });

		// const dbResponse = await projectsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { ...update } })
		if (dbResponse.acknowledged) return res.json({ data: "Alterações feitas com sucesso !" });
		else throw new createHttpError.InternalServerError("Erro ao atualizar projeto.");
	}
	if (operation == "SET_AS_UNSIGNED") {
		// Handling
		const update = {
			dataPerda: lossDate,
			motivoPerda: "RESCISÃO CONTRATUAL",
		};
		const dbResponse = await projectsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { ...update } });
		if (dbResponse.acknowledged) return res.json({ data: "Alterações feitas com sucesso !" });
		else throw new createHttpError.InternalServerError("Erro ao atualizar projeto.");
	}
};

export default apiHandler({
	POST: handleContractUpdates,
});
