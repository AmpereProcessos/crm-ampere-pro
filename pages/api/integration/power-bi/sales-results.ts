import { formatDateAsLocale } from "@/lib/methods/formatting";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler } from "@/utils/api";
import { TClient } from "@/utils/schemas/client.schema";
import { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { TPartner } from "@/utils/schemas/partner.schema";
import { TProposal } from "@/utils/schemas/proposal.schema";
import createHttpError from "http-errors";
import { Collection } from "mongodb";
import { NextApiHandler } from "next";

export type TResultsExportsItem = {
	"NOME DA OPORTUNIDADE": string;
	IDENTIFICADOR: string;
	TIPO: string;
	VENDEDOR: string;
	SDR: string;
	TELEFONE: string;
	"DATA DE GANHO": string;
	"VALOR VENDA": number;
	"POTÊNCIA VENDIDA": number;
	"CANAL DE AQUISIÇÃO": string;
	UF: string;
	CIDADE: string;
	CLASSIFICAÇÃO: string;
	"DATA DE PERDA": string;
	"MOTIVO DA PERDA": string;
	"DATA DE CRIAÇÃO": string;
};

type GetResponse = any;

const getExportationData: NextApiHandler<GetResponse> = async (req, res) => {
	const PAGE_SIZE = 1000;
	const { page } = req.query;

	if (!page || isNaN(Number(page))) throw new createHttpError.BadRequest("Parâmetro de paginação inválido ou não informado.");

	const skip = PAGE_SIZE * (Number(page) - 1);
	const limit = PAGE_SIZE;

	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");
	const partnersCollection: Collection<TPartner> = db.collection("partners");

	const partners = await partnersCollection.find({}, { projection: { nome: 1 } }).toArray();
	const opportunities = await fetchData({ collection: opportunitiesCollection, limit: limit, skip: skip });

	const exportation = opportunities.map((opportunity) => {
		const partner = partners.find((p) => p._id.toString() == opportunity.idParceiro);
		const wonDate = opportunity.ganho?.data;
		const uf = opportunity.uf;
		const city = opportunity.cidade;

		const aquisitionOrigin = opportunity.canalAquisicao;

		const proposeValue = opportunity.valorProposta;
		const proposePower = opportunity.potenciaPicoProposta;

		const seller = opportunity.responsaveis.find((r) => r.papel == "VENDEDOR");
		const sdr = opportunity.responsaveis.find((r) => r.papel == "SDR");

		// Sale channel related information
		const isInbound = !!opportunity.idMarketing;
		const isTransfer = opportunity.responsaveis.length > 1;
		const isFromInsider = !!sdr;
		const isLead = isTransfer && isFromInsider;
		const isSDROwn = !isTransfer && isFromInsider;

		const isOutboundSDR = !isInbound && (isLead || isSDROwn);
		const isOutboundSeller = !isInbound && !isOutboundSDR;

		var classification;
		if (isInbound) classification = "INBOUND";
		if (isOutboundSDR) classification = "OUTBOUND SDR";
		if (isOutboundSeller) classification = "OUTBOUND VENDEDOR";

		return {
			"NOME DA OPORTUNIDADE": opportunity.nome,
			PARCEIRO: partner?.nome || "NÃO DEFINIDO",
			IDENTIFICADOR: opportunity.identificador || "",
			TIPO: opportunity.tipo,
			TELEFONE: opportunity?.telefone,
			VENDEDOR: seller?.nome || "NÃO DEFINIDO",
			SDR: sdr?.nome || "NÃO DEFINIDO",
			ENVIO: isTransfer ? "SIM" : "NÃO",
			"DATA DE GANHO": formatDateAsLocale(wonDate || undefined) || "NÃO ASSINADO",
			"POTÊNCIA VENDIDA": proposePower,
			"VALOR VENDA": proposeValue,
			"CANAL DE AQUISIÇÃO": aquisitionOrigin,
			"DATA DE PERDA": formatDateAsLocale(opportunity.dataPerda || undefined),
			"MOTIVO DA PERDA": opportunity.motivoPerda,
			UF: uf,
			CIDADE: city,
			CLASSIFICAÇÃO: classification || "NÃO DEFINIDO",
			"DATA DE CRIAÇÃO": formatDateAsLocale(opportunity.dataInsercao || undefined),
		} as TResultsExportsItem;
	});
	return res.status(200).json(exportation);
};
export default apiHandler({ GET: getExportationData });

type FetchDataParams = {
	collection: Collection<TOpportunity>;
	skip: number;
	limit: number;
};

type TResultsExportsOpportunity = {
	nome: TOpportunity["nome"];
	identificador: TOpportunity["identificador"];
	tipo: TOpportunity["tipo"]["titulo"];
	uf: TOpportunity["localizacao"]["uf"];
	cidade: TOpportunity["localizacao"]["cidade"];
	idParceiro: TOpportunity["idParceiro"];
	idMarketing: TOpportunity["idMarketing"];
	responsaveis: TOpportunity["responsaveis"];
	ganho: TOpportunity["ganho"];
	valorProposta: TProposal["valor"];
	potenciaPicoProposta: TProposal["potenciaPico"];
	telefone: TClient["telefonePrimario"];
	canalAquisicao: TClient["canalAquisicao"];
	dataPerda: TOpportunity["perda"]["data"];
	motivoPerda: TOpportunity["perda"]["descricaoMotivo"];
	dataInsercao: TOpportunity["dataInsercao"];
};
async function fetchData({ collection, skip, limit }: FetchDataParams) {
	try {
		const sort = { _id: 1 };
		const addFields = {
			activeProposeObjectID: {
				$toObjectId: "$ganho.idProposta",
			},
			clientObjectId: { $toObjectId: "$idCliente" },
		};
		const proposeLookup = { from: "proposals", localField: "activeProposeObjectID", foreignField: "_id", as: "proposta" };
		const clientLookup = { from: "clients", localField: "clientObjectId", foreignField: "_id", as: "cliente" };
		const projection = {
			nome: 1,
			identificador: 1,
			"tipo.titulo": 1,
			idParceiro: 1,
			idMarketing: 1,
			responsaveis: 1,
			ganho: 1,
			"localizacao.uf": 1,
			"localizacao.cidade": 1,
			"proposta.valor": 1,
			"proposta.potenciaPico": 1,
			"cliente.canalAquisicao": 1,
			perda: 1,
			dataInsercao: 1,
		};
		const result = await collection
			.aggregate([
				{ $sort: sort },
				{ $addFields: addFields },
				{ $lookup: proposeLookup },
				{ $lookup: clientLookup },
				{ $project: projection },
				{ $skip: skip },
				{ $limit: limit },
			])
			.toArray();
		const opportunities = result.map((r) => ({
			nome: r.nome,
			identificador: r.identificador,
			tipo: r.tipo.titulo,
			uf: r.localizacao.uf,
			cidade: r.localizacao.cidade,
			idParceiro: r.idParceiro,
			idMarketing: r.idMarketing,
			responsaveis: r.responsaveis,
			ganho: r.ganho,
			valorProposta: r.proposta[0] ? r.proposta[0].valor : 0,
			potenciaPicoProposta: r.proposta[0] ? r.proposta[0].potenciaPico : 0,
			telefone: r.cliente[0] ? r.cliente[0].telefonePrimario : "",
			canalAquisicao: r.cliente[0] ? r.cliente[0].canalAquisicao : "NÃO DEFINIDO",
			dataPerda: r.perda.data,
			motivoPerda: r.perda.descricaoMotivo,
			dataInsercao: r.dataInsercao,
		}));
		return opportunities as TResultsExportsOpportunity[];
	} catch (error) {
		throw error;
	}
}
