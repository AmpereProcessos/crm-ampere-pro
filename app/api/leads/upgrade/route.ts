import { apiHandler } from "@/lib/api";
import { getValidCurrentSessionUncached, TUserSession } from "@/lib/auth/session";
import { createNovuTopicAndSubscribeResponsibles } from "@/pages/api/opportunities/personalized";
import { insertClient } from "@/repositories/clients/mutations";
import { insertFunnelReference } from "@/repositories/funnel-references/mutations";
import { insertOpportunity } from "@/repositories/opportunities/mutations";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { TClient } from "@/utils/schemas/client.schema";
import { TFunnelReference } from "@/utils/schemas/funnel-reference.schema";
import { TLead } from "@/utils/schemas/leads.schema";
import { TOpportunityHistory } from "@/utils/schemas/opportunity-history.schema";
import { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { TProjectType } from "@/utils/schemas/project-types.schema";
import { TUser } from "@/utils/schemas/user.schema";
import createHttpError from "http-errors";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { UpgrateLeadInputSchema } from "./input";

export type TUpgrateLeadInput = z.infer<typeof UpgrateLeadInputSchema>;

async function upgrateLead({ input, session }: { input: TUpgrateLeadInput; session: TUserSession }) {
	const db = await connectToDatabase();
	const leadsCollection = db.collection<TLead>("leads");
	const usersCollection = db.collection<TUser>("users");
	const clientsCollection = db.collection<TClient>("clients");
	const opportunitiesCollection = db.collection<TOpportunity>("opportunities");
	const funnelReferencesCollection = db.collection<TFunnelReference>("funnel-references");
	const opportunitiesHistoryCollection = db.collection<TOpportunityHistory>("opportunities-history");
	const projectTypesCollection = db.collection<TProjectType>("project-types");

	const lead = await leadsCollection.findOne({ _id: new ObjectId(input.leadId) });
	if (!lead) {
		throw new createHttpError.NotFound("Lead não encontrado.");
	}
	if (!lead.nome || lead.nome.trim().length < 3) {
		throw new createHttpError.BadRequest("Nome do lead é obrigatório para criação de cliente.");
	}

	const projectType = await projectTypesCollection.findOne({ _id: new ObjectId(input.tipoProjetoId) });
	if (!projectType) {
		throw new createHttpError.NotFound("Tipo de projeto não encontrado.");
	}

	const attributedUser = await usersCollection.findOne({ _id: new ObjectId(input.atribuidoId) });
	if (!attributedUser) {
		throw new createHttpError.NotFound("Usuário atribuído não encontrado.");
	}

	let clientId: string | null = lead.idCliente || null;

	if (!clientId) {
		if (!lead.uf || !lead.cidade) {
			throw new createHttpError.BadRequest("UF e cidade são obrigatórios para criação de cliente.");
		}
		const insertedClientResponse = await insertClient({
			collection: clientsCollection,
			info: {
				nome: lead.nome,
				telefonePrimario: lead.telefone,
				uf: lead.uf,
				cidade: lead.cidade,
				indicador: {},
				canalAquisicao: lead.canalAquisicao || "PROSPECÇÃO ATIVA",
				autor: {
					id: session.user.id,
					nome: session.user.nome,
					avatar_url: session.user.avatar_url ?? undefined,
				},
				dataInsercao: new Date().toISOString(),
				idParceiro: session.user.idParceiro,
			},
			partnerId: session.user.idParceiro,
		});
		if (!insertedClientResponse.acknowledged) {
			throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar cliente.");
		}
		clientId = insertedClientResponse.insertedId.toString();
	}
	if (!clientId) {
		throw new createHttpError.InternalServerError("Não é possível continuar com a atualização do lead.");
	}
	const client = await clientsCollection.findOne({ _id: new ObjectId(clientId) });
	if (!client) {
		throw new createHttpError.InternalServerError("Cliente não encontrado.");
	}

	const newOpportunity = {
		nome: client.nome,
		descricao: "",
		idCliente: clientId,
		categoriaVenda: projectType.categoriaVenda,
		identificador: "",
		responsaveis: [
			{
				id: session.user.id,
				nome: session.user.nome,
				papel: "SDR",
				avatar_url: session.user.avatar_url ?? undefined,
				telefone: session.user.telefone ?? undefined,
				dataInsercao: new Date().toISOString(),
			},
			{
				id: attributedUser._id.toString(),
				nome: attributedUser.nome,
				papel: "VENDEDOR",
				avatar_url: attributedUser.avatar_url ?? undefined,
				telefone: attributedUser.telefone ?? undefined,
				dataInsercao: new Date().toISOString(),
			},
		],
		tipo: {
			id: projectType._id.toString(),
			titulo: projectType.nome,
		},
		autor: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url ?? undefined,
		},
		dataInsercao: new Date().toISOString(),
		idParceiro: session.user.idParceiro,
		localizacao: {
			uf: client.uf ?? "",
			cidade: client.cidade ?? "",
		},
		cliente: {
			nome: client.nome,
			cpfCnpj: client.cpfCnpj,
			telefonePrimario: client.telefonePrimario,
			email: client.email,
			canalAquisicao: client.canalAquisicao || "PROSPECÇÃO ATIVA",
		},
		ganho: {},
		perda: {},
		instalacao: {},
	};
	const insertedOpportunityResponse = await insertOpportunity({
		collection: opportunitiesCollection,
		info: newOpportunity,
		partnerId: session.user.idParceiro,
	});

	if (!insertedOpportunityResponse.acknowledged) {
		throw new createHttpError.InternalServerError("Oops, houve um erro desconhecido ao criar oportunidade.");
	}
	const insertedOpportunityId = insertedOpportunityResponse.insertedId.toString();

	const insertedFunnelReferenceResponse = await insertFunnelReference({
		collection: funnelReferencesCollection,
		info: {
			idParceiro: session.user.idParceiro,
			idOportunidade: insertedOpportunityId,
			idFunil: input.funilId,
			idEstagioFunil: input.estagioFunilId,
			estagios: {},
			dataInsercao: new Date().toISOString(),
		},
	});
	const insertedFunnelReferenceId = insertedFunnelReferenceResponse.insertedId.toString();

	if (input.anotacoes.length > 0) {
		await opportunitiesHistoryCollection.insertMany(
			input.anotacoes.map((anotacao) => ({
				idParceiro: session.user.idParceiro,
				oportunidade: {
					id: insertedOpportunityId,
					nome: newOpportunity.nome,
					identificador: insertedOpportunityResponse.identifier,
				},
				categoria: "ANOTAÇÃO",
				conteudo: anotacao,
				autor: {
					id: session.user.id,
					nome: session.user.nome,
					avatar_url: session.user.avatar_url ?? undefined,
				},
				dataInsercao: new Date().toISOString(),
			})),
		);
	}

	await leadsCollection.updateOne(
		{ _id: new ObjectId(input.leadId) },
		{
			$set: {
				conversao: {
					oportunidade: {
						id: insertedOpportunityId,
						nome: newOpportunity.nome,
						identificador: insertedOpportunityResponse.identifier,
					},
					atribuido: {
						id: attributedUser._id.toString(),
						nome: attributedUser.nome,
						avatar_url: attributedUser.avatar_url ?? undefined,
					},
					data: new Date().toISOString(),
				},
			},
		},
	);

	await createNovuTopicAndSubscribeResponsibles({
		opportunityId: insertedOpportunityId,
		opportunityName: newOpportunity.nome,
		opportunityIdentifier: insertedOpportunityResponse.identifier,
		opportunityResponsibles: newOpportunity.responsaveis,
		author: {
			id: session.user.id,
			nome: session.user.nome,
			avatar_url: session.user.avatar_url ?? undefined,
		},
	});
	return {
		data: {
			insertedOpportunityId,
			insertedFunnelReferenceId,
		},
		message: "Lead atualizado para oportunidade com sucesso.",
	};
}
export type TUpgrateLeadOutput = Awaited<ReturnType<typeof upgrateLead>>;

const updateLeadHanlder = async (req: NextRequest) => {
	const session = await getValidCurrentSessionUncached();
	const payload = await req.json();
	const input = UpgrateLeadInputSchema.parse(payload);
	const result = await upgrateLead({ input, session });
	return NextResponse.json(result);
};

export const POST = apiHandler({
	POST: updateLeadHanlder,
});
