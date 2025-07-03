import { formatDecimalPlaces } from "@/lib/methods/formatting";
import connectToDatabase from "@/services/mongodb/crm-db-connection";
import { novu } from "@/services/novu";
import { apiHandler, validateAuthenticationWithSession } from "@/utils/api";
import type { TUser } from "@/utils/schemas/user.schema";
import { AnyBulkWriteOperation } from "mongodb";
import type { NextApiHandler } from "next";

const userComissionsData = [
	{
		nome: "ADRIANA FRANÇOISE",
		comissaoSemSDR: 0.05,
		comissaoComSDR: 0.03,
	},
	{
		nome: "ALEX SANDRO",
		comissaoSemSDR: 0,
		comissaoComSDR: 0,
	},
	{
		nome: "AMANDA SANTOS",
		comissaoSemSDR: 0.01,
		comissaoComSDR: 0.01,
	},
	{
		nome: "ANA BEATRIZ",
		comissaoSemSDR: 0,
		comissaoComSDR: 0,
	},
	{
		nome: "ANDY CALAZANS",
		comissaoSemSDR: 0.01,
		comissaoComSDR: 0.01,
	},
	{
		nome: "ARTHUR ROCHA",
		comissaoSemSDR: 0.003,
		comissaoComSDR: 0.003,
	},
	{
		nome: "DANDARA LINA",
		comissaoSemSDR: 0.01,
		comissaoComSDR: 0.01,
	},
	{
		nome: "DANIELA FRANCISCA",
		comissaoSemSDR: 0.015,
		comissaoComSDR: 0.03,
	},
	{
		nome: "DENIAN RIBEIRO",
		comissaoSemSDR: 0,
		comissaoComSDR: 0,
	},
	{
		nome: "DEVISSON LIMA",
		comissaoSemSDR: 0.02,
		comissaoComSDR: 0.02,
	},
	{
		nome: "DIEGO REIS",
		comissaoSemSDR: 0.01,
		comissaoComSDR: 0.01,
	},
	{
		nome: "DIONISIO CARVALHO",
		comissaoSemSDR: 0.05,
		comissaoComSDR: 0.05,
	},
	{
		nome: "ESDRAS OLIVEIRA",
		comissaoSemSDR: 0.03,
		comissaoComSDR: 0.015,
	},
	{
		nome: "FELIPE NOBREGA",
		comissaoSemSDR: 0.04,
		comissaoComSDR: 0.03,
	},
	{
		nome: "GABRIEL MARTINS",
		comissaoSemSDR: 0,
		comissaoComSDR: 0,
	},
	{
		nome: "GERALDO VILELA",
		comissaoSemSDR: 0.03,
		comissaoComSDR: 0.015,
	},
	{
		nome: "HALINA OLIVEIRA",
		comissaoSemSDR: 0.01,
		comissaoComSDR: 0.01,
	},
	{
		nome: "JOSÉ ROBERTO",
		comissaoSemSDR: 0.05,
		comissaoComSDR: 0.03,
	},
	{
		nome: "JOÃO PEDRO",
		comissaoSemSDR: 0,
		comissaoComSDR: 0,
	},
	{
		nome: "JULIANO SILVA",
		comissaoSemSDR: 0.05,
		comissaoComSDR: 0.03,
	},
	{
		nome: "LAYANE FERNANDA",
		comissaoSemSDR: 0.01,
		comissaoComSDR: 0.01,
	},
	{
		nome: "LEONARDO VILARINHO",
		comissaoSemSDR: 0.04,
		comissaoComSDR: 0.03,
	},
	{
		nome: "LEONARDO VITAL",
		comissaoSemSDR: 0.01,
		comissaoComSDR: 0.01,
	},
	{
		nome: "LUCIANO LOPES",
		comissaoSemSDR: 0.05,
		comissaoComSDR: 0.03,
	},
	{
		nome: "MARCONI ÁTILA",
		comissaoSemSDR: 0.01,
		comissaoComSDR: 0.01,
	},
	{
		nome: "MARCUS VINÍCIUS",
		comissaoSemSDR: 0.04,
		comissaoComSDR: 0.02,
	},
	{
		nome: "PEDRO SEGHETO",
		comissaoSemSDR: 0.05,
		comissaoComSDR: 0.03,
	},
	{
		nome: "RAFAEL FEO",
		comissaoSemSDR: 0.04,
		comissaoComSDR: 0.04,
	},
	{
		nome: "RONIVALDO MARTINS",
		comissaoSemSDR: 0.04,
		comissaoComSDR: 0.02,
	},
	{
		nome: "RUTH FERNANDES",
		comissaoSemSDR: 0.05,
		comissaoComSDR: 0.03,
	},
	{
		nome: "SARAH AZEVEDO",
		comissaoSemSDR: 0.01,
		comissaoComSDR: 0.01,
	},
	{
		nome: "STENIO DE ASSIS",
		comissaoSemSDR: 0.05,
		comissaoComSDR: 0.05,
	},
];
const handleGeneralFixing: NextApiHandler<any> = async (req, res) => {
	const session = await validateAuthenticationWithSession(req, res);

	const db = await connectToDatabase();
	const usersCollection = db.collection<TUser>("users");

	const users = await usersCollection.find({}).toArray();

	// const usersBulkwriteWithComission = users
	// 	.map((u) => {
	// 		const userComissionConfigWithoutUFV = u.comissionamento.filter((c) => c.tipoProjeto.id !== "6615785ddcb7a6e66ede9785");

	// 		const comissionData = userComissionsData.find((c) => c.nome === u.nome);
	// 		if (!comissionData) {
	// 			console.log(`Comissão não encontrada para o usuário ${u.nome}`);
	// 			return null;
	// 		}

	// 		const userIsSDR = u.idGrupo === "66562a2a812707dbf9f04833";
	// 		if (userIsSDR) {
	// 			userComissionConfigWithoutUFV.unshift({
	// 				tipoProjeto: {
	// 					id: "6615785ddcb7a6e66ede9785",
	// 					nome: "SISTEMA FOTOVOLTAICO",
	// 				},
	// 				papel: "SDR",
	// 				resultados: [
	// 					{
	// 						condicao: {
	// 							aplicavel: false,
	// 						},
	// 						formulaArr: ["[valor_venda]", "*", comissionData.comissaoComSDR.toString()],
	// 					},
	// 				],
	// 			});
	// 		} else {
	// 			userComissionConfigWithoutUFV.unshift({
	// 				tipoProjeto: {
	// 					id: "6615785ddcb7a6e66ede9785",
	// 					nome: "SISTEMA FOTOVOLTAICO",
	// 				},
	// 				papel: "VENDEDOR",
	// 				resultados: [
	// 					{
	// 						condicao: {
	// 							aplicavel: true,
	// 							variavel: "combinacao_responsaveis",
	// 							igual: "SDR + VENDEDOR",
	// 							tipo: "IGUAL_TEXTO",
	// 						},
	// 						formulaArr: ["[valor_venda]", "*", comissionData.comissaoComSDR.toString()],
	// 					},
	// 					{
	// 						condicao: {
	// 							aplicavel: false,
	// 						},
	// 						formulaArr: ["[valor_venda]", "*", comissionData.comissaoSemSDR.toString()],
	// 					},
	// 				],
	// 			});
	// 		}
	// 		return {
	// 			updateOne: {
	// 				filter: { _id: u._id },
	// 				update: { $set: { comissionamento: userComissionConfigWithoutUFV } },
	// 			},
	// 		};
	// 	})
	// 	.filter((u) => u !== null);

	const userBulkwrite: AnyBulkWriteOperation<TUser>[] = users.map((u) => {
		const userComissionConfig: TUser["comissionamento"] = u.comissionamento;
		// userComissionConfig.push({
		// 	tipoProjeto: {
		// 		id: "661ec7e5e03128a48f94b4de",
		// 		nome: "OPERAÇÃO E MANUTENÇÃO",
		// 	},
		// 	papel: "VENDEDOR",
		// 	resultados: [
		// 		{
		// 			condicao: {
		// 				aplicavel: false,
		// 			},
		// 			formulaArr: ["0.1", "*", "[valor_venda]"],
		// 		},
		// 	],
		// });
		// userComissionConfig.push({
		// 	tipoProjeto: {
		// 		id: "661ec86de03128a48f94b4df",
		// 		nome: "MONTAGEM E DESMONTAGEM",
		// 	},
		// 	papel: "VENDEDOR",
		// 	resultados: [
		// 		{
		// 			condicao: {
		// 				aplicavel: false,
		// 			},
		// 			formulaArr: ["0.1", "*", "[valor_venda]"],
		// 		},
		// 	],
		// });
		// userComissionConfig.push({
		// 	tipoProjeto: {
		// 		id: "6627b8c19440d7db1e618594",
		// 		nome: "SEGURO DE SISTEMA FOTOVOLTAICO",
		// 	},
		// 	papel: "VENDEDOR",
		// 	resultados: [
		// 		{
		// 			condicao: {
		// 				aplicavel: false,
		// 			},
		// 			formulaArr: ["0.1", "*", "[valor_venda]"],
		// 		},
		// 	],
		// });
		userComissionConfig.push({
			tipoProjeto: {
				id: "661ec8dae03128a48f94b4e0",
				nome: "MONITORAMENTO",
			},
			papel: "VENDEDOR",
			resultados: [
				{
					condicao: {
						aplicavel: false,
					},
					formulaArr: ["0.1", "*", "[valor_venda]"],
				},
			],
		});

		return {
			updateOne: {
				filter: { _id: u._id },
				update: {
					$set: {
						comissionamento: userComissionConfig,
					},
				},
			},
		};
	});

	// const userBulkwriteResult = await usersCollection.bulkWrite(userBulkwrite);
	return res.status(200).json({
		// userBulkwriteResult,
		message: "Comissionamento fixado com sucesso",
	});
};

export default apiHandler({
	GET: handleGeneralFixing,
});
