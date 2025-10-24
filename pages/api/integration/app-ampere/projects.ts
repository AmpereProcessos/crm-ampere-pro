import { TUserSession } from "@/lib/auth/session";
import { getProjectContractValue } from "@/lib/project";
import connectToAmpereProjectsDatabase from "@/services/mongodb/ampere/projects-db-connection";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import { TProject } from "@/utils/schemas/project.schema";
import { TUser } from "@/utils/schemas/user.schema";
import createHttpError from "http-errors";
import { Collection, Filter, FindCursor, ObjectId } from "mongodb";
import { NextApiHandler } from "next";
import z from "zod";

const GetProjectByIdInputSchema = z.object({
	id: z
		.string({
			required_error: "ID do projeto não informado.",
			invalid_type_error: "Tipo não válido para o ID do projeto.",
		})
		.refine((id) => ObjectId.isValid(id)),
});
export type TGetProjectByIdInput = z.infer<typeof GetProjectByIdInputSchema>;
const GetManyProjectsInputSchema = z.object({
	page: z
		.string({
			required_error: "Página não informada.",
			invalid_type_error: "Tipo não válido para a página.",
		})
		.transform((page) => parseInt(page)),
	search: z
		.string({
			required_error: "Busca não informada.",
			invalid_type_error: "Tipo não válido para a busca.",
		})
		.optional()
		.nullable(),
	responsiblesIds: z
		.string({
			required_error: "IDs dos responsáveis não informados.",
			invalid_type_error: "Tipo não válido para os IDs dos responsáveis.",
		})
		.transform((ids) => ids.split(",").filter((id) => id.trim().length > 0))
		.optional()
		.nullable(),
	periodField: z
		.enum(
			[
				"contrato.dataSolicitacao",
				"contrato.dataLiberacao",
				"contrato.dataAssinatura",
				"compra.dataPagamento",
				"homologacao.acesso.dataResposta",
				"compra.dataEntrega",
				"obra.entrada",
				"obra.saida",
				"homologacao.vistoria.dataResposta",
			],
			{
				required_error: "Campo de período não informado.",
				invalid_type_error: "Tipo não válido para o campo de período.",
			},
		)
		.optional()
		.nullable(),
	periodAfter: z
		.string({
			required_error: "Período depois não informado.",
			invalid_type_error: "Tipo não válido para o período depois.",
		})
		.optional()
		.nullable(),
	periodBefore: z
		.string({
			required_error: "Período antes não informado.",
			invalid_type_error: "Tipo não válido para o período antes.",
		})
		.optional()
		.nullable(),
});
export type TGetManyProjectsInput = z.infer<typeof GetManyProjectsInputSchema>;
const GetProjectsInputSchema = z.union([GetProjectByIdInputSchema, GetManyProjectsInputSchema]);

export type TGetProjectsInput = z.infer<typeof GetProjectsInputSchema>;

