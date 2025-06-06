import { apiHandler, type UnwrapNextResponse } from "@/lib/api";
import { getValidCurrentSessionUncached } from "@/lib/auth/session";
import { NextResponse, type NextRequest } from "next/server";
import { getHoursDiff } from "@/lib/methods/dates";
import connectToAmpereProjectsDatabase from "@/services/mongodb/ampere/projects-db-connection";
import { AppProjectResultsSimplifiedProjection, type TAppProject } from "@/utils/schemas/integrations/app-ampere/projects.schema";
import dayjs from "dayjs";
import type { Collection, Filter, WithId } from "mongodb";
import { z } from "zod";

function getContractValue({ system, pa, structure }: { system: number | string; pa: number | string; structure: number | string }) {
	const projeto = !Number.isNaN(Number(system)) ? Number(system) : 0;
	const padrao = !Number.isNaN(Number(pa)) ? Number(pa) : 0;
	const estrutura = !Number.isNaN(Number(structure)) ? Number(structure) : 0;

	return projeto + padrao + estrutura;
}

export type TOperationProjectsResults = {
	projetosVendidos: number;
	valorVendido: number;
	potenciaVendida: number;
	contratosElaborados: {
		qtde: number;
		tempoTotal: number;
		tempoMedio: number;
	};
	homologacoes: {
		qtde: number;
		tempoTotal: number;
		tempoMedio: number;
	};
	liberacaoCompras: {
		qtde: number;
		tempoTotal: number;
		tempoMedio: number;
	};
	pedidos: {
		qtde: number;
		tempoTotal: number;
		tempoMedio: number;
	};
	entregas: {
		qtde: number;
		tempoTotal: number;
		tempoMedio: number;
	};
	execucao: {
		qtde: number;
		tempoTotal: number;
		tempoMedio: number;
	};
};

type TOperationProjectsReduced = {
	projetosVendidos: number;
	valorVendido: number;
	potenciaVendida: number;
	contratosElaborados: {
		qtde: number;
		tempoTotal: number;
	};
	homologacoes: {
		qtde: number;
		tempoTotal: number;
	};
	liberacaoCompras: {
		qtde: number;
		tempoTotal: number;
	};
	pedidos: {
		qtde: number;
		tempoTotal: number;
	};
	entregas: {
		qtde: number;
		tempoTotal: number;
	};
	execucao: {
		qtde: number;
		tempoTotal: number;
	};
};

const initialReduceInfo: TOperationProjectsReduced = {
	projetosVendidos: 0,
	valorVendido: 0,
	potenciaVendida: 0,
	contratosElaborados: {
		qtde: 0,
		tempoTotal: 0,
	},
	homologacoes: {
		qtde: 0,
		tempoTotal: 0,
	},
	liberacaoCompras: {
		qtde: 0,
		tempoTotal: 0,
	},
	pedidos: {
		qtde: 0,
		tempoTotal: 0,
	},
	entregas: {
		qtde: 0,
		tempoTotal: 0,
	},
	execucao: {
		qtde: 0,
		tempoTotal: 0,
	},
};

const QueryDatesSchema = z.object({
	after: z
		.string({
			required_error: "Parâmetros de período não fornecidos ou inválidos.",
			invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
		})
		.datetime({ message: "Tipo inválido para parâmetro de período." }),
	before: z
		.string({
			required_error: "Parâmetros de período não fornecidos ou inválidos.",
			invalid_type_error: "Parâmetros de período não fornecidos ou inválidos.",
		})
		.datetime({ message: "Tipo inválido para parâmetro de período." }),
});

