import { formatDateAsLocale } from "@/lib/methods/formatting";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { apiHandler, validateAuthentication } from "@/utils/api";
import type { TClient } from "@/utils/schemas/client.schema";
import type { TOpportunity } from "@/utils/schemas/opportunity.schema";
import { TUser } from "@/utils/schemas/user.schema";
import createHttpError from "http-errors";
import type { Collection, Filter } from "mongodb";
import type { NextApiHandler } from "next";
import type { TResultsExportsItem } from "./stats/comercial-results/results-export";
import type { TProposal } from "@/utils/schemas/proposal.schema";

type TResultsExportsOpportunity = {
	nome: TOpportunity["nome"];
	identificador: TOpportunity["identificador"];
	tipo: TOpportunity["tipo"]["titulo"];
	uf: TOpportunity["localizacao"]["uf"];
	cidade: TOpportunity["localizacao"]["cidade"];
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

type GetResponse = any;
const getManualExportDataRoute: NextApiHandler<GetResponse> = async (req, res) => {
	const db = await connectToDatabase(process.env.MONGODB_URI, "crm");
	const opportunitiesCollection: Collection<TOpportunity> = db.collection("opportunities");

	// Defining the responsible query parameters. If specified, filtering opportunities in the provided responsible scope

	// Defining, if provided, won/lost query parameters
	const queryStatus: Filter<TOpportunity> = {
		"perda.data": null,
		"ganho.data": null,
	};

	const query: Filter<TOpportunity> = {
		...queryStatus,
		"responsaveis.id": "649c80b49538973589a33cb8",
	};

	const addFields = {
		activeProposeObjectID: {
			$toObjectId: "$ganho.idProposta",
		},
		clientObjectId: { $toObjectId: "$idCliente" },
	};
	const proposeLookup = {
		from: "proposals",
		localField: "activeProposeObjectID",
		foreignField: "_id",
		as: "proposta",
	};
	const clientLookup = {
		from: "clients",
		localField: "clientObjectId",
		foreignField: "_id",
		as: "cliente",
	};
	const projection = {
		nome: 1,
		identificador: 1,
		"tipo.titulo": 1,
		idMarketing: 1,
		responsaveis: 1,
		ganho: 1,
		"localizacao.uf": 1,
		"localizacao.cidade": 1,
		"proposta.valor": 1,
		"proposta.potenciaPico": 1,
		"cliente.telefonePrimario": 1,
		"cliente.canalAquisicao": 1,
		perda: 1,
		dataInsercao: 1,
	};
	const result = await opportunitiesCollection
		.aggregate([{ $match: query }, { $addFields: addFields }, { $lookup: proposeLookup }, { $lookup: clientLookup }, { $project: projection }])
		.toArray();

	const exportation = result.map((project) => {
		console.log(project.cliente[0].telefonePrimario);
		const info = {
			nome: project.nome,
			identificador: project.identificador,
			tipo: project.tipo.titulo,
			uf: project.localizacao.uf,
			cidade: project.localizacao.cidade,
			idMarketing: project.idMarketing,
			responsaveis: project.responsaveis,
			ganho: project.ganho,
			valorProposta: project.proposta[0] ? project.proposta[0].valor : 0,
			potenciaPicoProposta: project.proposta[0] ? project.proposta[0].potenciaPico : 0,
			telefone: project.cliente[0]?.telefonePrimario || "",
			canalAquisicao: project.cliente[0] ? project.cliente[0].canalAquisicao : "NÃO DEFINIDO",
			dataPerda: project.perda.data,
			motivoPerda: project.perda.descricaoMotivo,
			dataInsercao: project.dataInsercao,
		} as TResultsExportsOpportunity;

		const wonDate = info.ganho?.data;
		const uf = info.uf;
		const city = info.cidade;

		const aquisitionOrigin = info.canalAquisicao;

		const proposeValue = info.valorProposta;
		const proposePower = info.potenciaPicoProposta;

		const seller = info.responsaveis.find((r) => r.papel === "VENDEDOR");
		const sdr = info.responsaveis.find((r) => r.papel === "SDR");

		// Sale channel related information
		const isInbound = !!info.idMarketing;
		const isTransfer = info.responsaveis.length > 1;
		const isFromInsider = !!sdr;
		const isLead = isTransfer && isFromInsider;
		const isSDROwn = !isTransfer && isFromInsider;

		const isOutboundSDR = !isInbound && (isLead || isSDROwn);
		const isOutboundSeller = !isInbound && !isOutboundSDR;

		let classification = "";
		if (isInbound) classification = "INBOUND";
		if (isOutboundSDR) classification = "OUTBOUND SDR";
		if (isOutboundSeller) classification = "OUTBOUND VENDEDOR";
		return {
			"NOME DO PROJETO": project.nome,
			IDENTIFICADOR: project.identificador || "",
			TIPO: project.tipo,
			TELEFONE: info?.telefone,
			VENDEDOR: seller?.nome || "NÃO DEFINIDO",
			SDR: sdr?.nome || "NÃO DEFINIDO",
			UF: uf,
			CIDADE: city,
			"CANAL DE AQUISIÇÃO": aquisitionOrigin,
			CLASSIFICAÇÃO: classification || "NÃO DEFINIDO",
			"DATA DE GANHO": formatDateAsLocale(wonDate || undefined) || "NÃO ASSINADO",
			"POTÊNCIA VENDIDA": proposePower,
			"VALOR VENDA": proposeValue,
			"DATA DE PERDA": formatDateAsLocale(project.dataPerda || undefined),
			"MOTIVO DA PERDA": project.motivoPerda,
			"DATA DE CRIAÇÃO": formatDateAsLocale(project.dataInsercao || undefined),
		} as TResultsExportsItem;
	});

	return res.status(200).json({ data: exportation });
};

export default apiHandler({
	GET: getManualExportDataRoute,
});