async function getProjects({ input, session }: { input: TGetProjectsInput; session: TUserSession }) {
	const userOpportunityScope = session.user.permissoes.oportunidades.escopo;
	const PAGE_SIZE = 50;

	const crmDb = await connectToDatabase();
	const usersCollection: Collection<TUser> = crmDb.collection("users");
	const db = await connectToAmpereProjectsDatabase();
	const collection: Collection<TProject> = db.collection("dados");

	const users = await usersCollection
		.find(
			{},
			{
				projection: {
					_id: 1,
					nome: 1,
				},
			},
		)
		.toArray();

	if ("id" in input) {
		const project = await collection.findOne({ _id: new ObjectId(input.id) });
		if (!project) throw new createHttpError.NotFound("Projeto não encontrado.");

		const projectCommercialRepresentatives = [project.vendedor?.nome, project.insider].filter((r) => !!r) as string[];

		// If the user has an opportunity scope, then he has limited visibility
		// In this case, we gotta check if within his visibility, he will have access to this project
		if (userOpportunityScope) {
			const userOpportunityScopeUserNames = userOpportunityScope
				.map((uId) => users.find((u) => u._id.toString() === uId)?.nome)
				.filter((r) => !!r) as string[];
			// If none of the project commercial representatives are within the user opportunity scope, throw an error
			if (projectCommercialRepresentatives.every((r) => !userOpportunityScopeUserNames.includes(r))) {
				throw new createHttpError.Forbidden("Você não tem permissão para acessar este projeto.");
			}
		}
		return {
			data: {
				default: undefined,
				byId: {
					_id: project._id.toString(),
					inxedador: project.qtde,
					nome: project.nomeDoContrato,
					telefone: project.telefone,
					email: project.email,
					cpfCnpj: project.cpf_cnpj,
					codigo: project.codigoSVB,
					tipo: project.tipoDeServico,
					cep: project.cep,
					uf: project.uf,
					cidade: project.cidade,
					bairro: project.bairro,
					logradouro: project.logradouro,
					numeroOuIdentificador: project.numeroResidencia,
					vendedor: project.vendedor?.nome,
					insider: project.insider,
					valor: getProjectContractValue({
						projectValue: project.sistema?.valorProjeto,
						paValue: project.padrao?.valor,
						structureValue: project.estruturaPersonalizada?.valor,
						oemValue: project.oem?.valor,
						insuranceValue: project.seguro?.valor,
					}),
					metadados: {
						potencia: project.sistema?.potPico,
					},
					contrato: {
						status: project.contrato?.status,
						dataSolicitacao: project.contrato?.dataSolicitacao,
						dataLiberacao: project.contrato?.dataLiberacao,
						dataAssinatura: project.contrato?.dataAssinatura,
					},
					compra: {
						status: project.compra?.status,
						dataPedido: project.compra?.dataPedido,
						dataPagamento: project.compra?.dataPagamento,
						dataEntrega: project.compra?.dataEntrega,
					},
					homologacao: {
						status: project.homologacao?.status,
						acessoDataSolicitacao: project.homologacao?.acesso?.dataSolicitacao,
						acessoDataResposta: project.homologacao?.acesso?.dataResposta,
						vistoriaDataSolicitacao: project.homologacao?.vistoria?.dataSolicitacao,
						vistoriaDataEfetivacao: project.homologacao?.vistoria?.dataEfetivacao,
					},
					execucao: {
						inicio: project.obra?.entrada,
						fim: project.obra?.saida,
						status: project.obra?.statusDaObra,
					},
				},
			},
		};
	}

	const searchQuery: Filter<TProject> =
		input.search && input.search.trim().length > 0
			? {
					$or: [
						{
							nomeDoContrato: { $regex: input.search, $options: "i" },
						},
						{
							nomeDoContrato: input.search,
						},
					],
				}
			: {};

	const responsiblesIds = input.responsiblesIds ?? [];
	const responsiblesNames = responsiblesIds.length > 0 ? users.filter((u) => responsiblesIds.includes(u._id.toString())).map((u) => u.nome) : [];

	const responsiblesQuery: Filter<TProject> =
		responsiblesIds.length > 0
			? {
					$or: [
						{
							"vendedor.nome": { $in: responsiblesNames },
						},
						{
							insider: { $in: responsiblesNames },
						},
					],
				}
			: {};

	const periodQuery =
		input.periodField && input.periodAfter && input.periodBefore
			? {
					[input.periodField]: { $gte: input.periodAfter, $lte: input.periodBefore },
				}
			: {};

	const queriesArray = [searchQuery, responsiblesQuery, periodQuery].filter((q) => Object.keys(q).length > 0);
	const query: Filter<TProject> =
		queriesArray.length > 0
			? {
					$and: queriesArray,
				}
			: {};

	console.log(JSON.stringify(query, null, 2));
	const projectsMatched = await collection.countDocuments(query);

	const skip = PAGE_SIZE * (Number(input.page) - 1);
	const limit = PAGE_SIZE;

	const sort: Parameters<FindCursor<TProject>["sort"]>[0] = { qtde: -1 };
	const projects = await collection.find(query).sort(sort).skip(skip).limit(limit).toArray();

	const totalPages = Math.ceil(projectsMatched / PAGE_SIZE);
	return {
		data: {
			default: {
				projectsMatched,
				totalPages,
				projects: projects.map((project) => ({
					inxedador: project.qtde,
					_id: project._id.toString(),
					nome: project.nomeDoContrato,
					telefone: project.telefone,
					email: project.email,
					cpfCnpj: project.cpf_cnpj,
					codigo: project.codigoSVB,
					tipo: project.tipoDeServico,
					cep: project.cep,
					uf: project.uf,
					cidade: project.cidade,
					bairro: project.bairro,
					logradouro: project.logradouro,
					numeroOuIdentificador: project.numeroResidencia,
					vendedor: project.vendedor?.nome,
					insider: project.insider,
					valor: getProjectContractValue({
						projectValue: project.sistema?.valorProjeto,
						paValue: project.padrao?.valor,
						structureValue: project.estruturaPersonalizada?.valor,
						oemValue: project.oem?.valor,
						insuranceValue: project.seguro?.valor,
					}),
					contrato: {
						status: project.contrato?.status,
						dataSolicitacao: project.contrato?.dataSolicitacao,
						dataLiberacao: project.contrato?.dataLiberacao,
						dataAssinatura: project.contrato?.dataAssinatura,
					},
					compra: {
						status: project.compra?.status,
						dataPedido: project.compra?.dataPedido,
						dataPagamento: project.compra?.dataPagamento,
						dataEntrega: project.compra?.dataEntrega,
					},
					homologacao: {
						status: project.homologacao?.status,
						acessoDataSolicitacao: project.homologacao?.acesso?.dataSolicitacao,
						acessoDataResposta: project.homologacao?.acesso?.dataResposta,
						vistoriaDataSolicitacao: project.homologacao?.vistoria?.dataSolicitacao,
						vistoriaDataEfetivacao: project.homologacao?.vistoria?.dataEfetivacao,
					},
					execucao: {
						inicio: project.obra?.entrada,
						fim: project.obra?.saida,
						status: project.obra?.statusDaObra,
					},
				})),
			},
			byId: undefined,
		},
	};
}
export type TGetProjectsOutput = Awaited<ReturnType<typeof getProjects>>;
export type TGetProjectsOutputDefault = Exclude<TGetProjectsOutput["data"]["default"], undefined>;
export type TGetProjectsOutputById = Exclude<TGetProjectsOutput["data"]["byId"], undefined>;

const getProjectsHandler: NextApiHandler<TGetProjectsOutput> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);

	const input = GetProjectsInputSchema.parse(req.query);
	const response = await getProjects({ input, session });
	return res.status(200).json(response);
};

type PutResponse = {
	data: string;
	message: string;
};
const updateProject: NextApiHandler<PutResponse> = async (req, res) => {
	await validateAuthenticationWithSession(req, res);

	const { id } = req.query;
	if (!id || typeof id != "string" || !ObjectId.isValid(id)) throw new createHttpError.BadRequest("ID inválido.");

	const changes = req.body;
	const db = await connectToAmpereProjectsDatabase();
	const collection: Collection<TProject> = db.collection("dados");

	const updateResponse = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { ...changes } });

	if (!updateResponse.acknowledged) throw new createHttpError.InternalServerError("Oops, ocorreu um erro ao atualizar o projeto.");

	return res.status(200).json({ data: "Projeto atualizado com sucesso !", message: "Projeto atualizado com sucesso !" });
};

export default apiHandler({ GET: getProjectsHandler, PUT: updateProject });