async function getGeneralOperationData(request: NextRequest) {
	const { user } = await getValidCurrentSessionUncached();
	const partnerId = user.idParceiro;
	const partnerScope = user.permissoes.parceiros.escopo;

	const searchParams = request.nextUrl.searchParams;
	const { after, before } = QueryDatesSchema.parse({
		after: searchParams.get("after"),
		before: searchParams.get("before"),
	});

	const db = await connectToAmpereProjectsDatabase(process.env.MONGODB_URI);
	const collection: Collection<TAppProject> = db.collection("dados");
	const afterDate = dayjs(after).startOf("day").subtract(3, "hour").toDate();
	const beforeDate = dayjs(before).endOf("day").subtract(3, "hour").toDate();

	const afterDateStr = afterDate.toISOString();
	const beforeDateStr = beforeDate.toISOString();
	const partnerQuery = partnerScope ? { idParceiro: { $in: [...partnerScope] } } : {};
	const orQuery: Filter<TAppProject> = {
		$or: [
			{ $and: [{ "contrato.dataAssinatura": { $gte: afterDateStr } }, { "contrato.dataAssinatura": { $lte: beforeDateStr } }] },
			{ $and: [{ "contrato.dataLiberacao": { $gte: afterDateStr } }, { "contrato.dataLiberacao": { $lte: beforeDateStr } }] },
			{ $and: [{ "compra.dataLiberacao": { $gte: afterDateStr } }, { "compra.dataLiberacao": { $lte: beforeDateStr } }] },
			{ $and: [{ "compra.dataPedido": { $gte: afterDateStr } }, { "compra.dataPedido": { $lte: beforeDateStr } }] },
			{ $and: [{ "compra.dataEntrega": { $gte: afterDateStr } }, { "compra.dataEntrega": { $lte: beforeDateStr } }] },
			{ $and: [{ "parecer.dataParecerDeAcesso": { $gte: afterDateStr } }, { "parecer.dataParecerDeAcesso": { $lte: beforeDateStr } }] },
			{ $and: [{ "obra.saida": { $gte: afterDateStr } }, { "obra.saida": { $lte: beforeDateStr } }] },
		],
	};

	const query = { ...partnerQuery, ...orQuery };

	const projects = await getSimplifiedProjects({ collection, query });
	const reduced = projects.reduce((acc, current) => {
		// Contract related information
		const contractRequestDate = current.contrato.dataSolicitacao ? new Date(current.contrato.dataSolicitacao) : null;
		const contractReleasedDate = current.contrato.dataLiberacao ? new Date(current.contrato.dataLiberacao) : null;
		const contractSignatureDate = current.contrato.dataAssinatura ? new Date(current.contrato.dataAssinatura) : null;

		// Purchase related information
		const purchaseReleasedDate = current.compra.dataLiberacao ? new Date(current.compra.dataLiberacao) : null;
		const purchaseOrderDate = current.compra.dataPedido ? new Date(current.compra.dataPedido) : null;
		const purchaseDeliveryDate = current.compra.dataEntrega ? new Date(current.compra.dataEntrega) : null;

		// Homologation related information
		const homologationDocumentsSignatureDate = current.homologacao.dataAssinaturaDocumentacoes ? new Date(current.homologacao.dataAssinaturaDocumentacoes) : null;
		const homologationAccessDate = current.homologacao.dataLiberacaoAcesso ? new Date(current.homologacao.dataLiberacaoAcesso) : null;

		// Execution related information
		const executionStartDate = current.execucao.inicio ? new Date(current.execucao.inicio) : null;
		const executionFinishDate = current.execucao.fim ? new Date(current.execucao.fim) : null;

		// Checking for data within period
		if (contractSignatureDate && contractSignatureDate >= afterDate && contractSignatureDate <= beforeDate) {
			acc.projetosVendidos += 1;
			acc.valorVendido += current.valor;
			acc.potenciaVendida += current.potenciaPico || 0;
		}

		// CONTRATOS
		if (contractReleasedDate && contractReleasedDate >= afterDate && contractReleasedDate <= beforeDate) {
			acc.contratosElaborados.qtde += 1;
			if (contractRequestDate) {
				const diff = getHoursDiff({ start: contractRequestDate, finish: contractReleasedDate });
				if (diff) acc.contratosElaborados.tempoTotal += diff;
			}
		}

		// HOMOLOGACOES
		if (homologationAccessDate && homologationAccessDate >= afterDate && homologationAccessDate <= beforeDate) {
			acc.homologacoes.qtde += 1;
			if (contractSignatureDate) {
				const diff = getHoursDiff({ start: contractSignatureDate, finish: homologationAccessDate });
				if (diff) acc.homologacoes.tempoTotal += diff;
			}
		}

		// LIBERACAO COMPRAS
		if (purchaseReleasedDate && purchaseReleasedDate >= afterDate && purchaseReleasedDate <= beforeDate) {
			acc.liberacaoCompras.qtde += 1;
			if (contractSignatureDate) {
				const diff = getHoursDiff({ start: contractSignatureDate, finish: purchaseReleasedDate });
				if (diff) acc.liberacaoCompras.tempoTotal += diff;
			}
		}

		// PEDIDOS
		if (purchaseOrderDate && purchaseOrderDate >= afterDate && purchaseOrderDate <= beforeDate) {
			acc.pedidos.qtde += 1;
			if (purchaseReleasedDate) {
				const diff = getHoursDiff({ start: purchaseReleasedDate, finish: purchaseOrderDate });
				if (diff) acc.pedidos.tempoTotal += diff;
			}
		}

		// ENTREGAS
		if (purchaseDeliveryDate && purchaseDeliveryDate >= afterDate && purchaseDeliveryDate <= beforeDate) {
			acc.entregas.qtde += 1;
			if (purchaseOrderDate) {
				const diff = getHoursDiff({ start: purchaseOrderDate, finish: purchaseDeliveryDate });
				if (diff) acc.entregas.tempoTotal += diff;
			}
		}

		// EXECUCAO
		if (executionFinishDate && executionFinishDate >= afterDate && executionFinishDate <= beforeDate) {
			acc.execucao.qtde += 1;
			if (executionStartDate) {
				const diff = getHoursDiff({ start: executionStartDate, finish: executionFinishDate });
				if (diff) acc.execucao.tempoTotal += diff;
			}
		}

		return acc;
	}, initialReduceInfo);

	const processed: TOperationProjectsResults = {
		projetosVendidos: reduced.projetosVendidos,
		valorVendido: reduced.valorVendido,
		potenciaVendida: reduced.potenciaVendida,
		contratosElaborados: {
			qtde: reduced.contratosElaborados.qtde,
			tempoTotal: reduced.contratosElaborados.tempoTotal,
			tempoMedio: reduced.contratosElaborados.qtde > 0 ? reduced.contratosElaborados.tempoTotal / reduced.contratosElaborados.qtde : 0,
		},
		homologacoes: {
			qtde: reduced.homologacoes.qtde,
			tempoTotal: reduced.homologacoes.tempoTotal,
			tempoMedio: reduced.homologacoes.qtde > 0 ? reduced.homologacoes.tempoTotal / reduced.homologacoes.qtde : 0,
		},
		liberacaoCompras: {
			qtde: reduced.liberacaoCompras.qtde,
			tempoTotal: reduced.liberacaoCompras.tempoTotal,
			tempoMedio: reduced.liberacaoCompras.qtde > 0 ? reduced.liberacaoCompras.tempoTotal / reduced.liberacaoCompras.qtde : 0,
		},
		pedidos: {
			qtde: reduced.pedidos.qtde,
			tempoTotal: reduced.pedidos.tempoTotal,
			tempoMedio: reduced.pedidos.qtde > 0 ? reduced.pedidos.tempoTotal / reduced.pedidos.qtde : 0,
		},
		entregas: {
			qtde: reduced.entregas.qtde,
			tempoTotal: reduced.entregas.tempoTotal,
			tempoMedio: reduced.entregas.qtde > 0 ? reduced.entregas.tempoTotal / reduced.entregas.qtde : 0,
		},
		execucao: {
			qtde: reduced.execucao.qtde,
			tempoTotal: reduced.execucao.tempoTotal,
			tempoMedio: reduced.execucao.qtde > 0 ? reduced.execucao.tempoTotal / reduced.execucao.qtde : 0,
		},
	};

	return NextResponse.json({ data: processed });
}

export const POST = apiHandler({
	POST: getGeneralOperationData,
});

type TSimplifiedProjectResult = {
	id: string;
	indexador: number;
	nome: string;
	identificador: string | number;
	cidade: TAppProject["cidade"];
	idParceiro: TAppProject["idParceiro"];
	idProjetoCRM: TAppProject["idProjetoCRM"];
	potenciaPico: TAppProject["sistema"]["potPico"];
	valor: number;
	contrato: {
		dataLiberacao: TAppProject["contrato"]["dataLiberacao"];
		dataSolicitacao: TAppProject["contrato"]["dataSolicitacao"];
		dataAssinatura: TAppProject["contrato"]["dataAssinatura"];
	};
	homologacao: {
		dataAssinaturaDocumentacoes: TAppProject["projeto"]["dataAssDocumentacao"];
		dataLiberacaoAcesso: TAppProject["parecer"]["dataParecerDeAcesso"];
	};
	compra: {
		dataLiberacao: TAppProject["compra"]["dataLiberacao"];
		dataPedido: TAppProject["compra"]["dataPedido"];
		dataEntrega: TAppProject["compra"]["dataEntrega"];
	};
	execucao: {
		inicio: TAppProject["obra"]["entrada"];
		fim: TAppProject["obra"]["saida"];
	};
};

type GetSimplifiedProjectsProps = {
	collection: Collection<TAppProject>;
	query: Filter<TAppProject>;
};
async function getSimplifiedProjects({ collection, query }: GetSimplifiedProjectsProps) {
	try {
		const match = { "contrato.status": { $ne: "RESCISÃO DE CONTRATO" }, ...query };
		// console.log(JSON.stringify(match))
		const projection = AppProjectResultsSimplifiedProjection;

		const result = await collection.find({ ...match }, { projection: projection }).toArray();
		const projects: TSimplifiedProjectResult[] = result.map((project) => {
			const info = project as WithId<TAppProject>;
			return {
				id: info._id.toString(),
				indexador: info.qtde,
				nome: info.nomeDoContrato,
				identificador: info.codigoSVB,
				cidade: info.cidade,
				idParceiro: info.idParceiro,
				idProjetoCRM: info.idProjetoCRM,
				potenciaPico: info.sistema.potPico,
				valor: getContractValue({ system: info.sistema.valorProjeto || 0, pa: info.padrao.valor || 0, structure: info.estruturaPersonalizada.valor || 0 }),
				contrato: {
					dataSolicitacao: info.contrato.dataSolicitacao,
					dataLiberacao: info.contrato.dataLiberacao,
					dataAssinatura: info.contrato.dataAssinatura,
				},
				homologacao: {
					dataAssinaturaDocumentacoes: info.projeto.dataAssDocumentacao,
					dataLiberacaoAcesso: info.parecer.dataParecerDeAcesso,
				},
				compra: {
					dataLiberacao: info.compra.dataLiberacao,
					dataPedido: info.compra.dataPedido,
					dataEntrega: info.compra.dataEntrega,
				},
				execucao: {
					inicio: info.obra.entrada,
					fim: info.obra.saida,
				},
			};
		});

		return projects;
	} catch (error) {
		console.error("[ERROR] getSimplifiedProjects", error);
		throw error;
	}
}

export type TGeneralOperationDataRouteOutput = UnwrapNextResponse<Awaited<ReturnType<typeof getGeneralOperationData>>>;
